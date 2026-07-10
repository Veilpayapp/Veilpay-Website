import type { VercelRequest, VercelResponse } from '@vercel/node';
import { validateEmail } from './_lib/email-validator';
import { generateOtp, createOtpToken } from './_lib/otp';

// ─── Rate limiter (per IP per deployment instance) ─────────────────────────
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_WINDOW_MS = 60_000; // 1 minute
const RATE_LIMIT_MAX = 3;            // max 3 OTP requests per minute per IP

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return false;
  }
  entry.count++;
  return entry.count > RATE_LIMIT_MAX;
}

// ─── Beautiful HTML email template ─────────────────────────────────────────
function buildOtpEmail(otp: string): string {
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#000;">
  <div style="font-family:'Helvetica Neue',Arial,sans-serif;max-width:460px;margin:40px auto;background:#0a0a0a;border-radius:16px;padding:40px;border:1px solid rgba(242,197,114,0.15);">
    <div style="text-align:center;margin-bottom:32px;">
      <h1 style="color:#F2C572;font-size:28px;margin:0;letter-spacing:-0.5px;">VeilPay</h1>
      <p style="color:#888;font-size:13px;margin:8px 0 0;">Financial Privacy, Redefined</p>
    </div>
    <p style="color:#fff;font-size:16px;margin-bottom:8px;text-align:center;">Your verification code:</p>
    <div style="background:#111;border:1px solid rgba(242,197,114,0.3);border-radius:12px;padding:24px;text-align:center;margin:16px 0;">
      <span style="font-size:40px;font-weight:bold;letter-spacing:10px;color:#F2C572;font-family:'Courier New',monospace;">${otp}</span>
    </div>
    <p style="color:#888;font-size:14px;text-align:center;margin:16px 0 0;">This code expires in <strong style="color:#ccc;">10 minutes</strong>.</p>
    <p style="color:#555;font-size:13px;text-align:center;margin:8px 0 0;">If you didn't request this, just ignore this email.</p>
    <hr style="border:none;border-top:1px solid #222;margin:28px 0;" />
    <p style="color:#444;font-size:11px;text-align:center;margin:0;">© ${new Date().getFullYear()} VeilPay — Take back your financial privacy.</p>
  </div>
</body>
</html>`;
}

// ─── Handler ───────────────────────────────────────────────────────────────
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  // Rate limit
  const clientIp =
    (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ||
    req.socket?.remoteAddress ||
    'unknown';

  if (isRateLimited(clientIp)) {
    return res.status(429).json({ error: 'Too many requests. Please wait a minute before trying again.' });
  }

  const { email } = req.body as { email?: string };

  if (!email || typeof email !== 'string') {
    return res.status(400).json({ error: 'Email is required.' });
  }

  const cleanEmail = email.trim().toLowerCase();
  if (cleanEmail.length > 254) {
    return res.status(400).json({ error: 'Email address is too long.' });
  }

  // Validate email (format, disposable check, allowlist)
  const validation = validateEmail(cleanEmail);
  if (!validation.valid) {
    return res.status(400).json({ error: validation.reason });
  }

  // Check for Resend API key
  const RESEND_API_KEY = process.env.RESEND_API_KEY;
  if (!RESEND_API_KEY) {
    console.error('Missing RESEND_API_KEY environment variable.');
    return res.status(500).json({ error: 'Server configuration error.' });
  }

  // Generate OTP and create signed token
  const otp = generateOtp();
  const token = createOtpToken(cleanEmail, otp);

  // Send verification email via Resend
  try {
    const resendRes = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: process.env.OTP_FROM_EMAIL || 'VeilPay <noreply@veilpayapp.com>',
        to: [cleanEmail],
        subject: 'Your VeilPay Verification Code',
        html: buildOtpEmail(otp),
      }),
    });

    if (!resendRes.ok) {
      const errBody = await resendRes.text();
      console.error('Resend API Error:', resendRes.status, errBody);
      return res.status(502).json({ error: 'Failed to send verification email. Please try again.' });
    }

    // Return the token to the frontend (the OTP itself is ONLY in the email)
    return res.status(200).json({ token });
  } catch (err) {
    console.error('Unexpected error sending OTP:', err);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
