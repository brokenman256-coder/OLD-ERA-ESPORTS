import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { ROLES, APPROVAL } from "@/lib/constants";
import Avatar from "@/components/Avatar";
import VerifiedBadge from "@/components/VerifiedBadge";

export const dynamic = "force-dynamic";

export default async function OrganizerProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const organizer = await prisma.user.findUnique({ where: { id } });

  if (!organizer || organizer.role !== ROLES.ORGANIZER) notFound();

  const tournaments = await prisma.tournament.findMany({
    where: { organizerId: id, status: APPROVAL.APPROVED },
    orderBy: { startDate: "desc" },
  });

  return (
    <div className="mx-auto max-w-4xl px-6 py-12">
      <div className="flex items-start gap-5">
        <Avatar name={organizer.firmName || organizer.name} src={organizer.avatarUrl} size={72} />
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold">{organizer.firmName || organizer.name}</h1>
            {organizer.isVerified && <VerifiedBadge label="Verified Organizer" />}
          </div>
          <p className="text-neutral-500">Organized by {organizer.name}</p>
          {organizer.bio && <p className="mt-2 max-w-xl text-neutral-700 dark:text-neutral-300">{organizer.bio}</p>}

          <div className="mt-3 flex flex-wrap gap-3 text-sm">
            {organizer.discordHandle && (
              <span className="text-neutral-500">Discord: {organizer.discordHandle}</span>
            )}
            {organizer.twitterUrl && (
              <a href={organizer.twitterUrl} target="_blank" rel="noreferrer" className="text-red-600 hover:underline">
                Twitter/X
              </a>
            )}
            {organizer.websiteUrl && (
              <a href={organizer.websiteUrl} target="_blank" rel="noreferrer" className="text-red-600 hover:underline">
                Website
              </a>
            )}
          </div>
        </div>
      </div>

      <h2 className="mt-10 text-xl font-bold">
        Track record — {tournaments.length} live tournament{tournaments.length === 1 ? "" : "s"}
      </h2>
      {tournaments.length === 0 ? (
        <p className="mt-4 text-neutral-500">No approved tournaments yet.</p>
      ) : (
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {tournaments.map((t) => (
            <Link
              key={t.id}
              href={`/tournaments/${t.id}`}
              className="rounded-lg border border-neutral-200 bg-white p-4 shadow-sm transition hover:shadow-md dark:border-neutral-800 dark:bg-neutral-900"
            >
              <p className="text-xs font-semibold uppercase text-red-600">{t.game}</p>
              <h3 className="font-bold">{t.title}</h3>
              <p className="text-sm text-neutral-500">{new Date(t.startDate).toLocaleDateString()}</p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
