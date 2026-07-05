export const ROLES = {
  PLAYER: "PLAYER",
  ORGANIZER: "ORGANIZER",
  ADMIN: "ADMIN",
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];

export const APPROVAL = {
  PENDING: "PENDING",
  APPROVED: "APPROVED",
  REJECTED: "REJECTED",
} as const;

export type ApprovalStatus = (typeof APPROVAL)[keyof typeof APPROVAL];

export const TOURNAMENT_FORMATS = {
  SINGLE_ELIMINATION: "SINGLE_ELIMINATION",
  DOUBLE_ELIMINATION: "DOUBLE_ELIMINATION",
  ROUND_ROBIN: "ROUND_ROBIN",
  SWISS: "SWISS",
  BATTLE_ROYALE: "BATTLE_ROYALE",
} as const;

export type TournamentFormat = (typeof TOURNAMENT_FORMATS)[keyof typeof TOURNAMENT_FORMATS];

export const TOURNAMENT_FORMAT_LABELS: Record<string, string> = {
  SINGLE_ELIMINATION: "Single Elimination",
  DOUBLE_ELIMINATION: "Double Elimination",
  ROUND_ROBIN: "Round Robin",
  SWISS: "Swiss",
  BATTLE_ROYALE: "Battle Royale",
};

export const PLAYER_MATCH_MODES = {
  WOW: "WOW",
  TDM: "TDM",
} as const;

export type PlayerMatchMode = (typeof PLAYER_MATCH_MODES)[keyof typeof PLAYER_MATCH_MODES];

export const SESSION_COOKIE = "oee_session";
