import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET() {
  try {
    // Total products
    const { count: totalProducts } = await supabase
      .from("products")
      .select("*", { count: "exact", head: true });

    // Total orders + revenue
    const { data: orders } = await supabase
      .from("orders")
      .select("total, status, id, created_at, shipping")
      .order("created_at", { ascending: false });

    const totalOrders  = orders?.length ?? 0;
    const totalRevenue = orders?.reduce((s, o) => s + Number(o.total), 0) ?? 0;
    const recentOrders = orders?.slice(0, 5) ?? [];

    // Total views
    const { count: totalViews } = await supabase
      .from("product_views")
      .select("*", { count: "exact", head: true });

    // Low stock products
    const { count: lowStock } = await supabase
      .from("products")
      .select("*", { count: "exact", head: true })
      .lte("stock", 10);

    return NextResponse.json({
      totalProducts: totalProducts ?? 0,
      totalOrders,
      totalRevenue,
      totalViews:    totalViews ?? 0,
      lowStock:      lowStock ?? 0,
      recentOrders,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}