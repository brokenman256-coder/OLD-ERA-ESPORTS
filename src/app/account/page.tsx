"use client";

import { useEffect, useState } from "react";
import Avatar from "@/components/Avatar";

interface Me {
  id: string;
  name: string;
  email: string;
  role: string;
  firmName: string | null;
  avatarUrl: string | null;
  bio: string | null;
  discordHandle: string | null;
  twitterUrl: string | null;
  websiteUrl: string | null;
  gmail: string | null;
  gameUid: string | null;
  defaultSquad: { name: string; gameId: string; instagram: string; whatsapp: string }[] | null;
  organizerUpiId: string | null;
  organizerQrUrl: string | null;
  emailVerified: boolean;
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

export default function AccountPage() {
  const [me, setMe] = useState<Me | null>(null);

  const [name, setName] = useState("");
  const [firmName, setFirmName] = useState("");
  const [bio, setBio] = useState("");
  const [discordHandle, setDiscordHandle] = useState("");
  const [twitterUrl, setTwitterUrl] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [gmail, setGmail] = useState("");
  const [gameUid, setGameUid] = useState("");
  const [profileMsg, setProfileMsg] = useState<{ type: "error" | "success"; text: string } | null>(null);
  const [profileSaving, setProfileSaving] = useState(false);

  const [avatarUploading, setAvatarUploading] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [pwMessage, setPwMessage] = useState<{ type: "error" | "success"; text: string } | null>(null);
  const [pwLoading, setPwLoading] = useState(false);

  const [squad, setSquad] = useState<SquadMember[]>(EMPTY_SQUAD);
  const [squadMsg, setSquadMsg] = useState<{ type: "error" | "success"; text: string } | null>(null);
  const [squadSaving, setSquadSaving] = useState(false);

  const [organizerUpiId, setOrganizerUpiId] = useState("");
  const [organizerQrUrl, setOrganizerQrUrl] = useState<string | null>(null);
  const [organizerQrUploading, setOrganizerQrUploading] = useState(false);
  const [paymentMsg, setPaymentMsg] = useState<{ type: "error" | "success"; text: string } | null>(null);
  const [paymentSaving, setPaymentSaving] = useState(false);

  const [otpEnabled, setOtpEnabled] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [otpMessage, setOtpMessage] = useState<{ type: "error" | "success"; text: string } | null>(null);
  const [otpLoading, setOtpLoading] = useState(false);

  useEffect(() => {
    fetch("/api/me")
      .then((res) => res.json())
      .then((data) => {
        if (!data.user) return;
        setMe(data.user);
        setName(data.user.name ?? "");
        setFirmName(data.user.firmName ?? "");
        setBio(data.user.bio ?? "");
        setDiscordHandle(data.user.discordHandle ?? "");
        setTwitterUrl(data.user.twitterUrl ?? "");
        setWebsiteUrl(data.user.websiteUrl ?? "");
        setGmail(data.user.gmail ?? "");
        setGameUid(data.user.gameUid ?? "");
        if (Array.isArray(data.user.defaultSquad) && data.user.defaultSquad.length === 4) {
          setSquad(data.user.defaultSquad);
        }
        setOrganizerUpiId(data.user.organizerUpiId ?? "");
        setOrganizerQrUrl(data.user.organizerQrUrl ?? null);
      });
    fetch("/api/settings")
      .then((res) => res.json())
      .then((data) => setOtpEnabled(Boolean(data.settings?.otpEnabled)))
      .catch(() => setOtpEnabled(false));
  }, []);

  async function requestOtp() {
    setOtpMessage(null);
    setOtpLoading(true);
    const res = await fetch("/api/auth/otp/request", { method: "POST" });
    const data = await res.json();
    setOtpLoading(false);
    if (!res.ok) {
      setOtpMessage({ type: "error", text: data.error ?? "Something went wrong" });
      return;
    }
    setOtpSent(true);
    setOtpMessage({ type: "success", text: "Code sent — check your email." });
  }

  async function verifyOtp(e: React.FormEvent) {
    e.preventDefault();
    setOtpMessage(null);
    setOtpLoading(true);
    const res = await fetch("/api/auth/otp/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code: otpCode }),
    });
    const data = await res.json();
    setOtpLoading(false);
    if (!res.ok) {
      setOtpMessage({ type: "error", text: data.error ?? "Something went wrong" });
      return;
    }
    setMe((prev) => (prev ? { ...prev, emailVerified: true } : prev));
    setOtpMessage({ type: "success", text: "Email verified!" });
  }

  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarUploading(true);
    const form = new FormData();
    form.set("avatar", file);
    const res = await fetch("/api/me/avatar", { method: "POST", body: form });
    const data = await res.json();
    setAvatarUploading(false);
    if (res.ok) {
      setMe((prev) => (prev ? { ...prev, avatarUrl: data.avatarUrl } : prev));
    }
  }

  function updateSquadMember(index: number, field: keyof SquadMember, value: string) {
    setSquad((prev) => prev.map((m, i) => (i === index ? { ...m, [field]: value } : m)));
  }

  async function handleSquadSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSquadMsg(null);
    setSquadSaving(true);
    const res = await fetch("/api/me/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ defaultSquad: squad }),
    });
    const data = await res.json();
    setSquadSaving(false);
    if (!res.ok) {
      setSquadMsg({ type: "error", text: data.error ?? "Something went wrong" });
      return;
    }
    setSquadMsg({ type: "success", text: "Squad saved — it'll auto-fill your next registration." });
  }

  async function handlePaymentSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPaymentMsg(null);
    setPaymentSaving(true);
    const res = await fetch("/api/me/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ organizerUpiId }),
    });
    const data = await res.json();
    setPaymentSaving(false);
    if (!res.ok) {
      setPaymentMsg({ type: "error", text: data.error ?? "Something went wrong" });
      return;
    }
    setPaymentMsg({ type: "success", text: "Payment details saved." });
  }

  async function handleOrganizerQrChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setOrganizerQrUploading(true);
    const form = new FormData();
    form.set("qr", file);
    const res = await fetch("/api/me/organizer-qr", { method: "POST", body: form });
    const data = await res.json();
    setOrganizerQrUploading(false);
    if (res.ok) setOrganizerQrUrl(data.organizerQrUrl);
  }

  async function handleProfileSubmit(e: React.FormEvent) {
    e.preventDefault();
    setProfileMsg(null);
    setProfileSaving(true);

    const res = await fetch("/api/me/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, firmName, bio, discordHandle, twitterUrl, websiteUrl, gmail, gameUid }),
    });
    const data = await res.json();
    setProfileSaving(false);

    if (!res.ok) {
      setProfileMsg({ type: "error", text: data.error ?? "Something went wrong" });
      return;
    }
    setMe(data.user);
    setProfileMsg({ type: "success", text: "Profile updated." });
  }

  async function handlePasswordSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPwMessage(null);
    setPwLoading(true);

    const res = await fetch("/api/me", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ currentPassword, newPassword }),
    });
    const data = await res.json();
    setPwLoading(false);

    if (!res.ok) {
      setPwMessage({ type: "error", text: data.error ?? "Something went wrong" });
      return;
    }

    setCurrentPassword("");
    setNewPassword("");
    setPwMessage({ type: "success", text: "Password updated." });
  }

  if (!me) return null;

  return (
    <div className="mx-auto max-w-lg px-6 py-16">
      <h1 className="section-title text-2xl font-black uppercase tracking-wide">Account settings</h1>

      <div className="mt-6 flex items-center gap-4">
        <Avatar name={me.firmName || me.name} src={me.avatarUrl} size={64} />
        <label className="cursor-pointer text-sm font-medium text-orange-400 hover:underline">
          {avatarUploading ? "Uploading..." : "Change avatar"}
          <input type="file" accept="image/png,image/jpeg,image/webp" className="hidden" onChange={handleAvatarChange} />
        </label>
      </div>

      <form onSubmit={handleProfileSubmit} className="mt-6 space-y-4 rounded-lg border border-neutral-200 p-5 dark:border-neutral-800">
        <h2 className="font-bold">Profile</h2>
        <div>
          <label className="block text-sm font-medium">Name</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 w-full rounded-md premium-input px-3 py-2"
          />
        </div>
        {me.role === "ORGANIZER" && (
          <div>
            <label className="block text-sm font-medium">Firm / company name</label>
            <input
              value={firmName}
              onChange={(e) => setFirmName(e.target.value)}
              className="mt-1 w-full rounded-md premium-input px-3 py-2"
            />
          </div>
        )}
        <div>
          <label className="block text-sm font-medium">Bio</label>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows={3}
            className="mt-1 w-full rounded-md premium-input px-3 py-2"
          />
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium">Discord handle</label>
            <input
              value={discordHandle}
              onChange={(e) => setDiscordHandle(e.target.value)}
              placeholder="username"
              className="mt-1 w-full rounded-md premium-input px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Twitter/X URL</label>
            <input
              value={twitterUrl}
              onChange={(e) => setTwitterUrl(e.target.value)}
              placeholder="https://x.com/..."
              className="mt-1 w-full rounded-md premium-input px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Gmail address</label>
            <input
              type="email"
              value={gmail}
              onChange={(e) => setGmail(e.target.value)}
              placeholder="you@gmail.com"
              className="mt-1 w-full rounded-md premium-input px-3 py-2"
            />
            <p className="mt-1 text-xs text-neutral-500">Shown on your public profile so others can reach you.</p>
          </div>
        </div>
        {me.role === "PLAYER" && (
          <div>
            <label className="block text-sm font-medium">BGMI UID</label>
            <input
              value={gameUid}
              onChange={(e) => setGameUid(e.target.value)}
              placeholder="e.g. 5123456789"
              className="mt-1 w-full rounded-md premium-input px-3 py-2"
            />
            <p className="mt-1 text-xs text-neutral-500">Shown on your public profile to verify it&apos;s really you.</p>
          </div>
        )}
        {me.role === "ORGANIZER" && (
          <div>
            <label className="block text-sm font-medium">Website URL</label>
            <input
              value={websiteUrl}
              onChange={(e) => setWebsiteUrl(e.target.value)}
              placeholder="https://..."
              className="mt-1 w-full rounded-md premium-input px-3 py-2"
            />
          </div>
        )}
        {profileMsg && (
          <p className={`text-sm ${profileMsg.type === "error" ? "text-red-600" : "text-green-600"}`}>{profileMsg.text}</p>
        )}
        <button
          disabled={profileSaving}
          className="w-full clip-corner-sm premium-btn px-4 py-2 font-bold uppercase tracking-wide"
        >
          {profileSaving ? "Saving..." : "Save profile"}
        </button>
      </form>

      {me.role === "PLAYER" && (
        <form onSubmit={handleSquadSubmit} className="mt-6 space-y-4 rounded-lg border border-neutral-200 p-5 dark:border-neutral-800">
          <h2 className="font-bold">Your squad</h2>
          <p className="text-sm text-neutral-500">
            Save this once and it auto-fills every tournament registration you make.
          </p>
          <div className="space-y-3">
            {squad.map((member, i) => (
              <div key={i} className="space-y-2 rounded-md border border-neutral-200 p-3 dark:border-neutral-800">
                <p className="text-xs font-bold uppercase tracking-wide text-neutral-500">Player {i + 1}</p>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  <input
                    value={member.name}
                    onChange={(e) => updateSquadMember(i, "name", e.target.value)}
                    placeholder="Name"
                    required
                    className="rounded-md premium-input px-3 py-2 text-sm"
                  />
                  <input
                    value={member.gameId}
                    onChange={(e) => updateSquadMember(i, "gameId", e.target.value)}
                    placeholder="In-game UID"
                    required
                    className="rounded-md premium-input px-3 py-2 text-sm"
                  />
                  <input
                    value={member.whatsapp}
                    onChange={(e) => updateSquadMember(i, "whatsapp", e.target.value)}
                    placeholder="WhatsApp number"
                    type="tel"
                    required
                    className="rounded-md premium-input px-3 py-2 text-sm"
                  />
                  <input
                    value={member.instagram}
                    onChange={(e) => updateSquadMember(i, "instagram", e.target.value)}
                    placeholder="Instagram ID"
                    required
                    className="rounded-md premium-input px-3 py-2 text-sm"
                  />
                </div>
              </div>
            ))}
          </div>
          {squadMsg && (
            <p className={`text-sm ${squadMsg.type === "error" ? "text-red-600" : "text-green-600"}`}>{squadMsg.text}</p>
          )}
          <button
            disabled={squadSaving}
            className="w-full clip-corner-sm premium-btn px-4 py-2 font-bold uppercase tracking-wide"
          >
            {squadSaving ? "Saving..." : "Save squad"}
          </button>
        </form>
      )}

      {me.role === "ORGANIZER" && (
        <form onSubmit={handlePaymentSubmit} className="mt-6 space-y-4 rounded-lg border border-neutral-200 p-5 dark:border-neutral-800">
          <h2 className="font-bold">Payment details</h2>
          <p className="text-sm text-neutral-500">
            Shown to players on your tournaments unless you set a different UPI ID/QR for a specific one.
          </p>
          <p className="rounded-md border border-amber-400/30 bg-amber-400/5 p-3 text-xs text-amber-300">
            Vantix keeps a 5% commission from each paid team registration — the remaining 95% is
            credited to your wallet once a payment is verified.
          </p>
          <div>
            <label className="block text-sm font-medium">UPI ID</label>
            <input
              value={organizerUpiId}
              onChange={(e) => setOrganizerUpiId(e.target.value)}
              placeholder="yourname@upi"
              className="mt-1 w-full rounded-md premium-input px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Payment QR code</label>
            {organizerQrUrl && (
              <div className="mt-2 flex items-center gap-3">
                {/* eslint-disable-next-line @next/next/no-img-element -- admin-uploaded QR image */}
                <img src={organizerQrUrl} alt="Payment QR" className="h-24 w-24 rounded-md border object-contain" />
              </div>
            )}
            <input
              type="file"
              accept="image/png,image/jpeg,image/webp"
              onChange={handleOrganizerQrChange}
              className="mt-2 w-full text-sm"
            />
            {organizerQrUploading && <p className="mt-1 text-xs text-neutral-500">Uploading...</p>}
          </div>
          {paymentMsg && (
            <p className={`text-sm ${paymentMsg.type === "error" ? "text-red-600" : "text-green-600"}`}>{paymentMsg.text}</p>
          )}
          <button
            disabled={paymentSaving}
            className="w-full clip-corner-sm premium-btn px-4 py-2 font-bold uppercase tracking-wide"
          >
            {paymentSaving ? "Saving..." : "Save payment details"}
          </button>
        </form>
      )}

      <form onSubmit={handlePasswordSubmit} className="mt-6 space-y-4 rounded-lg border border-neutral-200 p-5 dark:border-neutral-800">
        <h2 className="font-bold">Password</h2>
        <div>
          <label className="block text-sm font-medium">Current password</label>
          <input
            type="password"
            required
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            className="mt-1 w-full rounded-md premium-input px-3 py-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">New password</label>
          <input
            type="password"
            required
            minLength={8}
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="mt-1 w-full rounded-md premium-input px-3 py-2"
          />
        </div>
        {pwMessage && (
          <p className={`text-sm ${pwMessage.type === "error" ? "text-red-600" : "text-green-600"}`}>{pwMessage.text}</p>
        )}
        <button
          disabled={pwLoading}
          className="w-full clip-corner-sm premium-btn px-4 py-2 font-bold uppercase tracking-wide"
        >
          {pwLoading ? "Saving..." : "Update password"}
        </button>
      </form>

      {otpEnabled && (
        <div className="mt-6 space-y-4 rounded-lg border border-neutral-200 p-5 dark:border-neutral-800">
          <h2 className="font-bold">Email verification</h2>
          {me.emailVerified ? (
            <p className="text-sm text-green-500">✓ Your email ({me.email}) is verified.</p>
          ) : (
            <>
              <p className="text-sm text-neutral-500">
                Verify {me.email} with a one-time code so we know it&apos;s really you.
              </p>
              {!otpSent ? (
                <button
                  type="button"
                  onClick={requestOtp}
                  disabled={otpLoading}
                  className="clip-corner-sm premium-btn px-4 py-2 text-sm font-bold uppercase tracking-wide"
                >
                  {otpLoading ? "Sending..." : "Send verification code"}
                </button>
              ) : (
                <form onSubmit={verifyOtp} className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium">6-digit code</label>
                    <input
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value)}
                      inputMode="numeric"
                      pattern="\d{6}"
                      maxLength={6}
                      required
                      className="mt-1 w-full rounded-md premium-input px-3 py-2 tracking-[0.3em]"
                      placeholder="000000"
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      disabled={otpLoading}
                      className="clip-corner-sm premium-btn px-4 py-2 text-sm font-bold uppercase tracking-wide"
                    >
                      {otpLoading ? "Verifying..." : "Verify"}
                    </button>
                    <button
                      type="button"
                      onClick={requestOtp}
                      disabled={otpLoading}
                      className="rounded-md border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-neutral-300 hover:bg-white/10"
                    >
                      Resend code
                    </button>
                  </div>
                </form>
              )}
              {otpMessage && (
                <p className={`text-sm ${otpMessage.type === "error" ? "text-red-600" : "text-green-600"}`}>
                  {otpMessage.text}
                </p>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
