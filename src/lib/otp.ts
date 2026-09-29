import crypto from "crypto";

const OTP_TTL_MS = 10 * 60 * 1000;
const MAX_ATTEMPTS = 5;

export function generateOtp() {
  const code = crypto.randomInt(0, 1_000_000).toString().padStart(6, "0");
  const hash = hashOtp(code);
  return { code, hash, expiresAt: new Date(Date.now() + OTP_TTL_MS) };
}

export function hashOtp(code: string) {
  return crypto.createHash("sha256").update(code).digest("hex");
}

export function otpStillValid(expiresAt: Date | null) {
  return Boolean(expiresAt && expiresAt.getTime() > Date.now());
}

export { MAX_ATTEMPTS };
