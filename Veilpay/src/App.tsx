import { useState, useCallback, lazy, Suspense, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
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
  const location = useLocation();
  // The noise overlay is a full-viewport SVG-filter layer composited with
  // mix-blend-screen — a constant per-frame GPU blend cost. It's a barely
  // visible texture, so skip it on ALL phones (not just low-end): mid-range
  // Androids score "medium" but still can't afford a full-screen blend on
  // every scroll frame.
  const skipNoise = isLowEnd() || isMobileDevice();

  const handlePreloaderComplete = useCallback(() => {
    setIsLoading(false);
  }, []);

  useEffect(() => {
    if (isLoading) return;

    // After the preloader finishes (or on route change), trigger the auto-scroll for hash or path URLs
    const path = location.pathname.replace(/\/$/, '');
    const hash = location.hash;

    let target: string | number | null = null;
    if (path === '/waitlist' || hash === '#waitlist') target = '#waitlist';
    else if (path === '/features' || hash === '#features') target = '#features';
    else if (path === '/contact' || hash === '#footer') target = '#footer';
    else if (path === '/home' || path === '') target = 0;

    if (target !== null) {
      const executeScroll = () => {
        const interval = setInterval(() => {
          // Dynamic import of handleScroll since it contains lenis + gsap imports
          import('./components/GlassNavbar').then(({ handleScroll }) => {
            let ready = false;
            if (target === '#waitlist') {
              ready = !!(document.getElementById('download-anchor') || document.getElementById('download'));
            } else if (target === '#footer') {
              ready = !!document.getElementById('footer') && document.documentElement.scrollHeight > 3000;
            } else if (target === '#features') {
              // Wait for GSAP ScrollTrigger to pin the sections
              ready = document.documentElement.scrollHeight > 3000;
            } else {
              ready = true; // Target 0 (home) is always ready
            }

            if (ready) {
              clearInterval(interval);
              handleScroll(null, target as string | number);
            }
          });
        }, 100);

        setTimeout(() => clearInterval(interval), 5000);
      };

      if (document.readyState === 'complete') {
        executeScroll();
      } else {
        window.addEventListener('load', executeScroll, { once: true });
      }
    }
  }, [location.pathname, location.hash, isLoading]);

  return (
    <div className="min-h-screen bg-black text-white">
      <Helmet>
        <title>Veilpay | Private by Default. Multi-Chain by Design</title>
        <meta name="description" content="Accept crypto donations privately and receive Web3 payments without exposing your wallet address. Stealth addresses &amp; ZK proofs across 7+ chains." />
        <link rel="canonical" href="https://veilpayapp.com/" />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            "name": "Veilpay",
            "applicationCategory": "FinanceApplication",
            "operatingSystem": "Web",
            "url": "https://veilpayapp.com/",
            "sameAs": [
              "https://discord.veilpayapp.com",
              "https://x.veilpayapp.com",
              "https://telegram.veilpayapp.com",
              "https://instagram.veilpayapp.com",
              "https://linkedin.veilpayapp.com"
            ]
          })}
        </script>
      </Helmet>
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
