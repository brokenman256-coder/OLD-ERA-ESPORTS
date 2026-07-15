import Link from "next/link";
import { gameIcon } from "@/lib/gameIcons";
import TagPills from "@/components/TagPills";
import VerifiedBadge from "@/components/VerifiedBadge";

interface CardTournament {
  id: string;
  title: string;
  game: string;
  entryFee: number;
  maxSlots: number | null;
  startDate: Date | string;
  bannerUrl?: string | null;
  tags?: string | null;
  organizerDisplayName?: string | null;
  organizer: { firmName: string | null; name: string; isVerified?: boolean };
  _count?: { registrations: number };
}

const FALLBACK_GRADIENTS = [
  "from-orange-600 via-blue-800 to-neutral-950",
  "from-amber-600 via-fuchsia-800 to-neutral-950",
  "from-yellow-600 via-rose-800 to-neutral-950",
  "from-neutral-700 via-neutral-900 to-black",
  "from-indigo-600 via-amber-800 to-neutral-950",
];

function gradientFor(game: string) {
  let hash = 0;
  for (let i = 0; i < game.length; i++) hash = (hash * 31 + game.charCodeAt(i)) >>> 0;
  return FALLBACK_GRADIENTS[hash % FALLBACK_GRADIENTS.length];
}

function daysLeftLabel(startDate: Date | string) {
  const diffMs = new Date(startDate).getTime() - Date.now();
  if (diffMs <= 0) return "Live now";
  const days = Math.ceil(diffMs / 86400000);
  if (days === 1) return "Tomorrow";
  if (days <= 14) return `${days}d left`;
  return null;
}

export default function TournamentCard({ t }: { t: CardTournament }) {
  const filled = t._count?.registrations ?? 0;
  const pct = t.maxSlots ? Math.min(100, Math.round((filled / t.maxSlots) * 100)) : null;
  const daysLeft = daysLeftLabel(t.startDate);

  return (
    <Link
      href={`/tournaments/${t.id}`}
      className="clip-corner group overflow-hidden border border-neutral-800 bg-neutral-900 shadow-sm transition hover:-translate-y-1 hover:border-amber-500/40 hover:shadow-xl hover:shadow-amber-900/20"
    >
      <div className="relative">
        {t.bannerUrl ? (
          // eslint-disable-next-line @next/next/no-img-element -- arbitrary-sized user-uploaded banner
          <img src={t.bannerUrl} alt="" className="h-32 w-full object-cover" />
        ) : (
          <div className={`flex h-32 w-full items-center justify-center bg-gradient-to-br text-4xl ${gradientFor(t.game)}`}>
            {gameIcon(t.game)}
          </div>
        )}
        {daysLeft && (
          <span className="absolute right-2 top-2 rounded-full bg-black/70 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-orange-300 backdrop-blur-sm">
            {daysLeft}
          </span>
        )}
      </div>
      <div className="p-5">
        <p className="text-xs font-bold uppercase tracking-wide text-orange-400">
          {gameIcon(t.game)} {t.game}
        </p>
        <h3 className="mt-1 text-lg font-bold group-hover:text-amber-400">{t.title}</h3>
        <p className="mt-1 flex items-center gap-1 text-sm text-neutral-500">
          by {t.organizerDisplayName || t.organizer.firmName || t.organizer.name}
          {t.organizer.isVerified && <VerifiedBadge label="Verified" />}
        </p>
        <p className="mt-3 text-sm text-neutral-400">
          Starts {new Date(t.startDate).toLocaleDateString()}
        </p>
        <p className="mt-1 text-sm font-medium text-emerald-400">
          {t.entryFee > 0 ? `Entry fee: ₹${t.entryFee}` : "Free entry"}
        </p>
        {t.maxSlots ? (
          <div className="mt-2">
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-neutral-800">
              <div
                className="h-full rounded-full bg-gradient-to-r from-orange-500 to-amber-500"
                style={{ width: `${pct}%` }}
              />
            </div>
            <p className="mt-1 text-xs text-neutral-500">
              {filled} / {t.maxSlots} slots filled
            </p>
          </div>
        ) : null}
        {t.tags && (
          <div className="mt-3">
            <TagPills tags={t.tags} />
          </div>
        )}
      </div>
    </Link>
  );
}
