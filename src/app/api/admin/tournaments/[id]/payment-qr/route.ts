import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireRole, AuthError } from "@/lib/auth";
import { ROLES } from "@/lib/constants";
import { saveQrCode, UploadError } from "@/lib/upload";
import { publicTournament } from "@/lib/serialize";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireRole(ROLES.ADMIN);
    const { id } = await params;

    const tournament = await prisma.tournament.findUnique({ where: { id } });
    if (!tournament) return NextResponse.json({ error: "Tournament not found" }, { status: 404 });

    const form = await req.formData();
    const file = form.get("qr");
    if (!(file instanceof File) || file.size === 0) {
      return NextResponse.json({ error: "No image provided" }, { status: 400 });
    }

    const paymentQrUrl = await saveQrCode(file);
    const updated = await prisma.tournament.update({ where: { id }, data: { paymentQrUrl } });

    return NextResponse.json({ tournament: publicTournament(updated) });
  } catch (err) {
    if (err instanceof AuthError) return NextResponse.json({ error: err.message }, { status: err.status });
    if (err instanceof UploadError) return NextResponse.json({ error: err.message }, { status: 400 });
    console.error(err);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
