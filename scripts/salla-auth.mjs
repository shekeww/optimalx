#!/usr/bin/env node
// salla-auth.mjs, Custom-Mode OAuth2 against the Salla Merchant API.
//
// Usage:
//   node scripts/salla-auth.mjs             start the browser flow, write .salla-token.json
//   node scripts/salla-auth.mjs --refresh   exchange the stored refresh_token for a new access token
//
// Reads SALLA_CLIENT_ID / SALLA_CLIENT_SECRET / SALLA_REDIRECT_URI from the
// environment or from .env.salla (hand-parsed, see scripts/salla-lib.mjs).
// The callback server binds to 127.0.0.1 ONLY, never 0.0.0.0, so the
// authorization code cannot be picked up by another host on the network.
// It verifies a random `state` round-trips unchanged before it will
// exchange anything; a mismatch is rejected without ever calling the token
// endpoint. This script never prints a token: only the fixed strings
// "received" / "written".
//
// SALLA_ACCESS_TOKEN in the environment overrides .salla-token.json
// everywhere scripts/salla-lib.mjs's resolveAccessToken() is used, the
// Vercel-sandbox path, where this script's browser callback cannot run.

import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import crypto from 'node:crypto';
import { pathToFileURL } from 'node:url';
import { TOKEN_FILE, OAUTH_AUTHORIZE_URL, OAUTH_TOKEN_URL, loadEnv } from './salla-lib.mjs';

const CALLBACK_HOST = '127.0.0.1';
const CALLBACK_PORT = 8787;
const CALLBACK_PATH = '/callback';
const DEFAULT_REDIRECT_URI = `http://localhost:${CALLBACK_PORT}${CALLBACK_PATH}`;
const TIMEOUT_MS = 5 * 60 * 1000;

/** @returns {string} */
export function randomState() {
  return crypto.randomBytes(16).toString('hex');
}

/** @param {{ clientId: string, redirectUri: string, state: string }} opts */
export function buildAuthorizeUrl({ clientId, redirectUri, state }) {
  const url = new URL(OAUTH_AUTHORIZE_URL);
  url.searchParams.set('client_id', clientId);
  url.searchParams.set('response_type', 'code');
  url.searchParams.set('redirect_uri', redirectUri);
  url.searchParams.set('scope', 'offline_access');
  url.searchParams.set('state', state);
  return url.toString();
}

/**
 * Pure decision over one callback request's query params: accept the code,
 * or reject with a reason (provider error, state mismatch, missing code).
 * No I/O, so this is the part the state-mismatch test exercises directly.
 * @param {URLSearchParams} searchParams
 * @param {string} expectedState
 * @returns {{ ok: true, code: string } | { ok: false, reason: string }}
 */
export function parseCallback(searchParams, expectedState) {
  const error = searchParams.get('error');
  if (error) return { ok: false, reason: `authorize error: ${error}` };
  const state = searchParams.get('state');
  if (state !== expectedState) return { ok: false, reason: 'state mismatch' };
  const code = searchParams.get('code');
  if (!code) return { ok: false, reason: 'missing code' };
  return { ok: true, code };
}

/**
 * Exchanges an authorization code for a token pair. `fetchImpl` is
 * injectable so tests never touch the network.
 * @param {{ clientId: string, clientSecret: string, redirectUri: string, code: string, fetchImpl?: typeof fetch }} opts
 */
export async function exchangeCode({ clientId, clientSecret, redirectUri, code, fetchImpl = fetch }) {
  const body = new URLSearchParams({
    grant_type: 'authorization_code',
    code,
    client_id: clientId,
    client_secret: clientSecret,
    redirect_uri: redirectUri,
  });
  const response = await fetchImpl(OAUTH_TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  });
  if (!response.ok) throw new Error(`token exchange failed: HTTP ${response.status}`);
  return response.json();
}

/** @param {{ clientId: string, clientSecret: string, refreshToken: string, fetchImpl?: typeof fetch }} opts */
export async function refreshAccessToken({ clientId, clientSecret, refreshToken, fetchImpl = fetch }) {
  const body = new URLSearchParams({
    grant_type: 'refresh_token',
    refresh_token: refreshToken,
    client_id: clientId,
    client_secret: clientSecret,
  });
  const response = await fetchImpl(OAUTH_TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  });
  if (!response.ok) throw new Error(`token refresh failed: HTTP ${response.status}`);
  return response.json();
}

/**
 * Turns a token-endpoint response into the on-disk shape.
 * @param {{ access_token: string, refresh_token?: string, expires_in?: number, scope?: string }} tokenResponse
 * @param {{ now?: number }} [opts]
 */
