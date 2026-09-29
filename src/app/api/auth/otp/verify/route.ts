import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { hashOtp, otpStillValid, MAX_ATTEMPTS } from "@/lib/otp";

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  if (user.emailVerifiedAt) {
    return NextResponse.json({ error: "Your email is already verified" }, { status: 400 });
  }

  const body = await req.json().catch(() => null);
  const code = String(body?.code ?? "").trim();
  if (!/^\d{6}$/.test(code)) {
    return NextResponse.json({ error: "Enter the 6-digit code" }, { status: 400 });
  }

  if (!user.emailOtpCode || !otpStillValid(user.emailOtpExpiresAt)) {
    return NextResponse.json({ error: "Code expired — request a new one" }, { status: 400 });
  }
  if (user.emailOtpAttempts >= MAX_ATTEMPTS) {
    return NextResponse.json({ error: "Too many attempts — request a new code" }, { status: 429 });
  }

  if (hashOtp(code) !== user.emailOtpCode) {
    await prisma.user.update({ where: { id: user.id }, data: { emailOtpAttempts: { increment: 1 } } });
    return NextResponse.json({ error: "Incorrect code" }, { status: 400 });
  }

  await prisma.user.update({
    where: { id: user.id },
    data: {
      emailVerifiedAt: new Date(),
      emailOtpCode: null,
      emailOtpExpiresAt: null,
      emailOtpAttempts: 0,
    },
  });

  return NextResponse.json({ ok: true });
}
