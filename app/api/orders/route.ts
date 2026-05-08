import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

// ── POST /api/orders — place a new order ─────────────
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { items, shipping, total } = body;

    if (!items?.length || !shipping?.email) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Create order ID
    const orderId = `ORD-${Date.now()}`;

    // ── Insert order ─────────────────────────────
    const { error: orderError } = await supabase
      .from("orders")
      .insert({
        id:       orderId,
        total,
        status:   "confirmed",
        shipping,
      });

    if (orderError) throw orderError;

    // ── Insert order items ───────────────────────
    const orderItems = items.map((item: {
      productId: number;
      name:      string;
      price:     number;
      quantity:  number;
    }) => ({
      order_id:     orderId,
      product_id:   item.productId,
      product_name: item.name,
      price:        item.price,
      quantity:     item.quantity,
    }));

    const { error: itemsError } = await supabase
      .from("order_items")
      .insert(orderItems);

    if (itemsError) throw itemsError;

    // ── Reduce stock for each product ────────────
    for (const item of items) {
      await supabase.rpc("decrement_stock", {
        product_id: item.productId,
        amount:     item.quantity,
      });
    }

    return NextResponse.json(
      { order: { id: orderId, status: "confirmed" } },
      { status: 201 }
    );

  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// ── GET /api/orders — list all orders ───────────────
export async function GET() {
  const { data, error } = await supabase
    .from("orders")
    .select(`
      *,
      order_items (*)
    `)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ orders: data, total: data?.length ?? 0 });
}