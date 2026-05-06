"use client";

import { products } from "@/lib/data";
import Link from "next/link";
import { useCart } from "@/lib/cart-context";
import { useState } from "react";

// ── Reusable product card with working Add button ────
function ProductCard({ product }: { product: (typeof products)[0] }) {
  const { add, items } = useCart();
  const [added, setAdded] = useState(false);
  const inCart = items.some((i) => i.product.id === product.id);

  function handleAdd(e: React.MouseEvent) {
    e.preventDefault(); // stop Link navigation if card is wrapped
    add(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  }

  return (
    <div className="bg-white border border-stone-200 rounded-xl overflow-hidden hover:shadow-md hover:-translate-y-1 transition-all">
      {/* Image */}
      <Link href={`/products/${product.id}`}>
        <div className="aspect-square bg-stone-50 flex items-center justify-center text-5xl cursor-pointer">
          {product.emoji}
        </div>
      </Link>

      <div className="p-4">
        {/* Badge */}
        {product.badge && (
          <span
            className={`text-xs font-semibold px-2 py-0.5 rounded-full capitalize mb-2 inline-block ${
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

        {/* Name */}
        <Link href={`/products/${product.id}`}>
          <h3 className="font-medium text-stone-900 text-sm leading-snug hover:text-emerald-600 transition-colors">
            {product.name}
          </h3>
        </Link>

        {/* Rating */}
        <p className="text-xs text-stone-400 mt-1">
          ★ {product.rating} ({product.reviews})
        </p>

        {/* Price + Add button */}
        <div className="flex items-center justify-between mt-3">
          <div className="flex items-baseline gap-1.5">
            <span className="text-emerald-600 font-semibold">
              ${product.price}
            </span>
            {product.originalPrice && (
              <span className="text-xs text-stone-400 line-through">
                ${product.originalPrice}
              </span>
            )}
          </div>
          <button
            onClick={handleAdd}
            className={`text-xs font-medium px-3 py-1.5 rounded-lg transition-all ${
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
    </div>
  );
}

// ── Homepage ─────────────────────────────────────────
export default function Home() {
  const featured    = products.slice(0, 4);
  const bestsellers = products.filter((p) => p.badge === "bestseller");
  const newArrivals = products.filter((p) => p.badge === "new");

  return (
    <div className="bg-stone-50 min-h-screen">

      {/* ── Hero ── */}
      <section className="bg-stone-900 text-white px-6 py-24">
        <div className="max-w-5xl mx-auto">
          <p className="text-emerald-400 text-sm font-medium tracking-widest uppercase mb-4">
            New season arrivals
          </p>
          <h1 className="text-5xl font-semibold tracking-tight leading-tight mb-6 max-w-xl">
            Curated goods for modern living
          </h1>
          <p className="text-stone-400 text-lg max-w-lg mb-10 leading-relaxed">
            Thoughtfully selected electronics, fashion, home goods and food
            products — all in one place.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/products"
              className="bg-emerald-500 hover:bg-emerald-400 text-white font-medium px-6 py-3 rounded-lg transition-colors"
            >
              Shop now →
            </Link>
            <Link
              href="/products?category=Electronics"
              className="bg-white/10 hover:bg-white/20 text-white font-medium px-6 py-3 rounded-lg transition-colors"
            >
              Electronics →
            </Link>
          </div>
        </div>
      </section>

      {/* ── Trust badges ── */}
      <section className="bg-white border-b border-stone-200">
        <div className="max-w-5xl mx-auto px-6 py-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { emoji: "🚚", title: "Free shipping over $50", sub: "Fast, tracked delivery"  },
            { emoji: "↩️", title: "30-day returns",          sub: "No questions asked"      },
            { emoji: "🔒", title: "Secure checkout",         sub: "256-bit SSL encryption" },
          ].map((b) => (
            <div key={b.title} className="flex items-center gap-3 text-sm">
              <span className="text-2xl">{b.emoji}</span>
              <div>
                <p className="font-medium text-stone-900">{b.title}</p>
                <p className="text-stone-500 text-xs">{b.sub}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Featured Products ── */}
      <section className="max-w-5xl mx-auto px-6 py-14">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight">
              Featured Products
            </h2>
            <p className="text-stone-500 text-sm mt-1">Our most popular picks</p>
          </div>
          <Link
            href="/products"
            className="text-sm text-emerald-600 hover:underline font-medium"
          >
            View all →
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {featured.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>

      {/* ── Shop by Category ── */}
      <section className="bg-stone-100 py-14 px-6">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-semibold tracking-tight mb-8">
            Shop by category
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: "Electronics",   emoji: "⚡", bg: "bg-blue-50",    text: "text-blue-600"    },
              { label: "Fashion",       emoji: "✨", bg: "bg-pink-50",    text: "text-pink-600"    },
              { label: "Home & Living", emoji: "🏡", bg: "bg-amber-50",   text: "text-amber-600"   },
              { label: "Food & Drink",  emoji: "🌿", bg: "bg-emerald-50", text: "text-emerald-600" },
            ].map((cat) => (
              <Link
                key={cat.label}
                href={`/products?category=${cat.label}`}
                className="bg-white rounded-xl p-6 flex flex-col items-center gap-3 hover:shadow-md transition-shadow border border-stone-200"
              >
                <span
                  className={`text-3xl w-14 h-14 rounded-full flex items-center justify-center ${cat.bg} ${cat.text}`}
                >
                  {cat.emoji}
                </span>
                <span className="font-medium text-sm text-stone-800">
                  {cat.label}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Bestsellers ── */}
      <section className="max-w-5xl mx-auto px-6 py-14">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight">
              Bestsellers
            </h2>
            <p className="text-stone-500 text-sm mt-1">
              Most loved by our customers
            </p>
          </div>
          <Link
            href="/products"
            className="text-sm text-emerald-600 hover:underline font-medium"
          >
            View all →
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {bestsellers.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>

      {/* ── New Arrivals ── */}
      <section className="bg-stone-100 py-14 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight">
                New Arrivals
              </h2>
              <p className="text-stone-500 text-sm mt-1">
                Just landed in the store
              </p>
            </div>
            <Link
              href="/products"
              className="text-sm text-emerald-600 hover:underline font-medium"
            >
              See all new →
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {newArrivals.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="bg-stone-900 text-stone-400 px-6 py-10">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-white font-semibold text-lg">
            my<span className="text-emerald-400">store</span>
          </p>
          <p className="text-sm">© 2025 MyStore. All rights reserved.</p>
          <div className="flex gap-6 text-sm">
            <Link href="/products" className="hover:text-white transition-colors">
              Shop
            </Link>
            <Link href="/checkout" className="hover:text-white transition-colors">
              Checkout
            </Link>
          </div>
        </div>
      </footer>

    </div>
  );
}