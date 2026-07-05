import React, { useRef, useLayoutEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

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
          scrub: 2, // Slower smoothing
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
          style={{ fontSize: '18vw', lineHeight: 1, filter: 'drop-shadow(0 0 60px rgba(242, 197, 114, 0.3))' }}
        >
          SECURE
        </h1>

        <h1 
          ref={text2Ref} 
          className="absolute text-center font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white to-gray-600 uppercase"
          style={{ fontSize: '25vw', lineHeight: 1 }}
        >
          &
        </h1>

        <h1 
          ref={text3Ref} 
          className="absolute text-center font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-[#F2C572] via-[#F9D423] to-[#5E3B09] uppercase preserve-color"
          style={{ fontSize: '16vw', lineHeight: 1, filter: 'drop-shadow(0 0 60px rgba(242, 197, 114, 0.3))' }}
        >
          PRIVATE
        </h1>
      </div>
    </section>
  );
};

export default MassiveTextScroll;
