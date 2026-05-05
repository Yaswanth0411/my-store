"use client";

import Link from "next/link";
import { useCart } from "@/lib/cart-context";
import { useState } from "react";

export default function Navbar() {
  const { count, items, total, remove, setQty } = useCart();
  const [cartOpen, setCartOpen] = useState(false);

  return (
    <>
      <nav className="sticky top-0 z-40 bg-white border-b border-stone-200 px-6 py-3">
        <div className="max-w-5xl mx-auto flex items-center justify-between">

          {/* Logo */}
          <Link href="/" className="text-xl font-semibold tracking-tight">
            my<span className="text-emerald-500">store</span>
          </Link>

          {/* Nav links */}
          <div className="hidden sm:flex items-center gap-6 text-sm text-stone-500">
            <Link href="/" className="hover:text-stone-900 transition-colors">
              Home
            </Link>
            <Link href="/products" className="hover:text-stone-900 transition-colors">
              Shop
            </Link>
          </div>

          {/* Cart button — shows real count */}
          <button
            onClick={() => setCartOpen(true)}
            className="flex items-center gap-2 bg-stone-900 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-stone-700 transition-colors"
          >
            🛒 Cart
            {count > 0 && (
              <span className="bg-emerald-500 text-white text-xs font-semibold rounded-full px-1.5 py-0.5 min-w-[20px] text-center">
                {count}
              </span>
            )}
          </button>

        </div>
      </nav>

      {/* ── Cart drawer overlay ── */}
      {cartOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-40 backdrop-blur-sm"
          onClick={() => setCartOpen(false)}
        />
      )}

      {/* ── Cart drawer ── */}
      <aside
        className={`fixed top-0 right-0 h-full w-full max-w-sm bg-white z-50 shadow-2xl flex flex-col transition-transform duration-300 ${
          cartOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-stone-100">
          <h2 className="font-semibold text-base">Your Cart ({count})</h2>
          <button
            onClick={() => setCartOpen(false)}
            className="text-stone-400 hover:text-stone-700 text-xl leading-none"
          >
            ✕
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-3 text-stone-400">
              <span className="text-5xl">🛒</span>
              <p className="text-sm">Your cart is empty</p>
              <Link
                href="/products"
                onClick={() => setCartOpen(false)}
                className="text-sm text-emerald-600 font-medium hover:underline"
              >
                Browse products →
              </Link>
            </div>
          ) : (
            items.map((item) => (
              <div key={item.product.id} className="flex gap-3 items-start">
                {/* Emoji image */}
                <div className="w-14 h-14 bg-stone-100 rounded-lg flex items-center justify-center text-2xl flex-shrink-0">
                  {item.product.emoji}
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {item.product.name}
                  </p>
                  <p className="text-sm text-emerald-600 font-semibold">
                    ${item.product.price}
                  </p>

                  {/* Quantity controls */}
                  <div className="flex items-center gap-2 mt-1.5">
                    <button
                      onClick={() =>
                        setQty(item.product.id, item.quantity - 1)
                      }
                      className="w-6 h-6 flex items-center justify-center rounded border border-stone-200 hover:bg-stone-100 text-stone-600 text-sm"
                    >
                      −
                    </button>
                    <span className="text-sm font-medium w-4 text-center">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() =>
                        setQty(item.product.id, item.quantity + 1)
                      }
                      className="w-6 h-6 flex items-center justify-center rounded border border-stone-200 hover:bg-stone-100 text-stone-600 text-sm"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Item total + remove */}
                <div className="flex flex-col items-end gap-1 flex-shrink-0">
                  <p className="text-sm font-semibold">
                    ${(item.product.price * item.quantity).toFixed(2)}
                  </p>
                  <button
                    onClick={() => remove(item.product.id)}
                    className="text-xs text-stone-300 hover:text-red-400 transition-colors"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer — totals + checkout */}
        {items.length > 0 && (
          <div className="border-t border-stone-100 px-5 py-5 space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-stone-500">Subtotal</span>
              <span className="font-semibold">${total.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-stone-500">Shipping</span>
              <span className={total > 50 ? "text-emerald-600 font-medium" : ""}>
                {total > 50 ? "Free" : "$4.99"}
              </span>
            </div>
            <div className="flex justify-between font-semibold text-base pt-2 border-t border-stone-100">
              <span>Total</span>
              <span>${(total > 50 ? total : total + 4.99).toFixed(2)}</span>
            </div>

            <Link
              href="/checkout"
              onClick={() => setCartOpen(false)}
              className="block w-full bg-emerald-600 hover:bg-emerald-700 text-white text-center font-medium py-3 rounded-xl transition-colors"
            >
              Proceed to Checkout
            </Link>
            <button
              onClick={() => setCartOpen(false)}
              className="block w-full text-center text-sm text-stone-400 hover:text-stone-600"
            >
              Continue shopping
            </button>
          </div>
        )}
      </aside>
    </>
  );
}