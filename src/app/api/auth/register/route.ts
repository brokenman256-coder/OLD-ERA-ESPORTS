import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { hashPassword, signSession } from "@/lib/auth";
import { ROLES, SESSION_COOKIE } from "@/lib/constants";

const schema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  password: z.string().min(8).max(200),
  role: z.enum([ROLES.PLAYER, ROLES.ORGANIZER]),
  firmName: z.string().max(200).optional(),
  phone: z.string().max(30).optional(),
});

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });
  }

  const { name, email, password, role, firmName, phone } = parsed.data;

  if (role === ROLES.ORGANIZER && !firmName?.trim()) {
    return NextResponse.json({ error: "Firm / company name is required for organizers" }, { status: 400 });
  }
  if (role === ROLES.ORGANIZER && !phone?.trim()) {
    return NextResponse.json({ error: "Phone number is required for organizers" }, { status: 400 });
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
    },
  });

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
