"use client";

import { useState } from "react";

interface TournamentPayment {
  paymentUpiId?: string | null;
  paymentQrUrl?: string | null;
}

interface SquadMember {
  name: string;
  gameId: string;
  instagram: string;
  whatsapp: string;
}

const EMPTY_SQUAD: SquadMember[] = [
  { name: "", gameId: "", instagram: "", whatsapp: "" },
  { name: "", gameId: "", instagram: "", whatsapp: "" },
  { name: "", gameId: "", instagram: "", whatsapp: "" },
  { name: "", gameId: "", instagram: "", whatsapp: "" },
];

const inputClass = "mt-1 w-full rounded-md premium-input px-3 py-2";

export default function GuestRegisterForm({
  tournamentId,
  entryFee,
  payment,
}: {
  tournamentId: string;
  entryFee: number;
  payment?: TournamentPayment;
}) {
  const [teamName, setTeamName] = useState("");
  const [squad, setSquad] = useState<SquadMember[]>(EMPTY_SQUAD);
  const [contactPhone, setContactPhone] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [instagramHandle, setInstagramHandle] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [utrNumber, setUtrNumber] = useState("");
  const [payerUpiId, setPayerUpiId] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  function updateMember(index: number, field: keyof SquadMember, value: string) {
    setSquad((prev) => prev.map((m, i) => (i === index ? { ...m, [field]: value } : m)));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!contactPhone.trim()) {
      setError("A contact phone number is required.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactEmail.trim())) {
      setError("A valid contact email is required.");
      return;
    }
    if (squad.some((m) => !m.name.trim() || !m.gameId.trim() || !m.instagram.trim() || !m.whatsapp.trim())) {
      setError("Please fill in the name, in-game ID, Instagram ID, and WhatsApp number for all 4 squad members.");
      return;
    }
    if (entryFee > 0 && !file) {
      setError("Please upload a screenshot of your entry fee payment.");
      return;
    }
    if (entryFee > 0 && !utrNumber.trim()) {
      setError("Please enter the UTR / transaction reference number for your payment.");
      return;
    }
    if (entryFee > 0 && !payerUpiId.trim()) {
      setError("Please enter the UPI ID you paid from.");
      return;
    }

    setLoading(true);
    const form = new FormData();
    if (teamName.trim()) form.set("teamName", teamName.trim());
    form.set("contactPhone", contactPhone.trim());
    form.set("contactEmail", contactEmail.trim());
    if (instagramHandle.trim()) form.set("instagramHandle", instagramHandle.trim());
    form.set(
      "squadMembers",
      JSON.stringify(
        squad.map((m) => ({
          name: m.name.trim(),
          gameId: m.gameId.trim(),
          instagram: m.instagram.trim(),
          whatsapp: m.whatsapp.trim(),
        }))
      )
    );
    if (file) form.set("paymentProof", file);
    if (utrNumber.trim()) form.set("utrNumber", utrNumber.trim());
    if (payerUpiId.trim()) form.set("payerUpiId", payerUpiId.trim());

    const res = await fetch(`/api/tournaments/${tournamentId}/guest-register`, {
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
  }

  if (done) {
    return (
      <div className="rounded-md border border-green-300 bg-green-50 p-4 text-green-800 dark:border-green-800 dark:bg-green-950 dark:text-green-300">
        You&apos;re registered! {entryFee > 0
          ? "Your payment is pending admin verification — we'll reach out on the phone number you gave if anything's missing."
          : "Your spot is confirmed."}
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 glass-panel clip-corner p-6">
      <h3 className="text-lg font-bold">Register for this tournament</h3>
      <p className="text-sm text-neutral-500">
        No account needed — just fill this in. Every registration must list all 4 squad members
        with each player&apos;s WhatsApp number and Instagram ID, plus a team email.
      </p>

      <div>
        <label className="block text-sm font-medium">Team name (optional)</label>
        <input value={teamName} onChange={(e) => setTeamName(e.target.value)} className={inputClass} />
      </div>

      <div className="space-y-4">
        <label className="block text-sm font-medium">Squad — all 4 players required</label>
        {squad.map((member, i) => (
          <div key={i} className="space-y-2 rounded-md border border-white/10 p-3">
            <p className="text-xs font-bold uppercase tracking-wide text-neutral-500">Player {i + 1}</p>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <input
                value={member.name}
                onChange={(e) => updateMember(i, "name", e.target.value)}
                placeholder="Name"
                required
                className={inputClass}
              />
              <input
                value={member.gameId}
                onChange={(e) => updateMember(i, "gameId", e.target.value)}
                placeholder="In-game UID"
                required
                className={inputClass}
              />
              <input
                value={member.whatsapp}
                onChange={(e) => updateMember(i, "whatsapp", e.target.value)}
                placeholder="WhatsApp number"
                type="tel"
                required
                className={inputClass}
              />
              <input
                value={member.instagram}
                onChange={(e) => updateMember(i, "instagram", e.target.value)}
                placeholder="Instagram ID"
                required
                className={inputClass}
              />
            </div>
          </div>
        ))}
      </div>

      <div>
        <label className="block text-sm font-medium">Team contact WhatsApp number</label>
        <input
          type="tel"
          value={contactPhone}
          onChange={(e) => setContactPhone(e.target.value)}
          required
          className={inputClass}
        />
        <p className="mt-1 text-xs text-neutral-500">We&apos;ll reach you here with match info and your room ID.</p>
      </div>

      <div>
        <label className="block text-sm font-medium">Contact email</label>
        <input
          type="email"
          value={contactEmail}
          onChange={(e) => setContactEmail(e.target.value)}
          required
          className={inputClass}
        />
      </div>

      <div>
        <label className="block text-sm font-medium">Team / page Instagram (optional)</label>
        <input
          value={instagramHandle}
          onChange={(e) => setInstagramHandle(e.target.value)}
          placeholder="@yourusername"
          className={inputClass}
        />
      </div>

      {entryFee > 0 && (
        <div className="rounded-md border border-amber-300 bg-amber-50 p-4 dark:border-amber-800 dark:bg-amber-950">
          <p className="text-sm font-semibold text-amber-800 dark:text-amber-300">
            Entry fee: ₹{entryFee} — pay before submitting
          </p>

          <div className="mt-2 flex flex-wrap items-center gap-4">
            {payment?.paymentUpiId && (
              <p className="text-sm text-amber-800 dark:text-amber-300">
                UPI ID: <span className="font-mono font-semibold">{payment.paymentUpiId}</span>
              </p>
            )}
            {payment?.paymentQrUrl && (
              // eslint-disable-next-line @next/next/no-img-element -- admin-uploaded QR image
              <img
                src={payment.paymentQrUrl}
                alt="Payment QR code"
                className="h-24 w-24 rounded-md border border-amber-300 bg-white object-contain"
              />
            )}
          </div>

          <label className="mt-3 block text-sm font-medium">Payment screenshot — required</label>
          <input
            type="file"
            accept="image/png,image/jpeg,image/webp"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            className="mt-1 w-full text-sm"
          />

          <label className="mt-3 block text-sm font-medium">
            UTR / transaction reference number — required
          </label>
          <input
            value={utrNumber}
            onChange={(e) => setUtrNumber(e.target.value)}
            placeholder="e.g. 123456789012"
            className={inputClass}
          />

          <label className="mt-3 block text-sm font-medium">Your UPI ID (the one you paid from) — required</label>
          <input
            value={payerUpiId}
            onChange={(e) => setPayerUpiId(e.target.value)}
            placeholder="yourname@upi"
            className={inputClass}
          />

          <p className="mt-1 text-xs text-amber-700 dark:text-amber-400">
            Upload a screenshot of your ₹{entryFee} payment, enter the UTR number from your UPI
            app, and the UPI ID you paid from. Our admin will verify it manually before your
            registration is confirmed.
          </p>
        </div>
      )}

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button
        disabled={loading}
        className="w-full rounded-md bg-gradient-to-r from-red-600 to-red-800 px-4 py-2 font-semibold text-white shadow-md shadow-red-900/20 transition hover:from-red-500 hover:to-red-700 disabled:opacity-50"
      >
        {loading ? "Submitting..." : "Register"}
      </button>
    </form>
  );
}
