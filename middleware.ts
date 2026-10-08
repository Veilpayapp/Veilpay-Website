import { rewrite, next } from '@vercel/functions';

export const config = {
  // adjust the exclusion list to match actual static asset paths in this repo
  matcher: ['/((?!api|assets|.*\\..*).*)'],
};

const markdownRoutes = new Set([
  '/',
  '/about',
  '/contact',
  '/features',
  '/how-it-works',
  '/private-wallet',
  '/privacy',
  '/terms',
  '/blogs',
  '/waitlist',
]);

export default function middleware(request: Request) {
  const url = new URL(request.url);
  const hostname = (request.headers.get('host') || '').split(':')[0].toLowerCase();

  if (hostname !== 'docs.veilpayapp.com') {
    const acceptsMarkdown = request.headers.get('accept')?.includes('text/markdown');
    if (acceptsMarkdown && !markdownRoutes.has(url.pathname)) {
      return new Response(
        '# 404 Not Found\n\nThe requested page could not be found. See https://veilpayapp.com/openapi.json and https://veilpayapp.com/llms.txt for site resources.\n',
        {
          status: 404,
          headers: {
            'Content-Type': 'text/markdown; charset=utf-8',
            Vary: 'Accept',
          },
        },
      );
    }
    return next();
  }

  if (url.pathname.startsWith('/docs')) {
    return next(); // already correct, don't double-prefix
  }

  const rewrittenPath = url.pathname === '/' ? '/docs' : `/docs${url.pathname}`;
  return rewrite(new URL(rewrittenPath, request.url));
}
