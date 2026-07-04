import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser, AuthError } from "@/lib/auth";
import { savePaymentScreenshot, saveTournamentBanner, UploadError } from "@/lib/upload";
import { APPROVAL, ROLES, TOURNAMENT_FORMATS } from "@/lib/constants";
import { publicTournament } from "@/lib/serialize";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const mine = searchParams.get("mine");
  const game = searchParams.get("game");
  const search = searchParams.get("q");

  if (mine) {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

    const tournaments = await prisma.tournament.findMany({
      where: { organizerId: user.id },
      orderBy: { createdAt: "desc" },
      include: { organizer: true },
    });
    return NextResponse.json({ tournaments: tournaments.map(publicTournament) });
  }

  const tournaments = await prisma.tournament.findMany({
    where: {
      status: APPROVAL.APPROVED,
      ...(game ? { game: { contains: game } } : {}),
      ...(search
        ? {
            OR: [
              { title: { contains: search } },
              { description: { contains: search } },
            ],
          }
        : {}),
    },
    orderBy: { startDate: "asc" },
    include: { organizer: true },
  });

  return NextResponse.json({ tournaments: tournaments.map(publicTournament) });
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    if (user.role !== ROLES.ORGANIZER && user.role !== ROLES.ADMIN) {
      return NextResponse.json({ error: "Only organizers can post tournaments" }, { status: 403 });
    }

    const form = await req.formData();

    const title = String(form.get("title") ?? "").trim();
    const game = String(form.get("game") ?? "").trim();
    const description = String(form.get("description") ?? "").trim();
    const rules = form.get("rules") ? String(form.get("rules")) : null;
    const prizePool = form.get("prizePool") ? String(form.get("prizePool")) : null;
    const entryFee = Number(form.get("entryFee") ?? 0);
    const hostingFee = Number(form.get("hostingFee") ?? 0);
    const maxSlotsRaw = form.get("maxSlots");
    const maxSlots = maxSlotsRaw ? Number(maxSlotsRaw) : null;
    const startDateRaw = String(form.get("startDate") ?? "");
    const endDateRaw = form.get("endDate") ? String(form.get("endDate")) : null;
    const tags = form.get("tags") ? String(form.get("tags")).trim() : null;
    const discordUrl = form.get("discordUrl") ? String(form.get("discordUrl")).trim() : null;
    const streamUrl = form.get("streamUrl") ? String(form.get("streamUrl")).trim() : null;
    const formatRaw = form.get("format") ? String(form.get("format")) : TOURNAMENT_FORMATS.SINGLE_ELIMINATION;
    const format = Object.values(TOURNAMENT_FORMATS).includes(formatRaw as never)
      ? formatRaw
      : TOURNAMENT_FORMATS.SINGLE_ELIMINATION;

    if (!title || !game || !description || !startDateRaw) {
      return NextResponse.json({ error: "Title, game, description, and start date are required" }, { status: 400 });
    }
    const startDate = new Date(startDateRaw);
    if (isNaN(startDate.getTime())) {
      return NextResponse.json({ error: "Invalid start date" }, { status: 400 });
    }
    const endDate = endDateRaw ? new Date(endDateRaw) : null;
    if (endDate && isNaN(endDate.getTime())) {
      return NextResponse.json({ error: "Invalid end date" }, { status: 400 });
    }
    if (Number.isNaN(entryFee) || entryFee < 0 || Number.isNaN(hostingFee) || hostingFee < 0) {
      return NextResponse.json({ error: "Fees must be non-negative numbers" }, { status: 400 });
    }

    let hostingFeeProof: string | null = null;
    const proofFile = form.get("hostingFeeProof");
    if (proofFile instanceof File && proofFile.size > 0) {
      hostingFeeProof = await savePaymentScreenshot(proofFile);
    }

    if (hostingFee > 0 && !hostingFeeProof) {
      return NextResponse.json(
        { error: "Please upload a payment screenshot for the hosting fee" },
        { status: 400 }
      );
    }

    let bannerUrl: string | null = null;
    const bannerFile = form.get("banner");
    if (bannerFile instanceof File && bannerFile.size > 0) {
      bannerUrl = await saveTournamentBanner(bannerFile);
    }

    const tournament = await prisma.tournament.create({
      data: {
        title,
        game,
        description,
        rules,
        prizePool,
        entryFee,
        hostingFee,
        maxSlots,
        startDate,
        endDate,
        bannerUrl,
        tags,
        discordUrl,
        streamUrl,
        format,
        organizerId: user.id,
        hostingFeeProof,
        status: APPROVAL.PENDING,
      },
    });

    return NextResponse.json({ tournament: publicTournament(tournament) }, { status: 201 });
  } catch (err) {
    if (err instanceof AuthError) return NextResponse.json({ error: err.message }, { status: err.status });
    if (err instanceof UploadError) return NextResponse.json({ error: err.message }, { status: 400 });
    console.error(err);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
