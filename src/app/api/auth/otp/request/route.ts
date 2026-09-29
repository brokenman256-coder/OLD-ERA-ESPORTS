import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { generateOtp } from "@/lib/otp";
import { emailIsConfigured, sendEmail } from "@/lib/email";

const RESEND_COOLDOWN_MS = 60 * 1000;

export async function POST() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  if (user.emailVerifiedAt) {
    return NextResponse.json({ error: "Your email is already verified" }, { status: 400 });
  }

  if (!emailIsConfigured()) {
    return NextResponse.json(
      { error: "Email verification isn't set up on this site yet — contact support." },
      { status: 503 }
    );
  }

  if (user.emailOtpExpiresAt) {
    const sentAt = user.emailOtpExpiresAt.getTime() - 10 * 60 * 1000;
    if (Date.now() - sentAt < RESEND_COOLDOWN_MS) {
      return NextResponse.json({ error: "Please wait a moment before requesting another code." }, { status: 429 });
    }
  }

  const { code, hash, expiresAt } = generateOtp();

  await prisma.user.update({
    where: { id: user.id },
    data: { emailOtpCode: hash, emailOtpExpiresAt: expiresAt, emailOtpAttempts: 0 },
  });

  await sendEmail({
    to: user.email,
    subject: "Your Vantix verification code",
    text: `Your Vantix verification code is ${code}. It expires in 10 minutes. If you didn't request this, you can ignore this email.`,
  });

  return NextResponse.json({ ok: true });
}
