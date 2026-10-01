import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { ROLES } from "@/lib/constants";

const EDITABLE_FIELDS = [
  "name",
  "bio",
  "discordHandle",
  "twitterUrl",
  "websiteUrl",
  "gmail",
  "firmName",
  "gameUid",
  "organizerUpiId",
] as const;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function PATCH(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  const data: Record<string, unknown> = {};
  for (const field of EDITABLE_FIELDS) {
    if (field === "firmName" && user.role !== ROLES.ORGANIZER) continue;
    if (field === "organizerUpiId" && user.role !== ROLES.ORGANIZER) continue;
    if (field === "gameUid" && user.role !== ROLES.PLAYER) continue;
    if (field in body) data[field] = String(body[field] ?? "").slice(0, 2000) || null;
  }

  if (typeof data.name === "string" && data.name.trim().length < 2) {
    return NextResponse.json({ error: "Name must be at least 2 characters" }, { status: 400 });
  }

  if (typeof data.gmail === "string" && !EMAIL_PATTERN.test(data.gmail)) {
    return NextResponse.json({ error: "Please enter a valid email address" }, { status: 400 });
  }

  if (user.role === ROLES.PLAYER && Array.isArray(body.defaultSquad)) {
    const squad = body.defaultSquad as { name?: string; gameId?: string; instagram?: string; whatsapp?: string }[];
    if (
      squad.length !== 4 ||
      squad.some((m) => !m?.name?.trim() || !m?.gameId?.trim() || !m?.instagram?.trim() || !m?.whatsapp?.trim())
    ) {
      return NextResponse.json(
        { error: "Please provide the name, in-game ID, Instagram ID, and WhatsApp number for all 4 squad members" },
        { status: 400 }
      );
    }
    data.defaultSquad = squad.map((m) => ({
      name: m.name!.trim(),
      gameId: m.gameId!.trim(),
      instagram: m.instagram!.trim(),
      whatsapp: m.whatsapp!.trim(),
    }));
  }

  const updated = await prisma.user.update({ where: { id: user.id }, data });

  return NextResponse.json({
    user: {
      id: updated.id,
      name: updated.name,
      email: updated.email,
      role: updated.role,
      firmName: updated.firmName,
      avatarUrl: updated.avatarUrl,
      bio: updated.bio,
      discordHandle: updated.discordHandle,
      twitterUrl: updated.twitterUrl,
      websiteUrl: updated.websiteUrl,
      gmail: updated.gmail,
      gameUid: updated.gameUid,
      defaultSquad: updated.defaultSquad,
      organizerUpiId: updated.organizerUpiId,
      organizerQrUrl: updated.organizerQrUrl,
      isVerified: updated.isVerified,
    },
  });
}
