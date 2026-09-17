import { rewrite, next } from '@vercel/functions';

export const config = {
  // adjust the exclusion list to match actual static asset paths in this repo
  matcher: ['/((?!api|assets|.*\\..*).*)'],
};

export default function middleware(request: Request) {
  const url = new URL(request.url);
  const hostname = request.headers.get('host') || '';

  if (!hostname.startsWith('docs.veilpayapp.com')) {
    return next();
  }

  if (url.pathname.startsWith('/docs')) {
    return next(); // already correct, don't double-prefix
  }

  const rewrittenPath = url.pathname === '/' ? '/docs' : `/docs${url.pathname}`;
  return rewrite(new URL(rewrittenPath, request.url));
}
