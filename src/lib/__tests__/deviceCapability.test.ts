// @vitest-environment jsdom
import { describe, it, expect, afterEach, vi } from 'vitest';
import type { DeviceTier } from '../deviceCapability';

// getDeviceTier() caches its result in module scope, so each scenario reloads
// the module fresh with the navigator/screen stubbed to the shape we want.
async function tierWith(opts: {
  nav?: Record<string, unknown>;
  ua?: string;
  matchMedia?: boolean;
  screenPx?: number;
}): Promise<DeviceTier> {
  vi.resetModules();

  vi.stubGlobal('navigator', {
    hardwareConcurrency: 0,
    deviceMemory: undefined,
    connection: { effectiveType: '4g' },
    userAgent: opts.ua ?? 'Mozilla/5.0 (X11; Linux x86_64)',
    ...opts.nav,
  });

  const side = opts.screenPx ? Math.sqrt(opts.screenPx) : 800;
  vi.stubGlobal('screen', { width: side, height: side });
  Object.defineProperty(window, 'devicePixelRatio', { value: 1, configurable: true });

  if (opts.matchMedia !== undefined) {
    window.matchMedia = (() =>
      ({ matches: opts.matchMedia, media: '', addEventListener: vi.fn(), removeEventListener: vi.fn() })) as never;
  }

  const mod = await import('../deviceCapability');
  return mod.getDeviceTier();
}

describe('getDeviceTier', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.resetModules();
  });

  it('defaults to medium with no capability signals (unknown memory is optimistic)', async () => {
    // 0 cores (no bonus) + unknown memory (+2 optimistic) + 4g (+2) + small
    // screen (+0) = 4 → medium.
    const tier = await tierWith({});
    expect(tier).toBe('medium');
  });

  it('returns high for a flagship desktop profile', async () => {
    const tier = await tierWith({
      nav: { hardwareConcurrency: 16, deviceMemory: 16 },
      ua: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      screenPx: 8_000_000,
    });
    expect(tier).toBe('high');
  });

  it('caps a flagship mobile device at medium', async () => {
    const tier = await tierWith({
      nav: { hardwareConcurrency: 16, deviceMemory: 16 },
      ua: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15',
      screenPx: 4_000_000,
    });
    expect(tier).toBe('medium');
  });

  it('returns low for a weak device on a slow connection', async () => {
    const tier = await tierWith({
      nav: { hardwareConcurrency: 1, deviceMemory: 1, connection: { effectiveType: '3g' } },
      ua: 'Mozilla/5.0 (Linux; Android 10) AppleWebKit/537.36',
    });
    expect(tier).toBe('low');
  });

  it('respects prefers-reduced-motion by returning low immediately', async () => {
    const tier = await tierWith({
      nav: { hardwareConcurrency: 16, deviceMemory: 16 },
      matchMedia: true,
    });
    expect(tier).toBe('low');
  });

  it('caches its result across calls', async () => {
    const mod = await import('../deviceCapability');
    const first = mod.getDeviceTier();
    const second = mod.getDeviceTier();
    expect(second).toBe(first);
  });
});
