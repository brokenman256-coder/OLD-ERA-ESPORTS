import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireRole, AuthError } from "@/lib/auth";
import { APPROVAL, ROLES } from "@/lib/constants";
import { publicRegistration } from "@/lib/serialize";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireRole(ROLES.ADMIN);
    const { id } = await params;

    const body = await req.json().catch(() => null);
    const status = body?.status;
    if (![APPROVAL.APPROVED, APPROVAL.REJECTED].includes(status)) {
      return NextResponse.json({ error: "status must be APPROVED or REJECTED" }, { status: 400 });
    }

    const registration = await prisma.registration.findUnique({ where: { id } });
    if (!registration) return NextResponse.json({ error: "Registration not found" }, { status: 404 });

    const updated = await prisma.registration.update({
      where: { id },
      data: { status, reviewNote: body?.reviewNote ?? null },
    });

    return NextResponse.json({ registration: publicRegistration(updated) });
  } catch (err) {
    if (err instanceof AuthError) return NextResponse.json({ error: err.message }, { status: err.status });
    console.error(err);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
