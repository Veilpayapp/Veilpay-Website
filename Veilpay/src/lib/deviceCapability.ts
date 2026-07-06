/**
 * Device capability detection — scores the visitor's device and returns a
 * tier that the rest of the app uses to conditionally enable/disable heavy
 * visual features (3D coins, sparkle canvas, backdrop-filter, noise overlay).
 *
 * Three tiers:
 *   • high   — flagship phone / desktop: full site as designed
 *   • medium — mid-range: skip 3D coins (Three.js ~940KB + WebGL init)
 *   • low    — budget phone / slow connection: also skip sparkles, noise,
 *              heavy backdrop-filter, reduce canvas animations
 *
 * Detection signals (all optional — graceful fallback to 'high'):
 *   navigator.hardwareConcurrency   — CPU core count
 *   navigator.deviceMemory          — RAM in GB (Chrome-only)
 *   navigator.connection             — effective connection type
 *   screen dimensions                — high-res usually means powerful GPU
 *   prefers-reduced-motion           — user explicitly asked for less motion
 */

export type DeviceTier = 'high' | 'medium' | 'low';

let cachedTier: DeviceTier | null = null;

export function getDeviceTier(): DeviceTier {
  if (cachedTier) return cachedTier;

  // Respect the user's accessibility preference immediately
  if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    cachedTier = 'low';
    return cachedTier;
  }

  let score = 0; // higher = more capable

  // ── CPU cores ──
  const cores = navigator.hardwareConcurrency ?? 0;
  if (cores >= 8) score += 3;
  else if (cores >= 4) score += 2;
  else if (cores >= 2) score += 1;
  // 0 or 1 core → no bonus

  // ── Device memory (Chrome/Edge only) ──
  const mem = (navigator as unknown as { deviceMemory?: number }).deviceMemory ?? 0;
  if (mem >= 8) score += 3;
  else if (mem >= 4) score += 2;
  else if (mem >= 2) score += 1;
  else if (mem > 0) score += 0; // <2GB = weak
  else score += 2; // unknown → optimistic (desktop browsers often hide this)

  // ── Connection quality ──
  const conn = (navigator as unknown as { connection?: { effectiveType?: string } }).connection;
  const ect = conn?.effectiveType ?? '4g';
  if (ect === '4g') score += 2;
  else if (ect === '3g') score += 1;
  // 2g / slow-2g → no bonus

  // ── Screen resolution (proxy for GPU power) ──
  const px = (typeof screen !== 'undefined')
    ? screen.width * screen.height * (window.devicePixelRatio || 1)
    : 0;
  if (px > 4_000_000) score += 2;      // high-DPI / large screen
  else if (px > 2_000_000) score += 1;

  // ── Tier thresholds ──
  // Max possible = 3 + 3 + 2 + 2 = 10
  if (score >= 7) cachedTier = 'high';
  else if (score >= 4) cachedTier = 'medium';
  else cachedTier = 'low';

  return cachedTier;
}

/** Convenience: does this device qualify for the full visual experience? */
export function isHighEnd(): boolean {
  return getDeviceTier() === 'high';
}

/** Convenience: should we strip heavy decorative features? */
export function isLowEnd(): boolean {
  return getDeviceTier() === 'low';
}

/**
 * Explicit check for Android or iOS mobile devices.
 */
export function isMobileDevice(): boolean {
  if (typeof navigator === 'undefined') return false;
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}
