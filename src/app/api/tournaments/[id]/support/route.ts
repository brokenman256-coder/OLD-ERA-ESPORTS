import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { ROLES } from "@/lib/constants";

// Per-tournament help center: one thread per (tournament, player) pair,
// answered by that tournament's organizer (or admin) — separate from the
// site-wide support inbox to admin.
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const tournament = await prisma.tournament.findUnique({ where: { id } });
  if (!tournament) return NextResponse.json({ error: "Tournament not found" }, { status: 404 });

  const isOrganizer = user.id === tournament.organizerId || user.role === ROLES.ADMIN;

  if (isOrganizer) {
    const messages = await prisma.tournamentSupportMessage.findMany({
      where: { tournamentId: id },
      orderBy: { createdAt: "asc" },
      include: { user: { select: { id: true, name: true, email: true } } },
    });
    await prisma.tournamentSupportMessage.updateMany({
      where: { tournamentId: id, fromOrganizer: false, read: false },
      data: { read: true },
    });
    return NextResponse.json({ messages, isOrganizer: true });
  }

  const messages = await prisma.tournamentSupportMessage.findMany({
    where: { tournamentId: id, userId: user.id },
    orderBy: { createdAt: "asc" },
  });
  await prisma.tournamentSupportMessage.updateMany({
    where: { tournamentId: id, userId: user.id, fromOrganizer: true, read: false },
    data: { read: true },
  });
  return NextResponse.json({ messages, isOrganizer: false });
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const tournament = await prisma.tournament.findUnique({ where: { id } });
  if (!tournament) return NextResponse.json({ error: "Tournament not found" }, { status: 404 });

  const body = await req.json().catch(() => null);
  const text = typeof body?.body === "string" ? body.body.trim() : "";
  if (!text) return NextResponse.json({ error: "Message cannot be empty" }, { status: 400 });
  if (text.length > 2000) return NextResponse.json({ error: "Message is too long" }, { status: 400 });

  const isOrganizer = user.id === tournament.organizerId || user.role === ROLES.ADMIN;

  if (isOrganizer) {
    const targetUserId = typeof body?.targetUserId === "string" ? body.targetUserId : null;
    if (!targetUserId) return NextResponse.json({ error: "targetUserId is required" }, { status: 400 });
    const message = await prisma.tournamentSupportMessage.create({
      data: { tournamentId: id, userId: targetUserId, body: text, fromOrganizer: true },
    });
    return NextResponse.json({ message });
  }

  const message = await prisma.tournamentSupportMessage.create({
    data: { tournamentId: id, userId: user.id, body: text, fromOrganizer: false },
  });
  return NextResponse.json({ message });
}
