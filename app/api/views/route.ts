import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  try {
    const { productId, sessionId } = await req.json();

    if (!productId) {
      return NextResponse.json(
        { error: "productId required" },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from("product_views")
      .insert({
        product_id: productId,
        session_id: sessionId ?? "anonymous",
      });

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function GET() {
  const { data, error } = await supabase
    .from("product_views")
    .select("product_id, products(id, name, category, emoji)")
    .order("viewed_at", { ascending: false })
    .limit(50);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ views: data });
}