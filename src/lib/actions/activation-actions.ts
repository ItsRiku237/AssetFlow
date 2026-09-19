"use server";

import { Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/password";
import { sendOtpEmail } from "@/lib/email";
import {
  generateOtp,
  hashOtp,
  verifyOtp,
  OTP_EXPIRY_MINUTES,
  OTP_MAX_ATTEMPTS,
  OTP_RESEND_COOLDOWN_SECONDS,
} from "@/lib/otp";
import {
  step1Schema,
  step3Schema,
  type ActivationActionState,
} from "@/lib/validations/activation";

export type { ActivationActionState };

/** Generic message returned for any employee-lookup failure.
 *  Never reveal whether an employee code exists or not. */
const SAFE_REJECTION =
  "Employee information could not be verified. Check your Employee ID and company email, or contact your administrator.";

// ─── Step 1: verify employee + email match, then send OTP ──────────────────

export async function verifyAndSendOtp(
  _prev: ActivationActionState,
  formData: FormData
): Promise<ActivationActionState> {
  const parsed = step1Schema.safeParse({
    employeeCode: formData.get("employeeCode"),
    email: formData.get("email"),
  });

  if (!parsed.success) {
    return {
      step: 1,
      error: parsed.error.issues[0]?.message ?? "Invalid input.",
    };
  }

  const { employeeCode, email } = parsed.data;

  // ── Look up the employee record ──
  const employee = await prisma.employee.findUnique({
    where: { employeeCode },
    select: { id: true, status: true, userId: true, email: true },
  });

  // Uniform rejection — no leaking whether code exists.
  if (
    !employee ||
    employee.status !== "ACTIVE" ||
    employee.userId !== null
  ) {
    return { step: 1, error: SAFE_REJECTION };
  }

  // Employee must have a directory email for OTP-based activation.
  if (!employee.email) {
    return {
      step: 1,
      error:
        "Please contact your administrator to add your company email to the directory before activating.",
    };
  }

  // The supplied email must exactly match the directory email.
  if (employee.email.toLowerCase() !== email.toLowerCase()) {
    return { step: 1, error: SAFE_REJECTION };
  }

  // ── Rate-limit: don't send again within the cooldown window ──
  const latest = await prisma.employeeOtp.findFirst({
    where: { employeeCode },
    orderBy: { createdAt: "desc" },
    select: { createdAt: true },
  });

  if (latest) {
    const secondsSince =
      (Date.now() - latest.createdAt.getTime()) / 1_000;
    if (secondsSince < OTP_RESEND_COOLDOWN_SECONDS) {
      const wait = Math.ceil(OTP_RESEND_COOLDOWN_SECONDS - secondsSince);
      return {
        step: 1,
        error: `Please wait ${wait} second${wait === 1 ? "" : "s"} before requesting another code.`,
      };
    }
  }

  // ── Generate + hash OTP ──
  const raw = generateOtp();
  const codeHash = hashOtp(raw);
  const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1_000);

  // ── Send before writing to DB — don't persist if email fails ──
  const sendResult = await sendOtpEmail({
    to: employee.email,
    otp: raw,
    expiryMinutes: OTP_EXPIRY_MINUTES,
  });

  if (!sendResult.ok) {
    return { step: 1, error: sendResult.error };
  }

  // ── Persist the hashed OTP ──
  await prisma.employeeOtp.create({
    data: { employeeCode, codeHash, expiresAt },
  });

  return { step: 2, error: null, employeeCode, email, maskedEmail: maskEmail(employee.email) };
}

// ─── Step 2: verify OTP ────────────────────────────────────────────────────

export async function verifyOtpCode(
  _prev: ActivationActionState,
  formData: FormData
): Promise<ActivationActionState> {
  const employeeCode = String(formData.get("employeeCode") ?? "").trim();
  const code = String(formData.get("code") ?? "").trim();

  if (!employeeCode || !/^\d{6}$/.test(code)) {
    return {
      step: 2,
      error: "Enter the 6-digit code sent to your email.",
      employeeCode,
    };
  }

  // ── Find the latest unused non-expired OTP for this employee ──
  const record = await prisma.employeeOtp.findFirst({
    where: {
      employeeCode,
      usedAt: null,
      expiresAt: { gt: new Date() },
    },
    orderBy: { createdAt: "desc" },
  });

  if (!record) {
    return {
      step: 2,
      error: "This code has expired or is no longer valid. Request a new one.",
      employeeCode,
    };
  }

  if (record.attempts >= OTP_MAX_ATTEMPTS) {
    return {
      step: 2,
      error: "Too many incorrect attempts. Please request a new code.",
      employeeCode,
    };
  }

  const isValid = verifyOtp(code, record.codeHash);

  if (!isValid) {
    // Increment attempts counter.
    await prisma.employeeOtp.update({
      where: { id: record.id },
      data: { attempts: { increment: 1 } },
    });

    const remaining = OTP_MAX_ATTEMPTS - (record.attempts + 1);
    return {
      step: 2,
      error:
        remaining > 0
          ? `Incorrect code. ${remaining} attempt${remaining === 1 ? "" : "s"} remaining.`
          : "Too many incorrect attempts. Please request a new code.",
      employeeCode,
    };
  }

  // Mark as used so it can't be replayed.
  await prisma.employeeOtp.update({
    where: { id: record.id },
    data: { usedAt: new Date() },
  });

  return { step: 3, error: null, employeeCode };
}

