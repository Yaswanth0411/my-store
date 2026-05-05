import { NextRequest, NextResponse } from "next/server";
import { products } from "@/lib/data";

// GET /api/products/1
// GET /api/products/42
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const product = products.find((p) => p.id === Number(id));

  // Return 404 if product not found
  if (!product) {
    return NextResponse.json(
      { error: "Product not found" },
      { status: 404 }
    );
  }

  return NextResponse.json({ product });
}