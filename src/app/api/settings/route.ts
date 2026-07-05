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
      playerUpiId: settings.playerUpiId,
      playerQrCodeUrl: settings.playerQrCodeUrl,
      whatsappLink: settings.whatsappLink,
      instagramUrl: settings.instagramUrl,
      supportEmail: settings.supportEmail,
      supportPhone: settings.supportPhone,
      supportMessage: settings.supportMessage,
      displayLiveTournaments: settings.displayLiveTournaments,
      displayPlayers: settings.displayPlayers,
      displayOrganizers: settings.displayOrganizers,
    },
  });
}
