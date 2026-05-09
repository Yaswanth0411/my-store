"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useCart } from "@/lib/cart-context";
import { getSessionId } from "@/lib/session";

type RecommendedProduct = {
  id:             number;
  name:           string;
  description:    string;
  price:          number;
  original_price: number | null;
  category:       string;
  rating:         number;
  reviews:        number;
  stock:          number;
  badge:          "new" | "sale" | "bestseller" | null;
  emoji:          string;
  reason:         string;
};

type Props = {
  currentProductId?: number;
  title?:            string;
};

export default function Recommendations({
  currentProductId,
  title = "Recommended for you",
}: Props) {
  const { add, items } = useCart();
  const [recs, setRecs]         = useState<RecommendedProduct[]>([]);
  const [loading, setLoading]   = useState(true);
  const [addedId, setAddedId]   = useState<number | null>(null);

  useEffect(() => {
    const sessionId = getSessionId();

    fetch("/api/recommendations", {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ sessionId, currentProductId }),
    })
      .then((r) => r.json())
      .then((data) => {
        setRecs(data.recommendations ?? []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [currentProductId]);

  function handleAdd(e: React.MouseEvent, product: RecommendedProduct) {
    e.preventDefault();
    add({
      id:            product.id,
      name:          product.name,
      description:   product.description,
      price:         product.price,
      originalPrice: product.original_price ?? undefined,
      category:      product.category,
      rating:        product.rating,
      reviews:       product.reviews,
      stock:         product.stock,
      badge:         product.badge ?? undefined,
      emoji:         product.emoji,
    });
    setAddedId(product.id);
    setTimeout(() => setAddedId(null), 1500);
  }

  // ── Loading skeleton ──────────────────────────────
  if (loading) {
    return (
      <div className="py-10">
        <div className="h-6 w-48 bg-stone-100 rounded animate-pulse mb-6" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="bg-white border border-stone-200 rounded-xl overflow-hidden animate-pulse"
            >
              <div className="aspect-square bg-stone-100" />
              <div className="p-3 space-y-2">
                <div className="h-3 bg-stone-100 rounded w-3/4" />
                <div className="h-4 bg-stone-100 rounded w-full" />
                <div className="h-3 bg-stone-100 rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (recs.length === 0) return null;

  return (
    <div className="py-10">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold tracking-tight">{title}</h2>
          <p className="text-stone-500 text-sm mt-1">
            Personalised picks just for you
          </p>
        </div>
        <span className="text-xs bg-emerald-50 text-emerald-700 font-medium px-3 py-1.5 rounded-full border border-emerald-100">
          ✦ AI powered
        </span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {recs.map((product) => {
          const inCart = items.some((i) => i.product.id === product.id);
          const added  = addedId === product.id;

          return (
            <Link
              key={product.id}
              href={`/products/${product.id}`}
              className="group bg-white border border-stone-200 rounded-xl overflow-hidden hover:shadow-md hover:-translate-y-0.5 transition-all flex flex-col"
            >
              {/* Image */}
              <div className="aspect-square bg-stone-50 flex items-center justify-center text-5xl relative">
                {product.emoji}
                {product.badge && (
                  <span
                    className={`absolute top-2 left-2 text-xs font-semibold px-2 py-0.5 rounded-full capitalize ${
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

              {/* Info */}
              <div className="p-3 flex flex-col gap-1 flex-1">
                <p className="text-xs text-stone-400">
                  ★ {product.rating}
                  <span className="ml-1">({product.reviews})</span>
                </p>
                <h3 className="text-sm font-medium text-stone-900 line-clamp-1">
                  {product.name}
                </h3>

                {/* AI reason badge */}
                <p className="text-xs text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md line-clamp-1">
                  ✦ {product.reason}
                </p>

                {/* Price + button */}
                <div className="flex items-center justify-between mt-auto pt-2">
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-sm font-semibold">
                      ${product.price}
                    </span>
                    {product.original_price && (
                      <span className="text-xs text-stone-400 line-through">
                        ${product.original_price}
                      </span>
                    )}
                  </div>
                  <button
                    onClick={(e) => handleAdd(e, product)}
                    className={`text-xs font-medium px-2.5 py-1 rounded-lg transition-all ${
                      added
                        ? "bg-emerald-500 text-white"
                        : inCart
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-stone-900 text-white hover:bg-stone-700"
                    }`}
                  >
                    {added ? "✓" : inCart ? "In cart" : "Add"}
                  </button>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}