// POST /api/waitlist { email }
// Direct waitlist registration endpoint.
// Validates email format, checks MX records, blocks disposable domains,
// forwards waitlist signup to Discord webhook, and sends confirmation email if Resend is configured.

import {
  domainOf,
  getClientIp,
  hasMxRecord,
  isDisposableDomain,
  isValidFormat,
  jsonError,
  normalizeEmail,
  rateLimit,
  type ApiReq,
  type ApiRes,
} from './_utils.js';

function welcomeEmailHtml(): string {
  return `<!doctype html>
<html>
  <body style="margin:0;padding:0;background:#000000;font-family:Arial,Helvetica,sans-serif;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#000000;padding:40px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:440px;background:#0a0a0a;border:1px solid rgba(255,255,255,0.08);border-radius:20px;overflow:hidden;">
            <tr>
              <td style="padding:36px 32px 8px 32px;text-align:center;">
                <div style="font-family:Arial,Helvetica,sans-serif;font-size:13px;letter-spacing:2px;text-transform:uppercase;color:#D4A042;font-weight:700;">Veilpay</div>
              </td>
            </tr>
            <tr>
              <td style="padding:8px 32px 4px 32px;text-align:center;">
                <div style="font-size:22px;font-weight:700;color:#ffffff;">You're on the waitlist!</div>
              </td>
            </tr>
            <tr>
              <td style="padding:12px 32px 28px 32px;text-align:center;">
                <div style="font-size:14px;line-height:22px;color:#9a9a9a;">
                  Thank you for your interest in Veilpay. We're building the next generation of private, non-custodial financial infrastructure.
                </div>
                <div style="font-size:14px;line-height:22px;color:#d4a042;margin-top:16px;font-weight:600;">
                  We'll notify you as soon as early access is available.
                </div>
              </td>
            </tr>
            <tr>
              <td style="padding:0 32px 36px 32px;text-align:center;border-top:1px solid rgba(255,255,255,0.05);padding-top:20px;">
                <div style="font-size:12px;line-height:18px;color:#6a6a6a;">
                  Follow updates on <a href="https://x.veilpayapp.com" style="color:#d4a042;text-decoration:none;">X / Twitter</a> &bull; Join <a href="https://discord.veilpayapp.com" style="color:#d4a042;text-decoration:none;">Discord</a>
                </div>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

export default async function handler(req: ApiReq, res: ApiRes) {
  if (req.method !== 'POST') {
    return jsonError(res, 405, 'METHOD_NOT_ALLOWED', 'Method not allowed.');
  }

  const ip = getClientIp(req);
  if (!rateLimit(ip, 60_000, 5)) {
    return jsonError(res, 429, 'RATE_LIMITED', 'Too many attempts. Please wait a minute and try again.');
  }

  const body = (req.body ?? {}) as { email?: unknown };
  const email = normalizeEmail(body.email);
  const domain = domainOf(email);

  if (!isValidFormat(email)) {
    return jsonError(res, 400, 'INVALID_EMAIL_FORMAT', 'Please enter a valid email address.');
  }

  if (isDisposableDomain(domain)) {
    return jsonError(
      res,
      400,
      'DISPOSABLE_EMAIL_NOT_ALLOWED',
      'Temporary or disposable email addresses are not allowed. Please use your real personal or work email.'
    );
  }

  if (!(await hasMxRecord(domain))) {
    return jsonError(
      res,
      400,
      'INVALID_EMAIL_DOMAIN',
      "That email domain cannot receive mail. Please check the spelling."
    );
  }

  // 1. Post to Discord Webhook
  const webhook = process.env.DISCORD_WEBHOOK_URL;
  if (webhook) {
    try {
      await fetch(webhook, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          embeds: [
            {
              title: '🚀 New Waitlist Signup',
              description: `**Email:** \`${email}\`\n**IP:** \`${ip}\``,
              color: 15909234, // Veilpay amber #F2C572
              timestamp: new Date().toISOString(),
              footer: { text: 'Veilpay Waitlist' },
            },
          ],
        }),
      });
    } catch (err) {
      console.error('Discord webhook failed:', err);
    }
  }

  // 2. Optional: Send welcome email via Resend if configured
  if (process.env.RESEND_API_KEY) {
    const from = process.env.WAITLIST_FROM_EMAIL || 'Veilpay <waitlist@veilpayapp.com>';
    try {
      const emailResp = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from,
          to: [email],
          subject: "You're on the Veilpay waitlist!",
          html: welcomeEmailHtml(),
          text: `Thank you for joining the Veilpay waitlist! We'll notify you as soon as early access is available.`,
        }),
      });

      if (!emailResp.ok) {
        const detail = await emailResp.text().catch(() => '');
        console.warn('Resend welcome email failed (non-fatal):', emailResp.status, detail);
      }
    } catch (err) {
      console.warn('Resend welcome email request error (non-fatal):', err);
    }
  }

  return res.status(200).json({ ok: true, success: true });
}
