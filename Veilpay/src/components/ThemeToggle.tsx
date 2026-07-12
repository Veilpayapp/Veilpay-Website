import React, { useState, useEffect } from 'react';
import { Sun, Moon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ThemeToggleProps {
  className?: string;
}

const ThemeToggle: React.FC<ThemeToggleProps> = ({ className }) => {

  const [isLightMode, setIsLightMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return document.documentElement.classList.contains('light-mode') || 
             (!document.documentElement.classList.contains('dark-mode') && window.matchMedia('(prefers-color-scheme: light)').matches);
    }
    return false;
  });

  useEffect(() => {
    // Initial sync just in case
    setIsLightMode(document.documentElement.classList.contains('light-mode'));

    // Sync state if another ThemeToggle instance changes the class
    const observer = new MutationObserver(() => {
      setIsLightMode(document.documentElement.classList.contains('light-mode'));
    });
    
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  const toggleTheme = () => {
    if (isLightMode) {
      document.documentElement.classList.remove('light-mode');
    } else {
      document.documentElement.classList.add('light-mode');
    }
  };

  return (
    <button
      type="button"
      aria-label="Toggle light and dark mode"
      onClick={toggleTheme}
      className={cn(
        "ios-glass flex items-center justify-center w-10 h-10 md:w-12 md:h-12 rounded-full transition-transform hover:scale-110 active:scale-95 flex-shrink-0",
        className
      )}
    >
      <div className="relative w-5 h-5 md:w-6 md:h-6 flex items-center justify-center">
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
