import { NextRequest, NextResponse } from "next/server";

// ── In-memory store ──────────────────────────────────
// In a real app this would be a database
// For now orders live in memory while the server runs
type OrderItem = {
  productId: number;
  name:      string;
  price:     number;
  quantity:  number;
};

type Order = {
  id:        string;
  items:     OrderItem[];
  shipping: {
    firstName: string;
    lastName:  string;
    email:     string;
    address:   string;
    city:      string;
    zip:       string;
  };
  total:     number;
  status:    string;
  createdAt: string;
};

// This array stores orders while the dev server is running
const orders: Order[] = [];

// ── POST /api/orders — place a new order ─────────────
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { items, shipping, total } = body;

    // Basic validation
    if (!items || items.length === 0) {
      return NextResponse.json(
        { error: "No items in order" },
        { status: 400 }
      );
    }
    if (!shipping?.email) {
      return NextResponse.json(
        { error: "Shipping info required" },
        { status: 400 }
      );
    }

    // Create the order
    const order: Order = {
      id:        `ORD-${Date.now()}`,
      items,
      shipping,
      total,
      status:    "confirmed",
      createdAt: new Date().toISOString(),
    };

    orders.push(order);

    return NextResponse.json({ order }, { status: 201 });

  } catch {
    return NextResponse.json(
      { error: "Invalid request" },
      { status: 400 }
    );
  }
}

// ── GET /api/orders — list all orders ───────────────
export async function GET() {
  return NextResponse.json({
    orders,
    total: orders.length,
  });
}