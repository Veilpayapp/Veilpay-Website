import { useEffect, useState, useRef } from 'react';
import type { TocEntry } from '../../lib/docs/markdownParser';

interface DocsTocProps {
  toc: TocEntry[];
}

export function DocsToc({ toc }: DocsTocProps) {
  const [activeId, setActiveId] = useState<string>('');
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    // Disconnect old observer
    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    if (!toc.length) return;

    // Use setTimeout to ensure DOM is rendered with injected HTML
    const timer = setTimeout(() => {
      const headings = toc
        .map((t) => document.getElementById(t.id))
        .filter((el): el is HTMLElement => !!el);
        
      if (!headings.length) return;

      const observer = new IntersectionObserver(
        (entries) => {
          const visible = entries
            .filter((e) => e.isIntersecting)
            .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
            
          if (visible.length) {
            setActiveId(visible[0].target.id);
          }
        },
        { rootMargin: '-120px 0px -70% 0px', threshold: 0 }
      );
      
      headings.forEach((h) => observer.observe(h));
      observerRef.current = observer;
    }, 100);

    return () => {
      clearTimeout(timer);
      if (observerRef.current) observerRef.current.disconnect();
    };
  }, [toc]);

  if (toc.length === 0) return null;

  return (
    <aside className="hidden xl:block w-64 flex-shrink-0 pl-8 overflow-y-auto custom-scrollbar h-[calc(100vh-8rem)] sticky top-32" aria-label="Table of contents">
      <h4 className="text-xs font-semibold text-white/50 uppercase tracking-wider mb-4">On this page</h4>
      <ul className="space-y-2.5">
        {toc.map((entry) => (
          <li
            key={entry.id}
            style={{ paddingLeft: `${(entry.level - 2) * 0.75}rem` }}
          >
            <a
              href={`#${entry.id}`}
              className={`block text-sm transition-colors ${
                activeId === entry.id ? 'text-amber-400 font-medium' : 'text-neutral-400 hover:text-white'
              }`}
              dangerouslySetInnerHTML={{ __html: entry.text }}
            />
          </li>
        ))}
      </ul>
    </aside>
  );
}
