import { defineConfig, loadEnv } from 'vite'
import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import babel from '@rolldown/plugin-babel'
import tailwindcss from '@tailwindcss/vite'

import path from "path"

// Run the REAL Vercel serverless functions locally under `vite dev`.
// Plain Vite does NOT execute /api functions, so without this the two-step
// waitlist (waitlist-start / waitlist-verify) 404s in dev and the UI shows
// "Something went wrong". This middleware loads the actual handler modules via
// Vite's SSR loader and adapts Node's req/res to the handlers' minimal API
// shape, so dev matches production: same validation, Resend send, Discord ping.
function devApi(env: Record<string, string>) {
  const routes: Record<string, string> = {
    '/api/waitlist-start': '/api/waitlist-start.ts',
    '/api/waitlist-verify': '/api/waitlist-verify.ts',
  };
  return {
    name: 'dev-waitlist-api',
    configureServer(server: any) {
      // Handlers read secrets from process.env (RESEND_API_KEY,
      // WAITLIST_SIGNING_SECRET, WAITLIST_FROM_EMAIL, DISCORD_WEBHOOK_URL).
      // loadEnv() only returns them as an object, so mirror them into
      // process.env for dev — exactly what Vercel injects in production.
      Object.assign(process.env, env);

      server.middlewares.use(async (req: any, res: any, next: any) => {
        const url = (req.url || '').split('?')[0];
        const modPath = routes[url];
        if (!modPath || req.method !== 'POST') return next();

        let raw = '';
        req.on('data', (c: any) => (raw += c));
        req.on('end', async () => {
          try {
            const mod = await server.ssrLoadModule(modPath);
            const apiReq = {
              method: req.method,
              headers: req.headers,
              body: raw ? JSON.parse(raw) : {},
            };
            const apiRes = {
              status(code: number) { res.statusCode = code; return this; },
              json(data: unknown) {
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify(data));
              },
            };
            await mod.default(apiReq, apiRes);
          } catch (e) {
            console.error('[dev api] error:', e);
            if (!res.writableEnded) {
              res.statusCode = 500;
              res.end(JSON.stringify({ error: 'Dev API error — check the dev-server terminal.' }));
            }
          }
        });
      });
    },
  };
}

// Make the built CSS non-render-blocking. First paint (the inline bootstrap
// loader) then no longer waits on the full stylesheet download; the sheet is
// applied as soon as it arrives, well before app content is revealed.
function asyncCss() {
  return {
    name: 'async-css',
    transformIndexHtml(html: string) {
      return html.replace(
        /<link rel="stylesheet"([^>]*?)href="([^"]+\.css)"\s*\/?>/g,
        (_m: string, attrs: string, href: string) =>
          `<link rel="preload" as="style"${attrs}href="${href}">` +
          `<link rel="stylesheet"${attrs}href="${href}" media="print" onload="this.media='all'">` +
          `<noscript><link rel="stylesheet"${attrs}href="${href}"></noscript>`,
      )
    },
  }
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [
      react(),
      babel({ presets: [reactCompilerPreset()] }),
      tailwindcss(),
      asyncCss(),
      devApi(env),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    chunkSizeWarningLimit: 1500,
    // Don't emit a <link rel="modulepreload"> for the heavy Three.js chunk — it
    // must stay deferred and load only when the lazy CoinsScene mounts, not
    // warm eagerly during first paint. gsap/motion preloads are kept (eager).
    modulePreload: {
      resolveDependencies: (_url: string, deps: string[]) =>
        deps.filter((d) => !d.includes('three-')),
    },
    rollupOptions: {
      output: {
        // Split heavy libs into their own cacheable chunks so they are not all
        // parsed on the critical path. Function form for Rolldown/Vite 8.
        manualChunks(id: string) {
          if (!id.includes('node_modules')) return;
          // React core + scheduler + router MUST get their own eager chunk.
          // Otherwise the bundler hoists React's shared runtime (scheduler,
          // react-dom preload helpers) into the heavy `three` chunk, and the
          // entry then statically imports `three-*.js` — dragging ~940KB of
          // WebGL code onto the mobile critical path even though the 3D coins
          // are disabled on phones. Isolating React keeps `three` pure and
          // fully deferred to the lazy CoinsScene mount.
          if (
            /[\\/]node_modules[\\/](react|react-dom|scheduler|react-router|react-router-dom)[\\/]/.test(id)
          )
            return 'react';
          if (id.includes('three') || id.includes('@react-three')) return 'three';
          if (id.includes('gsap')) return 'gsap';
          if (id.includes('framer-motion') || id.includes('motion-dom') || id.includes('motion-utils')) return 'motion';
        },
      },
    },
    },
  }
})
