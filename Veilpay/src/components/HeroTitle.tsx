import React from 'react';
import { motion } from 'framer-motion';

const HeroTitle: React.FC = () => {
  return (
    <div className="relative flex flex-col items-center justify-center text-center max-w-4xl px-4 mt-[-10vh]">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, ease: 'easeOut' }}
        className="mb-8 w-full flex flex-col items-center"
      >
        <div
          className="flex flex-col items-center text-center text-[clamp(3rem,9vw,7.75rem)] leading-normal tracking-tighter mb-4"
          style={{ fontFamily: "'Playfair Display', serif" }}
        >
          <span className="text-transparent bg-clip-text bg-gradient-to-b from-white via-gray-300 to-[#111111] pb-4">
            Private by
          </span>
          <span className="text-transparent bg-clip-text bg-gradient-to-b from-[#F2C572] via-[#D4A042] to-[#1a1103] -mt-8 md:-mt-[2.8rem] pb-4 preserve-color">
            default.
          </span>
          <span className="text-transparent bg-clip-text bg-gradient-to-b from-white via-gray-400 to-[#111111] italic font-light tracking-normal text-[clamp(2.5rem,7vw,6.25rem)] my-1 -mt-6 md:-mt-[1.8rem] pb-4">
            Multi-chain
          </span>
          <span className="text-transparent bg-clip-text bg-gradient-to-b from-[#F9D423] via-[#D4A042] to-[#1a1103] -mt-8 md:-mt-[2.8rem] pb-4 preserve-color">
            by design.
          </span>
        </div>
      </motion.div>
    </div>
  );
};

export default React.memo(HeroTitle);
