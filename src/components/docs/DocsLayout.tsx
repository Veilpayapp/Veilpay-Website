import { useState, useEffect, type ReactNode } from 'react';
import { Helmet } from 'react-helmet-async';
import { Search, Aperture } from 'lucide-react';
import GlassNavbar from '../GlassNavbar';
import NoiseOverlay from '../NoiseOverlay';
import { isLowEnd, isMobileDevice } from '../../lib/deviceCapability';
import ScrollProgress from '../ScrollProgress';
import { DocsSearchModal } from './DocsSearchModal';

interface DocsLayoutProps {
  children: ReactNode;
  canonicalUrl: string;
  title?: string;
  description?: string;
  noindex?: boolean;
}

const DEFAULT_TITLE = 'Veilpay Docs';
const DEFAULT_DESCRIPTION =
  'Official documentation for Veilpay. Access guides, API references, and architecture details.';

export default function DocsLayout({
  children,
  canonicalUrl,
  title = DEFAULT_TITLE,
  description = DEFAULT_DESCRIPTION,
  noindex = false,
}: DocsLayoutProps) {
  const skipNoise = isLowEnd() || isMobileDevice();
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const docsPath = canonicalUrl.startsWith('/docs')
    ? canonicalUrl.slice(5) || '/'
    : canonicalUrl;
  const canonicalHref = `https://docs.veilpayapp.com${docsPath}`;

  // Keyboard shortcut (⌘K or /) to open search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsSearchOpen(true);
      } else if (e.key === '/' && !['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) {
        e.preventDefault();
        setIsSearchOpen(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="h-dvh max-h-dvh bg-[#060608] text-white flex flex-col relative z-10 overflow-hidden font-docs">
      {/* ── Continuous Single Ambient Gradient Passing Diagonally Through the Board ── */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden" aria-hidden="true">
        <div 
          className="absolute inset-0 w-full h-full"
          style={{ 
            background: `
              radial-gradient(ellipse 1300px 1000px at 75% 65%, rgba(245, 185, 66, 0.22) 0%, rgba(212, 160, 66, 0.11) 38%, rgba(245, 185, 66, 0.03) 60%, transparent 75%),
              radial-gradient(ellipse 1000px 450px at 60% 0%, rgba(245, 185, 66, 0.18) 0%, rgba(212, 160, 66, 0.06) 45%, transparent 70%)
            `
          }} 
        />
      </div>

      <ScrollProgress />

      <Helmet>
        <title>{title}</title>
        <meta name="description" content={description} />
        {noindex && <meta name="robots" content="noindex, follow" />}
        <link rel="canonical" href={canonicalHref} />
        <meta property="og:type" content="article" />
        <meta property="og:url" content={canonicalHref} />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:image" content="https://docs.veilpayapp.com/sharelink-docs.png" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta name="twitter:title" content={title} />
        <meta name="twitter:description" content={description} />
        <meta name="twitter:image" content="https://docs.veilpayapp.com/sharelink-docs.png" />
        <meta name="twitter:card" content="summary_large_image" />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "TechArticle",
            "headline": title,
            "description": description,
            "url": canonicalHref,
            "publisher": {
              "@type": "Organization",
              "name": "Veilpay"
            }
          })}
        </script>
      </Helmet>

      {!skipNoise && <NoiseOverlay />}
      <GlassNavbar />

      {/* Floating Glass Board Container */}
      <main className="flex-1 w-full max-w-[1560px] mx-auto px-2 sm:px-4 md:px-6 pt-20 md:pt-24 pb-[max(1rem,env(safe-area-inset-bottom))] relative z-10 flex flex-col min-h-0">
        <a
          href="#docs-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:p-3 focus:bg-amber-400 focus:text-black focus:rounded-lg font-bold"
        >
          Skip to content
        </a>
        <div
          className="w-full flex-1 min-h-0 rounded-2xl md:rounded-[24px] border border-white/20 overflow-hidden flex flex-col relative"
          style={{
            background: 'radial-gradient(130% 90% at 50% -25%, rgba(255, 255, 255, 0.20) 0%, rgba(255, 255, 255, 0) 55%), linear-gradient(135deg, rgba(255, 255, 255, 0.06) 0%, rgba(255, 255, 255, 0.01) 100%), rgba(10, 10, 14, 0.75)',
            backdropFilter: 'blur(18px) saturate(185%) brightness(1.03)',
            WebkitBackdropFilter: 'blur(18px) saturate(185%) brightness(1.03)',
            boxShadow: 'inset 0 1px 1px rgba(255, 255, 255, 0.45), inset 0 -1px 2px rgba(0, 0, 0, 0.5), inset -1px 0 2px rgba(255, 255, 255, 0.12), 0 20px 50px rgba(0, 0, 0, 0.7)'
          }}
        >
          {/* Card Header with Logo Badge + Search Button */}
          <header className="w-full h-14 md:h-16 border-b border-white/10 px-4 md:px-6 flex items-center justify-between gap-4 bg-white/[0.03] backdrop-blur-md flex-shrink-0 relative z-20">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-amber-400/10 border border-amber-400/30 flex items-center justify-center text-amber-400 shadow-[0_0_12px_rgba(245,185,66,0.25)]">
                <Aperture className="w-4 h-4" />
              </div>
              <span className="font-heading font-bold text-sm md:text-base tracking-tight text-white flex items-center gap-2">
                Veilpay <span className="text-neutral-400 font-normal hidden sm:inline">Docs</span>
              </span>
            </div>
            <div className="flex-1 max-w-md mx-auto">
              <button
                type="button"
                onClick={() => setIsSearchOpen(true)}
                className="font-docs w-full h-9 px-3 md:px-4 rounded-xl bg-white/[0.05] hover:bg-white/[0.08] border border-white/10 hover:border-amber-400/40 transition-all flex items-center gap-2 text-xs md:text-sm text-neutral-300 group cursor-pointer shadow-inner"
              >
                <Search className="w-3.5 h-3.5 md:w-4 md:h-4 text-neutral-400 group-hover:text-amber-400 transition-colors flex-shrink-0" />
                <span className="truncate">Search documentation...</span>
              </button>
            </div>
            <div className="w-24 hidden sm:block" />
          </header>

          {/* 3-Column Content Body */}
          <div className="flex-1 w-full min-w-0 flex flex-col lg:flex-row min-h-0 overflow-hidden relative z-10">
            {children}
          </div>
        </div>

        <DocsSearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
      </main>
    </div>
  );
}
