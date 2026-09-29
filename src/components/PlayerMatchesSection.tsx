"use client";

import { useEffect, useState } from "react";
import StatusBadge from "@/components/StatusBadge";

interface Match {
  id: string;
  mode: string;
  title: string;
  matchCode: string | null;
  entryFee: number;
  maxSlots: number | null;
  startDate: string;
  status: string;
  reviewNote: string | null;
}

export default function PlayerMatchesSection() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    const res = await fetch("/api/player-matches?mine=1");
    const data = await res.json();
    setMatches(data.matches ?? []);
    setLoading(false);
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- simple client-side data fetch on mount
    load();
  }, []);

  async function remove(id: string) {
    if (!window.confirm("Delete this match?")) return;
    await fetch(`/api/player-matches/${id}`, { method: "DELETE" });
    load();
  }

  return (
    <div className="mt-10">
      <h2 className="text-xl font-bold">My WOW / TDM Matches</h2>
      <p className="mt-2 text-sm text-neutral-500">
        Creating your own match is paused for now while we rework this feature — check back soon.
      </p>

      {loading ? (
        <p className="mt-4 text-sm text-neutral-500">Loading...</p>
      ) : matches.length === 0 ? (
        <p className="mt-4 text-sm text-neutral-500">You haven&apos;t created any matches yet.</p>
      ) : (
        <div className="mt-4 space-y-3">
          {matches.map((m) => (
            <div key={m.id} className="glass-panel clip-corner p-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase text-orange-400">{m.mode}</p>
                  <p className="font-bold">{m.title}</p>
                  <p className="text-sm text-neutral-500">
                    Starts {new Date(m.startDate).toLocaleString()} · Entry fee:{" "}
                    {m.entryFee > 0 ? `₹${m.entryFee}` : "Free"}
                  </p>
                  {m.matchCode && (
                    <p className="mt-1 text-sm">
                      Code: <span className="font-mono font-semibold text-orange-400">{m.matchCode}</span>
                    </p>
                  )}
                </div>
                <StatusBadge status={m.status} />
              </div>
              {m.reviewNote && <p className="mt-2 text-sm text-neutral-400">Admin note: {m.reviewNote}</p>}
              <button onClick={() => remove(m.id)} className="mt-2 text-sm text-red-400 hover:underline">
                Delete
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
