"use client";

import { useState } from "react";
import Link from "next/link";
import { useCart } from "@/lib/cart-context";

// ── Which step of checkout we're on ─────────────────
type Step = "info" | "payment" | "confirmation";

export default function CheckoutPage() {
  const { items, total, clear } = useCart();

  // ── Step state ───────────────────────────────────
  const [step, setStep] = useState<Step>("info");

  // ── Form state ───────────────────────────────────
  const [form, setForm] = useState({
    // Shipping info
    firstName: "",
    lastName:  "",
    email:     "",
    address:   "",
    city:      "",
    zip:       "",
    // Payment info
    nameOnCard:  "",
    cardNumber:  "",
    expiry:      "",
    cvv:         "",
  });

  // ── Computed totals ──────────────────────────────
  const shipping   = total > 50 ? 0 : 4.99;
  const grandTotal = total + shipping;

  // ── Form field updater ───────────────────────────
  function update(field: string, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  // ── Place order ──────────────────────────────────
  function handlePlaceOrder() {
    clear();                    // empty the cart
    setStep("confirmation");    // show success screen
  }

  // ────────────────────────────────────────────────
  // CONFIRMATION SCREEN
  // ────────────────────────────────────────────────
  if (step === "confirmation") {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl border border-stone-200 p-10 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6 text-3xl">
            ✓
          </div>
          <h1 className="text-2xl font-semibold mb-2">Order confirmed!</h1>
          <p className="text-stone-500 text-sm mb-1">
            Thank you for your purchase,{" "}
            <span className="font-medium text-stone-700">{form.firstName}</span>.
          </p>
          <p className="text-stone-400 text-sm mb-2">
            Confirmation sent to{" "}
            <span className="text-stone-600">{form.email}</span>
          </p>
          <p className="text-stone-400 text-sm mb-8">
            Estimated delivery: 3–5 business days
          </p>
          <Link
            href="/"
            className="inline-block bg-stone-900 text-white font-medium px-6 py-3 rounded-xl hover:bg-stone-700 transition-colors"
          >
            Continue shopping →
          </Link>
        </div>
      </div>
    );
  }

  // ────────────────────────────────────────────────
  // EMPTY CART
  // ────────────────────────────────────────────────
  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center px-4">
        <div className="text-center">
          <p className="text-5xl mb-4">🛒</p>
          <h1 className="text-xl font-semibold mb-2">Your cart is empty</h1>
          <p className="text-stone-500 text-sm mb-6">
            Add some products before checking out.
          </p>
          <Link
            href="/products"
            className="inline-block bg-stone-900 text-white font-medium px-6 py-3 rounded-xl hover:bg-stone-700 transition-colors"
          >
            Browse products →
          </Link>
        </div>
      </div>
    );
  }

  // ────────────────────────────────────────────────
  // MAIN CHECKOUT
  // ────────────────────────────────────────────────
  return (
    <div className="bg-stone-50 min-h-screen">
      <div className="max-w-5xl mx-auto px-4 py-8">

        {/* ── Page header ── */}
        <div className="mb-8">
          <Link
            href="/products"
            className="text-sm text-stone-400 hover:text-stone-700 transition-colors"
          >
            ← Continue shopping
          </Link>
          <h1 className="text-2xl font-semibold tracking-tight mt-3">
            Checkout
          </h1>
        </div>

        {/* ── Progress steps ── */}
        <div className="flex items-center gap-3 mb-8">
          {(["info", "payment"] as Step[]).map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold transition-colors ${
                  step === s
                    ? "bg-stone-900 text-white"
                    : step === "payment" && s === "info"
                    ? "bg-emerald-500 text-white"
                    : "bg-stone-100 text-stone-400"
                }`}
              >
                {step === "payment" && s === "info" ? "✓" : i + 1}
              </div>
              <span
                className={`text-sm ${
                  step === s
                    ? "font-medium text-stone-900"
                    : "text-stone-400"
                }`}
              >
                {s === "info" ? "Shipping" : "Payment"}
              </span>
              {i < 1 && (
                <div className="w-8 h-px bg-stone-200 mx-1" />
              )}
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">

          {/* ────────────────────────────────────────
              LEFT — Form
          ──────────────────────────────────────── */}
          <div className="lg:col-span-2">

            {/* ── STEP 1: Shipping info ── */}
            {step === "info" && (
              <div className="bg-white rounded-2xl border border-stone-200 p-6 space-y-4">
                <h2 className="font-semibold text-base mb-4">
                  Shipping information
                </h2>

                {/* Name row */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-stone-500 font-medium block mb-1">
                      First name
                    </label>
                    <input
                      className="w-full border border-stone-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      value={form.firstName}
                      onChange={(e) => update("firstName", e.target.value)}
                      placeholder="Jane"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-stone-500 font-medium block mb-1">
                      Last name
                    </label>
                    <input
                      className="w-full border border-stone-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      value={form.lastName}
                      onChange={(e) => update("lastName", e.target.value)}
                      placeholder="Smith"
                    />
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label className="text-xs text-stone-500 font-medium block mb-1">
                    Email address
                  </label>
                  <input
                    type="email"
                    className="w-full border border-stone-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    value={form.email}
                    onChange={(e) => update("email", e.target.value)}
                    placeholder="jane@example.com"
                  />
                </div>

                {/* Address */}
                <div>
                  <label className="text-xs text-stone-500 font-medium block mb-1">
                    Street address
                  </label>
                  <input
                    className="w-full border border-stone-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    value={form.address}
                    onChange={(e) => update("address", e.target.value)}
                    placeholder="123 Main Street"
                  />
                </div>

                {/* City + ZIP */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="col-span-2">
                    <label className="text-xs text-stone-500 font-medium block mb-1">
                      City
                    </label>
                    <input
                      className="w-full border border-stone-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      value={form.city}
                      onChange={(e) => update("city", e.target.value)}
                      placeholder="New York"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-stone-500 font-medium block mb-1">
                      ZIP code
                    </label>
                    <input
                      className="w-full border border-stone-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      value={form.zip}
                      onChange={(e) => update("zip", e.target.value)}
                      placeholder="10001"
                    />
                  </div>
                </div>

                {/* Continue button */}
                <button
                  onClick={() => setStep("payment")}
                  className="w-full bg-stone-900 text-white font-medium py-3 rounded-xl hover:bg-stone-700 transition-colors mt-2"
                >
                  Continue to payment →
                </button>
              </div>
            )}

            {/* ── STEP 2: Payment ── */}
            {step === "payment" && (
              <div className="bg-white rounded-2xl border border-stone-200 p-6 space-y-4">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-semibold text-base">Payment details</h2>
                  <span className="text-xs text-stone-400 flex items-center gap-1">
                    🔒 256-bit SSL secured
                  </span>
                </div>

                {/* Name on card */}
                <div>
                  <label className="text-xs text-stone-500 font-medium block mb-1">
                    Name on card
                  </label>
                  <input
                    className="w-full border border-stone-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    value={form.nameOnCard}
                    onChange={(e) => update("nameOnCard", e.target.value)}
                    placeholder="Jane Smith"
                  />
                </div>

                {/* Card number */}
                <div>
                  <label className="text-xs text-stone-500 font-medium block mb-1">
                    Card number
                  </label>
                  <input
                    className="w-full border border-stone-200 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    value={form.cardNumber}
                    onChange={(e) => update("cardNumber", e.target.value)}
                    placeholder="4242 4242 4242 4242"
                    maxLength={19}
                  />
                </div>

                {/* Expiry + CVV */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-stone-500 font-medium block mb-1">
                      Expiry date
                    </label>
                    <input
                      className="w-full border border-stone-200 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      value={form.expiry}
                      onChange={(e) => update("expiry", e.target.value)}
                      placeholder="MM / YY"
                      maxLength={7}
                    />
                  </div>
                  <div>
                    <label className="text-xs text-stone-500 font-medium block mb-1">
                      CVV
                    </label>
                    <input
                      type="password"
                      className="w-full border border-stone-200 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      value={form.cvv}
                      onChange={(e) => update("cvv", e.target.value)}
                      placeholder="•••"
                      maxLength={4}
                    />
                  </div>
                </div>

                {/* Buttons */}
                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => setStep("info")}
                    className="flex-1 border border-stone-200 text-stone-600 font-medium py-3 rounded-xl hover:bg-stone-50 transition-colors"
                  >
                    ← Back
                  </button>
                  <button
                    onClick={handlePlaceOrder}
                    className="flex-1 bg-emerald-600 text-white font-medium py-3 rounded-xl hover:bg-emerald-700 transition-colors"
                  >
                    Place order — ${grandTotal.toFixed(2)}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* ────────────────────────────────────────
              RIGHT — Order summary
          ──────────────────────────────────────── */}
          <div className="bg-white rounded-2xl border border-stone-200 p-5 h-fit">
            <h2 className="font-semibold text-sm mb-4">Order summary</h2>

            {/* Cart items */}
            <div className="space-y-3 mb-4">
              {items.map((item) => (
                <div
                  key={item.product.id}
                  className="flex items-center gap-3"
                >
                  <div className="w-10 h-10 bg-stone-50 rounded-lg flex items-center justify-center text-xl flex-shrink-0">
                    {item.product.emoji}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {item.product.name}
                    </p>
                    <p className="text-xs text-stone-400">
                      Qty: {item.quantity}
                    </p>
                  </div>
                  <p className="text-sm font-semibold flex-shrink-0">
                    ${(item.product.price * item.quantity).toFixed(2)}
                  </p>
                </div>
              ))}
            </div>

            {/* Totals */}
            <div className="border-t border-stone-100 pt-4 space-y-2 text-sm">
              <div className="flex justify-between text-stone-500">
                <span>Subtotal</span>
                <span>${total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-stone-500">
                <span>Shipping</span>
                <span
                  className={
                    shipping === 0 ? "text-emerald-600 font-medium" : ""
                  }
                >
                  {shipping === 0 ? "Free" : `$${shipping.toFixed(2)}`}
                </span>
              </div>
              {shipping === 0 && (
                <p className="text-xs text-emerald-600">
                  ✓ You qualify for free shipping!
                </p>
              )}
              <div className="flex justify-between font-semibold text-base pt-2 border-t border-stone-100">
                <span>Total</span>
                <span>${grandTotal.toFixed(2)}</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}