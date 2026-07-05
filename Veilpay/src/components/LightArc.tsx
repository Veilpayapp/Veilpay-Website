import React from 'react';
import { motion } from 'framer-motion';

const LightArc: React.FC = () => {
  return (
    <div 
      className="absolute inset-0 z-0 flex items-center justify-center pointer-events-none mt-[20vh] md:mt-[15vh]"
      style={{ transform: 'translateZ(0)' }}
    >
      <motion.svg
        viewBox="0 -400 1200 800"
        className="w-[200%] md:w-[150%] max-w-[3000px] flex-shrink-0"
        preserveAspectRatio="xMidYMid meet"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.5, ease: 'easeOut', delay: 0.5 }}
      >
        <defs>
          <linearGradient id="arc-fade" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="transparent" />
            <stop offset="20%" stopColor="rgba(212, 160, 66, 0.4)" />
            <stop offset="50%" stopColor="rgba(242, 197, 114, 1)" />
            <stop offset="80%" stopColor="rgba(212, 160, 66, 0.4)" />
            <stop offset="100%" stopColor="transparent" />
          </linearGradient>

          <filter id="blur-lg" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="15" />
          </filter>
          <filter id="blur-md" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="6" />
          </filter>
          <filter id="blur-sm" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="2" />
          </filter>
        </defs>

        {/* Layer 1 (back — wide, soft, faint) */}
        <path 
          d="M 40 270 A 650 650 0 0 1 1160 270" 
          stroke="url(#arc-fade)" 
          strokeWidth="6" 
          filter="url(#blur-lg)" 
          fill="none" 
          opacity="0.3" 
        />

        {/* Layer 2 (middle) */}
        <path 
          d="M 80 260 A 500 500 0 0 1 1120 260" 
          stroke="url(#arc-fade)" 
          strokeWidth="4" 
          filter="url(#blur-md)" 
          fill="none" 
          opacity="0.6" 
        />

        {/* Layer 3 (front — tightest, sharpest core) */}
        <path 
          d="M 140 250 A 380 380 0 0 1 1060 250" 
          stroke="url(#arc-fade)" 
          strokeWidth="2" 
          filter="url(#blur-sm)" 
          fill="none" 
          opacity="0.95" 
        />
      </motion.svg>
    </div>
  );
};

export default React.memo(LightArc);
