import type { TocEntry } from '../../lib/docs/markdownParser';

interface DocsTocProps {
  toc: TocEntry[];
}

export function DocsToc({ toc }: DocsTocProps) {
  if (toc.length === 0) return null;

  return (
    <div className="hidden lg:block w-52 xl:w-64 flex-shrink-0 h-full">
      <aside 
        className="w-full h-full border-l border-white/10 overflow-y-auto custom-scrollbar py-6 px-4 select-none" 
        aria-label="Table of contents"
      >
        <h4 className="text-xs font-semibold text-white/90 uppercase tracking-wider mb-4 px-2.5">
          On this page
        </h4>
        <ul className="space-y-1">
          {toc.map((entry) => (
            <li
              key={entry.id}
              style={{ paddingLeft: `${Math.max(0, entry.level - 2) * 0.75}rem` }}
            >
              <a
                href={`#${entry.id}`}
                onClick={(e) => {
                  e.preventDefault();
                  const el = document.getElementById(entry.id);
                  if (el) {
                    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    window.history.pushState(null, '', window.location.pathname + `#${entry.id}`);
                  }
                }}
                className="block text-[13px] leading-snug py-1.5 px-2.5 rounded-lg text-neutral-400 hover:text-white transition-colors"
                dangerouslySetInnerHTML={{ __html: entry.text }}
              />
            </li>
          ))}
        </ul>
      </aside>
    </div>
  );
}

