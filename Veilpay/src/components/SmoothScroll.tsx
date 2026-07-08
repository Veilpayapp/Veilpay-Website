import React, { useEffect } from 'react';
import type LenisType from 'lenis';
import { setLenisInstance } from '@/lib/utils';

interface SmoothScrollProps {
  children: React.ReactNode;
}

const SmoothScroll: React.FC<SmoothScrollProps> = ({ children }) => {
  useEffect(() => {
    const prefersReducedMotion =
      typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let lenis: LenisType | null = null;
    let tick: ((time: number) => void) | null = null;
    let gsapRef: typeof import('gsap').default | null = null;
    let cancelled = false;

    // Lenis + GSAP are pulled in dynamically (not statically imported) so this
    // wrapper — which sits on the first-paint render path just below the
    // preloader — does not drag the GSAP/Lenis runtime onto the critical path.
    // Smooth scroll wires up a frame after the hero has already painted.
    (async () => {
      const [{ default: gsap }, { ScrollTrigger }, { default: Lenis }] = await Promise.all([
        import('gsap'),
        import('gsap/ScrollTrigger'),
        import('lenis'),
      ]);
      if (cancelled) return;
      gsap.registerPlugin(ScrollTrigger);
      gsapRef = gsap;

      if (prefersReducedMotion) {
        // Make sure ScrollTrigger recalculates against the native scroller.
        ScrollTrigger.refresh();
        return;
      }

      // Initialize Lenis
      lenis = new Lenis({
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // https://www.desmos.com/calculator/brs54l4xou
        wheelMultiplier: 1,
        syncTouch: true,
        touchMultiplier: 1.8,
      });
      setLenisInstance(lenis);

      // Connect GSAP ScrollTrigger to Lenis
      lenis.on('scroll', ScrollTrigger.update);

      // Sync GSAP ticker with Lenis requestAnimationFrame
      tick = (time: number) => {
        lenis!.raf(time * 1000);
      };
      gsap.ticker.add(tick);
      gsap.ticker.lagSmoothing(0);
    })();

    return () => {
      // Cleanup — remove the exact same ticker callback that was added.
      cancelled = true;
      if (lenis) lenis.destroy();
      if (gsapRef && tick) gsapRef.ticker.remove(tick);
    };
  }, []);

  return <>{children}</>;
};

export default SmoothScroll;
