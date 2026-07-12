import { useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { parseMarkdown } from '../../lib/docs/markdownParser';

interface DocsRendererProps {
  markdownContent: string;
  sourcePath: string;
  onTocExtracted?: (toc: any[]) => void;
}

export function DocsRenderer({ markdownContent, sourcePath, onTocExtracted }: DocsRendererProps) {
  const navigate = useNavigate();

  // Parse markdown and sanitize HTML safely. Memoize based on content.
  const { html, toc } = useMemo(() => {
    return parseMarkdown(markdownContent, sourcePath);
  }, [markdownContent, sourcePath]);

  // Report TOC upwards if requested safely
  useEffect(() => {
    if (onTocExtracted) {
      onTocExtracted(toc);
    }
  }, [toc, onTocExtracted]);

  // Event Delegation for internal links
  const handleClick = (event: React.MouseEvent<HTMLDivElement>) => {
    const target = event.target as HTMLElement;
    const anchor = target.closest('a');
    if (!anchor) return;

    if (
      event.defaultPrevented ||
      event.button !== 0 || // non-primary click
      event.metaKey || 
      event.ctrlKey || 
      event.shiftKey || 
      event.altKey ||
      anchor.hasAttribute('download') ||
      (anchor.target && anchor.target !== '_self')
    ) {
      return;
    }

    const href = anchor.getAttribute('href');
    if (!href) return;

    // Check if it's an internal route that we should handle with SPA router
    if (href.startsWith('/docs')) {
      event.preventDefault();
      // Handle same page hash navigation if path matches exactly but hash differs
      const [path, hash] = href.split('#');
      if (path === window.location.pathname && hash) {
        // Just update hash
        navigate(href, { replace: true }); // replacing history to avoid deep stack, or let router handle it
      } else {
        navigate(href);
      }
    } else if (href.startsWith('#')) {
      // Same-page fragment
      event.preventDefault();
      navigate(window.location.pathname + href, { replace: true });
    }
  };

  return (
    <div 
      className="markdown-body" 
      onClick={handleClick}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
