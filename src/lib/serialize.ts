import type { Tournament, Registration, User } from "@prisma/client";

export function publicUser(user: User) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    firmName: user.firmName,
    phone: user.phone,
    isBanned: user.isBanned,
    createdAt: user.createdAt,
  };
}

export function publicTournament(t: Tournament & { organizer?: User }) {
  return {
    id: t.id,
    title: t.title,
    game: t.game,
    description: t.description,
    rules: t.rules,
    prizePool: t.prizePool,
    entryFee: t.entryFee,
    hostingFee: t.hostingFee,
    maxSlots: t.maxSlots,
    startDate: t.startDate,
    endDate: t.endDate,
    status: t.status,
    reviewNote: t.reviewNote,
    hostingFeeProof: t.hostingFeeProof,
    hostingFeeVerified: t.hostingFeeVerified,
    createdAt: t.createdAt,
    organizerId: t.organizerId,
    organizer: t.organizer
      ? { id: t.organizer.id, name: t.organizer.name, firmName: t.organizer.firmName }
      : undefined,
  };
}

export function publicRegistration(r: Registration & { player?: User }) {
  return {
    id: r.id,
    tournamentId: r.tournamentId,
    playerId: r.playerId,
    teamName: r.teamName,
    paymentProof: r.paymentProof,
    status: r.status,
    reviewNote: r.reviewNote,
    createdAt: r.createdAt,
    player: r.player ? { id: r.player.id, name: r.player.name, email: r.player.email } : undefined,
  };
}
