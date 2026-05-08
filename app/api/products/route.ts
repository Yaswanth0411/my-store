import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const category  = searchParams.get("category");
  const maxPrice  = searchParams.get("maxPrice");
  const minRating = searchParams.get("minRating");
  const sort      = searchParams.get("sort");
  const search    = searchParams.get("search");

  // ── Start query ──────────────────────────────────
  let query = supabase.from("products").select("*");

  // ── Apply filters ────────────────────────────────
  if (category && category !== "All") {
    query = query.eq("category", category);
  }
  if (maxPrice) {
    query = query.lte("price", Number(maxPrice));
  }
  if (minRating) {
    query = query.gte("rating", Number(minRating));
  }
  if (search) {
    query = query.or(
      `name.ilike.%${search}%,description.ilike.%${search}%`
    );
  }

  // ── Apply sorting ────────────────────────────────
  if (sort === "low")    query = query.order("price", { ascending: true });
  if (sort === "high")   query = query.order("price", { ascending: false });
  if (sort === "rating") query = query.order("rating", { ascending: false });
  else                   query = query.order("id",     { ascending: true });

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ products: data, total: data?.length ?? 0 });
}