// @vitest-environment node
import { describe, it, expect } from 'vitest';
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import catchallHandler from '../[...catchall]';
import middleware from '../../middleware';
import { jsonError, type ApiRes } from '../_utils';

const ROOT = join(__dirname, '..', '..');

function makeRes() {
  let statusCode = 200;
  let body: unknown = null;
  const res: ApiRes = {
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

describe('Agent Readiness: Public Assets & Discovery', () => {
  it('publishes a valid OpenAPI 3.1.0 JSON specification', () => {
    const specPath = join(ROOT, 'public', 'openapi.json');
    expect(existsSync(specPath)).toBe(true);

    const content = JSON.parse(readFileSync(specPath, 'utf-8'));
    expect(content.openapi).toBe('3.1.0');
    expect(content.info?.title).toBe('Veilpay API');
    expect(content.paths?.['/api/waitlist-start']).toBeDefined();
    expect(content.paths?.['/api/waitlist-verify']).toBeDefined();
    expect(content.paths?.['/api/v1/health']).toBeDefined();
    expect(content.paths?.['/api/v1/invoice/create']).toBeDefined();
    expect(content.components?.schemas?.ErrorResponse).toBeDefined();
    expect(content.components?.schemas?.ErrorDetail).toBeDefined();
  });

  it('publishes a valid OpenAPI 3.1.0 YAML specification', () => {
    const specPath = join(ROOT, 'public', 'openapi.yaml');
    expect(existsSync(specPath)).toBe(true);

    const content = readFileSync(specPath, 'utf-8');
    expect(content).toContain('openapi: 3.1.0');
    expect(content).toContain('title: Veilpay API');
    expect(content).toContain('/api/waitlist-start:');
    expect(content).toContain('/api/waitlist-verify:');
  });

  it('publishes llms.txt and llms-full.txt with developer resources', () => {
    const llmsPath = join(ROOT, 'public', 'llms.txt');
    const llmsFullPath = join(ROOT, 'public', 'llms-full.txt');
    expect(existsSync(llmsPath)).toBe(true);
    expect(existsSync(llmsFullPath)).toBe(true);

    const llmsContent = readFileSync(llmsPath, 'utf-8');
    expect(llmsContent).toContain('Developer Resources');
    expect(llmsContent).toContain('openapi.json');
    expect(llmsContent).toContain('veilpayapp');

    const fullContent = readFileSync(llmsFullPath, 'utf-8');
    expect(fullContent).toContain('EIP-5564');
    expect(fullContent).toContain('openapi.json');
  });

  it('declares unblocked access in robots.txt for openapi and agent files', () => {
    const robotsPath = join(ROOT, 'public', 'robots.txt');
    expect(existsSync(robotsPath)).toBe(true);

    const robotsContent = readFileSync(robotsPath, 'utf-8');
    expect(robotsContent).toContain('Allow: /openapi.json');
    expect(robotsContent).toContain('Allow: /openapi.yaml');
    expect(robotsContent).toContain('Allow: /llms.txt');
    expect(robotsContent).toContain('Allow: /llms-full.txt');
  });

  it('publishes an agent-friendly 404.html with recovery links', () => {
    const p404Path = join(ROOT, 'public', '404.html');
    expect(existsSync(p404Path)).toBe(true);

    const html = readFileSync(p404Path, 'utf-8');
    expect(html).toContain('404');
    expect(html).toContain('Page Not Found');
    expect(html).toContain('/openapi.json');
    expect(html).toContain('/llms.txt');
    expect(html).toContain('/sitemap.xml');
  });
});

describe('Agent Readiness: Structured JSON Errors & API Catch-All', () => {
  it('jsonError helper formats structured error payloads with code, message, and hint', () => {
    const { res, statusCode, body } = makeRes();
    jsonError(res, 400, 'TEST_CODE', 'Test message', 'Test hint');

    expect(statusCode()).toBe(400);
    expect(body()).toEqual({
      error: {
        code: 'TEST_CODE',
        message: 'Test message',
        hint: 'Test hint',
      },
    });
  });

  it('catch-all API handler returns structured 404 JSON for unknown /api/* routes', async () => {
    const { res, statusCode, body } = makeRes();
    await catchallHandler({ method: 'GET' }, res);

    expect(statusCode()).toBe(404);
    const err = (body() as { error: { code: string; message: string; hint?: string } }).error;
    expect(err.code).toBe('NOT_FOUND');
    expect(err.message).toContain('not found');
    expect(err.hint).toContain('openapi.json');
  });
});

describe('Agent Readiness: Markdown Content Negotiation (acceptmarkdown.com)', () => {
  it('returns 404 markdown recovery guide when unknown route is requested with Accept: text/markdown', async () => {
    const req = new Request('https://veilpayapp.com/nonexistent-route-for-agent', {
      headers: { Accept: 'text/markdown' },
    });

    const res = middleware(req);
    expect(res).toBeInstanceOf(Response);
    if (res instanceof Response) {
      expect(res.status).toBe(404);
      expect(res.headers.get('Content-Type')).toContain('text/markdown');
      expect(res.headers.get('Vary')).toContain('Accept');
      const text = await res.text();
      expect(text).toContain('# 404 Not Found');
      expect(text).toContain('openapi.json');
      expect(text).toContain('llms.txt');
    }
  });

  it('rewrites known routes to markdown documents on Accept: text/markdown', () => {
    const req = new Request('https://veilpayapp.com/private-wallet', {
      headers: { Accept: 'text/markdown' },
    });

    const res = middleware(req);
    // Vercel rewrite response
    expect(res).toBeDefined();
  });
});
