import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { ROLES } from "@/lib/constants";

const EDITABLE_FIELDS = ["name", "bio", "discordHandle", "twitterUrl", "websiteUrl", "firmName"] as const;

export async function PATCH(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  const data: Record<string, unknown> = {};
  for (const field of EDITABLE_FIELDS) {
    if (field === "firmName" && user.role !== ROLES.ORGANIZER) continue;
    if (field in body) data[field] = String(body[field] ?? "").slice(0, 2000) || null;
  }

  if (typeof data.name === "string" && data.name.trim().length < 2) {
    return NextResponse.json({ error: "Name must be at least 2 characters" }, { status: 400 });
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
      isVerified: updated.isVerified,
    },
  });
}
