// salla-lib.mjs, shared plumbing for the Salla Merchant API scripts
// (salla-auth.mjs, salla-categories.mjs): credential loading, a
// rate-limited fetch client with 429/5xx backoff and Cloudflare-challenge
// detection, token-redacting logging, and the docs/build/store-write-log.md
// appender/reader that makes every live write reversible.
//
// Dependency-free: Node 20+ built-ins only (global fetch, node:fs,
// node:path, node:crypto). Never imported by the theme itself.

import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

export const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');

export const API_BASE = 'https://api.salla.dev/admin/v2';
export const OAUTH_AUTHORIZE_URL = 'https://accounts.salla.sa/oauth2/auth';
export const OAUTH_TOKEN_URL = 'https://accounts.salla.sa/oauth2/token';

export const ENV_FILE = path.join(ROOT, '.env.salla');
export const TOKEN_FILE = path.join(ROOT, '.salla-token.json');
export const WRITE_LOG_FILE = path.join(ROOT, 'docs', 'build', 'store-write-log.md');

const MIN_SPACING_MS = 300;
const MAX_RETRIES = 4;
const BACKOFF_BASE_MS = 500;

/* --------------------------------------------------------------- env --- */

/**
 * Hand-parses `KEY=VALUE` lines: ignores blank lines and `#` comments,
 * strips one layer of matching quotes. No dependency on dotenv.
 * @param {string} text
 * @returns {Record<string, string>}
 */
export function parseEnvFile(text) {
  /** @type {Record<string, string>} */
  const out = {};
  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) continue;
    const eq = line.indexOf('=');
    if (eq === -1) continue;
    const key = line.slice(0, eq).trim();
    let value = line.slice(eq + 1).trim();
    const quoted =
      (value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"));
    if (quoted) value = value.slice(1, -1);
    out[key] = value;
  }
  return out;
}

/**
 * Reads Salla credentials from `process.env` first, then `.env.salla` for
 * any key the environment does not already carry. Never logs a value.
 * Throws naming the missing KEY (never a value) when a `required` key is
 * absent from both sources.
 * @param {{ envFile?: string, required?: string[] }} [opts]
 * @returns {Record<string, string>}
 */
export function loadEnv({ envFile = ENV_FILE, required = [] } = {}) {
  const fromFile = fs.existsSync(envFile) ? parseEnvFile(fs.readFileSync(envFile, 'utf8')) : {};
  const env = { ...fromFile, ...process.env };
  const missing = required.filter((key) => !env[key]);
  if (missing.length > 0) {
    throw new Error(`missing required env var(s): ${missing.join(', ')} (set in the shell or in ${envFile})`);
  }
  return env;
}

/**
 * The access token a run should use: `SALLA_ACCESS_TOKEN` in the
 * environment overrides everything (the Vercel-sandbox path, where a
 * browser callback is not available); otherwise `.salla-token.json`,
 * rejected once its recorded `expires_at` has passed.
 * @param {{ envFile?: string, tokenFile?: string }} [opts]
 * @returns {{ token: string | null, source: 'env' | 'file' | 'expired' | 'none' }}
 */
export function resolveAccessToken({ envFile = ENV_FILE, tokenFile = TOKEN_FILE } = {}) {
  const env = loadEnv({ envFile });
  if (env.SALLA_ACCESS_TOKEN) return { token: env.SALLA_ACCESS_TOKEN, source: 'env' };
  if (!fs.existsSync(tokenFile)) return { token: null, source: 'none' };
  const data = JSON.parse(fs.readFileSync(tokenFile, 'utf8'));
  if (!data.access_token) return { token: null, source: 'none' };
  if (data.expires_at && Date.now() > data.expires_at) return { token: null, source: 'expired' };
  return { token: data.access_token, source: 'file' };
}

/* --------------------------------------------------------- redaction --- */

const SECRET_KEYS = ['access_token', 'refresh_token', 'client_secret', 'authorization', 'code'];

/**
 * Replaces any value under a secret-looking key with a fixed placeholder
 * before logging, recursively, so a stray `console.log` of a request body
 * or a parsed response can never leak a token or a client secret.
 * @param {unknown} value
 * @returns {unknown}
 */
export function redact(value) {
  if (value == null || typeof value !== 'object') return value;
  if (Array.isArray(value)) return value.map(redact);
  /** @type {Record<string, unknown>} */
  const out = {};
  for (const [key, val] of Object.entries(value)) {
    out[key] = SECRET_KEYS.includes(key.toLowerCase()) ? '***redacted***' : redact(val);
  }
  return out;
}

/** @param {string} message @param {unknown} [data] */
export function logInfo(message, data) {
  if (data !== undefined) console.log(`[salla] ${message}`, JSON.stringify(redact(data)));
  else console.log(`[salla] ${message}`);
}

/* ----------------------------------------------------------- fetch  ---- */

/** Thrown the moment the Cloudflare challenge for this machine's IP is
 * detected (`HTTP 429` + header `Cf-Mitigated: challenge`, checked
 * verbatim). The caller must stop; this class carries no retry. */
export class SallaChallengeError extends Error {
  constructor(message) {
    super(message);
    this.name = 'SallaChallengeError';
  }
}

/** @param {number} ms */
export function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function safeJsonPreview(body) {
  if (typeof body !== 'string') return undefined;
  try {
    return JSON.parse(body);
  } catch {
    return undefined;
  }
}

