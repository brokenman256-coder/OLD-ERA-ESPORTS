import { prisma } from "@/lib/db";
import { APPROVAL, MATCH_BRACKET, MATCH_STATUS, TOURNAMENT_FORMATS } from "@/lib/constants";
import type { Prisma } from "@prisma/client";

type Tx = Prisma.TransactionClient;

export function nextPowerOfTwo(n: number): number {
  let p = 1;
  while (p < n) p *= 2;
  return p;
}

// Standard tournament bracket seeding order: for a size-N bracket, returns the
// sequence of seed numbers (1-indexed) occupying round-1 slots left to right,
// e.g. size=8 -> [1,8,4,5,2,7,3,6] (match1: 1v8, match2: 4v5, match3: 2v7, match4: 3v6).
// This keeps top seeds apart for as long as possible instead of naive 1v2,3v4 pairing.
export function seedOrder(size: number): number[] {
  let order = [1, 2];
  while (order.length < size) {
    const total = order.length * 2 + 1;
    const next: number[] = [];
    for (const s of order) next.push(s, total - s);
    order = next;
  }
  return order;
}

// Places `registrationId` into the given slot of `matchId`. If the sibling slot is
// marked "phantom" (structurally unfillable, from an upstream bye in the losers
// bracket), this match auto-completes as a walkover and the winner is cascaded
// forward immediately. Otherwise, if both slots are now filled, the match becomes
// READY to be played.
async function placeIntoMatch(tx: Tx, matchId: string, slot: number, registrationId: string): Promise<void> {
  const field = slot === 1 ? "registration1Id" : "registration2Id";
  const match = await tx.match.update({ where: { id: matchId }, data: { [field]: registrationId } });

  const siblingPhantom = slot === 1 ? match.slot2Phantom : match.slot1Phantom;
  const siblingFilled = slot === 1 ? match.registration2Id : match.registration1Id;

  if (siblingPhantom) {
    const completed = await tx.match.update({
      where: { id: matchId },
      data: { status: MATCH_STATUS.COMPLETED, isBye: true, winnerRegistrationId: registrationId },
    });
    if (completed.nextMatchId && completed.nextMatchSlot) {
      await placeIntoMatch(tx, completed.nextMatchId, completed.nextMatchSlot, registrationId);
    }
  } else if (siblingFilled) {
    await tx.match.update({ where: { id: matchId }, data: { status: MATCH_STATUS.READY } });
  }
}

// Marks a losers-bracket slot as structurally unfillable (its feeder winners-bracket
// match was a bye and produced no loser). If the sibling slot is also phantom, the
// whole match is dead — mark it a no-winner bye and cascade the phantom mark forward.
async function markPhantom(tx: Tx, matchId: string, slot: number): Promise<void> {
  const field = slot === 1 ? "slot1Phantom" : "slot2Phantom";
  const match = await tx.match.update({ where: { id: matchId }, data: { [field]: true } });

  const siblingPhantom = slot === 1 ? match.slot2Phantom : match.slot1Phantom;
  if (siblingPhantom) {
    const completed = await tx.match.update({
      where: { id: matchId },
      data: { status: MATCH_STATUS.COMPLETED, isBye: true, winnerRegistrationId: null },
    });
    if (completed.nextMatchId && completed.nextMatchSlot) {
      await markPhantom(tx, completed.nextMatchId, completed.nextMatchSlot);
    }
  }
}

