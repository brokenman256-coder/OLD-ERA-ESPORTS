import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { APPROVAL, PLAYER_MATCH_MODES, ROLES } from "@/lib/constants";
import { publicPlayerMatch } from "@/lib/serialize";

export async function GET(req: NextRequest) {
  const user = await getCurrentUser();
  const { searchParams } = new URL(req.url);
  const mine = searchParams.get("mine");

  if (mine) {
    if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    const matches = await prisma.playerMatch.findMany({
      where: { creatorId: user.id },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({
      matches: matches.map((m) => publicPlayerMatch(m, { includeCode: true })),
    });
  }

  const mode = searchParams.get("mode");
  const matches = await prisma.playerMatch.findMany({
    where: {
      status: APPROVAL.APPROVED,
      ...(mode ? { mode } : {}),
    },
    orderBy: { startDate: "asc" },
    include: { creator: true },
  });

  return NextResponse.json({
    matches: matches.map((m) => publicPlayerMatch(m, { includeCode: !!user })),
  });
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    if (user.role !== ROLES.PLAYER) {
      return NextResponse.json({ error: "Only players can create matches" }, { status: 403 });
    }

    const body = await req.json().catch(() => null);
    if (!body) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

    const mode = String(body.mode ?? "");
    if (!Object.values(PLAYER_MATCH_MODES).includes(mode as never)) {
      return NextResponse.json({ error: "Mode must be WOW or TDM" }, { status: 400 });
    }

    const title = String(body.title ?? "").trim();
    const matchCode = String(body.matchCode ?? "").trim();
    const description = body.description ? String(body.description).trim() : null;
    const startDateRaw = String(body.startDate ?? "");
    const entryFee = Number(body.entryFee ?? 0);
    const maxSlotsRaw = body.maxSlots;
    const maxSlots = maxSlotsRaw ? Number(maxSlotsRaw) : null;

    if (!title || !matchCode || !startDateRaw) {
      return NextResponse.json({ error: "Title, match code, and start time are required" }, { status: 400 });
    }
    const startDate = new Date(startDateRaw);
    if (isNaN(startDate.getTime())) {
      return NextResponse.json({ error: "Invalid start time" }, { status: 400 });
    }
    if (Number.isNaN(entryFee) || entryFee < 0) {
      return NextResponse.json({ error: "Entry fee must be a non-negative number" }, { status: 400 });
    }

    const match = await prisma.playerMatch.create({
      data: {
        mode,
        title,
        description,
        matchCode,
        entryFee,
        maxSlots,
        startDate,
        creatorId: user.id,
        status: APPROVAL.PENDING,
      },
    });

    return NextResponse.json({ match: publicPlayerMatch(match, { includeCode: true }) }, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
