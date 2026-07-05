import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireRole, AuthError } from "@/lib/auth";
import { ROLES } from "@/lib/constants";

export async function GET() {
  try {
    await requireRole(ROLES.ADMIN);

    const userIds = await prisma.supportMessage.findMany({
      distinct: ["userId"],
      select: { userId: true },
      orderBy: { createdAt: "desc" },
    });

    const threads = await Promise.all(
      userIds.map(async ({ userId }) => {
        const [user, lastMessage, unreadCount] = await Promise.all([
          prisma.user.findUnique({
            where: { id: userId },
            select: { id: true, name: true, email: true, role: true, firmName: true },
          }),
          prisma.supportMessage.findFirst({
            where: { userId },
            orderBy: { createdAt: "desc" },
          }),
          prisma.supportMessage.count({
            where: { userId, fromAdmin: false, read: false },
          }),
        ]);
        return { user, lastMessage, unreadCount };
      })
    );

    threads.sort((a, b) => {
      const at = a.lastMessage ? new Date(a.lastMessage.createdAt).getTime() : 0;
      const bt = b.lastMessage ? new Date(b.lastMessage.createdAt).getTime() : 0;
      return bt - at;
    });

    return NextResponse.json({ threads: threads.filter((t) => t.user) });
  } catch (err) {
    if (err instanceof AuthError) return NextResponse.json({ error: err.message }, { status: err.status });
    console.error(err);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
