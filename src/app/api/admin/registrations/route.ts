import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireRole, AuthError } from "@/lib/auth";
import { ROLES } from "@/lib/constants";
import { publicRegistration, publicTournament } from "@/lib/serialize";

export async function GET(req: NextRequest) {
  try {
    await requireRole(ROLES.ADMIN);
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");

    const registrations = await prisma.registration.findMany({
      where: status ? { status } : {},
      orderBy: { createdAt: "desc" },
      include: { player: true, tournament: { include: { organizer: true } } },
    });

    return NextResponse.json({
      registrations: registrations.map((r) => ({
        ...publicRegistration(r),
        tournament: publicTournament(r.tournament),
      })),
    });
  } catch (err) {
    if (err instanceof AuthError) return NextResponse.json({ error: err.message }, { status: err.status });
    console.error(err);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
