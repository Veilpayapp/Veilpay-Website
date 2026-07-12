import { docsRegistry, allPages } from '../../generated/docsManifest.generated';
import type { DocsPageRecord } from './types';

export function getActivePage(pathname: string): DocsPageRecord | undefined {
  // Normalize pathname: remove trailing slash if present (except for /docs itself)
  let normalizedPath = pathname;
  if (normalizedPath !== '/docs' && normalizedPath.endsWith('/')) {
    normalizedPath = normalizedPath.slice(0, -1);
  }

  // 1. Check exact canonical match
  if (docsRegistry.routeToPage[normalizedPath]) {
    return docsRegistry.routeToPage[normalizedPath];
  }

  return undefined;
}

export function getAliasRedirect(pathname: string): string | undefined {
  let normalizedPath = pathname;
  if (normalizedPath !== '/docs' && normalizedPath.endsWith('/')) {
    normalizedPath = normalizedPath.slice(0, -1);
  }

  // Example: if they try to access /docs/getting-started/what-is-veilpay directly
  // we check if there's a source file that matches getting-started/what-is-veilpay.md
  // If so, redirect to its canonical route.
  
  if (normalizedPath.startsWith('/docs/')) {
    const potentialSourcePath = normalizedPath.replace('/docs/', '') + '.md';
    const page = docsRegistry.sourceToPage[potentialSourcePath];
    if (page && page.routePath !== normalizedPath) {
      return page.routePath;
    }
  }

  return undefined;
}

export function getPrevNext(pathname: string): { prev?: DocsPageRecord, next?: DocsPageRecord } {
  const page = getActivePage(pathname);
  if (!page) return {};
  
  const order = page.order;
  const prev = allPages.find(p => p.order === order - 1);
  const next = allPages.find(p => p.order === order + 1);
  
  return { prev, next };
}
