import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { verifyPassword, signSession } from "@/lib/auth";
import { SESSION_COOKIE } from "@/lib/constants";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const { email, password } = parsed.data;

  const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
  if (!user) {
    return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
  }
  if (user.isBanned) {
    return NextResponse.json({ error: "This account has been suspended" }, { status: 403 });
  }

  const valid = await verifyPassword(password, user.passwordHash);
  if (!valid) {
    return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
  }

  const token = signSession({ userId: user.id, role: user.role });

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
