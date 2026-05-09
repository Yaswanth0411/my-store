"use client";

import { products } from "@/lib/data";
import { notFound } from "next/navigation";
import Link from "next/link";
import { useState, use, useEffect } from "react";
import { useCart } from "@/lib/cart-context";
import { getSessionId } from "@/lib/session";
import Recommendations from "@/components/Recommendations";

export default function ProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  // ── Unwrap the route param ──────────────────────
  const { id } = use(params);

  // ── Find the product ────────────────────────────
  const product = products.find((p) => p.id === Number(id));

  // ── If not found → show 404 page ───────────────
  if (!product) notFound();

  // ── Cart ────────────────────────────────────────
  const { add } = useCart();

  // ── Local state ─────────────────────────────────
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded]       = useState(false);

  // ── Track this product view ──────────────────────
  useEffect(() => {
    if (!product) return;
    const sessionId = getSessionId();
    fetch("/api/views", {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({
        productId: product.id,
        sessionId,
      }),
    });
  }, [product?.id]);

  // ── Related products ────────────────────────────
  const related = products
    .filter((p) => p.category === product.category && p.id !== product.id)
    .slice(0, 4);

  // ── Discount % ──────────────────────────────────
  const discount = product.originalPrice
    ? Math.round(
        ((product.originalPrice - product.price) / product.originalPrice) * 100
      )
    : null;

  // ── Add to cart ──────────────────────────────────
  function handleAdd() {
    if (!product) return;   // ← TypeScript fix
    add(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  }

  return (
    <div className="bg-stone-50 min-h-screen">
      <div className="max-w-5xl mx-auto px-4 py-8">

        {/* ── Breadcrumb ── */}
        <div className="flex items-center gap-2 text-sm text-stone-400 mb-8">
          <Link href="/" className="hover:text-stone-700 transition-colors">
            Home
          </Link>
          <span>/</span>
          <Link href="/products" className="hover:text-stone-700 transition-colors">
            Products
          </Link>
          <span>/</span>
          <span className="text-stone-700 font-medium">{product.name}</span>
        </div>

        {/* ── Main product area ── */}
        <div className="grid md:grid-cols-2 gap-10 mb-16">

          {/* LEFT — Image */}
          <div className="bg-white rounded-2xl aspect-square flex items-center justify-center text-9xl border border-stone-100">
            {product.emoji}
          </div>

          {/* RIGHT — Info */}
          <div className="flex flex-col">

            {/* Category + badge */}
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xs text-stone-500 bg-stone-100 px-2.5 py-1 rounded-full">
                {product.category}
              </span>
              {product.badge && (
                <span
                  className={`text-xs font-semibold px-2.5 py-1 rounded-full capitalize ${
                    product.badge === "new"
                      ? "bg-emerald-100 text-emerald-700"
                      : product.badge === "sale"
                      ? "bg-red-100 text-red-600"
                      : "bg-amber-100 text-amber-700"
                  }`}
                >
                  {product.badge}
                </span>
              )}
            </div>

            {/* Name */}
            <h1 className="text-2xl font-semibold text-stone-900 tracking-tight mb-3">
              {product.name}
            </h1>

            {/* Rating */}
            <div className="flex items-center gap-2 mb-4">
              <div className="flex">
                {[1, 2, 3, 4, 5].map((star) => (
                  <span
                    key={star}
                    className={
                      star <= Math.round(product.rating)
                        ? "text-amber-400"
                        : "text-stone-200"
                    }
                  >
                    ★
                  </span>
                ))}
              </div>
              <span className="text-sm font-medium text-stone-700">
                {product.rating}
              </span>
              <span className="text-sm text-stone-400">
                ({product.reviews} reviews)
              </span>
            </div>

            {/* Description */}
            <p className="text-stone-600 leading-relaxed text-sm mb-6">
              {product.description}
            </p>

            {/* Price */}
            <div className="flex items-baseline gap-3 mb-4">
              <span className="text-3xl font-semibold text-stone-900">
                ${product.price}
              </span>
              {product.originalPrice && (
                <>
                  <span className="text-lg text-stone-400 line-through">
                    ${product.originalPrice}
                  </span>
                  <span className="text-sm font-semibold text-red-500">
                    -{discount}% off
                  </span>
                </>
              )}
            </div>

            {/* Stock */}
            <p
              className={`text-sm font-medium mb-6 ${
                product.stock > 10
                  ? "text-emerald-600"
                  : product.stock > 0
                  ? "text-amber-600"
                  : "text-red-500"
              }`}
            >
              {product.stock > 10
                ? "✓ In stock"
                : product.stock > 0
                ? `⚠ Only ${product.stock} left`
                : "✗ Out of stock"}
            </p>

            {/* Quantity selector */}
            <div className="flex items-center gap-3 mb-4">
              <p className="text-sm font-medium text-stone-700">Quantity</p>
              <div className="flex items-center border border-stone-200 rounded-lg overflow-hidden">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="px-3 py-2 text-stone-600 hover:bg-stone-100 transition-colors text-lg leading-none"
                >
                  −
                </button>
                <span className="px-4 py-2 text-sm font-medium border-x border-stone-200">
                  {quantity}
                </span>
                <button
                  onClick={() =>
                    setQuantity((q) => Math.min(product.stock, q + 1))
                  }
                  className="px-3 py-2 text-stone-600 hover:bg-stone-100 transition-colors text-lg leading-none"
                >
                  +
                </button>
              </div>
            </div>

            {/* Add to cart button */}
            <button
              onClick={handleAdd}
              disabled={product.stock === 0}
              className={`w-full py-3 rounded-xl font-medium text-sm transition-all mb-3 ${
                added
                  ? "bg-emerald-500 text-white"
                  : product.stock === 0
                  ? "bg-stone-200 text-stone-400 cursor-not-allowed"
                  : "bg-stone-900 text-white hover:bg-stone-700"
              }`}
            >
              {added
                ? "✓ Added to cart!"
                : product.stock === 0
                ? "Out of stock"
                : `🛒 Add to cart — $${(product.price * quantity).toFixed(2)}`}
            </button>

            {/* Buy now */}
            <Link
              href="/checkout"
              className="w-full py-3 rounded-xl font-medium text-sm border border-stone-200 text-stone-700 hover:bg-stone-100 transition-colors text-center"
            >
              Buy now →
            </Link>

            {/* Trust badges */}
            <div className="grid grid-cols-3 gap-3 text-center text-xs text-stone-400 pt-6 mt-4 border-t border-stone-100">
              {[
                { emoji: "🔒", label: "Secure payment" },
                { emoji: "↩️", label: "30-day returns"  },
                { emoji: "🚚", label: "Fast shipping"   },
              ].map((b) => (
                <div key={b.label} className="flex flex-col items-center gap-1">
                  <span className="text-base">{b.emoji}</span>
                  <span>{b.label}</span>
                </div>
              ))}
            </div>

          </div>
        </div>

        {/* ── Related products ── */}
        {related.length > 0 && (
          <div className="mb-10">
            <h2 className="text-lg font-semibold mb-5">
              More from {product.category}
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {related.map((p) => (
                <Link
                  key={p.id}
                  href={`/products/${p.id}`}
                  className="bg-white border border-stone-200 rounded-xl overflow-hidden hover:shadow-md hover:-translate-y-0.5 transition-all"
                >
                  <div className="aspect-square bg-stone-50 flex items-center justify-center text-4xl">
                    {p.emoji}
                  </div>
                  <div className="p-3">
                    <p className="text-sm font-medium text-stone-900 line-clamp-1">
                      {p.name}
                    </p>
                    <p className="text-xs text-stone-400 mt-0.5">
                      ★ {p.rating}
                    </p>
                    <p className="text-sm font-semibold text-emerald-600 mt-1">
                      ${p.price}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* ── AI Recommendations ── */}
        <div className="border-t border-stone-100 pt-10">
          <Recommendations
            currentProductId={product.id}
            title="You might also like"
          />
        </div>

      </div>
    </div>
  );
}