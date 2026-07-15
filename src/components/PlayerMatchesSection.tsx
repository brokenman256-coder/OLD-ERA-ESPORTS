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

const inputClass =
  "mt-1 w-full rounded-md premium-input px-3 py-2";

export default function PlayerMatchesSection() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);

  const [mode, setMode] = useState<"WOW" | "TDM">("WOW");
  const [title, setTitle] = useState("");
  const [matchCode, setMatchCode] = useState("");
  const [description, setDescription] = useState("");
  const [entryFee, setEntryFee] = useState("0");
  const [maxSlots, setMaxSlots] = useState("");
  const [startDate, setStartDate] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
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
      setError(data.error ?? "Something went wrong");
      return;
    }

    setTitle("");
    setMatchCode("");
    setDescription("");
    setEntryFee("0");
    setMaxSlots("");
    setStartDate("");
    setOpen(false);
    load();
  }

  return (
    <div className="mt-10">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">My WOW / TDM Matches</h2>
        {!open && (
          <button
            onClick={() => setOpen(true)}
            className="clip-corner-sm premium-btn px-4 py-2 text-sm font-bold uppercase tracking-wide"
          >
            + Create a match
          </button>
        )}
      </div>

      {open && (
        <form
          onSubmit={handleSubmit}
          className="mt-4 space-y-3 glass-panel clip-corner p-5"
        >
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

          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Match title"
            required
            className={inputClass}
          />
          <input
            value={matchCode}
            onChange={(e) => setMatchCode(e.target.value)}
            placeholder="Match / room code"
            required
            className={inputClass}
          />
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Description (optional)"
            rows={2}
            className={inputClass}
          />
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <input
              type="datetime-local"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              required
              className={inputClass}
            />
            <input
              type="number"
              min="0"
              value={entryFee}
              onChange={(e) => setEntryFee(e.target.value)}
              placeholder="Entry fee (₹)"
              className={inputClass}
            />
            <input
              type="number"
              min="1"
              value={maxSlots}
              onChange={(e) => setMaxSlots(e.target.value)}
              placeholder="Max players (optional)"
              className={inputClass}
            />
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}

          <div className="flex gap-2">
            <button
              disabled={submitting}
              className="clip-corner-sm premium-btn px-4 py-2 text-sm font-bold uppercase tracking-wide disabled:cursor-not-allowed"
            >
              {submitting ? "Submitting..." : "Submit for admin approval"}
            </button>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded-md bg-neutral-800 px-4 py-2 text-sm font-semibold hover:bg-neutral-700"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

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
