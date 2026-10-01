"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface Team {
  id: string;
  name: string;
  tag: string | null;
  members?: { name: string }[];
}

interface Settings {
  playerUpiId: string | null;
  playerQrCodeUrl: string | null;
}

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

const inputClass =
  "mt-1 w-full rounded-md premium-input px-3 py-2";

export default function RegisterForm({
  tournamentId,
  entryFee,
  payment,
}: {
  tournamentId: string;
  entryFee: number;
  payment?: TournamentPayment;
}) {
  const [teams, setTeams] = useState<Team[]>([]);
  const [teamId, setTeamId] = useState("");
  const [settings, setSettings] = useState<Settings | null>(null);
  const [squad, setSquad] = useState<SquadMember[]>(EMPTY_SQUAD);
  const [contactPhone, setContactPhone] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [utrNumber, setUtrNumber] = useState("");
  const [payerUpiId, setPayerUpiId] = useState("");
  const [walletBalance, setWalletBalance] = useState<number | null>(null);
  const [payWithWallet, setPayWithWallet] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetch("/api/teams")
      .then((res) => res.json())
      .then((data) => setTeams(data.teams ?? []))
      .catch(() => setTeams([]));
    fetch("/api/settings")
      .then((res) => res.json())
      .then((data) => setSettings(data.settings))
      .catch(() => setSettings(null));
    fetch("/api/wallet")
      .then((res) => res.json())
      .then((data) => setWalletBalance(typeof data.balance === "number" ? data.balance : null))
      .catch(() => setWalletBalance(null));
  }, []);

  function selectTeam(id: string) {
    setTeamId(id);
    const team = teams.find((t) => t.id === id);
    if (team?.members) {
      setSquad(
        Array.from({ length: 4 }, (_, i) => ({
          name: team.members?.[i]?.name ?? "",
          gameId: "",
          instagram: "",
          whatsapp: "",
        }))
      );
    }
  }

  function updateMember(index: number, field: keyof SquadMember, value: string) {
    setSquad((prev) => prev.map((m, i) => (i === index ? { ...m, [field]: value } : m)));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (entryFee > 0 && !payWithWallet && !file) {
      setError("Please upload a screenshot of your entry fee payment, or pay with your wallet.");
      return;
    }
    if (entryFee > 0 && !payWithWallet && !utrNumber.trim()) {
      setError("Please enter the UTR / transaction reference number for your payment.");
      return;
    }
    if (entryFee > 0 && !payWithWallet && !payerUpiId.trim()) {
      setError("Please enter the UPI ID you paid from.");
      return;
    }
    if (!contactPhone.trim()) {
      setError("A contact phone number is required.");
      return;
    }
    if (squad.some((m) => !m.name.trim() || !m.gameId.trim() || !m.instagram.trim() || !m.whatsapp.trim())) {
      setError("Please fill in the name, in-game ID, Instagram ID, and WhatsApp number for all 4 squad members.");
      return;
    }

    setLoading(true);
    const form = new FormData();
    if (teamId) form.set("teamId", teamId);
    form.set("contactPhone", contactPhone.trim());
    if (contactEmail.trim()) form.set("contactEmail", contactEmail.trim());
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
    if (payWithWallet) {
      form.set("payWithWallet", "true");
    } else {
      if (file) form.set("paymentProof", file);
      form.set("utrNumber", utrNumber.trim());
      form.set("payerUpiId", payerUpiId.trim());
    }

    const res = await fetch(`/api/tournaments/${tournamentId}/register`, {
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
    router.refresh();
  }

  if (done) {
    return (
      <div className="rounded-md border border-green-300 bg-green-50 p-4 text-green-800 dark:border-green-800 dark:bg-green-950 dark:text-green-300">
        <p className="font-semibold">
          Your registration is done! {entryFee > 0 && !payWithWallet && "Your payment is pending admin verification."}
        </p>
        <p className="mt-2 text-sm">
          The room ID, password, and any match link will be posted right here on this same page once
          it&apos;s ready — just revisit this link closer to match time. We&apos;ll also reach you by
          WhatsApp and email with updates.
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 glass-panel clip-corner p-6"
    >
      <h3 className="text-lg font-bold">Register for this tournament</h3>
      <p className="text-sm text-neutral-500">
        Every registration must list all 4 squad members and a contact number.
      </p>

      {teams.length > 0 && (
        <div>
          <label className="block text-sm font-medium">Prefill from a saved squad (optional)</label>
          <select value={teamId} onChange={(e) => selectTeam(e.target.value)} className={inputClass}>
            <option value="">Enter manually</option>
            {teams.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name} {t.tag ? `[${t.tag}]` : ""}
              </option>
            ))}
          </select>
          <p className="mt-1 text-xs text-neutral-500">
            Manage your squads on the{" "}
            <Link href="/teams" className="text-orange-400 hover:underline">
              Teams
            </Link>{" "}
            page.
          </p>
        </div>
      )}

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
        <label className="block text-sm font-medium">Contact phone number</label>
        <input
          type="tel"
          value={contactPhone}
          onChange={(e) => setContactPhone(e.target.value)}
          required
          className={inputClass}
        />
      </div>

      <div>
        <label className="block text-sm font-medium">Contact email (optional)</label>
        <input
          type="email"
          value={contactEmail}
          onChange={(e) => setContactEmail(e.target.value)}
          className={inputClass}
        />
      </div>

      {entryFee > 0 && (
        <div className="rounded-md border border-amber-300 bg-amber-50 p-4 dark:border-amber-800 dark:bg-amber-950">
          <p className="text-sm font-semibold text-amber-800 dark:text-amber-300">
            Entry fee: ₹{entryFee} — pay before submitting
          </p>

          {walletBalance !== null && walletBalance >= entryFee && (
            <label className="mt-3 flex items-center gap-2 text-sm text-amber-800 dark:text-amber-300">
              <input
                type="checkbox"
                checked={payWithWallet}
                onChange={(e) => setPayWithWallet(e.target.checked)}
              />
              Pay with wallet balance (₹{walletBalance} available) — instant confirmation
            </label>
          )}

          {!payWithWallet && (
            <>
              <div className="mt-2 flex flex-wrap items-center gap-4">
                {(payment?.paymentUpiId || settings?.playerUpiId) && (
                  <p className="text-sm text-amber-800 dark:text-amber-300">
                    UPI ID:{" "}
                    <span className="font-mono font-semibold">
                      {payment?.paymentUpiId || settings?.playerUpiId}
                    </span>
                  </p>
                )}
                {(payment?.paymentQrUrl || settings?.playerQrCodeUrl) && (
                  // eslint-disable-next-line @next/next/no-img-element -- admin-uploaded QR image
                  <img
                    src={payment?.paymentQrUrl || settings?.playerQrCodeUrl || undefined}
                    alt="Payment QR code"
                    className="h-24 w-24 rounded-md border border-amber-300 bg-white object-contain"
                  />
                )}
              </div>
              <label className="mt-3 block text-sm font-medium">
                Payment screenshot — required
              </label>
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
                Upload a screenshot of your ₹{entryFee} payment, enter the UTR number from your
                UPI app, and the UPI ID you paid from. Our admin will verify it manually before
                your registration is confirmed.
              </p>
            </>
          )}
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
