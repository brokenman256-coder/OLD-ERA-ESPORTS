import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireRole, AuthError } from "@/lib/auth";
import { ROLES } from "@/lib/constants";

export async function PATCH(req: NextRequest) {
  try {
    await requireRole(ROLES.ADMIN);

    const body = await req.json().catch(() => null);
    if (!body) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

    const data: Record<string, unknown> = {};
    if (typeof body.hostingFeeAmount !== "undefined") {
      const fee = Number(body.hostingFeeAmount);
      if (Number.isNaN(fee) || fee < 0) {
        return NextResponse.json({ error: "Hosting fee must be a non-negative number" }, { status: 400 });
      }
      data.hostingFeeAmount = fee;
    }
    if (typeof body.upiId === "string") data.upiId = body.upiId.trim() || null;
    if (typeof body.whatsappLink === "string") data.whatsappLink = body.whatsappLink.trim() || null;
    if (typeof body.instagramUrl === "string") data.instagramUrl = body.instagramUrl.trim() || null;

    const settings = await prisma.siteSettings.upsert({
      where: { id: "global" },
      update: data,
      create: { id: "global", ...data },
    });

    return NextResponse.json({ settings });
  } catch (err) {
    if (err instanceof AuthError) return NextResponse.json({ error: err.message }, { status: err.status });
    console.error(err);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
