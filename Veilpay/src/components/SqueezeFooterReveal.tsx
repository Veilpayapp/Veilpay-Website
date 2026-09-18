import React from 'react';

interface Props {
  children: React.ReactNode;
  footer: React.ReactNode;
}

const SqueezeFooterReveal: React.FC<Props> = ({ children, footer }) => {
  return (
    <div className="relative w-full bg-black">
      {/* Fixed Footer (Hidden behind main content) */}
      <div className="fixed bottom-0 left-0 w-full h-screen z-0 overflow-hidden">
        {footer}
      </div>

      {/* Main Content Layer (Sits on top, acts as the curtain) */}
      <div className="relative z-10 w-full bg-black shadow-[0_20px_80px_rgba(0,0,0,0.9)] overflow-hidden border-b border-white/10">
        {children}
      </div>

      {/* Spacer to allow scrolling past the main content to reveal the fixed footer */}
      <div id="contact" className="w-full h-screen pointer-events-none" />
    </div>
  );
};

export default SqueezeFooterReveal;
