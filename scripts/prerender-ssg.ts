/**
 * Build-time SSG pre-renderer — replaces the Puppeteer-based prerender.ts.
 *
 * 1. Runs `vite build --ssr` to compile entry-server.tsx into a Node-compatible module
 * 2. Imports the compiled module and calls render(url) for each route
 * 3. Injects the rendered HTML + Helmet head tags into the client-built index.html
 * 4. Writes per-route HTML files to dist/
 * 5. Runs the audit to verify all routes have real content
 */
import { build } from 'vite';
import { readFileSync, writeFileSync, mkdirSync, existsSync, rmSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import type { BlogPost } from '../src/lib/blog';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = join(__dirname, '..');
const DIST = join(PROJECT_ROOT, 'dist');
const SSR_OUT = join(PROJECT_ROOT, '.ssr-temp');

import { getAllRoutes } from './routes';

interface BloggerLink {
  rel?: string;
  href?: string;
}

interface BloggerCategory {
  term?: string;
}

interface BloggerEntry {
  id?: { $t?: string };
  title?: { $t?: string };
  content?: { $t?: string };
  summary?: { $t?: string };
  published?: { $t?: string };
  link?: BloggerLink[];
  category?: BloggerCategory[];
}

interface BloggerFeed {
  feed?: {
    entry?: BloggerEntry[];
  };
}

async function prerenderSSG() {
  console.log('[SSG] Building SSR bundle...');

  // Step 1: Build SSR bundle
  await build({
    root: PROJECT_ROOT,
    build: {
      ssr: true,
      outDir: SSR_OUT,
      rollupOptions: {
        input: join(PROJECT_ROOT, 'src/entry-server.tsx'),
      },
      // Don't empty outDir on each build to avoid race with client build
      emptyOutDir: true,
    },
    // Silence most output
    logLevel: 'warn',
  });

  console.log('[SSG] SSR bundle built. Loading module...');

  // Step 2: Load the SSR module (Windows requires file:// URL for ESM import)
  const { pathToFileURL } = await import('url');
  const ssrModuleUrl = pathToFileURL(join(SSR_OUT, 'entry-server.js')).href;
  const ssrModule = await import(ssrModuleUrl);
  const { render } = ssrModule;

  // Step 3: Read the client-built index.html as template
  const templatePath = join(DIST, 'index.html');
  if (!existsSync(templatePath)) {
    throw new Error(`Client build output not found at ${templatePath}. Run 'vite build' first.`);
  }
  const template = readFileSync(templatePath, 'utf-8');

  let rendered = 0;
  const errors: string[] = [];

  const ROUTES = await getAllRoutes();
  
  // We'll collect successful routes for the sitemap
  const sitemapRoutes: { route: string; priority: string; changefreq: string; lastmod: string }[] = [];

  // Fetch blog data for SSR
  console.log('[SSG] Fetching blog data for SSR...');
  try {
    const res = await fetch('https://veilpay.blogspot.com/feeds/posts/default?alt=json');
    if (res.ok) {
      const data = await res.json() as BloggerFeed;
      const entries = data.feed?.entry || [];
      const parsedPosts: BlogPost[] = entries.map((entry) => {
        const title = entry.title?.$t || '';
        const content = entry.content ? entry.content.$t : (entry.summary ? entry.summary.$t : '');
        // Simple HTML strip for SSR
        const textContent = content.replace(/<[^>]+>/g, '');
        const excerpt = textContent.length > 200 ? textContent.substring(0, 200).trim() + '...' : textContent;
        
        const wordCount = textContent.split(/\s+/).length;
        const readTime = `${Math.ceil(wordCount / 200)} MIN READ`;
        
        const alternateLink = entry.link?.find((link) => link.rel === 'alternate')?.href;
        let slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
        if (alternateLink) {
          const match = alternateLink.match(/\/([^/]+)\.html$/);
          if (match && match[1]) slug = match[1];
        }
        
        const tags = entry.category?.map((category) => category.term || '').filter(Boolean) || [];
        
        return {
          id: entry.id?.$t || slug,
          slug,
          title,
          excerpt,
          content,
          published: new Date(entry.published?.$t || '').toLocaleDateString('en-US', {
            year: 'numeric', month: 'long', day: 'numeric'
          }).toUpperCase(),
          readTime,
          tags,
          url: alternateLink || '#'
        };
      });
      (globalThis as typeof globalThis & { __BLOG_POSTS__?: BlogPost[] }).__BLOG_POSTS__ = parsedPosts;
    }
  } catch (err) {
    console.error('[SSG] Error fetching blog data:', err);
  }

  for (const route of ROUTES) {
    try {
      console.log(`[SSG] Rendering ${route}...`);
      const { html: appHtml, helmet } = render(route);

      // Step 4: Inject rendered HTML + Helmet tags into template
      let page = template;

      // Extract inline Helmet tags from appHtml to prevent duplicate tags in body
      let appHtmlClean = appHtml;
      const inlineHelmetMatch = appHtmlClean.match(/^([\s\S]*?)(<!--\$-->|<div class="min-h-screen|<div class="v-boot|<div class="scroll-progress|<svg )/);
      if (inlineHelmetMatch && inlineHelmetMatch[1]) {
         const potentialTags = inlineHelmetMatch[1];
         if (potentialTags.includes('<title>') || potentialTags.includes('<meta') || potentialTags.includes('<link')) {
             // Remove inline tags from appHtml
             appHtmlClean = appHtmlClean.replace(potentialTags, '');
         }
      }

      // Replace the content inside <div id="root">...</div>
      // The template has: <div id="root"><div class="v-boot">...</div><noscript>...</noscript></div>
      page = page.replace(
        /(<div id="root">)[\s\S]*?(<\/div>\s*(?:<!--|<svg))/,
        `$1${appHtmlClean}$2`
      );

      // Force correct Canonical URL
      let canonicalUrl = `https://veilpayapp.com${route === '/' ? '' : route}`;
      if (route.startsWith('/docs')) {
        canonicalUrl = `https://docs.veilpayapp.com${route === '/docs' ? '' : route.slice(5)}`;
      }
      
      page = page.replace(
        /<link\s+rel="canonical"\s+href="[^"]*"\s*\/?>/,
        `<link rel="canonical" href="${canonicalUrl}" />`
      );

      // Inject Helmet head tags — replace the static homepage metadata
      if (helmet) {
        // Replace <title>...</title>
        const helmetTitle = helmet.title?.toString() || '';
        if (helmetTitle) {
          page = page.replace(/<title>[^<]*<\/title>/, helmetTitle);
        }

        // We already forced the canonical URL above, so we can skip helmet.link replacement

        // Replace meta description
        const helmetMeta = helmet.meta?.toString() || '';
        if (helmetMeta) {
          // Replace description
          const descMatch = helmetMeta.match(/<meta[^>]*name="description"[^>]*>/);
          if (descMatch) {
            page = page.replace(
              /<meta\s+name="description"\s+content="[^"]*"\s*\/?>/,
              descMatch[0]
            );
          }

          // Replace OG tags
          const ogTags = helmetMeta.match(/<meta[^>]*property="og:[^"]*"[^>]*>/g) || [];
          for (const ogTag of ogTags) {
            const propMatch = ogTag.match(/property="(og:[^"]+)"/);
            if (propMatch) {
              const prop = propMatch[1];
              const regex = new RegExp(`<meta\\s+property="${prop.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}"\\s+content="[^"]*"\\s*\\/?>`);
              if (regex.test(page)) {
                page = page.replace(regex, ogTag);
              }
            }
          }

          // Replace Twitter tags
          const twitterTags = helmetMeta.match(/<meta[^>]*name="twitter:[^"]*"[^>]*>/g) || [];
          for (const twTag of twitterTags) {
            const nameMatch = twTag.match(/name="(twitter:[^"]+)"/);
            if (nameMatch) {
              const name = nameMatch[1];
              const regex = new RegExp(`<meta\\s+name="${name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}"\\s+content="[^"]*"\\s*\\/?>`);
              if (regex.test(page)) {
                page = page.replace(regex, twTag);
              }
            }
          }
        }

        // Inject JSON-LD scripts (append before </head>)
        const helmetScript = helmet.script?.toString() || '';
        if (helmetScript) {
          page = page.replace('</head>', `${helmetScript}\n  </head>`);
        }
      }

      // Fallback manual replacement for /docs pages due to CSR/Helmet limitations
      if (route.startsWith('/docs')) {
        page = page.replace(/og\.jpg/g, 'sharelink-docs.png');
      }

      // Step 5: Write to dist/<route>/index.html
      const outputDir = route === '/' ? DIST : join(DIST, route);
      const outputFile = join(outputDir, 'index.html');

      if (route !== '/') {
        mkdirSync(outputDir, { recursive: true });
      }

      writeFileSync(outputFile, page, 'utf-8');
      rendered++;
      
      // Add to sitemap data
      let priority = '0.9';
      let changefreq = 'weekly';
      if (route === '/') priority = '1.0';
      else if (route === '/docs' || route === '/blogs') { priority = '0.95'; changefreq = 'daily'; }
      else if (route.startsWith('/docs')) { priority = '0.9'; changefreq = 'weekly'; }
      else if (route.startsWith('/blog')) { priority = '0.8'; changefreq = 'weekly'; }
      else if (['/about', '/contact', '/waitlist', '/features'].includes(route)) { priority = '0.9'; changefreq = 'monthly'; }
      else if (['/privacy', '/terms'].includes(route)) { priority = '0.4'; changefreq = 'yearly'; }

      sitemapRoutes.push({
        route,
        priority,
        changefreq,
        lastmod: new Date().toISOString().split('T')[0] // YYYY-MM-DD
      });

      console.log(`[SSG] ✓ ${route} → ${outputFile.replace(PROJECT_ROOT, '')}`);
    } catch (err) {
      const msg = `[SSG] ✗ ${route} — ${err}`;
      console.error(msg);
      errors.push(msg);
    }
  }

  // Cleanup SSR temp directory
  try {
    rmSync(SSR_OUT, { recursive: true, force: true });
  } catch {
    // non-critical
  }

  console.log(`\n[SSG] Pre-rendered ${rendered}/${ROUTES.length} routes.`);

  if (errors.length > 0) {
    console.error(`\n[SSG] ${errors.length} route(s) failed:`);
    errors.forEach(e => console.error(`  ${e}`));
    process.exit(1);
  }

  // Generate sitemap.xml
  console.log('[SSG] Generating sitemap.xml...');
  const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemapRoutes.map(({ route, priority, changefreq, lastmod }) => {
    // Map docs routes to docs.veilpayapp.com domain
    const loc = route.startsWith('/docs')
      ? `https://docs.veilpayapp.com${route === '/docs' ? '/' : route.slice(5)}`
      : `https://veilpayapp.com${route}`;
    
    return `  <url>
    <loc>${loc}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`;
}).join('\n')}
</urlset>`;

  writeFileSync(join(DIST, 'sitemap.xml'), sitemapXml, 'utf-8');
  console.log('[SSG] ✓ sitemap.xml generated.');

  // Step 6: Run audit
  console.log('\n[SSG] Running audit...');
  const { execSync } = await import('child_process');
  try {
    execSync('tsx scripts/audit-prerender.ts', { cwd: PROJECT_ROOT, stdio: 'inherit' });
  } catch {
    process.exit(1);
  }
}

prerenderSSG().catch((err) => {
  console.error('[SSG] Fatal error:', err);
  process.exit(1);
});
