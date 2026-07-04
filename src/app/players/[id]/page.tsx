import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { ROLES, APPROVAL } from "@/lib/constants";
import Avatar from "@/components/Avatar";
import VerifiedBadge from "@/components/VerifiedBadge";
import StatusBadge from "@/components/StatusBadge";

export default async function PlayerProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const player = await prisma.user.findUnique({ where: { id } });

  if (!player || player.role !== ROLES.PLAYER) notFound();

  const registrations = await prisma.registration.findMany({
    where: { playerId: id, status: APPROVAL.APPROVED },
    orderBy: { createdAt: "desc" },
    include: { tournament: true },
    take: 20,
  });

  const totalApproved = registrations.length;

  return (
    <div className="mx-auto max-w-4xl px-6 py-12">
      <div className="flex items-start gap-5">
        <Avatar name={player.name} src={player.avatarUrl} size={72} />
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold">{player.name}</h1>
            {player.isVerified && <VerifiedBadge label="Notable Player" />}
          </div>
          {player.bio && <p className="mt-2 max-w-xl text-neutral-700 dark:text-neutral-300">{player.bio}</p>}
          <div className="mt-3 flex flex-wrap gap-3 text-sm">
            {player.discordHandle && <span className="text-neutral-500">Discord: {player.discordHandle}</span>}
            {player.twitterUrl && (
              <a href={player.twitterUrl} target="_blank" rel="noreferrer" className="text-red-600 hover:underline">
                Twitter/X
              </a>
            )}
          </div>
        </div>
      </div>

      <h2 className="mt-10 text-xl font-bold">
        Tournament history — {totalApproved} confirmed registration{totalApproved === 1 ? "" : "s"}
      </h2>
      {registrations.length === 0 ? (
        <p className="mt-4 text-neutral-500">No confirmed tournaments yet.</p>
      ) : (
        <div className="mt-4 space-y-3">
          {registrations.map((r) => (
            <div
              key={r.id}
              className="flex items-center justify-between rounded-lg border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900"
            >
              <div>
                <p className="font-bold">{r.tournament.title}</p>
                <p className="text-sm text-neutral-500">{r.tournament.game}</p>
              </div>
              <StatusBadge status={r.status} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
