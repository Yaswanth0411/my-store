import { NextRequest, NextResponse } from "next/server";
import { products } from "@/lib/data";

// GET /api/products
// GET /api/products?category=Electronics
// GET /api/products?maxPrice=100&sort=low
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);

  // Read query params from the URL
  const category  = searchParams.get("category");
  const maxPrice  = searchParams.get("maxPrice");
  const minRating = searchParams.get("minRating");
  const sort      = searchParams.get("sort");
  const search    = searchParams.get("search");

  // Start with all products
  let result = [...products];

  // Apply filters
  if (category && category !== "All") {
    result = result.filter((p) => p.category === category);
  }

  if (maxPrice) {
    result = result.filter((p) => p.price <= Number(maxPrice));
  }

  if (minRating) {
    result = result.filter((p) => p.rating >= Number(minRating));
  }

  // Search by name, description or tags
  if (search) {
    const q = search.toLowerCase();
    result = result.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q)
    );
  }

  // Apply sorting
  if (sort === "low")    result.sort((a, b) => a.price - b.price);
  if (sort === "high")   result.sort((a, b) => b.price - a.price);
  if (sort === "rating") result.sort((a, b) => b.rating - a.rating);

  // Return JSON response
  return NextResponse.json({
    products: result,
    total:    result.length,
  });
}