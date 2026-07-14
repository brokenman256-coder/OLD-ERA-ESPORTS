"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function GenerateBracketButton({ tournamentId }: { tournamentId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function generate() {
    setLoading(true);
    setError(null);
    const res = await fetch(`/api/tournaments/${tournamentId}/bracket`, { method: "POST" });
    const data = await res.json().catch(() => ({}));
    setLoading(false);
    if (!res.ok) {
      setError(data.error ?? "Something went wrong");
      return;
    }
    router.refresh();
  }

  return (
    <div className="clip-corner border border-neutral-800 bg-neutral-900/80 p-5">
      <p className="text-sm font-bold uppercase tracking-wide text-neutral-300">Bracket not generated yet</p>
      <p className="mt-1 text-sm text-neutral-500">
        Generate the bracket from approved registrations. Auto-seeding keeps top seeds apart for as long as
        possible. This locks in the current list of approved participants.
      </p>
      {error && <p className="mt-2 text-sm text-red-400">{error}</p>}
      <button
        onClick={generate}
        disabled={loading}
        className="clip-corner-sm mt-3 bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 px-5 py-2 text-sm font-bold uppercase tracking-wide hover:brightness-110 disabled:opacity-50"
      >
        {loading ? "Generating…" : "Generate Bracket"}
      </button>
    </div>
  );
}
