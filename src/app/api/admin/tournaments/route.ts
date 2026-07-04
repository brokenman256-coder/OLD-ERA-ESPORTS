import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireRole, AuthError } from "@/lib/auth";
import { ROLES } from "@/lib/constants";
import { publicTournament } from "@/lib/serialize";

export async function GET(req: NextRequest) {
  try {
    await requireRole(ROLES.ADMIN);
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");

    const tournaments = await prisma.tournament.findMany({
      where: status ? { status } : {},
      orderBy: { createdAt: "desc" },
      include: { organizer: true, _count: { select: { registrations: true } } },
    });

    return NextResponse.json({
      tournaments: tournaments.map((t) => ({
        ...publicTournament(t),
        registrationCount: t._count.registrations,
        organizerEmail: t.organizer.email,
      })),
    });
  } catch (err) {
    if (err instanceof AuthError) return NextResponse.json({ error: err.message }, { status: err.status });
    console.error(err);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
