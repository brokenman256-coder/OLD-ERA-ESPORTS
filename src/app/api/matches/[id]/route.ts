import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { ROLES } from "@/lib/constants";
import { reportMatchResult } from "@/lib/bracket";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const match = await prisma.match.findUnique({ where: { id }, include: { tournament: true } });
  if (!match) return NextResponse.json({ error: "Match not found" }, { status: 404 });

  const isAdmin = user.role === ROLES.ADMIN;
  const isOwner = user.id === match.tournament.organizerId;
  if (!isAdmin && !isOwner) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await req.json().catch(() => null);
  if (!body || typeof body.winnerRegistrationId !== "string") {
    return NextResponse.json({ error: "winnerRegistrationId is required" }, { status: 400 });
  }

  const score1 = typeof body.score1 === "number" ? body.score1 : body.score1 ? Number(body.score1) : null;
  const score2 = typeof body.score2 === "number" ? body.score2 : body.score2 ? Number(body.score2) : null;

  try {
    await reportMatchResult(id, { score1, score2, winnerRegistrationId: body.winnerRegistrationId });
    return NextResponse.json({ ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Something went wrong";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
