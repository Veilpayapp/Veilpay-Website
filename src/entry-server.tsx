/**
 * SSR entry point for build-time pre-rendering.
 *
 * This mirrors the component tree in main.tsx but uses StaticRouter instead of
 * BrowserRouter, imports page components eagerly (not lazy), and skips all
 * browser-only code (scroll config, perf observers, etc.).
 */
import { renderToString } from 'react-dom/server';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import type { HelmetServerState } from 'react-helmet-async';
import { LazyMotion, domAnimation } from 'framer-motion';

// Eager imports — renderToString is synchronous, lazy() won't resolve
import App from './App';
import LegalPage from './pages/LegalPage';
import DocsPage from './pages/DocsPage';
import BlogPage from './pages/BlogPage';
import BlogPostPage from './pages/BlogPostPage';
import PrivateWallet from './pages/PrivateWallet';
import HowItWorks from './pages/HowItWorks';

interface RenderResult {
  html: string;
  helmet: HelmetServerState;
}

export function render(url: string): RenderResult {
  const helmetContext: { helmet?: HelmetServerState } = {};

  const html = renderToString(
    <HelmetProvider context={helmetContext}>
      <MemoryRouter initialEntries={[url]}>
        <LazyMotion features={domAnimation} strict>
          <Routes>
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
        </LazyMotion>
      </MemoryRouter>
    </HelmetProvider>
  );

  return {
    html,
    helmet: helmetContext.helmet!,
  };
}
