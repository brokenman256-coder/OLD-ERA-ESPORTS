import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { AuthError, requireUser } from "@/lib/auth";
import { ROLES } from "@/lib/constants";

// Updates from a verified organizer (or admin), each tied to one of their own
// tournaments. Only reach the players actually registered for that
// tournament — not a sitewide broadcast. Admins see every announcement (for
// oversight); organizers see the ones they've sent.
export async function GET() {
  try {
    const user = await requireUser();

    const where =
      user.role === ROLES.ADMIN
        ? {}
        : user.role === ROLES.ORGANIZER
          ? { organizerId: user.id }
          : { tournament: { registrations: { some: { playerId: user.id } } } };

    const announcements = await prisma.announcement.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: 50,
      include: {
        organizer: { select: { id: true, name: true, firmName: true, isVerified: true } },
        tournament: { select: { id: true, title: true } },
      },
    });

    return NextResponse.json({
      announcements: announcements.map((a) => ({
        id: a.id,
        body: a.body,
        createdAt: a.createdAt,
        organizerName: a.organizer.firmName || a.organizer.name,
        organizerVerified: a.organizer.isVerified,
        tournament: a.tournament ? { id: a.tournament.id, title: a.tournament.title } : null,
      })),
    });
  } catch (err) {
    if (err instanceof AuthError) return NextResponse.json({ error: err.message }, { status: err.status });
    console.error(err);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireUser();
    const isAdmin = user.role === ROLES.ADMIN;
    const isOrganizer = user.role === ROLES.ORGANIZER;

    if (!isAdmin && !(isOrganizer && user.isVerified)) {
      return NextResponse.json(
        { error: "Only verified organizers or admins can send announcements" },
        { status: 403 }
      );
    }

    const body = await req.json().catch(() => null);
    const text = typeof body?.body === "string" ? body.body.trim() : "";
    if (!text) return NextResponse.json({ error: "Message cannot be empty" }, { status: 400 });
    if (text.length > 1000) return NextResponse.json({ error: "Message is too long" }, { status: 400 });

    const tournamentId = typeof body?.tournamentId === "string" ? body.tournamentId : null;
    if (!tournamentId) {
      return NextResponse.json({ error: "Please select which tournament this update is about" }, { status: 400 });
    }

    const tournament = await prisma.tournament.findUnique({ where: { id: tournamentId } });
    if (!tournament) return NextResponse.json({ error: "Tournament not found" }, { status: 404 });
    if (!isAdmin && tournament.organizerId !== user.id) {
      return NextResponse.json({ error: "You can only announce updates for your own tournaments" }, { status: 403 });
    }

    const announcement = await prisma.announcement.create({
      data: { organizerId: user.id, tournamentId, body: text },
    });

    return NextResponse.json({ announcement });
  } catch (err) {
    if (err instanceof AuthError) return NextResponse.json({ error: err.message }, { status: err.status });
    console.error(err);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
