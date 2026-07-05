import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireRole, AuthError } from "@/lib/auth";
import { ROLES } from "@/lib/constants";
import { creditWallet } from "@/lib/wallet";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireRole(ROLES.ADMIN);
    const { id } = await params;

    const body = await req.json().catch(() => null);
    const status = body?.status;
    if (!["PAID", "REJECTED"].includes(status)) {
      return NextResponse.json({ error: "status must be PAID or REJECTED" }, { status: 400 });
    }

    const withdrawal = await prisma.withdrawalRequest.findUnique({ where: { id } });
    if (!withdrawal) return NextResponse.json({ error: "Withdrawal request not found" }, { status: 404 });
    if (withdrawal.status !== "PENDING") {
      return NextResponse.json({ error: "This request has already been processed" }, { status: 400 });
    }

    if (status === "REJECTED") {
      await creditWallet(withdrawal.userId, withdrawal.amount, "WITHDRAWAL_REVERSAL", "Withdrawal rejected — refunded");
    }

    const updated = await prisma.withdrawalRequest.update({
      where: { id },
      data: { status, reviewNote: body?.reviewNote ?? null, processedAt: new Date() },
    });

    return NextResponse.json({ withdrawal: updated });
  } catch (err) {
    if (err instanceof AuthError) return NextResponse.json({ error: err.message }, { status: err.status });
    console.error(err);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
