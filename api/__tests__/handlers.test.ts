// @vitest-environment node
import { describe, it, expect, beforeAll, beforeEach, afterEach, vi } from 'vitest';
import waitlistStart from '../waitlist-start';
import waitlistVerify from '../waitlist-verify';
import { generateCode, issueToken } from '../_utils';

// The handlers read secrets from the environment — set a fixed test value so
// the happy paths behave deterministically.
beforeAll(() => {
  process.env.WAITLIST_SIGNING_SECRET = 'test-signing-secret';
  process.env.RESEND_API_KEY = 'test-resend-key';
});

// Handlers call the real DNS resolver through _utils.checkMx — mock it so tests
// control whether a domain "has MX".
const dnsMock = vi.hoisted(() => ({ resolveMx: vi.fn() }));
vi.mock('node:dns', () => ({ promises: { resolveMx: dnsMock.resolveMx } }));

let fetchMock: ReturnType<typeof vi.fn>;

beforeEach(() => {
  dnsMock.resolveMx.mockReset();
  dnsMock.resolveMx.mockResolvedValue([{ priority: 10, exchange: 'mx.example.com' }]);
  fetchMock = vi.fn().mockResolvedValue({
    ok: true,
    status: 200,
    json: async () => ({}),
    text: async () => '',
  });
  vi.stubGlobal('fetch', fetchMock);
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

function makeRes() {
  let statusCode = 200;
  let body: unknown = null;
  const res = {
    status(code: number) {
      statusCode = code;
      return res;
    },
    json(data: unknown) {
      body = data;
    },
  };
  return { res, statusCode: () => statusCode, body: () => body };
}

function post(ip: string, body: unknown = {}) {
  return { method: 'POST', headers: { 'x-forwarded-for': ip }, body };
}

describe('POST /api/waitlist-start', () => {
  it('rejects non-POST requests with 405', async () => {
    const { res, statusCode } = makeRes();
    await waitlistStart({ method: 'GET', headers: {}, body: {} }, res);
    expect(statusCode()).toBe(405);
  });

  it('rate-limits a single IP after 5 attempts', async () => {
    const ip = '198.51.100.20';
    for (let i = 0; i < 5; i++) {
      await waitlistStart(post(ip, { email: 'user@gmail.com' }), makeRes().res);
    }
    const { res, statusCode, body } = makeRes();
    await waitlistStart(post(ip, { email: 'user@gmail.com' }), res);
    expect(statusCode()).toBe(429);
    const err = (body() as { error?: { code?: string; message?: string } }).error;
    expect(err?.code).toBe('RATE_LIMITED');
    expect(err?.message).toContain('Too many attempts');
  });

  it('returns 500 when the service is misconfigured', async () => {
    const original = process.env.RESEND_API_KEY;
    delete process.env.RESEND_API_KEY;
    try {
      const { res, statusCode, body } = makeRes();
      await waitlistStart(post('198.51.100.21', { email: 'user@gmail.com' }), res);
      expect(statusCode()).toBe(500);
      const err = (body() as { error?: { code?: string; message?: string } }).error;
      expect(err?.code).toBe('SERVICE_UNAVAILABLE');
    } finally {
      process.env.RESEND_API_KEY = original;
    }
  });

  it('rejects malformed email addresses with 400', async () => {
    const { res, statusCode, body } = makeRes();
    await waitlistStart(post('198.51.100.22', { email: 'not-an-email' }), res);
    expect(statusCode()).toBe(400);
    const err = (body() as { error?: { code?: string; message?: string } }).error;
    expect(err?.code).toBe('INVALID_EMAIL_FORMAT');
    expect(err?.message).toContain('valid email');
  });

  it('rejects domains outside the allowlist with 400', async () => {
    const { res, statusCode, body } = makeRes();
    await waitlistStart(post('198.51.100.23', { email: 'user@customdomain.io' }), res);
    expect(statusCode()).toBe(400);
    const err = (body() as { error?: { code?: string; message?: string } }).error;
    expect(err?.code).toBe('UNSUPPORTED_EMAIL_PROVIDER');
    expect(err?.message).toContain('major email provider');
  });

  it('rejects a domain with no MX record with 400 — even if the pass is in the allowlist', async () => {
    // The allowlist check runs first; use 'gmail.com' (in the allowlist) so
    // the request reaches the MX step, then fail the lookup.
    dnsMock.resolveMx.mockRejectedValue(Object.assign(new Error('ENOTFOUND'), { code: 'ENOTFOUND' }));
    const { res, statusCode, body } = makeRes();
    await waitlistStart(post('198.51.100.24', { email: 'user@gmail.com' }), res);
    expect(statusCode()).toBe(400);
    const err = (body() as { error?: { code?: string; message?: string } }).error;
    expect(err?.code).toBe('INVALID_EMAIL_DOMAIN');
    expect(err?.message).toContain("can't receive mail");
  });

  it('emails the code and returns a signed token on success', async () => {
    const { res, statusCode, body } = makeRes();
    await waitlistStart(post('198.51.100.25', { email: 'user@gmail.com' }), res);
    expect(statusCode()).toBe(200);
    expect(typeof (body() as { token?: unknown }).token).toBe('string');
    const resendUrl = fetchMock.mock.calls[0]?.[0];
    expect(resendUrl).toContain('api.resend.com');
  });

  it('returns 502 when Resend fails', async () => {
    fetchMock.mockResolvedValue({
      ok: false,
      status: 500,
      json: async () => ({}),
      text: async () => 'upstream error',
    });
    const { res, statusCode, body } = makeRes();
    await waitlistStart(post('198.51.100.26', { email: 'user@gmail.com' }), res);
    expect(statusCode()).toBe(502);
    const err = (body() as { error?: { code?: string; message?: string } }).error;
    expect(err?.code).toBe('DISPATCH_FAILED');
  });
});

describe('POST /api/waitlist-verify', () => {
  it('rejects non-POST requests with 405', async () => {
    const { res, statusCode, body } = makeRes();
    await waitlistVerify({ method: 'GET', headers: {}, body: {} }, res);
    expect(statusCode()).toBe(405);
    const err = (body() as { error?: { code?: string } }).error;
    expect(err?.code).toBe('METHOD_NOT_ALLOWED');
  });

  it('rate-limits a single IP after 5 attempts', async () => {
    const ip = '198.51.100.30';
    for (let i = 0; i < 5; i++) {
      await waitlistVerify(post(ip, { email: 'a@gmail.com', code: '123456', token: 'x.y' }), makeRes().res);
    }
    const { res, statusCode, body } = makeRes();
    await waitlistVerify(post(ip, { email: 'a@gmail.com', code: '123456', token: 'x.y' }), res);
    expect(statusCode()).toBe(429);
    const err = (body() as { error?: { code?: string; message?: string } }).error;
    expect(err?.code).toBe('RATE_LIMITED');
    expect(err?.message).toContain('Too many attempts');
  });

  it('rejects a non-6-digit code with 400', async () => {
    const { res, statusCode, body } = makeRes();
    await waitlistVerify(post('198.51.100.31', { email: 'user@gmail.com', code: '12', token: 'x.y' }), res);
    expect(statusCode()).toBe(400);
    const err = (body() as { error?: { code?: string; message?: string } }).error;
    expect(err?.code).toBe('INVALID_CODE_FORMAT');
  });

  it('rejects an invalid token with 400', async () => {
    const { res, statusCode, body } = makeRes();
    await waitlistVerify(post('198.51.100.32', { email: 'user@gmail.com', code: '123456', token: 'not-a-token' }), res);
    expect(statusCode()).toBe(400);
    const err = (body() as { error?: { code?: string; message?: string } }).error;
    expect(err?.code).toBe('INCORRECT_CODE');
    expect(err?.message).toContain("isn't correct");
  });


  it('verifies a valid code and returns ok', async () => {
    const code = generateCode();
    const token = issueToken('user@gmail.com', code);
    const { res, statusCode, body } = makeRes();
    await waitlistVerify(post('198.51.100.33', { email: 'user@gmail.com', code, token }), res);
    expect(statusCode()).toBe(200);
    expect(body()).toEqual({ ok: true });
  });

  it('pings the Discord webhook with the verified signup', async () => {
    process.env.DISCORD_WEBHOOK_URL = 'https://discord.example.com/hook';
    try {
      const code = generateCode();
      const token = issueToken('user@gmail.com', code);
      const { res, statusCode } = makeRes();
      await waitlistVerify(post('198.51.100.34', { email: 'user@gmail.com', code, token }), res);
      expect(statusCode()).toBe(200);
      expect(fetchMock).toHaveBeenCalledWith('https://discord.example.com/hook', expect.anything());
    } finally {
      delete process.env.DISCORD_WEBHOOK_URL;
    }
  });

  it('still returns ok when the Discord webhook fails', async () => {
    process.env.DISCORD_WEBHOOK_URL = 'https://discord.example.com/hook';
    fetchMock.mockRejectedValue(new Error('webhook down'));
    try {
      const code = generateCode();
      const token = issueToken('user@gmail.com', code);
      const { res, statusCode, body } = makeRes();
      await waitlistVerify(post('198.51.100.35', { email: 'user@gmail.com', code, token }), res);
      expect(statusCode()).toBe(200);
      expect(body()).toEqual({ ok: true });
    } finally {
      delete process.env.DISCORD_WEBHOOK_URL;
    }
  });
});
