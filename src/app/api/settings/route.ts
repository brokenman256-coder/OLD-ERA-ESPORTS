import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  const settings = await prisma.siteSettings.upsert({
    where: { id: "global" },
    update: {},
    create: { id: "global" },
  });

  return NextResponse.json({
    settings: {
      hostingFeeAmount: settings.hostingFeeAmount,
      upiId: settings.upiId,
      qrCodeUrl: settings.qrCodeUrl,
      whatsappLink: settings.whatsappLink,
      instagramUrl: settings.instagramUrl,
    },
  });
}
