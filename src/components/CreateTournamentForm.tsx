"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function CreateTournamentForm() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [hostingFee, setHostingFee] = useState("0");
  const [proof, setProof] = useState<File | null>(null);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    const fee = Number(hostingFee || 0);
    if (fee > 0 && !proof) {
      setError("Please upload a screenshot of your hosting fee payment.");
      return;
    }

    setLoading(true);
    const form = new FormData(e.currentTarget);
    if (proof) form.set("hostingFeeProof", proof);

    const res = await fetch("/api/tournaments", { method: "POST", body: form });
    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error ?? "Something went wrong");
      return;
    }

    setOpen(false);
    router.refresh();
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="rounded-md bg-red-600 px-4 py-2 font-semibold text-white hover:bg-red-500"
      >
        + Post a new tournament
      </button>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 rounded-lg border border-neutral-200 bg-white p-6"
    >
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold">Post a new tournament</h3>
        <button type="button" onClick={() => setOpen(false)} className="text-sm text-neutral-500">
          Cancel
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium">Title</label>
          <input name="title" required className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2" />
        </div>
        <div>
          <label className="block text-sm font-medium">Game</label>
          <input name="game" required className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2" />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium">Description</label>
        <textarea
          name="description"
          required
          rows={4}
          className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2"
        />
      </div>

      <div>
        <label className="block text-sm font-medium">Rules (optional)</label>
        <textarea name="rules" rows={3} className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2" />
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div>
          <label className="block text-sm font-medium">Prize pool</label>
          <input name="prizePool" className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2" placeholder="₹10,000" />
        </div>
        <div>
          <label className="block text-sm font-medium">Entry fee (₹)</label>
          <input
            name="entryFee"
            type="number"
            min="0"
            step="1"
            defaultValue="0"
            className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Max slots</label>
          <input name="maxSlots" type="number" min="1" className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2" />
        </div>
        <div>
          <label className="block text-sm font-medium">Hosting fee (₹)</label>
          <input
            name="hostingFee"
            type="number"
            min="0"
            step="1"
            value={hostingFee}
            onChange={(e) => setHostingFee(e.target.value)}
            className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium">Start date</label>
          <input name="startDate" type="datetime-local" required className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2" />
        </div>
        <div>
          <label className="block text-sm font-medium">End date (optional)</label>
          <input name="endDate" type="datetime-local" className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2" />
        </div>
      </div>

      {Number(hostingFee || 0) > 0 && (
        <div>
          <label className="block text-sm font-medium">
            Hosting fee payment screenshot (₹{hostingFee}) — required
          </label>
          <input
            type="file"
            accept="image/png,image/jpeg,image/webp"
            onChange={(e) => setProof(e.target.files?.[0] ?? null)}
            className="mt-1 w-full text-sm"
          />
          <p className="mt-1 text-xs text-neutral-500">
            We charge a hosting fee to list your tournament. Upload your payment screenshot;
            an admin will manually verify it and approve your listing.
          </p>
        </div>
      )}

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button
        disabled={loading}
        className="w-full rounded-md bg-red-600 px-4 py-2 font-semibold text-white hover:bg-red-500 disabled:opacity-50"
      >
        {loading ? "Submitting..." : "Submit for review"}
      </button>
    </form>
  );
}
