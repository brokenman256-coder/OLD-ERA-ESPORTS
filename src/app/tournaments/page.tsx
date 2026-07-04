import Link from "next/link";
import { prisma } from "@/lib/db";
import { APPROVAL } from "@/lib/constants";

export default async function TournamentsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; game?: string }>;
}) {
  const { q, game } = await searchParams;

  const tournaments = await prisma.tournament.findMany({
    where: {
      status: APPROVAL.APPROVED,
      ...(game ? { game: { contains: game } } : {}),
      ...(q ? { OR: [{ title: { contains: q } }, { description: { contains: q } }] } : {}),
    },
    orderBy: { startDate: "asc" },
    include: { organizer: true },
  });

  return (
    <div className="mx-auto max-w-6xl px-6 py-12">
      <h1 className="text-3xl font-bold">Browse Tournaments</h1>

      <form className="mt-6 flex flex-wrap gap-3" method="get">
        <input
          type="text"
          name="q"
          defaultValue={q}
          placeholder="Search by title or description"
          className="w-full flex-1 rounded-md border border-neutral-300 px-3 py-2 sm:w-auto"
        />
        <input
          type="text"
          name="game"
          defaultValue={game}
          placeholder="Filter by game"
          className="rounded-md border border-neutral-300 px-3 py-2"
        />
        <button className="rounded-md bg-black px-4 py-2 text-white hover:bg-neutral-800">
          Search
        </button>
      </form>

      {tournaments.length === 0 ? (
        <p className="mt-10 text-neutral-500">No tournaments match your search.</p>
      ) : (
        <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {tournaments.map((t) => (
            <Link
              key={t.id}
              href={`/tournaments/${t.id}`}
              className="rounded-lg border border-neutral-200 bg-white p-5 shadow-sm transition hover:shadow-md"
            >
              <p className="text-xs font-semibold uppercase tracking-wide text-red-600">
                {t.game}
              </p>
              <h3 className="mt-1 text-lg font-bold">{t.title}</h3>
              <p className="mt-1 text-sm text-neutral-500">
                by {t.organizer.firmName || t.organizer.name}
              </p>
              <p className="mt-3 text-sm text-neutral-600">
                Starts {new Date(t.startDate).toLocaleDateString()}
              </p>
              <p className="mt-1 text-sm font-medium">
                {t.entryFee > 0 ? `Entry fee: ₹${t.entryFee}` : "Free entry"}
              </p>
              {t.maxSlots ? (
                <p className="mt-1 text-xs text-neutral-500">Max {t.maxSlots} slots</p>
              ) : null}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
