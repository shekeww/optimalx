/**
 * Offline store API redirect (dev only).
 *
 * THE PROBLEM. The theme renders by fetching `https://api.salla.dev/store/v1/*`
 * during SSR. That host answers this machine with
 *
 *     HTTP/1.1 429 Too Many Requests
 *     Cf-Mitigated: challenge
 *
 * which is Cloudflare BOT PROTECTION, not a quota: it demands a JavaScript
 * challenge that a server-side `fetch` cannot solve, so every route answers
 * 500 "Store Unavailable". The authenticated Admin API is a different path and
 * still works, so the catalogue is pulled through MCP into `fixtures/store/`
 * and served locally by `scripts/serve-store.mjs`.
 *
 * WHY A REQUEST SHIM AND NOT JUST THE ENV VAR. `VITE_API_URL` looks like the
 * switch — the engine reads it in `resolveRuntimeEnv()` — but that value is
 * DEAD. It is written into the runtime-env object and never read again: the
 * API client hardcodes its prefix
 *
 *     // theme-engine dist/chunk-O6XXHXC4.js:89
 *     var api = ky.extend({ prefix: "https://api.salla.dev/store/v1", // TODO: check env
 *
 * so no environment variable can move it. Patching `node_modules` is not an
 * option either (pnpm hard-links those files into the shared store, so editing
 * one edits every project's copy), and a Vite `transform` hook does not reach
 * a pre-bundled dependency. Rewriting the request itself is the one place that
 * works in every environment the theme runs in: the workerd SSR runner, the
 * browser, and the Salla SDK's own XHR calls.
 *
 * WHERE IT IS IMPORTED. `app/router.tsx`, and only there. That is the one
 * module both runtimes evaluate before any loader runs — the worker's entry is
 * TanStack's own `server-entry`, so an import in `app/server.ts` is never
 * executed.
 *
 * It is INERT unless `VITE_API_URL` is set, so a normal `pnpm dev` and every
 * production build behave exactly as before.
 */

/**
 * Injected by `vite.config.ts` from `process.env.VITE_API_URL` at config load.
 * A literal substitution, so it survives every environment — including the
 * workerd SSR runner, where `process.env` is empty.
 */
declare const __OX_OFFLINE_API_BASE__: string;
declare const __OX_BLOCK_SALLA_API__: string;

/** Hosts this shim will redirect, and nothing else. */
const REDIRECTED_HOSTS = new Set(['api.salla.dev', 'cdn.salla.network']);
/** The host that is behind the challenge, and the only one the block covers. */
const BLOCKED_HOST = 'api.salla.dev';

const FLAG = '__OX_OFFLINE_API_INSTALLED__';

function defined(name: '__OX_OFFLINE_API_BASE__' | '__OX_BLOCK_SALLA_API__'): string {
  try {
    if (name === '__OX_OFFLINE_API_BASE__') {
      return typeof __OX_OFFLINE_API_BASE__ === 'string' ? __OX_OFFLINE_API_BASE__ : '';
    }
    return typeof __OX_BLOCK_SALLA_API__ === 'string' ? __OX_BLOCK_SALLA_API__ : '';
  } catch {
    return '';
  }
}

function fromEnv(key: string): string {
  let value: string | undefined;
  try {
    value = (import.meta.env as Record<string, string | undefined> | undefined)?.[key];
  } catch {
    value = undefined;
  }
  if (!value) {
    const proc = (globalThis as { process?: { env?: Record<string, string | undefined> } }).process;
    value = proc?.env?.[key];
  }
  return value ?? '';
}

function readBase(): string | null {
  const raw = defined('__OX_OFFLINE_API_BASE__') || fromEnv('VITE_API_URL');
  if (!raw) return null;
  // Accept an origin with or without a trailing slash, and tolerate someone
  // pointing the var at `…/store/v1` by trimming back to the origin: the path
  // the engine asks for already carries `/store/v1`.
  try {
    return new URL(raw).origin;
  } catch {
    return null;
  }
}

