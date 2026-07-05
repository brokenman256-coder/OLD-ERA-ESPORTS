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
    <div className="mx-auto max-w-md px-6 py-16">
      <h1 className="text-2xl font-bold">Create an account</h1>

      <div className="mt-6 grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => setRole("PLAYER")}
          className={`rounded-md border px-4 py-3 text-sm font-semibold ${
            role === "PLAYER"
              ? "border-red-600 bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300"
              : "border-neutral-300 dark:border-neutral-700"
          }`}
        >
          I&apos;m a Player
        </button>
        <button
          type="button"
          onClick={() => setRole("ORGANIZER")}
          className={`rounded-md border px-4 py-3 text-sm font-semibold ${
            role === "ORGANIZER"
              ? "border-red-600 bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300"
              : "border-neutral-300 dark:border-neutral-700"
          }`}
        >
          I&apos;m an Organizer
        </button>
      </div>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div>
          <label className="block text-sm font-medium">Full name</label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 dark:border-neutral-700 dark:bg-neutral-900"
          />
        </div>

        {role === "ORGANIZER" && (
          <div>
            <label className="block text-sm font-medium">Firm / company name</label>
            <input
              type="text"
              required
              value={firmName}
              onChange={(e) => setFirmName(e.target.value)}
              className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 dark:border-neutral-700 dark:bg-neutral-900"
              placeholder="e.g. Phoenix Gaming Pvt Ltd"
            />
          </div>
        )}

        <div>
          <label className="block text-sm font-medium">Email</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 dark:border-neutral-700 dark:bg-neutral-900"
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Phone number</label>
          <input
            type="tel"
            required
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 dark:border-neutral-700 dark:bg-neutral-900"
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Password</label>
          <input
            type="password"
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 dark:border-neutral-700 dark:bg-neutral-900"
          />
          <p className="mt-1 text-xs text-neutral-500">At least 8 characters.</p>
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button
          disabled={loading}
          className="w-full rounded-md bg-red-600 px-4 py-2 font-semibold text-white hover:bg-red-500 disabled:opacity-50"
        >
          {loading ? "Creating account..." : "Sign up"}
        </button>
      </form>

      <p className="mt-4 text-sm text-neutral-500">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-red-600 hover:underline">
          Log in
        </Link>
      </p>
    </div>
  );
}
