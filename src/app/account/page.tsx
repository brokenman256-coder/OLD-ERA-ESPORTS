"use client";

import { useState } from "react";

export default function AccountPage() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [message, setMessage] = useState<{ type: "error" | "success"; text: string } | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);
    setLoading(true);

    const res = await fetch("/api/me", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ currentPassword, newPassword }),
    });
    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setMessage({ type: "error", text: data.error ?? "Something went wrong" });
      return;
    }

    setCurrentPassword("");
    setNewPassword("");
    setMessage({ type: "success", text: "Password updated." });
  }

  return (
    <div className="mx-auto max-w-md px-6 py-16">
      <h1 className="text-2xl font-bold">Account settings</h1>
      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div>
          <label className="block text-sm font-medium">Current password</label>
          <input
            type="password"
            required
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">New password</label>
          <input
            type="password"
            required
            minLength={8}
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2"
          />
        </div>
        {message && (
          <p className={`text-sm ${message.type === "error" ? "text-red-600" : "text-green-600"}`}>
            {message.text}
          </p>
        )}
        <button
          disabled={loading}
          className="w-full rounded-md bg-red-600 px-4 py-2 font-semibold text-white hover:bg-red-500 disabled:opacity-50"
        >
          {loading ? "Saving..." : "Update password"}
        </button>
      </form>
    </div>
  );
}
