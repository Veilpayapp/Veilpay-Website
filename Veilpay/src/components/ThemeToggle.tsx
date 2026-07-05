import React, { useState, useEffect } from 'react';
import { Sun, Moon } from 'lucide-react';

const ThemeToggle: React.FC = () => {
  const [isLightMode, setIsLightMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.matchMedia('(prefers-color-scheme: light)').matches;
    }
    return false;
  });

  useEffect(() => {
    // Check if the user has a preference saved (optional, defaulting to dark mode)
    if (isLightMode) {
      document.documentElement.classList.add('light-mode');
    } else {
      document.documentElement.classList.remove('light-mode');
    }
  }, [isLightMode]);

  return (
    <button
      type="button"
      aria-label="Toggle light and dark mode"
      onClick={() => setIsLightMode(!isLightMode)}
      className="fixed top-6 right-8 z-[100] flex items-center justify-center w-[56px] h-[56px] rounded-full transition-transform hover:scale-110 active:scale-95 glass-panel"
      style={{
        backdropFilter: 'saturate(180%) blur(16px)',
        WebkitBackdropFilter: 'saturate(180%) blur(16px)',
        boxShadow: `
          inset 0 1px 1px rgba(255, 255, 255, 0.4),
          inset 0 -1px 2px rgba(0, 0, 0, 0.6),
          inset -1px 0 2px rgba(255, 255, 255, 0.1),
          0 15px 30px rgba(0, 0, 0, 0.4)
        `
      }}
    >
      <div className="relative w-6 h-6 flex items-center justify-center">
        <Sun 
          className={`absolute text-amber-400 preserve-color transition-all duration-500 ${isLightMode ? 'opacity-100 rotate-0 scale-100' : 'opacity-0 -rotate-90 scale-50'}`} 
        />
        <Moon 
          className={`absolute text-white transition-all duration-500 ${!isLightMode ? 'opacity-100 rotate-0 scale-100' : 'opacity-0 rotate-90 scale-50'}`} 
        />
      </div>
    </button>
  );
};

export default ThemeToggle;
