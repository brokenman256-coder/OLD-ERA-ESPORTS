import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { saveResultScreenshot, UploadError } from "@/lib/upload";
import { APPROVAL } from "@/lib/constants";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

    const registration = await prisma.registration.findUnique({
      where: { id },
      include: { tournament: true },
    });
    if (!registration || registration.playerId !== user.id) {
      return NextResponse.json({ error: "Registration not found" }, { status: 404 });
    }
    if (registration.status !== APPROVAL.APPROVED) {
      return NextResponse.json({ error: "Only approved registrations can submit a result" }, { status: 400 });
    }
    if (new Date(registration.tournament.startDate).getTime() > Date.now()) {
      return NextResponse.json({ error: "The match hasn't started yet" }, { status: 400 });
    }

    const form = await req.formData();
    const file = form.get("resultProof");
    if (!(file instanceof File) || file.size === 0) {
      return NextResponse.json({ error: "Please upload a screenshot of the match result" }, { status: 400 });
    }

    const resultProof = await saveResultScreenshot(file);
    const updated = await prisma.registration.update({ where: { id }, data: { resultProof } });

    return NextResponse.json({ resultProof: updated.resultProof });
  } catch (err) {
    if (err instanceof UploadError) return NextResponse.json({ error: err.message }, { status: 400 });
    console.error(err);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
