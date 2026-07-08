import { useEffect, useRef } from 'react';

/**
 * Slim right-edge scroll indicator. A faint full-height track with a gold
 * gradient fill that grows top→bottom as the page scrolls, so the reader always
 * knows how far through they are. Read-only and ambient (not draggable) — the
 * native scrollbar is hidden in index.css and this replaces its wayfinding job.
 *
 * Performance notes (this site pins several GSAP scenes and drives desktop
 * scroll through Lenis):
 *  - We read `window.scrollY` on every scroll, but only ever WRITE inside a
 *    single rAF, coalescing bursts of Lenis/native scroll events into one paint.
 *  - The only thing we mutate is `transform: scaleY(...)` on the fill — a
 *    GPU-composited property, so the indicator never triggers layout/repaint on
 *    the pinned sections while scrolling.
 *  - Works under Lenis AND native scroll because both move the document, so
 *    `window.scrollY` + `scroll` (passive, capture) stays authoritative without
 *    coupling this component to Lenis directly.
 *  - A ResizeObserver on <body> keeps the max-scroll denominator correct when
 *    lazy sections mount, fonts swap, or the footer reveal changes page height.
 */
const ScrollProgress = () => {
  const fillRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fill = fillRef.current;
    if (!fill) return;

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let raf = 0;
    let lastScale = -1;

    const paint = () => {
      raf = 0;
      const doc = document.documentElement;
      const max = (doc.scrollHeight || 0) - window.innerHeight;
      // Guard the divide-by-zero on short pages; clamp to [0,1].
      const progress = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
      // Round to avoid sub-pixel churn writing identical frames.
      const scale = Math.round(progress * 1000) / 1000;
      if (scale === lastScale) return;
      lastScale = scale;
      fill.style.transform = `scaleY(${scale})`;
      // Fully collapsed at the very top → hide the fill so no stray gold pip shows.
      fill.style.opacity = scale <= 0.001 ? '0' : '1';
    };

    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(paint);
    };

    // Passive + capture so we still catch scroll even if an inner element handles it.
    window.addEventListener('scroll', schedule, { passive: true, capture: true });
    window.addEventListener('resize', schedule, { passive: true });

    // Page height changes (lazy sections, font swap, footer reveal) shift the
    // denominator; recompute when <body> resizes.
    const ro = new ResizeObserver(schedule);
    ro.observe(document.body);

    if (reduceMotion) fill.style.transition = 'none';
    paint(); // set initial state immediately

    return () => {
      window.removeEventListener('scroll', schedule, { capture: true } as EventListenerOptions);
      window.removeEventListener('resize', schedule);
      ro.disconnect();
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div className="scroll-progress" aria-hidden="true">
      <div ref={fillRef} className="scroll-progress__fill" />
    </div>
  );
};

export default ScrollProgress;
