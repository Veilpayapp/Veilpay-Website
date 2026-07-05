import React, { useRef, useLayoutEffect, useState, useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { NeatGradient } from "@firecms/neat";

gsap.registerPlugin(ScrollTrigger);

const DownloadSection: React.FC = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const boxRef = useRef<HTMLDivElement>(null);
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [hasFollowed, setHasFollowed] = useState(false);
  const [isFollowHovered, setIsFollowHovered] = useState(false);
  const gradientRef = useRef<HTMLCanvasElement>(null);
  const gradientInstance = useRef<any>(null);

  useEffect(() => {
    if (!gradientRef.current) return;

    const config = {
      colors: [
        { color: '#010101', enabled: true },
        { color: '#F4A515', enabled: true },
        { color: '#AA6306', enabled: true },
        { color: '#D48008', enabled: true },
        { color: '#513209', enabled: true },
        { color: '#FF9A9E', enabled: false },
      ],
      speed: 1,
      horizontalPressure: 7,
      verticalPressure: 3,
      waveFrequencyX: 0,
      waveFrequencyY: 0,
      waveAmplitude: 0,
      shadows: 4,
      highlights: 0,
      colorBrightness: 1.95,
      colorSaturation: -3,
      wireframe: false,
      colorBlending: 9,
      backgroundColor: '#000000',
      backgroundAlpha: 1,
      grainScale: 6,
      grainSparsity: 0,
      grainIntensity: 0,
      grainSpeed: 0,
      resolution: 2,
      yOffset: 0,
      yOffsetWaveMultiplier: 18.4,
      yOffsetColorMultiplier: 20,
      yOffsetFlowMultiplier: 20,
      flowDistortionA: 1.5,
      flowDistortionB: 10,
      flowScale: 3.3,
      flowEase: 0.37,
      flowEnabled: true,
      enableProceduralTexture: false,
      transparentTextureVoid: false,
      textureVoidLikelihood: 0.06,
      textureVoidWidthMin: 10,
      textureVoidWidthMax: 500,
      textureBandDensity: 0.8,
      textureColorBlending: 0.06,
      textureSeed: 333,
      textureEase: 0.38,
      proceduralBackgroundColor: '#003FFF',
      textureShapeTriangles: 20,
      textureShapeCircles: 15,
      textureShapeBars: 15,
      textureShapeSquiggles: 10,
      domainWarpEnabled: false,
      domainWarpIntensity: 0,
      domainWarpScale: 3,
      vignetteIntensity: 0.95,
      vignetteRadius: 0.8,
      fresnelEnabled: false,
      fresnelPower: 0.5,
      fresnelIntensity: 0.5,
      fresnelColor: '#FFFFFF',
      iridescenceEnabled: false,
      iridescenceIntensity: 0.5,
      iridescenceSpeed: 1,
      bloomIntensity: 0,
      bloomThreshold: 0.7,
      chromaticAberration: 2.5,
      shapeType: 'ribbon' as const,
      shapeRotationX: 0,
      shapeRotationY: 0,
      shapeRotationZ: 0,
      shapeAutoRotateSpeedX: 0,
      shapeAutoRotateSpeedY: 0,
      sphereRadius: 15,
      torusRadius: 15,
      torusTube: 5,
      cylinderRadius: 10,
      cylinderHeight: 40,
      planeBend: -0.3,
      planeTwist: 5,
      silhouetteFade: 0.57,
      cylinderFade: 0.08,
      ribbonFade: 0,
      flatShading: false,
      cameraLock: false,
      cameraX: 15,
      cameraY: 0.5,
      cameraZ: 0,
      cameraRotationX: 0.28700000000000003,
      cameraRotationY: -8.197,
      cameraRotationZ: 0,
      cameraZoom: 1.7500000000000002,
    };

    gradientInstance.current = new NeatGradient({
      ref: gradientRef.current,
      ...config
    });

    const handleScroll = () => {
      if (gradientInstance.current) {
        gradientInstance.current.yOffset = window.scrollY;
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (gradientInstance.current) {
        // Normalize mouse coordinates to -1 to 1
        const x = (e.clientX / window.innerWidth) * 2 - 1;
        const y = -(e.clientY / window.innerHeight) * 2 + 1;
        
        // Base config rotations
        const baseRotX = 0.287;
        const baseRotY = -8.197;

        // Apply slight rotation based on mouse hover
        gradientInstance.current.cameraRotationX = baseRotX + (y * 0.15);
        gradientInstance.current.cameraRotationY = baseRotY + (x * 0.15);
      }
    };

    window.addEventListener("scroll", handleScroll);
    window.addEventListener("mousemove", handleMouseMove);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("mousemove", handleMouseMove);
      if (gradientInstance.current && typeof gradientInstance.current.destroy === 'function') {
        gradientInstance.current.destroy();
      }
    };
  }, []);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      // Create a timeline for the pin and scale animation
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top top',
          end: '+=150%', // The scroll distance the pin holds for
          pin: true,
          scrub: true,
          anticipatePin: 1,
        }
      });

      // Box rises from the bottom and scales up from down to up
      tl.fromTo(boxRef.current,
        { scale: 0.6, y: '50vh', opacity: 0, transformOrigin: 'bottom center' },
        { scale: 1, y: 0, opacity: 1, ease: "power2.out", duration: 1 }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    
    setStatus('loading');
    
    try {
      // Replace this URL with your actual Discord Webhook URL
      // SECURE: Webhook URL must be stored in .env file, not hardcoded!
      const DISCORD_WEBHOOK_URL = import.meta.env.VITE_DISCORD_WEBHOOK_URL;
      
      if (!DISCORD_WEBHOOK_URL) {
        console.error("Missing Discord Webhook URL! Ensure VITE_DISCORD_WEBHOOK_URL is set in your .env file or Vercel Environment Variables.");
        setStatus('error');
        return;
      }

      const response = await fetch(DISCORD_WEBHOOK_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          embeds: [
            {
              title: "🚀 New Waitlist Signup!",
              description: `A new user has joined the VeilPay waitlist.\n\n**Email:** \`${email}\``,
              color: 15909234, // Amber color to match VeilPay
              timestamp: new Date().toISOString()
            }
          ]
        })
      });

      if (response.ok) {
        setStatus('success');
        setEmail('');
      } else {
        const errorText = await response.text();
        console.error("Discord Webhook Error Details:", response.status, errorText);
        setStatus('error');
      }
    } catch (error) {
      console.error("Fetch/Network Error (Check Adblockers or CORS):", error);
      setStatus('error');
    }
  };

  const glassStyle = {
    backdropFilter: 'saturate(180%) blur(16px)',
    WebkitBackdropFilter: 'saturate(180%) blur(16px)',
    boxShadow: `
      inset 0 1px 1px rgba(255, 255, 255, 0.4),
      inset 0 -1px 2px rgba(0, 0, 0, 0.6),
      inset -1px 0 2px rgba(255, 255, 255, 0.1),
      0 15px 30px rgba(0, 0, 0, 0.4)
    `
  };

  return (
    <section id="download" ref={sectionRef} className="relative w-full min-h-screen bg-black py-10 px-4 sm:px-6 lg:px-8 overflow-hidden border-t border-white/5 flex items-center justify-center">
      
      {/* Rounded Box Container */}
      <div ref={boxRef} className="relative w-full max-w-[1600px] h-[750px] bg-[#050505] border border-white/[0.08] rounded-[2.5rem] md:rounded-[4rem] flex flex-col items-center justify-center overflow-hidden py-10 shadow-[0_0_100px_rgba(0,0,0,0.5)]">
        
        {/* Neat Gradient Interactive Background */}
        <div className="absolute inset-0 z-0 opacity-60">
          <canvas ref={gradientRef} style={{ width: '100%', height: '100%' }}></canvas>
        </div>

      <div className="z-10 text-center px-4 w-full max-w-4xl flex flex-col items-center justify-center flex-shrink-0">
        <h2 className="text-5xl md:text-[5rem] lg:text-[7rem] font-extrabold tracking-tighter mb-4 leading-[0.9] text-center w-full">
          <span 
            className="text-transparent bg-clip-text bg-gradient-to-b from-white via-gray-300 to-gray-600 drop-shadow-[0_20px_30px_rgba(255,255,255,0.1)] drop-shadow-[0_5px_10px_rgba(0,0,0,1)] block mb-2"
          >
            Take back your
          </span>
          <span 
            className="text-transparent bg-clip-text bg-gradient-to-b from-[#F2C572] via-[#D4A042] to-[#1a1103] drop-shadow-[0_20px_30px_rgba(212,160,66,0.2)] drop-shadow-[0_5px_10px_rgba(0,0,0,1)] uppercase block"
          >
            Financial Privacy.
          </span>
        </h2>
        <p className="mt-6 text-lg text-gray-400 max-w-xl mx-auto font-light text-center">
          Join the waitlist today to experience the fastest, most secure crypto vault on the planet.
        </p>
        
        {/* Waitlist Form Replacement */}
        <div className="flex flex-col items-center justify-center mt-12 w-full max-w-lg mx-auto">
          {!hasFollowed ? (
            <div className="relative z-10 w-full flex flex-col items-center gap-4">
              <p className="text-white/70 text-sm font-medium">Follow us on X to unlock the waitlist</p>
              <a 
                href="https://x.com/Veilpayapp" 
                target="_blank" 
                rel="noopener noreferrer"
                onMouseEnter={() => setIsFollowHovered(true)}
                onMouseLeave={() => setIsFollowHovered(false)}
                onClick={() => {
                  setTimeout(() => setHasFollowed(true), 1500);
                }}
                className={`w-full flex items-center justify-center gap-3 h-14 px-8 text-white font-bold rounded-full transition-all transform hover:scale-[1.02] cursor-pointer ${isFollowHovered ? 'hover:text-[#F2C572] hover:border-[#F2C572]/50 glass-panel' : 'bg-black border border-white/20'}`}
                style={isFollowHovered ? glassStyle : {}}
              >
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                  <path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z"/>
                </svg>
                Follow @Veilpayapp
              </a>
            </div>
          ) : (
            <div className="relative z-10 w-full flex flex-col items-center gap-4 animate-fade-in">
              <p className="text-[#F2C572] text-sm font-medium">Enter your email to join</p>
              <form onSubmit={handleSubmit} className="w-full flex flex-col sm:flex-row gap-4 relative z-10 mx-auto justify-center items-center">
                <div className="relative flex-1 w-full sm:w-auto">
                  <input 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email" 
                    required
                    disabled={status === 'loading' || status === 'success'}
                    className="w-full h-14 bg-[#111111] border border-[#F2C572]/20 rounded-full px-6 text-white placeholder-gray-500 text-center sm:text-left focus:outline-none focus:border-[#F2C572]/60 focus:bg-black/60 transition-all text-sm"
                  />
                </div>
                <button 
                  type="submit"
                  disabled={status === 'loading' || status === 'success'}
                  className="h-14 px-8 rounded-full bg-gradient-to-r from-[#F2C572] to-[#D4A042] text-black font-bold hover:brightness-110 transition-all shadow-[0_0_30px_rgba(242,197,114,0.1)] hover:shadow-[0_0_50px_rgba(242,197,114,0.3)] flex items-center justify-center min-w-[140px] disabled:opacity-70 disabled:cursor-not-allowed transform hover:scale-105 w-full sm:w-auto"
                >
                  {status === 'idle' && 'Join Waitlist'}
                  {status === 'loading' && 'Joining...'}
                  {status === 'success' && 'Joined!'}
                  {status === 'error' && 'Error'}
                </button>
              </form>
            </div>
          )}

          {status === 'success' && (
            <p className="text-green-400 text-sm mt-4 animate-fade-in relative z-10 font-medium text-center">
              Thanks! We'll be in touch soon.
            </p>
          )}
          {status === 'error' && (
            <p className="text-red-400 text-sm mt-4 animate-fade-in relative z-10 font-medium text-center">
              Something went wrong. Please try again.
            </p>
          )}
        </div>

        {/* Social Icons directly below */}
        <div className="flex items-center justify-center gap-6 mt-16 relative z-10 mx-auto w-full">
          <a href="https://x.com/Veilpayapp" target="_blank" rel="noopener noreferrer" className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center text-gray-400 hover:text-[#F2C572] transition-all transform hover:scale-110 glass-panel" style={glassStyle}>
            <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
              <path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z"/>
            </svg>
          </a>
          <a href="https://discord.gg/aeNy2nMAp" target="_blank" rel="noopener noreferrer" className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center text-gray-400 hover:text-[#F2C572] transition-all transform hover:scale-110 glass-panel" style={glassStyle}>
            <svg className="w-6 h-6 fill-current" viewBox="0 0 16 16">
              <path d="M13.545 2.907a13.2 13.2 0 0 0-3.257-1.011.05.05 0 0 0-.052.025c-.141.25-.297.577-.406.833a12.2 12.2 0 0 0-3.658 0 8 8 0 0 0-.412-.833.05.05 0 0 0-.052-.025c-1.125.194-2.22.534-3.257 1.011a.04.04 0 0 0-.021.018C.356 6.024-.213 9.047.066 12.032c.001.014.01.028.021.037a13.3 13.3 0 0 0 3.995 2.02.05.05 0 0 0 .056-.019c.308-.42.582-.863.818-1.329a.05.05 0 0 0-.01-.059.05.05 0 0 0-.018-.011 8.8 8.8 0 0 1-1.248-.595.05.05 0 0 1-.02-.066.05.05 0 0 1 .015-.019c.084-.063.168-.129.248-.195a.05.05 0 0 1 .051-.007c2.619 1.196 5.454 1.196 8.041 0a.05.05 0 0 1 .053.007c.08.066.164.132.248.195a.05.05 0 0 1-.004.085 8 8 0 0 1-1.249.594.05.05 0 0 0-.03.03.05.05 0 0 0 .003.041c.24.465.515.909.817 1.329a.05.05 0 0 0 .056.019 13.2 13.2 0 0 0 4.001-2.02.05.05 0 0 0 .021-.037c.334-3.451-.559-6.449-2.366-9.106a.03.03 0 0 0-.02-.019zM5.866 10.11c-.563 0-1.026-.51-1.026-1.134 0-.625.456-1.135 1.026-1.135.576 0 1.035.511 1.026 1.135 0 .624-.45 1.134-1.026 1.134zm4.268 0c-.563 0-1.026-.51-1.026-1.134 0-.625.456-1.135 1.026-1.135.576 0 1.035.511 1.026 1.135 0 .624-.45 1.134-1.026 1.134z"/>
            </svg>
          </a>
          <a href="https://t.me/veilpayapp" target="_blank" rel="noopener noreferrer" className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center text-gray-400 hover:text-[#F2C572] transition-all transform hover:scale-110 glass-panel" style={glassStyle}>
            <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
              <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.14.18-.357.295-.6.295-.002 0-.003 0-.005 0l.213-3.054 5.56-5.022c.24-.213-.054-.334-.373-.121l-6.87 4.326-2.962-.924c-.64-.203-.658-.64.135-.954l11.566-4.458c.538-.196 1.006.128.832.941z"/>
            </svg>
          </a>
          <a href="https://www.instagram.com/N2loeWMwZjQ1NWJw" target="_blank" rel="noopener noreferrer" className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center text-gray-400 hover:text-[#F2C572] transition-all transform hover:scale-110 glass-panel" style={glassStyle}>
            <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
            </svg>
          </a>
          <a href="https://www.linkedin.com/company/veilpay/" target="_blank" rel="noopener noreferrer" className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center text-gray-400 hover:text-[#F2C572] transition-all transform hover:scale-110 glass-panel" style={glassStyle}>
            <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
              <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
            </svg>
          </a>
        </div>
        </div>
      </div>
    </section>
  );
};

export default DownloadSection;
