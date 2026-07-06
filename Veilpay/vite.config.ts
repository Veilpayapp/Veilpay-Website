import { defineConfig } from 'vite'
import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import babel from '@rolldown/plugin-babel'
import tailwindcss from '@tailwindcss/vite'

import path from "path"

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
export default defineConfig({
  plugins: [
    react(),
    babel({ presets: [reactCompilerPreset()] }),
    tailwindcss(),
    asyncCss(),
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
          if (id.includes('three') || id.includes('@react-three')) return 'three';
          if (id.includes('gsap')) return 'gsap';
          if (id.includes('framer-motion') || id.includes('motion-dom') || id.includes('motion-utils')) return 'motion';
        },
      },
    },
  },
})
