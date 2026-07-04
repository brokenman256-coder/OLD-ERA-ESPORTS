import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireUser, AuthError } from "@/lib/auth";
import { ROLES } from "@/lib/constants";

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; userId: string }> }
) {
  try {
    const user = await requireUser();
    const { id, userId } = await params;

    const team = await prisma.team.findUnique({ where: { id } });
    if (!team) return NextResponse.json({ error: "Team not found" }, { status: 404 });

    const isCaptain = team.captainId === user.id;
    const isSelf = user.id === userId;

    if (!isCaptain && !isSelf && user.role !== ROLES.ADMIN) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    if (userId === team.captainId) {
      return NextResponse.json(
        { error: "The captain can't be removed. Delete the team instead." },
        { status: 400 }
      );
    }

    await prisma.teamMember.delete({ where: { teamId_userId: { teamId: id, userId } } }).catch(() => null);

    return NextResponse.json({ ok: true });
  } catch (err) {
    if (err instanceof AuthError) return NextResponse.json({ error: err.message }, { status: err.status });
    console.error(err);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
