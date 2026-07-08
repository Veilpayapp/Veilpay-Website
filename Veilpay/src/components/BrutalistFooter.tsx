import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

import { SparklesCore } from './ui/SparklesCore';
import { isHighEnd } from '@/lib/deviceCapability';
import { useMediaQuery } from '@/lib/useViewport';

const FOOTER_DATA = [
  {
    title: 'Platform',
    links: [
      { label: 'Privacy', href: '#features', eventName: 'openPrivacyPopup' },
      { label: 'Stealth Addresses', href: '#features', eventName: 'openTokensPopup' },
      { label: 'Waitlist', href: '#download' },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'About Us', href: '/about' },
      { label: 'Privacy Policy', href: '/privacy' },
      { label: 'Terms of Service', href: '/terms' },
    ],
  },
  {
    title: 'Community',
    links: [
      { label: 'Discord', href: 'https://discord.veilpayapp.com' },
      { label: 'X (Twitter)', href: 'https://x.veilpayapp.com' },
      { label: 'Telegram', href: 'https://telegram.veilpayapp.com' },
      { label: 'Instagram', href: 'https://instagram.veilpayapp.com' },
      { label: 'LinkedIn', href: 'https://linkedin.veilpayapp.com' },
    ],
  },
];

const BrutalistFooter: React.FC = () => {
  // Dynamic component: the sparkle field auto-scales its particle count to the
  // live viewport. A large desktop canvas gets the full field; a narrower window
  // uses fewer particles so density (and cost) stay right for the area shown —
  // and it re-derives instantly if the window is resized across the breakpoint.
  const isWide = useMediaQuery('(min-width: 1024px)');
  const particleDensity = isWide ? 800 : 400;

  const handleLinkClick = (e: React.MouseEvent, href: string, eventName?: string) => {
    if (href.startsWith('#')) {
      e.preventDefault();
      const el = document.querySelector(href);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
        if (eventName) {
          // Add a small delay to allow smooth scroll to start
          setTimeout(() => {
            window.dispatchEvent(new CustomEvent(eventName));
          }, 400);
        }
      }
    }
  };

  return (
    <footer id="footer" className="relative w-full min-h-screen flex flex-col justify-between bg-black text-white overflow-y-auto overflow-x-hidden pt-20 border-t border-white/10">
      {/* Background Sparkles — scaled down density for mobile devices */}
      <div className="absolute inset-0 z-0 w-full h-full pointer-events-none">
        <SparklesCore
          id="footer-sparkles"
          background="transparent"
          minSize={0.4}
          maxSize={1.5}
          particleDensity={isHighEnd() ? particleDensity : 30}
          className="w-full h-full opacity-80 cursor-default"
          particleColor="#F2C572" 
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative z-10 mx-auto flex max-w-7xl flex-col gap-8 md:gap-16 px-4 md:px-6 pt-24 pb-8 md:py-24 lg:flex-row md:px-12"
      >
        <div className="flex flex-col justify-start gap-6 md:gap-12 lg:flex-1">
          <h2 className="text-3xl sm:text-5xl md:text-7xl font-extrabold tracking-tighter leading-[0.9]">
            <span className="text-transparent bg-clip-text bg-gradient-to-b from-white via-gray-300 to-gray-600 drop-shadow-[0_20px_30px_rgba(255,255,255,0.1)] drop-shadow-[0_5px_10px_rgba(0,0,0,1)] block mb-1">
              Privacy is the new standard.
            </span>
          </h2>


        </div>

        {/* Link columns as flex auto-layout: each column grows to share the row
            equally and wraps to fewer-per-row as the footer narrows (min-w keeps
            ~2-up on phones, 3-up on wider screens) — no fixed grid tracks. */}
        <div className="flex flex-wrap gap-6 md:gap-10 lg:flex-1 lg:pl-12 pt-2 md:pt-4">
          {FOOTER_DATA.map((col, idx) => (
            <motion.div
              key={col.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.1 + 0.3 }}
              className="flex flex-1 flex-col gap-4 md:gap-6 min-w-[100px] md:min-w-[120px]"
            >
              <h4 className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-amber-500/80">
                {col.title}
              </h4>
              <ul className="flex flex-col gap-3 md:gap-4">
                {col.links.map((link) => (
                  <li key={link.label}>
                    {link.href.startsWith('/') ? (
                      <Link
                        to={link.href}
                        className="text-xs md:text-sm font-medium text-neutral-400 hover:text-white transition-colors duration-200"
                      >
                        {link.label}
                      </Link>
                    ) : link.href.startsWith('http') ? (
                      <a
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs md:text-sm font-medium text-neutral-400 hover:text-white transition-colors duration-200"
                      >
                        {link.label}
                      </a>
                    ) : (
                      <a
                        href={link.href}
                        onClick={(e) => handleLinkClick(e, link.href, link.eventName)}
                        className="text-xs md:text-sm font-medium text-neutral-400 hover:text-white transition-colors duration-200 cursor-pointer"
                      >
                        {link.label}
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </motion.div>

      <div className="relative z-10 w-full mt-2 md:mt-10 flex justify-center">
        <a
          href="#"
          className="group flex w-full justify-center items-center text-center"
          aria-label="Veilpay"
        >
          <span
            className="flex justify-center items-center font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-[#F2C572] from-[15%] via-[#5E3B09] via-[50%] to-[#3A2408] to-[90%] uppercase pb-4"
            style={{
              // Edge-to-edge on all screens, but clamped so it never collapses
              // on tiny viewports or blows past readable size on ultra-wide ones.
              fontSize: 'clamp(2.5rem, 18vw, 30rem)',
              lineHeight: 0.85,
              WebkitTextFillColor: 'transparent',
            }}
          >
            VEILPAY
          </span>
        </a>
      </div>

      <div className="mx-auto mt-8 md:mt-16 flex max-w-7xl flex-col items-center justify-between gap-4 border-t border-white/10 px-4 md:px-6 py-6 md:py-8 sm:flex-row md:px-12 relative z-10">
        <span className="text-[10px] md:text-xs text-neutral-500">
          &copy; 2026 Veilpay. All rights reserved.
        </span>
        <div className="flex items-center gap-4 md:gap-6">
          <Link to="/terms" className="text-[10px] md:text-xs font-medium text-neutral-500 hover:text-amber-400 transition-colors">
            Terms of Service
          </Link>
          <Link to="/privacy" className="text-[10px] md:text-xs font-medium text-neutral-500 hover:text-amber-400 transition-colors">
            Privacy Policy
          </Link>
        </div>
      </div>
    </footer>
  );
};

export default React.memo(BrutalistFooter);
