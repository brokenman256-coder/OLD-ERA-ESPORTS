import { prisma } from "@/lib/db";
import { hashPassword } from "@/lib/auth";
import { APPROVAL, ROLES, TOURNAMENT_FORMATS } from "@/lib/constants";
import { generatePosterDataUri } from "@/lib/posterGenerator";
import { randomUUID } from "crypto";

// A roster of 10 distinct BGMI-focused auto-hosting bot organizers running side by
// side: 5 dedicated to Arena TDM (4v4 team deathmatch, no vehicles, small maps),
// 5 dedicated to Classic (standard squad-of-4 battle royale on the full-size maps).
// Each bot keeps its own identity/avatar-less profile so the two match types read
// as coming from specialized hosts rather than one generic account.
type BotMode = "TDM" | "CLASSIC";

interface BotIdentity {
  email: string;
  name: string;
  mode: BotMode;
}

const BOT_IDENTITIES: BotIdentity[] = [
  { email: "bot-tdm-1@vantix.internal", name: "Vantix TDM Bot I", mode: "TDM" },
  { email: "bot-tdm-2@vantix.internal", name: "Vantix TDM Bot II", mode: "TDM" },
  { email: "bot-tdm-3@vantix.internal", name: "Vantix TDM Bot III", mode: "TDM" },
  { email: "bot-tdm-4@vantix.internal", name: "Vantix TDM Bot IV", mode: "TDM" },
  { email: "bot-tdm-5@vantix.internal", name: "Vantix TDM Bot V", mode: "TDM" },
  { email: "bot-classic-1@vantix.internal", name: "Vantix Classic Bot I", mode: "CLASSIC" },
  { email: "bot-classic-2@vantix.internal", name: "Vantix Classic Bot II", mode: "CLASSIC" },
  { email: "bot-classic-3@vantix.internal", name: "Vantix Classic Bot III", mode: "CLASSIC" },
  { email: "bot-classic-4@vantix.internal", name: "Vantix Classic Bot IV", mode: "CLASSIC" },
  { email: "bot-classic-5@vantix.internal", name: "Vantix Classic Bot V", mode: "CLASSIC" },
];

// Real BGMI Arena TDM maps (small, no-vehicle, 4v4) vs the full Classic battle royale maps.
const TDM_MAPS = ["Warehouse", "Los Leones", "Hangar"];
const CLASSIC_MAPS = ["Erangel", "Miramar", "Sanhok", "Vikendi", "Livik"];

// TDM tournaments are a bracket of head-to-head 4v4s, so the field stays small and
// power-of-two friendly. Classic lobbies hold far more squads.
const TDM_SLOTS = [4, 8, 16];
const CLASSIC_SLOTS = [16, 25, 32, 50, 64];
const TDM_FORMATS = [TOURNAMENT_FORMATS.SINGLE_ELIMINATION, TOURNAMENT_FORMATS.DOUBLE_ELIMINATION];

const PAID_ENTRY_FEES = [10, 20, 30, 40, 50];
const FREE_PRIZE_AMOUNTS = [100, 110, 120, 130, 140, 150];

const ADJECTIVES = ["Midnight", "Solo", "Rapid", "Clutch", "Ranked", "Iron", "Neon", "Rogue", "Prime", "Turbo"];
const NOUNS = ["Clash", "Showdown", "Skirmish", "Cup", "Rumble", "Circuit", "Gauntlet", "Faceoff", "Sprint", "League"];

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function pickTwoDistinct<T>(arr: T[]): [T, T] {
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return [shuffled[0], shuffled[1]];
}

async function getOrCreateBotOrganizer(identity: BotIdentity) {
  const existing = await prisma.user.findUnique({ where: { email: identity.email } });
  if (existing) return existing;

  const passwordHash = await hashPassword(randomUUID());
  return prisma.user.create({
    data: {
      name: identity.name,
      email: identity.email,
      passwordHash,
      role: ROLES.ORGANIZER,
      firmName: identity.mode === "TDM" ? "Vantix Arena Hosting" : "Vantix Auto-Hosted",
      isVerified: true,
      bio:
        identity.mode === "TDM"
          ? "Automated Arena TDM host. Runs 4v4 team deathmatch brackets to keep the arena queue active."
          : "Automated Classic battle royale host. Runs squad-of-4 matches to keep the lobby active.",
    },
  });
}

type MatchKind = "FREE" | "PAID";

