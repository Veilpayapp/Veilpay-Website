import { StrictMode, lazy, Suspense } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { HelmetProvider } from 'react-helmet-async'
// @ts-ignore - User is actively working on these imports
import { LazyMotion, domAnimation } from 'framer-motion'
import App from './App.tsx'
import { configureScrollTriggers } from './lib/scrollConfig'
import './index.css'

// Make every pinned ScrollTrigger resilient to mobile URL-bar resizes and
// re-frame itself on real orientation/width changes. Safe to call before the
// timelines are created — it only sets global config + a resize listener.
configureScrollTriggers()

// Code-split: legal pages + docs stay off the home path so Core Web Vitals
// measurements (LCP/FCP/SI) on the landing page do not include this weight.
// DocsPage is a rich docs layout (sticky TOC + heading anchors) built on top
// of the consolidated docs.md export of veilpay-docs/.
const LegalPage = lazy(() => import('./pages/LegalPage.tsx'))
const CryptoDonations = lazy(() => import('./pages/CryptoDonations.tsx'))
const DocsPage = lazy(() => import('./pages/DocsPage.tsx'))

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <HelmetProvider>
        {/* LazyMotion loads only the `domAnimation` feature bundle once for the
            whole app, so every `m.*` component below ships ~30kb less than the
            full `motion` import while keeping the same animations. */}
        <LazyMotion features={domAnimation} strict>
          <Suspense fallback={<div className="min-h-screen bg-black" />}>
            <Routes>
              <Route path="/" element={<App />} />
              <Route path="/waitlist" element={<App />} />
              <Route path="/features" element={<App />} />
              <Route path="/contact" element={<App />} />
              <Route path="/crypto-donations" element={<CryptoDonations />} />
              <Route path="/about" element={<LegalPage doc="about" />} />
              <Route path="/privacy" element={<LegalPage doc="privacy" />} />
              <Route path="/terms" element={<LegalPage doc="terms" />} />
              <Route path="/docs/*" element={<DocsPage />} />
            </Routes>
          </Suspense>
        </LazyMotion>
      </HelmetProvider>
    </BrowserRouter>
  </StrictMode>,
)

// ── Performance Metrics Reporting ──
// Lighthouse / PageSpeed Insights measures LCP, FCP, SI from the Performance
// Timeline API. The browser records these automatically, but we also expose
// them on window.__PERF_METRICS__ for debugging and external tools.

interface PerfMetrics {
  fcp: number | null;
  lcp: number | null;
}

const metrics: PerfMetrics = { fcp: null, lcp: null };

// Expose globally so Lighthouse / scripts can read them
(window as unknown as { __PERF_METRICS__: PerfMetrics }).__PERF_METRICS__ = metrics;

// ── First Contentful Paint ──
try {
  const fcpObserver = new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      if (entry.name === 'first-contentful-paint') {
        metrics.fcp = entry.startTime;
        if (import.meta.env.DEV) {
          console.log(`[Perf] FCP: ${entry.startTime.toFixed(1)}ms`);
        }
        fcpObserver.disconnect();
      }
    }
  });
  fcpObserver.observe({ type: 'paint', buffered: true });
} catch {
  // PerformanceObserver not supported — graceful fallback
}

// ── Largest Contentful Paint ──
try {
  const lcpObserver = new PerformanceObserver((list) => {
    const entries = list.getEntries();
    // LCP is the last entry — the browser may report multiple candidates
    const last = entries[entries.length - 1];
    if (last) {
      metrics.lcp = last.startTime;
      if (import.meta.env.DEV) {
        console.log(`[Perf] LCP: ${last.startTime.toFixed(1)}ms`);
      }
    }
  });
  lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true });

  // Disconnect when the page becomes fully interactive (user interacts)
  // — after interaction, LCP is finalized by the browser.
  const stopLCP = () => {
    lcpObserver.disconnect();
    window.removeEventListener('pointerdown', stopLCP);
    window.removeEventListener('keydown', stopLCP);
  };
  window.addEventListener('pointerdown', stopLCP, { once: true, passive: true });
  window.addEventListener('keydown', stopLCP, { once: true, passive: true });
} catch {
  // PerformanceObserver not supported — graceful fallback
}
