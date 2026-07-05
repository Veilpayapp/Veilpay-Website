import React, { useState } from 'react';
import { motion } from 'framer-motion';

import { ArrowUpRight } from 'lucide-react';
import { SparklesCore } from './ui/SparklesCore';

const FOOTER_DATA = [
  {
    title: 'Platform',
    links: [
      { label: 'Privacy', href: '#features' },
      { label: 'Stealth Addresses', href: '#' },
      { label: 'Download APK', href: '#download' },
      { label: 'Waitlist', href: '#waitlist' },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'About Us', href: '#' },
      { label: 'Privacy Policy', href: '#' },
      { label: 'Terms of Service', href: '#' },
    ],
  },
  {
    title: 'Community',
    links: [
      { label: 'Discord', href: 'https://discord.gg/aeNy2nMAp' },
      { label: 'X (Twitter)', href: 'https://x.com/Veilpayapp' },
      { label: 'Telegram', href: 'https://t.me/veilpayapp' },
      { label: 'Instagram', href: 'https://www.instagram.com/N2loeWMwZjQ1NWJw' },
      { label: 'LinkedIn', href: 'https://www.linkedin.com/company/veilpay/' },
    ],
  },
];

const BrutalistFooter: React.FC = () => {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const handleSubmitBeta = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    
    setStatus('loading');
    
    try {
      const BETA_WEBHOOK_URL = import.meta.env.VITE_BETA_WEBHOOK_URL;
      
      if (!BETA_WEBHOOK_URL) {
        console.error("Missing Beta Webhook URL! Add VITE_BETA_WEBHOOK_URL to your .env");
        setStatus('error');
        return;
      }

      const response = await fetch(BETA_WEBHOOK_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          embeds: [
            {
              title: "🧪 New Beta Tester Signup!",
              description: `A user has requested beta access.\n\n**Email:** \`${email}\``,
              color: 3066993, // Green
              timestamp: new Date().toISOString()
            }
          ]
        })
      });

      if (response.ok) {
        setStatus('success');
        setEmail('');
      } else {
        const err = await response.text();
        console.error("Webhook error:", err);
        setStatus('error');
      }
    } catch (error) {
      console.error("Network error:", error);
      setStatus('error');
    }
  };

  return (
    <footer className="relative w-full min-h-screen flex flex-col justify-between bg-black text-white overflow-hidden pt-20 border-t border-white/10">
      {/* Background Sparkles */}
      <div className="absolute inset-0 z-0 w-full h-full pointer-events-auto">
        <SparklesCore
          id="footer-sparkles"
          background="transparent"
          minSize={0.4}
          maxSize={1.5}
          particleDensity={800}
          className="w-full h-full opacity-80 cursor-default"
          particleColor="#F2C572" 
        />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative z-10 mx-auto grid max-w-7xl grid-cols-1 gap-16 px-6 py-24 lg:grid-cols-2 md:px-12"
      >
        <div className="flex flex-col justify-start gap-12">
          <h2 className="text-5xl sm:text-6xl md:text-7xl font-extrabold tracking-tighter leading-[0.9]">
            <span className="text-transparent bg-clip-text bg-gradient-to-b from-white via-gray-300 to-gray-600 drop-shadow-[0_20px_30px_rgba(255,255,255,0.1)] drop-shadow-[0_5px_10px_rgba(0,0,0,1)] block mb-1">
              Privacy is the new standard.
            </span>
          </h2>
          
          <div className="flex flex-col gap-5">
            <div className="flex items-center gap-3 text-sm font-semibold tracking-wide text-neutral-300">
              <span className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse" />
              Join the beta
            </div>
            <form onSubmit={handleSubmitBeta} className="flex flex-col gap-2 w-full max-w-md relative z-20">
              <div className="flex w-full items-center border border-white/20 rounded-full bg-white/5 p-1.5 backdrop-blur-md focus-within:border-amber-500/50 transition-colors relative z-20">
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={status === 'loading' || status === 'success'}
                  placeholder="Enter your email for beta access" 
                  required
                  className="w-full bg-transparent border-none outline-none text-white placeholder-white/40 font-medium px-5 py-2 disabled:opacity-50"
                />
                <button 
                  type="submit"
                  disabled={status === 'loading' || status === 'success'}
                  className="flex items-center justify-center p-3 bg-white text-black rounded-full hover:bg-neutral-200 hover:rotate-45 transition-all disabled:opacity-50 relative z-30"
                >
                  <ArrowUpRight className="w-5 h-5" />
                </button>
              </div>
              {status === 'success' && <p className="text-green-400 text-sm pl-4">Added to beta waitlist!</p>}
              {status === 'error' && <p className="text-red-400 text-sm pl-4">Error submitting. Try again.</p>}
              {status === 'loading' && <p className="text-amber-400 text-sm pl-4">Joining...</p>}
            </form>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-10 sm:grid-cols-3 lg:pl-12 pt-4">
          {FOOTER_DATA.map((col, idx) => (
            <motion.div 
              key={col.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.1 + 0.3 }}
              className="flex flex-col gap-6"
            >
              <h4 className="text-xs font-bold uppercase tracking-widest text-amber-500/80">
                {col.title}
              </h4>
              <ul className="flex flex-col gap-4">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="text-sm font-medium text-neutral-400 hover:text-white transition-colors duration-200"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1, delay: 0.5 }}
        className="relative z-10 w-full mt-10 flex justify-center"
      >
        <a
          href="#"
          className="group block w-full text-center leading-none"
          aria-label="VeilPay"
        >
          <span
            className="inline-block font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-[#F2C572] from-[15%] via-[#5E3B09] via-[50%] to-[#0A0A0A] to-[90%] uppercase"
            style={{
              fontSize: '24vw', // Edge to edge on all screens
              lineHeight: 0.8,
              filter: 'drop-shadow(0px 10px 20px rgba(0,0,0,0.5))',
              willChange: 'filter'
            }}
          >
            VEILPAY
          </span>
        </a>
      </motion.div>

      <div className="mx-auto mt-16 flex max-w-7xl flex-col items-center justify-between gap-4 border-t border-white/10 px-6 py-8 sm:flex-row md:px-12 relative z-10">
        <span className="text-xs text-neutral-500">
          &copy; 2026 VeilPay. All rights reserved.
        </span>
        <div className="flex items-center gap-6">
          <a href="#" className="text-xs font-medium text-neutral-500 hover:text-amber-400 transition-colors">
            Terms of Service
          </a>
          <a href="#" className="text-xs font-medium text-neutral-500 hover:text-amber-400 transition-colors">
            Privacy Policy
          </a>
        </div>
      </div>
    </footer>
  );
};

export default React.memo(BrutalistFooter);
