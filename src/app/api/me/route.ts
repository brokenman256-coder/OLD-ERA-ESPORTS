import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser, hashPassword, verifyPassword, signSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { SESSION_COOKIE } from "@/lib/constants";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ user: null });

  return NextResponse.json({
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      firmName: user.firmName,
      avatarUrl: user.avatarUrl,
      bio: user.bio,
      discordHandle: user.discordHandle,
      twitterUrl: user.twitterUrl,
      websiteUrl: user.websiteUrl,
      gmail: user.gmail,
      gameUid: user.gameUid,
      isVerified: user.isVerified,
      emailVerified: Boolean(user.emailVerifiedAt),
    },
  });
}

export async function PATCH(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const body = await req.json().catch(() => null);
  if (!body?.currentPassword || !body?.newPassword) {
    return NextResponse.json({ error: "Current and new password are required" }, { status: 400 });
  }
  if (String(body.newPassword).length < 8) {
    return NextResponse.json({ error: "New password must be at least 8 characters" }, { status: 400 });
  }

  const valid = await verifyPassword(body.currentPassword, user.passwordHash);
  if (!valid) {
    return NextResponse.json({ error: "Current password is incorrect" }, { status: 401 });
  }

  const passwordHash = await hashPassword(body.newPassword);
  // Bump sessionVersion so any other device's cookie is invalidated, then
  // immediately reissue this device's cookie with the new version so the
  // user changing their own password isn't logged out too.
  const updated = await prisma.user.update({
    where: { id: user.id },
    data: { passwordHash, sessionVersion: { increment: 1 } },
  });

  const token = signSession({ userId: updated.id, role: updated.role, sessionVersion: updated.sessionVersion });
  const res = NextResponse.json({ ok: true });
  res.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
  return res;
}
