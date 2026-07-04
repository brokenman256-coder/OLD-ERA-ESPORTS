import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireRole, AuthError } from "@/lib/auth";
import { ROLES } from "@/lib/constants";
import { publicUser } from "@/lib/serialize";

export async function GET() {
  try {
    await requireRole(ROLES.ADMIN);
    const users = await prisma.user.findMany({ orderBy: { createdAt: "desc" } });
    return NextResponse.json({ users: users.map(publicUser) });
  } catch (err) {
    if (err instanceof AuthError) return NextResponse.json({ error: err.message }, { status: err.status });
    console.error(err);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
