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
  organizer: { firmName: string | null; name: string; isVerified?: boolean };
}

const FALLBACK_GRADIENTS = [
  "from-rose-600 via-red-700 to-neutral-950",
  "from-violet-600 via-fuchsia-700 to-neutral-950",
  "from-cyan-500 via-blue-700 to-neutral-950",
  "from-amber-500 via-orange-700 to-neutral-950",
  "from-emerald-500 via-teal-700 to-neutral-950",
];

function gradientFor(game: string) {
  let hash = 0;
  for (let i = 0; i < game.length; i++) hash = (hash * 31 + game.charCodeAt(i)) >>> 0;
  return FALLBACK_GRADIENTS[hash % FALLBACK_GRADIENTS.length];
}

export default function TournamentCard({ t }: { t: CardTournament }) {
  return (
    <Link
      href={`/tournaments/${t.id}`}
      className="group overflow-hidden rounded-lg border border-neutral-200 bg-white shadow-sm transition hover:-translate-y-1 hover:border-red-400/50 hover:shadow-xl hover:shadow-red-900/10 dark:border-neutral-800 dark:bg-neutral-900 dark:hover:border-red-500/40"
    >
      {t.bannerUrl ? (
        // eslint-disable-next-line @next/next/no-img-element -- arbitrary-sized user-uploaded banner
        <img src={t.bannerUrl} alt="" className="h-32 w-full object-cover" />
      ) : (
        <div className={`flex h-32 w-full items-center justify-center bg-gradient-to-br text-4xl ${gradientFor(t.game)}`}>
          {gameIcon(t.game)}
        </div>
      )}
      <div className="p-5">
        <p className="text-xs font-semibold uppercase tracking-wide text-red-600 dark:text-red-400">
          {gameIcon(t.game)} {t.game}
        </p>
        <h3 className="mt-1 text-lg font-bold group-hover:text-red-600 dark:group-hover:text-red-400">{t.title}</h3>
        <p className="mt-1 flex items-center gap-1 text-sm text-neutral-500">
          by {t.organizer.firmName || t.organizer.name}
          {t.organizer.isVerified && <VerifiedBadge label="Verified" />}
        </p>
        <p className="mt-3 text-sm text-neutral-600 dark:text-neutral-400">
          Starts {new Date(t.startDate).toLocaleDateString()}
        </p>
        <p className="mt-1 text-sm font-medium text-emerald-600 dark:text-emerald-400">
          {t.entryFee > 0 ? `Entry fee: ₹${t.entryFee}` : "Free entry"}
        </p>
        {t.maxSlots ? <p className="mt-1 text-xs text-neutral-500">Max {t.maxSlots} slots</p> : null}
        {t.tags && (
          <div className="mt-3">
            <TagPills tags={t.tags} />
          </div>
        )}
      </div>
    </Link>
  );
}
