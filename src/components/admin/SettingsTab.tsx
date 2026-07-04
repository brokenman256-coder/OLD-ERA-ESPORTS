"use client";

import { useEffect, useState } from "react";

interface Settings {
  hostingFeeAmount: number;
  upiId: string | null;
  qrCodeUrl: string | null;
  whatsappLink: string | null;
  instagramUrl: string | null;
}

export default function SettingsTab() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [hostingFeeAmount, setHostingFeeAmount] = useState("200");
  const [upiId, setUpiId] = useState("");
  const [whatsappLink, setWhatsappLink] = useState("");
  const [instagramUrl, setInstagramUrl] = useState("");
  const [saving, setSaving] = useState(false);
  const [qrUploading, setQrUploading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function load() {
    const res = await fetch("/api/settings");
    const data = await res.json();
    setSettings(data.settings);
    setHostingFeeAmount(String(data.settings.hostingFeeAmount));
    setUpiId(data.settings.upiId ?? "");
    setWhatsappLink(data.settings.whatsappLink ?? "");
    setInstagramUrl(data.settings.instagramUrl ?? "");
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
        whatsappLink,
        instagramUrl,
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

  if (!settings) return <p className="text-neutral-500">Loading...</p>;

  return (
    <div className="max-w-xl space-y-6">
      <div className="rounded-lg border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900">
        <h3 className="font-bold">Hosting fee & payment details</h3>
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
            <label className="block text-sm font-medium">UPI ID</label>
            <input
              value={upiId}
              onChange={(e) => setUpiId(e.target.value)}
              placeholder="yourname@upi"
              className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 dark:border-neutral-700 dark:bg-neutral-950"
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Payment QR code</label>
            {settings.qrCodeUrl && (
              // eslint-disable-next-line @next/next/no-img-element -- admin-uploaded QR image
              <img src={settings.qrCodeUrl} alt="Payment QR" className="mt-2 h-32 w-32 rounded-md border border-neutral-200 object-contain dark:border-neutral-700" />
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
