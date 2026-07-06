import React, { useRef, useLayoutEffect, useState, useEffect, lazy, Suspense } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import MeshGrid from './MeshGrid';
import IPhoneMockup from './IPhoneMockup';
import LightArc from './LightArc';
import BentoGrid from './BentoGrid';
import HeroTitle from './HeroTitle';
import IntroTitle from './IntroTitle';
import { getDeviceTier, isMobileDevice } from '@/lib/deviceCapability';
import { TOUCH, SEQUENCE_SCROLL_END } from '@/lib/scrollConfig';

// The 3D coins pull in the entire Three.js runtime (~940KB). They are purely
// decorative and fade in via GSAP, so we lazy-load them to keep Three.js off
// the initial critical path — the hero paints first, coins mount right after.
const CoinsScene = lazy(() => import('./CoinsScene'));

gsap.registerPlugin(ScrollTrigger);

const ScrollSequence: React.FC = () => {
  const tier = getDeviceTier();

  // ── 3D coin mounting logic ──
  // On high-end devices: show coins after first interaction OR after 2s idle
  // (fixes the "coins don't appear on reload" bug).
  // On medium/low-end devices: skip coins entirely.
  const [showCoins, setShowCoins] = useState(false);
  useEffect(() => {
    if (tier !== 'high' || isMobileDevice()) return; // strictly disable coins on mobile and lower-end devices

    let done = false;
    // Interaction events → show coins immediately
    const events = ['pointerdown', 'touchstart', 'scroll', 'keydown'] as const;
    const trigger = () => {
      if (done) return;
      done = true;
      setShowCoins(true);
      events.forEach((e) => window.removeEventListener(e, trigger));
    };
    events.forEach((e) => window.addEventListener(e, trigger, { passive: true }));

    // Fallback for idle viewers (fixes the "coins don't appear on reload" bug):
    // Just trigger it 1.5 seconds after component mounts. This gives enough time for 
    // the initial HTML/CSS paint to finish without lag, but guarantees they appear.
    const idleTimer = window.setTimeout(trigger, 1500);

    return () => {
      clearTimeout(idleTimer);
      events.forEach((e) => window.removeEventListener(e, trigger));
    };
  }, [tier]);

  // Main container ref for the pinned scroll section
  const containerRef = useRef<HTMLDivElement>(null);
  // Element refs for GSAP targeting
  const bgOverlayRef = useRef<HTMLDivElement>(null);
  const meshGridRef = useRef<HTMLDivElement>(null);
  const phoneRef = useRef<HTMLDivElement>(null);
  const coinsContainerRef = useRef<HTMLDivElement>(null);
  // Coins are NOT scaled by GSAP, only translated
  const glowRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const introTitleRef = useRef<HTMLDivElement>(null);
  const titleBRef = useRef<HTMLDivElement>(null);
  // New mockup image refs
  const image2Ref = useRef<HTMLDivElement>(null);
  const image3Ref = useRef<HTMLDivElement>(null);

  // Track refs to avoid re-runs without cleanup
  const stRef = useRef<ScrollTrigger | null>(null);

  useLayoutEffect(() => {
    const container = containerRef.current;
    const bg = bgOverlayRef.current;
    const mesh = meshGridRef.current;
    const phone = phoneRef.current;
    const coins = coinsContainerRef.current;
    const glow = glowRef.current;
    const cards = cardsRef.current;
    const title = titleRef.current;
    const introTitle = introTitleRef.current;
    const titleB = titleBRef.current;
    const img2 = image2Ref.current;
    const img3 = image3Ref.current;

    const screenLogo = phone?.querySelector('.screen-logo');

    if (!container || !bg || !mesh || !phone || !coins || !glow || !cards || !title || !introTitle || !titleB) return;
    const ctx = gsap.context(() => {
      // ── Initial states before GSAP takes over ──
      gsap.set(bg, { opacity: 1 });
      gsap.set(mesh, { opacity: 0 });
      gsap.set(phone, { y: '95vh', opacity: 1, scale: 1, transformOrigin: 'center center' });
      gsap.set(coins, { opacity: 1, y: 0 });
      // coins scale is not touched by GSAP
      gsap.set(title, { opacity: 1, y: 0 });
      gsap.set(introTitle, { opacity: 0, y: 0 });
      gsap.set(titleB, { opacity: 0, y: 0 });
      // New mockup images: start hidden, pre-positioned to match the phone's
      // settled transform (y: 8vh, scale: 0.78).
      if (img2) gsap.set(img2, { opacity: 0, y: '8vh', scale: 0.78, x: 0, transformOrigin: 'center center' });
      // img3 fades in later when the phone is already shifted, so we initialize it with the shifted position
      if (img3) gsap.set(img3, { opacity: 0, y: '8vh', scale: 0.78, x: () => (window.innerWidth > 768 ? '25vw' : '10vw'), transformOrigin: 'center center' });

      // Derive the horizontal phone shift from the LIVE viewport width. Wrapped
      // in a function + invalidateOnRefresh so a rotation/resize recomputes it
      // instead of keeping the value captured at first mount.
      const getPhoneShift = () => (window.innerWidth > 768 ? '25vw' : '10vw');

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: container,
          start: 'top top',
          // Desktop: the original long cinematic distance. Phones: a shorter
          // timeline (same choreography, fewer scrub/paint frames, less scroll).
          end: `+=${SEQUENCE_SCROLL_END}`,
          // Phones use a much lower scrub so the pins stop trailing almost
          // immediately after the finger lifts (snappier, less idle rAF work);
          // desktop keeps its silky 1.5s catch-up.
          scrub: TOUCH ? 0.6 : 1.5,
          pin: true,
          anticipatePin: 1,
          // Snap smoothing to the end target on a fast phone flick so it doesn't
          // over-run the pinned section. No-op on desktop's mouse-wheel scroll.
          fastScrollEnd: TOUCH,
          // Re-derive every function-based value below on refresh (rotation,
          // width change) so the choreography re-frames for the new resolution.
          invalidateOnRefresh: true,
        },
      });
      stRef.current = tl.scrollTrigger as ScrollTrigger;

      // STAGE 1: Phone rises and shrinks, Text levitates instantly, Coins levitate slightly later
      tl.to(mesh, { opacity: 0.6, duration: 0.4, ease: 'power1.inOut' }, 0);
      tl.to(phone, { y: '8vh', scale: 0.78, opacity: 1, duration: 0.4, ease: 'power2.out' }, 0);
      tl.to(title, { y: '-100vh', opacity: 0, duration: 0.4, ease: 'power2.out' }, 0);
      tl.fromTo(coins, { y: '0vh', opacity: 1 }, { y: '-100vh', opacity: 0, duration: 0.4, ease: 'power2.out' }, 0.3);

      // STAGE 2 (0.8s): Intro Reveal (Phone stays in center)
      tl.fromTo(introTitle, { y: '20vh', opacity: 0 }, { y: 0, opacity: 1, duration: 0.4, ease: 'power2.out' }, 0.8);
      if (screenLogo) {
        tl.fromTo(screenLogo, { opacity: 0 }, { opacity: 1, duration: 0.4, ease: 'power2.out' }, 0.8);
      }

      // STAGE 3 (1.4s): The Blank Pause (Intro fades out, image2 fades in over the center phone)
      tl.to(introTitle, { opacity: 0, duration: 0.4, ease: 'power2.inOut' }, 1.4);
      if (screenLogo) {
        tl.to(screenLogo, { opacity: 0, duration: 0.4, ease: 'power2.inOut' }, 1.4);
      }
      if (img2) {
        tl.to(img2, { opacity: 1, duration: 0.4, ease: 'power2.inOut' }, 1.4);
      }

      // STAGE 4 (2.0s): Phone (and image2) shifts right, "One Wallet" comes in.
      // Functional value → re-evaluated on invalidateOnRefresh for the live width.
      tl.to(phone, { x: getPhoneShift, duration: 1.2, ease: 'power3.inOut' }, 2.0);
      if (img2) {
        tl.to(img2, { x: getPhoneShift, duration: 1.2, ease: 'power3.inOut' }, 2.0);
      }
      tl.fromTo(titleB, { y: '30vh', opacity: 0 }, { y: '4vh', opacity: 1, duration: 0.8, ease: 'power3.out' }, 2.2);

      // STAGE 5 (3.6s): "One Wallet" fades out upwards, image2 fades out, and image3 fades in (crossfade)
      tl.to(titleB, { y: '-30vh', opacity: 0, duration: 0.4, ease: 'power2.inOut' }, 3.6);
      if (img2) {
        tl.to(img2, { opacity: 0, duration: 0.4, ease: 'power2.inOut' }, 3.6);
      }
      if (img3) {
        tl.to(img3, { opacity: 1, duration: 0.4, ease: 'power2.inOut' }, 3.6);
      }

      // STAGE 6 (4.0s): Bento Grid slides in staggered, image3 fades in
      tl.to(glow, { opacity: 1, duration: 0.15, ease: 'power2.out' }, 4.0);
      const bentoCards = cards.querySelectorAll('.bento-card');
      tl.fromTo(
        bentoCards,
        { opacity: 0, y: 50 },
        { 
          opacity: 1, 
          y: 0, 
          duration: 0.8, 
          stagger: 0.15, 
          ease: 'power3.out' 
        },
        4.0,
      );
    }, container);

    return () => ctx.revert();
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative h-screen w-full overflow-hidden bg-black"
    >
      {/* Stage 0: Pure OLED Black Background Layer */}
      <div
        ref={bgOverlayRef}
        className="absolute inset-0 z-0 bg-black opacity-100"
      />

      {/* Amber to Black Gradient Overlay (decreased opacity, fades out by mid-screen) */}
      <div className="absolute top-0 inset-x-0 h-[50vh] z-0 bg-gradient-to-b from-[#D4A042]/8 to-transparent pointer-events-none" />

      {/* Grid Layer (fades out as phone scales up) */}
      <div ref={meshGridRef} className="absolute inset-0 z-0 opacity-0">
        <MeshGrid />
      </div>

      {/* Volumetric Light Arc (Replaces the circular glow) */}
      <div ref={glowRef} className="absolute inset-0 z-0">
        <LightArc />
      </div>

      {/* 3D Coins Layer — translated by GSAP but NOT scaled */}
      <div ref={coinsContainerRef} className="absolute inset-0 z-40 pointer-events-none preserve-color">
        <div className="relative h-full w-full">
          {showCoins && (
            <Suspense fallback={null}>
              <CoinsScene />
            </Suspense>
          )}
        </div>
      </div>

      {/* image2.png — appears at Stage 4 when phone shifts right.
          Same container structure as the phone mockup so size & position match exactly.
          GSAP sets initial y/scale to match the phone's settled position, then fades in.
          Opacity-only animation: no vertical translation to avoid stacking mockups. */}
      <div
        ref={image2Ref}
        className="absolute inset-0 z-[21] flex items-center justify-center pointer-events-none opacity-0 preserve-color"
      >
        <div className="relative z-20 flex justify-center">
          <div className="relative w-[1200px] md:w-[min(1800px,92vw)] flex justify-center items-center">
            <img
              src="/image2.webp"
              alt="VeilPay wallet screen (Dark)"
              width={1527}
              height={1024}
              className="w-full h-auto object-contain relative z-10 dark-image"
              loading="lazy"
            />
            <img
              src="/image2.white.png"
              alt="VeilPay wallet screen (Light)"
              width={1527}
              height={1024}
              className="w-full h-auto object-contain relative z-10 white-image"
              loading="lazy"
            />
          </div>
        </div>
      </div>

      {/* image3.png — appears at Stage 6 alongside the bento grid.
          Same container structure as the phone mockup so size & position match exactly.
          Opacity-only animation: no vertical translation. */}
      <div
        ref={image3Ref}
        className="absolute inset-0 z-[22] flex items-center justify-center pointer-events-none opacity-0 preserve-color"
      >
        <div className="relative z-20 flex justify-center">
          <div className="relative w-[1200px] md:w-[min(1800px,92vw)] flex justify-center items-center">
            <img
              src="/image3.webp"
              alt="VeilPay payment screen (Dark)"
              width={1527}
              height={1024}
              className="w-full h-auto object-contain relative z-10 dark-image"
              loading="lazy"
            />
            <img
              src="/image3.white.png"
              alt="VeilPay payment screen (Light)"
              width={1527}
              height={1024}
              className="w-full h-auto object-contain relative z-10 white-image"
              loading="lazy"
            />
          </div>
        </div>
      </div>

      {/* Bento Grid Layer (left-aligned) */}
      <div className="absolute inset-0 z-30 pointer-events-none flex items-center justify-start md:pl-24">
        <div ref={cardsRef} className="flex gap-4 items-center w-full h-full">
          <BentoGrid />
        </div>
      </div>

      {/* iPhone Mockup Layer — vertically CENTERED (items-center + inset-y-0) so
          it holds its position in line with the bento cards (which are also
          items-center) at every width, instead of being bottom-anchored and
          "settling" lower as the viewport shrinks. GSAP still drives the intro
          rise via its y offsets (y:95vh → y:18vh), now measured from center. */}
      <div ref={phoneRef} className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none preserve-color">
        <IPhoneMockup />
      </div>

      {/* Hero Title Layer A (center) */}
      <div ref={titleRef} className="absolute inset-0 z-30 pointer-events-none flex items-center justify-center">
        <HeroTitle />
      </div>

      {/* Intro Title Layer — on mobile z-[25] puts it ABOVE the phone (z-20),
           on desktop md:z-10 keeps it behind the phone as designed */}
      <div ref={introTitleRef} className="absolute inset-0 z-[25] md:z-10 pointer-events-none flex items-stretch justify-center w-full">
        <IntroTitle />
      </div>

      {/* Feature Title Layer B (left side on desktop, top-center on mobile, appears after IntroTitle) */}
      <div ref={titleBRef} className="absolute inset-0 z-50 pointer-events-none flex flex-col justify-start pt-[12vh] md:pt-0 md:justify-center items-center md:items-start px-8 md:px-16 lg:px-24">
        {/* On desktop the phone occupies the right half, so cap this block to
            ~half the viewport and let the heading scale fluidly — this stops the
            fixed 6-9rem text from sliding under the phone at mid widths. */}
        <div className="max-w-3xl md:max-w-[48vw] flex flex-col items-center md:items-start text-center md:text-left">
          <h2 className="font-extrabold tracking-tighter leading-[1.0] mb-6 preserve-color text-[clamp(2.5rem,7vw,9rem)]">
            <span className="text-transparent bg-clip-text bg-gradient-to-b from-[#FDF3DC] to-[#E8B84B]">PRIVATE PAYMENTS</span> <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#E8B84B] via-[#D4A042] to-[#B8791F]">FULLY YOURS.</span>
          </h2>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm mb-4 w-fit">
            <span className="text-[10px] font-semibold text-gray-400 tracking-wider uppercase">Stealth payments across 8+ chains</span>
            <div className="flex -space-x-2">
              {['xlm', 'eth', 'sol', 'xmr', 'zec'].map((coin) => (
                <div key={coin} className="w-5 h-5 rounded-full bg-black border border-white/20 p-0.5 z-10">
                  <img src={`/cryptos/${coin}.svg`} alt={coin} className="w-full h-full" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>


    </div>
  );
};

export default React.memo(ScrollSequence);
