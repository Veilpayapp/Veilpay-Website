// Scroll navigation for the home page's GSAP pinned sections.
//
// Extracted from GlassNavbar so the navbar file exports only the component
// (satisfies react-refresh/only-export-components) and the scroll logic lives
// with the rest of the scroll utilities. App.tsx imports handleScroll from here
// for its route-change auto-scroll; GlassNavbar re-exports it for its nav links.

import type { MouseEvent as ReactMouseEvent } from 'react';
import { getLenisInstance } from '@/lib/utils';
import { FEATURES_SCROLL_TARGET } from '@/lib/scrollConfig';

// GSAP (for the phone scroll tween in handleScroll) is imported lazily inside
// the click handler rather than at module scope — otherwise the navbar, which
// renders on first paint, would drag the whole GSAP runtime onto the critical
// path even though the tween only ever runs on a user's nav click.

// Smooth cubic ease-in-out for the cinematic scroll — pure, so hoisted to module scope
// instead of being re-created on every render.
export const easeInOutCubic = (t: number) => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

// Uses only its arguments + module-scope helpers (no component state/props), so it lives
// at module scope to avoid being rebuilt every render and to keep memoized children stable.
export const handleScroll = async (
  e: ReactMouseEvent<Element, MouseEvent> | null,
  target: string | number,
) => {
  if (e) e.preventDefault();

  const { ScrollTrigger } = await import('gsap/ScrollTrigger');
  const lenis = getLenisInstance();

  let scrollTarget: string | number = target;
  if (target === '#download' || target === '#waitlist-social' || target === '#waitlist') {
    const trigger = ScrollTrigger.getById('download-trigger');
    if (trigger && typeof trigger.end === 'number') {
      // The DownloadSection pins and scales up. We want to scroll perfectly to the end
      // of its pin distance so the user sees the fully scaled-up form.
      scrollTarget = trigger.end;
    } else {
      const anchor = document.getElementById('download-anchor') || document.getElementById('download');
      if (anchor) {
        const rect = anchor.getBoundingClientRect();
        const absoluteTop = rect.top + window.scrollY;
        const section = document.getElementById('download');
        const pinDistance = section ? section.offsetHeight * 1.5 : window.innerHeight * 1.5;
        scrollTarget = absoluteTop + pinDistance;
      }
    }
  } else if (target === '#features') {
    // The Bento Grid is deep inside a GSAP ScrollSequence pinned timeline. It
    // settles near the end of that timeline; FEATURES_SCROLL_TARGET tracks the
    // right offset for the current device (shorter on phones, 11000 on desktop).
    scrollTarget = FEATURES_SCROLL_TARGET;
  } else if (target === '#footer') {
    // The footer is heavily affected by GSAP pins above it.
    // To reach it, we must scroll to the absolute maximum height of the document.
    scrollTarget = document.documentElement.scrollHeight;
  }

  if (lenis) {
    // Lenis owns the scroll loop. 2.5 second elegant cinematic scroll on desktop,
    // 1.4s snappy scroll on mobile so it doesn't feel sluggish.
    const isMobile = window.innerWidth <= 768;
    // Workaround: Lenis scrollTo(0) can sometimes be ignored or cause GSAP pin conflicts
    // at the exact 0px boundary. 1px is visually identical and guarantees the scroll event fires.
    const safeTarget = scrollTarget === 0 ? 1 : scrollTarget;
    lenis.scrollTo(safeTarget, {
      duration: isMobile ? 1.4 : 2.5,
      easing: easeInOutCubic,
    });
  } else {
    // Phones (no Lenis): drive the scroll with GSAP instead of the browser's
    // native `behavior:'smooth'`. Native smoothing runs its OWN easing loop that
    // fights every pinned `scrub` timeline chasing the same moving target — the
    // result is the stutter you feel jumping to a section. A GSAP ScrollToPlugin
    // tween updates ScrollTrigger in lockstep, so the pins scrub cleanly.
    // autoKill stops the tween the instant the user touches the screen.
    let y: number | undefined;
    if (typeof scrollTarget === 'number') {
      y = scrollTarget;
    } else {
      const el = document.querySelector(scrollTarget as string);
      if (el) {
        y = el.getBoundingClientRect().top + window.scrollY;
      }
    }

    if (y === undefined || isNaN(y)) return;

    const [{ default: gsap }, { ScrollToPlugin }] = await Promise.all([
      import('gsap'),
      import('gsap/ScrollToPlugin'),
    ]);
    gsap.registerPlugin(ScrollToPlugin);
    gsap.to(window, {
      duration: 1.6,
      scrollTo: { y, autoKill: true },
      ease: 'power2.inOut',
      overwrite: true,
    });
  }
};
