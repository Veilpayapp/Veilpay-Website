/* eslint-disable react-refresh/only-export-components */
import { StrictMode, lazy, Suspense } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import { HelmetProvider } from 'react-helmet-async'
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
const DocsPage = lazy(() => import('./pages/DocsPage.tsx'))
const BlogPage = lazy(() => import('./pages/BlogPage.tsx'))
const BlogPostPage = lazy(() => import('./pages/BlogPostPage.tsx'))
const PrivateWallet = lazy(() => import('./pages/PrivateWallet.tsx'))
const HowItWorks = lazy(() => import('./pages/HowItWorks.tsx'))

// On the docs subdomain, strip the `/docs` prefix from the URL bar when
// React Router pushes state to history, so internal links remain transparent.
const isDocsSubdomain = window.location.hostname === 'docs.veilpayapp.com' || window.location.hostname.includes('docs.veilpayapp.com');

if (isDocsSubdomain) {
  const originalPushState = window.history.pushState;
  window.history.pushState = function (state, unused, url) {
    if (url) {
      let parsedUrl = typeof url === 'string' ? url : url.toString();
      try {
        // If it's a full URL
        const urlObj = new URL(parsedUrl, window.location.origin);
        if (urlObj.pathname.startsWith('/docs')) {
          urlObj.pathname = urlObj.pathname === '/docs' ? '/' : urlObj.pathname.slice(5);
          parsedUrl = urlObj.pathname + urlObj.search + urlObj.hash;
        }
      } catch {
        // Fallback for relative paths if URL parsing fails
        if (parsedUrl.startsWith('/docs')) {
          parsedUrl = parsedUrl === '/docs' ? '/' : parsedUrl.slice(5);
        }
      }
      return originalPushState.call(this, state, unused, parsedUrl);
    }
    return originalPushState.call(this, state, unused, url);
  };

  const originalReplaceState = window.history.replaceState;
  window.history.replaceState = function (state, unused, url) {
    if (url) {
      let parsedUrl = typeof url === 'string' ? url : url.toString();
      try {
        const urlObj = new URL(parsedUrl, window.location.origin);
        if (urlObj.pathname.startsWith('/docs')) {
          urlObj.pathname = urlObj.pathname === '/docs' ? '/' : urlObj.pathname.slice(5);
          parsedUrl = urlObj.pathname + urlObj.search + urlObj.hash;
        }
      } catch {
        if (parsedUrl.startsWith('/docs')) {
          parsedUrl = parsedUrl === '/docs' ? '/' : parsedUrl.slice(5);
        }
      }
      return originalReplaceState.call(this, state, unused, parsedUrl);
    }
    return originalReplaceState.call(this, state, unused, url);
  };
}

const SubdomainRoutes = () => {
  const location = useLocation();
  const isDocsSubdomain = window.location.hostname === 'docs.veilpayapp.com' || window.location.hostname.includes('docs.veilpayapp.com');
  
  let effectiveLocation = location;
  if (isDocsSubdomain && !location.pathname.startsWith('/docs')) {
    const target = location.pathname === '/' ? '/docs' : `/docs${location.pathname}`;
    effectiveLocation = { ...location, pathname: target };
  }
  
  return (
    <Routes location={effectiveLocation}>
      <Route path="/" element={<App />} />
      <Route path="/waitlist" element={<App />} />
      <Route path="/features" element={<App />} />
      <Route path="/contact" element={<App />} />
      <Route path="/about" element={<LegalPage doc="about" />} />
      <Route path="/privacy" element={<LegalPage doc="privacy" />} />
      <Route path="/terms" element={<LegalPage doc="terms" />} />
      <Route path="/docs/*" element={<DocsPage />} />
      <Route path="/blogs" element={<BlogPage />} />
      <Route path="/blog/:slug" element={<BlogPostPage />} />
      <Route path="/private-wallet" element={<PrivateWallet />} />
      <Route path="/how-it-works" element={<HowItWorks />} />
    </Routes>
  );
};

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <HelmetProvider>
        {/* LazyMotion loads only the `domAnimation` feature bundle once for the
            whole app, so every `m.*` component below ships ~30kb less than the
            full `motion` import while keeping the same animations. */}
        <LazyMotion features={domAnimation} strict>
          <Suspense fallback={<div className="min-h-screen bg-black" />}>
            <SubdomainRoutes />
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
