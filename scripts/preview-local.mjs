#!/usr/bin/env node
// `pnpm preview:local`: the offline preview with the taxonomy overlay and
// English switched on, for Windows shells where `VAR=1 pnpm ...` is not a
// thing. Same server as `pnpm preview:offline` (theme on 3210, snapshot API on
// 5178); docs/build/offline-preview.md explains both switches.
process.env.OFFLINE_TAXONOMY ??= '1';
process.env.OFFLINE_LANGS ??= 'ar,en';
await import('./preview-offline.mjs');
