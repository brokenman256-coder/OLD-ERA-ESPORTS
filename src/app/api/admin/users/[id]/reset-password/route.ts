import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireRole, hashPassword, AuthError } from "@/lib/auth";
import { ROLES } from "@/lib/constants";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireRole(ROLES.ADMIN);
    const { id } = await params;

    const body = await req.json().catch(() => null);
    const newPassword = String(body?.newPassword ?? "");
    if (newPassword.length < 8) {
      return NextResponse.json({ error: "New password must be at least 8 characters" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const passwordHash = await hashPassword(newPassword);
    await prisma.user.update({ where: { id }, data: { passwordHash } });

    return NextResponse.json({ ok: true });
  } catch (err) {
    if (err instanceof AuthError) return NextResponse.json({ error: err.message }, { status: err.status });
    console.error(err);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
