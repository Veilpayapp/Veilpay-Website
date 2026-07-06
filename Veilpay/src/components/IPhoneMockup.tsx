import React from 'react';

const IPhoneMockup: React.FC = () => {
  return (
    <div className="relative z-20 flex justify-center">
      <div className="relative w-[1200px] md:w-[1800px] flex justify-center items-center">
        {/* Subtle Aura Effect behind the phone */}
        <div 
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-0 pointer-events-none"
        >
          <div
            className="w-[600px] h-[600px] md:w-[900px] md:h-[900px] rounded-full"
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
          alt="iPhone Mockup"
          width={1527}
          height={1024}
          fetchPriority="high"
          className="w-full h-auto object-contain relative z-10"
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
