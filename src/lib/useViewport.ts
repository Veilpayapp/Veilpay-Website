/**
 * Dynamic viewport primitives.
 *
 * These hooks let any component re-render its content/props for the CURRENT
 * resolution instead of baking in a size at first mount. They subscribe to the
 * live matchMedia / resize signal, so a phone rotation, a desktop window drag,
 * or the Android URL-bar collapsing all flow through as a state update — the
 * component "auto-frames" itself rather than getting stuck at the size it
 * happened to load at.
 *
 * SSR-safe: every hook falls back to a sensible default when `window` is absent.
 */
import { useState, useEffect, useSyncExternalStore } from 'react';

// Tailwind's default breakpoints, kept in one place so JS and CSS agree.
export const BREAKPOINTS = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
} as const;

export type Breakpoint = keyof typeof BREAKPOINTS;

/**
 * Subscribe to a media query and re-render when it flips.
 * `useMediaQuery('(min-width: 768px)')` → boolean that stays live.
 */
export function useMediaQuery(query: string): boolean {
  const subscribe = (cb: () => void) => {
    if (typeof window === 'undefined') return () => {};
    const mql = window.matchMedia(query);
    // Safari <14 only supports the deprecated addListener signature.
    if (mql.addEventListener) mql.addEventListener('change', cb);
    else mql.addListener(cb);
    return () => {
      if (mql.removeEventListener) mql.removeEventListener('change', cb);
      else mql.removeListener(cb);
    };
  };
  const getSnapshot = () =>
    typeof window !== 'undefined' && window.matchMedia(query).matches;
  const getServerSnapshot = () => false;

  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

/** True at or above the given Tailwind breakpoint (e.g. useBreakpoint('md')). */
export function useBreakpoint(bp: Breakpoint): boolean {
  return useMediaQuery(`(min-width: ${BREAKPOINTS[bp]}px)`);
}

/** Coarse-pointer (touch) devices — phones and tablets. */
export function useIsTouch(): boolean {
  return useMediaQuery('(pointer: coarse)');
}

/**
 * Live viewport size. Uses visualViewport when available so the reported height
 * tracks the Android/iOS URL-bar showing & hiding (the usual cause of layout
 * "jumps" on scroll). Debounced via rAF to stay cheap during a drag/resize.
 */
export function useViewportSize(): { width: number; height: number } {
  const [size, setSize] = useState(() => ({
    width: typeof window !== 'undefined' ? window.innerWidth : 1280,
    height: typeof window !== 'undefined' ? window.innerHeight : 800,
  }));

  useEffect(() => {
    if (typeof window === 'undefined') return;
    let frame = 0;
    const read = () => {
      frame = 0;
      const vv = window.visualViewport;
      setSize({
        width: vv?.width ?? window.innerWidth,
        height: vv?.height ?? window.innerHeight,
      });
    };
    const onResize = () => {
      if (frame) return; // coalesce bursts into one rAF
      frame = requestAnimationFrame(read);
    };

    window.addEventListener('resize', onResize, { passive: true });
    window.addEventListener('orientationchange', onResize, { passive: true });
    window.visualViewport?.addEventListener('resize', onResize, { passive: true });
    read();

    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener('resize', onResize);
      window.removeEventListener('orientationchange', onResize);
      window.visualViewport?.removeEventListener('resize', onResize);
    };
  }, []);

  return size;
}
