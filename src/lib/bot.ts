import { prisma } from "@/lib/db";
import { hashPassword } from "@/lib/auth";
import { APPROVAL, ROLES, TOURNAMENT_FORMATS } from "@/lib/constants";
import { generatePosterDataUri } from "@/lib/posterGenerator";
import { randomUUID } from "crypto";

// A roster of 10 distinct BGMI-focused auto-hosting bot organizers running side by
// side: 5 dedicated to small head-to-head Arena matches (TDM or WOW — both are
// custom-room formats played 1v1 through 5v5 on the small arena maps), 5 dedicated
// to Classic (squad-of-4 battle royale on the full-size maps). Each bot keeps its
// own identity so the two categories read as coming from specialized hosts.
type BotMode = "ARENA" | "CLASSIC";

interface BotIdentity {
  email: string;
  name: string;
  mode: BotMode;
}

const BOT_IDENTITIES: BotIdentity[] = [
  { email: "bot-tdm-1@vantix.internal", name: "Vantix Arena Bot I", mode: "ARENA" },
  { email: "bot-tdm-2@vantix.internal", name: "Vantix Arena Bot II", mode: "ARENA" },
  { email: "bot-tdm-3@vantix.internal", name: "Vantix Arena Bot III", mode: "ARENA" },
  { email: "bot-tdm-4@vantix.internal", name: "Vantix Arena Bot IV", mode: "ARENA" },
  { email: "bot-tdm-5@vantix.internal", name: "Vantix Arena Bot V", mode: "ARENA" },
  { email: "bot-classic-1@vantix.internal", name: "Vantix Classic Bot I", mode: "CLASSIC" },
  { email: "bot-classic-2@vantix.internal", name: "Vantix Classic Bot II", mode: "CLASSIC" },
  { email: "bot-classic-3@vantix.internal", name: "Vantix Classic Bot III", mode: "CLASSIC" },
  { email: "bot-classic-4@vantix.internal", name: "Vantix Classic Bot IV", mode: "CLASSIC" },
  { email: "bot-classic-5@vantix.internal", name: "Vantix Classic Bot V", mode: "CLASSIC" },
];

// Cosmetic "hosted by" org names, randomized per posting (see organizerDisplayName)
// so the same 10 backing accounts still show up as fresh-looking organizations on
// the scoreboard/browse page instead of repeating the same handful of bot names.
const ORG_NAMES = [
  "Phoenix Esports",
  "Team Vertex",
  "Nova Gaming",
  "Shadow Wolves Esports",
  "Team Ruthless",
  "Team Insidious",
  "Velocity Gaming",
  "Team Elite Force",
  "Team Vendetta",
  "Team Mayhem",
  "Team Ironclad",
  "Team Blitzkrieg",
  "Team Nightfall",
  "Team Ravage",
  "Team Zenith",
  "Apex Predators Esports",
  "Team Warlords",
  "Crimson Talons Gaming",
  "Team Outlaws",
  "Skyfall Gaming",
];

// Real BGMI Arena maps (small, no-vehicle) vs the full Classic battle royale maps.
const ARENA_MAPS = ["Warehouse", "Los Leones", "Hangar"];

// Arena/WOW custom-room formats — the registered squad always fills out the full
// mandatory 4-member roster at registration, but only this many players per side
// actually play each round; the rest are bench/subs. Entry fee scales with format size.
const TEAM_FORMATS: { label: string; playersPerSide: number; entryFees: number[] }[] = [
  { label: "1v1", playersPerSide: 1, entryFees: [10, 15, 20] },
  { label: "2v2", playersPerSide: 2, entryFees: [20, 25, 30] },
  { label: "3v3", playersPerSide: 3, entryFees: [30, 35, 40] },
  { label: "4v4", playersPerSide: 4, entryFees: [40, 45, 50] },
  { label: "5v5", playersPerSide: 5, entryFees: [50, 55, 60] },
];
const ARENA_LABELS = ["TDM", "WOW"];

// Arena tournaments are a bracket of head-to-head rounds, so the field stays small
// and power-of-two friendly.
const ARENA_SLOTS = [4, 8, 16];
const ARENA_FORMATS = [TOURNAMENT_FORMATS.SINGLE_ELIMINATION, TOURNAMENT_FORMATS.DOUBLE_ELIMINATION];

