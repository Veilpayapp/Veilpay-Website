import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { getLenisInstance } from '@/lib/utils';
import { isLowEnd } from '@/lib/deviceCapability';
import { FEATURES_SCROLL_TARGET } from '@/lib/scrollConfig';
import ThemeToggle from './ThemeToggle';

// GSAP (for the phone scroll tween in handleScroll) is imported lazily inside
// the click handler rather than at module scope — otherwise the navbar, which
// renders on first paint, would drag the whole GSAP runtime onto the critical
// path even though the tween only ever runs on a user's nav click.

// Smooth cubic ease-in-out for the cinematic scroll — pure, so hoisted to module scope
// instead of being re-created on every render.
const easeInOutCubic = (t: number) => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

// Removed navPanelStyle, migrating sizing to Tailwind for responsive mobile design.

const logoStyle: React.CSSProperties = {
  backgroundImage: 'url(/logo.webp)',
  backgroundColor: 'transparent',
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  backgroundRepeat: 'no-repeat',
  borderRadius: '50%',
  boxShadow: 'none',
};

// Uses only its arguments + module-scope helpers (no component state/props), so it lives
// at module scope to avoid being rebuilt every render and to keep memoized children stable.
export const handleScroll = async (
  e: React.MouseEvent<Element, MouseEvent> | null,
  target: string | number,
) => {
  if (e) e.preventDefault();

  // Force a synchronous layout recalculation of all pins before measuring.
  // GSAP pin-spacers drastically alter the document height, so we must ensure
  // both GSAP and Lenis are perfectly synced with the DOM before we calculate
  // ANY target offsets (features, footer, waitlist, etc).
  const { ScrollTrigger } = await import('gsap/ScrollTrigger');
  ScrollTrigger.refresh();

  const lenis = getLenisInstance();
  if (lenis) {
    lenis.resize();
  }

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

export default function GlassNavbar() {
  const lowEnd = typeof window === 'undefined' ? false : isLowEnd();
  const navigate = useNavigate();
  const location = useLocation();
  const onHome = ['/', '/waitlist', '/features', '/contact'].includes(location.pathname);

  const isDocsDomain = typeof window !== 'undefined' && window.location.hostname.startsWith('docs.');
  const isLocalhost = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

  const getNavHref = (path: string) => {
    if (isLocalhost) return path;
    if (path.startsWith('/docs')) {
      return isDocsDomain ? path : `https://docs.veilpayapp.com/`;
    }
    return isDocsDomain ? `https://veilpayapp.com${path}` : path;
  };

  // On the home page, anchor clicks drive the Lenis smooth-scroll timeline.
  // On a sub-route (legal pages) there is no scroll timeline, so send the
  // visitor back to the home route instead of trying to scroll to a section.
  const handleNav = (
    e: React.MouseEvent<Element, MouseEvent>,
    target: string | number,
    routePath: string
  ) => {
    const href = getNavHref(routePath);
    if (href.startsWith('http')) {
      // Let the browser natively handle the cross-domain navigation
      return;
    }

    e.preventDefault();

    if (!onHome) {
      navigate(routePath);
      return;
    }
    
    // Update the URL without reloading the page while preserving the smooth scroll
    if (window.history.pushState) {
      window.history.pushState(null, '', routePath);
    }
    
    handleScroll(null, target);
  };

  // On low-end devices, skip the heavy backdrop-filter + SVG displacement
  // and use a simple semi-transparent background instead.
  // Tailwind responsive classes: on mobile it takes full width minus margins, on md+ it takes min-w-[550px].
  const glassClass = lowEnd
    ? 'fixed top-6 left-0 right-0 mx-auto z-50 flex items-center justify-between md:justify-center gap-1 md:gap-12 px-2 md:px-8 bg-black/60 border border-white/10 w-[calc(100%-24px)] md:w-max md:min-w-[550px] h-[56px] rounded-[40px]'
    : 'fixed top-6 left-0 right-0 mx-auto z-50 flex items-center justify-between md:justify-center gap-1 md:gap-12 px-2 md:px-8 ios-glass w-[calc(100%-24px)] md:w-max md:min-w-[550px] h-[56px] rounded-[40px]';
  return (
    <>
      <motion.nav
        aria-label="Main navigation"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2, ease: 'easeOut' }}
        className={glassClass}
      >

        {/* Left Section (Logo + Links) */}
        <div className="flex items-center gap-1.5 md:gap-8 relative z-10">
          {/* Logo → home */}
          <a href={getNavHref('/')} onClick={(e) => handleNav(e, 0, '/')} aria-label="Veilpay home" className="preserve-color block flex-shrink-0 w-[32px] h-[32px] md:w-[40px] md:h-[40px]" style={logoStyle} />

          {/* Nav Links — visible on all screen sizes, smaller text on mobile */}
          <div className="flex items-center gap-1.5 md:gap-10">
            <a href={getNavHref('/')} onClick={(e) => handleNav(e, 0, '/')} className="text-[9px] md:text-[13px] font-semibold text-white/70 hover:text-white transition-colors tracking-wide uppercase">Home</a>
            <a href={getNavHref('/features')} onClick={(e) => handleNav(e, '#features', '/features')} className="text-[9px] md:text-[13px] font-semibold text-white/70 hover:text-white transition-colors tracking-wide uppercase">Features</a>
            <a href={getNavHref('/contact')} onClick={(e) => handleNav(e, '#footer', '/contact')} className="text-[9px] md:text-[13px] font-semibold text-white/70 hover:text-white transition-colors tracking-wide uppercase">Contact</a>
            {/* Hidden links for SEO crawlers to distribute PageRank */}
            <a href={getNavHref('/private-wallet')} className="sr-only">Private Wallet</a>
          </div>
        </div>

        {/* Right Section (Action Buttons) */}
        <div className="flex items-center gap-1 md:gap-3 relative z-10 md:pr-14">
          <a
            href={getNavHref('/docs')}
            onClick={(e) => {
              const href = getNavHref('/docs');
              if (href.startsWith('http')) return;
              e.preventDefault();
              navigate('/docs');
            }}
            className="ios-glass text-[9px] md:text-[12px] font-bold text-white hover:text-amber-400 transition-colors tracking-wide uppercase px-2 md:px-4 py-1.5 md:py-2 rounded-full inline-block"
          >
            DOCS
          </a>
          <a
            href={getNavHref('/waitlist')}
            onClick={(e) => handleNav(e, '#waitlist', '/waitlist')}
            className="ios-glass-gold text-[9px] md:text-[12px] font-bold text-black hover:brightness-110 transition-all tracking-wide uppercase px-2 md:px-4 py-1.5 md:py-2 rounded-full preserve-color flex-shrink-0 inline-block"
          >
            WAITLIST
          </a>
        </div>

        {/* Theme Toggle (PC - Navbar End) */}
        <div className="hidden md:block absolute right-2 top-1/2 -translate-y-1/2 z-20">
          <ThemeToggle className="!w-10 !h-10" />
        </div>
      </motion.nav>

      <div className="md:hidden">
        <ThemeToggle className="fixed bottom-6 right-4 z-[100] w-12 h-12 shadow-2xl" />
      </div>

    </>
  );
}
