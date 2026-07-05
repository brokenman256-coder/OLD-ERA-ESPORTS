import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { ROLES } from "@/lib/constants";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const tournament = await prisma.tournament.findUnique({ where: { id } });
  if (!tournament) return NextResponse.json({ error: "Tournament not found" }, { status: 404 });

  const isAdmin = user.role === ROLES.ADMIN;
  const isOwner = user.id === tournament.organizerId;
  if (!isAdmin && !isOwner) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  const roomId = typeof body.roomId === "string" ? body.roomId.trim() || null : undefined;
  const roomPassword = typeof body.roomPassword === "string" ? body.roomPassword.trim() || null : undefined;

  const updated = await prisma.tournament.update({
    where: { id },
    data: { ...(roomId !== undefined && { roomId }), ...(roomPassword !== undefined && { roomPassword }) },
  });

  return NextResponse.json({ roomId: updated.roomId, roomPassword: updated.roomPassword });
}
