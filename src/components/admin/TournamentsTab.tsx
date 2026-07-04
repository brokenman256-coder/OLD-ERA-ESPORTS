"use client";

import { useEffect, useState } from "react";
import StatusBadge from "@/components/StatusBadge";

interface Tournament {
  id: string;
  title: string;
  game: string;
  description: string;
  rules: string | null;
  prizePool: string | null;
  entryFee: number;
  hostingFee: number;
  maxSlots: number | null;
  startDate: string;
  endDate: string | null;
  status: string;
  reviewNote: string | null;
  hostingFeeProof: string | null;
  registrationCount: number;
  organizerEmail: string;
  organizer?: { name: string; firmName: string | null };
}

const FILTERS = ["ALL", "PENDING", "APPROVED", "REJECTED"] as const;

export default function TournamentsTab() {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("PENDING");
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);

  async function load() {
    const qs = filter === "ALL" ? "" : `?status=${filter}`;
    const res = await fetch(`/api/admin/tournaments${qs}`);
    const data = await res.json();
    setTournaments(data.tournaments ?? []);
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
    await fetch(`/api/admin/tournaments/${id}/verify`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status, reviewNote }),
    });
    load();
  }

  async function remove(id: string) {
    if (!window.confirm("Delete this tournament permanently?")) return;
    await fetch(`/api/tournaments/${id}`, { method: "DELETE" });
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
              filter === f ? "bg-black text-white" : "bg-neutral-100 text-neutral-600"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="mt-6 text-neutral-500">Loading...</p>
      ) : tournaments.length === 0 ? (
        <p className="mt-6 text-neutral-500">No tournaments here.</p>
      ) : (
        <div className="mt-6 space-y-4">
          {tournaments.map((t) => (
            <div key={t.id} className="rounded-lg border border-neutral-200 bg-white p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase text-red-600">{t.game}</p>
                  <h3 className="text-lg font-bold">{t.title}</h3>
                  <p className="text-sm text-neutral-500">
                    Organizer: {t.organizer?.firmName || t.organizer?.name} ({t.organizerEmail})
                  </p>
                  <p className="mt-1 text-sm">
                    Hosting fee: {t.hostingFee > 0 ? `₹${t.hostingFee}` : "None"} · Entry fee:{" "}
                    {t.entryFee > 0 ? `₹${t.entryFee}` : "Free"} · {t.registrationCount} registered
                  </p>
                </div>
                <StatusBadge status={t.status} />
              </div>

              {t.hostingFeeProof && (
                <div className="mt-3">
                  <p className="text-xs font-medium text-neutral-500">Hosting fee payment screenshot:</p>
                  <a href={t.hostingFeeProof} target="_blank" rel="noreferrer">
                    {/* eslint-disable-next-line @next/next/no-img-element -- arbitrary-sized user-uploaded screenshot */}
                    <img
                      src={t.hostingFeeProof}
                      alt="Hosting fee payment proof"
                      className="mt-1 max-h-48 rounded-md border border-neutral-200"
                    />
                  </a>
                </div>
              )}

              <div className="mt-4 flex flex-wrap gap-2">
                {t.status !== "APPROVED" && (
                  <button
                    onClick={() => verify(t.id, "APPROVED")}
                    className="rounded-md bg-green-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-green-500"
                  >
                    Approve
                  </button>
                )}
                {t.status !== "REJECTED" && (
                  <button
                    onClick={() => verify(t.id, "REJECTED")}
                    className="rounded-md bg-red-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-red-500"
                  >
                    Reject
                  </button>
                )}
                <button
                  onClick={() => setEditingId(editingId === t.id ? null : t.id)}
                  className="rounded-md bg-neutral-100 px-3 py-1.5 text-sm font-medium hover:bg-neutral-200"
                >
                  {editingId === t.id ? "Close editor" : "Edit"}
                </button>
                <button
                  onClick={() => remove(t.id)}
                  className="rounded-md bg-neutral-100 px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-neutral-200"
                >
                  Delete
                </button>
              </div>

              {editingId === t.id && (
                <EditTournamentInline tournament={t} onSaved={() => { setEditingId(null); load(); }} />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function EditTournamentInline({
  tournament,
  onSaved,
}: {
  tournament: Tournament;
  onSaved: () => void;
}) {
  const [title, setTitle] = useState(tournament.title);
  const [game, setGame] = useState(tournament.game);
  const [description, setDescription] = useState(tournament.description);
  const [prizePool, setPrizePool] = useState(tournament.prizePool ?? "");
  const [entryFee, setEntryFee] = useState(String(tournament.entryFee));
  const [hostingFee, setHostingFee] = useState(String(tournament.hostingFee));
  const [maxSlots, setMaxSlots] = useState(tournament.maxSlots ? String(tournament.maxSlots) : "");
  const [saving, setSaving] = useState(false);

  async function save() {
    setSaving(true);
    await fetch(`/api/tournaments/${tournament.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title,
        game,
        description,
        prizePool,
        entryFee: Number(entryFee),
        hostingFee: Number(hostingFee),
        maxSlots: maxSlots ? Number(maxSlots) : null,
      }),
    });
    setSaving(false);
    onSaved();
  }

  return (
    <div className="mt-4 space-y-3 rounded-md border border-neutral-200 bg-neutral-50 p-4">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <input value={title} onChange={(e) => setTitle(e.target.value)} className="rounded-md border border-neutral-300 px-3 py-2" placeholder="Title" />
        <input value={game} onChange={(e) => setGame(e.target.value)} className="rounded-md border border-neutral-300 px-3 py-2" placeholder="Game" />
      </div>
      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        rows={3}
        className="w-full rounded-md border border-neutral-300 px-3 py-2"
        placeholder="Description"
      />
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <input value={prizePool} onChange={(e) => setPrizePool(e.target.value)} className="rounded-md border border-neutral-300 px-3 py-2" placeholder="Prize pool" />
        <input value={entryFee} onChange={(e) => setEntryFee(e.target.value)} type="number" className="rounded-md border border-neutral-300 px-3 py-2" placeholder="Entry fee" />
        <input value={hostingFee} onChange={(e) => setHostingFee(e.target.value)} type="number" className="rounded-md border border-neutral-300 px-3 py-2" placeholder="Hosting fee" />
        <input value={maxSlots} onChange={(e) => setMaxSlots(e.target.value)} type="number" className="rounded-md border border-neutral-300 px-3 py-2" placeholder="Max slots" />
      </div>
      <button
        onClick={save}
        disabled={saving}
        className="rounded-md bg-black px-4 py-2 text-sm font-semibold text-white hover:bg-neutral-800 disabled:opacity-50"
      >
        {saving ? "Saving..." : "Save changes"}
      </button>
    </div>
  );
}
