import { useLocation, Link } from 'react-router-dom';
import { getPrevNext } from '../../lib/docs/routeLookup';
import { ArrowLeft, ArrowRight } from 'lucide-react';

export function DocsPager() {
  const { pathname } = useLocation();
  const { prev, next } = getPrevNext(pathname);

  if (!prev && !next) return null;

  return (
    <div className="flex flex-col sm:flex-row gap-4 justify-between border-t border-white/10 pt-8 mt-16 w-full">
      {prev ? (
        <Link 
          to={prev.routePath} 
          className="flex-1 max-w-xs group flex flex-col gap-1 p-4 rounded-xl border border-white/10 hover:border-amber-400/40 bg-white/[0.03] hover:bg-white/[0.06] transition-all shadow-lg"
        >
          <span className="text-[10px] font-semibold text-neutral-400 group-hover:text-amber-400/90 uppercase tracking-widest flex items-center gap-1.5">
            <ArrowLeft className="w-3 h-3 group-hover:-translate-x-1 transition-transform" />
            Previous
          </span>
          <span className="text-sm font-semibold text-amber-400 group-hover:text-amber-300">
            {prev.title}
          </span>
        </Link>
      ) : <div className="flex-1" />}
      
      {next ? (
        <Link 
          to={next.routePath} 
          className="flex-1 max-w-xs group flex flex-col gap-1 items-end text-right p-4 rounded-xl border border-white/10 hover:border-amber-400/40 bg-white/[0.03] hover:bg-white/[0.06] transition-all shadow-lg ml-auto"
        >
          <span className="text-[10px] font-semibold text-neutral-400 group-hover:text-amber-400/90 uppercase tracking-widest flex items-center gap-1.5">
            Next
            <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
          </span>
          <span className="text-sm font-semibold text-amber-400 group-hover:text-amber-300">
            {next.title}
          </span>
        </Link>
      ) : <div className="flex-1" />}
    </div>
  );
}
