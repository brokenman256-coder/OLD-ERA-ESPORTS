import { prisma } from "@/lib/db";
import { APPROVAL } from "@/lib/constants";
import TournamentCard from "@/components/TournamentCard";
import { maybeRunBot } from "@/lib/bot";

export default async function TournamentsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; game?: string }>;
}) {
  const { q, game } = await searchParams;

  await maybeRunBot();

  const tournaments = await prisma.tournament.findMany({
    where: {
      status: APPROVAL.APPROVED,
      ...(game ? { game: { contains: game } } : {}),
      ...(q ? { OR: [{ title: { contains: q } }, { description: { contains: q } }] } : {}),
    },
    orderBy: { startDate: "asc" },
    include: { organizer: true, _count: { select: { registrations: true } } },
  });

  return (
    <div className="mx-auto max-w-6xl px-6 py-12">
      <h1 className="section-title text-3xl font-black uppercase tracking-wide">Browse Tournaments</h1>

      <form className="mt-6 flex flex-wrap gap-3" method="get">
        <input
          type="text"
          name="q"
          defaultValue={q}
          placeholder="Search by title or description"
          className="w-full flex-1 rounded-md border border-neutral-700 bg-neutral-900 px-3 py-2 sm:w-auto"
        />
        <input
          type="text"
          name="game"
          defaultValue={game}
          placeholder="Filter by game"
          className="rounded-md border border-neutral-700 bg-neutral-900 px-3 py-2"
        />
        <button className="clip-corner-sm bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 px-5 py-2 font-bold uppercase tracking-wide hover:brightness-110">
          Search
        </button>
      </form>

      {tournaments.length === 0 ? (
        <p className="mt-10 text-neutral-500">No tournaments match your search.</p>
      ) : (
        <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {tournaments.map((t) => (
            <TournamentCard key={t.id} t={t} />
          ))}
        </div>
      )}
    </div>
  );
}