// ─── Resend OTP (same as step 1 but skip ahead to sending) ────────────────

export async function resendOtp(
  _prev: ActivationActionState,
  formData: FormData
): Promise<ActivationActionState> {
  // Re-use verifyAndSendOtp — it handles all the guards.
  return verifyAndSendOtp(_prev, formData);
}

// ─── Step 3: create account ────────────────────────────────────────────────

export async function createAccount(
  _prev: ActivationActionState,
  formData: FormData
): Promise<ActivationActionState> {
  const parsed = step3Schema.safeParse({
    employeeCode: formData.get("employeeCode"),
    name: formData.get("name"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });

  if (!parsed.success) {
    const fe: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const field = issue.path[0] as string | undefined;
      if (field && !fe[field]) fe[field] = issue.message;
    }
    return {
      step: 3,
      error: parsed.error.issues[0]?.message ?? "Invalid input.",
      fieldErrors: fe,
      employeeCode: String(formData.get("employeeCode") ?? ""),
    };
  }

  const { employeeCode, name, password } = parsed.data;

  // ── Re-verify employee is still eligible ──
  const employee = await prisma.employee.findUnique({
    where: { employeeCode },
    select: { id: true, status: true, userId: true, email: true },
  });

  if (
    !employee ||
    employee.status !== "ACTIVE" ||
    employee.userId !== null
  ) {
    return { step: 3, error: SAFE_REJECTION, employeeCode };
  }

  if (!employee.email) {
    return { step: 3, error: SAFE_REJECTION, employeeCode };
  }

  // ── Re-verify a successfully-used OTP exists for this employee
  //    (prevents skipping step 2 by direct form submission) ──
  const usedOtp = await prisma.employeeOtp.findFirst({
    where: {
      employeeCode,
      usedAt: { not: null },
      expiresAt: { gt: new Date(Date.now() - OTP_EXPIRY_MINUTES * 60 * 1_000) },
    },
    orderBy: { usedAt: "desc" },
  });

  if (!usedOtp) {
    return {
      step: 1,
      error: "Verification session expired. Please start again.",
    };
  }

  const passwordHash = await hashPassword(password);

  try {
    await prisma.$transaction(async (tx) => {
      // Check email isn't already taken.
      const existing = await tx.user.findUnique({
        where: { email: employee.email! },
        select: { id: true },
      });
      if (existing) throw new Error("email_taken");

      // Create the User.
      const user = await tx.user.create({
        data: {
          name,
          email: employee.email!,
          role: "EMPLOYEE",
          passwordHash,
          onboardingRequired: false,
        },
      });

      // Atomically link — fails if another request won the race.
      const linked = await tx.employee.updateMany({
        where: { id: employee.id, userId: null },
        data: { userId: user.id },
      });
      if (linked.count === 0) throw new Error("already_claimed");

      await tx.auditLog.create({
        data: {
          actorId: user.id,
          action: "EMPLOYEE_ACCOUNT_CREATED",
          entityType: "Employee",
          entityId: employee.id,
          metadata: { employeeCode, userId: user.id },
        },
      });
    });
  } catch (err) {
    if (err instanceof Error) {
      if (err.message === "email_taken") {
        return {
          step: 3,
          error: "An account with this email already exists. Sign in instead.",
          employeeCode,
        };
      }
      if (err.message === "already_claimed") {
        return { step: 3, error: SAFE_REJECTION, employeeCode };
      }
    }
    if (
      err instanceof Prisma.PrismaClientKnownRequestError &&
      err.code === "P2002"
    ) {
      return {
        step: 3,
        error: "An account with this email already exists. Sign in instead.",
        employeeCode,
      };
    }
    return {
      step: 3,
      error: "Could not create your account. Please try again.",
      employeeCode,
    };
  }

  return { step: 4, error: null };
}

// ─── Helpers ───────────────────────────────────────────────────────────────

function maskEmail(email: string): string {
  const [local, domain] = email.split("@");
  if (!local || !domain) return email;
  const visible = local.length > 2 ? local.slice(0, 2) : local[0] ?? "";
  return `${visible}${"*".repeat(Math.max(0, local.length - 2))}@${domain}`;
}
