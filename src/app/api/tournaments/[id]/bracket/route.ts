import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { ROLES } from "@/lib/constants";
import { publicMatch } from "@/lib/serialize";
import { generateBracket, computeRoundRobinStandings } from "@/lib/bracket";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const matches = await prisma.match.findMany({
    where: { tournamentId: id },
    include: {
      registration1: { include: { player: true } },
      registration2: { include: { player: true } },
    },
    orderBy: [{ bracket: "asc" }, { round: "asc" }, { slot: "asc" }],
  });

  if (matches.length === 0) {
    return NextResponse.json({ matches: [], standings: null });
  }

  const tournament = await prisma.tournament.findUnique({ where: { id }, select: { format: true } });

  let standings = null;
  if (tournament?.format === "ROUND_ROBIN") {
    const registrationIds = [
      ...new Set(matches.flatMap((m) => [m.registration1Id, m.registration2Id].filter((x): x is string => !!x))),
    ];
    const rows = computeRoundRobinStandings(registrationIds, matches);
    const nameById = new Map<string, string>();
    for (const m of matches) {
      if (m.registration1Id && m.registration1) {
        nameById.set(m.registration1Id, m.registration1.teamName || m.registration1.player?.name || "Unknown");
      }
      if (m.registration2Id && m.registration2) {
        nameById.set(m.registration2Id, m.registration2.teamName || m.registration2.player?.name || "Unknown");
      }
    }
    standings = rows.map((r) => ({ ...r, name: nameById.get(r.registrationId) ?? "Unknown" }));
  }

  return NextResponse.json({ matches: matches.map(publicMatch), standings });
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const tournament = await prisma.tournament.findUnique({ where: { id } });
  if (!tournament) return NextResponse.json({ error: "Tournament not found" }, { status: 404 });

  const isAdmin = user.role === ROLES.ADMIN;
  const isOwner = user.id === tournament.organizerId;
  if (!isAdmin && !isOwner) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    await generateBracket(id);
    return NextResponse.json({ ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Something went wrong";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
