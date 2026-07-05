import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireRole, AuthError } from "@/lib/auth";
import { ROLES } from "@/lib/constants";
import { saveQrCode, UploadError } from "@/lib/upload";

export async function POST(req: NextRequest) {
  try {
    await requireRole(ROLES.ADMIN);

    const form = await req.formData();
    const file = form.get("qr");
    if (!(file instanceof File) || file.size === 0) {
      return NextResponse.json({ error: "No image provided" }, { status: 400 });
    }

    const playerQrCodeUrl = await saveQrCode(file);
    const settings = await prisma.siteSettings.upsert({
      where: { id: "global" },
      update: { playerQrCodeUrl },
      create: { id: "global", playerQrCodeUrl },
    });

    return NextResponse.json({ settings });
  } catch (err) {
    if (err instanceof AuthError) return NextResponse.json({ error: err.message }, { status: err.status });
    if (err instanceof UploadError) return NextResponse.json({ error: err.message }, { status: 400 });
    console.error(err);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
