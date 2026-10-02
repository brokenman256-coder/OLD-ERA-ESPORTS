"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

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

const inputClass = "mt-1.5 w-full rounded-md premium-input px-3 py-2";

export default function RegisterPage() {
  const [role, setRole] = useState<"PLAYER" | "ORGANIZER">("PLAYER");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firmName, setFirmName] = useState("");
  const [phone, setPhone] = useState("");
  const [gameUid, setGameUid] = useState("");
  const [squad, setSquad] = useState<SquadMember[]>(EMPTY_SQUAD);
  const [organizerUpiId, setOrganizerUpiId] = useState("");
  const [organizerQr, setOrganizerQr] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  function updateMember(index: number, field: keyof SquadMember, value: string) {
    setSquad((prev) => prev.map((m, i) => (i === index ? { ...m, [field]: value } : m)));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (role === "PLAYER" && squad.some((m) => !m.name.trim() || !m.gameId.trim() || !m.instagram.trim() || !m.whatsapp.trim())) {
      setError("Please fill in the name, in-game ID, Instagram ID, and WhatsApp number for all 4 squad members.");
      return;
    }
    if (role === "ORGANIZER" && !organizerQr) {
      setError("Please upload your payment QR code.");
      return;
    }

    setLoading(true);
    const form = new FormData();
    form.set("name", name);
    form.set("email", email);
    form.set("password", password);
    form.set("role", role);
    form.set("phone", phone);
    if (role === "ORGANIZER") {
      form.set("firmName", firmName);
      form.set("organizerUpiId", organizerUpiId);
      if (organizerQr) form.set("organizerQr", organizerQr);
    } else {
      form.set("gameUid", gameUid);
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
    }

    const res = await fetch("/api/auth/register", { method: "POST", body: form });
    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error ?? "Something went wrong");
      return;
    }

    router.push(role === "ORGANIZER" ? "/dashboard/organizer" : "/dashboard/player");
    router.refresh();
  }

  return (
    <div className="mx-auto flex max-w-md flex-col items-center px-6 py-16 sm:py-24">
      <p className="skew-x-[-6deg] bg-gradient-to-r from-orange-300 via-amber-400 to-yellow-400 bg-clip-text text-xs font-black uppercase tracking-[0.35em] text-transparent">
        Vantix
      </p>
      <h1 className="mt-2 text-3xl font-black uppercase tracking-tight">Create an account</h1>

      <div className="glass-panel clip-corner mt-8 w-full p-6 sm:p-8">
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setRole("PLAYER")}
            className={`clip-corner-sm border px-4 py-3 text-sm font-bold uppercase tracking-wide transition ${
              role === "PLAYER"
                ? "border-orange-400/50 bg-orange-400/10 text-orange-300"
                : "border-white/10 bg-white/5 text-neutral-400 hover:bg-white/10"
            }`}
          >
            I&apos;m a Player
          </button>
          <button
            type="button"
            onClick={() => setRole("ORGANIZER")}
            className={`clip-corner-sm border px-4 py-3 text-sm font-bold uppercase tracking-wide transition ${
              role === "ORGANIZER"
                ? "border-amber-400/50 bg-amber-400/10 text-amber-300"
                : "border-white/10 bg-white/5 text-neutral-400 hover:bg-white/10"
            }`}
          >
            I&apos;m an Organizer
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wide text-neutral-400">Full name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={inputClass}
            />
          </div>

          {role === "ORGANIZER" && (
            <div>
              <label className="block text-xs font-bold uppercase tracking-wide text-neutral-400">
                Firm / company name
              </label>
              <input
                type="text"
                required
                value={firmName}
                onChange={(e) => setFirmName(e.target.value)}
                className={inputClass}
                placeholder="e.g. Phoenix Gaming Pvt Ltd"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-bold uppercase tracking-wide text-neutral-400">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={inputClass}
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wide text-neutral-400">Phone number</label>
            <input
              type="tel"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className={inputClass}
            />
          </div>

          {role === "PLAYER" && (
            <>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wide text-neutral-400">BGMI UID</label>
                <input
                  type="text"
                  required
                  value={gameUid}
                  onChange={(e) => setGameUid(e.target.value)}
                  className={inputClass}
                  placeholder="e.g. 5123456789"
                />
                <p className="mt-1 text-xs text-neutral-500">
                  Your in-game UID — used to verify it&apos;s really you when you win.
                </p>
              </div>

              <div className="space-y-3">
                <label className="block text-xs font-bold uppercase tracking-wide text-neutral-400">
                  Your squad — all 4 players required
                </label>
                <p className="text-xs text-neutral-500">
                  Set this once and we&apos;ll auto-fill it on every tournament you register for.
                </p>
                {squad.map((member, i) => (
                  <div key={i} className="space-y-2 rounded-md border border-white/10 p-3">
                    <p className="text-[11px] font-bold uppercase tracking-wide text-neutral-500">Player {i + 1}</p>
                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                      <input
                        value={member.name}
                        onChange={(e) => updateMember(i, "name", e.target.value)}
                        placeholder="Name"
                        required
                        className="rounded-md premium-input px-3 py-2 text-sm"
                      />
                      <input
                        value={member.gameId}
                        onChange={(e) => updateMember(i, "gameId", e.target.value)}
                        placeholder="In-game UID"
                        required
                        className="rounded-md premium-input px-3 py-2 text-sm"
                      />
                      <input
                        value={member.whatsapp}
                        onChange={(e) => updateMember(i, "whatsapp", e.target.value)}
                        placeholder="WhatsApp number"
                        type="tel"
                        required
                        className="rounded-md premium-input px-3 py-2 text-sm"
                      />
                      <input
                        value={member.instagram}
                        onChange={(e) => updateMember(i, "instagram", e.target.value)}
                        placeholder="Instagram ID"
                        required
                        className="rounded-md premium-input px-3 py-2 text-sm"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {role === "ORGANIZER" && (
            <>
              <div className="rounded-md border border-amber-400/30 bg-amber-400/5 p-3 text-xs text-amber-300">
                Vantix keeps a 5% commission from each paid team registration on your tournaments —
                the remaining 95% is credited to your Vantix wallet once a payment is verified, and
                you can withdraw it any time. Hosting your tournament on Vantix is free.
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wide text-neutral-400">
                  Your payment UPI ID
                </label>
                <input
                  type="text"
                  required
                  value={organizerUpiId}
                  onChange={(e) => setOrganizerUpiId(e.target.value)}
                  className={inputClass}
                  placeholder="yourname@upi"
                />
                <p className="mt-1 text-xs text-neutral-500">
                  Shown to players on your tournaments unless you set a different one per tournament.
                </p>
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wide text-neutral-400">
                  Payment QR code
                </label>
                <input
                  type="file"
                  required
                  accept="image/png,image/jpeg,image/webp"
                  onChange={(e) => setOrganizerQr(e.target.files?.[0] ?? null)}
                  className="mt-1.5 w-full text-sm"
                />
              </div>
            </>
          )}

          <div>
            <label className="block text-xs font-bold uppercase tracking-wide text-neutral-400">Password</label>
            <input
              type="password"
              required
              minLength={8}
              pattern="(?=.*[A-Za-z])(?=.*\d).{8,}"
              title="At least 8 characters, with at least one letter and one number"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={inputClass}
            />
            <p className="mt-1 text-xs text-neutral-500">At least 8 characters, with a letter and a number.</p>
          </div>

          {error && <p className="text-sm text-red-400">{error}</p>}

          <button
            disabled={loading}
            className="w-full clip-corner-sm premium-btn px-4 py-2.5 font-bold uppercase tracking-wide"
          >
            {loading ? "Creating account…" : "Sign up"}
          </button>
        </form>
      </div>

      <p className="mt-6 text-sm text-neutral-500">
        Already have an account?{" "}
        <Link href="/login" className="font-bold text-orange-400 hover:underline">
          Log in
        </Link>
      </p>
    </div>
  );
}
