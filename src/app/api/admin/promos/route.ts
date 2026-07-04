import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireRole, AuthError } from "@/lib/auth";
import { ROLES } from "@/lib/constants";
import { savePromoBanner, UploadError } from "@/lib/upload";

export async function GET() {
  try {
    await requireRole(ROLES.ADMIN);
    const promos = await prisma.promoBanner.findMany({ orderBy: { order: "asc" } });
    return NextResponse.json({ promos });
  } catch (err) {
    if (err instanceof AuthError) return NextResponse.json({ error: err.message }, { status: err.status });
    console.error(err);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await requireRole(ROLES.ADMIN);

    const form = await req.formData();
    const title = String(form.get("title") ?? "").trim();
    const linkUrl = form.get("linkUrl") ? String(form.get("linkUrl")).trim() : null;
    const image = form.get("image");

    if (!title) return NextResponse.json({ error: "Title is required" }, { status: 400 });
    if (!(image instanceof File) || image.size === 0) {
      return NextResponse.json({ error: "An image is required" }, { status: 400 });
    }

    const imageUrl = await savePromoBanner(image);
    const count = await prisma.promoBanner.count();

    const promo = await prisma.promoBanner.create({
      data: { title, linkUrl, imageUrl, order: count },
    });

    return NextResponse.json({ promo }, { status: 201 });
  } catch (err) {
    if (err instanceof AuthError) return NextResponse.json({ error: err.message }, { status: err.status });
    if (err instanceof UploadError) return NextResponse.json({ error: err.message }, { status: 400 });
    console.error(err);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
