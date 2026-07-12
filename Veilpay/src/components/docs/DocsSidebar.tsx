import { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { docsGroups } from '../../generated/docsManifest.generated';
import { Menu, X } from 'lucide-react';
import ThemeToggle from '../ThemeToggle';

export function DocsSidebar() {
  const { pathname } = useLocation();
  const navRef = useRef<HTMLDivElement>(null);

  // Auto-scroll active item into view on mount/change
  useEffect(() => {
    if (!navRef.current) return;
    const activeEl = navRef.current.querySelector('[aria-current="page"]');
    if (activeEl) {
      activeEl.scrollIntoView({ block: 'nearest' });
    }
  }, [pathname]);

  return (
    <aside className="hidden lg:block w-64 xl:w-72 flex-shrink-0 border-r border-white/10 px-6 pb-20 overflow-y-auto custom-scrollbar h-[calc(100vh-8rem)] sticky top-32" ref={navRef}>
      <nav aria-label="Documentation Desktop Sidebar">
        {docsGroups.map((group, i) => (
          <div key={i} className="mb-8">
            <h4 className="text-sm font-semibold text-white/90 mb-3">{group.title}</h4>
            <ul className="space-y-2">
              {group.pages.map((page) => {
                const isActive = pathname === page.routePath;
                return (
                  <li key={page.id}>
                    <Link
                      to={page.routePath}
                      aria-current={isActive ? 'page' : undefined}
                      className={`block text-sm py-1 transition-colors ${
                        isActive ? 'text-amber-400 font-medium' : 'text-neutral-400 hover:text-white'
                      }`}
                    >
                      {page.title}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>
    </aside>
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
      // Native dialog showModal traps focus and makes background inert natively
      dialogRef.current?.showModal();
    } else {
      document.body.style.overflow = '';
      dialogRef.current?.close();
      // Restore focus to trigger
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
    setIsOpen(false);
  }, [pathname]);

  const closeDialog = () => setIsOpen(false);

  return (
    <div className="lg:hidden mb-6 px-6 md:px-12 w-full flex justify-between items-center">
      <button
        ref={triggerRef}
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 text-sm font-medium text-neutral-300 hover:text-white py-2"
        aria-expanded={isOpen}
        aria-controls="mobile-docs-nav"
      >
        <Menu className="w-5 h-5" />
        Documentation Menu
      </button>

      <dialog
        ref={dialogRef}
        id="mobile-docs-nav"
        className="m-0 h-full max-h-none w-full max-w-full bg-transparent p-0 text-white backdrop:bg-black/80 open:flex flex-col"
        onClose={closeDialog}
        onClick={(e) => {
          // Close if clicking on the backdrop area
          if (e.target === dialogRef.current) closeDialog();
        }}
      >
        <div className="w-full max-w-sm h-full bg-black/95 backdrop-blur-xl border-r border-white/10 flex flex-col">
          <div className="flex justify-between items-center p-6 border-b border-white/10">
            <span className="font-semibold">Veilpay Docs</span>
            <button
              onClick={closeDialog}
              className="p-2 -mr-2 text-neutral-400 hover:text-white rounded-full hover:bg-white/10 transition-colors"
              aria-label="Close menu"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto custom-scrollbar p-6 pb-24">
            <nav aria-label="Documentation Mobile Sidebar">
              {docsGroups.map((group, i) => (
                <div key={i} className="mb-8">
                  <h4 className="text-sm font-semibold text-white/90 mb-3">{group.title}</h4>
                  <ul className="space-y-2">
                    {group.pages.map((page) => {
                      const isActive = pathname === page.routePath;
                      return (
                        <li key={page.id}>
                          <Link
                            to={page.routePath}
                            aria-current={isActive ? 'page' : undefined}
                            className={`block text-sm py-1.5 transition-colors ${
                              isActive ? 'text-amber-400 font-medium' : 'text-neutral-400 hover:text-white'
                            }`}
                          >
                            {page.title}
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
        <ThemeToggle className="fixed bottom-6 right-4 z-[100] w-12 h-12 shadow-2xl" />
      </dialog>
    </div>
  );
}
