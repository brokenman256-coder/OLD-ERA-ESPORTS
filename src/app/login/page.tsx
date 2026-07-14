"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";

function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error ?? "Something went wrong");
      return;
    }

    const role = data.user.role;
    const next =
      searchParams.get("next") ||
      (role === "ADMIN" ? "/dashboard/admin" : role === "ORGANIZER" ? "/dashboard/organizer" : "/dashboard/player");

    router.push(next);
    router.refresh();
  }

  return (
    <div className="mx-auto flex max-w-md flex-col items-center px-6 py-16 sm:py-24">
      <p className="skew-x-[-6deg] bg-gradient-to-r from-cyan-300 via-purple-400 to-pink-400 bg-clip-text text-xs font-black uppercase tracking-[0.35em] text-transparent">
        Vantix
      </p>
      <h1 className="mt-2 text-3xl font-black uppercase tracking-tight">Welcome back</h1>

      <form onSubmit={handleSubmit} className="glass-panel clip-corner mt-8 w-full space-y-4 p-6 sm:p-8">
        <div>
          <label className="block text-xs font-bold uppercase tracking-wide text-neutral-400">Email</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1.5 w-full rounded-md premium-input px-3 py-2"
          />
        </div>
        <div>
          <label className="block text-xs font-bold uppercase tracking-wide text-neutral-400">Password</label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1.5 w-full rounded-md premium-input px-3 py-2"
          />
        </div>
        {error && <p className="text-sm text-red-400">{error}</p>}
        <button
          disabled={loading}
          className="w-full clip-corner-sm premium-btn px-4 py-2.5 font-bold uppercase tracking-wide"
        >
          {loading ? "Logging in…" : "Log in"}
        </button>
      </form>

      <p className="mt-6 text-sm text-neutral-500">
        Don&apos;t have an account?{" "}
        <Link href="/register" className="font-bold text-cyan-400 hover:underline">
          Sign up
        </Link>
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
