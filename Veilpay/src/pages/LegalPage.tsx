import { useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { marked } from 'marked';
import GlassNavbar from '../components/GlassNavbar';
import NoiseOverlay from '../components/NoiseOverlay';
// Legal copy lives as markdown at the repo root; imported raw and rendered.
import aboutMd from '../../about-us.md?raw';
import privacyMd from '../../privacy-policy.md?raw';
import termsMd from '../../terms-of-service.md?raw';

type DocKey = 'about' | 'privacy' | 'terms';

const DOCS: Record<DocKey, { title: string; description: string; source: string }> = {
  about: {
    title: 'About Us — Veilpay',
    description:
      'Veilpay is a non-custodial, multi-chain payments app that makes private crypto payments practical for everyday use.',
    source: aboutMd,
  },
  privacy: {
    title: 'Privacy Policy — Veilpay',
    description: 'How Veilpay collects, uses, and protects your information.',
    source: privacyMd,
  },
  terms: {
    title: 'Terms of Service — Veilpay',
    description: 'The terms that govern your use of Veilpay.',
    source: termsMd,
  },
};

export default function LegalPage({ doc }: { doc: DocKey }) {
  const { title, description, source } = DOCS[doc];
  const html = useMemo(() => marked.parse(source, { async: false }), [source]);

  // New route = start at the top.
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [doc]);

  return (
    <div className="min-h-screen bg-black text-white">
      {/* React 19 hoists these into <head> for per-page SEO. */}
      <title>{title}</title>
      <meta name="description" content={description} />

      <NoiseOverlay />
      <GlassNavbar />

      <main className="mx-auto max-w-3xl px-5 pt-32 pb-24">
        <article
          className="legal-prose rounded-3xl border border-white/10 bg-white/[0.03] p-6 md:p-12 shadow-[0_20px_60px_rgba(0,0,0,0.5)]"
          dangerouslySetInnerHTML={{ __html: html }}
        />

        <nav className="mt-10 flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-xs text-neutral-500">
          <Link to="/" className="hover:text-amber-400 transition-colors">Home</Link>
          <Link to="/about" className="hover:text-amber-400 transition-colors">About</Link>
          <Link to="/privacy" className="hover:text-amber-400 transition-colors">Privacy</Link>
          <Link to="/terms" className="hover:text-amber-400 transition-colors">Terms</Link>
          <span className="text-neutral-600">© 2026 Veilpay</span>
        </nav>
      </main>
    </div>
  );
}
