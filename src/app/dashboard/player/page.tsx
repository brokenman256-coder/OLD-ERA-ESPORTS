import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { ROLES } from "@/lib/constants";
import StatusBadge from "@/components/StatusBadge";

export default async function PlayerDashboard() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/dashboard/player");
  if (user.role !== ROLES.PLAYER && user.role !== ROLES.ADMIN) redirect("/");

  const registrations = await prisma.registration.findMany({
    where: { playerId: user.id },
    orderBy: { createdAt: "desc" },
    include: { tournament: { include: { organizer: true } }, team: true },
  });

  return (
    <div className="mx-auto max-w-4xl px-6 py-12">
      <h1 className="text-3xl font-bold">My Registrations</h1>
      <p className="mt-1 text-neutral-500">Welcome back, {user.name}.</p>

      <div className="mt-4">
        <Link href="/tournaments" className="text-sm font-medium text-red-600 hover:underline">
          Browse tournaments →
        </Link>
      </div>

      {registrations.length === 0 ? (
        <p className="mt-10 text-neutral-500">
          You haven&apos;t registered for any tournaments yet.
        </p>
      ) : (
        <div className="mt-8 space-y-4">
          {registrations.map((r) => (
            <div key={r.id} className="rounded-lg border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <Link
                    href={`/tournaments/${r.tournamentId}`}
                    className="text-lg font-bold hover:underline"
                  >
                    {r.tournament.title}
                  </Link>
                  <p className="text-sm text-neutral-500">
                    {r.tournament.game} · hosted by{" "}
                    {r.tournament.organizer.firmName || r.tournament.organizer.name}
                  </p>
                  {r.team && (
                    <p className="mt-1 text-sm">
                      Squad: {r.team.name} {r.team.tag ? `[${r.team.tag}]` : ""}
                    </p>
                  )}
                  {r.contactPhone && <p className="mt-1 text-sm">Contact: {r.contactPhone}</p>}
                </div>
                <StatusBadge status={r.status} />
              </div>
              {Array.isArray(r.squadMembers) && r.squadMembers.length > 0 && (
                <div className="mt-3 grid grid-cols-2 gap-1 text-sm text-neutral-600 dark:text-neutral-400">
                  {(r.squadMembers as { name: string; gameId: string }[]).map((m, i) => (
                    <p key={i}>
                      P{i + 1}: {m.name} ({m.gameId})
                    </p>
                  ))}
                </div>
              )}
              {r.reviewNote && (
                <p className="mt-3 text-sm text-neutral-600 dark:text-neutral-400">Admin note: {r.reviewNote}</p>
              )}
              {r.paymentProof && (
                <a
                  href={r.paymentProof}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-3 inline-block text-sm text-red-600 hover:underline"
                >
                  View my payment screenshot
                </a>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
