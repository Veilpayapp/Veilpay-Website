// Shared helpers for the waitlist serverless functions.
// The leading underscore keeps Vercel from exposing this file as an API route.
//
// Design: stateless double opt-in. We never store pending codes in a database.
// Instead the server issues an HMAC-signed token that encodes the email, an
// expiry, and a keyed hash of the 6-digit code. The raw code is only ever sent
// to the user's inbox; the browser holds the opaque token and sends the typed
// code back, and the server re-derives everything to verify. No KV/Redis, so it
// stays on free hosting.

import crypto from 'node:crypto';
import { promises as dns } from 'node:dns';

// Codes are valid for 10 minutes.
const TTL_MS = 10 * 60 * 1000;

// Major consumer providers only. Keep this in sync with the client-side
// ALLOWED_DOMAINS list in src/components/DownloadSection.tsx.
export const ALLOWED_DOMAINS = new Set<string>([
  'gmail.com', 'googlemail.com',
  'outlook.com', 'hotmail.com', 'live.com', 'msn.com', 'outlook.in',
  'yahoo.com', 'yahoo.co.in', 'yahoo.co.uk', 'yahoo.ca', 'yahoo.com.au',
  'ymail.com', 'rocketmail.com',
  'icloud.com', 'me.com', 'mac.com',
  'protonmail.com', 'proton.me', 'pm.me',
  'aol.com',
  'zoho.com', 'zohomail.com', 'zohomail.in',
  'email.com', 'mail.com', 'gmx.com', 'gmx.net',
  'rediffmail.com',
]);

const EMAIL_RE = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

export function normalizeEmail(raw: unknown): string {
  return String(raw ?? '').trim().toLowerCase();
}

export function domainOf(email: string): string {
  return email.split('@')[1] ?? '';
}

export function isValidFormat(email: string): boolean {
  return EMAIL_RE.test(email);
}

// Confirms the domain can actually receive mail (has MX records). Catches typos
// like "gmial.com" and dead domains that pass a regex.
export async function hasMxRecord(domain: string): Promise<boolean> {
  try {
    const records = await dns.resolveMx(domain);
    return Array.isArray(records) && records.some((r) => Boolean(r.exchange));
  } catch {
    return false;
  }
}

function secret(): string {
  const s = process.env.WAITLIST_SIGNING_SECRET;
  if (!s) throw new Error('WAITLIST_SIGNING_SECRET is not set');
  return s;
}

function hmac(data: string): string {
  return crypto.createHmac('sha256', secret()).update(data).digest('base64url');
}

function safeEqual(a: string, b: string): boolean {
  const ba = Buffer.from(a);
  const bb = Buffer.from(b);
  if (ba.length !== bb.length) return false;
  return crypto.timingSafeEqual(ba, bb);
}

// Cryptographically random, zero-padded 6-digit code.
export function generateCode(): string {
  return String(crypto.randomInt(0, 1_000_000)).padStart(6, '0');
}

// token = base64url(payload) + "." + hmac(base64url(payload))
// payload = { email, exp, ch } where ch = hmac(email + "|" + code).
export function issueToken(email: string, code: string): string {
  const payload = { email, exp: Date.now() + TTL_MS, ch: hmac(`${email}|${code}`) };
  const body = Buffer.from(JSON.stringify(payload)).toString('base64url');
  return `${body}.${hmac(body)}`;
}

export type VerifyResult =
  | { ok: true }
  | { ok: false; reason: 'malformed' | 'tampered' | 'expired' | 'mismatch' };

export function verifyToken(token: unknown, email: string, code: string): VerifyResult {
  if (typeof token !== 'string' || !token.includes('.')) return { ok: false, reason: 'malformed' };
  const [body, sig] = token.split('.');
  if (!body || !sig || !safeEqual(sig, hmac(body))) return { ok: false, reason: 'tampered' };

  let payload: { email?: string; exp?: number; ch?: string };
  try {
    payload = JSON.parse(Buffer.from(body, 'base64url').toString('utf8'));
  } catch {
    return { ok: false, reason: 'malformed' };
  }

  if (typeof payload.exp !== 'number' || Date.now() > payload.exp) return { ok: false, reason: 'expired' };
  if (payload.email !== email || typeof payload.ch !== 'string') return { ok: false, reason: 'mismatch' };
  if (!safeEqual(payload.ch, hmac(`${email}|${code}`))) return { ok: false, reason: 'mismatch' };
  return { ok: true };
}

// Branded verification email. Kept inline (no template engine) and inline-styled
// so it renders consistently across email clients.
export function codeEmailHtml(code: string): string {
  return `<!doctype html>
<html>
  <body style="margin:0;padding:0;background:#000000;">
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
                <div style="font-family:Arial,Helvetica,sans-serif;font-size:20px;font-weight:700;color:#ffffff;">Confirm your email</div>
              </td>
            </tr>
            <tr>
              <td style="padding:4px 32px 24px 32px;text-align:center;">
                <div style="font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:22px;color:#9a9a9a;">Enter this code to join the Veilpay waitlist. It expires in 10 minutes.</div>
              </td>
            </tr>
            <tr>
              <td style="padding:0 32px 32px 32px;text-align:center;">
                <div style="font-family:'Courier New',monospace;font-size:38px;font-weight:700;letter-spacing:10px;color:#F2C572;background:#111111;border:1px solid rgba(242,197,114,0.25);border-radius:14px;padding:18px 0;">${code}</div>
              </td>
            </tr>
            <tr>
              <td style="padding:0 32px 36px 32px;text-align:center;">
                <div style="font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:18px;color:#6a6a6a;">If you didn't request this, you can safely ignore this email.</div>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

// Minimal request/response shapes so we don't take a hard dependency on
// @vercel/node for local type-checking. Vercel supplies the real types at build.
export interface ApiReq {
  method?: string;
  body?: unknown;
}
export interface ApiRes {
  status(code: number): ApiRes;
  json(data: unknown): void;
}
