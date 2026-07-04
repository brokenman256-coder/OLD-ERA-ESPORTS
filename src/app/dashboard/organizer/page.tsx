import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { ROLES } from "@/lib/constants";
import StatusBadge from "@/components/StatusBadge";
import CreateTournamentForm from "@/components/CreateTournamentForm";

export default async function OrganizerDashboard() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/dashboard/organizer");
  if (user.role !== ROLES.ORGANIZER && user.role !== ROLES.ADMIN) redirect("/");

  const tournaments = await prisma.tournament.findMany({
    where: { organizerId: user.id },
    orderBy: { createdAt: "desc" },
    include: {
      _count: {
        select: { registrations: true },
      },
    },
  });

  return (
    <div className="mx-auto max-w-4xl px-6 py-12">
      <h1 className="text-3xl font-bold">Organizer Dashboard</h1>
      <p className="mt-1 text-neutral-500">
        {user.firmName ? `${user.firmName} · ` : ""}
        {user.name}
      </p>

      <div className="mt-6">
        <CreateTournamentForm />
      </div>

      <h2 className="mt-10 text-xl font-bold">Your tournaments</h2>
      {tournaments.length === 0 ? (
        <p className="mt-4 text-neutral-500">You haven&apos;t posted any tournaments yet.</p>
      ) : (
        <div className="mt-4 space-y-4">
          {tournaments.map((t) => (
            <div key={t.id} className="rounded-lg border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <Link href={`/tournaments/${t.id}`} className="text-lg font-bold hover:underline">
                    {t.title}
                  </Link>
                  <p className="text-sm text-neutral-500">
                    {t.game} · starts {new Date(t.startDate).toLocaleDateString()}
                  </p>
                  <p className="mt-1 text-sm">
                    Hosting fee: {t.hostingFee > 0 ? `₹${t.hostingFee}` : "None"} · Entry fee:{" "}
                    {t.entryFee > 0 ? `₹${t.entryFee}` : "Free"}
                  </p>
                  <p className="mt-1 text-sm text-neutral-500">
                    {t._count.registrations} player{t._count.registrations === 1 ? "" : "s"} registered
                  </p>
                </div>
                <StatusBadge status={t.status} />
              </div>
              {t.reviewNote && (
                <p className="mt-3 text-sm text-neutral-600 dark:text-neutral-400">Admin note: {t.reviewNote}</p>
              )}
              {t.hostingFeeProof && (
                <a
                  href={t.hostingFeeProof}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-3 inline-block text-sm text-red-600 hover:underline"
                >
                  View my hosting fee screenshot
                </a>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
