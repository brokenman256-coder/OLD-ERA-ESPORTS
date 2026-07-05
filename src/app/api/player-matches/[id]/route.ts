import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { ROLES } from "@/lib/constants";

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const match = await prisma.playerMatch.findUnique({ where: { id } });
  if (!match) return NextResponse.json({ error: "Match not found" }, { status: 404 });

  const isAdmin = user.role === ROLES.ADMIN;
  const isCreator = user.id === match.creatorId;
  if (!isAdmin && !isCreator) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  await prisma.playerMatch.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
