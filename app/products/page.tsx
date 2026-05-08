"use client";

import { useState, useMemo, useEffect, Suspense } from "react";
import { categories } from "@/lib/data";
import Link from "next/link";
import { useCart } from "@/lib/cart-context";

// ── Type matching Supabase database shape ─────────────
type Product = {
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
};

// ── Product card with working cart button ─────────────
function ProductCard({ product }: { product: Product }) {
  const { add, items } = useCart();
  const [added, setAdded] = useState(false);
  const inCart = items.some((i) => i.product.id === product.id);

  function handleAdd(e: React.MouseEvent) {
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
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  }

  return (
    <Link
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

        {/* Price + buttons */}
        <div className="flex items-center justify-between mt-auto pt-2">
          <div className="flex items-baseline gap-1.5">
            <span className="text-sm font-semibold text-stone-900">
              ${product.price}
            </span>
            {product.original_price && (
              <span className="text-xs text-stone-400 line-through">
                ${product.original_price}
              </span>
            )}
          </div>
          <button
            onClick={handleAdd}
            className={`text-xs font-medium px-2.5 py-1 rounded-lg transition-all ${
              added
                ? "bg-emerald-500 text-white"
                : inCart
                ? "bg-emerald-100 text-emerald-700"
                : "bg-stone-900 text-white hover:bg-stone-700"
            }`}
          >
            {added ? "✓ Added!" : inCart ? "In cart" : "Add"}
          </button>
        </div>
      </div>
    </Link>
  );
}

// ── Main products content ─────────────────────────────
function ProductsContent() {
  const [allProducts, setAllProducts]       = useState<Product[]>([]);
  const [loading, setLoading]               = useState(true);
  const [activeCategory, setActiveCategory] = useState("All");
  const [maxPrice, setMaxPrice]             = useState(500);
  const [minRating, setMinRating]           = useState(0);
  const [sortOrder, setSortOrder]           = useState("default");

  // ── Fetch from Supabase via API on mount ─────────
  useEffect(() => {
    fetch("/api/products")
      .then((r) => r.json())
      .then((data) => {
        setAllProducts(data.products ?? []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  // ── Client-side filter + sort ─────────────────────
  const filtered = useMemo(() => {
    let list = allProducts.filter((p) => {
      if (activeCategory !== "All" && p.category !== activeCategory)
        return false;
      if (p.price > maxPrice)   return false;
      if (p.rating < minRating) return false;
      return true;
    });
    if (sortOrder === "low")    list = [...list].sort((a, b) => a.price - b.price);
    if (sortOrder === "high")   list = [...list].sort((a, b) => b.price - a.price);
    if (sortOrder === "rating") list = [...list].sort((a, b) => b.rating - a.rating);
    return list;
  }, [allProducts, activeCategory, maxPrice, minRating, sortOrder]);

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="bg-white border border-stone-200 rounded-xl overflow-hidden animate-pulse">
              <div className="aspect-square bg-stone-100" />
              <div className="p-3 space-y-2">
                <div className="h-3 bg-stone-100 rounded w-1/2" />
                <div className="h-4 bg-stone-100 rounded w-3/4" />
                <div className="h-3 bg-stone-100 rounded w-full" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

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

        {/* ── Sidebar filters ── */}
        <aside className="w-full lg:w-52 flex-shrink-0">
          <div className="bg-white rounded-xl border border-stone-200 p-4 space-y-6">

            {/* Category */}
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

            {/* Price range */}
            <div>
              <p className="text-xs font-semibold text-stone-400 uppercase tracking-wider mb-3">
                Max price:{" "}
                <span className="text-stone-900 normal-case font-normal">
                  ${maxPrice}
                </span>
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

            {/* Rating */}
            <div>
              <p className="text-xs font-semibold text-stone-400 uppercase tracking-wider mb-3">
                Min rating
              </p>
              <div className="space-y-1">
                {[
                  { label: "Any",     value: 0   },
                  { label: "4+ ★",   value: 4   },
                  { label: "4.5+ ★", value: 4.5 },
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

            {/* Reset */}
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

        {/* ── Product grid ── */}
        <div className="flex-1">

          {/* Sort + category pills */}
          <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
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
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
              {filtered.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

// ── Page export wrapped in Suspense ───────────────────
export default function ProductsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center py-20 text-stone-400">
          Loading products...
        </div>
      }
    >
      <ProductsContent />
    </Suspense>
  );
}