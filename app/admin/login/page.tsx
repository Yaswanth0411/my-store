"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    email:    "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");
  const [showPassword, setShowPassword] = useState(false);

  function update(field: string, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
    setError("");
  }

  async function handleLogin() {
    if (!form.email || !form.password) {
      setError("Please enter your email and password.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/admin/auth", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({
          email:    form.email,
          password: form.password,
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        router.push("/admin");
        router.refresh();
      } else {
        setError(data.error ?? "Invalid credentials.");
        setLoading(false);
      }
    } catch {
      setError("Network error. Please try again.");
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-stone-950 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">

        {/* Logo */}
        <div className="text-center mb-8">
          <p className="text-2xl font-semibold text-white">
            my<span className="text-emerald-400">store</span>
          </p>
          <p className="text-stone-400 text-sm mt-2">
            Admin Dashboard
          </p>
        </div>

        {/* Card */}
        <div className="bg-stone-900 rounded-2xl border border-stone-700 p-8">
          <h1 className="text-lg font-semibold text-white mb-6">
            Sign in to admin
          </h1>

          <div className="space-y-4">

            {/* Email */}
            <div>
              <label className="text-xs font-medium text-stone-400 block mb-1.5">
                Email address
              </label>
              <input
                type="email"
                className="w-full bg-stone-800 border border-stone-600 rounded-lg px-3 py-2.5 text-sm text-white placeholder-stone-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                value={form.email}
                onChange={(e) => update("email", e.target.value)}
                placeholder="admin@mystore.com"
                onKeyDown={(e) => e.key === "Enter" && handleLogin()}
              />
            </div>

            {/* Password */}
            <div>
              <label className="text-xs font-medium text-stone-400 block mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  className="w-full bg-stone-800 border border-stone-600 rounded-lg px-3 py-2.5 text-sm text-white placeholder-stone-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all pr-10"
                  value={form.password}
                  onChange={(e) => update("password", e.target.value)}
                  placeholder="••••••••"
                  onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-500 hover:text-stone-300 transition-colors text-xs"
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            {/* Error message */}
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3">
                <p className="text-xs text-red-400 flex items-center gap-2">
                  <span>⚠</span>
                  {error}
                </p>
              </div>
            )}

            {/* Login button */}
            <button
              onClick={handleLogin}
              disabled={loading}
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-medium py-2.5 rounded-xl transition-colors disabled:opacity-60 disabled:cursor-not-allowed mt-2"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Signing in...
                </span>
              ) : (
                "Sign in to admin"
              )}
            </button>

          </div>
        </div>

        {/* Back to store */}
        <p className="text-center mt-6">
          <a
            href="/"
            className="text-sm text-stone-500 hover:text-stone-300 transition-colors"
          >
            ← Back to store
          </a>
        </p>

      </div>
    </div>
  );
}