// Real BGMI classic-map lobby sizes. Erangel/Miramar/Sanhok/Vikendi cap out around
// 20 squads — the bot takes 18 as its standard field and prize basis. Livik is a
// smaller map with a real capacity of only ~12-13 squads, and its prize pool is
// based on just 10 teams' worth of entry fees rather than the full field.
const MAP_TIERS: Record<string, { slotsPool: number[]; prizeBasisTeams: number }> = {
  Erangel: { slotsPool: [16, 18, 19], prizeBasisTeams: 18 },
  Miramar: { slotsPool: [16, 18, 19], prizeBasisTeams: 18 },
  Sanhok: { slotsPool: [16, 18, 19], prizeBasisTeams: 18 },
  Vikendi: { slotsPool: [16, 18, 19], prizeBasisTeams: 18 },
  Livik: { slotsPool: [12, 13], prizeBasisTeams: 10 },
};
const CLASSIC_MAPS = Object.keys(MAP_TIERS);

const CLASSIC_ENTRY_FEES = [10, 20, 30, 40, 50];
const FREE_PRIZE_AMOUNTS = [100, 110, 120, 130, 140, 150];

// Paid bot matches pay out 80% of collected entry fees to the winners; Vantix
// keeps the remaining 20% to cover hosting/platform costs (house profit).
const PAID_PAYOUT_SHARE = 0.8;

const ADJECTIVES = ["Midnight", "Solo", "Rapid", "Clutch", "Ranked", "Iron", "Neon", "Rogue", "Prime", "Turbo"];
const NOUNS = ["Clash", "Showdown", "Skirmish", "Cup", "Rumble", "Circuit", "Gauntlet", "Faceoff", "Sprint", "League"];

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function pickDistinct<T>(arr: T[], count: number): T[] {
  return [...arr].sort(() => Math.random() - 0.5).slice(0, count);
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
      firmName: identity.mode === "ARENA" ? "Vantix Arena Hosting" : "Vantix Auto-Hosted",
      isVerified: true,
      bio:
        identity.mode === "ARENA"
          ? "Automated Arena host. Runs TDM/WOW custom-room brackets to keep the arena queue active."
          : "Automated Classic battle royale host. Runs squad-of-4 matches to keep the lobby active.",
    },
  });
}

type MatchKind = "FREE" | "PAID";

function randomDetails(identity: BotIdentity, kind: MatchKind) {
  const isArena = identity.mode === "ARENA";
  const organizerDisplayName = pick(ORG_NAMES);

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

  let map: string;
  let maxSlots: number;
  let prizeBasisTeams: number;
  let modeLabel: string;
  let format: string;
  let teamFormat: (typeof TEAM_FORMATS)[number] | null = null;

  if (isArena) {
    modeLabel = pick(ARENA_LABELS); // "TDM" or "WOW"
    teamFormat = pick(TEAM_FORMATS);
    map = pick(ARENA_MAPS);
    maxSlots = pick(ARENA_SLOTS);
    prizeBasisTeams = maxSlots;
    format = pick(ARENA_FORMATS);
  } else {
    modeLabel = "Classic";
    map = pick(CLASSIC_MAPS);
    const tier = MAP_TIERS[map];
    maxSlots = pick(tier.slotsPool);
    prizeBasisTeams = tier.prizeBasisTeams;
    format = TOURNAMENT_FORMATS.BATTLE_ROYALE;
  }

  const title = `${pick(ADJECTIVES)} BGMI ${modeLabel} ${pick(NOUNS)}`;

  let entryFee: number;
  let prizePool: string;
  let entryLine: string;

  if (kind === "FREE") {
    entryFee = 0;
    const amount = pick(FREE_PRIZE_AMOUNTS);
    prizePool = `₹${amount}`;
    entryLine = `This is a free-entry match — no entry fee required. Vantix is sponsoring a ${prizePool} bonus prize pool for the top finishers.`;
  } else {
    entryFee = isArena && teamFormat ? pick(teamFormat.entryFees) : pick(CLASSIC_ENTRY_FEES);
    // Starts at ₹0 with no registrations yet — refreshBotPrizePools() keeps this
    // field updated live as squads actually register, capped at prizeBasisTeams
    // worth of entry fees, so it always reflects real money collected rather than
    // a projected best case.
    prizePool = "₹0";
    const ceiling = Math.round((entryFee * prizeBasisTeams * PAID_PAYOUT_SHARE) / 10) * 10;
    entryLine = `Entry fee is ₹${entryFee} per squad (pay via the registration page; wallet payment supported). The prize pool is 80% of entry fees actually collected from confirmed registrations — it grows live as squads join (see the Prize Pool figure above), capped at ₹${ceiling}. Vantix keeps the remaining 20% to cover hosting and platform costs.`;
  }

  const formatLine =
    isArena && teamFormat
      ? `Format: Arena ${modeLabel} — ${teamFormat.label} head-to-head on ${map}, no vehicles. Your registered 4-player squad sends ${teamFormat.playersPerSide} player${teamFormat.playersPerSide > 1 ? "s" : ""} per side each round; the rest are bench/subs. First to the kill target (or leading at the time limit) wins. ${maxSlots} squads join a ${format === TOURNAMENT_FORMATS.DOUBLE_ELIMINATION ? "double" : "single"}-elimination bracket; check the Bracket tab on this page once registration closes.`
      : `Format: Classic squad battle royale on ${map}. Standard drop-loot-survive rules; final standings are ranked by placement and kills.`;

  const rules = [
    `Match starts ${dateTimeStr} IST. ${formatLine}`,
    "Provide a valid contact number and all 4 squad members' in-game name/UID at registration — incomplete squads will be rejected.",
    entryLine,
    "Room ID and password will be shared on your dashboard shortly before the match starts. Be online and ready at least 15 minutes early.",
    "Fair play is mandatory: no emulators on mobile-only matches, no teaming with rival squads, no smurfing, no hacks/cheats/exploits. Violators are permanently banned from the platform.",
    "Submit a clear screenshot of your final match result (placement/kills, or bracket result for Arena matches) immediately after the match ends. Entries without a valid result screenshot will not be considered for prize payout.",
    "Verified prize winnings are credited to your Vantix wallet within 48 hours of match completion and can be withdrawn from your wallet dashboard.",
    "All admin and organizer decisions on disputes, results, and eligibility are final.",
  ].join("\n");

  return {
    title,
    game: "BGMI",
    description: `An auto-hosted BGMI ${modeLabel} match${teamFormat ? ` (${teamFormat.label})` : ""} on ${map}, generated for ${organizerDisplayName} to keep the ${isArena ? "arena" : "lobby"} active. Registration details and squad rules follow the platform's standard format.`,
    rules,
    prizePool,
    entryFee,
    maxSlots,
    startDate,
    format,
    organizerDisplayName,
    // "basis-N" records the team count the prize pool is capped at, so
    // refreshBotPrizePools can recover it later without a schema field.
    tags: `auto-hosted,community,${modeLabel.toLowerCase()},basis-${prizeBasisTeams}`,
    // Not persisted (no matching schema column) — used only to build the poster banner below.
    posterMap: map,
    posterMode: teamFormat ? `${modeLabel} ${teamFormat.label}` : modeLabel,
  };
}

