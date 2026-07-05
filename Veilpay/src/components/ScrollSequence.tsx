import React, { useRef, useLayoutEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import MeshGrid from './MeshGrid';
import IPhoneMockup from './IPhoneMockup';
import CoinsScene from './CoinsScene';
import LightArc from './LightArc';
import BentoGrid from './BentoGrid';
import HeroTitle from './HeroTitle';
import IntroTitle from './IntroTitle';

gsap.registerPlugin(ScrollTrigger);

const ScrollSequence: React.FC = () => {
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

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: container,
          start: 'top top',
          end: '+=12000', // Dramatically increased to make the story pass slowly
          scrub: 1.5,
          pin: true,
          anticipatePin: 1,
        },
      });
      stRef.current = tl.scrollTrigger as ScrollTrigger;

      // STAGE 1: Phone rises and shrinks, Text levitates instantly, Coins levitate slightly later
      tl.to(mesh, { opacity: 0.6, duration: 0.4, ease: 'power1.inOut' }, 0);
      tl.to(phone, { y: '18vh', scale: 0.78, opacity: 1, duration: 0.4, ease: 'power2.out' }, 0);
      tl.to(title, { y: '-100vh', opacity: 0, duration: 0.4, ease: 'power2.out' }, 0);
      tl.fromTo(coins, { y: '0vh', opacity: 1 }, { y: '-100vh', opacity: 0, duration: 0.4, ease: 'power2.out' }, 0.3);

      // STAGE 2 (0.8s): Intro Reveal (Phone stays in center)
      tl.fromTo(introTitle, { y: '20vh', opacity: 0 }, { y: 0, opacity: 1, duration: 0.4, ease: 'power2.out' }, 0.8);
      if (screenLogo) {
        tl.fromTo(screenLogo, { opacity: 0 }, { opacity: 1, duration: 0.4, ease: 'power2.out' }, 0.8);
      }

      // STAGE 3 (1.4s): The Blank Pause (Intro fades out)
      tl.to(introTitle, { opacity: 0, duration: 0.4, ease: 'power2.inOut' }, 1.4);
      if (screenLogo) {
        tl.to(screenLogo, { opacity: 0, duration: 0.4, ease: 'power2.inOut' }, 1.4);
      }

      // STAGE 4 (2.0s): Phone shifts right, "One Wallet" comes in
      const phoneShift = window.innerWidth > 768 ? '25vw' : '10vw';
      tl.to(phone, { x: phoneShift, duration: 1.2, ease: 'power3.inOut' }, 2.0);
      tl.fromTo(titleB, { y: '30vh', opacity: 0 }, { y: '4vh', opacity: 1, duration: 0.8, ease: 'power3.out' }, 2.2);

      // STAGE 5 (3.6s): "One Wallet" fades out upwards
      tl.to(titleB, { y: '-30vh', opacity: 0, duration: 0.4, ease: 'power2.inOut' }, 3.6);

      // STAGE 6 (4.0s): Bento Grid slides in staggered
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
          <CoinsScene />
        </div>
      </div>

      {/* Bento Grid Layer (left-aligned) */}
      <div className="absolute inset-0 z-30 pointer-events-none flex items-center justify-start md:pl-24">
        <div ref={cardsRef} className="flex gap-4 items-center w-full h-full">
          <BentoGrid />
        </div>
      </div>

      {/* iPhone Mockup Layer (anchored to bottom fold, then moves right) */}
      <div ref={phoneRef} className="absolute left-[1%] w-full bottom-0 z-20 flex items-end justify-center pointer-events-none translate-y-[20%] preserve-color">
        <IPhoneMockup />
      </div>

      {/* Hero Title Layer A (center) */}
      <div ref={titleRef} className="absolute inset-0 z-30 pointer-events-none flex items-center justify-center">
        <HeroTitle />
      </div>

      {/* Intro Title Layer (left & right side, sits behind phone) */}
      <div ref={introTitleRef} className="absolute inset-0 z-10 pointer-events-none flex items-center justify-center w-full">
        <IntroTitle />
      </div>

      {/* Feature Title Layer B (left side, appears after IntroTitle) */}
      <div ref={titleBRef} className="absolute inset-0 z-30 pointer-events-none flex flex-col justify-center px-8 md:px-16 lg:px-24">
        <div className="max-w-3xl">
          <h2 className="text-6xl md:text-8xl lg:text-[9rem] font-extrabold tracking-tighter leading-[1.0] mb-6 preserve-color">
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
