import { useMemo } from 'react';
import { useLocation, Navigate } from 'react-router-dom';
import DocsLayout from '../components/docs/DocsLayout';
import { DocsSidebar, DocsMobileNav } from '../components/docs/DocsSidebar';
import { DocsArticle } from '../components/docs/DocsArticle';
import { DocsToc } from '../components/docs/DocsToc';
import { getActivePage, getAliasRedirect } from '../lib/docs/routeLookup';
import { getLegacyRedirect } from '../lib/docs/legacyRedirects';
import { parseMarkdown } from '../lib/docs/markdownParser';

// Eager load markdown files mapping
const markdownModules = import.meta.glob('../../veilpay-docs/**/*.md', { query: '?raw', import: 'default', eager: true }) as Record<string, string>;

function extractDescription(markdown: string | null | undefined, fallbackTitle: string): string {
  if (!markdown) {
    return `${fallbackTitle} — Veilpay technical documentation.`;
  }

  const body = markdown
    .replace(/^---[\s\S]*?---\s*/, '')        // frontmatter
    .replace(/```[\s\S]*?```/g, '')           // fenced code
    .replace(/<[^>]+>/g, '');                 // inline HTML

  for (const rawBlock of body.split(/\n\s*\n/)) {
    const block = rawBlock.trim();
    if (!block) continue;
    if (block.startsWith('#')) continue;       // headings
    if (/^[>|\-*+]|^\d+\./.test(block)) continue; // quotes, lists, tables

    const text = block
      .replace(/!\[[^\]]*\]\([^)]*\)/g, '')            // images
      .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')          // links -> text
      .replace(/[*_`]/g, '')
      .replace(/\s+/g, ' ')
      .trim();

    if (text.length < 40) continue;
    return text.length > 155 ? `${text.slice(0, 152).trimEnd()}...` : text;
  }

  return `${fallbackTitle} — Veilpay technical documentation.`;
}

export default function DocsPage() {
  const location = useLocation();
  const isDocsSubdomain = typeof window !== 'undefined' && window.location.hostname.includes('docs.');
  let pathname = location.pathname;
  if (isDocsSubdomain && !pathname.startsWith('/docs')) {
    pathname = pathname === '/' ? '/docs' : `/docs${pathname}`;
  }
  const hash = location.hash;
  // 1. Resolve active canonical page
  const page = getActivePage(pathname);
  const globKey = page ? `../../veilpay-docs/${page.sourcePath}` : '';
  const initialContent = page && globKey in markdownModules ? markdownModules[globKey] : null;

  // 2. Content is eagerly bundled, so it is available during both SSR and hydration.
  const currentMarkdown = initialContent;
  const currentLoadError = Boolean(page && !currentMarkdown);

  // Derive TOC synchronously from currentMarkdown — always populated when markdown exists!
  const toc = useMemo(() => {
    if (!currentMarkdown || !page) return [];
    return parseMarkdown(currentMarkdown, page.sourcePath).toc;
  }, [currentMarkdown, page]);

  // 3. Handle Legacy Hash Redirects
  // e.g. /docs#stellar-private-payments
  if (pathname === '/docs' && hash) {
    const legacyDest = getLegacyRedirect(hash);
    if (legacyDest) {
      return <Navigate to={legacyDest} replace />;
    }
  }

  // 4. Handle Alias Redirects
  const aliasDest = getAliasRedirect(pathname);
  if (aliasDest) {
    return <Navigate to={aliasDest} replace />;
  }

  // 404 State
  if (!page) {
    return (
      <DocsLayout
        canonicalUrl="/docs"
        title="Documentation Not Found | Veilpay Docs"
        description="The requested Veilpay documentation page does not exist or has been moved."
        noindex
      >
        <div className="flex flex-col items-center justify-center flex-1 py-32 px-6 text-center">
          <h1 className="text-4xl font-bold mb-4 text-white">Documentation Not Found</h1>
          <p className="text-neutral-400 max-w-md mb-8">
            The documentation page you are looking for does not exist or has been moved.
          </p>
          <a href="https://docs.veilpayapp.com" className="bg-amber-400 text-black px-6 py-2 rounded-full font-medium hover:bg-amber-500 transition-colors">
            Return to Overview
          </a>
        </div>
      </DocsLayout>
    );
  }

  return (
    <DocsLayout
      canonicalUrl={page.routePath}
      title={page.routePath === '/docs' ? 'Veilpay Docs' : `${page.title} | Veilpay Docs`}
      description={extractDescription(currentMarkdown, page.title)}
    >
      <div className="w-full h-full flex flex-col lg:flex-row min-w-0 flex-1 overflow-hidden">
        <DocsMobileNav />
        <DocsSidebar />
        
        {currentLoadError ? (
          <div className="flex-1 max-w-3xl px-6 py-12 text-center text-red-400">
            Failed to load documentation content. Please try refreshing the page.
          </div>
        ) : currentMarkdown ? (
          <div className="flex-1 flex flex-col md:flex-row min-w-0 justify-between h-full overflow-hidden">
            <DocsArticle 
              markdownContent={currentMarkdown} 
              sourcePath={page.sourcePath} 
            />
            <DocsToc toc={toc} />
          </div>
        ) : (
          <div className="flex-1 flex justify-center items-center w-full min-h-[50vh]">
            <div className="v-loader scale-75 opacity-80">
              <div className="node" />
              <div className="node" />
              <div className="node" />
              <div className="node" />
              <div className="node" />
            </div>
          </div>
        )}
      </div>
    </DocsLayout>
  );
}
