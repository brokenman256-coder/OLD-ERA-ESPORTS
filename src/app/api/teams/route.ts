import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireRole, AuthError } from "@/lib/auth";
import { ROLES } from "@/lib/constants";
import { publicTeam } from "@/lib/serialize";

export async function GET() {
  try {
    const user = await requireRole(ROLES.PLAYER, ROLES.ADMIN);

    const teams = await prisma.team.findMany({
      where: { members: { some: { userId: user.id } } },
      include: { members: { include: { user: true } }, captain: true },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ teams: teams.map(publicTeam) });
  } catch (err) {
    if (err instanceof AuthError) return NextResponse.json({ error: err.message }, { status: err.status });
    console.error(err);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireRole(ROLES.PLAYER, ROLES.ADMIN);

    const body = await req.json().catch(() => null);
    const name = String(body?.name ?? "").trim();
    const tag = body?.tag ? String(body.tag).trim().slice(0, 10) : null;

    if (!name || name.length < 2) {
      return NextResponse.json({ error: "Team name must be at least 2 characters" }, { status: 400 });
    }

    const team = await prisma.team.create({
      data: {
        name,
        tag,
        captainId: user.id,
        members: { create: { userId: user.id } },
      },
      include: { members: { include: { user: true } }, captain: true },
    });

    return NextResponse.json({ team: publicTeam(team) }, { status: 201 });
  } catch (err) {
    if (err instanceof AuthError) return NextResponse.json({ error: err.message }, { status: err.status });
    console.error(err);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
