import { NextResponse } from "next/server";
import { maybeRunBot } from "@/lib/bot";

export async function GET() {
  try {
    await maybeRunBot();
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
