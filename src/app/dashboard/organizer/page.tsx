import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { ROLES } from "@/lib/constants";
import StatusBadge from "@/components/StatusBadge";
import CreateTournamentForm from "@/components/CreateTournamentForm";
import RoomDetailsForm from "@/components/RoomDetailsForm";
import { APPROVAL } from "@/lib/constants";

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
    <div className="mx-auto max-w-4xl px-6 py-12 animate-fade-in-up">
      <p className="skew-x-[-6deg] bg-gradient-to-r from-orange-300 via-amber-400 to-yellow-400 bg-clip-text text-xs font-black uppercase tracking-[0.35em] text-transparent">
        Organizer Dashboard
      </p>
      <h1 className="section-title mt-2 text-3xl font-black uppercase tracking-wide">
        {user.firmName || user.name}
      </h1>
      <p className="mt-1 text-neutral-500">{user.firmName ? user.name : ""}</p>

      <div className="mt-6">
        <CreateTournamentForm />
      </div>

      <h2 className="section-title mt-10 text-xl font-black uppercase tracking-wide">Your tournaments</h2>
      {tournaments.length === 0 ? (
        <p className="mt-4 text-neutral-500">You haven&apos;t posted any tournaments yet.</p>
      ) : (
        <div className="mt-4 space-y-4">
          {tournaments.map((t) => (
            <div key={t.id} className="glass-panel clip-corner p-5">
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
                  className="mt-3 inline-block text-sm font-semibold text-orange-400 hover:underline"
                >
                  View my hosting fee screenshot
                </a>
              )}
              {t.status === APPROVAL.APPROVED && (
                <RoomDetailsForm
                  tournamentId={t.id}
                  initialRoomId={t.roomId}
                  initialRoomPassword={t.roomPassword}
                />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
