"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Participant = { registrationId: string; name: string } | null;

type MatchDTO = {
  id: string;
  bracket: string;
  round: number;
  slot: number;
  participant1: Participant;
  participant2: Participant;
  score1: number | null;
  score2: number | null;
  winnerRegistrationId: string | null;
  isBye: boolean;
  status: string;
};

type StandingRow = { registrationId: string; name: string; played: number; wins: number; losses: number; points: number };

const BRACKET_LABELS: Record<string, string> = {
  MAIN: "Bracket",
  WB: "Winners Bracket",
  LB: "Losers Bracket",
  GRAND_FINAL: "Grand Final",
};

function groupByBracketAndRound(matches: MatchDTO[]) {
  const groups = new Map<string, Map<number, MatchDTO[]>>();
  for (const m of matches) {
    if (!groups.has(m.bracket)) groups.set(m.bracket, new Map());
    const byRound = groups.get(m.bracket)!;
    if (!byRound.has(m.round)) byRound.set(m.round, []);
    byRound.get(m.round)!.push(m);
  }
  for (const byRound of groups.values()) {
    for (const list of byRound.values()) list.sort((a, b) => a.slot - b.slot);
  }
  return groups;
}

function MatchCard({ match, canManage }: { match: MatchDTO; canManage: boolean }) {
  const router = useRouter();
  const [reporting, setReporting] = useState(false);
  const [score1, setScore1] = useState("");
  const [score2, setScore2] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const p1 = match.participant1;
  const p2 = match.participant2;
  const ready = match.status === "READY" && p1 && p2;
  const canReport = canManage && ready;

  async function submitWinner(winnerRegistrationId: string) {
    setSaving(true);
    setError(null);
    const res = await fetch(`/api/matches/${match.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        winnerRegistrationId,
        score1: score1 === "" ? null : Number(score1),
        score2: score2 === "" ? null : Number(score2),
      }),
    });
    const data = await res.json().catch(() => ({}));
    setSaving(false);
    if (!res.ok) {
      setError(data.error ?? "Something went wrong");
      return;
    }
    setReporting(false);
    router.refresh();
  }

  const rowClass = (isWinner: boolean, filled: boolean) =>
    `flex items-center justify-between gap-2 px-3 py-1.5 text-sm ${
      isWinner ? "font-bold text-cyan-300" : filled ? "text-neutral-200" : "text-neutral-600 italic"
    }`;

  return (
    <div className="clip-corner-sm w-56 shrink-0 border border-neutral-800 bg-neutral-900/90 backdrop-blur-sm">
      <div className={rowClass(match.winnerRegistrationId === p1?.registrationId, !!p1)}>
        <span className="truncate">{p1?.name ?? (match.isBye ? "—" : "TBD")}</span>
        {match.score1 !== null && <span>{match.score1}</span>}
      </div>
      <div className="h-px bg-neutral-800" />
      <div className={rowClass(match.winnerRegistrationId === p2?.registrationId, !!p2)}>
        <span className="truncate">{p2?.name ?? (match.isBye ? "BYE" : "TBD")}</span>
        {match.score2 !== null && <span>{match.score2}</span>}
      </div>

      {canReport && !reporting && (
        <button
          onClick={() => setReporting(true)}
          className="w-full border-t border-neutral-800 py-1 text-xs font-bold uppercase tracking-wide text-purple-400 hover:bg-purple-500/10"
        >
          Report result
        </button>
      )}

      {reporting && (
        <div className="border-t border-neutral-800 p-2">
          <div className="flex gap-1">
            <input
              type="number"
              placeholder="Score"
              value={score1}
              onChange={(e) => setScore1(e.target.value)}
              className="w-1/2 rounded border border-neutral-700 bg-neutral-950 px-1.5 py-1 text-xs"
            />
            <input
              type="number"
              placeholder="Score"
              value={score2}
              onChange={(e) => setScore2(e.target.value)}
              className="w-1/2 rounded border border-neutral-700 bg-neutral-950 px-1.5 py-1 text-xs"
            />
          </div>
          <div className="mt-1.5 flex flex-col gap-1">
            <button
              disabled={saving}
              onClick={() => submitWinner(p1!.registrationId)}
              className="rounded bg-cyan-600/20 px-2 py-1 text-xs font-semibold text-cyan-300 hover:bg-cyan-600/30 disabled:opacity-50"
            >
              {p1?.name} wins
            </button>
            <button
              disabled={saving}
              onClick={() => submitWinner(p2!.registrationId)}
              className="rounded bg-purple-600/20 px-2 py-1 text-xs font-semibold text-purple-300 hover:bg-purple-600/30 disabled:opacity-50"
            >
              {p2?.name} wins
            </button>
          </div>
          {error && <p className="mt-1 text-xs text-red-400">{error}</p>}
          <button onClick={() => setReporting(false)} className="mt-1 text-xs text-neutral-500 hover:underline">
            Cancel
          </button>
        </div>
      )}
    </div>
  );
}

function EliminationTree({ matches, bracket, canManage }: { matches: MatchDTO[]; bracket: string; canManage: boolean }) {
  const byRound = groupByBracketAndRound(matches).get(bracket);
  if (!byRound) return null;
  const rounds = [...byRound.keys()].sort((a, b) => a - b);

  return (
    <div className="overflow-x-auto pb-2">
      <div className="flex gap-8">
        {rounds.map((r) => (
          <div key={r} className="flex flex-col justify-around gap-6">
            <p className="text-center text-xs font-bold uppercase tracking-wide text-neutral-500">
              {bracket === "GRAND_FINAL" ? (r === 1 ? "Grand Final" : "Bracket Reset") : `Round ${r}`}
            </p>
            <div className="flex flex-col justify-around gap-6">
              {byRound.get(r)!.map((m) => (
                <MatchCard key={m.id} match={m} canManage={canManage} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function StandingsTable({ standings }: { standings: StandingRow[] }) {
  return (
    <div className="clip-corner overflow-hidden border border-neutral-800 bg-neutral-900/90">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-neutral-800 text-left text-xs uppercase tracking-wide text-neutral-500">
            <th className="px-3 py-2">#</th>
            <th className="px-3 py-2">Participant</th>
            <th className="px-3 py-2 text-center">Played</th>
            <th className="px-3 py-2 text-center">W</th>
            <th className="px-3 py-2 text-center">L</th>
            <th className="px-3 py-2 text-right">Points</th>
          </tr>
        </thead>
        <tbody>
          {standings.map((row, i) => (
            <tr key={row.registrationId} className="border-b border-neutral-900 last:border-0">
              <td className="px-3 py-2 text-neutral-500">{i + 1}</td>
              <td className={`px-3 py-2 ${i === 0 ? "font-bold text-cyan-300" : "text-neutral-200"}`}>{row.name}</td>
              <td className="px-3 py-2 text-center text-neutral-400">{row.played}</td>
              <td className="px-3 py-2 text-center text-neutral-400">{row.wins}</td>
              <td className="px-3 py-2 text-center text-neutral-400">{row.losses}</td>
              <td className="px-3 py-2 text-right font-bold text-purple-300">{row.points}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function BracketView({
  matches,
  standings,
  canManage,
}: {
  matches: MatchDTO[];
  standings: StandingRow[] | null;
  canManage: boolean;
}) {
  if (standings) {
    return (
      <div>
        <StandingsTable standings={standings} />
        {canManage && (
          <div className="mt-8">
            <p className="mb-3 text-xs font-bold uppercase tracking-wide text-neutral-500">Report match results</p>
            <div className="flex flex-wrap gap-4">
              {matches
                .sort((a, b) => a.round - b.round || a.slot - b.slot)
                .map((m) => (
                  <MatchCard key={m.id} match={m} canManage={canManage} />
                ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  const groups = groupByBracketAndRound(matches);
  const bracketOrder = ["WB", "LB", "GRAND_FINAL", "MAIN"].filter((b) => groups.has(b));

  return (
    <div className="flex flex-col gap-10">
      {bracketOrder.map((bracket) => (
        <div key={bracket}>
          <p className="mb-3 text-xs font-bold uppercase tracking-wide text-neutral-500">{BRACKET_LABELS[bracket]}</p>
          <EliminationTree matches={matches} bracket={bracket} canManage={canManage} />
        </div>
      ))}
    </div>
  );
}
