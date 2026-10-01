import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { hashPassword, signSession } from "@/lib/auth";
import { ROLES, SESSION_COOKIE } from "@/lib/constants";
import { saveQrCode, UploadError } from "@/lib/upload";

const schema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  password: z
    .string()
    .min(8)
    .max(200)
    .regex(/[A-Za-z]/, "Password must contain at least one letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
  role: z.enum([ROLES.PLAYER, ROLES.ORGANIZER]),
  firmName: z.string().max(200).optional(),
  phone: z.string().max(30).optional(),
  gameUid: z.string().max(50).optional(),
  organizerUpiId: z.string().max(100).optional(),
});

export async function POST(req: NextRequest) {
  const form = await req.formData().catch(() => null);
  if (!form) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  const raw = {
    name: String(form.get("name") ?? ""),
    email: String(form.get("email") ?? ""),
    password: String(form.get("password") ?? ""),
    role: String(form.get("role") ?? ""),
    firmName: form.get("firmName") ? String(form.get("firmName")) : undefined,
    phone: form.get("phone") ? String(form.get("phone")) : undefined,
    gameUid: form.get("gameUid") ? String(form.get("gameUid")) : undefined,
    organizerUpiId: form.get("organizerUpiId") ? String(form.get("organizerUpiId")) : undefined,
  };

  const parsed = schema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });
  }

  const { name, email, password, role, firmName, phone, gameUid, organizerUpiId } = parsed.data;

  if (role === ROLES.ORGANIZER && !firmName?.trim()) {
    return NextResponse.json({ error: "Firm / company name is required for organizers" }, { status: 400 });
  }
  if (!phone?.trim()) {
    return NextResponse.json({ error: "Phone number is required" }, { status: 400 });
  }
  if (role === ROLES.PLAYER && !gameUid?.trim()) {
    return NextResponse.json({ error: "Your BGMI UID is required to register as a player" }, { status: 400 });
  }

  let defaultSquad: { name: string; gameId: string; instagram: string; whatsapp: string }[] | null = null;
  if (role === ROLES.PLAYER) {
    try {
      defaultSquad = JSON.parse(String(form.get("squadMembers") ?? "[]"));
    } catch {
      defaultSquad = [];
    }
    if (
      !Array.isArray(defaultSquad) ||
      defaultSquad.length !== 4 ||
      defaultSquad.some(
        (m) => !m?.name?.trim() || !m?.gameId?.trim() || !m?.instagram?.trim() || !m?.whatsapp?.trim()
      )
    ) {
      return NextResponse.json(
        { error: "Please provide the name, in-game ID, Instagram ID, and WhatsApp number for all 4 squad members" },
        { status: 400 }
      );
    }
  }

  let organizerQrUrl: string | null = null;
  if (role === ROLES.ORGANIZER) {
    if (!organizerUpiId?.trim()) {
      return NextResponse.json({ error: "Your UPI ID is required to register as an organizer" }, { status: 400 });
    }
    const qrFile = form.get("organizerQr");
    if (!(qrFile instanceof File) || qrFile.size === 0) {
      return NextResponse.json({ error: "A payment QR code is required to register as an organizer" }, { status: 400 });
    }
    try {
      organizerQrUrl = await saveQrCode(qrFile);
    } catch (err) {
      if (err instanceof UploadError) return NextResponse.json({ error: err.message }, { status: 400 });
      throw err;
    }
  }

  const existing = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
  if (existing) {
    return NextResponse.json({ error: "An account with this email already exists" }, { status: 409 });
  }

  const passwordHash = await hashPassword(password);

  const user = await prisma.user.create({
    data: {
      name,
      email: email.toLowerCase(),
      passwordHash,
      role,
      firmName: role === ROLES.ORGANIZER ? firmName : null,
      phone,
      gameUid: role === ROLES.PLAYER ? gameUid?.trim() : null,
      defaultSquad: role === ROLES.PLAYER ? defaultSquad ?? undefined : undefined,
      organizerUpiId: role === ROLES.ORGANIZER ? organizerUpiId?.trim() : null,
      organizerQrUrl: role === ROLES.ORGANIZER ? organizerQrUrl : null,
    },
  });

  const token = signSession({ userId: user.id, role: user.role, sessionVersion: user.sessionVersion });

  const res = NextResponse.json({
    user: { id: user.id, name: user.name, email: user.email, role: user.role },
  });
  res.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
  return res;
}
