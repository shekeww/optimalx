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
 * WHY A FETCH SHIM AND NOT JUST THE ENV VAR. `VITE_API_URL` looks like the
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
 * It is INERT unless `VITE_API_URL` is set, so a normal `pnpm dev` and every
 * production build behave exactly as before.
 */

/** Hosts this shim will redirect, and nothing else. */
const REDIRECTED_HOSTS = new Set(['api.salla.dev', 'cdn.salla.network']);

const FLAG = '__OX_OFFLINE_API_BASE__';

function readBase(): string | null {
  let value: string | undefined;
  try {
    value = import.meta.env?.VITE_API_URL as string | undefined;
  } catch {
    value = undefined;
  }
  if (!value) {
    const proc = (globalThis as { process?: { env?: Record<string, string | undefined> } }).process;
    value = proc?.env?.VITE_API_URL;
  }
  if (!value) return null;
  // Accept an origin with or without a trailing slash, and tolerate someone
  // pointing the var at `…/store/v1` by trimming back to the origin: the path
  // the engine asks for already carries `/store/v1`.
  try {
    return new URL(value).origin;
  } catch {
    return null;
  }
}

/** The local URL for a Salla URL, or null when the URL is not ours to touch. */
function rewrite(href: string, base: string): string | null {
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

function installFetch(base: string): void {
  const original = globalThis.fetch;
  if (typeof original !== 'function') return;
  const bound = original.bind(globalThis);

  globalThis.fetch = ((input: RequestInfo | URL, init?: RequestInit) => {
    try {
      if (typeof input === 'string' || input instanceof URL) {
        const next = rewrite(String(input), base);
        if (next) return bound(next, init);
      } else if (input && typeof (input as Request).url === 'string') {
        const request = input as Request;
        const next = rewrite(request.url, base);
        // `new Request(url, request)` carries the method, headers, body and
        // signal across, which is what ky has already set up on this object.
        if (next) return bound(new Request(next, request), init);
      }
    } catch {
      // A shim must never be the reason a request fails.
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
function installXhr(base: string): void {
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
    try {
      const next = rewrite(String(url), base);
      if (next) target = next;
    } catch {
      /* fall through with the original URL */
    }
    return (open as (...args: unknown[]) => void).call(this, method, target, ...rest);
  } as typeof Xhr.prototype.open;
}

function install(): void {
  const base = readBase();
  if (!base) return;
  const holder = globalThis as Record<string, unknown>;
  if (holder[FLAG]) return;
  holder[FLAG] = base;

  installFetch(base);
  installXhr(base);

  const where = typeof window === 'undefined' ? 'server' : 'browser';
  // Deliberately loud: this changes where the storefront data comes from, and
  // nobody should ever be unsure which mode a preview is running in.
  console.log(`[offline-api] ${where}: api.salla.dev and cdn.salla.network → ${base}`);
}

install();

export {};
