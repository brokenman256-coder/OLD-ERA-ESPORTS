"use client";

import { useEffect, useState } from "react";
import StatusBadge from "@/components/StatusBadge";

interface Entry {
  id: string;
  teamName: string | null;
  contactPhone: string | null;
  contactEmail: string | null;
  instagramHandle: string | null;
  squadMembers: { name: string; gameId: string }[] | null;
  paymentProof: string | null;
  utrNumber: string | null;
  status: string;
  reviewNote: string | null;
  player?: { name: string; email: string };
  playerIsBot?: boolean;
  playerIsGuest?: boolean;
}

const FILTERS = ["ALL", "PENDING", "APPROVED", "REJECTED"] as const;

export default function TournamentEntriesPanel({ tournamentId }: { tournamentId: string }) {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("ALL");
  const [loading, setLoading] = useState(true);

  async function load() {
    const qs = new URLSearchParams({ tournamentId });
    if (filter !== "ALL") qs.set("status", filter);
    const res = await fetch(`/api/admin/registrations?${qs.toString()}`);
    const data = await res.json();
    setEntries(data.registrations ?? []);
    setLoading(false);
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- simple client-side data fetch on mount/filter change
    setLoading(true);
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  async function verify(id: string, status: "APPROVED" | "REJECTED") {
    const reviewNote =
      status === "REJECTED" ? window.prompt("Reason for rejection (optional):") ?? undefined : undefined;
    await fetch(`/api/admin/registrations/${id}/verify`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status, reviewNote }),
    });
    load();
  }

  return (
    <div className="mt-4 rounded-md border border-neutral-200 bg-neutral-50 p-4 dark:border-neutral-800 dark:bg-neutral-950/50">
      <div className="flex flex-wrap items-center gap-2">
        <p className="mr-2 text-xs font-bold uppercase tracking-wide text-neutral-500">Entries</p>
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`rounded-md px-2.5 py-1 text-xs font-medium ${
              filter === f
                ? "bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-500 text-white"
                : "border border-white/10 bg-white/5 text-neutral-400 hover:bg-white/10"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="mt-4 text-sm text-neutral-500">Loading...</p>
      ) : entries.length === 0 ? (
        <p className="mt-4 text-sm text-neutral-500">No entries here.</p>
      ) : (
        <div className="mt-4 space-y-3">
          {entries.map((e) => (
            <div key={e.id} className="rounded-md border border-neutral-200 bg-white p-3 dark:border-neutral-800 dark:bg-neutral-900">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-bold">
                    {e.teamName || e.player?.name}
                    {e.playerIsGuest && (
                      <span className="ml-2 rounded-full border border-sky-500/30 bg-sky-500/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-sky-400">
                        Guest
                      </span>
                    )}
                    {e.playerIsBot && (
                      <span className="ml-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-amber-400">
                        Bot
                      </span>
                    )}
                  </p>
                  {e.contactPhone && <p className="mt-0.5 text-xs text-neutral-500">Phone: {e.contactPhone}</p>}
                  {e.contactEmail && <p className="mt-0.5 text-xs text-neutral-500">Email: {e.contactEmail}</p>}
                  {e.instagramHandle && <p className="mt-0.5 text-xs text-neutral-500">Instagram: {e.instagramHandle}</p>}
                  {e.utrNumber && (
                    <p className="mt-0.5 text-xs text-neutral-500">
                      UTR: <span className="font-mono font-semibold text-orange-400">{e.utrNumber}</span>
                    </p>
                  )}
                </div>
                <StatusBadge status={e.status} />
              </div>

              {Array.isArray(e.squadMembers) && e.squadMembers.length > 0 && (
                <div className="mt-2 grid grid-cols-2 gap-1 text-xs text-neutral-600 dark:text-neutral-400 sm:grid-cols-4">
                  {e.squadMembers.map((m, i) => (
                    <p key={i}>
                      P{i + 1}: {m.name} ({m.gameId})
                    </p>
                  ))}
                </div>
              )}

              {e.paymentProof && (
                <a href={e.paymentProof} target="_blank" rel="noreferrer" className="mt-2 inline-block">
                  {/* eslint-disable-next-line @next/next/no-img-element -- arbitrary-sized user-uploaded screenshot */}
                  <img src={e.paymentProof} alt="Payment proof" className="max-h-32 rounded-md border border-neutral-200" />
                </a>
              )}

              <div className="mt-2 flex flex-wrap gap-2">
                {e.status !== "APPROVED" && (
                  <button
                    onClick={() => verify(e.id, "APPROVED")}
                    className="rounded-md bg-green-600 px-2.5 py-1 text-xs font-medium text-white hover:bg-green-500"
                  >
                    Approve
                  </button>
                )}
                {e.status !== "REJECTED" && (
                  <button
                    onClick={() => verify(e.id, "REJECTED")}
                    className="clip-corner-sm premium-btn px-2.5 py-1 text-xs font-bold uppercase tracking-wide"
                  >
                    Reject
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
