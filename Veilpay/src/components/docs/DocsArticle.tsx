import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { DocsRenderer } from './DocsRenderer';
import { DocsPager } from './DocsPager';

interface DocsArticleProps {
  markdownContent: string;
  sourcePath: string; // Used for relative link resolution
  onTocExtracted?: (toc: any[]) => void;
}

export function DocsArticle({ markdownContent, sourcePath, onTocExtracted }: DocsArticleProps) {
  const location = useLocation();
  const articleRef = useRef<HTMLElement>(null);
  
  // Scroll Restoration logic based on React Router location state & navigation type
  useEffect(() => {
    // Determine if it's a new hash on the same page, or a new page entirely.
    // The easiest way is to observe location.hash.
    
    // We defer the scroll slightly to allow the HTML injection to render.
    const timer = setTimeout(() => {
      if (location.hash) {
        const id = location.hash.substring(1);
        // Safely find the element
        const el = document.getElementById(id);
        if (el) {
          const y = el.getBoundingClientRect().top + window.scrollY - 100;
          window.scrollTo({
            top: y,
            behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth'
          });
          return;
        }
      }
      
      // If no hash, and we just navigated to a new page (not a POP/back-forward), scroll to top
      // If it is POP, the browser usually restores scroll natively.
      // We will scroll to top if there's no hash.
      if (!location.hash) {
        window.scrollTo({ top: 0, behavior: 'auto' });
      }
    }, 50);

    return () => clearTimeout(timer);
  }, [location.pathname, location.hash]);

  return (
    <article 
      ref={articleRef}
      id="docs-content"
      className="flex-1 w-full max-w-3xl min-w-0 lg:px-12 xl:px-16"
    >
      <div className="legal-prose rounded-3xl border border-white/10 bg-white/[0.03] p-6 md:p-12 shadow-[0_20px_60px_rgba(0,0,0,0.5)]">
        <DocsRenderer markdownContent={markdownContent} sourcePath={sourcePath} onTocExtracted={onTocExtracted} />
      </div>
      
      <div className="mt-12 mb-24">
        <DocsPager />
      </div>
    </article>
  );
}
