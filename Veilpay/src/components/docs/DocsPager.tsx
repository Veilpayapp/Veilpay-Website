import { useLocation, Link } from 'react-router-dom';
import { getPrevNext } from '../../lib/docs/routeLookup';
import { ArrowLeft, ArrowRight } from 'lucide-react';

export function DocsPager() {
  const { pathname } = useLocation();
  const { prev, next } = getPrevNext(pathname);

  if (!prev && !next) return null;

  return (
    <div className="flex flex-col sm:flex-row gap-4 justify-between border-t border-white/10 pt-8 mt-16">
      {prev ? (
        <Link 
          to={prev.routePath} 
          className="flex-1 group flex flex-col gap-1 p-4 rounded-2xl border border-white/5 hover:border-white/20 bg-white/[0.02] hover:bg-white/[0.04] transition-all"
        >
          <span className="text-xs text-neutral-500 uppercase tracking-wider flex items-center gap-2">
            <ArrowLeft className="w-3 h-3 group-hover:-translate-x-1 transition-transform" />
            Previous
          </span>
          <span className="text-sm font-medium text-amber-400 group-hover:text-amber-300">
            {prev.title}
          </span>
        </Link>
      ) : <div className="flex-1" />}
      
      {next ? (
        <Link 
          to={next.routePath} 
          className="flex-1 group flex flex-col gap-1 items-end text-right p-4 rounded-2xl border border-white/5 hover:border-white/20 bg-white/[0.02] hover:bg-white/[0.04] transition-all"
        >
          <span className="text-xs text-neutral-500 uppercase tracking-wider flex items-center gap-2">
            Next
            <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
          </span>
          <span className="text-sm font-medium text-amber-400 group-hover:text-amber-300">
            {next.title}
          </span>
        </Link>
      ) : <div className="flex-1" />}
    </div>
  );
}
