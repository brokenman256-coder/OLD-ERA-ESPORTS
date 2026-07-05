import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireRole, AuthError } from "@/lib/auth";
import { ROLES } from "@/lib/constants";
import { publicPlayerMatch } from "@/lib/serialize";

export async function GET(req: NextRequest) {
  try {
    await requireRole(ROLES.ADMIN);
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");

    const matches = await prisma.playerMatch.findMany({
      where: status ? { status } : {},
      orderBy: { createdAt: "desc" },
      include: { creator: true },
    });

    return NextResponse.json({
      matches: matches.map((m) => ({
        ...publicPlayerMatch(m, { includeCode: true }),
        creatorEmail: m.creator.email,
      })),
    });
  } catch (err) {
    if (err instanceof AuthError) return NextResponse.json({ error: err.message }, { status: err.status });
    console.error(err);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
