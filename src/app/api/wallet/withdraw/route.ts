import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireUser, AuthError } from "@/lib/auth";
import { debitWallet, InsufficientBalanceError } from "@/lib/wallet";

export async function POST(req: NextRequest) {
  try {
    const user = await requireUser();

    const body = await req.json().catch(() => null);
    if (!body) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

    const amount = Number(body.amount);
    const payoutInfo = String(body.payoutInfo ?? "").trim();

    if (Number.isNaN(amount) || amount <= 0) {
      return NextResponse.json({ error: "Amount must be a positive number" }, { status: 400 });
    }
    if (!payoutInfo) {
      return NextResponse.json({ error: "Please provide a UPI ID or payout details" }, { status: 400 });
    }

    await debitWallet(user.id, amount, "WITHDRAWAL", "Withdrawal requested");

    const withdrawal = await prisma.withdrawalRequest.create({
      data: { userId: user.id, amount, payoutInfo, status: "PENDING" },
    });

    return NextResponse.json({ withdrawal }, { status: 201 });
  } catch (err) {
    if (err instanceof AuthError) return NextResponse.json({ error: err.message }, { status: err.status });
    if (err instanceof InsufficientBalanceError) {
      return NextResponse.json({ error: "Insufficient wallet balance" }, { status: 400 });
    }
    console.error(err);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
