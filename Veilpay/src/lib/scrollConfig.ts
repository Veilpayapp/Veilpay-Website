/**
 * Global GSAP ScrollTrigger configuration — imported once from main.tsx.
 *
 * Two problems this solves for the pinned scroll sections:
 *
 * 1. Android/iOS URL-bar resize. As you scroll, the mobile browser chrome
 *    shows/hides, which changes window.innerHeight and fires a `resize`. By
 *    default ScrollTrigger recalculates every pin on that resize, so the whole
 *    page visibly jumps mid-scroll. `ignoreMobileResize: true` tells it to
 *    ignore those height-only changes → no more jump.
 *
 * 2. Orientation / real size changes. When the width actually changes
 *    (rotation, split-screen, desktop resize) the pinned timelines DO need to
 *    recompute their vw-based offsets. We refresh once, debounced, after the
 *    change settles — combined with `invalidateOnRefresh` on each timeline the
 *    animations re-derive their target values for the new resolution.
 */
import { ScrollTrigger } from 'gsap/ScrollTrigger';

/**
 * Is this a phone/tablet (coarse pointer or mobile UA)? Detected the SAME way
 * SmoothScroll decides to disable Lenis, so the "no Lenis → native scroll" path
 * and the mobile-only performance tuning below always agree on what a phone is.
 * Evaluated once at import — pointer type doesn't change within a session.
 */
export function isTouchDevice(): boolean {
  if (typeof window === 'undefined') return false;
  return (
    window.matchMedia('(pointer: coarse)').matches ||
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
  );
}

/** Cached phone/tablet flag — the switch behind every mobile-only tuning knob. */
export const TOUCH = isTouchDevice();

/**
 * Length of the pinned ScrollSequence timeline (px of scroll it holds for).
 *
 * Desktop keeps the original, long cinematic distance untouched. Phones get a
 * shorter timeline: the same choreography compressed into less scroll = far
 * fewer cumulative scrub/paint frames AND much less finger-scrolling to pass the
 * story, which is the single biggest mobile scroll-perf win here.
 */
export const SEQUENCE_SCROLL_END = TOUCH ? 8000 : 12000;

/**
 * Absolute scroll position the "Features" nav link jumps to — the point where
 * the bento grid has settled (~90% into the sequence). Kept in lockstep with
 * SEQUENCE_SCROLL_END so shortening the mobile timeline can't desync the target.
 * Desktop keeps its original, hand-tuned 11000.
 */
export const FEATURES_SCROLL_TARGET = TOUCH ? Math.round(SEQUENCE_SCROLL_END * 0.9) : 11000;

let configured = false;

export function configureScrollTriggers(): void {
  if (configured || typeof window === 'undefined') return;
  configured = true;

  ScrollTrigger.config({
    // Height-only mobile resizes (URL-bar) no longer thrash the pins.
    ignoreMobileResize: true,
  });

  // Only a genuine WIDTH change is treated as a layout-affecting resize; the
  // URL-bar toggles height alone and is intentionally ignored here too.
  let lastWidth = window.innerWidth;
  let timer: ReturnType<typeof setTimeout> | null = null;

  const refresh = () => {
    const w = window.innerWidth;
    if (w === lastWidth) return; // height-only change (URL-bar) → skip
    lastWidth = w;
    if (timer) clearTimeout(timer);
    // Debounce: rotation and window drags fire many events; refresh once it settles.
    timer = setTimeout(() => ScrollTrigger.refresh(), 250);
  };

  window.addEventListener('resize', refresh, { passive: true });
  window.addEventListener('orientationchange', refresh, { passive: true });
}
