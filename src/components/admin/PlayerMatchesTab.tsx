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
const inputClass =
  "rounded-md premium-input px-3 py-2 text-sm";

export default function PlayerMatchesTab() {
  const [matches, setMatches] = useState<PlayerMatch[]>([]);
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("PENDING");
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  const [mode, setMode] = useState<"WOW" | "TDM">("WOW");
  const [title, setTitle] = useState("");
  const [matchCode, setMatchCode] = useState("");
  const [description, setDescription] = useState("");
  const [entryFee, setEntryFee] = useState("0");
  const [maxSlots, setMaxSlots] = useState("");
  const [startDate, setStartDate] = useState("");
  const [createError, setCreateError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

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

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setCreateError(null);
    setSubmitting(true);

    const res = await fetch("/api/player-matches", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        mode,
        title,
        matchCode,
        description,
        entryFee: Number(entryFee),
        maxSlots: maxSlots || undefined,
        startDate,
      }),
    });
    const data = await res.json();
    setSubmitting(false);

    if (!res.ok) {
      setCreateError(data.error ?? "Something went wrong");
      return;
    }

    setTitle("");
    setMatchCode("");
    setDescription("");
    setEntryFee("0");
    setMaxSlots("");
    setStartDate("");
    setCreating(false);
    setFilter("PENDING");
    load();
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex gap-2">
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`rounded-md px-3 py-1.5 text-sm font-medium ${
                filter === f
                  ? "bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-500 text-white"
                  : "border border-white/10 bg-white/5 text-neutral-400 hover:bg-white/10"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
        {!creating && (
          <button
            onClick={() => setCreating(true)}
            className="clip-corner-sm premium-btn px-3 py-1.5 text-sm font-bold uppercase tracking-wide"
          >
            + Create match
          </button>
        )}
      </div>

      {creating && (
        <form onSubmit={handleCreate} className="mt-4 space-y-3 glass-panel clip-corner p-5">
          <div className="flex gap-2">
            {(["WOW", "TDM"] as const).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setMode(m)}
                className={`rounded-md px-3 py-1.5 text-sm font-semibold ${
                  mode === m ? "bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-500 text-white" : "border border-white/10 bg-white/5 text-neutral-400 hover:bg-white/10"
                }`}
              >
                {m}
              </button>
            ))}
          </div>
          <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Match title" required className={`w-full ${inputClass}`} />
          <input value={matchCode} onChange={(e) => setMatchCode(e.target.value)} placeholder="Match / room code" required className={`w-full ${inputClass}`} />
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Description (optional)" rows={2} className={`w-full ${inputClass}`} />
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <input type="datetime-local" value={startDate} onChange={(e) => setStartDate(e.target.value)} required className={inputClass} />
            <input type="number" min="0" value={entryFee} onChange={(e) => setEntryFee(e.target.value)} placeholder="Entry fee (₹)" className={inputClass} />
            <input type="number" min="1" value={maxSlots} onChange={(e) => setMaxSlots(e.target.value)} placeholder="Max players (optional)" className={inputClass} />
          </div>
          {createError && <p className="text-sm text-red-500">{createError}</p>}
          <div className="flex gap-2">
            <button disabled={submitting} className="clip-corner-sm premium-btn px-4 py-2 text-sm font-bold uppercase tracking-wide disabled:cursor-not-allowed">
              {submitting ? "Creating..." : "Create match"}
            </button>
            <button type="button" onClick={() => setCreating(false)} className="rounded-md bg-neutral-800 px-4 py-2 text-sm font-semibold hover:bg-neutral-700">
              Cancel
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <p className="mt-6 text-neutral-500">Loading...</p>
      ) : matches.length === 0 ? (
        <p className="mt-6 text-neutral-500">No player matches here.</p>
      ) : (
        <div className="mt-6 space-y-4">
          {matches.map((m) => (
            <div key={m.id} className="glass-panel clip-corner p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase text-orange-400">{m.mode}</p>
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
                      Match code: <span className="font-mono font-semibold text-orange-400">{m.matchCode}</span>
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
                    className="clip-corner-sm premium-btn px-3 py-1.5 text-sm font-bold uppercase tracking-wide"
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