const BOT_EMAILS = BOT_IDENTITIES.map((b) => b.email);

// Keeps paid bot matches' prize pools honest: recomputed from the actual count of
// APPROVED (payment-confirmed) registrations rather than a static projection, so
// the figure players see always reflects real money collected so far — capped at
// each match's prize-basis team count (see MAP_TIERS). Runs on every opportunistic
// tick, independent of whether new matches are due to post.
async function refreshBotPrizePools() {
  const upcoming = await prisma.tournament.findMany({
    where: {
      entryFee: { gt: 0 },
      status: APPROVAL.APPROVED,
      startDate: { gt: new Date() },
      organizer: { email: { in: BOT_EMAILS } },
    },
    select: {
      id: true,
      entryFee: true,
      prizePool: true,
      tags: true,
      _count: { select: { registrations: { where: { status: APPROVAL.APPROVED } } } },
    },
  });

  for (const t of upcoming) {
    const basisMatch = t.tags?.match(/basis-(\d+)/);
    const basis = basisMatch ? Number(basisMatch[1]) : Infinity;
    const countedTeams = Math.min(t._count.registrations, basis);
    const amount = Math.round((countedTeams * t.entryFee * PAID_PAYOUT_SHARE) / 10) * 10;
    const newPrizePool = `₹${amount}`;
    if (newPrizePool !== t.prizePool) {
      await prisma.tournament.update({ where: { id: t.id }, data: { prizePool: newPrizePool } });
    }
  }
}

async function postOneMatch(identity: BotIdentity, kind: MatchKind) {
  const organizer = await getOrCreateBotOrganizer(identity);
  const { posterMap, posterMode, ...details } = randomDetails(identity, kind);
  const bannerUrl = generatePosterDataUri({
    title: details.title,
    game: details.game,
    entryFee: details.entryFee,
    // The poster is a static image generated once, but a PAID match's DB
    // prizePool keeps growing after this (see refreshBotPrizePools) — show a
    // label that stays true forever instead of a number that would go stale.
    prizePool: kind === "PAID" ? "GROWS LIVE" : details.prizePool,
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
  // Keep already-posted paid matches' prize pools accurate regardless of whether
  // the bot is currently enabled — disabling only stops new postings.
  await refreshBotPrizePools();

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

  // Each cycle posts three matches from three different bots in the 10-bot roster
  // (drawn without replacement) — one free-entry match with a small sponsored
  // prize, two paid-entry matches whose prize pools grow live off real
  // registrations (refreshBotPrizePools).
  const [identityA, identityB, identityC] = pickDistinct(BOT_IDENTITIES, 3);
  await postOneMatch(identityA, "FREE");
  await postOneMatch(identityB, "PAID");
  await postOneMatch(identityC, "PAID");
}