async function generateSingleElimination(
  tx: Tx,
  tournamentId: string,
  registrations: { id: string }[],
): Promise<void> {
  const n = registrations.length;
  const size = nextPowerOfTwo(n);
  const rounds = Math.log2(size);
  const seeds = seedOrder(size);

  const roundIdsByRound: string[][] = [];
  let nextRoundIds: string[] = [];
  for (let r = rounds; r >= 1; r--) {
    const count = size / 2 ** r;
    const ids: string[] = [];
    for (let idx = 0; idx < count; idx++) {
      const nextMatchId = r === rounds ? null : nextRoundIds[Math.floor(idx / 2)];
      const nextMatchSlot = r === rounds ? null : (idx % 2) + 1;
      const m = await tx.match.create({
        data: { tournamentId, bracket: MATCH_BRACKET.MAIN, round: r, slot: idx, nextMatchId, nextMatchSlot },
      });
      ids.push(m.id);
    }
    roundIdsByRound[r - 1] = ids;
    nextRoundIds = ids;
  }

  const round1Ids = roundIdsByRound[0];
  for (let j = 0; j < round1Ids.length; j++) {
    const seedA = seeds[2 * j];
    const seedB = seeds[2 * j + 1];
    const regA = seedA <= n ? registrations[seedA - 1].id : null;
    const regB = seedB <= n ? registrations[seedB - 1].id : null;
    const isBye = !regA || !regB;
    const status = isBye ? MATCH_STATUS.COMPLETED : MATCH_STATUS.READY;
    const winner = isBye ? regA ?? regB : null;

    const match = await tx.match.update({
      where: { id: round1Ids[j] },
      data: { registration1Id: regA, registration2Id: regB, isBye, status, winnerRegistrationId: winner },
    });
    if (isBye && winner && match.nextMatchId && match.nextMatchSlot) {
      await placeIntoMatch(tx, match.nextMatchId, match.nextMatchSlot, winner);
    }
  }
}

async function generateRoundRobin(tx: Tx, tournamentId: string, registrations: { id: string }[]): Promise<void> {
  const players: (string | null)[] = registrations.map((r) => r.id);
  if (players.length % 2 !== 0) players.push(null);
  const m = players.length;
  const arr = [...players];

  for (let round = 0; round < m - 1; round++) {
    let slot = 0;
    for (let i = 0; i < m / 2; i++) {
      const a = arr[i];
      const b = arr[m - 1 - i];
      if (a && b) {
        await tx.match.create({
          data: {
            tournamentId,
            bracket: MATCH_BRACKET.MAIN,
            round: round + 1,
            slot: slot++,
            registration1Id: a,
            registration2Id: b,
            status: MATCH_STATUS.READY,
          },
        });
      }
    }
    const fixed = arr[0];
    const rest = arr.slice(1);
    rest.unshift(rest.pop()!);
    arr.splice(0, arr.length, fixed, ...rest);
  }
}

