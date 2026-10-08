import { describe, it, expect, beforeAll, beforeEach, afterEach, vi } from 'vitest';
import { generateCode, issueToken, verifyToken, checkMx, rateLimit, getClientIp } from '../_utils';

// The HMAC secret is read from the environment at call time — set a fixed
// test value so token generation/verification is deterministic.
beforeAll(() => {
  process.env.WAITLIST_SIGNING_SECRET = 'test-signing-secret';
});

// _utils imports `{ promises as dns } from 'node:dns'`. Vitest cannot spy on a
// real ESM namespace, so mock the whole module and control resolveMx per test.
const dnsMock = vi.hoisted(() => ({ resolveMx: vi.fn() }));

vi.mock('node:dns', () => ({
  promises: { resolveMx: dnsMock.resolveMx },
}));

describe('generateCode', () => {
  it('produces a 6-digit zero-padded code', () => {
    for (let i = 0; i < 50; i++) {
      expect(generateCode()).toMatch(/^\d{6}$/);
    }
  });
});

describe('issueToken / verifyToken', () => {
  it('verifies a freshly issued token with the right code', () => {
    const code = generateCode();
    const token = issueToken('user@gmail.com', code);
    expect(verifyToken(token, 'user@gmail.com', code)).toEqual({ ok: true });
  });

  it('rejects a wrong code', () => {
    const token = issueToken('user@gmail.com', '123456');
    expect(verifyToken(token, 'user@gmail.com', '000000')).toEqual({
      ok: false,
      reason: 'mismatch',
    });
  });

  it('rejects a token for a different email', () => {
    const token = issueToken('user@gmail.com', '123456');
    expect(verifyToken(token, 'other@gmail.com', '123456')).toEqual({
      ok: false,
      reason: 'mismatch',
    });
  });

  it('rejects malformed tokens', () => {
    expect(verifyToken('not-a-token', 'user@gmail.com', '123456')).toEqual({
      ok: false,
      reason: 'malformed',
    });
    expect(verifyToken(42, 'user@gmail.com', '123456')).toEqual({
      ok: false,
      reason: 'malformed',
    });
  });

  it('rejects tampered tokens (signature mismatch)', () => {
    const token = issueToken('user@gmail.com', '123456');
    const [body] = token.split('.');
    // Flip the signature to an obviously wrong value.
    const tampered = `${body}.${'x'.repeat(43)}`;
    expect(verifyToken(tampered, 'user@gmail.com', '123456')).toEqual({
      ok: false,
      reason: 'tampered',
    });
  });

  it('rejects expired tokens', () => {
    const code = generateCode();
    const token = issueToken('user@gmail.com', code);
    // Travel past the 10-minute TTL.
    vi.spyOn(Date, 'now').mockReturnValue(Date.now() + 11 * 60 * 1000);
    try {
      expect(verifyToken(token, 'user@gmail.com', code)).toEqual({
        ok: false,
        reason: 'expired',
      });
    } finally {
      vi.restoreAllMocks();
    }
  });
});

describe('rateLimit (sliding window)', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('allows requests up to the limit, then blocks', () => {
    const ip = '203.0.113.10';
    // 3 max in a huge window so the window never expires mid-test.
    expect(rateLimit(ip, 60_000, 3)).toBe(true);
    expect(rateLimit(ip, 60_000, 3)).toBe(true);
    expect(rateLimit(ip, 60_000, 3)).toBe(true);
    expect(rateLimit(ip, 60_000, 3)).toBe(false);
  });

  it('treats different IPs independently', () => {
    expect(rateLimit('198.51.100.1', 60_000, 2)).toBe(true);
    expect(rateLimit('198.51.100.1', 60_000, 2)).toBe(true);
    expect(rateLimit('198.51.100.1', 60_000, 2)).toBe(false);
    expect(rateLimit('198.51.100.2', 60_000, 2)).toBe(true);
  });

  it('allows again after the window slides past', () => {
    vi.useFakeTimers();
    const ip = '198.51.100.3';
    expect(rateLimit(ip, 1_000, 2)).toBe(true);
    expect(rateLimit(ip, 1_000, 2)).toBe(true);
    expect(rateLimit(ip, 1_000, 2)).toBe(false);

    vi.advanceTimersByTime(1_001);
    expect(rateLimit(ip, 1_000, 2)).toBe(true);
  });
});

describe('getClientIp', () => {
  it('extracts the leftmost X-Forwarded-For entry', () => {
    const req = {
      headers: { 'x-forwarded-for': '203.0.113.5, 10.0.0.1' },
    } as never;
    expect(getClientIp(req)).toBe('203.0.113.5');
  });

  it('falls back to unknown when no header is present', () => {
    expect(getClientIp({} as never)).toBe('unknown');
  });
});

describe('checkMx (tri-state, fail-open)', () => {
  beforeEach(() => {
    dnsMock.resolveMx.mockReset();
  });

  it('returns ok when the domain has an MX exchange', async () => {
    dnsMock.resolveMx.mockResolvedValue([
      { priority: 10, exchange: 'mx1.gmail.com' },
    ]);
    expect(await checkMx('gmail.com')).toBe('ok');
  });

  it('returns no-mx only for ENOTFOUND (genuinely dead domain)', async () => {
    dnsMock.resolveMx.mockRejectedValue(
      Object.assign(new Error('ENOTFOUND'), { code: 'ENOTFOUND' }),
    );
    expect(await checkMx('definitely-not-a-domain-xyz.com')).toBe('no-mx');
  });

  it('returns unknown (pass) for transient resolver errors, never rejecting', async () => {
    dnsMock.resolveMx.mockRejectedValue(
      Object.assign(new Error('ETIMEOUT'), { code: 'ETIMEOUT' }),
    );
    expect(await checkMx('gmail.com')).toBe('unknown');
  });
});
