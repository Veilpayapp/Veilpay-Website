// @vitest-environment jsdom
import { describe, it, expect, afterEach, vi } from 'vitest';

// scrollConfig computes TOUCH at module import time from matchMedia + UA, so
// each scenario reloads the module fresh with the environment stubbed.
async function loadScrollConfig(ua?: string, coarsePointer = false) {
  vi.resetModules();
  Object.defineProperty(navigator, 'userAgent', { value: ua ?? navigator.userAgent, configurable: true });
  window.matchMedia = (() =>
    ({
      matches: coarsePointer,
      media: '(pointer: coarse)',
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    })) as never;
  return await import('../scrollConfig');
}

describe('scrollConfig device detection', () => {
  afterEach(() => {
    vi.resetModules();
  });

  it('detects desktop (non-touch) and uses the long timeline', async () => {
    const mod = await loadScrollConfig(
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    );
    expect(mod.TOUCH).toBe(false);
    expect(mod.SEQUENCE_SCROLL_END).toBe(12000);
    expect(mod.FEATURES_SCROLL_TARGET).toBe(11000);
  });

  it('detects touch devices and compresses the timeline', async () => {
    const mod = await loadScrollConfig(
      'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15',
    );
    expect(mod.TOUCH).toBe(true);
    expect(mod.SEQUENCE_SCROLL_END).toBe(8000);
    expect(mod.FEATURES_SCROLL_TARGET).toBe(7200); // 90% of 8000
  });

  it('detects coarse-pointer devices via matchMedia', async () => {
    const mod = await loadScrollConfig(undefined, true);
    expect(mod.TOUCH).toBe(true);
  });
});
