import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { hashPassword } from "@/lib/auth";
import { savePaymentScreenshot, UploadError } from "@/lib/upload";
import { APPROVAL, ROLES } from "@/lib/constants";
import { publicRegistration } from "@/lib/serialize";
import crypto from "crypto";

// No-login registration for tournaments that opt in (allowGuestRegistration).
// A lightweight "guest" User is found-or-created per phone number so the
// existing Registration/wallet/admin-verify plumbing — all of which keys off
// a playerId — works unchanged; guests never receive a usable password or
// session, they just submit the form once.
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    const tournament = await prisma.tournament.findUnique({ where: { id } });
    if (!tournament || tournament.status !== APPROVAL.APPROVED) {
      return NextResponse.json({ error: "Tournament not found" }, { status: 404 });
    }
    if (!tournament.allowGuestRegistration) {
      return NextResponse.json({ error: "This tournament requires an account to register" }, { status: 403 });
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

    const contactPhoneRaw = String(form.get("contactPhone") ?? "").trim();
    const normalizedPhone = contactPhoneRaw.replace(/\D/g, "");
    if (!contactPhoneRaw || normalizedPhone.length < 7) {
      return NextResponse.json({ error: "A valid contact phone number is required" }, { status: 400 });
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
    const utrNumber = String(form.get("utrNumber") ?? "").trim() || null;

    if (tournament.entryFee > 0 && !paymentProof) {
      return NextResponse.json({ error: "Please upload a payment screenshot for the entry fee" }, { status: 400 });
    }
    if (tournament.entryFee > 0 && !utrNumber) {
      return NextResponse.json(
        { error: "Please enter the UTR / transaction reference number for your payment" },
        { status: 400 }
      );
    }

    const guestEmail = `guest-${normalizedPhone}@vantix.guest`;
    const guest = await prisma.user.upsert({
      where: { email: guestEmail },
      update: {},
      create: {
        name: teamName || squadMembers[0].name,
        email: guestEmail,
        passwordHash: await hashPassword(crypto.randomUUID()),
        role: ROLES.PLAYER,
        phone: contactPhoneRaw,
        isGuest: true,
      },
    });

    const existing = await prisma.registration.findUnique({
      where: { tournamentId_playerId: { tournamentId: id, playerId: guest.id } },
    });
    if (existing) {
      return NextResponse.json(
        { error: "You have already registered for this tournament with this phone number" },
        { status: 409 }
      );
    }

    const registration = await prisma.registration.create({
      data: {
        tournamentId: id,
        playerId: guest.id,
        teamName,
        contactPhone: contactPhoneRaw,
        squadMembers,
        paymentProof,
        utrNumber,
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
