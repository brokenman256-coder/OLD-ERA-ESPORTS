import Link from "next/link";
import { prisma } from "@/lib/db";
import { APPROVAL } from "@/lib/constants";

export default async function Home() {
  const tournaments = await prisma.tournament.findMany({
    where: { status: APPROVAL.APPROVED },
    orderBy: { startDate: "asc" },
    take: 6,
    include: { organizer: true },
  });

  return (
    <div className="flex flex-col">
      <section className="bg-gradient-to-b from-black to-neutral-900 px-6 py-24 text-center text-white">
        <h1 className="mx-auto max-w-3xl text-4xl font-bold tracking-tight sm:text-5xl">
          Compete. Organize. Get Verified.
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-neutral-300">
          Old Era Esports connects players with tournament organizers. Players register
          for tournaments, organizers post their own events, and every payment — entry
          fees and hosting fees alike — is manually verified by our admin team from a
          screenshot you upload.
        </p>
        <div className="mt-8 flex justify-center gap-4">
          <Link
            href="/register"
            className="rounded-md bg-red-600 px-6 py-3 font-semibold hover:bg-red-500"
          >
            Register as a Player
          </Link>
          <Link
            href="/register"
            className="rounded-md border border-white/30 px-6 py-3 font-semibold hover:bg-white/10"
          >
            Post a Tournament
          </Link>
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-6 py-16">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Live Tournaments</h2>
          <Link href="/tournaments" className="text-sm font-medium text-red-600 hover:underline">
            View all →
          </Link>
        </div>

        {tournaments.length === 0 ? (
          <p className="mt-8 text-neutral-500">
            No tournaments are live yet. Check back soon, or be the first organizer to post one.
          </p>
        ) : (
          <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
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
              </Link>
            ))}
          </div>
        )}
      </section>

      <section className="mx-auto w-full max-w-6xl px-6 pb-20">
        <h2 className="text-2xl font-bold">How it works</h2>
        <div className="mt-8 grid grid-cols-1 gap-8 sm:grid-cols-3">
          <div>
            <p className="text-sm font-semibold text-red-600">For Players</p>
            <p className="mt-2 text-neutral-600">
              Browse live tournaments, register, and upload a screenshot of your entry-fee
              payment. Your admin-verified slot is confirmed once we check it.
            </p>
          </div>
          <div>
            <p className="text-sm font-semibold text-red-600">For Organizers</p>
            <p className="mt-2 text-neutral-600">
              Post your tournament with a hosting fee payment screenshot. It goes live
              after our admin verifies the payment.
            </p>
          </div>
          <div>
            <p className="text-sm font-semibold text-red-600">For Admins</p>
            <p className="mt-2 text-neutral-600">
              Every payment screenshot — from players and organizers — is manually
              reviewed and approved or rejected before anything goes live.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
