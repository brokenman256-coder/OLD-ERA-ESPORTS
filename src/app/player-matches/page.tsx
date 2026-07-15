import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { APPROVAL } from "@/lib/constants";

export default async function PlayerMatchesPage({
  searchParams,
}: {
  searchParams: Promise<{ mode?: string }>;
}) {
  const { mode } = await searchParams;
  const user = await getCurrentUser();

  const matches = await prisma.playerMatch.findMany({
    where: {
      status: APPROVAL.APPROVED,
      ...(mode ? { mode } : {}),
    },
    orderBy: { startDate: "asc" },
    include: { creator: true },
  });

  return (
    <div className="mx-auto max-w-4xl px-6 py-12">
      <h1 className="section-title text-3xl font-black uppercase tracking-wide">Player Matches</h1>
      <p className="mt-2 text-neutral-400">
        WOW and TDM matches created and organised by players — admin-approved before listing.
      </p>

      <div className="mt-6 flex gap-2">
        <a
          href="/player-matches"
          className={`rounded-md px-3 py-1.5 text-sm font-medium ${
            !mode ? "bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-500 text-white" : "border border-white/10 bg-white/5 text-neutral-400 hover:bg-white/10"
          }`}
        >
          All
        </a>
        <a
          href="/player-matches?mode=WOW"
          className={`rounded-md px-3 py-1.5 text-sm font-medium ${
            mode === "WOW" ? "bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-500 text-white" : "border border-white/10 bg-white/5 text-neutral-400 hover:bg-white/10"
          }`}
        >
          WOW
        </a>
        <a
          href="/player-matches?mode=TDM"
          className={`rounded-md px-3 py-1.5 text-sm font-medium ${
            mode === "TDM" ? "bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-500 text-white" : "border border-white/10 bg-white/5 text-neutral-400 hover:bg-white/10"
          }`}
        >
          TDM
        </a>
      </div>

      {!user && (
        <p className="mt-6 text-sm text-neutral-500">
          <a href="/login" className="text-orange-400 hover:underline">
            Log in
          </a>{" "}
          to see match codes and join.
        </p>
      )}

      {matches.length === 0 ? (
        <p className="mt-10 text-neutral-500">No matches here yet.</p>
      ) : (
        <div className="mt-8 space-y-4">
          {matches.map((m) => (
            <div key={m.id} className="glass-panel clip-corner p-5">
              <p className="text-xs font-semibold uppercase tracking-wide text-orange-400">{m.mode}</p>
              <h3 className="mt-1 text-lg font-bold">{m.title}</h3>
              <p className="mt-1 text-sm text-neutral-500">
                By {m.creator.name} · Starts {new Date(m.startDate).toLocaleString()}
              </p>
              <p className="mt-1 text-sm font-medium text-emerald-400">
                {m.entryFee > 0 ? `Entry fee: ₹${m.entryFee}` : "Free entry"}
                {m.maxSlots ? ` · Max ${m.maxSlots} players` : ""}
              </p>
              {m.description && <p className="mt-2 text-sm text-neutral-400">{m.description}</p>}
              {user ? (
                <p className="mt-3 text-sm">
                  Match code: <span className="font-mono font-semibold text-orange-400">{m.matchCode}</span>
                </p>
              ) : (
                <p className="mt-3 text-sm text-neutral-500">Log in to see the match code.</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
