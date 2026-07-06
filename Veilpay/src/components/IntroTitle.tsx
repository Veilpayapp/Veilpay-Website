import React from 'react';

const IntroTitle: React.FC = () => {
  return (
    <div className="flex flex-col md:grid md:grid-cols-2 w-full h-full justify-between md:justify-center items-center pt-[16vh] pb-[12vh] md:py-0">
      <div className="flex justify-center md:justify-end w-full md:w-auto md:pr-[250px]">
        <span 
          className="text-transparent bg-clip-text bg-gradient-to-b from-white via-gray-400 to-[#111111] italic font-light tracking-normal text-[2.5rem] md:text-[8rem] drop-shadow-[0_20px_30px_rgba(255,255,255,0.05)] drop-shadow-[0_5px_10px_rgba(0,0,0,1)]"
          style={{ fontFamily: "'Playfair Display', serif" }}
        >
          Introducing
        </span>
      </div>
      <div className="flex justify-center md:justify-start w-full md:w-auto md:pl-[250px]">
        <span className="text-transparent bg-clip-text bg-gradient-to-b from-[#F2C572] via-[#D4A042] to-[#1a1103] drop-shadow-[0_20px_30px_rgba(212,160,66,0.1)] drop-shadow-[0_5px_10px_rgba(0,0,0,1)] text-[3rem] md:text-[10rem] font-extrabold tracking-tighter uppercase">
          VEILPAY
        </span>
      </div>
    </div>
  );
};

export default IntroTitle;
