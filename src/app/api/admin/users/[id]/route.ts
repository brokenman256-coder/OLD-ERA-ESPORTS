import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireRole, requireUser, AuthError } from "@/lib/auth";
import { ROLES } from "@/lib/constants";
import { publicUser } from "@/lib/serialize";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const admin = await requireRole(ROLES.ADMIN);
    const { id } = await params;

    const body = await req.json().catch(() => null);
    if (!body) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

    if (id === admin.id && (body.role || typeof body.isBanned === "boolean")) {
      return NextResponse.json({ error: "You cannot change your own role or ban status" }, { status: 400 });
    }

    const data: Record<string, unknown> = {};
    if (body.role && Object.values(ROLES).includes(body.role)) data.role = body.role;
    if (typeof body.isBanned === "boolean") data.isBanned = body.isBanned;
    if (typeof body.name === "string") data.name = body.name;
    if (typeof body.firmName === "string") data.firmName = body.firmName;

    const updated = await prisma.user.update({ where: { id }, data });
    return NextResponse.json({ user: publicUser(updated) });
  } catch (err) {
    if (err instanceof AuthError) return NextResponse.json({ error: err.message }, { status: err.status });
    console.error(err);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const admin = await requireUser();
    if (admin.role !== ROLES.ADMIN) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    const { id } = await params;

    if (id === admin.id) {
      return NextResponse.json({ error: "You cannot delete your own account" }, { status: 400 });
    }

    await prisma.user.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (err) {
    if (err instanceof AuthError) return NextResponse.json({ error: err.message }, { status: err.status });
    console.error(err);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
