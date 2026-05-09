"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Stats = {
  totalProducts:  number;
  totalOrders:    number;
  totalRevenue:   number;
  totalViews:     number;
  lowStock:       number;
  recentOrders:   {
    id:         string;
    total:      number;
    status:     string;
    created_at: string;
    shipping:   { firstName: string; lastName: string; email: string };
  }[];
};

export default function AdminPage() {
  const [stats, setStats]     = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/stats")
      .then((r) => r.json())
      .then((data) => {
        setStats(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div>
        <h1 className="text-2xl font-semibold mb-8">Overview</h1>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl p-5 animate-pulse">
              <div className="h-3 bg-stone-100 rounded w-1/2 mb-3" />
              <div className="h-8 bg-stone-100 rounded w-3/4" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-semibold">Overview</h1>
        <p className="text-sm text-stone-500">
          {new Date().toLocaleDateString("en-US", {
            weekday: "long",
            year:    "numeric",
            month:   "long",
            day:     "numeric",
          })}
        </p>
      </div>

      {/* ── Stat cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          {
            label: "Total products",
            value: stats?.totalProducts ?? 0,
            emoji: "📦",
            color: "text-blue-600",
            bg:    "bg-blue-50",
          },
          {
            label: "Total orders",
            value: stats?.totalOrders ?? 0,
            emoji: "🛍️",
            color: "text-emerald-600",
            bg:    "bg-emerald-50",
          },
          {
            label: "Total revenue",
            value: `$${(stats?.totalRevenue ?? 0).toFixed(2)}`,
            emoji: "💰",
            color: "text-amber-600",
            bg:    "bg-amber-50",
          },
          {
            label: "Product views",
            value: stats?.totalViews ?? 0,
            emoji: "👁️",
            color: "text-purple-600",
            bg:    "bg-purple-50",
          },
        ].map((stat) => (
          <div key={stat.label} className="bg-white rounded-xl p-5 border border-stone-200">
            <div className={`w-10 h-10 ${stat.bg} rounded-lg flex items-center justify-center text-xl mb-3`}>
              {stat.emoji}
            </div>
            <p className="text-xs text-stone-500 mb-1">{stat.label}</p>
            <p className={`text-2xl font-semibold ${stat.color}`}>
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      {/* ── Low stock alert ── */}
      {(stats?.lowStock ?? 0) > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">⚠️</span>
            <div>
              <p className="font-medium text-amber-800">
                {stats?.lowStock} product{(stats?.lowStock ?? 0) > 1 ? "s" : ""} low on stock
              </p>
              <p className="text-sm text-amber-600">
                These products have 10 or fewer items left
              </p>
            </div>
          </div>
          <Link
            href="/admin/products"
            className="text-sm font-medium text-amber-700 hover:underline"
          >
            View products →
          </Link>
        </div>
      )}

      {/* ── Recent orders ── */}
      <div className="bg-white rounded-xl border border-stone-200 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-100">
          <h2 className="font-semibold">Recent orders</h2>
          <Link
            href="/admin/orders"
            className="text-sm text-emerald-600 hover:underline"
          >
            View all →
          </Link>
        </div>

        {!stats?.recentOrders?.length ? (
          <div className="px-6 py-12 text-center text-stone-400">
            <p className="text-3xl mb-2">🛍️</p>
            <p className="text-sm">No orders yet</p>
          </div>
        ) : (
          <div className="divide-y divide-stone-100">
            {stats.recentOrders.map((order) => (
              <div
                key={order.id}
                className="px-6 py-4 flex items-center justify-between"
              >
                <div>
                  <p className="text-sm font-medium">{order.id}</p>
                  <p className="text-xs text-stone-400 mt-0.5">
                    {order.shipping.firstName} {order.shipping.lastName} —{" "}
                    {order.shipping.email}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold">${order.total}</p>
                  <span className="text-xs bg-emerald-100 text-emerald-700 font-medium px-2 py-0.5 rounded-full capitalize">
                    {order.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}