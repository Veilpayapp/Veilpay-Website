import { useEffect, useState } from 'react';
import { useLocation, Navigate, Link } from 'react-router-dom';
import DocsLayout from '../components/docs/DocsLayout';
import { DocsSidebar, DocsMobileNav } from '../components/docs/DocsSidebar';
import { DocsArticle } from '../components/docs/DocsArticle';
import { DocsToc } from '../components/docs/DocsToc';
import { getActivePage, getAliasRedirect } from '../lib/docs/routeLookup';
import { getLegacyRedirect } from '../lib/docs/legacyRedirects';
import type { TocEntry } from '../lib/docs/markdownParser';

// Eager load markdown files mapping
const markdownModules = import.meta.glob('../../veilpay-docs/**/*.md', { query: '?raw', import: 'default' });

export default function DocsPage() {
  const { pathname, hash } = useLocation();
  
  // 1. Handle Legacy Hash Redirects
  // e.g. /docs#stellar-private-payments
  if (pathname === '/docs' && hash) {
    const legacyDest = getLegacyRedirect(hash);
    if (legacyDest) {
      return <Navigate to={legacyDest} replace />;
    }
  }

  // 2. Handle Alias Redirects
  const aliasDest = getAliasRedirect(pathname);
  if (aliasDest) {
    return <Navigate to={aliasDest} replace />;
  }

  // 3. Resolve active canonical page
  const page = getActivePage(pathname);

  // 4. Loading state & Content
  const [markdownContent, setMarkdownContent] = useState<string | null>(null);
  const [loadError, setLoadError] = useState(false);
  const [toc, setToc] = useState<TocEntry[]>([]);

  useEffect(() => {
    if (!page) return;

    // Reset state on page change
    setLoadError(false);
    setMarkdownContent(null);
    setToc([]);

    // Find the right module function
    // Globs are relative to this file's dir: ../../veilpay-docs/...
    const globKey = `../../veilpay-docs/${page.sourcePath}`;
    const loadModule = markdownModules[globKey];

    if (!loadModule) {
      console.error(`[DocsPage] Could not find dynamic import for ${globKey}`);
      setLoadError(true);
      return;
    }

    loadModule()
      .then((mod) => {
        setMarkdownContent(mod as string);
      })
      .catch((err) => {
        console.error(`[DocsPage] Error loading markdown:`, err);
        setLoadError(true);
      });
  }, [page]);

  // 404 State
  if (!page) {
    return (
      <DocsLayout title="Not Found" canonicalUrl="/docs">
        <div className="flex flex-col items-center justify-center flex-1 py-32 px-6 text-center">
          <h1 className="text-4xl font-bold mb-4 text-white">Documentation Not Found</h1>
          <p className="text-neutral-400 max-w-md mb-8">
            The documentation page you are looking for does not exist or has been moved.
          </p>
          <Link to="/docs" className="bg-amber-400 text-black px-6 py-2 rounded-full font-medium hover:bg-amber-500 transition-colors">
            Return to Overview
          </Link>
        </div>
      </DocsLayout>
    );
  }

  return (
    <DocsLayout title={page.title} canonicalUrl={page.routePath}>
      <DocsSidebar />
      <DocsMobileNav />
      
      {loadError ? (
        <div className="flex-1 max-w-3xl px-6 py-12 text-center text-red-400">
          Failed to load documentation content. Please try refreshing the page.
        </div>
      ) : markdownContent ? (
        <div className="flex-1 flex justify-center w-full min-w-0 px-4 md:px-0">
          <div className="flex flex-col xl:flex-row w-full max-w-5xl justify-between min-w-0">
            <DocsArticle 
              markdownContent={markdownContent} 
              sourcePath={page.sourcePath} 
              onTocExtracted={setToc}
            />
            <DocsToc toc={toc} />
          </div>
        </div>
      ) : (
        <div className="flex-1 flex justify-center items-center max-w-3xl min-h-[50vh]">
          <div className="w-8 h-8 border-2 border-amber-400 border-t-transparent rounded-full animate-spin opacity-50" />
        </div>
      )}
    </DocsLayout>
  );
}
