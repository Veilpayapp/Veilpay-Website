import React, { useRef, useLayoutEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { TOUCH } from '@/lib/scrollConfig';

gsap.registerPlugin(ScrollTrigger);

const MassiveTextScroll: React.FC = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const text1Ref = useRef<HTMLDivElement>(null);
  const text2Ref = useRef<HTMLDivElement>(null);
  const text3Ref = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top top',
          end: TOUCH ? '+=380%' : '+=480%', // Balanced pacing: gives each word comfortable scroll breathing room
          pin: true,
          pinSpacing: true,
          // Responsive scrub: tight 1s catch-up on desktop (replaces the rushed 2s lag), 0.4s on touch
          scrub: TOUCH ? 0.4 : 1,
          fastScrollEnd: TOUCH,
          invalidateOnRefresh: true, // re-derive vh offsets on rotation/resize
          // ── Stacked-pin ordering (critical) ──
          // Lower than ScrollSequence (refreshPriority 2) so the tall pin above
          // is always measured first. This guarantees this section starts only
          // AFTER ScrollSequence has fully played "PRIVATE PAYMENTS FULLY YOURS"
          // and released its pin, instead of racing in early and overlapping.
          refreshPriority: 1,
        },
      });

      // Initial state: scaled down, opacity 0, offset Y
      gsap.set([text1Ref.current, text2Ref.current, text3Ref.current], {
        scale: 0.2,
        opacity: 0,
        y: '50vh', // Start slightly below center
      });

      // Sequence for "SECURE" — extended hold at center so it doesn't rush past
      tl.to(text1Ref.current, { scale: 1, opacity: 1, y: 0, duration: 1.2, ease: 'power2.out' })
        .to(text1Ref.current, { scale: 1.15, duration: 1.8, ease: 'none' })
        .to(text1Ref.current, { scale: 0.2, opacity: 0, y: '-50vh', duration: 1.2, ease: 'power2.in' });

      // Sequence for "&"
      tl.to(text2Ref.current, { scale: 1, opacity: 1, y: 0, duration: 1.2, ease: 'power2.out' }, "-=0.2")
        .to(text2Ref.current, { scale: 1.15, duration: 1.8, ease: 'none' })
        .to(text2Ref.current, { scale: 0.2, opacity: 0, y: '-50vh', duration: 1.2, ease: 'power2.in' });

      // Sequence for "PRIVATE"
      tl.to(text3Ref.current, { scale: 1, opacity: 1, y: 0, duration: 1.2, ease: 'power2.out' }, "-=0.2")
        .to(text3Ref.current, { scale: 1.15, duration: 1.8, ease: 'none' })
        .to(text3Ref.current, { scale: 0.2, opacity: 0, y: '-50vh', duration: 1.2, ease: 'power2.in' });

    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="relative w-full h-screen bg-black overflow-hidden flex items-center justify-center z-10 border-t border-white/5">
      {/* Container for texts to ensure absolute centering */}
      <div className="relative w-full h-full flex items-center justify-center" aria-hidden="true">
        <h1 className="sr-only">Private Crypto Payments &amp; Anonymous Donations</h1>
        <div 
          ref={text1Ref} 
          className="absolute text-center font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-[#F2C572] via-[#F9D423] to-[#5E3B09] uppercase preserve-color"
          style={{ fontSize: 'clamp(3rem, 18vw, 20rem)', lineHeight: 1 }}
        >
          SECURE
        </div>

        <div 
          ref={text2Ref} 
          className="absolute text-center font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white to-gray-600 uppercase"
          style={{ fontSize: 'clamp(4rem, 25vw, 28rem)', lineHeight: 1 }}
        >
          &amp;
        </div>

        <div 
          ref={text3Ref} 
          className="absolute text-center font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-[#F2C572] via-[#F9D423] to-[#5E3B09] uppercase preserve-color"
          style={{ fontSize: 'clamp(2.75rem, 16vw, 18rem)', lineHeight: 1 }}
        >
          PRIVATE
        </div>
      </div>
    </section>
  );
};

export default MassiveTextScroll;
