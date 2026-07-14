import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { APPROVAL, ROLES, TOURNAMENT_FORMAT_LABELS } from "@/lib/constants";
import { gameIcon } from "@/lib/gameIcons";
import StatusBadge from "@/components/StatusBadge";
import RegisterForm from "@/components/RegisterForm";
import ResultSubmitForm from "@/components/ResultSubmitForm";
import Countdown from "@/components/Countdown";
import TagPills from "@/components/TagPills";
import VerifiedBadge from "@/components/VerifiedBadge";
import BracketView from "@/components/BracketView";
import GenerateBracketButton from "@/components/GenerateBracketButton";
import { publicMatch } from "@/lib/serialize";
import { computeRoundRobinStandings } from "@/lib/bracket";

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
  // eslint-disable-next-line react-hooks/purity -- server component; freshly computed per request, not memoized
  const upcoming = new Date(tournament.startDate).getTime() > Date.now();
  // eslint-disable-next-line react-hooks/purity -- server component; freshly computed per request, not memoized
  const matchStarted = new Date(tournament.startDate).getTime() <= Date.now();

  const canManageBracket = user?.id === tournament.organizerId || user?.role === ROLES.ADMIN;
  const matches =
    tournament.status === APPROVAL.APPROVED
      ? await prisma.match.findMany({
          where: { tournamentId: id },
          include: {
            registration1: { include: { player: true } },
            registration2: { include: { player: true } },
          },
          orderBy: [{ bracket: "asc" }, { round: "asc" }, { slot: "asc" }],
        })
      : [];
  const standings =
    tournament.format === "ROUND_ROBIN" && matches.length > 0
      ? (() => {
          const registrationIds = [
            ...new Set(matches.flatMap((m) => [m.registration1Id, m.registration2Id].filter((x): x is string => !!x))),
          ];
          const nameById = new Map<string, string>();
          for (const m of matches) {
            if (m.registration1Id && m.registration1) {
              nameById.set(m.registration1Id, m.registration1.teamName || m.registration1.player?.name || "Unknown");
            }
            if (m.registration2Id && m.registration2) {
              nameById.set(m.registration2Id, m.registration2.teamName || m.registration2.player?.name || "Unknown");
            }
          }
          return computeRoundRobinStandings(registrationIds, matches).map((r) => ({
            ...r,
            name: nameById.get(r.registrationId) ?? "Unknown",
          }));
        })()
      : null;

  return (
    <div>
      {tournament.bannerUrl && (
        // eslint-disable-next-line @next/next/no-img-element -- arbitrary-sized user-uploaded banner
        <img
          src={tournament.bannerUrl}
          alt=""
          className="h-56 w-full object-cover sm:h-72"
        />
      )}

      <div className="mx-auto max-w-4xl px-6 py-12 animate-fade-in-up">
        {tournament.status !== APPROVAL.APPROVED && (
          <div className="mb-6 rounded-md border border-amber-300 bg-amber-50 p-3 text-sm text-amber-800 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-300">
            This tournament is not yet public. Status: <StatusBadge status={tournament.status} />
          </div>
        )}

        <p className="text-xs font-semibold uppercase tracking-wide text-red-600 dark:text-red-400">
          {gameIcon(tournament.game)} {tournament.game} · {TOURNAMENT_FORMAT_LABELS[tournament.format] ?? tournament.format}
        </p>
        <h1 className="mt-1 bg-gradient-to-r from-neutral-900 to-neutral-700 bg-clip-text text-3xl font-bold text-transparent dark:from-white dark:to-neutral-300">
          {tournament.title}
        </h1>
        <p className="mt-1 text-neutral-500">
          Hosted by{" "}
          <Link href={`/organizers/${tournament.organizer.id}`} className="hover:underline">
            {tournament.organizer.firmName || tournament.organizer.name}
          </Link>{" "}
          {tournament.organizer.isVerified && <VerifiedBadge label="Verified" />}
        </p>

        <div className="mt-3">
          <TagPills tags={tournament.tags} />
        </div>

        {(tournament.discordUrl || tournament.streamUrl) && (
          <div className="mt-4 flex flex-wrap gap-3">
            {tournament.discordUrl && (
              <a
                href={tournament.discordUrl}
                target="_blank"
                rel="noreferrer"
                className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500"
              >
                Join Discord
              </a>
            )}
            {tournament.streamUrl && (
              <a
                href={tournament.streamUrl}
                target="_blank"
                rel="noreferrer"
                className="rounded-md bg-purple-600 px-4 py-2 text-sm font-semibold text-white hover:bg-purple-500"
              >
                Watch Stream
              </a>
            )}
          </div>
        )}

        {upcoming && (
          <div className="mt-6">
            <Countdown startDate={tournament.startDate} />
          </div>
        )}

        <div className="mt-6 grid grid-cols-2 gap-4 rounded-lg border border-neutral-200 bg-white p-5 sm:grid-cols-4 dark:border-neutral-800 dark:bg-neutral-900">
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
            <p className="font-medium text-emerald-600 dark:text-emerald-400">
              {tournament.entryFee > 0 ? `₹${tournament.entryFee}` : "Free"}
            </p>
          </div>
          {tournament.prizePool && (
            <div>
              <p className="text-xs text-neutral-500">Prize pool</p>
              <p className="font-medium text-amber-600 dark:text-amber-400">{tournament.prizePool}</p>
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
          <p className="mt-2 whitespace-pre-wrap text-neutral-700 dark:text-neutral-300">{tournament.description}</p>
        </div>

        {tournament.rules && (
          <div className="mt-8">
            <h2 className="text-xl font-bold">Rules</h2>
            <p className="mt-2 whitespace-pre-wrap text-neutral-700 dark:text-neutral-300">{tournament.rules}</p>
          </div>
        )}

        {tournament.status === APPROVAL.APPROVED && (
          <div className="mt-10">
            <h2 className="section-title text-xl font-black uppercase tracking-wide">Bracket</h2>
            <div className="mt-4">
              {matches.length === 0 ? (
                canManageBracket ? (
                  <GenerateBracketButton tournamentId={tournament.id} />
                ) : (
                  <p className="text-sm text-neutral-500">The bracket hasn&apos;t been generated yet.</p>
                )
              ) : (
                <BracketView matches={matches.map(publicMatch)} standings={standings} canManage={canManageBracket} />
              )}
            </div>
          </div>
        )}

        <div className="mt-10">
          {tournament.status !== APPROVAL.APPROVED ? null : !user ? (
            <div className="rounded-md border border-neutral-200 bg-white p-6 text-center dark:border-neutral-800 dark:bg-neutral-900">
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
            <div className="rounded-md border border-neutral-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-900">
              <p className="font-medium">
                You&apos;re registered. Status: <StatusBadge status={existingRegistration.status} />
              </p>
              {existingRegistration.reviewNote && (
                <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">
                  Admin note: {existingRegistration.reviewNote}
                </p>
              )}

              {existingRegistration.status === APPROVAL.APPROVED &&
                (tournament.roomId || tournament.roomPassword) && (
                  <div className="mt-4 rounded-md border border-cyan-800 bg-cyan-950 p-4">
                    <p className="text-sm font-semibold text-cyan-300">Room details</p>
                    {tournament.roomId && (
                      <p className="mt-1 text-sm text-cyan-200">
                        Room ID: <span className="font-mono font-semibold">{tournament.roomId}</span>
                      </p>
                    )}
                    {tournament.roomPassword && (
                      <p className="mt-1 text-sm text-cyan-200">
                        Password: <span className="font-mono font-semibold">{tournament.roomPassword}</span>
                      </p>
                    )}
                  </div>
                )}

              {existingRegistration.status === APPROVAL.APPROVED &&
                matchStarted &&
                !existingRegistration.resultProof && (
                  <ResultSubmitForm registrationId={existingRegistration.id} />
                )}

              {existingRegistration.resultProof && (
                <p className="mt-4 text-sm text-emerald-600 dark:text-emerald-400">
                  ✓ Match result screenshot submitted.
                </p>
              )}
            </div>
          ) : isFull ? (
            <p className="text-sm text-neutral-500">This tournament is full.</p>
          ) : (
            <RegisterForm tournamentId={tournament.id} entryFee={tournament.entryFee} />
          )}
        </div>
      </div>
    </div>
  );
}
