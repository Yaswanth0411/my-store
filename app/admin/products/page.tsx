"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Product = {
  id:             number;
  name:           string;
  price:          number;
  category:       string;
  stock:          number;
  badge:          string | null;
  emoji:          string;
  rating:         number;
};

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading]   = useState(true);
  const [deleting, setDeleting] = useState<number | null>(null);
  const [search, setSearch]     = useState("");

  useEffect(() => {
    loadProducts();
  }, []);

  function loadProducts() {
    setLoading(true);
    fetch("/api/products")
      .then((r) => r.json())
      .then((data) => {
        setProducts(data.products ?? []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }

  async function handleDelete(id: number, name: string) {
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return;
    setDeleting(id);
    await fetch(`/api/admin/products/${id}`, { method: "DELETE" });
    setProducts((prev) => prev.filter((p) => p.id !== id));
    setDeleting(null);
  }

  const filtered = products.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-semibold">Products</h1>
        <Link
          href="/admin/products/new"
          className="bg-emerald-600 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors"
        >
          + Add product
        </Link>
      </div>

      {/* Search */}
      <div className="bg-white border border-stone-200 rounded-xl px-4 py-2.5 flex items-center gap-3 mb-4">
        <span className="text-stone-400">🔍</span>
        <input
          type="text"
          placeholder="Search products..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 text-sm outline-none bg-transparent"
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-stone-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="border-b border-stone-100 bg-stone-50">
            <tr>
              <th className="text-left px-5 py-3 text-xs font-medium text-stone-500 uppercase tracking-wider">Product</th>
              <th className="text-left px-5 py-3 text-xs font-medium text-stone-500 uppercase tracking-wider">Category</th>
              <th className="text-left px-5 py-3 text-xs font-medium text-stone-500 uppercase tracking-wider">Price</th>
              <th className="text-left px-5 py-3 text-xs font-medium text-stone-500 uppercase tracking-wider">Stock</th>
              <th className="text-left px-5 py-3 text-xs font-medium text-stone-500 uppercase tracking-wider">Badge</th>
              <th className="text-left px-5 py-3 text-xs font-medium text-stone-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {loading ? (
              [...Array(5)].map((_, i) => (
                <tr key={i}>
                  {[...Array(6)].map((_, j) => (
                    <td key={j} className="px-5 py-4">
                      <div className="h-4 bg-stone-100 rounded animate-pulse" />
                    </td>
                  ))}
                </tr>
              ))
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-5 py-12 text-center text-stone-400">
                  No products found
                </td>
              </tr>
            ) : (
              filtered.map((product) => (
                <tr key={product.id} className="hover:bg-stone-50 transition-colors">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{product.emoji}</span>
                      <div>
                        <p className="font-medium text-stone-900">{product.name}</p>
                        <p className="text-xs text-stone-400">★ {product.rating}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-stone-600">{product.category}</td>
                  <td className="px-5 py-4 font-medium">${product.price}</td>
                  <td className="px-5 py-4">
                    <span className={`font-medium ${
                      product.stock === 0
                        ? "text-red-500"
                        : product.stock <= 10
                        ? "text-amber-500"
                        : "text-emerald-600"
                    }`}>
                      {product.stock}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    {product.badge ? (
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full capitalize ${
                        product.badge === "new"
                          ? "bg-emerald-100 text-emerald-700"
                          : product.badge === "sale"
                          ? "bg-red-100 text-red-600"
                          : "bg-amber-100 text-amber-700"
                      }`}>
                        {product.badge}
                      </span>
                    ) : (
                      <span className="text-stone-300 text-xs">—</span>
                    )}
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/admin/products/${product.id}/edit`}
                        className="text-xs font-medium text-blue-600 hover:underline"
                      >
                        Edit
                      </Link>
                      <span className="text-stone-200">|</span>
                      <button
                        onClick={() => handleDelete(product.id, product.name)}
                        disabled={deleting === product.id}
                        className="text-xs font-medium text-red-500 hover:underline disabled:opacity-50"
                      >
                        {deleting === product.id ? "Deleting..." : "Delete"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}