function readBlock(): boolean {
  const raw = defined('__OX_BLOCK_SALLA_API__') || fromEnv('VITE_BLOCK_SALLA_API');
  return raw === '1' || raw === 'true';
}

/** The local URL for a Salla URL, or null when the URL is not ours to touch. */
function rewrite(href: string, base: string | null): string | null {
  if (!base) return null;
  let url: URL;
  try {
    url = new URL(href);
  } catch {
    return null;
  }
  if (!REDIRECTED_HOSTS.has(url.hostname)) return null;
  const local = new URL(base);
  url.protocol = local.protocol;
  url.host = local.host;
  return url.toString();
}

function isBlocked(href: string, block: boolean): boolean {
  if (!block) return false;
  try {
    return new URL(href).hostname === BLOCKED_HOST;
  } catch {
    return false;
  }
}

function blockError(href: string): Error {
  return new Error(
    `[offline-api] BLOCKED ${href} — this machine is under Cloudflare bot mitigation on api.salla.dev ` +
      `and every request re-arms it. The redirect to the local snapshot did not catch this call; ` +
      `see docs/build/offline-preview.md.`
  );
}

function installFetch(base: string | null, block: boolean): void {
  const original = globalThis.fetch;
  if (typeof original !== 'function') return;
  const bound = original.bind(globalThis);

  globalThis.fetch = ((input: RequestInfo | URL, init?: RequestInit) => {
    try {
      const href =
        typeof input === 'string' || input instanceof URL
          ? String(input)
          : ((input as Request)?.url ?? '');
      const next = rewrite(href, base);
      if (next) {
        if (typeof input === 'string' || input instanceof URL) return bound(next, init);
        // `new Request(url, request)` carries the method, headers, body and
        // signal across, which is what ky has already set up on this object.
        return bound(new Request(next, input as Request), init);
      }
      if (isBlocked(href, block)) return Promise.reject(blockError(href));
    } catch (error) {
      if (error instanceof Error && error.message.startsWith('[offline-api] BLOCKED')) throw error;
      // Otherwise a shim must never be the reason a request fails.
    }
    return bound(input as RequestInfo, init);
  }) as typeof fetch;
}

/**
 * The Salla twilight SDK (loaded from the CDN into the browser) talks to
 * api.salla.dev over XHR, not fetch. Without this it would keep hitting the
 * challenged host from the page and re-trip the very mitigation this whole
 * detour exists to avoid.
 */
function installXhr(base: string | null, block: boolean): void {
  const Xhr = (globalThis as { XMLHttpRequest?: typeof XMLHttpRequest }).XMLHttpRequest;
  if (!Xhr) return;
  const open = Xhr.prototype.open;
  Xhr.prototype.open = function patchedOpen(
    this: XMLHttpRequest,
    method: string,
    url: string | URL,
    ...rest: unknown[]
  ) {
    let target: string | URL = url;
    const href = String(url);
    const next = rewrite(href, base);
    if (next) target = next;
    else if (isBlocked(href, block)) throw blockError(href);
    return (open as (...args: unknown[]) => void).call(this, method, target, ...rest);
  } as typeof Xhr.prototype.open;
}

function install(): void {
  const base = readBase();
  const block = readBlock();
  if (!base && !block) return;

  const holder = globalThis as Record<string, unknown>;
  if (holder[FLAG]) return;
  holder[FLAG] = true;

  installFetch(base, block);
  installXhr(base, block);

  const where = typeof window === 'undefined' ? 'server' : 'browser';
  // Deliberately loud: this changes where the storefront data comes from, and
  // nobody should ever be unsure which mode a preview is running in.
  console.log(
    `[offline-api] ${where}: ` +
      (base ? `api.salla.dev + cdn.salla.network → ${base}` : 'no redirect base') +
      (block ? ' (api.salla.dev hard-blocked)' : '')
  );
}

install();

export {};
