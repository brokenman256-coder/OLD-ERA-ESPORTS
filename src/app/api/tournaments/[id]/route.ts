import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { APPROVAL, ROLES } from "@/lib/constants";
import { publicTournament } from "@/lib/serialize";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const tournament = await prisma.tournament.findUnique({ where: { id }, include: { organizer: true } });
  if (!tournament) return NextResponse.json({ error: "Tournament not found" }, { status: 404 });

  if (tournament.status !== APPROVAL.APPROVED) {
    const user = await getCurrentUser();
    const isOwner = user?.id === tournament.organizerId;
    const isAdmin = user?.role === ROLES.ADMIN;
    if (!isOwner && !isAdmin) {
      return NextResponse.json({ error: "Tournament not found" }, { status: 404 });
    }
  }

  return NextResponse.json({ tournament: publicTournament(tournament) });
}

const EDITABLE_FIELDS = [
  "title",
  "game",
  "description",
  "rules",
  "prizePool",
  "entryFee",
  "hostingFee",
  "maxSlots",
  "startDate",
  "endDate",
] as const;

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const tournament = await prisma.tournament.findUnique({ where: { id } });
  if (!tournament) return NextResponse.json({ error: "Tournament not found" }, { status: 404 });

  const isAdmin = user.role === ROLES.ADMIN;
  const isOwner = user.id === tournament.organizerId;

  if (!isAdmin && !isOwner) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  // Organizers can only edit their own tournament before it's been approved,
  // so a live/approved listing can't be silently changed after the fact.
  if (!isAdmin && tournament.status === APPROVAL.APPROVED) {
    return NextResponse.json(
      { error: "Approved tournaments can only be edited by an admin" },
      { status: 403 }
    );
  }

  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  const data: Record<string, unknown> = {};
  for (const field of EDITABLE_FIELDS) {
    if (field in body) data[field] = body[field];
  }
  if (typeof data.entryFee !== "undefined") data.entryFee = Number(data.entryFee);
  if (typeof data.hostingFee !== "undefined") data.hostingFee = Number(data.hostingFee);
  if (typeof data.maxSlots !== "undefined") data.maxSlots = data.maxSlots ? Number(data.maxSlots) : null;
  if (typeof data.startDate !== "undefined") data.startDate = new Date(data.startDate as string);
  if (typeof data.endDate !== "undefined") data.endDate = data.endDate ? new Date(data.endDate as string) : null;

  // Only admins may directly change status/verification/review fields.
  if (isAdmin) {
    if (typeof body.status !== "undefined") data.status = body.status;
    if (typeof body.reviewNote !== "undefined") data.reviewNote = body.reviewNote;
    if (typeof body.hostingFeeVerified !== "undefined") data.hostingFeeVerified = Boolean(body.hostingFeeVerified);
  }

  // Editing a rejected tournament resets it to pending for re-review.
  if (!isAdmin && tournament.status === APPROVAL.REJECTED) {
    data.status = APPROVAL.PENDING;
    data.reviewNote = null;
  }

  const updated = await prisma.tournament.update({ where: { id }, data });
  return NextResponse.json({ tournament: publicTournament(updated) });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const tournament = await prisma.tournament.findUnique({ where: { id } });
  if (!tournament) return NextResponse.json({ error: "Tournament not found" }, { status: 404 });

  const isAdmin = user.role === ROLES.ADMIN;
  const isOwner = user.id === tournament.organizerId;

  if (!isAdmin && !(isOwner && tournament.status !== APPROVAL.APPROVED)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await prisma.tournament.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
