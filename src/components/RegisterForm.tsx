"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function RegisterForm({
  tournamentId,
  entryFee,
}: {
  tournamentId: string;
  entryFee: number;
}) {
  const [teamName, setTeamName] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (entryFee > 0 && !file) {
      setError("Please upload a screenshot of your entry fee payment.");
      return;
    }

    setLoading(true);
    const form = new FormData();
    if (teamName) form.set("teamName", teamName);
    if (file) form.set("paymentProof", file);

    const res = await fetch(`/api/tournaments/${tournamentId}/register`, {
      method: "POST",
      body: form,
    });
    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error ?? "Something went wrong");
      return;
    }

    setDone(true);
    router.refresh();
  }

  if (done) {
    return (
      <div className="rounded-md border border-green-300 bg-green-50 p-4 text-green-800">
        You&apos;re registered! {entryFee > 0
          ? "Your payment screenshot is pending admin verification."
          : "Your spot is confirmed."}
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-lg border border-neutral-200 bg-white p-6">
      <h3 className="text-lg font-bold">Register for this tournament</h3>

      <div>
        <label className="block text-sm font-medium">Team / IGN (optional)</label>
        <input
          type="text"
          value={teamName}
          onChange={(e) => setTeamName(e.target.value)}
          className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2"
        />
      </div>

      {entryFee > 0 && (
        <div>
          <label className="block text-sm font-medium">
            Entry fee payment screenshot (₹{entryFee}) — required
          </label>
          <input
            type="file"
            accept="image/png,image/jpeg,image/webp"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            className="mt-1 w-full text-sm"
          />
          <p className="mt-1 text-xs text-neutral-500">
            Upload a screenshot of your ₹{entryFee} payment. Our admin will verify it
            manually before your registration is confirmed.
          </p>
        </div>
      )}

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button
        disabled={loading}
        className="w-full rounded-md bg-red-600 px-4 py-2 font-semibold text-white hover:bg-red-500 disabled:opacity-50"
      >
        {loading ? "Submitting..." : "Register"}
      </button>
    </form>
  );
}
