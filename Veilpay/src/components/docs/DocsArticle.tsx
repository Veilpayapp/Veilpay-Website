import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { DocsRenderer } from './DocsRenderer';
import { DocsPager } from './DocsPager';
import type { TocEntry } from '../../lib/docs/markdownParser';

interface DocsArticleProps {
  markdownContent: string;
  sourcePath: string; // Used for relative link resolution
  onTocExtracted?: (toc: TocEntry[]) => void;
}

export function DocsArticle({ markdownContent, sourcePath, onTocExtracted }: DocsArticleProps) {
  const location = useLocation();
  const articleRef = useRef<HTMLElement>(null);
  
  // Scroll Restoration logic based on React Router location state & navigation type
  useEffect(() => {
    const timer = setTimeout(() => {
      if (location.hash) {
        const id = location.hash.substring(1);
        const el = document.getElementById(id);
        if (el) {
          el.scrollIntoView({
            behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
            block: 'start'
          });
          return;
        }
      }
      
      if (!location.hash && articleRef.current) {
        if (typeof articleRef.current.scrollTo === 'function') {
          articleRef.current.scrollTo({ top: 0, behavior: 'auto' });
        } else {
          articleRef.current.scrollTop = 0;
        }
      }
    }, 50);

    return () => clearTimeout(timer);
  }, [location.pathname, location.hash]);

  return (
    <article 
      ref={articleRef}
      id="docs-content"
      className="flex-1 w-full min-w-0 h-full overflow-y-auto custom-scrollbar px-6 sm:px-8 lg:px-10 xl:px-12 py-6 lg:py-8 pb-32"
    >
      <div className="legal-prose max-w-3xl">
        <DocsRenderer markdownContent={markdownContent} sourcePath={sourcePath} onTocExtracted={onTocExtracted} />
      </div>
      
      <div className="max-w-3xl">
        <DocsPager />
      </div>
    </article>
  );
}
