import Link from "next/link";
import { ReactNode } from "react";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-stone-100 flex">

      {/* ── Sidebar ── */}
      <aside className="w-56 bg-stone-900 text-white flex flex-col fixed h-full z-10">
        <div className="px-5 py-5 border-b border-stone-700">
          <p className="text-lg font-semibold">
            my<span className="text-emerald-400">store</span>
          </p>
          <p className="text-xs text-stone-400 mt-0.5">Admin Dashboard</p>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          {[
            { href: "/admin",              label: "Overview",  emoji: "📊" },
            { href: "/admin/products",     label: "Products",  emoji: "📦" },
            { href: "/admin/products/new", label: "Add Product", emoji: "➕" },
            { href: "/admin/orders",       label: "Orders",    emoji: "🛍️" },
          ].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-stone-300 hover:bg-stone-700 hover:text-white transition-colors"
            >
              <span>{item.emoji}</span>
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="px-5 py-4 border-t border-stone-700">
          <Link
            href="/"
            className="text-xs text-stone-400 hover:text-white transition-colors"
          >
            ← Back to store
          </Link>
        </div>
      </aside>

      {/* ── Main content ── */}
      <main className="ml-56 flex-1 p-8">
        {children}
      </main>

    </div>
  );
}