import { describe, it, expect } from 'vitest';
import { resolveInternalLink } from '../linkResolver';
import { docsRegistry } from '../../../generated/docsManifest.generated';

// Mock registry for testing link resolution
docsRegistry.sourceToPage = {
  'privacy/overview.md': {
    id: 'privacy/overview.md',
    title: 'Privacy overview',
    sourcePath: 'privacy/overview.md',
    routePath: '/docs/privacy/overview',
    depth: 1,
    order: 10
  }
};

describe('Link Resolver', () => {
  it('resolves relative path to correct route', () => {
    const resolved = resolveInternalLink('../privacy/overview.md', 'getting-started/what-is-veilpay.md');
    expect(resolved).toBe('/docs/privacy/overview');
  });

  it('keeps hash fragments', () => {
    const resolved = resolveInternalLink('../privacy/overview.md#limitations', 'getting-started/what-is-veilpay.md');
    expect(resolved).toBe('/docs/privacy/overview#limitations');
  });

  it('keeps same-page hashes', () => {
    const resolved = resolveInternalLink('#what-is-veilpay', 'getting-started/what-is-veilpay.md');
    expect(resolved).toBe('#what-is-veilpay');
  });

  it('keeps external links', () => {
    const resolved = resolveInternalLink('https://veilpay.com', 'getting-started/what-is-veilpay.md');
    expect(resolved).toBe('https://veilpay.com');
  });
});
