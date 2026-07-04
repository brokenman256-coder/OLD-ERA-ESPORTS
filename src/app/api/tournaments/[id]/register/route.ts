import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { savePaymentScreenshot, UploadError } from "@/lib/upload";
import { APPROVAL, ROLES } from "@/lib/constants";
import { publicRegistration } from "@/lib/serialize";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    if (user.role !== ROLES.PLAYER) {
      return NextResponse.json({ error: "Only players can register for tournaments" }, { status: 403 });
    }

    const tournament = await prisma.tournament.findUnique({ where: { id } });
    if (!tournament || tournament.status !== APPROVAL.APPROVED) {
      return NextResponse.json({ error: "Tournament not found" }, { status: 404 });
    }

    const existing = await prisma.registration.findUnique({
      where: { tournamentId_playerId: { tournamentId: id, playerId: user.id } },
    });
    if (existing) {
      return NextResponse.json({ error: "You have already registered for this tournament" }, { status: 409 });
    }

    if (tournament.maxSlots) {
      const count = await prisma.registration.count({
        where: { tournamentId: id, status: { not: APPROVAL.REJECTED } },
      });
      if (count >= tournament.maxSlots) {
        return NextResponse.json({ error: "This tournament is full" }, { status: 409 });
      }
    }

    const form = await req.formData();
    const teamName = form.get("teamName") ? String(form.get("teamName")) : null;
    const teamId = form.get("teamId") ? String(form.get("teamId")) : null;

    if (teamId) {
      const membership = await prisma.teamMember.findUnique({
        where: { teamId_userId: { teamId, userId: user.id } },
      });
      if (!membership) {
        return NextResponse.json({ error: "You're not a member of that team" }, { status: 403 });
      }
    }

    const contactPhone = String(form.get("contactPhone") ?? "").trim();
    if (!contactPhone) {
      return NextResponse.json({ error: "A contact phone number is required" }, { status: 400 });
    }

    let squadMembers: { name: string; gameId: string }[];
    try {
      squadMembers = JSON.parse(String(form.get("squadMembers") ?? "[]"));
    } catch {
      squadMembers = [];
    }
    if (
      !Array.isArray(squadMembers) ||
      squadMembers.length !== 4 ||
      squadMembers.some((m) => !m?.name?.trim() || !m?.gameId?.trim())
    ) {
      return NextResponse.json(
        { error: "Please provide the name and in-game ID for all 4 squad members" },
        { status: 400 }
      );
    }

    let paymentProof: string | null = null;
    const proofFile = form.get("paymentProof");
    if (proofFile instanceof File && proofFile.size > 0) {
      paymentProof = await savePaymentScreenshot(proofFile);
    }

    if (tournament.entryFee > 0 && !paymentProof) {
      return NextResponse.json(
        { error: "Please upload a payment screenshot for the entry fee" },
        { status: 400 }
      );
    }

    const registration = await prisma.registration.create({
      data: {
        tournamentId: id,
        playerId: user.id,
        teamName,
        teamId,
        contactPhone,
        squadMembers,
        paymentProof,
        status: tournament.entryFee > 0 ? APPROVAL.PENDING : APPROVAL.APPROVED,
      },
      include: { team: true },
    });

    return NextResponse.json({ registration: publicRegistration(registration) }, { status: 201 });
  } catch (err) {
    if (err instanceof UploadError) return NextResponse.json({ error: err.message }, { status: 400 });
    console.error(err);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
