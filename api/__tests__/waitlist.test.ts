// @vitest-environment node
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import waitlistHandler from '../waitlist';

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
  delete process.env.DISCORD_WEBHOOK_URL;
  delete process.env.RESEND_API_KEY;
  delete process.env.WAITLIST_FROM_EMAIL;
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

describe('POST /api/waitlist', () => {
  it('rejects non-POST requests with 405', async () => {
    const { res, statusCode, body } = makeRes();
    await waitlistHandler({ method: 'GET', headers: {}, body: {} }, res);
    expect(statusCode()).toBe(405);
    const err = (body() as { error?: { code?: string } }).error;
    expect(err?.code).toBe('METHOD_NOT_ALLOWED');
  });

  it('rate-limits a single IP after 5 attempts', async () => {
    const ip = '198.51.100.50';
    for (let i = 0; i < 5; i++) {
      await waitlistHandler(post(ip, { email: 'user@example.com' }), makeRes().res);
    }
    const { res, statusCode, body } = makeRes();
    await waitlistHandler(post(ip, { email: 'user@example.com' }), res);
    expect(statusCode()).toBe(429);
    const err = (body() as { error?: { code?: string; message?: string } }).error;
    expect(err?.code).toBe('RATE_LIMITED');
  });

  it('rejects malformed emails with 400', async () => {
    const { res, statusCode, body } = makeRes();
    await waitlistHandler(post('198.51.100.51', { email: 'invalid-email' }), res);
    expect(statusCode()).toBe(400);
    const err = (body() as { error?: { code?: string } }).error;
    expect(err?.code).toBe('INVALID_EMAIL_FORMAT');
  });

  it('rejects disposable email domains with 400', async () => {
    const { res, statusCode, body } = makeRes();
    await waitlistHandler(post('198.51.100.52', { email: 'spam@mailinator.com' }), res);
    expect(statusCode()).toBe(400);
    const err = (body() as { error?: { code?: string; message?: string } }).error;
    expect(err?.code).toBe('DISPOSABLE_EMAIL_NOT_ALLOWED');
  });

  it('rejects domains with no MX records with 400', async () => {
    dnsMock.resolveMx.mockRejectedValue(Object.assign(new Error('ENOTFOUND'), { code: 'ENOTFOUND' }));
    const { res, statusCode, body } = makeRes();
    await waitlistHandler(post('198.51.100.53', { email: 'user@nonexistentdomainxyz.org' }), res);
    expect(statusCode()).toBe(400);
    const err = (body() as { error?: { code?: string } }).error;
    expect(err?.code).toBe('INVALID_EMAIL_DOMAIN');
  });

  it('successfully joins with personal Gmail address and posts to Discord', async () => {
    process.env.DISCORD_WEBHOOK_URL = 'https://discord.example.com/waitlist-webhook';
    const { res, statusCode, body } = makeRes();
    await waitlistHandler(post('198.51.100.54', { email: 'pulkitpradhan440@gmail.com' }), res);

    expect(statusCode()).toBe(200);
    expect(body()).toEqual({ ok: true, success: true });
    expect(fetchMock).toHaveBeenCalledWith(
      'https://discord.example.com/waitlist-webhook',
      expect.objectContaining({
        method: 'POST',
        body: expect.stringContaining('pulkitpradhan440@gmail.com'),
      }),
    );
  });

  it('successfully accepts custom personal domains (not in hardcoded consumer list)', async () => {
    const { res, statusCode, body } = makeRes();
    await waitlistHandler(post('198.51.100.55', { email: 'alex@customdomain.io' }), res);

    expect(statusCode()).toBe(200);
    expect(body()).toEqual({ ok: true, success: true });
  });

  it('sends welcome email via Resend if RESEND_API_KEY is configured', async () => {
    process.env.RESEND_API_KEY = 're_test_key_123';
    const { res, statusCode, body } = makeRes();
    await waitlistHandler(post('198.51.100.56', { email: 'user@example.com' }), res);

    expect(statusCode()).toBe(200);
    expect(body()).toEqual({ ok: true, success: true });
    expect(fetchMock).toHaveBeenCalledWith(
      'https://api.resend.com/emails',
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          Authorization: 'Bearer re_test_key_123',
        }),
      }),
    );
  });

  it('still succeeds if Resend returns an error (graceful degradation)', async () => {
    process.env.RESEND_API_KEY = 're_test_key_123';
    fetchMock.mockResolvedValueOnce({
      ok: false,
      status: 403,
      text: async () => 'Domain not verified',
    });

    const { res, statusCode, body } = makeRes();
    await waitlistHandler(post('198.51.100.57', { email: 'user@example.com' }), res);

    expect(statusCode()).toBe(200);
    expect(body()).toEqual({ ok: true, success: true });
  });

  it('still succeeds if Discord webhook network call fails', async () => {
    process.env.DISCORD_WEBHOOK_URL = 'https://discord.example.com/waitlist-webhook';
    fetchMock.mockRejectedValueOnce(new Error('Network offline'));

    const { res, statusCode, body } = makeRes();
    await waitlistHandler(post('198.51.100.58', { email: 'user@example.com' }), res);

    expect(statusCode()).toBe(200);
    expect(body()).toEqual({ ok: true, success: true });
  });
});
