import { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { docsGroups } from '../../generated/docsManifest.generated';
import { 
  Compass, 
  Network, 
  Layers, 
  Smartphone, 
  Code2, 
  Globe, 
  Lock, 
  ShieldCheck, 
  Milestone, 
  BookOpen, 
  Menu, 
  X 
} from 'lucide-react';
import ThemeToggle from '../ThemeToggle';

function getGroupIcon(title: string) {
  switch (title.toLowerCase()) {
    case 'start here':
      return <Compass className="w-3.5 h-3.5 text-amber-400/80 flex-shrink-0" />;
    case 'protocol':
      return <Network className="w-3.5 h-3.5 text-amber-400/80 flex-shrink-0" />;
    case 'architecture':
      return <Layers className="w-3.5 h-3.5 text-amber-400/80 flex-shrink-0" />;
    case 'consumer app':
      return <Smartphone className="w-3.5 h-3.5 text-amber-400/80 flex-shrink-0" />;
    case 'merchant api':
      return <Code2 className="w-3.5 h-3.5 text-amber-400/80 flex-shrink-0" />;
    case 'chains':
      return <Globe className="w-3.5 h-3.5 text-amber-400/80 flex-shrink-0" />;
    case 'privacy':
      return <Lock className="w-3.5 h-3.5 text-amber-400/80 flex-shrink-0" />;
    case 'security':
      return <ShieldCheck className="w-3.5 h-3.5 text-amber-400/80 flex-shrink-0" />;
    case 'roadmap':
      return <Milestone className="w-3.5 h-3.5 text-amber-400/80 flex-shrink-0" />;
    case 'reference':
    default:
      return <BookOpen className="w-3.5 h-3.5 text-amber-400/80 flex-shrink-0" />;
  }
}

export function DocsSidebar() {
  const { pathname } = useLocation();
  const navRef = useRef<HTMLElement>(null);

  // Auto-scroll active item into view on mount/change
  useEffect(() => {
    if (!navRef.current) return;
    const activeEl = navRef.current.querySelector('[aria-current="page"]');
    if (activeEl) {
      activeEl.scrollIntoView({ block: 'nearest' });
    }
  }, [pathname]);

  return (
    <div className="hidden lg:block flex-shrink-0 h-full">
      <aside 
        ref={navRef}
        className="w-full lg:w-64 xl:w-72 flex-shrink-0 border-r border-white/10 h-full overflow-y-auto custom-scrollbar px-4 lg:px-5 py-6 select-none" 
        aria-label="Documentation Sidebar"
      >
        <nav className="space-y-6" aria-label="Docs Navigation">
          {docsGroups.map((group, i) => (
            <div key={i} className="space-y-1">
              <div className="flex items-center gap-2 font-heading text-[11px] font-semibold uppercase tracking-wider text-neutral-400/90 px-2.5 py-1.5">
                {getGroupIcon(group.title)}
                <span className="truncate">{group.title}</span>
              </div>
              <ul className="space-y-0.5">
                {group.pages.map((page) => {
                  const isActive = pathname === page.routePath;
                  return (
                    <li key={page.id}>
                      <Link
                        to={page.routePath}
                        aria-current={isActive ? 'page' : undefined}
                        className={`group flex items-center font-docs text-[11px] uppercase tracking-wider leading-snug py-1.5 px-2.5 rounded-lg transition-all ${
                          isActive
                            ? 'text-amber-400 bg-amber-400/10 font-semibold shadow-[0_0_12px_rgba(245,185,66,0.08)]'
                            : 'text-neutral-400 hover:text-neutral-200 hover:bg-white/[0.04] font-medium'
                        }`}
                      >
                        <span 
                          className={`w-1.5 h-1.5 rounded-full mr-2.5 flex-shrink-0 ${
                            isActive 
                              ? 'bg-amber-400 shadow-[0_0_8px_#F5B942]' 
                              : 'bg-transparent'
                          }`} 
                        />
                        <span className="truncate">{page.title}</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>
      </aside>
    </div>
  );
}

export function DocsMobileNav() {
  const { pathname } = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      if (typeof dialogRef.current?.showModal === 'function') {
        dialogRef.current.showModal();
      }
    } else {
      document.body.style.overflow = '';
      if (typeof dialogRef.current?.close === 'function') {
        dialogRef.current.close();
      }
      if (document.activeElement === document.body) {
        triggerRef.current?.focus();
      }
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Close on route change
  useEffect(() => {
    requestAnimationFrame(() => setIsOpen(false));
  }, [pathname]);

  const closeDialog = () => setIsOpen(false);

  return (
    <div className="lg:hidden w-full flex justify-between items-center px-4 py-3 border-b border-white/10 bg-black/40">
      <button
        ref={triggerRef}
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-neutral-300 hover:text-white px-3 py-1.5 min-h-11 rounded-lg bg-white/5 border border-white/10"
        aria-expanded={isOpen}
        aria-controls="mobile-docs-nav"
      >
        <Menu className="w-4 h-4 text-amber-400" />
        Navigation Menu
      </button>

      <dialog
        ref={dialogRef}
        id="mobile-docs-nav"
        className="m-0 h-full max-h-none w-full max-w-full bg-transparent p-0 text-white backdrop:bg-black/80 open:flex flex-col z-[150]"
        onClose={closeDialog}
        onClick={(e) => {
          if (e.target === dialogRef.current) closeDialog();
        }}
      >
        <div className="w-full max-w-xs sm:max-w-sm h-full bg-[#0a0a0c] border-r border-white/10 flex flex-col pt-[max(1.25rem,env(safe-area-inset-top))]">
          <div className="flex justify-between items-center p-5 border-b border-white/10">
            <span className="font-bold text-sm uppercase tracking-wider text-amber-400">Veilpay Docs</span>
            <button
              onClick={closeDialog}
              className="p-1.5 min-w-11 min-h-11 flex items-center justify-center text-neutral-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
              aria-label="Close menu"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto custom-scrollbar px-4 pt-4 pb-[max(1rem,env(safe-area-inset-bottom))] space-y-6">
            <nav aria-label="Documentation Mobile Sidebar">
              {docsGroups.map((group, i) => (
                <div key={i} className="mb-6">
                  <div className="flex items-center gap-2 font-heading text-[11px] font-semibold uppercase tracking-wider text-neutral-400/90 mb-2 px-2">
                    {getGroupIcon(group.title)}
                    <span>{group.title}</span>
                  </div>
                  <ul className="space-y-1">
                    {group.pages.map((page) => {
                      const isActive = pathname === page.routePath;
                      return (
                        <li key={page.id}>
                          <Link
                            to={page.routePath}
                            aria-current={isActive ? 'page' : undefined}
                            className={`flex items-center font-docs text-[12px] uppercase tracking-wider leading-snug py-2 px-2.5 rounded-lg transition-colors ${
                              isActive ? 'text-amber-400 bg-amber-400/10 font-semibold' : 'text-neutral-400 hover:text-neutral-200 font-medium'
                            }`}
                          >
                            <span 
                              className={`w-1.5 h-1.5 rounded-full mr-2.5 flex-shrink-0 ${
                                isActive ? 'bg-amber-400 shadow-[0_0_8px_#F5B942]' : 'bg-transparent'
                              }`} 
                            />
                            <span className="truncate">{page.title}</span>
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ))}
            </nav>
          </div>
        </div>
        
        {/* Floating Theme Toggle locked on top of the dialog backdrop */}
        <ThemeToggle className="fixed bottom-6 right-4 z-[160] w-12 h-12 shadow-2xl" />
      </dialog>
    </div>
  );
}
