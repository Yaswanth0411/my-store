"use client";

import { useState, useMemo } from "react";
import { products, categories } from "@/lib/data";
import Link from "next/link";

export default function ProductsPage() {
  // ── Filter & sort state ──────────────────────────
  const [activeCategory, setActiveCategory] = useState("All");
  const [maxPrice, setMaxPrice]             = useState(500);
  const [minRating, setMinRating]           = useState(0);
  const [sortOrder, setSortOrder]           = useState("default");

  // ── Filter + sort logic ──────────────────────────
  // useMemo means this only recalculates when the
  // filter values actually change — not on every render
  const filtered = useMemo(() => {
    let list = products.filter((p) => {
      if (activeCategory !== "All" && p.category !== activeCategory)
        return false;
      if (p.price > maxPrice)
        return false;
      if (p.rating < minRating)
        return false;
      return true;
    });

    // Sort
    if (sortOrder === "low")    list = [...list].sort((a, b) => a.price - b.price);
    if (sortOrder === "high")   list = [...list].sort((a, b) => b.price - a.price);
    if (sortOrder === "rating") list = [...list].sort((a, b) => b.rating - a.rating);

    return list;
  }, [activeCategory, maxPrice, minRating, sortOrder]);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">

      {/* ── Page header ── */}
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">All Products</h1>
        <p className="text-stone-500 text-sm mt-1">
          {filtered.length} products
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">

        {/* ────────────────────────────────────────
            SIDEBAR — filters
        ──────────────────────────────────────── */}
        <aside className="w-full lg:w-52 flex-shrink-0">
          <div className="bg-white rounded-xl border border-stone-200 p-4 space-y-6">

            {/* Category filter */}
            <div>
              <p className="text-xs font-semibold text-stone-400 uppercase tracking-wider mb-3">
                Category
              </p>
              <div className="space-y-1">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`block w-full text-left text-sm px-2.5 py-1.5 rounded-lg transition-colors ${
                      activeCategory === cat
                        ? "bg-emerald-50 text-emerald-700 font-medium"
                        : "text-stone-600 hover:bg-stone-50"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Price range filter */}
            <div>
              <p className="text-xs font-semibold text-stone-400 uppercase tracking-wider mb-3">
                Max price:{" "}
                <span className="text-stone-900 normal-case">${maxPrice}</span>
              </p>
              <input
                type="range"
                min={10}
                max={500}
                step={10}
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                className="w-full accent-emerald-600"
              />
              <div className="flex justify-between text-xs text-stone-400 mt-1">
                <span>$10</span>
                <span>$500</span>
              </div>
            </div>

            {/* Rating filter */}
            <div>
              <p className="text-xs font-semibold text-stone-400 uppercase tracking-wider mb-3">
                Min rating
              </p>
              <div className="space-y-1">
                {[
                  { label: "Any",    value: 0   },
                  { label: "4+ ★",  value: 4   },
                  { label: "4.5+ ★",value: 4.5 },
                ].map((r) => (
                  <button
                    key={r.value}
                    onClick={() => setMinRating(r.value)}
                    className={`block w-full text-left text-sm px-2.5 py-1.5 rounded-lg transition-colors ${
                      minRating === r.value
                        ? "bg-emerald-50 text-emerald-700 font-medium"
                        : "text-stone-600 hover:bg-stone-50"
                    }`}
                  >
                    {r.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Reset filters button */}
            <button
              onClick={() => {
                setActiveCategory("All");
                setMaxPrice(500);
                setMinRating(0);
                setSortOrder("default");
              }}
              className="w-full text-xs text-stone-400 hover:text-stone-700 border border-stone-200 rounded-lg py-2 transition-colors"
            >
              Reset filters
            </button>

          </div>
        </aside>

        {/* ────────────────────────────────────────
            MAIN — product grid
        ──────────────────────────────────────── */}
        <div className="flex-1">

          {/* Sort + category pill row */}
          <div className="flex items-center justify-between mb-4 flex-wrap gap-3">

            {/* Category pills */}
            <div className="flex gap-2 flex-wrap">
              {categories.slice(1).map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`text-xs font-medium px-3 py-1.5 rounded-full border transition-colors ${
                    activeCategory === cat
                      ? "bg-stone-900 text-white border-stone-900"
                      : "border-stone-200 text-stone-600 hover:border-stone-400"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Sort dropdown */}
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              className="text-sm border border-stone-200 rounded-lg px-3 py-1.5 bg-white text-stone-700"
            >
              <option value="default">Featured</option>
              <option value="low">Price: low to high</option>
              <option value="high">Price: high to low</option>
              <option value="rating">Top rated</option>
            </select>

          </div>

          {/* Empty state */}
          {filtered.length === 0 ? (
            <div className="text-center py-20 text-stone-400">
              <p className="text-4xl mb-4">🔍</p>
              <p className="text-lg font-medium mb-1">No products found</p>
              <p className="text-sm">Try adjusting your filters</p>
            </div>
          ) : (

            /* Product grid */
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filtered.map((product) => (
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
                    <h3 className="text-sm font-medium text-stone-900 leading-snug line-clamp-1">
                      {product.name}
                    </h3>
                    <p className="text-xs text-stone-400 line-clamp-1">
                      {product.description}
                    </p>

                    {/* Price */}
                    <div className="flex items-center justify-between mt-auto pt-2">
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-sm font-semibold text-stone-900">
                          ${product.price}
                        </span>
                        {product.originalPrice && (
                          <span className="text-xs text-stone-400 line-through">
                            ${product.originalPrice}
                          </span>
                        )}
                      </div>
                      <span className="text-xs font-medium bg-stone-900 text-white px-2.5 py-1 rounded-lg group-hover:bg-emerald-600 transition-colors">
                        View
                      </span>
                    </div>
                  </div>

                </Link>
              ))}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}