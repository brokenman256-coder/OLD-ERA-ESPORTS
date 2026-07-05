import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireRole, AuthError } from "@/lib/auth";
import { ROLES } from "@/lib/constants";
import { creditWallet, debitWallet, InsufficientBalanceError } from "@/lib/wallet";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireRole(ROLES.ADMIN);
    const { id } = await params;

    const target = await prisma.user.findUnique({ where: { id } });
    if (!target) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const body = await req.json().catch(() => null);
    const amount = Number(body?.amount);
    const direction = body?.direction;
    const note = typeof body?.note === "string" ? body.note.trim() || null : null;

    if (Number.isNaN(amount) || amount <= 0) {
      return NextResponse.json({ error: "Amount must be a positive number" }, { status: 400 });
    }
    if (!["CREDIT", "DEBIT"].includes(direction)) {
      return NextResponse.json({ error: "direction must be CREDIT or DEBIT" }, { status: 400 });
    }

    const balance =
      direction === "CREDIT"
        ? await creditWallet(id, amount, "ADMIN_CREDIT", note)
        : await debitWallet(id, amount, "ADMIN_DEBIT", note);

    return NextResponse.json({ balance });
  } catch (err) {
    if (err instanceof AuthError) return NextResponse.json({ error: err.message }, { status: err.status });
    if (err instanceof InsufficientBalanceError) {
      return NextResponse.json({ error: "User doesn't have enough balance for this debit" }, { status: 400 });
    }
    console.error(err);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
