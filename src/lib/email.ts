import "server-only";

const RESEND_API_URL = "https://api.resend.com/emails";

interface SendOtpEmailOptions {
  to: string;
  otp: string;
  expiryMinutes: number;
}

export async function sendOtpEmail({
  to,
  otp,
  expiryMinutes,
}: SendOtpEmailOptions): Promise<{ ok: true } | { ok: false; error: string }> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.error("[email] RESEND_API_KEY is not set");
    return { ok: false, error: "Email service is not configured." };
  }

  // RESEND_FROM controls the sender address.
  //
  // Resend free plan (no verified domain):
  //   RESEND_FROM="onboarding@resend.dev"
  //   → can only deliver to the Resend account owner's email.
  //   Use this for local dev when the recipient IS the account owner.
  //
  // Resend with a verified domain:
  //   RESEND_FROM="AssetFlow <no-reply@yourdomain.com>"
  //   → can deliver to any recipient.
  //   Set this in production after verifying a domain at resend.com/domains.
  const from = process.env.RESEND_FROM;
  if (!from) {
    console.error("[email] RESEND_FROM is not set");
    return { ok: false, error: "Email service is not configured." };
  }

  const body = {
    from,
    to: [to],
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
  };

  try {
    const res = await fetch(RESEND_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      // Log provider status for server diagnostics only — never expose to client.
      console.error("[email] Resend error:", res.status);
      return {
        ok: false,
        error: "Failed to send the verification email. Please try again.",
      };
    }

    return { ok: true };
  } catch (_err) {
    console.error("[email] Unexpected error sending email");
    return {
      ok: false,
      error: "Failed to send the verification email. Please try again.",
    };
  }
}
