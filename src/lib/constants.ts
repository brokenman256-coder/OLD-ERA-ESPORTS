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

export const SESSION_COOKIE = "oee_session";
