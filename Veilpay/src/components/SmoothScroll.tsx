import React, { useEffect, useRef } from 'react';
import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { setLenisInstance } from '@/lib/utils';

interface SmoothScrollProps {
  children: React.ReactNode;
}

const SmoothScroll: React.FC<SmoothScrollProps> = ({ children }) => {
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    // Lenis runs a per-frame JS scroll loop. On phones this FIGHTS the browser's
    // native compositor-driven momentum scroll — the OS already scrolls smoothly
    // off the main thread, so layering Lenis on top just drops frames and makes
    // the GSAP-pinned sections feel laggy. Skip it on touch devices (and when the
    // user asked for reduced motion); ScrollTrigger falls back to native scroll,
    // which pins correctly on its own. Nav links use window.scrollTo instead.
    const isTouch =
      typeof window !== 'undefined' &&
      (window.matchMedia('(pointer: coarse)').matches ||
        window.matchMedia('(prefers-reduced-motion: reduce)').matches ||
        /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent));
    if (isTouch) {
      // Make sure ScrollTrigger recalculates against the native scroller.
      ScrollTrigger.refresh();
      return;
    }

    // Initialize Lenis
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // https://www.desmos.com/calculator/brs54l4xou
      wheelMultiplier: 1,
    });
    lenisRef.current = lenis;
    setLenisInstance(lenis);

    // Connect GSAP ScrollTrigger to Lenis
    lenis.on('scroll', ScrollTrigger.update);

    // Sync GSAP ticker with Lenis requestAnimationFrame
    const tick = (time: number) => {
      lenis.raf(time * 1000);
    };
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    return () => {
      // Cleanup — remove the exact same ticker callback that was added.
      lenis.destroy();
      gsap.ticker.remove(tick);
    };
  }, []);

  return <>{children}</>;
};

export default SmoothScroll;
