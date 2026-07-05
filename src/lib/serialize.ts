import type { Tournament, Registration, User, Team, TeamMember, PlayerMatch } from "@prisma/client";

export function publicUser(user: User) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    firmName: user.firmName,
    phone: user.phone,
    isBanned: user.isBanned,
    avatarUrl: user.avatarUrl,
    bio: user.bio,
    discordHandle: user.discordHandle,
    twitterUrl: user.twitterUrl,
    websiteUrl: user.websiteUrl,
    isVerified: user.isVerified,
    walletBalance: user.walletBalance,
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
    bannerUrl: t.bannerUrl,
    tags: t.tags,
    discordUrl: t.discordUrl,
    streamUrl: t.streamUrl,
    format: t.format,
    status: t.status,
    reviewNote: t.reviewNote,
    hostingFeeProof: t.hostingFeeProof,
    hostingFeeVerified: t.hostingFeeVerified,
    hostingFeePaidWithWallet: t.hostingFeePaidWithWallet,
    createdAt: t.createdAt,
    organizerId: t.organizerId,
    organizer: t.organizer
      ? {
          id: t.organizer.id,
          name: t.organizer.name,
          firmName: t.organizer.firmName,
          avatarUrl: t.organizer.avatarUrl,
          isVerified: t.organizer.isVerified,
        }
      : undefined,
  };
}

export function publicRegistration(r: Registration & { player?: User; team?: Team | null }) {
  return {
    id: r.id,
    tournamentId: r.tournamentId,
    playerId: r.playerId,
    teamName: r.teamName,
    teamId: r.teamId,
    contactPhone: r.contactPhone,
    squadMembers: r.squadMembers,
    paymentProof: r.paymentProof,
    resultProof: r.resultProof,
    paidWithWallet: r.paidWithWallet,
    status: r.status,
    reviewNote: r.reviewNote,
    createdAt: r.createdAt,
    player: r.player ? { id: r.player.id, name: r.player.name, email: r.player.email } : undefined,
    team: r.team ? { id: r.team.id, name: r.team.name, tag: r.team.tag } : undefined,
  };
}

export function publicPlayerMatch(
  m: PlayerMatch & { creator?: User },
  { includeCode }: { includeCode: boolean }
) {
  return {
    id: m.id,
    mode: m.mode,
    title: m.title,
    description: m.description,
    matchCode: includeCode ? m.matchCode : null,
    entryFee: m.entryFee,
    maxSlots: m.maxSlots,
    startDate: m.startDate,
    status: m.status,
    reviewNote: m.reviewNote,
    createdAt: m.createdAt,
    creatorId: m.creatorId,
    creator: m.creator ? { id: m.creator.id, name: m.creator.name, avatarUrl: m.creator.avatarUrl } : undefined,
  };
}

export function publicTeam(t: Team & { members?: (TeamMember & { user: User })[]; captain?: User }) {
  return {
    id: t.id,
    name: t.name,
    tag: t.tag,
    captainId: t.captainId,
    captain: t.captain ? { id: t.captain.id, name: t.captain.name } : undefined,
    createdAt: t.createdAt,
    members: t.members?.map((m) => ({
      userId: m.userId,
      name: m.user.name,
      email: m.user.email,
      avatarUrl: m.user.avatarUrl,
      joinedAt: m.joinedAt,
    })),
  };
}
