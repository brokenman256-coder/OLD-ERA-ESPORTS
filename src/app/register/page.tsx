"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function RegisterPage() {
  const [role, setRole] = useState<"PLAYER" | "ORGANIZER">("PLAYER");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firmName, setFirmName] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password, role, firmName, phone }),
    });
    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error ?? "Something went wrong");
      return;
    }

    router.push(role === "ORGANIZER" ? "/dashboard/organizer" : "/dashboard/player");
    router.refresh();
  }

  return (
    <div className="mx-auto flex max-w-md flex-col items-center px-6 py-16 sm:py-24">
      <p className="skew-x-[-6deg] bg-gradient-to-r from-cyan-300 via-purple-400 to-pink-400 bg-clip-text text-xs font-black uppercase tracking-[0.35em] text-transparent">
        Vantix
      </p>
      <h1 className="mt-2 text-3xl font-black uppercase tracking-tight">Create an account</h1>

      <div className="glass-panel clip-corner mt-8 w-full p-6 sm:p-8">
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setRole("PLAYER")}
            className={`clip-corner-sm border px-4 py-3 text-sm font-bold uppercase tracking-wide transition ${
              role === "PLAYER"
                ? "border-cyan-400/50 bg-cyan-400/10 text-cyan-300"
                : "border-white/10 bg-white/5 text-neutral-400 hover:bg-white/10"
            }`}
          >
            I&apos;m a Player
          </button>
          <button
            type="button"
            onClick={() => setRole("ORGANIZER")}
            className={`clip-corner-sm border px-4 py-3 text-sm font-bold uppercase tracking-wide transition ${
              role === "ORGANIZER"
                ? "border-purple-400/50 bg-purple-400/10 text-purple-300"
                : "border-white/10 bg-white/5 text-neutral-400 hover:bg-white/10"
            }`}
          >
            I&apos;m an Organizer
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wide text-neutral-400">Full name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1.5 w-full rounded-md premium-input px-3 py-2"
            />
          </div>

          {role === "ORGANIZER" && (
            <div>
              <label className="block text-xs font-bold uppercase tracking-wide text-neutral-400">
                Firm / company name
              </label>
              <input
                type="text"
                required
                value={firmName}
                onChange={(e) => setFirmName(e.target.value)}
                className="mt-1.5 w-full rounded-md premium-input px-3 py-2"
                placeholder="e.g. Phoenix Gaming Pvt Ltd"
              />
            </div>
          )}

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
            <label className="block text-xs font-bold uppercase tracking-wide text-neutral-400">Phone number</label>
            <input
              type="tel"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="mt-1.5 w-full rounded-md premium-input px-3 py-2"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wide text-neutral-400">Password</label>
            <input
              type="password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1.5 w-full rounded-md premium-input px-3 py-2"
            />
            <p className="mt-1 text-xs text-neutral-500">At least 8 characters.</p>
          </div>

          {error && <p className="text-sm text-red-400">{error}</p>}

          <button
            disabled={loading}
            className="w-full clip-corner-sm premium-btn px-4 py-2.5 font-bold uppercase tracking-wide"
          >
            {loading ? "Creating account…" : "Sign up"}
          </button>
        </form>
      </div>

      <p className="mt-6 text-sm text-neutral-500">
        Already have an account?{" "}
        <Link href="/login" className="font-bold text-cyan-400 hover:underline">
          Log in
        </Link>
      </p>
    </div>
  );
}
