import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    // The stylesheet-reading tests compile the whole theme once per file (about
    // 3s cold); under a full parallel run on a loaded machine the 5s default
    // timed them out (2026-09-24, every builder saw it). 20s keeps a real hang
    // visible and lets a cold compile finish.
    testTimeout: 20000,
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./tests/setup.tsx'],
    include: ['tests/**/*.test.{ts,tsx}'],
    // twilight-components-react's entry does `export * from
    // "./components/components"` with no file extension. Vite resolves that,
    // Node does not. Externalised packages are loaded by Node, and an import
    // made from an externalised module is not intercepted by vi.mock either,
    // so mocking the package cannot save a suite that reaches it through the
    // engine. Inlining the whole @salla.sa scope puts the chain back through
    // Vite's resolver, which is the only place it resolves.
    server: {
      deps: {
        inline: [/@salla\.sa[/\\]/],
      },
    },
    // twilight-components-react ships ESM whose entry imports
    // "./components/components" with no file extension. Vite's resolver
    // accepts that and Node's does not, so any suite reaching the package
    // root dies at collection with "Cannot find module". The root cannot be
    // avoided: ItemsList is only exported from it, and the package's exports
    // map does not expose native/items-list as a subpath.
    //
    // Pre-bundling it with esbuild rewrites the specifier, which is why this
    // is the optimizer and not server.deps.inline.
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      include: ['app/**/*.{ts,tsx}'],
      exclude: ['app/**/*.d.ts'],
    },
    reporters: ['default', 'json'],
    outputFile: './coverage/test-results.json',
  },
});
