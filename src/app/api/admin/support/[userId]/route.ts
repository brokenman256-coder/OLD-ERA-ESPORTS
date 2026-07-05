import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireRole, AuthError } from "@/lib/auth";
import { ROLES } from "@/lib/constants";

export async function GET(req: NextRequest, { params }: { params: Promise<{ userId: string }> }) {
  try {
    await requireRole(ROLES.ADMIN);
    const { userId } = await params;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, email: true, role: true, firmName: true },
    });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const messages = await prisma.supportMessage.findMany({
      where: { userId },
      orderBy: { createdAt: "asc" },
    });

    await prisma.supportMessage.updateMany({
      where: { userId, fromAdmin: false, read: false },
      data: { read: true },
    });

    return NextResponse.json({ user, messages });
  } catch (err) {
    if (err instanceof AuthError) return NextResponse.json({ error: err.message }, { status: err.status });
    console.error(err);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ userId: string }> }) {
  try {
    await requireRole(ROLES.ADMIN);
    const { userId } = await params;

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const body = await req.json().catch(() => null);
    const text = typeof body?.body === "string" ? body.body.trim() : "";
    if (!text) return NextResponse.json({ error: "Message cannot be empty" }, { status: 400 });
    if (text.length > 2000) return NextResponse.json({ error: "Message is too long" }, { status: 400 });

    const message = await prisma.supportMessage.create({
      data: { userId, body: text, fromAdmin: true },
    });

    return NextResponse.json({ message });
  } catch (err) {
    if (err instanceof AuthError) return NextResponse.json({ error: err.message }, { status: err.status });
    console.error(err);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
