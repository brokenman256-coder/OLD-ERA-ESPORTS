"use client";

import { useEffect, useState } from "react";
import StatusBadge from "@/components/StatusBadge";
import RoomDetailsForm from "@/components/RoomDetailsForm";
import TournamentEntriesPanel from "@/components/admin/TournamentEntriesPanel";

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
  registrationDeadline: string | null;
  status: string;
  reviewNote: string | null;
  hostingFeeProof: string | null;
  registrationCount: number;
  organizerEmail: string;
  organizerDisplayName: string | null;
  organizer?: { name: string; firmName: string | null };
  roomId: string | null;
  roomPassword: string | null;
  roomLink: string | null;
  paymentUpiId: string | null;
  paymentQrUrl: string | null;
  allowGuestRegistration: boolean;
}

const FILTERS = ["ALL", "PENDING", "APPROVED", "REJECTED"] as const;

function toDatetimeLocal(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  const offsetMs = d.getTimezoneOffset() * 60000;
  return new Date(d.getTime() - offsetMs).toISOString().slice(0, 16);
}

export default function TournamentsTab() {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("PENDING");
  const [originalsOnly, setOriginalsOnly] = useState(false);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [entriesId, setEntriesId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

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

  async function copyLink(id: string) {
    const url = `${window.location.origin}/tournaments/${id}`;
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      window.prompt("Copy this registration link:", url);
    }
    setCopiedId(id);
    setTimeout(() => setCopiedId((prev) => (prev === id ? null : prev)), 2000);
  }

  const visibleTournaments = originalsOnly
    ? tournaments.filter((t) => !t.organizerEmail.endsWith("@vantix.internal"))
    : tournaments;

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2">
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
        <label className="ml-2 flex items-center gap-1.5 text-xs font-medium text-neutral-400">
          <input
            type="checkbox"
            checked={originalsOnly}
            onChange={(e) => setOriginalsOnly(e.target.checked)}
          />
          Vantix Originals only (hide bot)
        </label>
      </div>

      {loading ? (
        <p className="mt-6 text-neutral-500">Loading...</p>
      ) : visibleTournaments.length === 0 ? (
        <p className="mt-6 text-neutral-500">No tournaments here.</p>
      ) : (
        <div className="mt-6 space-y-4">
          {visibleTournaments.map((t) => (
            <div key={t.id} className="glass-panel clip-corner p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-bold uppercase text-orange-400">{t.game}</p>
                  <h3 className="text-lg font-bold">
                    {t.title}
                    {t.organizerEmail.endsWith("@vantix.internal") ? (
                      <span className="ml-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-amber-400 align-middle">
                        Bot
                      </span>
                    ) : (
                      <span className="ml-2 rounded-full border border-orange-500/30 bg-orange-500/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-orange-400 align-middle">
                        Vantix Original
                      </span>
                    )}
                  </h3>
                  <p className="text-sm text-neutral-500">
                    Organizer: {t.organizerDisplayName || t.organizer?.firmName || t.organizer?.name}
                    {t.organizerDisplayName ? ` (account: ${t.organizer?.firmName || t.organizer?.name}, ` : " ("}
                    {t.organizerEmail})
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
                    className="clip-corner-sm premium-btn px-3 py-1.5 text-sm font-bold uppercase tracking-wide"
                  >
                    Reject
                  </button>
                )}
                <button
                  onClick={() => setEditingId(editingId === t.id ? null : t.id)}
                  className="rounded-md border border-white/10 bg-white/5 px-3 py-1.5 text-sm font-medium text-neutral-300 transition hover:bg-white/10 hover:text-white"
                >
                  {editingId === t.id ? "Close editor" : "Edit"}
                </button>
                {t.status === "APPROVED" && (
                  <button
                    onClick={() => setEntriesId(entriesId === t.id ? null : t.id)}
                    className="rounded-md border border-white/10 bg-white/5 px-3 py-1.5 text-sm font-medium text-neutral-300 transition hover:bg-white/10 hover:text-white"
                  >
                    {entriesId === t.id ? "Hide entries" : `View entries (${t.registrationCount})`}
                  </button>
                )}
                {t.status === "APPROVED" && (
                  <button
                    onClick={() => copyLink(t.id)}
                    className="rounded-md border border-orange-500/30 bg-orange-500/10 px-3 py-1.5 text-sm font-medium text-orange-400 transition hover:bg-orange-500/20"
                  >
                    {copiedId === t.id ? "Link copied!" : "Copy registration link"}
                  </button>
                )}
                <button
                  onClick={() => remove(t.id)}
                  className="rounded-md border border-red-500/30 bg-red-500/10 px-3 py-1.5 text-sm font-medium text-red-400 transition hover:bg-red-500/20"
                >
                  Delete
                </button>
              </div>

              {editingId === t.id && (
                <EditTournamentInline tournament={t} onSaved={() => { setEditingId(null); load(); }} />
              )}

              {entriesId === t.id && <TournamentEntriesPanel tournamentId={t.id} />}

              {t.status === "APPROVED" && (
                <RoomDetailsForm
                  tournamentId={t.id}
                  initialRoomId={t.roomId}
                  initialRoomPassword={t.roomPassword}
                  initialRoomLink={t.roomLink}
                />
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
  const [paymentUpiId, setPaymentUpiId] = useState(tournament.paymentUpiId ?? "");
  const [allowGuestRegistration, setAllowGuestRegistration] = useState(tournament.allowGuestRegistration);
  const [registrationDeadline, setRegistrationDeadline] = useState(
    toDatetimeLocal(tournament.registrationDeadline)
  );
  const [qrUploading, setQrUploading] = useState(false);
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
        paymentUpiId,
        allowGuestRegistration,
        registrationDeadline: registrationDeadline || null,
      }),
    });
    setSaving(false);
    onSaved();
  }

  async function uploadQr(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setQrUploading(true);
    const form = new FormData();
    form.set("qr", file);
    await fetch(`/api/admin/tournaments/${tournament.id}/payment-qr`, { method: "POST", body: form });
    setQrUploading(false);
    onSaved();
  }

  const fieldClass = "rounded-md premium-input px-3 py-2";

  return (
    <div className="mt-4 space-y-3 rounded-md border border-neutral-200 bg-neutral-50 p-4 dark:border-neutral-800 dark:bg-neutral-950/50">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <input value={title} onChange={(e) => setTitle(e.target.value)} className={fieldClass} placeholder="Title" />
        <input value={game} onChange={(e) => setGame(e.target.value)} className={fieldClass} placeholder="Game" />
      </div>
      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        rows={3}
        className={`w-full ${fieldClass}`}
        placeholder="Description"
      />
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <input value={prizePool} onChange={(e) => setPrizePool(e.target.value)} className={fieldClass} placeholder="Prize pool" />
        <input value={entryFee} onChange={(e) => setEntryFee(e.target.value)} type="number" className={fieldClass} placeholder="Entry fee" />
        <input value={hostingFee} onChange={(e) => setHostingFee(e.target.value)} type="number" className={fieldClass} placeholder="Hosting fee" />
        <input value={maxSlots} onChange={(e) => setMaxSlots(e.target.value)} type="number" className={fieldClass} placeholder="Max slots" />
      </div>

      <div>
        <label className="block text-xs font-bold uppercase tracking-wide text-neutral-500">
          Registration closes (blank = never auto-closes)
        </label>
        <input
          value={registrationDeadline}
          onChange={(e) => setRegistrationDeadline(e.target.value)}
          type="datetime-local"
          className={`mt-1 ${fieldClass}`}
        />
      </div>

      <div className="rounded-md border border-neutral-200 bg-white p-3 dark:border-neutral-800 dark:bg-neutral-900">
        <p className="text-xs font-bold uppercase tracking-wide text-neutral-500">
          Payment override (optional — falls back to the site-wide player UPI/QR if blank)
        </p>
        <div className="mt-2 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <input
            value={paymentUpiId}
            onChange={(e) => setPaymentUpiId(e.target.value)}
            className={fieldClass}
            placeholder="UPI ID for this tournament"
          />
          <div className="flex items-center gap-3">
            {tournament.paymentQrUrl && (
              // eslint-disable-next-line @next/next/no-img-element -- admin-uploaded QR image
              <img src={tournament.paymentQrUrl} alt="Payment QR" className="h-16 w-16 rounded-md border object-contain" />
            )}
            <label className="cursor-pointer text-sm font-medium text-orange-400 hover:underline">
              {qrUploading ? "Uploading..." : tournament.paymentQrUrl ? "Replace QR" : "Upload QR"}
              <input type="file" accept="image/png,image/jpeg,image/webp" className="hidden" onChange={uploadQr} />
            </label>
          </div>
        </div>
        <label className="mt-3 flex items-center gap-2 text-sm font-medium">
          <input
            type="checkbox"
            checked={allowGuestRegistration}
            onChange={(e) => setAllowGuestRegistration(e.target.checked)}
          />
          Allow no-login registration (public link — phone + squad UIDs only)
        </label>
      </div>

      <button
        onClick={save}
        disabled={saving}
        className="clip-corner-sm premium-btn px-4 py-2 text-sm font-bold uppercase tracking-wide"
      >
        {saving ? "Saving..." : "Save changes"}
      </button>
    </div>
  );
}
