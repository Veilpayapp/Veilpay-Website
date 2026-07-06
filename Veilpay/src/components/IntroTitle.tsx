import React from 'react';

const IntroTitle: React.FC = () => {
  return (
    <div className="flex flex-col md:flex-row w-full h-full justify-between items-center pt-[20vh] pb-[15vh] md:py-0 md:px-[clamp(1rem,4vw,6rem)] w-full overflow-hidden">
      <div className="flex justify-center md:justify-start w-full md:w-auto min-w-0 shrink">
        <span
          className="text-transparent bg-clip-text bg-gradient-to-b from-white via-gray-400 to-[#111111] italic font-light tracking-normal text-[15vw] md:text-[clamp(2rem,6vw,7rem)] leading-none drop-shadow-[0_20px_30px_rgba(255,255,255,0.05)] drop-shadow-[0_5px_10px_rgba(0,0,0,1)]"
          style={{ fontFamily: "'Playfair Display', serif" }}
        >
          Introducing
        </span>
      </div>
      <div className="flex justify-center md:justify-end w-full md:w-auto min-w-0 shrink">
        <span className="text-transparent bg-clip-text bg-gradient-to-b from-[#F2C572] via-[#D4A042] to-[#1a1103] drop-shadow-[0_20px_30px_rgba(212,160,66,0.1)] drop-shadow-[0_5px_10px_rgba(0,0,0,1)] text-[18vw] md:text-[clamp(2.5rem,7.5vw,9rem)] leading-none font-extrabold tracking-tighter uppercase">
          VEILPAY
        </span>
      </div>
    </div>
  );
};

export default IntroTitle;
