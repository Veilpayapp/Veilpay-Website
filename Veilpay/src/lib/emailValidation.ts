// Shared email validation for the waitlist double opt-in.
//
// Pure module — no Node builtins, so it is safe to import from both the
// browser bundle (DownloadSection.tsx) and the Vercel serverless functions
// (api/_utils.ts re-exports these). Keeping one copy of the regex and the
// domain sets means the client-side pre-checks can never drift out of sync
// with the server-side allowlist.

export const EMAIL_RE = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

// Major consumer providers only. Both client (DownloadSection) and server
// (waitlist-start) enforce this allowlist before the live MX-record check.
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

// Disposable / temp mail providers — client-side pre-check only. The server
// does not need this list because it also checks the domain allowlist and a
// live MX record, which disposable providers fail anyway.
export const DISPOSABLE_DOMAINS = new Set<string>([
  'tempmail.com', 'temp-mail.org', 'guerrillamail.com', 'guerrillamail.net',
  'guerrillamailblock.com', 'sharklasers.com', 'guerrillamail.info',
  'grr.la', 'guerrillamail.biz', 'guerrillamail.de',
  'mailinator.com', 'mailinator2.com', 'maildrop.cc',
  'throwaway.email', 'throwaway.cc', 'throwamail.com',
  'yopmail.com', 'yopmail.fr', 'yopmail.net',
  'trashmail.com', 'trashmail.me', 'trashmail.net',
  'getairmail.com', 'mailnesia.com', 'tempail.com',
  'dispostable.com', 'mintemail.com', 'tempr.email',
  'discard.email', 'discardmail.com', 'discardmail.de',
  'fakeinbox.com', 'mailcatch.com', 'mailscrap.com',
  'mailnull.com', 'emailondeck.com', 'emailfake.com',
  '10minutemail.com', '10minutemail.net', '10minutemail.co.za',
  'mohmal.com', 'burnermail.io', 'inboxkitten.com',
  'harakirimail.com', 'nada.email', 'tempinbox.com',
  'mailsac.com', 'mytemp.email', 'tempmailaddress.com',
  'tempmailo.com', 'getnada.com', 'emailna.co',
  'crazymailing.com', 'tmail.ws', 'tmpmail.org', 'tmpmail.net',
  'mailtemp.net', 'tempm.com', 'tempmail.ninja', 'spamgourmet.com',
]);

export function normalizeEmail(raw: unknown): string {
  return String(raw ?? '').trim().toLowerCase();
}

export function domainOf(email: string): string {
  return email.split('@')[1] ?? '';
}

export function isValidFormat(email: string): boolean {
  return EMAIL_RE.test(email);
}

export function isDisposableDomain(domain: string): boolean {
  return DISPOSABLE_DOMAINS.has(domain);
}
