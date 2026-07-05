import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireUser, AuthError } from "@/lib/auth";
import { saveWalletTopUpProof, UploadError } from "@/lib/upload";

export async function POST(req: NextRequest) {
  try {
    const user = await requireUser();

    const form = await req.formData();
    const amount = Number(form.get("amount") ?? 0);
    if (Number.isNaN(amount) || amount <= 0) {
      return NextResponse.json({ error: "Amount must be a positive number" }, { status: 400 });
    }

    const proofFile = form.get("proof");
    if (!(proofFile instanceof File) || proofFile.size === 0) {
      return NextResponse.json({ error: "Please upload a screenshot of your payment" }, { status: 400 });
    }

    const proof = await saveWalletTopUpProof(proofFile);
    const topUp = await prisma.walletTopUp.create({
      data: { userId: user.id, amount, proof, status: "PENDING" },
    });

    return NextResponse.json({ topUp }, { status: 201 });
  } catch (err) {
    if (err instanceof AuthError) return NextResponse.json({ error: err.message }, { status: err.status });
    if (err instanceof UploadError) return NextResponse.json({ error: err.message }, { status: 400 });
    console.error(err);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
