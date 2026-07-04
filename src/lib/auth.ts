import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { prisma } from "@/lib/db";
import { SESSION_COOKIE } from "@/lib/constants";

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET environment variable is not set");
}

export interface SessionPayload {
  userId: string;
  role: string;
}

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}

export function signSession(payload: SessionPayload) {
  return jwt.sign(payload, JWT_SECRET as string, { expiresIn: "30d" });
}

export function verifySessionToken(token: string): SessionPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET as string) as SessionPayload;
  } catch {
    return null;
  }
}

export async function getCurrentUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  const payload = verifySessionToken(token);
  if (!payload) return null;

  const user = await prisma.user.findUnique({ where: { id: payload.userId } });
  if (!user || user.isBanned) return null;

  return user;
}

export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) throw new AuthError("Not authenticated", 401);
  return user;
}

export async function requireRole(...roles: string[]) {
  const user = await requireUser();
  if (!roles.includes(user.role)) throw new AuthError("Forbidden", 403);
  return user;
}

export class AuthError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}
