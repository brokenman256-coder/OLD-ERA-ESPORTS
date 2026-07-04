import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireUser, AuthError } from "@/lib/auth";
import { ROLES } from "@/lib/constants";
import { publicTeam } from "@/lib/serialize";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireUser();
    const { id } = await params;

    const team = await prisma.team.findUnique({ where: { id } });
    if (!team) return NextResponse.json({ error: "Team not found" }, { status: 404 });
    if (team.captainId !== user.id && user.role !== ROLES.ADMIN) {
      return NextResponse.json({ error: "Only the team captain can add members" }, { status: 403 });
    }

    const body = await req.json().catch(() => null);
    const email = String(body?.email ?? "").trim().toLowerCase();
    if (!email) return NextResponse.json({ error: "Email is required" }, { status: 400 });

    const target = await prisma.user.findUnique({ where: { email } });
    if (!target || target.role !== ROLES.PLAYER) {
      return NextResponse.json({ error: "No player account found with that email" }, { status: 404 });
    }

    const existing = await prisma.teamMember.findUnique({
      where: { teamId_userId: { teamId: id, userId: target.id } },
    });
    if (existing) {
      return NextResponse.json({ error: "That player is already on the team" }, { status: 409 });
    }

    await prisma.teamMember.create({ data: { teamId: id, userId: target.id } });

    const updated = await prisma.team.findUnique({
      where: { id },
      include: { members: { include: { user: true } }, captain: true },
    });

    return NextResponse.json({ team: publicTeam(updated!) }, { status: 201 });
  } catch (err) {
    if (err instanceof AuthError) return NextResponse.json({ error: err.message }, { status: err.status });
    console.error(err);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
