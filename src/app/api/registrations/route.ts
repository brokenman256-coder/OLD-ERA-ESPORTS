import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { publicRegistration } from "@/lib/serialize";
import { publicTournament } from "@/lib/serialize";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const registrations = await prisma.registration.findMany({
    where: { playerId: user.id },
    orderBy: { createdAt: "desc" },
    include: { tournament: { include: { organizer: true } } },
  });

  return NextResponse.json({
    registrations: registrations.map((r) => ({
      ...publicRegistration(r),
      tournament: publicTournament(r.tournament),
    })),
  });
}
