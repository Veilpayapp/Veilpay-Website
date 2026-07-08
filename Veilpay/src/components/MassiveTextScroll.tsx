import React, { useRef, useLayoutEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { TOUCH } from '@/lib/scrollConfig';

gsap.registerPlugin(ScrollTrigger);

const MassiveTextScroll: React.FC = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const text1Ref = useRef<HTMLHeadingElement>(null);
  const text2Ref = useRef<HTMLHeadingElement>(null);
  const text3Ref = useRef<HTMLHeadingElement>(null);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top top',
          end: '+=250%', // Reduced from 600% to eliminate the huge gap
          pin: true,
          pinSpacing: true,
          // Phones: light scrub so the giant text stops chasing quickly after a
          // flick. Desktop keeps the slower, smoother 2s catch-up.
          scrub: TOUCH ? 0.6 : 2,
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

      // Sequence for "SECURE"
      tl.to(text1Ref.current, { scale: 1, opacity: 1, y: 0, duration: 1.5, ease: 'power2.out' })
        .to(text1Ref.current, { scale: 1.2, duration: 1.5, ease: 'none' }) // Longer hold while scaling slowly
        .to(text1Ref.current, { scale: 0.2, opacity: 0, y: '-50vh', duration: 1.5, ease: 'power2.in' });

      // Sequence for "&"
      tl.to(text2Ref.current, { scale: 1, opacity: 1, y: 0, duration: 1.5, ease: 'power2.out' }, "-=0.3")
        .to(text2Ref.current, { scale: 1.2, duration: 1.5, ease: 'none' }) // Longer hold
        .to(text2Ref.current, { scale: 0.2, opacity: 0, y: '-50vh', duration: 1.5, ease: 'power2.in' });

      // Sequence for "PRIVATE"
      tl.to(text3Ref.current, { scale: 1, opacity: 1, y: 0, duration: 1.5, ease: 'power2.out' }, "-=0.3")
        .to(text3Ref.current, { scale: 1.2, duration: 1.5, ease: 'none' }) // Longer hold
        .to(text3Ref.current, { scale: 0.2, opacity: 0, y: '-50vh', duration: 1.5, ease: 'power2.in' });

    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="relative w-full h-screen bg-black overflow-hidden flex items-center justify-center z-10 border-t border-white/5">
      {/* Container for texts to ensure absolute centering */}
      <div className="relative w-full h-full flex items-center justify-center">
        <h1 
          ref={text1Ref} 
          className="absolute text-center font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-[#F2C572] via-[#F9D423] to-[#5E3B09] uppercase preserve-color"
          style={{ fontSize: 'clamp(3rem, 18vw, 20rem)', lineHeight: 1 }}
        >
          SECURE
        </h1>

        <h1 
          ref={text2Ref} 
          className="absolute text-center font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white to-gray-600 uppercase"
          style={{ fontSize: 'clamp(4rem, 25vw, 28rem)', lineHeight: 1 }}
        >
          &
        </h1>

        <h1 
          ref={text3Ref} 
          className="absolute text-center font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-[#F2C572] via-[#F9D423] to-[#5E3B09] uppercase preserve-color"
          style={{ fontSize: 'clamp(2.75rem, 16vw, 18rem)', lineHeight: 1 }}
        >
          PRIVATE
        </h1>
      </div>
    </section>
  );
};

export default MassiveTextScroll;
