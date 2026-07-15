import Link from "next/link";
import { prisma } from "@/lib/db";
import { APPROVAL, ROLES } from "@/lib/constants";
import TournamentCard from "@/components/TournamentCard";
import PromoCarousel from "@/components/PromoCarousel";
import StatCounter from "@/components/StatCounter";
import SocialLinks from "@/components/SocialLinks";
import { maybeRunBot } from "@/lib/bot";

export const dynamic = "force-dynamic";

export default async function Home() {
  await maybeRunBot();

  const [tournaments, liveCount, playerCount, organizerCount, settings] = await Promise.all([
    prisma.tournament.findMany({
      where: { status: APPROVAL.APPROVED },
      orderBy: { startDate: "asc" },
      take: 6,
      include: { organizer: true, _count: { select: { registrations: true } } },
    }),
    prisma.tournament.count({ where: { status: APPROVAL.APPROVED } }),
    prisma.user.count({ where: { role: ROLES.PLAYER } }),
    prisma.user.count({ where: { role: ROLES.ORGANIZER } }),
    prisma.siteSettings.upsert({ where: { id: "global" }, update: {}, create: { id: "global" } }),
  ]);

  const stats = {
    live: settings.displayLiveTournaments ?? liveCount,
    players: settings.displayPlayers ?? playerCount,
    organizers: settings.displayOrganizers ?? organizerCount,
  };

  return (
    <div className="flex flex-col">
      <section className="relative overflow-hidden bg-gradient-to-b from-black/50 via-transparent to-neutral-950/60 px-6 py-28 text-center text-white">
        <div className="relative">
          <p className="inline-block skew-x-[-6deg] bg-gradient-to-r from-orange-300 via-amber-400 to-yellow-400 bg-clip-text text-sm font-black uppercase tracking-[0.35em] text-transparent">
            Vantix
          </p>
          <h1 className="mx-auto mt-3 max-w-3xl text-4xl font-black uppercase tracking-tight sm:text-6xl">
            Compete. Organize.{" "}
            <span className="bg-gradient-to-r from-orange-300 via-amber-400 to-yellow-400 bg-clip-text text-transparent">
              Get Verified.
            </span>
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-neutral-300">
            Players register for tournaments, organizers post their own events, and every
            payment — entry fees and hosting fees alike — is manually verified by our admin
            team from a screenshot you upload.
          </p>
          <div className="mt-9 flex flex-wrap justify-center gap-4">
            <Link
              href="/register"
              className="clip-corner-sm bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-500 px-7 py-3 font-bold uppercase tracking-wide shadow-lg shadow-amber-900/40 transition hover:scale-105 hover:shadow-amber-900/60"
            >
              Register as a Player
            </Link>
            <Link
              href="/register"
              className="clip-corner-sm border border-orange-400/40 bg-orange-400/5 px-7 py-3 font-bold uppercase tracking-wide text-orange-300 transition hover:scale-105 hover:bg-orange-400/15"
            >
              Post a Tournament
            </Link>
          </div>

          <PromoCarousel />

          <div className="mx-auto mt-14 grid max-w-lg grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-2xl font-black text-orange-400 sm:text-3xl">
                <StatCounter value={stats.live} />
              </p>
              <p className="text-xs uppercase tracking-wide text-neutral-400">Live tournaments</p>
            </div>
            <div>
              <p className="text-2xl font-black text-amber-400 sm:text-3xl">
                <StatCounter value={stats.players} />
              </p>
              <p className="text-xs uppercase tracking-wide text-neutral-400">Players</p>
            </div>
            <div>
              <p className="text-2xl font-black text-yellow-400 sm:text-3xl">
                <StatCounter value={stats.organizers} />
              </p>
              <p className="text-xs uppercase tracking-wide text-neutral-400">Organizers</p>
            </div>
          </div>

          <SocialLinks className="mt-8 justify-center" />
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-6 py-16">
        <div className="flex items-center justify-between">
          <h2 className="section-title text-2xl font-black uppercase tracking-wide">Live Tournaments</h2>
          <Link href="/tournaments" className="text-sm font-bold uppercase tracking-wide text-orange-400 hover:underline">
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
        <h2 className="section-title text-2xl font-black uppercase tracking-wide">How it works</h2>
        <div className="mt-8 grid grid-cols-1 gap-8 sm:grid-cols-3">
          <div className="clip-corner border-t-4 border-orange-500 bg-neutral-900/80 p-5 shadow-sm backdrop-blur-sm">
            <p className="text-2xl">🎮</p>
            <p className="mt-2 text-sm font-bold uppercase tracking-wide text-orange-400">For Players</p>
            <p className="mt-2 text-neutral-400">
              Browse live tournaments, register solo or as a squad, and upload a screenshot
              of your entry-fee payment. Your admin-verified slot is confirmed once we check it.
            </p>
          </div>
          <div className="clip-corner border-t-4 border-amber-500 bg-neutral-900/80 p-5 shadow-sm backdrop-blur-sm">
            <p className="text-2xl">🏆</p>
            <p className="mt-2 text-sm font-bold uppercase tracking-wide text-amber-400">For Organizers</p>
            <p className="mt-2 text-neutral-400">
              Post your tournament with a banner, tags, Discord/stream links, and a hosting
              fee payment screenshot. It goes live after our admin verifies the payment.
            </p>
          </div>
          <div className="clip-corner border-t-4 border-yellow-500 bg-neutral-900/80 p-5 shadow-sm backdrop-blur-sm">
            <p className="text-2xl">🛡️</p>
            <p className="mt-2 text-sm font-bold uppercase tracking-wide text-yellow-400">For Admins</p>
            <p className="mt-2 text-neutral-400">
              Every payment screenshot — from players and organizers — is manually
              reviewed and approved or rejected before anything goes live.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
