// POST /api/waitlist-start  { email }
// Step 1 of double opt-in: validate the address, email a 6-digit code via Resend,
// and return an opaque signed token. The code is never sent to the browser.

import {
  ALLOWED_DOMAINS,
  codeEmailHtml,
  domainOf,
  generateCode,
  hasMxRecord,
  isValidFormat,
  issueToken,
  normalizeEmail,
  type ApiReq,
  type ApiRes,
} from './_utils';

export default async function handler(req: ApiReq, res: ApiRes) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed.' });

  if (!process.env.RESEND_API_KEY || !process.env.WAITLIST_SIGNING_SECRET) {
    console.error('Waitlist misconfigured: RESEND_API_KEY or WAITLIST_SIGNING_SECRET is missing.');
    return res.status(500).json({ error: 'The waitlist is temporarily unavailable. Please try again later.' });
  }

  const body = (req.body ?? {}) as { email?: unknown };
  const email = normalizeEmail(body.email);
  const domain = domainOf(email);

  if (!isValidFormat(email)) {
    return res.status(400).json({ error: 'Please enter a valid email address.' });
  }
  if (!ALLOWED_DOMAINS.has(domain)) {
    return res.status(400).json({ error: 'Please use a major email provider (Gmail, Outlook, Yahoo, iCloud, Proton, etc.).' });
  }
  if (!(await hasMxRecord(domain))) {
    return res.status(400).json({ error: "That email domain can't receive mail. Please check the spelling." });
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
      return res.status(502).json({ error: "We couldn't send the code right now. Please try again shortly." });
    }
  } catch (err) {
    console.error('Resend request error:', err);
    return res.status(502).json({ error: "We couldn't send the code right now. Please try again shortly." });
  }

  return res.status(200).json({ token });
}
