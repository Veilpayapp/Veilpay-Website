import type { ReactNode } from 'react';
import { Helmet } from 'react-helmet-async';
import GlassNavbar from '../GlassNavbar';
import NoiseOverlay from '../NoiseOverlay';
import { isLowEnd, isMobileDevice } from '../../lib/deviceCapability';

import ScrollProgress from '../ScrollProgress';

interface DocsLayoutProps {
  children: ReactNode;
  title: string;
  canonicalUrl: string;
}

export default function DocsLayout({ children, title, canonicalUrl }: DocsLayoutProps) {
  const skipNoise = isLowEnd() || isMobileDevice();

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      <ScrollProgress />
      <Helmet>
        <title>{title} | Veilpay Docs</title>
        <link rel="canonical" href={`https://veilpayapp.com${canonicalUrl}`} />
      </Helmet>
      {!skipNoise && <NoiseOverlay />}
      <GlassNavbar />
      <div className="flex-1 w-full min-w-0 max-w-[1920px] mx-auto flex flex-col lg:flex-row pt-24 md:pt-32 relative">
        <a href="#docs-content" className="sr-only focus:not-sr-only focus:absolute focus:top-0 focus:left-0 focus:z-50 focus:p-4 focus:bg-amber-400 focus:text-black">
          Skip to content
        </a>
        {children}
      </div>
    </div>
  );
}
