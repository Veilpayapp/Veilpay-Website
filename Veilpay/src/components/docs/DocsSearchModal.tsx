import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, ArrowRight, FileText } from 'lucide-react';
import { allPages, docsGroups } from '../../generated/docsManifest.generated';

interface DocsSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function DocsSearchModal({ isOpen, onClose }: DocsSearchModalProps) {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  // Focus input when opened. Search state is reset by closeModal so this effect
  // only synchronizes focus with the external dialog visibility.
  useEffect(() => {
    if (!isOpen) return;
    const timer = setTimeout(() => inputRef.current?.focus(), 50);
    return () => clearTimeout(timer);
  }, [isOpen]);

  // Global shortcut listeners
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        setQuery('');
        setSelectedIndex(0);
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Search filter
  const filteredPages = query.trim()
    ? allPages.filter((page) => {
        const q = query.toLowerCase();
        return (
          page.title.toLowerCase().includes(q) ||
          page.routePath.toLowerCase().includes(q) ||
          page.sourcePath.toLowerCase().includes(q)
        );
      }).slice(0, 8)
    : allPages.slice(0, 6);

  const closeModal = () => {
    setQuery('');
    setSelectedIndex(0);
    onClose();
  };

  const handleSelect = (routePath: string) => {
    navigate(routePath);
    closeModal();
  };

  const handleInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % Math.max(1, filteredPages.length));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + filteredPages.length) % Math.max(1, filteredPages.length));
    } else if (e.key === 'Enter' && filteredPages[selectedIndex]) {
      e.preventDefault();
      handleSelect(filteredPages[selectedIndex].routePath);
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-[120] flex items-start justify-center pt-[max(5rem,env(safe-area-inset-top))] pb-[max(1rem,env(safe-area-inset-bottom))] px-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div 
        className="w-full max-w-2xl max-h-[calc(100dvh-2rem)] min-h-0 bg-[#0d0d10] border border-white/15 rounded-2xl shadow-[0_25px_70px_rgba(0,0,0,0.85),0_0_50px_rgba(245,185,66,0.08)] overflow-hidden flex flex-col font-docs"
        role="dialog"
        aria-modal="true"
        aria-label="Search Documentation"
      >
        {/* Search Header */}
        <div className="flex items-center px-4 py-3.5 border-b border-white/10 gap-3">
          <Search className="w-5 h-5 text-amber-400 flex-shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleInputKeyDown}
            placeholder="Search Veilpay documentation, guides, APIs..."
            className="flex-1 bg-transparent text-white placeholder-neutral-500 text-sm md:text-base outline-none"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              aria-label="Clear documentation search"
              className="text-neutral-500 hover:text-neutral-300 p-1 min-w-11 min-h-11 flex items-center justify-center"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <kbd className="hidden sm:inline-block text-[11px] font-mono uppercase bg-white/10 text-neutral-400 px-2 py-0.5 rounded border border-white/10">
            ESC
          </kbd>
        </div>

        {/* Search Results */}
        <div className="p-3 min-h-0 flex-1 overflow-y-auto custom-scrollbar">
          {filteredPages.length === 0 ? (
            <div className="py-12 text-center text-neutral-400 text-sm">
              No results found for &ldquo;<span className="text-white">{query}</span>&rdquo;
            </div>
          ) : (
            <div className="space-y-1">
              <div className="px-3 py-1.5 font-heading text-[11px] font-semibold uppercase tracking-wider text-neutral-500">
                {query.trim() ? 'Search Results' : 'Suggested Pages'}
              </div>
              {filteredPages.map((page, index) => {
                const isSelected = index === selectedIndex;
                const parentGroup = docsGroups.find((g) =>
                  g.pages.some((p) => p.id === page.id)
                );

                return (
                  <button
                    key={page.id}
                    type="button"
                    onClick={() => handleSelect(page.routePath)}
                    onMouseEnter={() => setSelectedIndex(index)}
                    className={`w-full text-left flex items-center justify-between px-3.5 py-2.5 rounded-xl transition-all ${
                      isSelected
                        ? 'bg-amber-400/10 border border-amber-400/30 text-white'
                        : 'text-neutral-300 hover:bg-white/[0.04] border border-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`p-1.5 rounded-lg ${isSelected ? 'bg-amber-400/20 text-amber-400' : 'bg-white/5 text-neutral-400'}`}>
                        <FileText className="w-4 h-4" />
                      </div>
                      <div className="truncate">
                        <div className="text-sm font-heading font-medium text-white flex items-center gap-2">
                          <span className="truncate">{page.title}</span>
                          {isSelected && (
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shadow-[0_0_8px_#F5B942]" />
                          )}
                        </div>
                        {parentGroup && (
                          <div className="text-xs font-docs text-neutral-500 flex items-center gap-1 mt-0.5">
                            <span>{parentGroup.title}</span>
                            <span>•</span>
                            <span className="font-mono text-[11px] text-neutral-500">{page.routePath}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <ArrowRight className={`w-4 h-4 transition-transform flex-shrink-0 ${isSelected ? 'text-amber-400 translate-x-0.5' : 'text-neutral-600 opacity-0'}`} />
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer shortcuts hint */}
        <div className="px-4 py-2.5 bg-black/40 border-t border-white/10 flex items-center justify-between text-xs text-neutral-500">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-white/10 rounded border border-white/10 text-[10px]">↑</kbd>
              <kbd className="px-1.5 py-0.5 bg-white/10 rounded border border-white/10 text-[10px]">↓</kbd> to navigate
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-white/10 rounded border border-white/10 text-[10px]">↵</kbd> to select
            </span>
          </div>
          <span className="text-[11px] text-amber-400/80 font-medium">Veilpay Docs</span>
        </div>
      </div>
    </div>
  );
}
