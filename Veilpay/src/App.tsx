import { useState, useCallback, lazy, Suspense } from 'react';
import { AnimatePresence } from 'framer-motion';
import Preloader from './components/Preloader';
import GlassNavbar from './components/GlassNavbar';
import ScrollSequence from './components/ScrollSequence';
import SmoothScroll from './components/SmoothScroll';
import ScrollProgress from './components/ScrollProgress';
import NoiseOverlay from './components/NoiseOverlay';
import { isLowEnd, isMobileDevice } from './lib/deviceCapability';
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
  // The noise overlay is a full-viewport SVG-filter layer composited with
  // mix-blend-screen — a constant per-frame GPU blend cost. It's a barely
  // visible texture, so skip it on ALL phones (not just low-end): mid-range
  // Androids score "medium" but still can't afford a full-screen blend on
  // every scroll frame.
  const skipNoise = isLowEnd() || isMobileDevice();

  const handlePreloaderComplete = useCallback(() => {
    setIsLoading(false);
  }, []);

  return (
    <div className="min-h-screen bg-black text-white">
      <GlassNavbar />
      {/* Skip the noise overlay SVG filter on low-end AND all mobile devices —
          it's a constant GPU paint cost for a barely-visible texture. */}
      {!skipNoise && <NoiseOverlay />}
      <AnimatePresence mode="wait">
        {isLoading ? (
          <Preloader key="preloader" onComplete={handlePreloaderComplete} />
        ) : (
          <Suspense fallback={null}>
            <SmoothScroll>
              <ScrollProgress />
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
