import React, { useRef, useLayoutEffect, useState } from 'react';
import { Download, Loader2 } from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const DownloadSection: React.FC = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      // Pin the Download section when it hits the top of the screen
      gsap.to(sectionRef.current, {
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top top',
          end: '+=150%', // The scroll distance the pin holds for (stops for a moment)
          pin: true,
          scrub: true,
          anticipatePin: 1,
        }
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    
    setStatus('loading');
    
    try {
      // Replace this URL with your actual Discord Webhook URL
      const DISCORD_WEBHOOK_URL = 'https://discord.com/api/webhooks/your_webhook_url_here';
      
      const response = await fetch(DISCORD_WEBHOOK_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: null,
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
        setStatus('error');
      }
    } catch (error) {
      console.error(error);
      setStatus('error');
    }
  };

  return (
    <section id="download" ref={sectionRef} className="relative w-full min-h-screen bg-black flex flex-col items-center py-10 overflow-hidden border-t border-white/5">
      {/* Background ambient light */}
      <div 
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full z-0 pointer-events-none opacity-30"
        style={{
          background: 'radial-gradient(circle at center, rgba(251, 191, 36, 0.2) 0%, transparent 70%)',
          filter: 'blur(100px)',
          willChange: 'transform'
        }}
      />

      {/* Spacer to perfectly center the title */}
      <div className="flex-1" />

      <div className="z-10 text-center px-4 w-full flex-shrink-0">
        <h2 className="text-5xl md:text-[5rem] lg:text-[7rem] font-extrabold tracking-tighter mb-4 leading-[0.9]">
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
        <p className="mt-6 text-lg text-gray-400 max-w-xl mx-auto font-light">
          Join the waitlist or download the beta today to experience the fastest, most secure crypto vault on the planet.
        </p>
        
        <div className="flex items-center justify-center mt-10">
          <button className="preserve-color relative flex items-center justify-center px-10 py-4 rounded-full bg-[#111111] border border-[#F2C572]/40 text-[#F2C572] font-bold hover:bg-gradient-to-r hover:from-[#F2C572] hover:to-[#D4A042] hover:border-transparent transition-all duration-300 shadow-[0_0_30px_rgba(242,197,114,0.1)] hover:shadow-[0_0_50px_rgba(242,197,114,0.4)] transform hover:scale-105 group overflow-hidden min-w-[240px]">
            
            {/* Default State */}
            <div className="flex items-center gap-3 transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:-translate-y-16">
              <Download className="w-6 h-6" />
              <div className="flex flex-col items-start">
                <span className="text-[10px] uppercase font-bold leading-none opacity-80">Direct Download</span>
                <span className="text-lg leading-none mt-1 tracking-tight">Download APK</span>
              </div>
            </div>

            {/* Hover State */}
            <div className="absolute inset-0 flex items-center justify-center translate-y-16 group-hover:translate-y-0 transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] text-black">
              <span className="text-xl tracking-tight font-extrabold uppercase">Coming Soon</span>
            </div>

          </button>
        </div>
      </div>

      <div className="flex-1" />

      {/* Waitlist Section */}
      <div className="z-10 w-full max-w-3xl mx-auto backdrop-blur-2xl bg-white/[0.03] border border-white/[0.08] rounded-[2.5rem] p-10 md:p-12 shadow-[0_0_50px_rgba(0,0,0,0.5)] flex flex-col items-center text-center relative overflow-hidden flex-shrink-0 scale-90 sm:scale-100">
          {/* Inner ambient glow for glass effect */}
          <div className="absolute inset-0 bg-gradient-to-b from-white/[0.02] to-transparent pointer-events-none" />
          
          <h3 className="text-2xl md:text-3xl font-bold text-white mb-8 relative z-10">
            Coming soon! <span className="text-amber-500 font-medium">Join our waitlist.</span>
          </h3>

          <form onSubmit={handleSubmit} className="w-full max-w-lg flex flex-col sm:flex-row gap-4 relative z-10 mx-auto">
            <div className="relative flex-1">
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter email" 
                required
                disabled={status === 'loading' || status === 'success'}
                className="w-full h-14 bg-black/40 border border-white/10 rounded-full px-6 text-white placeholder-gray-500 focus:outline-none focus:border-amber-500/50 focus:bg-black/60 transition-all text-sm"
              />
            </div>
            <button 
              type="submit"
              disabled={status === 'loading' || status === 'success'}
              className="h-14 px-8 rounded-full bg-white text-black font-semibold hover:bg-gray-200 transition-colors flex items-center justify-center min-w-[140px] disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {status === 'idle' && 'Join Waitlist'}
              {status === 'loading' && <Loader2 className="w-5 h-5 animate-spin" />}
              {status === 'success' && 'Joined!'}
              {status === 'error' && 'Error'}
            </button>
          </form>

          {status === 'success' && (
            <p className="text-green-400 text-sm mt-4 animate-fade-in relative z-10">
              Thanks! We'll be in touch soon.
            </p>
          )}
          {status === 'error' && (
            <p className="text-red-400 text-sm mt-4 animate-fade-in relative z-10">
              Something went wrong. Please try again.
            </p>
          )}

          {/* Social Icons */}
          <div className="flex items-center justify-center gap-6 mt-8 mb-2 relative z-10">
            <a href="https://x.com/Veilpayapp" target="_blank" rel="noopener noreferrer" className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl backdrop-blur-md bg-white/[0.03] border border-white/10 flex items-center justify-center text-gray-400 hover:text-[#F2C572] hover:bg-white/10 hover:border-[#F2C572]/50 transition-all transform hover:scale-110">
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                <path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z"/>
              </svg>
            </a>
            <a href="https://discord.gg/aeNy2nMAp" target="_blank" rel="noopener noreferrer" className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl backdrop-blur-md bg-white/[0.03] border border-white/10 flex items-center justify-center text-gray-400 hover:text-[#F2C572] hover:bg-white/10 hover:border-[#F2C572]/50 transition-all transform hover:scale-110">
              <svg className="w-6 h-6 fill-current" viewBox="0 0 16 16">
                <path d="M13.545 2.907a13.2 13.2 0 0 0-3.257-1.011.05.05 0 0 0-.052.025c-.141.25-.297.577-.406.833a12.2 12.2 0 0 0-3.658 0 8 8 0 0 0-.412-.833.05.05 0 0 0-.052-.025c-1.125.194-2.22.534-3.257 1.011a.04.04 0 0 0-.021.018C.356 6.024-.213 9.047.066 12.032c.001.014.01.028.021.037a13.3 13.3 0 0 0 3.995 2.02.05.05 0 0 0 .056-.019c.308-.42.582-.863.818-1.329a.05.05 0 0 0-.01-.059.05.05 0 0 0-.018-.011 8.8 8.8 0 0 1-1.248-.595.05.05 0 0 1-.02-.066.05.05 0 0 1 .015-.019c.084-.063.168-.129.248-.195a.05.05 0 0 1 .051-.007c2.619 1.196 5.454 1.196 8.041 0a.05.05 0 0 1 .053.007c.08.066.164.132.248.195a.05.05 0 0 1-.004.085 8 8 0 0 1-1.249.594.05.05 0 0 0-.03.03.05.05 0 0 0 .003.041c.24.465.515.909.817 1.329a.05.05 0 0 0 .056.019 13.2 13.2 0 0 0 4.001-2.02.05.05 0 0 0 .021-.037c.334-3.451-.559-6.449-2.366-9.106a.03.03 0 0 0-.02-.019zM5.866 10.11c-.563 0-1.026-.51-1.026-1.134 0-.625.456-1.135 1.026-1.135.576 0 1.035.511 1.026 1.135 0 .624-.45 1.134-1.026 1.134zm4.268 0c-.563 0-1.026-.51-1.026-1.134 0-.625.456-1.135 1.026-1.135.576 0 1.035.511 1.026 1.135 0 .624-.45 1.134-1.026 1.134z"/>
              </svg>
            </a>
            <a href="https://www.linkedin.com/company/veilpay/" target="_blank" rel="noopener noreferrer" className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl backdrop-blur-md bg-white/[0.03] border border-white/10 flex items-center justify-center text-gray-400 hover:text-[#F2C572] hover:bg-white/10 hover:border-[#F2C572]/50 transition-all transform hover:scale-110">
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
              </svg>
            </a>
          </div>
        </div>
    </section>
  );
};

export default DownloadSection;