export function toTokenFile(tokenResponse, { now = Date.now() } = {}) {
  const expiresIn = Number(tokenResponse.expires_in) || 0;
  return {
    access_token: tokenResponse.access_token,
    refresh_token: tokenResponse.refresh_token ?? null,
    expires_at: now + expiresIn * 1000,
    scope: tokenResponse.scope ?? null,
  };
}

/** @param {ReturnType<typeof toTokenFile>} tokenFileData @param {{ tokenFile?: string }} [opts] */
export function writeTokenFile(tokenFileData, { tokenFile = TOKEN_FILE } = {}) {
  fs.writeFileSync(tokenFile, `${JSON.stringify(tokenFileData, null, 2)}\n`, 'utf8');
}

/**
 * Runs the local callback server and resolves once a code has been
 * exchanged, or rejects on provider error / state mismatch / timeout.
 * @param {{ expectedState: string, onCode: (code: string) => Promise<unknown> }} opts
 */
function runCallbackServer({ expectedState, onCode }) {
  return new Promise((resolve, reject) => {
    const server = http.createServer((req, res) => {
      const url = new URL(req.url ?? '/', `http://${CALLBACK_HOST}:${CALLBACK_PORT}`);
      if (url.pathname !== CALLBACK_PATH) {
        res.writeHead(404).end();
        return;
      }
      const decision = parseCallback(url.searchParams, expectedState);
      if (!decision.ok) {
        res.writeHead(400, { 'Content-Type': 'text/plain; charset=utf-8' }).end(`${decision.reason}; close this tab and re-run the script.`);
        server.close();
        reject(new Error(decision.reason));
        return;
      }
      res
        .writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' })
        .end('Authorized. You may close this tab and return to the terminal.');
      server.close();
      onCode(decision.code).then(resolve, reject);
    });
    server.on('error', reject);
    server.listen(CALLBACK_PORT, CALLBACK_HOST);
    const timer = setTimeout(() => {
      server.close();
      reject(new Error(`timed out waiting for the OAuth callback after ${TIMEOUT_MS / 1000}s`));
    }, TIMEOUT_MS);
    timer.unref();
  });
}

/** @param {Record<string, string>} env */
async function runAuthorize(env) {
  const clientId = env.SALLA_CLIENT_ID;
  const clientSecret = env.SALLA_CLIENT_SECRET;
  const redirectUri = env.SALLA_REDIRECT_URI || DEFAULT_REDIRECT_URI;
  const state = randomState();
  const authorizeUrl = buildAuthorizeUrl({ clientId, redirectUri, state });

  console.log('Open this URL in a browser and approve the app:');
  console.log(authorizeUrl);
  console.log(`Waiting for the callback on http://${CALLBACK_HOST}:${CALLBACK_PORT}${CALLBACK_PATH} ...`);

  const tokenResponse = await runCallbackServer({
    expectedState: state,
    onCode: (code) => exchangeCode({ clientId, clientSecret, redirectUri, code }),
  });
  writeTokenFile(toTokenFile(tokenResponse));
  console.log(`Token received and written to ${TOKEN_FILE} (never printed).`);
}

/** @param {Record<string, string>} env */
async function runRefresh(env) {
  if (!fs.existsSync(TOKEN_FILE)) {
    throw new Error(`${TOKEN_FILE} does not exist; run node scripts/salla-auth.mjs first`);
  }
  const current = JSON.parse(fs.readFileSync(TOKEN_FILE, 'utf8'));
  if (!current.refresh_token) throw new Error('stored token has no refresh_token to use');
  const tokenResponse = await refreshAccessToken({
    clientId: env.SALLA_CLIENT_ID,
    clientSecret: env.SALLA_CLIENT_SECRET,
    refreshToken: current.refresh_token,
  });
  writeTokenFile(toTokenFile(tokenResponse));
  console.log(`Token refreshed and written to ${TOKEN_FILE} (never printed).`);
}

/** @param {string[]} argv */
async function main(argv) {
  const env = loadEnv({ required: ['SALLA_CLIENT_ID', 'SALLA_CLIENT_SECRET'] });
  if (argv.includes('--refresh')) await runRefresh(env);
  else await runAuthorize(env);
  return 0;
}

const invokedDirectly =
  process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href;
if (invokedDirectly) {
  main(process.argv.slice(2))
    .then((code) => {
      process.exitCode = code;
    })
    .catch((error) => {
      console.error(`salla-auth: ${error.message}`);
      process.exitCode = 1;
    });
}
