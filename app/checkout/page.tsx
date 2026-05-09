"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useCart } from "@/lib/cart-context";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type Step = "info" | "payment" | "confirmation";

declare global {
  interface Window {
    Razorpay: new (options: RazorpayOptions) => RazorpayInstance;
  }
}

type RazorpayOptions = {
  key:           string;
  amount:        number;
  currency:      string;
  name:          string;
  description:   string;
  order_id:      string;
  prefill: {
    name:  string;
    email: string;
  };
  theme: { color: string };
  handler: (response: {
    razorpay_order_id:   string;
    razorpay_payment_id: string;
    razorpay_signature:  string;
  }) => void;
  modal: { ondismiss: () => void };
};

type RazorpayInstance = {
  open: () => void;
};

export default function CheckoutPage() {
  const { items, total, clear } = useCart();
  const router                  = useRouter();

  const [step, setStep]       = useState<Step>("info");
  const [loading, setLoading] = useState(false);
  const [userEmail, setUserEmail] = useState("");

  const [form, setForm] = useState({
    firstName:  "",
    lastName:   "",
    email:      "",
    address:    "",
    city:       "",
    zip:        "",
    nameOnCard: "",
    cardNumber: "",
    expiry:     "",
    cvv:        "",
  });

  const shipping   = total > 50 ? 0 : 4.99;
  const grandTotal = total + shipping;

  // Get logged in user email
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user?.email) {
        setUserEmail(data.user.email);
        setForm((f) => ({ ...f, email: data.user!.email! }));
      }
    });
  }, []);

  // Load Razorpay script
  useEffect(() => {
    const script    = document.createElement("script");
    script.src      = "https://checkout.razorpay.com/v1/checkout.js";
    script.async    = true;
    document.body.appendChild(script);
    return () => { document.body.removeChild(script); };
  }, []);

  function update(field: string, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handlePlaceOrder() {
    setLoading(true);
    try {
      // Convert USD to INR (approximate rate)
      const amountInINR = grandTotal * 84;

      // Step 1: Create Razorpay order
      const orderRes = await fetch("/api/razorpay/order", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ amount: amountInINR }),
      });

      const { order } = await orderRes.json();

      if (!order) {
        alert("Failed to create order. Please try again.");
        setLoading(false);
        return;
      }

      // Step 2: Open Razorpay checkout
      const options: RazorpayOptions = {
        key:         process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
        amount:      order.amount,
        currency:    "INR",
        name:        "MyStore",
        description: "Order Payment",
        order_id:    order.id,
        prefill: {
          name:  `${form.firstName} ${form.lastName}`,
          email: form.email || userEmail,
        },
        theme: { color: "#059669" },

        handler: async (response) => {
          // Step 3: Verify payment and save order
          const verifyRes = await fetch("/api/razorpay/verify", {
            method:  "POST",
            headers: { "Content-Type": "application/json" },
            body:    JSON.stringify({
              razorpay_order_id:   response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature:  response.razorpay_signature,
              items,
              shipping: {
                firstName: form.firstName,
                lastName:  form.lastName,
                email:     form.email || userEmail,
                address:   form.address,
                city:      form.city,
                zip:       form.zip,
              },
              total: grandTotal,
              email: form.email || userEmail,
            }),
          });

          const verifyData = await verifyRes.json();

          if (verifyData.success) {
            clear();
            setStep("confirmation");
          } else {
            alert("Payment verification failed. Contact support.");
          }
        },

        modal: {
          ondismiss: () => {
            setLoading(false);
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
      setLoading(false);

    } catch {
      alert("Something went wrong. Please try again.");
      setLoading(false);
    }
  }

  // ── Confirmation screen ───────────────────────────
  if (step === "confirmation") {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl border border-stone-200 p-10 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6 text-3xl">
            ✓
          </div>
          <h1 className="text-2xl font-semibold mb-2">Order confirmed!</h1>
          <p className="text-stone-500 text-sm mb-1">
            Thank you,{" "}
            <span className="font-medium text-stone-700">{form.firstName}</span>.
          </p>
          <p className="text-stone-400 text-sm mb-2">
            Confirmation sent to{" "}
            <span className="text-stone-600">{form.email || userEmail}</span>
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

  // ── Empty cart ────────────────────────────────────
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

  // ── Main checkout ─────────────────────────────────
  return (
    <div className="bg-stone-50 min-h-screen">
      <div className="max-w-5xl mx-auto px-4 py-8">

        {/* Header */}
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

        {/* Progress */}
        <div className="flex items-center gap-3 mb-8">
          {(["info", "payment"] as Step[]).map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold transition-colors ${
                step === s
                  ? "bg-stone-900 text-white"
                  : step === "payment" && s === "info"
                  ? "bg-emerald-500 text-white"
                  : "bg-stone-100 text-stone-400"
              }`}>
                {step === "payment" && s === "info" ? "✓" : i + 1}
              </div>
              <span className={`text-sm ${step === s ? "font-medium text-stone-900" : "text-stone-400"}`}>
                {s === "info" ? "Shipping" : "Payment"}
              </span>
              {i < 1 && <div className="w-8 h-px bg-stone-200 mx-1" />}
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">

          {/* Form */}
          <div className="lg:col-span-2">

            {/* Step 1 — Shipping */}
            {step === "info" && (
              <div className="bg-white rounded-2xl border border-stone-200 p-6 space-y-4">
                <h2 className="font-semibold text-base mb-4">
                  Shipping information
                </h2>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-stone-500 font-medium block mb-1">First name</label>
                    <input
                      className="w-full border border-stone-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      value={form.firstName}
                      onChange={(e) => update("firstName", e.target.value)}
                      placeholder="Jane"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-stone-500 font-medium block mb-1">Last name</label>
                    <input
                      className="w-full border border-stone-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      value={form.lastName}
                      onChange={(e) => update("lastName", e.target.value)}
                      placeholder="Smith"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs text-stone-500 font-medium block mb-1">Email</label>
                  <input
                    type="email"
                    className="w-full border border-stone-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    value={form.email || userEmail}
                    onChange={(e) => update("email", e.target.value)}
                    placeholder="jane@example.com"
                  />
                </div>

                <div>
                  <label className="text-xs text-stone-500 font-medium block mb-1">Address</label>
                  <input
                    className="w-full border border-stone-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    value={form.address}
                    onChange={(e) => update("address", e.target.value)}
                    placeholder="123 Main Street"
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="col-span-2">
                    <label className="text-xs text-stone-500 font-medium block mb-1">City</label>
                    <input
                      className="w-full border border-stone-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      value={form.city}
                      onChange={(e) => update("city", e.target.value)}
                      placeholder="Hyderabad"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-stone-500 font-medium block mb-1">PIN code</label>
                    <input
                      className="w-full border border-stone-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      value={form.zip}
                      onChange={(e) => update("zip", e.target.value)}
                      placeholder="500001"
                    />
                  </div>
                </div>

                <button
                  onClick={() => setStep("payment")}
                  className="w-full bg-stone-900 text-white font-medium py-3 rounded-xl hover:bg-stone-700 transition-colors mt-2"
                >
                  Continue to payment →
                </button>
              </div>
            )}

            {/* Step 2 — Payment */}
            {step === "payment" && (
              <div className="bg-white rounded-2xl border border-stone-200 p-6 space-y-4">
                <div className="flex items-center justify-between mb-2">
                  <h2 className="font-semibold text-base">Payment</h2>
                  <span className="text-xs text-stone-400">🔒 Secured by Razorpay</span>
                </div>

                {/* Razorpay supported methods */}
                <div className="bg-stone-50 rounded-xl p-4 border border-stone-200">
                  <p className="text-sm font-medium text-stone-700 mb-3">
                    Accepted payment methods
                  </p>
                  <div className="grid grid-cols-2 gap-2 text-xs text-stone-600">
                    {[
                      { emoji: "💳", label: "Credit / Debit card" },
                      { emoji: "📱", label: "UPI (GPay, PhonePe)" },
                      { emoji: "🏦", label: "Net banking" },
                      { emoji: "👜", label: "Wallets (Paytm etc.)" },
                    ].map((m) => (
                      <div
                        key={m.label}
                        className="flex items-center gap-2 bg-white rounded-lg px-3 py-2 border border-stone-200"
                      >
                        <span>{m.emoji}</span>
                        <span>{m.label}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <p className="text-xs text-stone-400 text-center">
                  Clicking below will open the Razorpay secure payment window
                </p>

                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => setStep("info")}
                    className="flex-1 border border-stone-200 text-stone-600 font-medium py-3 rounded-xl hover:bg-stone-50 transition-colors"
                  >
                    ← Back
                  </button>
                  <button
                    onClick={handlePlaceOrder}
                    disabled={loading}
                    className="flex-1 bg-emerald-600 text-white font-medium py-3 rounded-xl hover:bg-emerald-700 transition-colors disabled:opacity-60"
                  >
                    {loading
                      ? "Opening payment..."
                      : `Pay ₹${(grandTotal * 84).toFixed(0)}`}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Order summary */}
          <div className="bg-white rounded-2xl border border-stone-200 p-5 h-fit">
            <h2 className="font-semibold text-sm mb-4">Order summary</h2>
            <div className="space-y-3 mb-4">
              {items.map((item) => (
                <div key={item.product.id} className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-stone-50 rounded-lg flex items-center justify-center text-xl flex-shrink-0">
                    {item.product.emoji}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{item.product.name}</p>
                    <p className="text-xs text-stone-400">Qty: {item.quantity}</p>
                  </div>
                  <p className="text-sm font-semibold flex-shrink-0">
                    ${(item.product.price * item.quantity).toFixed(2)}
                  </p>
                </div>
              ))}
            </div>

            <div className="border-t border-stone-100 pt-4 space-y-2 text-sm">
              <div className="flex justify-between text-stone-500">
                <span>Subtotal</span>
                <span>${total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-stone-500">
                <span>Shipping</span>
                <span className={shipping === 0 ? "text-emerald-600 font-medium" : ""}>
                  {shipping === 0 ? "Free" : `$${shipping.toFixed(2)}`}
                </span>
              </div>
              {shipping === 0 && (
                <p className="text-xs text-emerald-600">✓ Free shipping!</p>
              )}
              <div className="flex justify-between font-semibold text-base pt-2 border-t border-stone-100">
                <span>Total (USD)</span>
                <span>${grandTotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm text-stone-500">
                <span>Total (INR approx)</span>
                <span>₹{(grandTotal * 84).toFixed(0)}</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}