import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireUser, AuthError } from "@/lib/auth";

export async function GET() {
  try {
    const user = await requireUser();

    const messages = await prisma.supportMessage.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "asc" },
    });

    await prisma.supportMessage.updateMany({
      where: { userId: user.id, fromAdmin: true, read: false },
      data: { read: true },
    });

    return NextResponse.json({ messages });
  } catch (err) {
    if (err instanceof AuthError) return NextResponse.json({ error: err.message }, { status: err.status });
    console.error(err);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireUser();

    const body = await req.json().catch(() => null);
    const text = typeof body?.body === "string" ? body.body.trim() : "";
    if (!text) return NextResponse.json({ error: "Message cannot be empty" }, { status: 400 });
    if (text.length > 2000) return NextResponse.json({ error: "Message is too long" }, { status: 400 });

    const message = await prisma.supportMessage.create({
      data: { userId: user.id, body: text, fromAdmin: false },
    });

    return NextResponse.json({ message });
  } catch (err) {
    if (err instanceof AuthError) return NextResponse.json({ error: err.message }, { status: err.status });
    console.error(err);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
