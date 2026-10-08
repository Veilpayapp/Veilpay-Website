import { allPages } from '../src/generated/docsManifest.generated';

interface BloggerEntry {
  title?: { $t?: string };
  link?: { rel?: string; href?: string }[];
}

interface BloggerFeed {
  feed?: {
    entry?: BloggerEntry[];
  };
}

export const STATIC_ROUTES = [
  '/',
  '/private-wallet',
  '/how-it-works',
  '/about',
  '/privacy',
  '/terms',
  '/docs',
  '/blogs',
  '/waitlist',
  '/features',
  '/contact',
];

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
}

export async function fetchDynamicRoutes(): Promise<string[]> {
  const dynamicRoutes: string[] = [];
  
  // Add Docs Routes
  for (const page of allPages) {
    if (page.routePath !== '/docs') {
      dynamicRoutes.push(page.routePath);
    }
  }

  // Fetch Blog Slugs
  try {
    const res = await fetch('https://veilpay.blogspot.com/feeds/posts/default?alt=json');
    if (res.ok) {
      const data = await res.json() as BloggerFeed;
      const entries = data.feed?.entry || [];
      for (const entry of entries) {
        const title = entry.title?.$t || '';
        const alternateLink = entry.link?.find((link) => link.rel === 'alternate')?.href;
        
        let slug = generateSlug(title);
        if (alternateLink) {
          const match = alternateLink.match(/\/([^/]+)\.html$/);
          if (match && match[1]) {
            slug = match[1];
          }
        }
        
        if (slug) {
          dynamicRoutes.push(`/blog/${slug}`);
        }
      }
    } else {
      console.error('[routes] Failed to fetch blogs:', res.statusText);
    }
  } catch (error) {
    console.error('[routes] Error fetching blog slugs:', error);
  }

  return dynamicRoutes;
}

export async function getAllRoutes(): Promise<string[]> {
  const dynamic = await fetchDynamicRoutes();
  return [...STATIC_ROUTES, ...dynamic];
}
