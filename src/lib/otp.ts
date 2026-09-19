import "server-only";
import { createHash, randomInt, timingSafeEqual } from "crypto";

export const OTP_EXPIRY_MINUTES = 10;
export const OTP_MAX_ATTEMPTS = 5;
/** Minimum seconds between OTP sends for the same employee code. */
export const OTP_RESEND_COOLDOWN_SECONDS = 60;

/** Generate a cryptographically secure 6-digit numeric OTP string. */
export function generateOtp(): string {
  return String(randomInt(0, 1_000_000)).padStart(6, "0");
}

/** SHA-256 hex digest of the raw OTP — what we store in the DB. */
export function hashOtp(raw: string): string {
  return createHash("sha256").update(raw).digest("hex");
}

/** Constant-time comparison of a raw candidate against a stored hash. */
export function verifyOtp(raw: string, storedHash: string): boolean {
  const candidateHash = hashOtp(raw);
  const a = Buffer.from(candidateHash, "utf8");
  const b = Buffer.from(storedHash, "utf8");
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}
