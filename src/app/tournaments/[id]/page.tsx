import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { APPROVAL, ROLES } from "@/lib/constants";
import StatusBadge from "@/components/StatusBadge";
import RegisterForm from "@/components/RegisterForm";

export default async function TournamentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const tournament = await prisma.tournament.findUnique({
    where: { id },
    include: { organizer: true, _count: { select: { registrations: true } } },
  });

  const user = await getCurrentUser();

  if (!tournament) notFound();
  if (tournament.status !== APPROVAL.APPROVED) {
    const isOwner = user?.id === tournament.organizerId;
    const isAdmin = user?.role === ROLES.ADMIN;
    if (!isOwner && !isAdmin) notFound();
  }

  let existingRegistration = null;
  if (user?.role === ROLES.PLAYER) {
    existingRegistration = await prisma.registration.findUnique({
      where: { tournamentId_playerId: { tournamentId: id, playerId: user.id } },
    });
  }

  const isFull = tournament.maxSlots ? tournament._count.registrations >= tournament.maxSlots : false;

  return (
    <div className="mx-auto max-w-4xl px-6 py-12">
      {tournament.status !== APPROVAL.APPROVED && (
        <div className="mb-6 rounded-md border border-amber-300 bg-amber-50 p-3 text-sm text-amber-800">
          This tournament is not yet public. Status: <StatusBadge status={tournament.status} />
        </div>
      )}

      <p className="text-xs font-semibold uppercase tracking-wide text-red-600">{tournament.game}</p>
      <h1 className="mt-1 text-3xl font-bold">{tournament.title}</h1>
      <p className="mt-1 text-neutral-500">
        Hosted by {tournament.organizer.firmName || tournament.organizer.name}
      </p>

      <div className="mt-6 grid grid-cols-2 gap-4 rounded-lg border border-neutral-200 bg-white p-5 sm:grid-cols-4">
        <div>
          <p className="text-xs text-neutral-500">Starts</p>
          <p className="font-medium">{new Date(tournament.startDate).toLocaleString()}</p>
        </div>
        {tournament.endDate && (
          <div>
            <p className="text-xs text-neutral-500">Ends</p>
            <p className="font-medium">{new Date(tournament.endDate).toLocaleString()}</p>
          </div>
        )}
        <div>
          <p className="text-xs text-neutral-500">Entry fee</p>
          <p className="font-medium">{tournament.entryFee > 0 ? `₹${tournament.entryFee}` : "Free"}</p>
        </div>
        {tournament.prizePool && (
          <div>
            <p className="text-xs text-neutral-500">Prize pool</p>
            <p className="font-medium">{tournament.prizePool}</p>
          </div>
        )}
        {tournament.maxSlots && (
          <div>
            <p className="text-xs text-neutral-500">Slots</p>
            <p className="font-medium">
              {tournament._count.registrations} / {tournament.maxSlots}
            </p>
          </div>
        )}
      </div>

      <div className="mt-8">
        <h2 className="text-xl font-bold">About this tournament</h2>
        <p className="mt-2 whitespace-pre-wrap text-neutral-700">{tournament.description}</p>
      </div>

      {tournament.rules && (
        <div className="mt-8">
          <h2 className="text-xl font-bold">Rules</h2>
          <p className="mt-2 whitespace-pre-wrap text-neutral-700">{tournament.rules}</p>
        </div>
      )}

      <div className="mt-10">
        {tournament.status !== APPROVAL.APPROVED ? null : !user ? (
          <div className="rounded-md border border-neutral-200 bg-white p-6 text-center">
            <p>
              <Link href="/login" className="font-medium text-red-600 hover:underline">
                Log in
              </Link>{" "}
              or{" "}
              <Link href="/register" className="font-medium text-red-600 hover:underline">
                sign up
              </Link>{" "}
              as a player to register for this tournament.
            </p>
          </div>
        ) : user.role !== ROLES.PLAYER ? (
          <p className="text-sm text-neutral-500">Only player accounts can register for tournaments.</p>
        ) : existingRegistration ? (
          <div className="rounded-md border border-neutral-200 bg-white p-6">
            <p className="font-medium">
              You&apos;re registered. Status: <StatusBadge status={existingRegistration.status} />
            </p>
            {existingRegistration.reviewNote && (
              <p className="mt-2 text-sm text-neutral-600">Admin note: {existingRegistration.reviewNote}</p>
            )}
          </div>
        ) : isFull ? (
          <p className="text-sm text-neutral-500">This tournament is full.</p>
        ) : (
          <RegisterForm tournamentId={tournament.id} entryFee={tournament.entryFee} />
        )}
      </div>
    </div>
  );
}
