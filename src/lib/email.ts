import "server-only";

const RESEND_API_URL = "https://api.resend.com/emails";

type EmailResult = { ok: true } | { ok: false; error: string };

// ─── Shared helper ──────────────────────────────────────────────────────────

async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}): Promise<EmailResult> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.error("[email] RESEND_API_KEY is not set");
    return { ok: false, error: "Email service is not configured." };
  }

  const from = process.env.RESEND_FROM;
  if (!from) {
    console.error("[email] RESEND_FROM is not set");
    return { ok: false, error: "Email service is not configured." };
  }

  try {
    const res = await fetch(RESEND_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ from, to: [to], subject, html }),
    });

    if (!res.ok) {
      console.error("[email] Resend error:", res.status);
      return { ok: false, error: "Failed to send email. Please try again." };
    }

    return { ok: true };
  } catch {
    console.error("[email] Unexpected error sending email");
    return { ok: false, error: "Failed to send email. Please try again." };
  }
}

// ─── Employee OTP ───────────────────────────────────────────────────────────

interface SendOtpEmailOptions {
  to: string;
  otp: string;
  expiryMinutes: number;
}

export async function sendOtpEmail({
  to,
  otp,
  expiryMinutes,
}: SendOtpEmailOptions): Promise<EmailResult> {
  return sendEmail({
    to,
    subject: "Your AssetFlow verification code",
    html: `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8" /><meta name="viewport" content="width=device-width,initial-scale=1" /></head>
<body style="font-family:system-ui,sans-serif;background:#f9fafb;margin:0;padding:32px 0;">
  <div style="max-width:480px;margin:0 auto;background:#fff;border:1px solid #e5e7eb;border-radius:8px;padding:32px;">
    <h2 style="margin:0 0 8px;font-size:18px;color:#111827;">AssetFlow — Verification Code</h2>
    <p style="margin:0 0 24px;font-size:14px;color:#6b7280;">Use the code below to activate your employee account.</p>
    <div style="font-size:36px;font-weight:700;letter-spacing:8px;color:#111827;text-align:center;padding:16px;background:#f3f4f6;border-radius:6px;">
      ${otp}
    </div>
    <p style="margin:24px 0 0;font-size:13px;color:#6b7280;">
      This code expires in <strong>${expiryMinutes} minutes</strong>.<br />
      If you did not request this, you can safely ignore this email.
    </p>
  </div>
</body>
</html>`,
  });
}

// ─── Admin Invitation ───────────────────────────────────────────────────────

interface SendAdminInviteEmailOptions {
  to: string;
  inviterName: string;
  temporaryPassword: string;
  loginUrl: string;
}

export async function sendAdminInviteEmail({
  to,
  inviterName,
  temporaryPassword,
  loginUrl,
}: SendAdminInviteEmailOptions): Promise<EmailResult> {
  return sendEmail({
    to,
    subject: "You've been invited as an AssetFlow Administrator",
    html: `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8" /><meta name="viewport" content="width=device-width,initial-scale=1" /></head>
<body style="font-family:system-ui,sans-serif;background:#f9fafb;margin:0;padding:32px 0;">
  <div style="max-width:480px;margin:0 auto;background:#fff;border:1px solid #e5e7eb;border-radius:8px;padding:32px;">
    <h2 style="margin:0 0 8px;font-size:18px;color:#111827;">AssetFlow — Admin Invitation</h2>
    <p style="margin:0 0 16px;font-size:14px;color:#374151;">
      <strong>${escapeHtml(inviterName)}</strong> has invited you to join AssetFlow as an <strong>Administrator</strong>.
    </p>
    <p style="margin:0 0 8px;font-size:14px;color:#374151;">Use these credentials to sign in:</p>
    <div style="background:#f3f4f6;border-radius:6px;padding:16px;margin:0 0 16px;">
      <p style="margin:0 0 6px;font-size:13px;color:#6b7280;">Login email:</p>
      <p style="margin:0 0 12px;font-size:14px;font-weight:600;color:#111827;">${escapeHtml(to)}</p>
      <p style="margin:0 0 6px;font-size:13px;color:#6b7280;">Temporary password:</p>
      <p style="margin:0;font-size:18px;font-weight:700;letter-spacing:2px;color:#111827;">${escapeHtml(temporaryPassword)}</p>
    </div>
    <a href="${escapeHtml(loginUrl)}"
       style="display:inline-block;background:#111827;color:#fff;text-decoration:none;padding:10px 20px;border-radius:6px;font-size:14px;font-weight:600;">
      Sign in to AssetFlow
    </a>
    <p style="margin:24px 0 0;font-size:12px;color:#9ca3af;">
      Please change your password after your first sign-in.<br />
      If you did not expect this invitation, you can safely ignore this email.
    </p>
  </div>
</body>
</html>`,
  });
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
