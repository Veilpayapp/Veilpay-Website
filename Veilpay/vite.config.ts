import { defineConfig, loadEnv } from 'vite'
import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import babel from '@rolldown/plugin-babel'
import tailwindcss from '@tailwindcss/vite'

import path from "path"

// Mock the Vercel Serverless Function locally in Vite
function mockWaitlistApi(env: Record<string, string>) {
  return {
    name: 'mock-waitlist-api',
    configureServer(server: any) {
      server.middlewares.use('/api/waitlist', async (req: any, res: any, next: any) => {
        if (req.method !== 'POST') return next();
        
        let body = '';
        req.on('data', (chunk: any) => body += chunk);
        req.on('end', async () => {
          try {
            const { email } = JSON.parse(body);
            const webhookUrl = env.DISCORD_WEBHOOK_URL;
            
            if (!webhookUrl) {
              res.statusCode = 500;
              res.end(JSON.stringify({ error: 'Missing DISCORD_WEBHOOK_URL in .env' }));
              return;
            }
            
            const discordRes = await fetch(webhookUrl, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                embeds: [{
                  title: '🚀 [DEV] New Waitlist Signup!',
                  description: `A new user has joined the Veilpay waitlist locally.\n\n**Email:** \`${email}\``,
                  color: 15909234,
                  timestamp: new Date().toISOString(),
                }]
              })
            });
            
            if (!discordRes.ok) throw new Error('Discord rejected');
            
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ success: true }));
          } catch (e) {
            console.error(e);
            res.statusCode = 500;
            res.end(JSON.stringify({ error: 'Failed' }));
          }
        });
      });
    }
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
      mockWaitlistApi(env),
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
