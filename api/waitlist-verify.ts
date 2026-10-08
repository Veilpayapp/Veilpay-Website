// POST /api/waitlist-verify  { email, code, token }
// Step 2 of double opt-in: check the typed code against the signed token. Only a
// correct, unexpired code counts as a real signup and pings Discord.

import {
  getClientIp,
  jsonError,
  normalizeEmail,
  rateLimit,
  verifyToken,
  type ApiReq,
  type ApiRes,
} from './_utils.js';

export default async function handler(req: ApiReq, res: ApiRes) {
  if (req.method !== 'POST') {
    return jsonError(res, 405, 'METHOD_NOT_ALLOWED', 'Method not allowed.');
  }

  const ip = getClientIp(req);
  if (!rateLimit(ip, 60_000, 5)) {
    return jsonError(res, 429, 'RATE_LIMITED', 'Too many attempts. Please wait a minute and try again.');
  }

  const body = (req.body ?? {}) as { email?: unknown; code?: unknown; token?: unknown };
  const email = normalizeEmail(body.email);
  const code = String(body.code ?? '').trim();

  if (!/^\d{6}$/.test(code)) {
    return jsonError(res, 400, 'INVALID_CODE_FORMAT', 'Enter the 6-digit code from your email.');
  }

  const result = verifyToken(body.token, email, code);
  if (!result.ok) {
    if (result.reason === 'expired') {
      return jsonError(res, 400, 'EXPIRED_CODE', 'That code has expired. Please request a new one.');
    }
    return jsonError(res, 400, 'INCORRECT_CODE', "That code isn't correct. Double-check your email and try again.");
  }

  // Verified: the user proved they control this inbox. Post the verified email
  // (and IP) to Discord in a branded embed so signups are easy to read/collect.
  // A webhook failure must not fail the user's verification, so it's swallowed.
  const webhook = process.env.DISCORD_WEBHOOK_URL;
  if (webhook) {
    try {
      await fetch(webhook, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          embeds: [
            {
              title: '✅ New verified waitlist signup',
              description: `**Email:** \`${email}\`\n**IP:** \`${ip}\``,
              color: 15909234, // Veilpay amber
              timestamp: new Date().toISOString(),
              footer: { text: 'Email verified via 6-digit code (double opt-in)' },
            },
          ],
        }),
      });
    } catch (err) {
      console.error('Discord webhook failed:', err);
    }
  }

  return res.status(200).json({ ok: true });
}
