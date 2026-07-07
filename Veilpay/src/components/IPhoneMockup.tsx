import React from 'react';

const IPhoneMockup: React.FC = () => {
  return (
    <div className="relative z-20 flex justify-center">
      {/* Desktop width is viewport-relative so the mockup scales continuously as
          the window resizes (Figma-style auto-layout) instead of staying a rigid
          1800px and colliding with the text layers on narrower windows. min()
          caps it at the original 1800px so large screens look unchanged. Mobile
          keeps its intentional oversized-and-clipped hero size. */}
      {/* Phone size bumped +5% (400→420 / 520→546) and nudged +2vw right.
          image2/image3 in ScrollSequence use the SAME wrapper so all three
          overlays stay pixel-aligned through the crossfades. */}
      <div className="relative w-[420px] md:w-[min(546px,52.5vw)] flex justify-center items-center translate-x-[2vw]">
        {/* Subtle Aura Effect behind the phone */}
        <div 
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-0 pointer-events-none"
        >
          <div
            className="w-[600px] h-[600px] md:w-[min(900px,70vw)] md:h-[min(900px,70vw)] rounded-full"
            style={{
              // Softness baked into the gradient stops instead of a runtime
              // filter: blur(100px), which was a very expensive paint on mobile.
              background:
                'radial-gradient(circle at center, rgba(242, 197, 114, 0.32) 0%, rgba(242, 197, 114, 0.14) 38%, rgba(242, 197, 114, 0.04) 58%, transparent 72%)',
            }}
          />
        </div>
        
        <img
          src="/MOCKUP2.webp"
          alt="iPhone Mockup (Dark)"
          width={1527}
          height={1024}
          fetchPriority="high"
          className="w-full h-auto object-contain relative z-10 dark-image"
        />
        <img
          src="/MOCKUP2.WHITE.webp"
          alt="iPhone Mockup (Light)"
          width={1527}
          height={1024}
          fetchPriority="high"
          className="w-full h-auto object-contain relative z-10 white-image"
        />
        {/* Screen Content - logo appears via GSAP */}
        <div className="screen-logo absolute inset-0 flex items-center justify-center z-20 pointer-events-none -mt-[10%] opacity-0">
          <div 
            style={{
              width: '180px',
              height: '180px',
              backgroundImage: 'url(/logo.webp)',
              backgroundColor: 'transparent',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
              borderRadius: '50%',
              boxShadow: 'none'
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default React.memo(IPhoneMockup);
