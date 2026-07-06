import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollToPlugin } from 'gsap/ScrollToPlugin';
import { getLenisInstance } from '@/lib/utils';
import { isLowEnd } from '@/lib/deviceCapability';
import { FEATURES_SCROLL_TARGET } from '@/lib/scrollConfig';
import ThemeToggle from './ThemeToggle';

// GSAP drives the phone scroll tween (see handleScroll) so it stays in lockstep
// with the pinned ScrollTriggers instead of racing the browser's own smoothing.
gsap.registerPlugin(ScrollToPlugin);

// Smooth quartic ease-out for the cinematic scroll — pure, so hoisted to module scope
// instead of being re-created on every render.
const easeOutQuart = (t: number) => 1 - Math.pow(1 - t, 4);

// Removed navPanelStyle, migrating sizing to Tailwind for responsive mobile design.

const logoStyle: React.CSSProperties = {
  width: '40px',
  height: '40px',
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
const handleScroll = (
  e: React.MouseEvent<HTMLAnchorElement | HTMLButtonElement>,
  target: string | number,
) => {
  e.preventDefault();

  let scrollTarget: string | number = target;
  if (target === '#download') {
    const downloadSection = document.getElementById('download');
    if (downloadSection) {
      // The DownloadSection pins and scales up for 150% of the viewport height.
      // Scroll perfectly to the end of the pin where the box is fully scaled.
      const rect = downloadSection.getBoundingClientRect();
      const absoluteTop = rect.top + window.scrollY;
      scrollTarget = absoluteTop + (window.innerHeight * 1.5);
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

  const lenis = getLenisInstance();
  if (lenis) {
    // Desktop: Lenis owns the scroll loop. 4 second super-elegant cinematic scroll.
    lenis.scrollTo(scrollTarget, {
      duration: 4,
      easing: easeOutQuart,
    });
  } else {
    // Phones (no Lenis): drive the scroll with GSAP instead of the browser's
    // native `behavior:'smooth'`. Native smoothing runs its OWN easing loop that
    // fights every pinned `scrub` timeline chasing the same moving target — the
    // result is the stutter you feel jumping to a section. A GSAP ScrollToPlugin
    // tween updates ScrollTrigger in lockstep, so the pins scrub cleanly.
    // autoKill stops the tween the instant the user touches the screen.
    const y = typeof scrollTarget === 'number' ? scrollTarget : 0;
    gsap.to(window, {
      duration: 1.6,
      scrollTo: { y, autoKill: true },
      ease: 'power2.inOut',
      overwrite: true,
    });
  }
};

export default function GlassNavbar() {
  const lowEnd = isLowEnd();
  const navigate = useNavigate();
  const location = useLocation();
  const onHome = location.pathname === '/';
  const [showDocsPopup, setShowDocsPopup] = useState(false);

  // On the home page, anchor clicks drive the Lenis smooth-scroll timeline.
  // On a sub-route (legal pages) there is no scroll timeline, so send the
  // visitor back to the home route instead of trying to scroll to a section.
  const handleNav = (
    e: React.MouseEvent<HTMLAnchorElement | HTMLButtonElement>,
    target: string | number,
  ) => {
    if (!onHome) {
      e.preventDefault();
      navigate('/');
      return;
    }
    handleScroll(e, target);
  };

  // On low-end devices, skip the heavy backdrop-filter + SVG displacement
  // and use a simple semi-transparent background instead.
  // Tailwind responsive classes: on mobile it takes full width minus margins, on md+ it takes min-w-[550px].
  const glassClass = lowEnd
    ? 'fixed top-6 left-0 right-0 mx-auto z-50 flex items-center justify-between md:justify-center gap-2 md:gap-12 px-3 md:px-8 bg-black/60 border border-white/10 w-[calc(100%-32px)] md:w-max md:min-w-[550px] h-[56px] rounded-[40px]'
    : 'fixed top-6 left-0 right-0 mx-auto z-50 flex items-center justify-between md:justify-center gap-2 md:gap-12 px-3 md:px-8 ios-glass w-[calc(100%-32px)] md:w-max md:min-w-[550px] h-[56px] rounded-[40px]';
  return (
    <>
      <motion.nav
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2, ease: 'easeOut' }}
        className={glassClass}
      >

        {/* Left Section (Logo + Links) */}
        <div className="flex items-center gap-2 md:gap-8 relative z-10">
          {/* Logo → home */}
          <Link to="/" aria-label="VeilPay home" className="preserve-color block flex-shrink-0" style={logoStyle} />

          {/* Nav Links — visible on all screen sizes, smaller text on mobile */}
          <div className="flex items-center gap-2.5 md:gap-10">
            <a href="/" onClick={(e) => handleNav(e, 0)} className="text-[9px] md:text-[13px] font-semibold text-white/70 hover:text-white transition-colors tracking-wide uppercase">Home</a>
            <a href="/#features" onClick={(e) => handleNav(e, '#features')} className="text-[9px] md:text-[13px] font-semibold text-white/70 hover:text-white transition-colors tracking-wide uppercase">Features</a>
            <a href="/#download" onClick={(e) => handleNav(e, '#download')} className="text-[9px] md:text-[13px] font-semibold text-white/70 hover:text-white transition-colors tracking-wide uppercase">Contact</a>
          </div>
        </div>

        {/* Right Section (Action Buttons) */}
        <div className="flex items-center gap-1.5 md:gap-3 relative z-10">
          <button
            type="button"
            onClick={() => setShowDocsPopup(true)}
            className="ios-glass text-[10px] md:text-[12px] font-bold text-white hover:text-amber-400 transition-colors tracking-wide uppercase px-2.5 md:px-4 py-1.5 md:py-2 rounded-full"
          >
            DOCS
          </button>
          <button
            type="button"
            onClick={(e) => handleNav(e, '#download')}
            className="ios-glass-gold text-[10px] md:text-[12px] font-bold text-black hover:brightness-110 transition-all tracking-wide uppercase px-2.5 md:px-4 py-1.5 md:py-2 rounded-full preserve-color"
          >
            WAITLIST
          </button>
          <div className="hidden md:block">
            <ThemeToggle />
          </div>
        </div>
      </motion.nav>

      <div className="md:hidden">
        <ThemeToggle className="fixed bottom-6 right-4 z-[100] w-12 h-12 shadow-2xl" />
      </div>

      <AnimatePresence>
        {showDocsPopup && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm"
            onClick={() => setShowDocsPopup(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="ios-glass p-8 flex flex-col items-center justify-center gap-4 text-center max-w-sm mx-4 border border-white/20 rounded-[32px]"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#E8B84B] to-[#B8791F] flex items-center justify-center mb-2 shadow-[0_0_15px_rgba(232,184,75,0.4)]">
                <svg className="w-6 h-6 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-white tracking-tight">Docs Coming Soon</h3>
              <p className="text-sm text-white/70 leading-relaxed">
                We're actively building out our developer documentation. Stay tuned!
              </p>
              <button
                onClick={() => setShowDocsPopup(false)}
                className="mt-2 ios-glass-gold px-6 py-2.5 rounded-full text-black font-bold text-sm uppercase tracking-wide w-full hover:brightness-110 transition-all"
              >
                Got it
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
