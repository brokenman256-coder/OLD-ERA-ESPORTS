"use client";

import { useEffect, useState } from "react";

interface Settings {
  hostingFeeAmount: number;
  upiId: string | null;
  qrCodeUrl: string | null;
  playerUpiId: string | null;
  playerQrCodeUrl: string | null;
  whatsappLink: string | null;
  instagramUrl: string | null;
  displayLiveTournaments: number | null;
  displayPlayers: number | null;
  displayOrganizers: number | null;
}

export default function SettingsTab() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [hostingFeeAmount, setHostingFeeAmount] = useState("200");
  const [upiId, setUpiId] = useState("");
  const [playerUpiId, setPlayerUpiId] = useState("");
  const [whatsappLink, setWhatsappLink] = useState("");
  const [instagramUrl, setInstagramUrl] = useState("");
  const [displayLiveTournaments, setDisplayLiveTournaments] = useState("");
  const [displayPlayers, setDisplayPlayers] = useState("");
  const [displayOrganizers, setDisplayOrganizers] = useState("");
  const [saving, setSaving] = useState(false);
  const [qrUploading, setQrUploading] = useState(false);
  const [playerQrUploading, setPlayerQrUploading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function load() {
    const res = await fetch("/api/settings");
    const data = await res.json();
    setSettings(data.settings);
    setHostingFeeAmount(String(data.settings.hostingFeeAmount));
    setUpiId(data.settings.upiId ?? "");
    setPlayerUpiId(data.settings.playerUpiId ?? "");
    setWhatsappLink(data.settings.whatsappLink ?? "");
    setInstagramUrl(data.settings.instagramUrl ?? "");
    setDisplayLiveTournaments(data.settings.displayLiveTournaments?.toString() ?? "");
    setDisplayPlayers(data.settings.displayPlayers?.toString() ?? "");
    setDisplayOrganizers(data.settings.displayOrganizers?.toString() ?? "");
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- simple client-side data fetch on mount
    load();
  }, []);

  async function save() {
    setSaving(true);
    setMessage(null);
    const res = await fetch("/api/admin/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        hostingFeeAmount: Number(hostingFeeAmount),
        upiId,
        playerUpiId,
        whatsappLink,
        instagramUrl,
        displayLiveTournaments: displayLiveTournaments === "" ? null : Number(displayLiveTournaments),
        displayPlayers: displayPlayers === "" ? null : Number(displayPlayers),
        displayOrganizers: displayOrganizers === "" ? null : Number(displayOrganizers),
      }),
    });
    setSaving(false);
    if (res.ok) {
      setMessage("Saved.");
      load();
    } else {
      setMessage("Something went wrong.");
    }
  }

  async function uploadQr(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setQrUploading(true);
    const form = new FormData();
    form.set("qr", file);
    await fetch("/api/admin/settings/qr", { method: "POST", body: form });
    setQrUploading(false);
    load();
  }

  async function uploadPlayerQr(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setPlayerQrUploading(true);
    const form = new FormData();
    form.set("qr", file);
    await fetch("/api/admin/settings/qr-player", { method: "POST", body: form });
    setPlayerQrUploading(false);
    load();
  }

  async function clearField(field: "qrCodeUrl" | "playerQrCodeUrl") {
    await fetch("/api/admin/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ [field]: "" }),
    });
    load();
  }

  if (!settings) return <p className="text-neutral-500">Loading...</p>;

  return (
    <div className="max-w-xl space-y-6">
      <div className="rounded-lg border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900">
        <h3 className="font-bold">Organizer payment details (hosting fee)</h3>
        <p className="mt-1 text-sm text-neutral-500">
          Shown to organizers when they post a tournament, so they know what to pay and where.
        </p>

        <div className="mt-4 space-y-4">
          <div>
            <label className="block text-sm font-medium">Hosting fee amount (₹)</label>
            <input
              type="number"
              min="0"
              value={hostingFeeAmount}
              onChange={(e) => setHostingFeeAmount(e.target.value)}
              className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 dark:border-neutral-700 dark:bg-neutral-950"
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Organizer UPI ID</label>
            <input
              value={upiId}
              onChange={(e) => setUpiId(e.target.value)}
              placeholder="yourname@upi"
              className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 dark:border-neutral-700 dark:bg-neutral-950"
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Organizer payment QR code</label>
            {settings.qrCodeUrl && (
              <div className="mt-2 flex items-center gap-3">
                {/* eslint-disable-next-line @next/next/no-img-element -- admin-uploaded QR image */}
                <img src={settings.qrCodeUrl} alt="Organizer payment QR" className="h-32 w-32 rounded-md border border-neutral-200 object-contain dark:border-neutral-700" />
                <button type="button" onClick={() => clearField("qrCodeUrl")} className="text-sm text-red-600 hover:underline">
                  Remove
                </button>
              </div>
            )}
            <input
              type="file"
              accept="image/png,image/jpeg,image/webp"
              onChange={uploadQr}
              className="mt-2 w-full text-sm"
            />
            {qrUploading && <p className="mt-1 text-xs text-neutral-500">Uploading...</p>}
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900">
        <h3 className="font-bold">Player payment details (entry fee)</h3>
        <p className="mt-1 text-sm text-neutral-500">
          Shown to players when they register for a paid tournament.
        </p>

        <div className="mt-4 space-y-4">
          <div>
            <label className="block text-sm font-medium">Player UPI ID</label>
            <input
              value={playerUpiId}
              onChange={(e) => setPlayerUpiId(e.target.value)}
              placeholder="yourname@upi"
              className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 dark:border-neutral-700 dark:bg-neutral-950"
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Player payment QR code</label>
            {settings.playerQrCodeUrl && (
              <div className="mt-2 flex items-center gap-3">
                {/* eslint-disable-next-line @next/next/no-img-element -- admin-uploaded QR image */}
                <img src={settings.playerQrCodeUrl} alt="Player payment QR" className="h-32 w-32 rounded-md border border-neutral-200 object-contain dark:border-neutral-700" />
                <button type="button" onClick={() => clearField("playerQrCodeUrl")} className="text-sm text-red-600 hover:underline">
                  Remove
                </button>
              </div>
            )}
            <input
              type="file"
              accept="image/png,image/jpeg,image/webp"
              onChange={uploadPlayerQr}
              className="mt-2 w-full text-sm"
            />
            {playerQrUploading && <p className="mt-1 text-xs text-neutral-500">Uploading...</p>}
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900">
        <h3 className="font-bold">Social links</h3>
        <div className="mt-4 space-y-4">
          <div>
            <label className="block text-sm font-medium">WhatsApp link</label>
            <input
              value={whatsappLink}
              onChange={(e) => setWhatsappLink(e.target.value)}
              placeholder="https://wa.me/91..."
              className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 dark:border-neutral-700 dark:bg-neutral-950"
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Instagram link</label>
            <input
              value={instagramUrl}
              onChange={(e) => setInstagramUrl(e.target.value)}
              placeholder="https://instagram.com/..."
              className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 dark:border-neutral-700 dark:bg-neutral-950"
            />
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900">
        <h3 className="font-bold">Homepage stats override</h3>
        <p className="mt-1 text-sm text-neutral-500">
          Leave blank to show real counts. Set a number here to display something else instead
          (e.g. while the platform is new).
        </p>
        <div className="mt-4 grid grid-cols-3 gap-3">
          <div>
            <label className="block text-sm font-medium">Live tournaments</label>
            <input
              type="number"
              min="0"
              value={displayLiveTournaments}
              onChange={(e) => setDisplayLiveTournaments(e.target.value)}
              placeholder="auto"
              className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 dark:border-neutral-700 dark:bg-neutral-950"
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Players</label>
            <input
              type="number"
              min="0"
              value={displayPlayers}
              onChange={(e) => setDisplayPlayers(e.target.value)}
              placeholder="auto"
              className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 dark:border-neutral-700 dark:bg-neutral-950"
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Organizers</label>
            <input
              type="number"
              min="0"
              value={displayOrganizers}
              onChange={(e) => setDisplayOrganizers(e.target.value)}
              placeholder="auto"
              className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 dark:border-neutral-700 dark:bg-neutral-950"
            />
          </div>
        </div>
      </div>

      {message && <p className="text-sm text-green-600">{message}</p>}
      <button
        onClick={save}
        disabled={saving}
        className="rounded-md bg-red-600 px-4 py-2 font-semibold text-white hover:bg-red-500 disabled:opacity-50"
      >
        {saving ? "Saving..." : "Save settings"}
      </button>
    </div>
  );
}
