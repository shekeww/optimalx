import { defineConfig } from 'vite';
import { twilightReact } from '@salla.sa/twilight-theme-engine/vite';
import { visualizer } from 'rollup-plugin-visualizer';
import path from 'path';

export default defineConfig(async () => ({
  plugins: [
    // twilightReact() registers and configures the SSR runtime, so a theme
    // configures no server runtime of its own.
    ...(await twilightReact({
      localesDir: './locales',
    })),
    visualizer({
      open: false,
      gzipSize: true,
      brotliSize: true,
      filename: 'dist/stats.html',
    }),
  ],
  // Offline preview switch, read once at config load and substituted as a
  // literal so it survives every environment — including the workerd SSR
  // runner, where `process.env` is empty. `app/dev/offline-api.ts` turns a
  // non-empty base into a redirect of every api.salla.dev request; both are
  // empty strings on a normal `pnpm dev`, which leaves the shim inert.
  define: {
    __OX_OFFLINE_API_BASE__: JSON.stringify(process.env.VITE_API_URL ?? ''),
    __OX_BLOCK_SALLA_API__: JSON.stringify(process.env.VITE_BLOCK_SALLA_API ?? ''),
  },
  resolve: {
    alias: {
      '~': path.resolve(import.meta.dirname, './'),
    },
    // Singleton libs whose React context must be shared between the app and the
    // engine's bundled screens/components (they call useSuspenseQuery /
    // useTranslation but don't own these). Without dedupe the strict published
    // layout resolves a second copy → "No QueryClient set" / missing i18n context.
    dedupe: [
      'react',
      'react-dom',
      'react/jsx-runtime',
      '@tanstack/react-router',
      '@tanstack/react-query',
      'react-i18next',
      'i18next',
    ],
  },
  environments: {
    ssr: {
      // The workerd SSR runner can't execute raw CommonJS ("module is not
      // defined") and SSR environments don't pre-bundle deps by default. Pre-
      // optimize the CJS deps that reach SSR: @tanstack/react-query (so the
      // engine's QueryClientProvider and route loaders share one
      // QueryClientContext) and the engine's i18n chain
      // (react-i18next → html-parse-stringify → void-elements, use-sync-
      // external-store). Nested paths resolve under pnpm's strict layout.
      optimizeDeps: {
        include: [
          '@tanstack/react-query',
          '@salla.sa/twilight-theme-engine > react-i18next',
          '@salla.sa/twilight-theme-engine > i18next',
          '@salla.sa/twilight-theme-engine > react-i18next > html-parse-stringify',
          '@salla.sa/twilight-theme-engine > react-i18next > html-parse-stringify > void-elements',
          '@salla.sa/twilight-theme-engine > react-i18next > use-sync-external-store',
        ],
      },
      // Stale-optimizer trap, seen 2026-09-16. Editing this file changes the
      // optimizer's configHash, so Vite re-optimizes and rotates browserHash.
      // Pre-bundled deps are served at …/deps_ssr/<name>.js?v=<browserHash>; a
      // browser recovers by reloading, but the workerd SSR runner keeps the old
      // URL and dies with "The file does not exist at …?v=<old hash>", which
      // takes down `salla theme dev` and `vite preview` alike.
      //
      // Do NOT try to fix this with optimizeDeps.exclude — the Cloudflare plugin
      // puts @cloudflare/unenv-preset/polyfill/performance into `include` itself,
      // and include wins, so the exclude is silently a no-op (verified: the entry
      // is still emitted into deps_ssr after a clean re-optimize with it set).
      //
      // The fix is to drop the cache and let it rebuild: `pnpm dev:fresh`.
    },
  },
  css: {
    preprocessorOptions: {
      scss: { api: 'modern-compiler', silenceDeprecations: ['import'] } as any,
    },
  },
  build: {
    modulePreload: {
      resolveDependencies: (url: string, deps: string[]): string[] => {
        return deps.filter(
          (d: string) =>
            d.includes('vendor') ||
            d.includes('router') ||
            d.includes('main') ||
            d.includes('index') ||
            d.includes('shared-')
        );
      },
    },
    rollupOptions: {
      external: ['@salla.sa/twilight-components', '@salla.sa/twilight-components/dist/*'],
      output: {
        chunkFileNames: 'assets/[name]-[hash].js',
        manualChunks(id: string): string | undefined {
          if (id.includes('node_modules/react/') || id.includes('node_modules/react-dom/')) {
            return 'vendor-react';
          }
          if (id.includes('node_modules/@tanstack/react-router/')) {
            return 'vendor-router';
          }
          if (id.includes('node_modules/@uidotdev/usehooks/')) {
            return 'vendor-hooks';
          }
          if (
            id.includes('/components/common/Breadcrumb') ||
            id.includes('/components/common/NoContent') ||
            id.includes('/components/common/Image') ||
            id.includes('/components/common/Link') ||
            id.includes('/components/common/CurrencySymbol')
          ) {
            return 'shared-common';
          }
          if (
            id.includes('/components/product/ProductCard') ||
            id.includes('/components/product/ProductDetails') ||
            id.includes('/components/product/ProductGallery') ||
            id.includes('/components/product/AddToCartForm')
          ) {
            return 'shared-product';
          }
          if (
            id.includes('/components/home/ProductsSlider') ||
            id.includes('/components/home/Testimonials') ||
            id.includes('/components/home/HomeComponentRenderer')
          ) {
            return 'shared-home';
          }
        },
      },
    },
  },
}));
