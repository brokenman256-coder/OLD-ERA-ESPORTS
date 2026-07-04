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
        paymentProof,
        status: tournament.entryFee > 0 ? APPROVAL.PENDING : APPROVAL.APPROVED,
      },
    });

    return NextResponse.json({ registration: publicRegistration(registration) }, { status: 201 });
  } catch (err) {
    if (err instanceof UploadError) return NextResponse.json({ error: err.message }, { status: 400 });
    console.error(err);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
