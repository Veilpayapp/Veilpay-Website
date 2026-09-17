import { useState, useCallback, lazy, Suspense, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import Preloader from './components/Preloader';
import GlassNavbar, { handleScroll } from './components/GlassNavbar';
import ScrollSequence from './components/ScrollSequence';
import SmoothScroll from './components/SmoothScroll';
import ScrollProgress from './components/ScrollProgress';
import NoiseOverlay from './components/NoiseOverlay';
import { isLowEnd, isMobileDevice } from './lib/deviceCapability';
import { isSmoothScrollReady } from './lib/utils';
import './App.css';

import SqueezeFooterReveal from './components/SqueezeFooterReveal';

// Below-the-fold sections are code-split so their heavy deps
// (@firecms/neat WebGL shader, SparklesCore, extra gsap timelines) leave the
// initial bundle and load only once the app is past the preloader.
const MassiveTextScroll = lazy(() => import('./components/MassiveTextScroll'));
const DownloadSection = lazy(() => import('./components/DownloadSection'));
const BrutalistFooter = lazy(() => import('./components/BrutalistFooter'));

// Global flag so the preloader only ever runs on the very first visit,
// preventing a black screen flash when navigating back from /docs.
let hasRunPreloader = false;

function App() {
  const isSSR = typeof window === 'undefined';
  const [isLoading, setIsLoading] = useState(isSSR ? false : !hasRunPreloader);
  const location = useLocation();
  // The noise overlay is a full-viewport SVG-filter layer composited with
  // mix-blend-screen — a constant per-frame GPU blend cost. It's a barely
  // visible texture, so skip it on ALL phones (not just low-end): mid-range
  // Androids score "medium" but still can't afford a full-screen blend on
  // every scroll frame.
  const skipNoise = isSSR ? true : (isLowEnd() || isMobileDevice());

  const handlePreloaderComplete = useCallback(() => {
    setIsLoading(false);
    hasRunPreloader = true;
  }, []);

  useEffect(() => {
    if (isLoading) return;

    // Reset native scroll on route change so GSAP measures from a clean slate
    // and smooth scrolling starts predictably from the top.
    window.scrollTo(0, 0);

    // After the preloader finishes (or on route change), trigger the auto-scroll for hash or path URLs
    const path = location.pathname.replace(/\/$/, '');
    const hash = location.hash;

    let target: string | number | null = null;
    if (path === '/waitlist' || hash === '#waitlist') target = '#waitlist';
    else if (path === '/features' || hash === '#features') target = '#features';
    else if (path === '/contact' || hash === '#footer') target = '#footer';
    else if (path === '/home' || path === '') target = 0;

    let interval: ReturnType<typeof setInterval> | null = null;
    let timeout: ReturnType<typeof setTimeout> | null = null;
    let executeScrollRef: (() => void) | null = null;

    if (target !== null) {
      executeScrollRef = () => {
        interval = setInterval(() => {
          if (!isSmoothScrollReady()) return;

          let ready = false;
          if (target === '#waitlist') {
            ready = !!document.getElementById('download');
          } else if (target === '#footer') {
            ready = !!document.getElementById('footer');
          } else if (target === '#features') {
            ready = !!document.getElementById('features') || document.documentElement.scrollHeight > 2000;
          } else {
            ready = true; // Target 0 (home) is always ready
          }

          if (ready) {
            if (interval) clearInterval(interval);
            handleScroll(null, target as string | number);
          }
        }, 100);

        timeout = setTimeout(() => {
          if (interval) clearInterval(interval);
        }, 5000);
      };

      if (document.readyState === 'complete') {
        executeScrollRef();
      } else {
        window.addEventListener('load', executeScrollRef, { once: true });
      }
    }

    return () => {
      if (interval) clearInterval(interval);
      if (timeout) clearTimeout(timeout);
      if (executeScrollRef) window.removeEventListener('load', executeScrollRef);
    };
  }, [location.pathname, location.hash, isLoading]);

  return (
    <div className="min-h-screen bg-black text-white">
      <Helmet>
        <title>Veilpay | Private by Default. Multi-Chain by Design</title>
        <meta name="description" content="Accept crypto donations privately and receive Web3 payments without exposing your wallet address. Stealth addresses &amp; ZK proofs across 7+ chains." />
        <link rel="canonical" href="https://veilpayapp.com/" />
        <script type="application/ld+json">
          {JSON.stringify([
            {
              "@context": "https://schema.org",
              "@type": "SoftwareApplication",
              "name": "Veilpay",
              "applicationCategory": "FinanceApplication",
              "operatingSystem": "Web, Android, iOS",
              "url": "https://veilpayapp.com/",
              "description": "Non-custodial crypto vault with stealth addresses, ZK proofs, and multi-chain private payments across Stellar, Monero, Zcash, Ethereum, and Solana.",
              "screenshot": "https://veilpayapp.com/og.jpg",
              "featureList": "Stealth Addresses, Zero-Knowledge Proofs, Multi-Chain Support, Fiat On-Ramps, Non-Custodial Vault, EIP-5564 Compliance",
              "author": {
                "@type": "Organization",
                "name": "Veilpay"
              },
              "datePublished": "2025-01-01",
              "offers": {
                "@type": "Offer",
                "price": "0",
                "priceCurrency": "USD",
                "availability": "https://schema.org/PreOrder",
                "url": "https://veilpayapp.com/waitlist",
                "validFrom": "2025-01-01T00:00:00Z",
                "hasMerchantReturnPolicy": {
                  "@type": "MerchantReturnPolicy",
                  "applicableCountry": "US",
                  "returnPolicyCategory": "https://schema.org/MerchantReturnNotPermitted"
                },
                "shippingDetails": {
                  "@type": "OfferShippingDetails",
                  "shippingRate": {
                    "@type": "MonetaryAmount",
                    "value": "0",
                    "currency": "USD"
                  },
                  "shippingDestination": {
                    "@type": "DefinedRegion",
                    "addressCountry": "US"
                  }
                }
              },
              "sameAs": [
                "https://discord.veilpayapp.com",
                "https://x.veilpayapp.com",
                "https://telegram.veilpayapp.com",
                "https://instagram.veilpayapp.com",
                "https://linkedin.veilpayapp.com"
              ]
            },
            {
              "@context": "https://schema.org",
              "@type": "Organization",
              "name": "Veilpay",
              "alternateName": "VeilPay App",
              "url": "https://veilpayapp.com/",
              "logo": "https://veilpayapp.com/logo.webp",
              "description": "Veilpay builds privacy-native, non-custodial crypto payment infrastructure with stealth addresses and zero-knowledge proofs.",
              "foundingDate": "2025",
              "contactPoint": {
                "@type": "ContactPoint",
                "contactType": "customer support",
                "url": "https://discord.veilpayapp.com",
                "availableLanguage": "English"
              },
              "sameAs": [
                "https://discord.veilpayapp.com",
                "https://x.veilpayapp.com",
                "https://telegram.veilpayapp.com",
                "https://instagram.veilpayapp.com",
                "https://linkedin.veilpayapp.com",
                "https://veilpay.medium.com"
              ]
            },
            {
              "@context": "https://schema.org",
              "@type": "Product",
              "name": "Veilpay",
              "image": "https://veilpayapp.com/og.jpg",
              "description": "Accept crypto donations privately and receive Web3 payments without exposing your wallet address. Stealth addresses and ZK proofs across 7+ chains.",
              "brand": {
                "@type": "Brand",
                "name": "Veilpay"
              },
              "category": "Cryptocurrency Wallet",
              "offers": {
                "@type": "Offer",
                "price": "0",
                "priceCurrency": "USD",
                "availability": "https://schema.org/PreOrder",
                "url": "https://veilpayapp.com/waitlist",
                "priceValidUntil": "2027-12-31",
                "validFrom": "2025-01-01T00:00:00Z",
                "hasMerchantReturnPolicy": {
                  "@type": "MerchantReturnPolicy",
                  "applicableCountry": "US",
                  "returnPolicyCategory": "https://schema.org/MerchantReturnNotPermitted"
                },
                "shippingDetails": {
                  "@type": "OfferShippingDetails",
                  "shippingRate": {
                    "@type": "MonetaryAmount",
                    "value": "0",
                    "currency": "USD"
                  },
                  "shippingDestination": {
                    "@type": "DefinedRegion",
                    "addressCountry": "US"
                  }
                },
                "seller": {
                  "@type": "Organization",
                  "name": "Veilpay"
                }
              }
            },
            {
              "@context": "https://schema.org",
              "@type": "WebSite",
              "name": "Veilpay",
              "url": "https://veilpayapp.com/",
              "description": "Private by Default. Multi-Chain by Design. Non-custodial crypto vault for everyday private payments.",
              "publisher": {
                "@type": "Organization",
                "name": "Veilpay",
                "logo": {
                  "@type": "ImageObject",
                  "url": "https://veilpayapp.com/logo.webp"
                }
              },
              "potentialAction": {
                "@type": "SearchAction",
                "target": "https://veilpayapp.com/docs?q={search_term_string}",
                "query-input": "required name=search_term_string"
              }
            }
          ])}
        </script>
      </Helmet>
      <GlassNavbar />
      {/* Skip the noise overlay SVG filter on low-end AND all mobile devices —
          it's a constant GPU paint cost for a barely-visible texture. */}
      {!skipNoise && <NoiseOverlay />}
      {isLoading ? (
        <Preloader key="preloader" onComplete={handlePreloaderComplete} />
      ) : (
        <SmoothScroll>
          <ScrollProgress />
          <SqueezeFooterReveal 
            footer={
              <Suspense fallback={<div className="h-screen bg-black" />}>
                <BrutalistFooter />
              </Suspense>
            }
          >
            <ScrollSequence />
            <Suspense fallback={<div className="h-screen bg-black" />}>
              <MassiveTextScroll />
              <DownloadSection />
            </Suspense>
          </SqueezeFooterReveal>
        </SmoothScroll>
      )}
    </div>
  );
}

export default App;
