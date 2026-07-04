import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  const promos = await prisma.promoBanner.findMany({
    where: { active: true },
    orderBy: { order: "asc" },
  });

  return NextResponse.json({ promos });
}