async function generateDoubleElimination(
  tx: Tx,
  tournamentId: string,
  registrations: { id: string }[],
): Promise<void> {
  const n = registrations.length;
  const size = nextPowerOfTwo(n);
  const k = Math.log2(size);
  const seeds = seedOrder(size);

  const grandFinal = await tx.match.create({
    data: { tournamentId, bracket: MATCH_BRACKET.GRAND_FINAL, round: 1, slot: 0 },
  });

  // Winners bracket, built final-round-first so nextMatchId can always target an
  // already-created row.
  const wbIdsByRound: string[][] = [];
  let nextRoundIds: string[] = [];
  for (let r = k; r >= 1; r--) {
    const count = size / 2 ** r;
    const ids: string[] = [];
    for (let idx = 0; idx < count; idx++) {
      const nextMatchId = r === k ? grandFinal.id : nextRoundIds[Math.floor(idx / 2)];
      const nextMatchSlot = r === k ? 1 : (idx % 2) + 1;
      const m = await tx.match.create({
        data: { tournamentId, bracket: MATCH_BRACKET.WB, round: r, slot: idx, nextMatchId, nextMatchSlot },
      });
      ids.push(m.id);
    }
    wbIdsByRound[r - 1] = ids;
    nextRoundIds = ids;
  }

  // Losers bracket: for k=1 there's no LB at all, the sole WB match's loser drops
  // straight into the grand final.
  if (k === 1) {
    await tx.match.update({
      where: { id: wbIdsByRound[0][0] },
      data: { loserNextMatchId: grandFinal.id, loserNextMatchSlot: 2 },
    });
  } else {
    let prevDropIn: string[] = [];
    for (let i = 1; i <= k - 1; i++) {
      const sizeI = size / 2 ** (i + 1);

      const consolIds: string[] = [];
      for (let j = 0; j < sizeI; j++) {
        const m = await tx.match.create({
          data: { tournamentId, bracket: MATCH_BRACKET.LB, round: 2 * i - 1, slot: j },
        });
        consolIds.push(m.id);
      }
      if (i === 1) {
        const wbR1 = wbIdsByRound[0];
        for (let j = 0; j < sizeI; j++) {
          await tx.match.update({
            where: { id: wbR1[2 * j] },
            data: { loserNextMatchId: consolIds[j], loserNextMatchSlot: 1 },
          });
          await tx.match.update({
            where: { id: wbR1[2 * j + 1] },
            data: { loserNextMatchId: consolIds[j], loserNextMatchSlot: 2 },
          });
        }
      } else {
        for (let j = 0; j < sizeI; j++) {
          await tx.match.update({
            where: { id: prevDropIn[2 * j] },
            data: { nextMatchId: consolIds[j], nextMatchSlot: 1 },
          });
          await tx.match.update({
            where: { id: prevDropIn[2 * j + 1] },
            data: { nextMatchId: consolIds[j], nextMatchSlot: 2 },
          });
        }
      }

      const dropInIds: string[] = [];
      for (let j = 0; j < sizeI; j++) {
        const m = await tx.match.create({
          data: { tournamentId, bracket: MATCH_BRACKET.LB, round: 2 * i, slot: j },
        });
        dropInIds.push(m.id);
      }
      for (let j = 0; j < sizeI; j++) {
        await tx.match.update({
          where: { id: consolIds[j] },
          data: { nextMatchId: dropInIds[j], nextMatchSlot: 1 },
        });
      }
      const wbSourceRound = wbIdsByRound[i]; // WB round (i+1)
      for (let j = 0; j < sizeI; j++) {
        await tx.match.update({
          where: { id: wbSourceRound[j] },
          data: { loserNextMatchId: dropInIds[j], loserNextMatchSlot: 2 },
        });
      }
      if (i === k - 1) {
        await tx.match.update({
          where: { id: dropInIds[0] },
          data: { nextMatchId: grandFinal.id, nextMatchSlot: 2 },
        });
      }
      prevDropIn = dropInIds;
    }
  }

  // Seed WB round 1, resolving byes and marking any losers-bracket slots that a bye
  // makes structurally unfillable.
  const wbR1Ids = wbIdsByRound[0];
  for (let j = 0; j < wbR1Ids.length; j++) {
    const seedA = seeds[2 * j];
    const seedB = seeds[2 * j + 1];
    const regA = seedA <= n ? registrations[seedA - 1].id : null;
    const regB = seedB <= n ? registrations[seedB - 1].id : null;
    const isBye = !regA || !regB;
    const status = isBye ? MATCH_STATUS.COMPLETED : MATCH_STATUS.READY;
    const winner = isBye ? regA ?? regB : null;

    const match = await tx.match.update({
      where: { id: wbR1Ids[j] },
      data: { registration1Id: regA, registration2Id: regB, isBye, status, winnerRegistrationId: winner },
    });

    if (isBye && winner && match.nextMatchId && match.nextMatchSlot) {
      await placeIntoMatch(tx, match.nextMatchId, match.nextMatchSlot, winner);
    }
    if (isBye && match.loserNextMatchId && match.loserNextMatchSlot) {
      await markPhantom(tx, match.loserNextMatchId, match.loserNextMatchSlot);
    }
  }
}

export async function generateBracket(tournamentId: string): Promise<void> {
  await prisma.$transaction(
    async (tx) => {
      const existing = await tx.match.count({ where: { tournamentId } });
      if (existing > 0) throw new Error("A bracket has already been generated for this tournament");

      const tournament = await tx.tournament.findUnique({ where: { id: tournamentId } });
      if (!tournament) throw new Error("Tournament not found");

      const registrations = await tx.registration.findMany({
        where: { tournamentId, status: APPROVAL.APPROVED },
        orderBy: { createdAt: "asc" },
        select: { id: true },
      });
      if (registrations.length < 2) {
        throw new Error("Need at least 2 approved registrations to generate a bracket");
      }

      switch (tournament.format) {
        case TOURNAMENT_FORMATS.SINGLE_ELIMINATION:
          await generateSingleElimination(tx, tournamentId, registrations);
          break;
        case TOURNAMENT_FORMATS.DOUBLE_ELIMINATION:
          await generateDoubleElimination(tx, tournamentId, registrations);
          break;
        case TOURNAMENT_FORMATS.ROUND_ROBIN:
          await generateRoundRobin(tx, tournamentId, registrations);
          break;
        default:
          throw new Error(`Bracket generation isn't available yet for ${tournament.format} tournaments`);
      }
    },
    { maxWait: 20000, timeout: 60000 },
  );
}