/**
 * Builds a `request(pathname, init)` function against the Salla Admin API
 * v2: one call in flight at a time, spaced 300 ms apart; retries `429`/`5xx`
 * with exponential backoff (honouring `Retry-After` when present); stops
 * immediately with `SallaChallengeError`, no retry, the moment a response
 * carries the exact Cloudflare-challenge signature this machine's IP gets
 * from `api.salla.dev`. Every other `429` is a normal rate limit and is
 * retried. `fetchImpl` is injectable so tests never touch the network.
 * @param {{ token: string, baseUrl?: string, fetchImpl?: typeof fetch, log?: typeof logInfo }} opts
 */
export function createSallaClient({ token, baseUrl = API_BASE, fetchImpl = fetch, log = logInfo } = {}) {
  if (!token) throw new Error('createSallaClient: token is required');
  let lastCallAt = 0;

  /** @param {string} pathname @param {RequestInit} [init] */
  async function request(pathname, init = {}) {
    const url = pathname.startsWith('http') ? pathname : `${baseUrl}${pathname}`;
    const headers = {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...init.headers,
    };

    for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
      const wait = MIN_SPACING_MS - (Date.now() - lastCallAt);
      if (wait > 0) await sleep(wait);
      lastCallAt = Date.now();

      log(`${init.method ?? 'GET'} ${pathname}`, safeJsonPreview(init.body));
      // eslint-disable-next-line no-await-in-loop -- requests to one store must stay sequential and spaced
      const response = await fetchImpl(url, { ...init, headers });

      if (response.status === 429 && response.headers.get('cf-mitigated') === 'challenge') {
        throw new SallaChallengeError(
          `api.salla.dev answered ${pathname} with a Cloudflare challenge (HTTP 429, ` +
            'Cf-Mitigated: challenge). This machine cannot solve it and the script does not retry. ' +
            'Run it from the Vercel sandbox instead \u2014 see docs/build/store-data-runbook.md, ' +
            '"Vercel-sandbox run".'
        );
      }

      const retryable = response.status === 429 || response.status >= 500;
      if (retryable && attempt < MAX_RETRIES) {
        const retryAfter = Number(response.headers.get('retry-after'));
        const delay =
          Number.isFinite(retryAfter) && retryAfter > 0 ? retryAfter * 1000 : BACKOFF_BASE_MS * 2 ** attempt;
        log(`HTTP ${response.status} on ${pathname}, retrying in ${delay}ms (attempt ${attempt + 1}/${MAX_RETRIES})`);
        // eslint-disable-next-line no-await-in-loop -- backoff must happen before the next attempt
        await sleep(delay);
        continue;
      }

      return response;
    }
    throw new Error(`unreachable: retry loop exhausted for ${pathname}`);
  }

  return { request };
}

/* -------------------------------------------------------- write log ---- */

/** @param {string} runId */
const runMarker = (runId) => `<!-- salla-run:${runId}`;

export function nowIso() {
  return new Date().toISOString();
}

/** @param {string} [prefix] */
export function generateRunId(prefix = 's5') {
  const stamp = new Date().toISOString().replace(/[:.]/g, '-');
  const rand = crypto.randomBytes(3).toString('hex');
  return `${prefix}-${stamp}-${rand}`;
}

/**
 * Appends one run's actions to `docs/build/store-write-log.md`: a
 * human-readable table plus the same data as JSON inside an HTML comment
 * (invisible when the file renders, parseable by `readRunLog` for
 * `--rollback`).
 * @param {{ runId: string, mode: 'apply' | 'rollback', startedAt: string, finishedAt: string,
 *   actions: Array<{ when: string, type: string, target: string, result: string, readback: string }>,
 *   notes?: string, logFile?: string }} opts
 */
export function appendRunLog({ runId, mode, startedAt, finishedAt, actions, notes = '', logFile = WRITE_LOG_FILE }) {
  const payload = { id: runId, mode, startedAt, finishedAt, actions };
  const rows = actions
    .map((a) => `| ${a.when} | ${a.type} | ${a.target} | ${a.result} | ${a.readback} |`)
    .join('\n');
  const section =
    `\n## Run ${runId} \u2014 ${startedAt} (${mode})\n` +
    `${notes ? `${notes}\n` : ''}` +
    `${runMarker(runId)}\n${JSON.stringify(payload, null, 2)}\n-->\n\n` +
    `| When (UTC) | Action | Target | Result | Read-back |\n|---|---|---|---|---|\n${rows}\n`;
  fs.appendFileSync(logFile, section, 'utf8');
  return section;
}

/**
 * Parses the JSON block for one run id out of `store-write-log.md`. Returns
 * `null` when the run id is not present.
 * @param {string} runId
 * @param {{ logFile?: string }} [opts]
 */
export function readRunLog(runId, { logFile = WRITE_LOG_FILE } = {}) {
  const text = fs.readFileSync(logFile, 'utf8');
  const marker = runMarker(runId);
  const start = text.indexOf(marker);
  if (start === -1) return null;
  const jsonStart = start + marker.length;
  const end = text.indexOf('\n-->', jsonStart);
  if (end === -1) return null;
  return JSON.parse(text.slice(jsonStart, end).trim());
}
