import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireRole, AuthError } from "@/lib/auth";
import { ROLES } from "@/lib/constants";

export async function GET(req: NextRequest) {
  try {
    await requireRole(ROLES.ADMIN);
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    const transactions = await prisma.walletTransaction.findMany({
      where: userId ? { userId } : {},
      orderBy: { createdAt: "desc" },
      take: 200,
      include: { user: { select: { id: true, name: true, email: true, role: true } } },
    });

    return NextResponse.json({ transactions });
  } catch (err) {
    if (err instanceof AuthError) return NextResponse.json({ error: err.message }, { status: err.status });
    console.error(err);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
