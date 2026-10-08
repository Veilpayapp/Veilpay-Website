// POST /api/waitlist-start  { email }
// Step 1 of double opt-in: validate the address, email a 6-digit code via Resend,
// and return an opaque signed token. The code is never sent to the browser.

import {
  ALLOWED_DOMAINS,
  codeEmailHtml,
  domainOf,
  generateCode,
  getClientIp,
  hasMxRecord,
  isValidFormat,
  issueToken,
  jsonError,
  normalizeEmail,
  rateLimit,
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

  if (!process.env.RESEND_API_KEY || !process.env.WAITLIST_SIGNING_SECRET) {
    console.error('Waitlist misconfigured: RESEND_API_KEY or WAITLIST_SIGNING_SECRET is missing.');
    return jsonError(res, 500, 'SERVICE_UNAVAILABLE', 'The waitlist is temporarily unavailable. Please try again later.');
  }

  const body = (req.body ?? {}) as { email?: unknown };
  const email = normalizeEmail(body.email);
  const domain = domainOf(email);

  if (!isValidFormat(email)) {
    return jsonError(res, 400, 'INVALID_EMAIL_FORMAT', 'Please enter a valid email address.');
  }

  if (!ALLOWED_DOMAINS.has(domain)) {
    return jsonError(res, 400, 'UNSUPPORTED_EMAIL_PROVIDER', 'Please use a major email provider (Gmail, Outlook, Yahoo, iCloud, Proton, etc.).');
  }

  if (!(await hasMxRecord(domain))) {
    return jsonError(res, 400, 'INVALID_EMAIL_DOMAIN', "That email domain can't receive mail. Please check the spelling.");
  }

  const code = generateCode();
  const token = issueToken(email, code);
  const from = process.env.WAITLIST_FROM_EMAIL || 'Veilpay <waitlist@veilpayapp.com>';

  try {
    const resp = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from,
        to: [email],
        subject: `${code} is your Veilpay waitlist code`,
        html: codeEmailHtml(code),
        text: `Your Veilpay waitlist verification code is ${code}. It expires in 10 minutes. If you didn't request this, you can ignore this email.`,
      }),
    });

    if (!resp.ok) {
      const detail = await resp.text().catch(() => '');
      console.error('Resend send failed:', resp.status, detail);
      return jsonError(res, 502, 'DISPATCH_FAILED', "We couldn't send the code right now. Please try again shortly.");
    }
  } catch (err) {
    console.error('Resend request error:', err);
    return jsonError(res, 502, 'DISPATCH_FAILED', "We couldn't send the code right now. Please try again shortly.");
  }

  return res.status(200).json({ token });
}


