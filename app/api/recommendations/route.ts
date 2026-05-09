import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

export async function POST(req: NextRequest) {
  try {
    const { sessionId, currentProductId } = await req.json();

    // ── 1. Get all products ───────────────────────
    const { data: allProducts, error: productsError } = await supabase
      .from("products")
      .select("id, name, category, price, badge, rating, description")
      .order("id");

    if (productsError) throw productsError;

    // ── 2. Get session view history ───────────────
    const { data: viewHistory } = await supabase
      .from("product_views")
      .select("product_id, viewed_at")
      .eq("session_id", sessionId ?? "anonymous")
      .order("viewed_at", { ascending: false })
      .limit(10);

    // ── 3. Get overall popular products ───────────
    const { data: popularViews } = await supabase
      .from("product_views")
      .select("product_id")
      .limit(100);

    const viewCounts: Record<number, number> = {};
    popularViews?.forEach((v) => {
      viewCounts[v.product_id] = (viewCounts[v.product_id] || 0) + 1;
    });

    const topViewed = Object.entries(viewCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([id, count]) => ({ productId: Number(id), count }));

    // ── 4. Build Claude prompt ────────────────────
    const viewedProductIds = viewHistory?.map((v) => v.product_id) ?? [];
    const viewedProducts   = allProducts?.filter((p) =>
      viewedProductIds.includes(p.id)
    );

    const prompt = `You are a smart ecommerce recommendation engine.

Available products:
${allProducts?.map((p) => `- ID:${p.id} | ${p.name} | ${p.category} | $${p.price} | Rating:${p.rating}`).join("\n")}

User recently viewed:
${viewedProducts?.length
  ? viewedProducts.map((p) => `- ${p.name} (${p.category})`).join("\n")
  : "No views yet — recommend top rated products"}

Most popular by views:
${topViewed.map((v) => {
    const p = allProducts?.find((pr) => pr.id === v.productId);
    return p ? `- ${p.name} (${v.count} views)` : "";
  }).filter(Boolean).join("\n") || "No data yet"}

Current product: ${
  currentProductId
    ? allProducts?.find((p) => p.id === currentProductId)?.name ?? "None"
    : "None (homepage)"
}

Recommend exactly 4 products.
Rules:
- Do NOT recommend the current product
- Mix viewed-category with popular products
- If no history, recommend highest rated
- Give a SHORT reason (max 8 words)

Respond ONLY with valid JSON:
{
  "recommendations": [
    { "productId": 1, "reason": "Popular in Electronics" },
    { "productId": 3, "reason": "Highly rated by customers" },
    { "productId": 7, "reason": "Trending this week" },
    { "productId": 9, "reason": "Matches your interests" }
  ]
}`;

    // ── 5. Call Claude ────────────────────────────
    const message = await anthropic.messages.create({
      model:      "claude-sonnet-4-20250514",
      max_tokens: 500,
      messages:   [{ role: "user", content: prompt }],
    });

    const responseText =
      message.content[0].type === "text" ? message.content[0].text : "";

    // ── 6. Parse response ─────────────────────────
    let recommendations: { productId: number; reason: string }[] = [];
    try {
      const parsed   = JSON.parse(responseText);
      recommendations = parsed.recommendations ?? [];
    } catch {
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed   = JSON.parse(jsonMatch[0]);
        recommendations = parsed.recommendations ?? [];
      }
    }

    // ── 7. Fetch full product details ─────────────
    const recommendedIds = recommendations.map((r) => r.productId);
    const { data: recommendedProducts } = await supabase
      .from("products")
      .select("*")
      .in("id", recommendedIds);

    // ── 8. Merge with reasons ─────────────────────
    const result = recommendations
      .map((rec) => ({
        ...recommendedProducts?.find((p) => p.id === rec.productId),
        reason: rec.reason,
      }))
      .filter((r) => r.id);

    return NextResponse.json({ recommendations: result });

  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}