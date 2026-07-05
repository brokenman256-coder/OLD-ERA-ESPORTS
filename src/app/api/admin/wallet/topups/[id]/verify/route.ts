import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireRole, AuthError } from "@/lib/auth";
import { ROLES, APPROVAL } from "@/lib/constants";
import { creditWallet } from "@/lib/wallet";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireRole(ROLES.ADMIN);
    const { id } = await params;

    const body = await req.json().catch(() => null);
    const status = body?.status;
    if (![APPROVAL.APPROVED, APPROVAL.REJECTED].includes(status)) {
      return NextResponse.json({ error: "status must be APPROVED or REJECTED" }, { status: 400 });
    }

    const topUp = await prisma.walletTopUp.findUnique({ where: { id } });
    if (!topUp) return NextResponse.json({ error: "Top-up request not found" }, { status: 404 });
    if (topUp.status !== "PENDING") {
      return NextResponse.json({ error: "This request has already been reviewed" }, { status: 400 });
    }

    if (status === APPROVAL.APPROVED) {
      await creditWallet(topUp.userId, topUp.amount, "TOPUP", "Wallet top-up approved");
    }

    const updated = await prisma.walletTopUp.update({
      where: { id },
      data: { status, reviewNote: body?.reviewNote ?? null },
    });

    return NextResponse.json({ topUp: updated });
  } catch (err) {
    if (err instanceof AuthError) return NextResponse.json({ error: err.message }, { status: err.status });
    console.error(err);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
