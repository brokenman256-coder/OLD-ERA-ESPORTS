import Link from "next/link";
import { prisma } from "@/lib/db";
import { APPROVAL, ROLES } from "@/lib/constants";
import TournamentCard from "@/components/TournamentCard";
import PromoCarousel from "@/components/PromoCarousel";
import StatCounter from "@/components/StatCounter";
import SocialLinks from "@/components/SocialLinks";

export default async function Home() {
  const [tournaments, liveCount, playerCount, organizerCount] = await Promise.all([
    prisma.tournament.findMany({
      where: { status: APPROVAL.APPROVED },
      orderBy: { startDate: "asc" },
      take: 6,
      include: { organizer: true },
    }),
    prisma.tournament.count({ where: { status: APPROVAL.APPROVED } }),
    prisma.user.count({ where: { role: ROLES.PLAYER } }),
    prisma.user.count({ where: { role: ROLES.ORGANIZER } }),
  ]);

  return (
    <div className="flex flex-col">
      <section className="relative overflow-hidden bg-gradient-to-b from-black via-neutral-900 to-neutral-950 px-6 py-28 text-center text-white">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-20"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 20%, #dc2626 0, transparent 35%), radial-gradient(circle at 80% 0%, #7c3aed 0, transparent 35%)",
          }}
        />
        <div className="relative">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-red-500">Old Era Esports</p>
          <h1 className="mx-auto mt-3 max-w-3xl text-4xl font-bold tracking-tight sm:text-6xl">
            Compete. Organize. <span className="text-red-500">Get Verified.</span>
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-neutral-300">
            Players register for tournaments, organizers post their own events, and every
            payment — entry fees and hosting fees alike — is manually verified by our admin
            team from a screenshot you upload.
          </p>
          <div className="mt-9 flex flex-wrap justify-center gap-4">
            <Link
              href="/register"
              className="rounded-md bg-red-600 px-6 py-3 font-semibold transition hover:scale-105 hover:bg-red-500"
            >
              Register as a Player
            </Link>
            <Link
              href="/register"
              className="rounded-md border border-white/30 px-6 py-3 font-semibold transition hover:scale-105 hover:bg-white/10"
            >
              Post a Tournament
            </Link>
          </div>

          <PromoCarousel />

          <div className="mx-auto mt-14 grid max-w-lg grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold sm:text-3xl">
                <StatCounter value={liveCount} />
              </p>
              <p className="text-xs uppercase tracking-wide text-neutral-400">Live tournaments</p>
            </div>
            <div>
              <p className="text-2xl font-bold sm:text-3xl">
                <StatCounter value={playerCount} />
              </p>
              <p className="text-xs uppercase tracking-wide text-neutral-400">Players</p>
            </div>
            <div>
              <p className="text-2xl font-bold sm:text-3xl">
                <StatCounter value={organizerCount} />
              </p>
              <p className="text-xs uppercase tracking-wide text-neutral-400">Organizers</p>
            </div>
          </div>

          <SocialLinks className="mt-8 justify-center" />
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
              <TournamentCard key={t.id} t={t} />
            ))}
          </div>
        )}
      </section>

      <section className="mx-auto w-full max-w-6xl px-6 pb-20">
        <h2 className="text-2xl font-bold">How it works</h2>
        <div className="mt-8 grid grid-cols-1 gap-8 sm:grid-cols-3">
          <div className="rounded-lg border border-neutral-200 p-5 dark:border-neutral-800">
            <p className="text-2xl">🎮</p>
            <p className="mt-2 text-sm font-semibold text-red-600">For Players</p>
            <p className="mt-2 text-neutral-600 dark:text-neutral-400">
              Browse live tournaments, register solo or as a squad, and upload a screenshot
              of your entry-fee payment. Your admin-verified slot is confirmed once we check it.
            </p>
          </div>
          <div className="rounded-lg border border-neutral-200 p-5 dark:border-neutral-800">
            <p className="text-2xl">🏆</p>
            <p className="mt-2 text-sm font-semibold text-red-600">For Organizers</p>
            <p className="mt-2 text-neutral-600 dark:text-neutral-400">
              Post your tournament with a banner, tags, Discord/stream links, and a hosting
              fee payment screenshot. It goes live after our admin verifies the payment.
            </p>
          </div>
          <div className="rounded-lg border border-neutral-200 p-5 dark:border-neutral-800">
            <p className="text-2xl">🛡️</p>
            <p className="mt-2 text-sm font-semibold text-red-600">For Admins</p>
            <p className="mt-2 text-neutral-600 dark:text-neutral-400">
              Every payment screenshot — from players and organizers — is manually
              reviewed and approved or rejected before anything goes live.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