export async function reportMatchResult(
  matchId: string,
  input: { score1: number | null; score2: number | null; winnerRegistrationId: string },
): Promise<void> {
  await prisma.$transaction(
    async (tx) => {
      const match = await tx.match.findUnique({ where: { id: matchId } });
      if (!match) throw new Error("Match not found");
      if (match.status === MATCH_STATUS.COMPLETED) throw new Error("This match has already been reported");
      if (!match.registration1Id || !match.registration2Id) {
        throw new Error("This match isn't ready yet — both participants must be set first");
      }
      if (![match.registration1Id, match.registration2Id].includes(input.winnerRegistrationId)) {
        throw new Error("Winner must be one of the two participants in this match");
      }

      await tx.match.update({
        where: { id: matchId },
        data: {
          score1: input.score1,
          score2: input.score2,
          winnerRegistrationId: input.winnerRegistrationId,
          status: MATCH_STATUS.COMPLETED,
        },
      });

      const loserRegistrationId =
        input.winnerRegistrationId === match.registration1Id ? match.registration2Id : match.registration1Id;

      if (match.nextMatchId && match.nextMatchSlot) {
        await placeIntoMatch(tx, match.nextMatchId, match.nextMatchSlot, input.winnerRegistrationId);
      }
      if (match.loserNextMatchId && match.loserNextMatchSlot) {
        await placeIntoMatch(tx, match.loserNextMatchId, match.loserNextMatchSlot, loserRegistrationId);
      }

      // Double-elimination bracket reset: if the participant who arrived via the
      // losers bracket (slot 2, by construction) wins the grand final, both sides
      // now have exactly one loss, so a decider match is required.
      if (match.bracket === MATCH_BRACKET.GRAND_FINAL && match.round === 1 && input.winnerRegistrationId === match.registration2Id) {
        await tx.match.create({
          data: {
            tournamentId: match.tournamentId,
            bracket: MATCH_BRACKET.GRAND_FINAL,
            round: 2,
            slot: 0,
            registration1Id: match.registration2Id,
            registration2Id: match.registration1Id,
            status: MATCH_STATUS.READY,
          },
        });
      }
    },
    { maxWait: 10000, timeout: 20000 },
  );
}

export type StandingsRow = {
  registrationId: string;
  played: number;
  wins: number;
  losses: number;
  points: number;
};

export function computeRoundRobinStandings(
  registrationIds: string[],
  matches: { registration1Id: string | null; registration2Id: string | null; winnerRegistrationId: string | null; status: string }[],
): StandingsRow[] {
  const rows = new Map<string, StandingsRow>();
  for (const id of registrationIds) rows.set(id, { registrationId: id, played: 0, wins: 0, losses: 0, points: 0 });

  for (const match of matches) {
    if (match.status !== MATCH_STATUS.COMPLETED || !match.winnerRegistrationId) continue;
    const { registration1Id, registration2Id, winnerRegistrationId } = match;
    if (!registration1Id || !registration2Id) continue;
    const loserId = winnerRegistrationId === registration1Id ? registration2Id : registration1Id;

    const winnerRow = rows.get(winnerRegistrationId);
    const loserRow = rows.get(loserId);
    if (winnerRow) {
      winnerRow.played += 1;
      winnerRow.wins += 1;
      winnerRow.points += 3;
    }
    if (loserRow) {
      loserRow.played += 1;
      loserRow.losses += 1;
    }
  }

  return [...rows.values()].sort((a, b) => b.points - a.points || b.wins - a.wins);
}
