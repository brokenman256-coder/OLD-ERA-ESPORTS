import Link from "next/link";
import { prisma } from "@/lib/db";
import { ROLES } from "@/lib/constants";
import StatCounter from "@/components/StatCounter";

export const dynamic = "force-dynamic";

export default async function CommunityPage() {
  const [playerCount, organizerCount, settings] = await Promise.all([
    prisma.user.count({ where: { role: ROLES.PLAYER } }),
    prisma.user.count({ where: { role: ROLES.ORGANIZER } }),
    prisma.siteSettings.upsert({ where: { id: "global" }, update: {}, create: { id: "global" } }),
  ]);

  const hasAnyLink = Boolean(settings.discordUrl || settings.whatsappLink || settings.instagramUrl);

  return (
    <div className="flex flex-col">
      <section className="relative overflow-hidden bg-gradient-to-b from-black/50 via-transparent to-neutral-950/60 px-6 py-24 text-center text-white">
        <p className="inline-block skew-x-[-6deg] bg-gradient-to-r from-orange-300 via-amber-400 to-yellow-400 bg-clip-text text-sm font-black uppercase tracking-[0.35em] text-transparent">
          Join Us
        </p>
        <h1 className="mx-auto mt-3 max-w-3xl text-4xl font-black uppercase tracking-tight sm:text-6xl">
          Join the{" "}
          <span className="bg-gradient-to-r from-orange-300 via-amber-400 to-yellow-400 bg-clip-text text-transparent">
            Vantix Community
          </span>
        </h1>
        <p className="mx-auto mt-5 max-w-2xl text-neutral-300">
          Connect with thousands of players and organizers, get notified the moment a new
          tournament drops, find squadmates, and stay in the loop on results, payouts, and
          platform updates.
        </p>

        <div className="mx-auto mt-10 grid max-w-md grid-cols-2 gap-4 text-center">
          <div>
            <p className="text-2xl font-black text-amber-400 sm:text-3xl">
              <StatCounter value={playerCount} />
            </p>
            <p className="text-xs uppercase tracking-wide text-neutral-400">Players</p>
          </div>
          <div>
            <p className="text-2xl font-black text-yellow-400 sm:text-3xl">
              <StatCounter value={organizerCount} />
            </p>
            <p className="text-xs uppercase tracking-wide text-neutral-400">Organizers</p>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-4xl px-6 pb-8">
        {hasAnyLink ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
            {settings.discordUrl && (
              <a
                href={settings.discordUrl}
                target="_blank"
                rel="noreferrer"
                className="clip-corner glass-panel hover-glow flex flex-col items-center gap-3 border-t-4 border-indigo-500 p-6 text-center transition hover:scale-[1.02]"
              >
                <span className="text-3xl">💬</span>
                <span className="font-bold uppercase tracking-wide text-indigo-300">Discord</span>
                <span className="text-sm text-neutral-400">
                  Chat live, find teammates, and get pinged for new matches.
                </span>
                <span className="mt-2 clip-corner-sm bg-indigo-600 px-4 py-2 text-xs font-bold uppercase tracking-wide text-white hover:bg-indigo-500">
                  Join Server
                </span>
              </a>
            )}
            {settings.whatsappLink && (
              <a
                href={settings.whatsappLink}
                target="_blank"
                rel="noreferrer"
                className="clip-corner glass-panel hover-glow flex flex-col items-center gap-3 border-t-4 border-green-500 p-6 text-center transition hover:scale-[1.02]"
              >
                <span className="text-3xl">📱</span>
                <span className="font-bold uppercase tracking-wide text-green-400">WhatsApp</span>
                <span className="text-sm text-neutral-400">
                  Fast updates on registrations, room IDs, and match timings.
                </span>
                <span className="mt-2 clip-corner-sm bg-green-600 px-4 py-2 text-xs font-bold uppercase tracking-wide text-white hover:bg-green-500">
                  Join Group
                </span>
              </a>
            )}
            {settings.instagramUrl && (
              <a
                href={settings.instagramUrl}
                target="_blank"
                rel="noreferrer"
                className="clip-corner glass-panel hover-glow flex flex-col items-center gap-3 border-t-4 border-amber-500 p-6 text-center transition hover:scale-[1.02]"
              >
                <span className="text-3xl">📸</span>
                <span className="font-bold uppercase tracking-wide text-amber-400">Instagram</span>
                <span className="text-sm text-neutral-400">
                  Highlights, winner shoutouts, and behind-the-scenes.
                </span>
                <span className="mt-2 clip-corner-sm bg-gradient-to-tr from-amber-500 via-yellow-600 to-amber-600 px-4 py-2 text-xs font-bold uppercase tracking-wide text-white hover:opacity-90">
                  Follow
                </span>
              </a>
            )}
          </div>
        ) : (
          <p className="text-center text-neutral-500">
            Community links haven&apos;t been added yet — check back soon.
          </p>
        )}
      </section>

      <section className="mx-auto w-full max-w-6xl px-6 py-16">
        <h2 className="section-title text-2xl font-black uppercase tracking-wide">Why join?</h2>
        <div className="mt-8 grid grid-cols-1 gap-8 sm:grid-cols-3">
          <div className="clip-corner border-t-4 border-orange-500 bg-neutral-900/80 p-5 shadow-sm backdrop-blur-sm">
            <p className="text-2xl">⚡</p>
            <p className="mt-2 text-sm font-bold uppercase tracking-wide text-orange-400">Instant alerts</p>
            <p className="mt-2 text-neutral-400">
              Be first to know when a new tournament, free match, or slot opens up.
            </p>
          </div>
          <div className="clip-corner border-t-4 border-amber-500 bg-neutral-900/80 p-5 shadow-sm backdrop-blur-sm">
            <p className="text-2xl">🤝</p>
            <p className="mt-2 text-sm font-bold uppercase tracking-wide text-amber-400">Find your squad</p>
            <p className="mt-2 text-neutral-400">
              Looking for teammates or a squad to join? The community is the fastest way to link up.
            </p>
          </div>
          <div className="clip-corner border-t-4 border-yellow-500 bg-neutral-900/80 p-5 shadow-sm backdrop-blur-sm">
            <p className="text-2xl">🏆</p>
            <p className="mt-2 text-sm font-bold uppercase tracking-wide text-yellow-400">Winner shoutouts</p>
            <p className="mt-2 text-neutral-400">
              Get featured when you win, and see who&apos;s topping the leaderboard.
            </p>
          </div>
        </div>

        <div className="mt-12 flex flex-wrap justify-center gap-4">
          <Link
            href="/register"
            className="clip-corner-sm bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-500 px-7 py-3 font-bold uppercase tracking-wide shadow-lg shadow-amber-900/40 transition hover:scale-105 hover:shadow-amber-900/60"
          >
            Create Your Account
          </Link>
          <Link
            href="/tournaments"
            className="clip-corner-sm border border-orange-400/40 bg-orange-400/5 px-7 py-3 font-bold uppercase tracking-wide text-orange-300 transition hover:scale-105 hover:bg-orange-400/15"
          >
            Browse Tournaments
          </Link>
        </div>
      </section>
    </div>
  );
}
