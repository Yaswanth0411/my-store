import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

// ── PATCH /api/admin/products/[id] — update product ──
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id }  = await params;
    const body    = await req.json();

    const { data, error } = await supabase
      .from("products")
      .update(body)
      .eq("id", Number(id))
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ product: data });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// ── DELETE /api/admin/products/[id] — delete product ─
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const { error } = await supabase
      .from("products")
      .delete()
      .eq("id", Number(id));

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}