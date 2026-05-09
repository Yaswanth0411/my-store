"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { ReactNode, useState } from "react";

export default function AdminLayout({ children }: { children: ReactNode }) {
  const router   = useRouter();
  const pathname = usePathname();
  const [loggingOut, setLoggingOut] = useState(false);

  // Don't show sidebar on login page
  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  async function handleLogout() {
    setLoggingOut(true);
    await fetch("/api/admin/auth", { method: "DELETE" });
    router.push("/admin/login");
    router.refresh();
  }

  const navItems = [
    { href: "/admin",              label: "Overview",    emoji: "📊" },
    { href: "/admin/products",     label: "Products",    emoji: "📦" },
    { href: "/admin/products/new", label: "Add Product", emoji: "➕" },
    { href: "/admin/orders",       label: "Orders",      emoji: "🛍️" },
  ];

  return (
    <div className="min-h-screen bg-stone-100 flex">

      {/* ── Sidebar ── */}
      <aside className="w-56 bg-stone-900 text-white flex flex-col fixed h-full z-10">

        {/* Logo */}
        <div className="px-5 py-5 border-b border-stone-700">
          <p className="text-lg font-semibold">
            my<span className="text-emerald-400">store</span>
          </p>
          <p className="text-xs text-stone-400 mt-0.5">Admin Dashboard</p>
        </div>

        {/* Nav links */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                  isActive
                    ? "bg-emerald-600 text-white"
                    : "text-stone-300 hover:bg-stone-700 hover:text-white"
                }`}
              >
                <span>{item.emoji}</span>
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Bottom actions */}
        <div className="px-3 py-4 border-t border-stone-700 space-y-2">
          <Link
            href="/"
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-stone-400 hover:bg-stone-700 hover:text-white transition-colors"
          >
            <span>🏪</span>
            View store
          </Link>
          <button
            onClick={handleLogout}
            disabled={loggingOut}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors disabled:opacity-50"
          >
            <span>🚪</span>
            {loggingOut ? "Signing out..." : "Sign out"}
          </button>
        </div>

      </aside>

      {/* ── Main content ── */}
      <main className="ml-56 flex-1 p-8 min-h-screen">
        {children}
      </main>

    </div>
  );
}