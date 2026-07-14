import Link from "next/link";
import { prisma } from "@/lib/db";
import { APPROVAL } from "@/lib/constants";
import Avatar from "@/components/Avatar";
import VerifiedBadge from "@/components/VerifiedBadge";

export const dynamic = "force-dynamic";

export default async function LeaderboardPage() {
  const [topPlayerGroups, topOrganizerGroups] = await Promise.all([
    prisma.registration.groupBy({
      by: ["playerId"],
      where: { status: APPROVAL.APPROVED },
      _count: { playerId: true },
      orderBy: { _count: { playerId: "desc" } },
      take: 10,
    }),
    prisma.tournament.groupBy({
      by: ["organizerId"],
      where: { status: APPROVAL.APPROVED },
      _count: { organizerId: true },
      orderBy: { _count: { organizerId: "desc" } },
      take: 10,
    }),
  ]);

  const [players, organizers] = await Promise.all([
    prisma.user.findMany({ where: { id: { in: topPlayerGroups.map((g) => g.playerId) } } }),
    prisma.user.findMany({ where: { id: { in: topOrganizerGroups.map((g) => g.organizerId) } } }),
  ]);

  const topPlayers = topPlayerGroups
    .map((g) => ({ user: players.find((p) => p.id === g.playerId), count: g._count.playerId }))
    .filter((r): r is { user: NonNullable<typeof r.user>; count: number } => !!r.user);

  const topOrganizers = topOrganizerGroups
    .map((g) => ({ user: organizers.find((o) => o.id === g.organizerId), count: g._count.organizerId }))
    .filter((r): r is { user: NonNullable<typeof r.user>; count: number } => !!r.user);

  const medal = (i: number) => (i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `#${i + 1}`);

  return (
    <div className="mx-auto max-w-4xl px-6 py-16">
      <h1 className="section-title text-3xl font-black uppercase tracking-wide">Leaderboard</h1>
      <p className="mt-2 text-neutral-400">Ranked by confirmed tournament activity.</p>

      <div className="mt-10 grid grid-cols-1 gap-10 lg:grid-cols-2">
        <div>
          <h2 className="border-b-4 border-cyan-500 pb-1 text-xl font-bold">Top Players</h2>
          {topPlayers.length === 0 ? (
            <p className="mt-4 text-neutral-500">No confirmed registrations yet.</p>
          ) : (
            <div className="mt-4 space-y-2">
              {topPlayers.map((row, i) => (
                <Link
                  key={row.user.id}
                  href={`/players/${row.user.id}`}
                  className="flex items-center gap-3 glass-panel clip-corner p-3 transition hover-glow"
                >
                  <span className="w-8 text-center text-lg font-bold text-cyan-400">{medal(i)}</span>
                  <Avatar name={row.user.name} src={row.user.avatarUrl} size={32} />
                  <span className="flex-1 font-medium">
                    {row.user.name} {row.user.isVerified && <VerifiedBadge label="Notable" />}
                  </span>
                  <span className="text-sm text-neutral-400">{row.count} tournaments</span>
                </Link>
              ))}
            </div>
          )}
        </div>

        <div>
          <h2 className="border-b-4 border-amber-500 pb-1 text-xl font-bold">Top Organizers</h2>
          {topOrganizers.length === 0 ? (
            <p className="mt-4 text-neutral-500">No approved tournaments yet.</p>
          ) : (
            <div className="mt-4 space-y-2">
              {topOrganizers.map((row, i) => (
                <Link
                  key={row.user.id}
                  href={`/organizers/${row.user.id}`}
                  className="flex items-center gap-3 glass-panel clip-corner p-3 transition hover-glow"
                >
                  <span className="w-8 text-center text-lg font-bold text-amber-400">{medal(i)}</span>
                  <Avatar name={row.user.firmName || row.user.name} src={row.user.avatarUrl} size={32} />
                  <span className="flex-1 font-medium">
                    {row.user.firmName || row.user.name} {row.user.isVerified && <VerifiedBadge label="Verified" />}
                  </span>
                  <span className="text-sm text-neutral-400">{row.count} tournaments hosted</span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
