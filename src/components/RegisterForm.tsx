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

interface SquadMember {
  name: string;
  gameId: string;
}

const EMPTY_SQUAD: SquadMember[] = [
  { name: "", gameId: "" },
  { name: "", gameId: "" },
  { name: "", gameId: "" },
  { name: "", gameId: "" },
];

const inputClass =
  "mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 dark:border-neutral-700 dark:bg-neutral-950";

export default function RegisterForm({
  tournamentId,
  entryFee,
}: {
  tournamentId: string;
  entryFee: number;
}) {
  const [teams, setTeams] = useState<Team[]>([]);
  const [teamId, setTeamId] = useState("");
  const [settings, setSettings] = useState<Settings | null>(null);
  const [squad, setSquad] = useState<SquadMember[]>(EMPTY_SQUAD);
  const [contactPhone, setContactPhone] = useState("");
  const [file, setFile] = useState<File | null>(null);
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
    if (!contactPhone.trim()) {
      setError("A contact phone number is required.");
      return;
    }
    if (squad.some((m) => !m.name.trim() || !m.gameId.trim())) {
      setError("Please fill in the name and in-game ID for all 4 squad members.");
      return;
    }

    setLoading(true);
    const form = new FormData();
    if (teamId) form.set("teamId", teamId);
    form.set("contactPhone", contactPhone.trim());
    form.set("squadMembers", JSON.stringify(squad.map((m) => ({ name: m.name.trim(), gameId: m.gameId.trim() }))));
    if (payWithWallet) {
      form.set("payWithWallet", "true");
    } else if (file) {
      form.set("paymentProof", file);
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
        You&apos;re registered! {entryFee > 0 && !payWithWallet
          ? "Your payment screenshot is pending admin verification."
          : "Your spot is confirmed."}
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 rounded-lg border border-neutral-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-900"
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
            <Link href="/teams" className="text-red-600 hover:underline">
              Teams
            </Link>{" "}
            page.
          </p>
        </div>
      )}

      <div className="space-y-3">
        <label className="block text-sm font-medium">Squad — all 4 players required</label>
        {squad.map((member, i) => (
          <div key={i} className="grid grid-cols-2 gap-3">
            <input
              value={member.name}
              onChange={(e) => updateMember(i, "name", e.target.value)}
              placeholder={`Player ${i + 1} name`}
              required
              className={inputClass}
            />
            <input
              value={member.gameId}
              onChange={(e) => updateMember(i, "gameId", e.target.value)}
              placeholder={`Player ${i + 1} in-game ID`}
              required
              className={inputClass}
            />
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
                {settings?.playerUpiId && (
                  <p className="text-sm text-amber-800 dark:text-amber-300">
                    UPI ID: <span className="font-mono font-semibold">{settings.playerUpiId}</span>
                  </p>
                )}
                {settings?.playerQrCodeUrl && (
                  // eslint-disable-next-line @next/next/no-img-element -- admin-uploaded QR image
                  <img src={settings.playerQrCodeUrl} alt="Payment QR code" className="h-24 w-24 rounded-md border border-amber-300 bg-white object-contain" />
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
              <p className="mt-1 text-xs text-amber-700 dark:text-amber-400">
                Upload a screenshot of your ₹{entryFee} payment. Our admin will verify it
                manually before your registration is confirmed.
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
