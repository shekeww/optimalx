#!/usr/bin/env node
/**
 * preview-offline.mjs — one command that brings up the theme against the
 * local snapshot instead of `https://api.salla.dev`.
 *
 * It starts two processes and keeps them together:
 *   1. `scripts/serve-store.mjs` — the snapshot API on OFFLINE_API_PORT.
 *   2. `vite dev` with `VITE_API_URL` pointed at it, which
 *      `app/dev/offline-api.ts` turns into a redirect of every Salla request.
 *
 * Everything both processes print is also appended to `.offline-preview.log`,
 * so the run can be audited afterwards — `grep 429` over it is the proof that
 * the challenged host was never contacted.
 *
 * Ctrl-C stops both. No dependencies beyond node.
 */

import { spawn } from 'node:child_process';
import { createWriteStream, mkdirSync, readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { get } from 'node:http';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');

const API_PORT = Number(process.env.OFFLINE_API_PORT ?? 5178);
const API_HOST = process.env.OFFLINE_API_HOST ?? '127.0.0.1';
const DEV_PORT = Number(process.env.OFFLINE_DEV_PORT ?? 3210);
const SNAPSHOT_STORE_ID = (() => {
  try {
    return JSON.parse(readFileSync(join(ROOT, 'fixtures', 'store', 'meta.json'), 'utf8')).store.id;
  } catch {
    return 1888890798;
  }
})();
const API_BASE = `http://${API_HOST}:${API_PORT}`;
const LOG_PATH = process.env.OFFLINE_LOG ?? join(ROOT, '.offline-preview.log');

mkdirSync(dirname(LOG_PATH), { recursive: true });
const log = createWriteStream(LOG_PATH, { flags: 'w' });

const children = [];
let shuttingDown = false;

function pipe(prefix, child) {
  for (const stream of [child.stdout, child.stderr]) {
    if (!stream) continue;
    let buffer = '';
    stream.setEncoding('utf8');
    stream.on('data', (chunk) => {
      buffer += chunk;
      const lines = buffer.split('\n');
      buffer = lines.pop() ?? '';
      for (const line of lines) {
        const out = `${prefix} ${line}`;
        process.stdout.write(`${out}\n`);
        log.write(`${out}\n`);
      }
    });
    stream.on('end', () => {
      if (buffer) {
        process.stdout.write(`${prefix} ${buffer}\n`);
        log.write(`${prefix} ${buffer}\n`);
      }
    });
  }
}

function start(prefix, command, args, env) {
  // Always launched through `node` with an absolute script path and no shell:
  // a shell would break on Windows the moment a path contains a space
  // ("C:\Program Files\nodejs\node.exe" → 'C:\Program' is not recognized).
  const child = spawn(command, args, {
    cwd: ROOT,
    env: { ...process.env, ...env },
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  children.push(child);
  pipe(prefix, child);
  child.on('exit', (code, signal) => {
    if (shuttingDown) return;
    console.log(`${prefix} exited (code ${code}, signal ${signal})`);
    shutdown(code ?? 1);
  });
  return child;
}

function shutdown(code = 0) {
  if (shuttingDown) return;
  shuttingDown = true;
  for (const child of children) {
    try {
      if (process.platform === 'win32' && child.pid) {
        spawn('taskkill', ['/pid', String(child.pid), '/T', '/F'], { stdio: 'ignore' });
      } else {
        child.kill('SIGTERM');
      }
    } catch {
      /* already gone */
    }
  }
  log.write(`\n[preview] stopped\n`);
  setTimeout(() => process.exit(code), 400).unref();
}

process.on('SIGINT', () => shutdown(0));
process.on('SIGTERM', () => shutdown(0));

function waitForApi(timeoutMs = 15000) {
  const deadline = Date.now() + timeoutMs;
  return new Promise((resolve, reject) => {
    const attempt = () => {
      const req = get(`${API_BASE}/store/v1/store/settings`, (res) => {
        res.resume();
        if (res.statusCode === 200) resolve();
        else retry();
      });
      req.on('error', retry);
      req.setTimeout(1000, () => req.destroy());
    };
    const retry = () => {
      if (Date.now() > deadline) reject(new Error(`snapshot API did not come up on ${API_BASE}`));
      else setTimeout(attempt, 250);
    };
    attempt();
  });
}

console.log(`[preview] log → ${LOG_PATH}`);
start('[store-api]', process.execPath, [join(ROOT, 'scripts', 'serve-store.mjs'), '--port', String(API_PORT), '--host', API_HOST]);

try {
  await waitForApi();
} catch (error) {
  console.error(`[preview] ${error.message}`);
  shutdown(1);
  process.exit(1);
}

console.log(`[preview] snapshot API ready at ${API_BASE}/store/v1`);
start('[vite]', process.execPath, [join(ROOT, 'node_modules', 'vite', 'bin', 'vite.js'), 'dev', '--port', String(DEV_PORT), '--strictPort'], {
  // `OFFLINE_API_PUBLIC_URL` swaps in a public address for the snapshot API
  // (a Cloudflare quick tunnel to 5178) so a visitor reached through a tunnel
  // to the theme gets client-side data too: the boot script the page ships
  // sends the browser's Salla calls to this base, and 127.0.0.1 only resolves
  // on this machine. Added 2026-09-22 to share the build before Salla builds it.
  VITE_API_URL: process.env.OFFLINE_API_PUBLIC_URL || API_BASE,
  // SSR always talks to the local snapshot API directly (fast, no tunnel);
  // only the browser needs the public address above (2026-09-23).
  OFFLINE_API_SERVER_BASE: API_BASE,
  // The engine resolves the store from `?storeId=` on the URL, else from the
  // host, else from this variable (the last fallback in its
  // resolveStoreIdentifier). Off Salla's hosts a bare http://localhost:3210/
  // has none of the first two, so without this every unparameterised URL
  // answered 500 "No store identifier available" (owner report 2026-09-23).
  // The snapshot's own store id is the identifier the API mock already answers for.
  VITE_STORE_DOMAIN: process.env.VITE_STORE_DOMAIN || String(SNAPSHOT_STORE_ID),
  // Belt and braces: if the redirect ever fails to install, a call to
  // api.salla.dev fails locally and loudly instead of re-arming the
  // Cloudflare mitigation on this connection.
  VITE_BLOCK_SALLA_API: '1',
});
console.log(`[preview] theme → http://localhost:${DEV_PORT}/`);
console.log('[preview] cart and checkout do NOT work in this mode; see docs/build/offline-preview.md');
