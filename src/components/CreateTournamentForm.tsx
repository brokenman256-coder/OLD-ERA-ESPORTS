"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { TOURNAMENT_FORMAT_LABELS } from "@/lib/constants";

const inputClass =
  "mt-1 w-full rounded-md premium-input px-3 py-2";

interface Settings {
  hostingFeeAmount: number;
  upiId: string | null;
  qrCodeUrl: string | null;
}

export default function CreateTournamentForm() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [proof, setProof] = useState<File | null>(null);
  const [banner, setBanner] = useState<File | null>(null);
  const [settings, setSettings] = useState<Settings | null>(null);
  const [walletBalance, setWalletBalance] = useState<number | null>(null);
  const [payWithWallet, setPayWithWallet] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetch("/api/settings")
      .then((res) => res.json())
      .then((data) => setSettings(data.settings))
      .catch(() => setSettings(null));
    fetch("/api/wallet")
      .then((res) => res.json())
      .then((data) => setWalletBalance(typeof data.balance === "number" ? data.balance : null))
      .catch(() => setWalletBalance(null));
  }, []);

  const hostingFee = settings?.hostingFeeAmount ?? 200;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    if (hostingFee > 0 && !payWithWallet && !proof) {
      setError("Please upload a screenshot of your hosting fee payment, or pay with your wallet.");
      return;
    }

    setLoading(true);
    const form = new FormData(e.currentTarget);
    if (payWithWallet) {
      form.set("payHostingFeeWithWallet", "true");
    } else if (proof) {
      form.set("hostingFeeProof", proof);
    }
    if (banner) form.set("banner", banner);

    const res = await fetch("/api/tournaments", { method: "POST", body: form });
    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error ?? "Something went wrong");
      return;
    }

    setOpen(false);
    router.refresh();
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="rounded-md bg-gradient-to-r from-red-600 to-red-800 px-4 py-2 font-semibold text-white shadow-md shadow-red-900/20 transition hover:from-red-500 hover:to-red-700"
      >
        + Post a new tournament
      </button>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 glass-panel clip-corner p-6"
    >
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold">Post a new tournament</h3>
        <button type="button" onClick={() => setOpen(false)} className="text-sm text-neutral-500">
          Cancel
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium">Title</label>
          <input name="title" required className={inputClass} />
        </div>
        <div>
          <label className="block text-sm font-medium">Game</label>
          <input name="game" required className={inputClass} />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium">Cover banner (optional)</label>
        <input
          type="file"
          accept="image/png,image/jpeg,image/webp"
          onChange={(e) => setBanner(e.target.files?.[0] ?? null)}
          className="mt-1 w-full text-sm"
        />
        <p className="mt-1 text-xs text-neutral-500">A wide image shown at the top of your tournament page and its card.</p>
      </div>

      <div>
        <label className="block text-sm font-medium">Description</label>
        <textarea name="description" required rows={4} className={inputClass} />
      </div>

      <div>
        <label className="block text-sm font-medium">Rules (optional)</label>
        <textarea name="rules" rows={3} className={inputClass} />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium">Tags (comma-separated)</label>
          <input name="tags" placeholder="ranked, 5v5, community" className={inputClass} />
        </div>
        <div>
          <label className="block text-sm font-medium">Format</label>
          <select name="format" defaultValue="SINGLE_ELIMINATION" className={inputClass}>
            {Object.entries(TOURNAMENT_FORMAT_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium">Discord invite (optional)</label>
          <input name="discordUrl" placeholder="https://discord.gg/..." className={inputClass} />
        </div>
        <div>
          <label className="block text-sm font-medium">Stream URL (optional)</label>
          <input name="streamUrl" placeholder="https://twitch.tv/..." className={inputClass} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        <div>
          <label className="block text-sm font-medium">Prize pool</label>
          <input name="prizePool" className={inputClass} placeholder="₹10,000" />
        </div>
        <div>
          <label className="block text-sm font-medium">Entry fee (₹)</label>
          <input name="entryFee" type="number" min="0" step="1" defaultValue="0" className={inputClass} />
        </div>
        <div>
          <label className="block text-sm font-medium">Max slots</label>
          <input name="maxSlots" type="number" min="1" className={inputClass} />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium">Start date</label>
          <input name="startDate" type="datetime-local" required className={inputClass} />
        </div>
        <div>
          <label className="block text-sm font-medium">End date (optional)</label>
          <input name="endDate" type="datetime-local" className={inputClass} />
        </div>
      </div>

      {hostingFee > 0 && (
        <div className="rounded-md border border-amber-300 bg-amber-50 p-4 dark:border-amber-800 dark:bg-amber-950">
          <p className="text-sm font-semibold text-amber-800 dark:text-amber-300">
            Hosting fee: ₹{hostingFee} — pay before submitting
          </p>

          {walletBalance !== null && walletBalance >= hostingFee && (
            <label className="mt-3 flex items-center gap-2 text-sm text-amber-800 dark:text-amber-300">
              <input
                type="checkbox"
                checked={payWithWallet}
                onChange={(e) => setPayWithWallet(e.target.checked)}
              />
              Pay with wallet balance (₹{walletBalance} available) — no screenshot needed
            </label>
          )}

          {!payWithWallet && (
            <>
              <div className="mt-2 flex flex-wrap items-center gap-4">
                {settings?.upiId && (
                  <p className="text-sm text-amber-800 dark:text-amber-300">
                    UPI ID: <span className="font-mono font-semibold">{settings.upiId}</span>
                  </p>
                )}
                {settings?.qrCodeUrl && (
                  // eslint-disable-next-line @next/next/no-img-element -- admin-uploaded QR image
                  <img src={settings.qrCodeUrl} alt="Payment QR code" className="h-24 w-24 rounded-md border border-amber-300 bg-white object-contain" />
                )}
              </div>
              <label className="mt-3 block text-sm font-medium">
                Payment screenshot — required
              </label>
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp"
                onChange={(e) => setProof(e.target.files?.[0] ?? null)}
                className="mt-1 w-full text-sm"
              />
              <p className="mt-1 text-xs text-amber-700 dark:text-amber-400">
                Upload your payment screenshot; an admin will manually verify it and approve your listing.
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
        {loading ? "Submitting..." : "Submit for review"}
      </button>
    </form>
  );
}
