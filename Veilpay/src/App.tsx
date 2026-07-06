import { useState, useCallback, lazy, Suspense } from 'react';
import { AnimatePresence } from 'framer-motion';
import Preloader from './components/Preloader';
import GlassNavbar from './components/GlassNavbar';
import ScrollSequence from './components/ScrollSequence';
import SmoothScroll from './components/SmoothScroll';
import NoiseOverlay from './components/NoiseOverlay';
import { isLowEnd } from './lib/deviceCapability';
import './App.css';

// Below-the-fold sections are code-split so their heavy deps
// (@firecms/neat WebGL shader, SparklesCore, extra gsap timelines) leave the
// initial bundle and load only once the app is past the preloader.
const MassiveTextScroll = lazy(() => import('./components/MassiveTextScroll'));
const DownloadSection = lazy(() => import('./components/DownloadSection'));
const SqueezeFooterReveal = lazy(() => import('./components/SqueezeFooterReveal'));
const BrutalistFooter = lazy(() => import('./components/BrutalistFooter'));

function App() {
  const [isLoading, setIsLoading] = useState(true);
  const lowEnd = isLowEnd();

  const handlePreloaderComplete = useCallback(() => {
    setIsLoading(false);
  }, []);

  return (
    <div className="min-h-screen bg-black text-white">
      <GlassNavbar />
      {/* Skip the noise overlay SVG filter on low-end devices — it's a
          constant GPU paint cost for a barely-visible texture. */}
      {!lowEnd && <NoiseOverlay />}
      <AnimatePresence mode="wait">
        {isLoading ? (
          <Preloader key="preloader" onComplete={handlePreloaderComplete} />
        ) : (
          <Suspense fallback={null}>
            <SmoothScroll>
              <SqueezeFooterReveal footer={<BrutalistFooter />}>
                <ScrollSequence />
                <MassiveTextScroll />
                <DownloadSection />
              </SqueezeFooterReveal>
            </SmoothScroll>
          </Suspense>
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;
