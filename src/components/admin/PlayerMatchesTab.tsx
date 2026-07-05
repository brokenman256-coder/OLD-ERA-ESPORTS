"use client";

import { useEffect, useState } from "react";
import StatusBadge from "@/components/StatusBadge";

interface PlayerMatch {
  id: string;
  mode: string;
  title: string;
  description: string | null;
  matchCode: string | null;
  entryFee: number;
  maxSlots: number | null;
  startDate: string;
  status: string;
  reviewNote: string | null;
  creatorEmail: string;
  creator?: { name: string };
}

const FILTERS = ["ALL", "PENDING", "APPROVED", "REJECTED"] as const;

export default function PlayerMatchesTab() {
  const [matches, setMatches] = useState<PlayerMatch[]>([]);
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("PENDING");
  const [loading, setLoading] = useState(true);

  async function load() {
    const qs = filter === "ALL" ? "" : `?status=${filter}`;
    const res = await fetch(`/api/admin/player-matches${qs}`);
    const data = await res.json();
    setMatches(data.matches ?? []);
    setLoading(false);
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- simple client-side data fetch on filter change
    setLoading(true);
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  async function verify(id: string, status: "APPROVED" | "REJECTED") {
    const reviewNote =
      status === "REJECTED" ? window.prompt("Reason for rejection (optional):") ?? undefined : undefined;
    await fetch(`/api/admin/player-matches/${id}/verify`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status, reviewNote }),
    });
    load();
  }

  async function remove(id: string) {
    if (!window.confirm("Delete this match permanently?")) return;
    await fetch(`/api/player-matches/${id}`, { method: "DELETE" });
    load();
  }

  return (
    <div>
      <div className="flex gap-2">
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`rounded-md px-3 py-1.5 text-sm font-medium ${
              filter === f
                ? "bg-black text-white dark:bg-white dark:text-black"
                : "bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="mt-6 text-neutral-500">Loading...</p>
      ) : matches.length === 0 ? (
        <p className="mt-6 text-neutral-500">No player matches here.</p>
      ) : (
        <div className="mt-6 space-y-4">
          {matches.map((m) => (
            <div key={m.id} className="rounded-lg border border-neutral-800 bg-neutral-900 p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase text-cyan-400">{m.mode}</p>
                  <h3 className="text-lg font-bold">{m.title}</h3>
                  <p className="text-sm text-neutral-500">
                    By {m.creator?.name} ({m.creatorEmail})
                  </p>
                  <p className="mt-1 text-sm">
                    Starts {new Date(m.startDate).toLocaleString()} · Entry fee:{" "}
                    {m.entryFee > 0 ? `₹${m.entryFee}` : "Free"}
                    {m.maxSlots ? ` · Max ${m.maxSlots} slots` : ""}
                  </p>
                  {m.matchCode && (
                    <p className="mt-1 text-sm">
                      Match code: <span className="font-mono font-semibold text-cyan-400">{m.matchCode}</span>
                    </p>
                  )}
                  {m.description && <p className="mt-1 text-sm text-neutral-400">{m.description}</p>}
                </div>
                <StatusBadge status={m.status} />
              </div>

              {m.reviewNote && (
                <p className="mt-3 text-sm text-neutral-400">Admin note: {m.reviewNote}</p>
              )}

              <div className="mt-4 flex flex-wrap gap-2">
                {m.status !== "APPROVED" && (
                  <button
                    onClick={() => verify(m.id, "APPROVED")}
                    className="rounded-md bg-green-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-green-500"
                  >
                    Approve
                  </button>
                )}
                {m.status !== "REJECTED" && (
                  <button
                    onClick={() => verify(m.id, "REJECTED")}
                    className="rounded-md bg-red-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-red-500"
                  >
                    Reject
                  </button>
                )}
                <button
                  onClick={() => remove(m.id)}
                  className="rounded-md bg-neutral-800 px-3 py-1.5 text-sm font-medium text-red-400 hover:bg-neutral-700"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
