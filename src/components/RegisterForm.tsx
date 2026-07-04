"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface Team {
  id: string;
  name: string;
  tag: string | null;
}

export default function RegisterForm({
  tournamentId,
  entryFee,
}: {
  tournamentId: string;
  entryFee: number;
}) {
  const [teams, setTeams] = useState<Team[]>([]);
  const [teamId, setTeamId] = useState("");
  const [teamName, setTeamName] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetch("/api/teams")
      .then((res) => res.json())
      .then((data) => setTeams(data.teams ?? []))
      .catch(() => setTeams([]));
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (entryFee > 0 && !file) {
      setError("Please upload a screenshot of your entry fee payment.");
      return;
    }

    setLoading(true);
    const form = new FormData();
    if (teamId) form.set("teamId", teamId);
    else if (teamName) form.set("teamName", teamName);
    if (file) form.set("paymentProof", file);

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
        You&apos;re registered! {entryFee > 0
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

      {teams.length > 0 ? (
        <div>
          <label className="block text-sm font-medium">Register as</label>
          <select
            value={teamId}
            onChange={(e) => setTeamId(e.target.value)}
            className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 dark:border-neutral-700 dark:bg-neutral-950"
          >
            <option value="">Solo (just me)</option>
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
      ) : (
        <div>
          <label className="block text-sm font-medium">Team / IGN (optional)</label>
          <input
            type="text"
            value={teamName}
            onChange={(e) => setTeamName(e.target.value)}
            className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 dark:border-neutral-700 dark:bg-neutral-950"
          />
          <p className="mt-1 text-xs text-neutral-500">
            Want to register as a squad? Create one on the{" "}
            <Link href="/teams" className="text-red-600 hover:underline">
              Teams
            </Link>{" "}
            page first.
          </p>
        </div>
      )}

      {entryFee > 0 && (
        <div>
          <label className="block text-sm font-medium">
            Entry fee payment screenshot (₹{entryFee}) — required
          </label>
          <input
            type="file"
            accept="image/png,image/jpeg,image/webp"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            className="mt-1 w-full text-sm"
          />
          <p className="mt-1 text-xs text-neutral-500">
            Upload a screenshot of your ₹{entryFee} payment. Our admin will verify it
            manually before your registration is confirmed.
          </p>
        </div>
      )}

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button
        disabled={loading}
        className="w-full rounded-md bg-red-600 px-4 py-2 font-semibold text-white hover:bg-red-500 disabled:opacity-50"
      >
        {loading ? "Submitting..." : "Register"}
      </button>
    </form>
  );
}