function randomDetails(identity: BotIdentity, kind: MatchKind) {
  const isTdm = identity.mode === "TDM";
  const modeLabel = isTdm ? "TDM" : "Classic";
  const map = isTdm ? pick(TDM_MAPS) : pick(CLASSIC_MAPS);
  const maxSlots = isTdm ? pick(TDM_SLOTS) : pick(CLASSIC_SLOTS);
  const format = isTdm ? pick(TDM_FORMATS) : TOURNAMENT_FORMATS.BATTLE_ROYALE;
  const title = `${pick(ADJECTIVES)} BGMI ${modeLabel} ${pick(NOUNS)}`;

  const hoursOut = 2 + Math.floor(Math.random() * 70);
  const startDate = new Date(Date.now() + hoursOut * 60 * 60 * 1000);
  const dateTimeStr = startDate.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZone: "Asia/Kolkata",
  });

  let entryFee: number;
  let prizePool: string;
  let entryLine: string;

  if (kind === "FREE") {
    entryFee = 0;
    const amount = pick(FREE_PRIZE_AMOUNTS);
    prizePool = `₹${amount}`;
    entryLine = `This is a free-entry match — no entry fee required. Vantix is sponsoring a ${prizePool} bonus prize pool for the top finishers.`;
  } else {
    entryFee = pick(PAID_ENTRY_FEES);
    const amount = entryFee * maxSlots;
    prizePool = `₹${amount}`;
    entryLine = `Entry fee is ₹${entryFee} per squad (pay via the registration page; wallet payment supported). The prize pool is the full ${prizePool} collected from all ${maxSlots} squads at capacity, paid out entirely to the top finishers.`;
  }

  const formatLine = isTdm
    ? `Format: Arena TDM — 4v4 team deathmatch on ${map}, no vehicles, first to the kill target (or leading at the time limit) wins. ${maxSlots} squads join a ${format === TOURNAMENT_FORMATS.DOUBLE_ELIMINATION ? "double" : "single"}-elimination bracket; check the Bracket tab on this page once registration closes.`
    : `Format: Classic squad battle royale on ${map}. Standard drop-loot-survive rules; final standings are ranked by placement and kills.`;

  const rules = [
    `Match starts ${dateTimeStr} IST. ${formatLine}`,
    "Provide a valid contact number and all 4 squad members' in-game name/UID at registration — incomplete squads will be rejected.",
    entryLine,
    "Room ID and password will be shared on your dashboard shortly before the match starts. Be online and ready at least 15 minutes early.",
    "Fair play is mandatory: no emulators on mobile-only matches, no teaming with rival squads, no smurfing, no hacks/cheats/exploits. Violators are permanently banned from the platform.",
    "Submit a clear screenshot of your final match result (placement/kills, or bracket result for TDM) immediately after the match ends. Entries without a valid result screenshot will not be considered for prize payout.",
    "Verified prize winnings are credited to your Vantix wallet within 48 hours of match completion and can be withdrawn from your wallet dashboard.",
    "All admin and organizer decisions on disputes, results, and eligibility are final.",
  ].join("\n");

  return {
    title,
    game: "BGMI",
    description: `An auto-hosted BGMI ${modeLabel} match on ${map}, generated by ${identity.name} to keep the ${isTdm ? "arena" : "lobby"} active. Registration details and squad rules follow the platform's standard format.`,
    rules,
    prizePool,
    entryFee,
    maxSlots,
    startDate,
    format,
    tags: `auto-hosted,community,${modeLabel.toLowerCase()}`,
    // Not persisted (no matching schema column) — used only to build the poster banner below.
    posterMap: map,
    posterMode: modeLabel,
  };
}

async function postOneMatch(identity: BotIdentity, kind: MatchKind) {
  const organizer = await getOrCreateBotOrganizer(identity);
  const { posterMap, posterMode, ...details } = randomDetails(identity, kind);
  const bannerUrl = generatePosterDataUri({
    title: details.title,
    game: details.game,
    entryFee: details.entryFee,
    prizePool: details.prizePool,
    startDate: details.startDate,
    map: posterMap,
    mode: posterMode,
  });

  await prisma.tournament.create({
    data: {
      ...details,
      bannerUrl,
      organizerId: organizer.id,
      status: APPROVAL.APPROVED,
      hostingFee: 0,
      hostingFeeVerified: true,
    },
  });
}

export async function maybeRunBot() {
  const settings = await prisma.siteSettings.upsert({
    where: { id: "global" },
    update: {},
    create: { id: "global" },
  });

  if (!settings.botEnabled) return;

  const intervalMs = Math.max(1, settings.botIntervalMinutes) * 60 * 1000;
  const due = !settings.botLastRunAt || Date.now() - settings.botLastRunAt.getTime() >= intervalMs;
  if (!due) return;

  // Race-safe: only proceed if we can claim the run by advancing botLastRunAt
  // from the exact value we just read (loses the race harmlessly otherwise).
  const claimed = await prisma.siteSettings.updateMany({
    where: { id: "global", botLastRunAt: settings.botLastRunAt },
    data: { botLastRunAt: new Date() },
  });
  if (claimed.count === 0) return;

  // Each cycle posts a pair of matches from two different bots in the 10-bot
  // roster (drawn without replacement, so it's never the same identity posting
  // both) — one free-entry match with a small sponsored prize, one paid-entry
  // match whose prize pool is the full expected collection at capacity.
  const [identityA, identityB] = pickTwoDistinct(BOT_IDENTITIES);
  await postOneMatch(identityA, "FREE");
  await postOneMatch(identityB, "PAID");
}
