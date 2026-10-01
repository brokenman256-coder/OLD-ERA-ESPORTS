import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { ROLES } from "@/lib/constants";
import { saveQrCode, UploadError } from "@/lib/upload";

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    if (user.role !== ROLES.ORGANIZER) {
      return NextResponse.json({ error: "Only organizers have a payment QR code" }, { status: 403 });
    }

    const form = await req.formData();
    const file = form.get("qr");
    if (!(file instanceof File) || file.size === 0) {
      return NextResponse.json({ error: "No image provided" }, { status: 400 });
    }

    const organizerQrUrl = await saveQrCode(file);
    await prisma.user.update({ where: { id: user.id }, data: { organizerQrUrl } });

    return NextResponse.json({ organizerQrUrl });
  } catch (err) {
    if (err instanceof UploadError) return NextResponse.json({ error: err.message }, { status: 400 });
    console.error(err);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
