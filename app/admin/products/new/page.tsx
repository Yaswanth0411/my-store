"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function NewProductPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [form, setForm]     = useState({
    name:           "",
    description:    "",
    price:          "",
    original_price: "",
    category:       "Electronics",
    stock:          "",
    badge:          "",
    emoji:          "📦",
    rating:         "4.5",
    reviews:        "0",
  });

  function update(field: string, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSave() {
    if (!form.name || !form.price || !form.stock) {
      alert("Name, price and stock are required.");
      return;
    }
    setSaving(true);
    const res = await fetch("/api/admin/products", {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({
        name:           form.name,
        description:    form.description,
        price:          Number(form.price),
        original_price: form.original_price ? Number(form.original_price) : null,
        category:       form.category,
        stock:          Number(form.stock),
        badge:          form.badge || null,
        emoji:          form.emoji,
        rating:         Number(form.rating),
        reviews:        Number(form.reviews),
      }),
    });

    if (res.ok) {
      router.push("/admin/products");
    } else {
      alert("Failed to save product.");
      setSaving(false);
    }
  }

  return (
    <div className="max-w-2xl">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-semibold">Add new product</h1>
        <button
          onClick={() => router.back()}
          className="text-sm text-stone-500 hover:text-stone-900"
        >
          ← Back
        </button>
      </div>

      <div className="bg-white rounded-xl border border-stone-200 p-6 space-y-5">

        {/* Emoji + Name */}
        <div className="flex gap-4">
          <div className="w-24">
            <label className="text-xs font-medium text-stone-500 block mb-1">Emoji</label>
            <input
              className="w-full border border-stone-200 rounded-lg px-3 py-2 text-2xl text-center focus:outline-none focus:ring-2 focus:ring-emerald-500"
              value={form.emoji}
              onChange={(e) => update("emoji", e.target.value)}
              maxLength={2}
            />
          </div>
          <div className="flex-1">
            <label className="text-xs font-medium text-stone-500 block mb-1">Product name *</label>
            <input
              className="w-full border border-stone-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              value={form.name}
              onChange={(e) => update("name", e.target.value)}
              placeholder="Wireless Headphones"
            />
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="text-xs font-medium text-stone-500 block mb-1">Description</label>
          <textarea
            className="w-full border border-stone-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
            value={form.description}
            onChange={(e) => update("description", e.target.value)}
            placeholder="Product description..."
            rows={3}
          />
        </div>

        {/* Price + Original price */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-medium text-stone-500 block mb-1">Price *</label>
            <input
              type="number"
              className="w-full border border-stone-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              value={form.price}
              onChange={(e) => update("price", e.target.value)}
              placeholder="89"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-stone-500 block mb-1">Original price (optional)</label>
            <input
              type="number"
              className="w-full border border-stone-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              value={form.original_price}
              onChange={(e) => update("original_price", e.target.value)}
              placeholder="129"
            />
          </div>
        </div>

        {/* Category + Stock */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-medium text-stone-500 block mb-1">Category *</label>
            <select
              className="w-full border border-stone-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
              value={form.category}
              onChange={(e) => update("category", e.target.value)}
            >
              <option>Electronics</option>
              <option>Fashion</option>
              <option>Home & Living</option>
              <option>Food & Drink</option>
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-stone-500 block mb-1">Stock *</label>
            <input
              type="number"
              className="w-full border border-stone-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              value={form.stock}
              onChange={(e) => update("stock", e.target.value)}
              placeholder="50"
            />
          </div>
        </div>

        {/* Badge + Rating */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-medium text-stone-500 block mb-1">Badge</label>
            <select
              className="w-full border border-stone-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
              value={form.badge}
              onChange={(e) => update("badge", e.target.value)}
            >
              <option value="">None</option>
              <option value="new">New</option>
              <option value="sale">Sale</option>
              <option value="bestseller">Bestseller</option>
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-stone-500 block mb-1">Rating</label>
            <input
              type="number"
              step="0.1"
              min="1"
              max="5"
              className="w-full border border-stone-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              value={form.rating}
              onChange={(e) => update("rating", e.target.value)}
              placeholder="4.5"
            />
          </div>
        </div>

        {/* Save button */}
        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full bg-emerald-600 text-white font-medium py-3 rounded-xl hover:bg-emerald-700 transition-colors disabled:opacity-60"
        >
          {saving ? "Saving..." : "Save product"}
        </button>

      </div>
    </div>
  );
}