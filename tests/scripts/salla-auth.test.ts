// Unit tests for scripts/salla-auth.mjs. Every network call is an injected
// `fetchImpl`; nothing here reaches accounts.salla.sa. File I/O uses a
// scratch path under os.tmpdir(), never the repo's real .env.salla or
// .salla-token.json.
import { describe, expect, it, afterEach } from 'vitest';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {
  buildAuthorizeUrl,
  parseCallback,
  exchangeCode,
  refreshAccessToken,
  toTokenFile,
  writeTokenFile,
} from '../../scripts/salla-auth.mjs';
import { OAUTH_AUTHORIZE_URL, OAUTH_TOKEN_URL, parseEnvFile, loadEnv, resolveAccessToken } from '../../scripts/salla-lib.mjs';

function tempFile(name: string) {
  return path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'salla-auth-test-')), name);
}

const cleanupPaths: string[] = [];
afterEach(() => {
  for (const p of cleanupPaths.splice(0)) {
    fs.rmSync(path.dirname(p), { recursive: true, force: true });
  }
});

describe('buildAuthorizeUrl', () => {
  it('carries the authorize base, offline_access scope, and the given state/redirect', () => {
    const url = new URL(
      buildAuthorizeUrl({ clientId: 'abc', redirectUri: 'http://localhost:8787/callback', state: 'xyz' })
    );
    expect(url.origin + url.pathname).toBe(OAUTH_AUTHORIZE_URL);
    expect(url.searchParams.get('client_id')).toBe('abc');
    expect(url.searchParams.get('response_type')).toBe('code');
    expect(url.searchParams.get('redirect_uri')).toBe('http://localhost:8787/callback');
    expect(url.searchParams.get('scope')).toBe('offline_access');
    expect(url.searchParams.get('state')).toBe('xyz');
  });
});

describe('parseCallback', () => {
  it('accepts a matching state and a code', () => {
    const result = parseCallback(new URLSearchParams('state=abc&code=the-code'), 'abc');
    expect(result).toEqual({ ok: true, code: 'the-code' });
  });

  it('rejects a state mismatch WITHOUT exchanging anything', () => {
    const result = parseCallback(new URLSearchParams('state=wrong&code=the-code'), 'abc');
    expect(result).toEqual({ ok: false, reason: 'state mismatch' });
  });

  it('rejects a provider error before checking state', () => {
    const result = parseCallback(new URLSearchParams('error=access_denied&state=abc'), 'abc');
    expect(result).toEqual({ ok: false, reason: 'authorize error: access_denied' });
  });

  it('rejects a missing code even when state matches', () => {
    const result = parseCallback(new URLSearchParams('state=abc'), 'abc');
    expect(result).toEqual({ ok: false, reason: 'missing code' });
  });
});

describe('exchangeCode', () => {
  it('POSTs a form-encoded authorization_code grant and returns the parsed token', async () => {
    let seenUrl = '';
    let seenBody = '';
    const fetchImpl = async (url: string, init: RequestInit) => {
      seenUrl = url;
      seenBody = String(init.body);
      return new Response(JSON.stringify({ access_token: 'AT', refresh_token: 'RT', expires_in: 3600, scope: 'offline_access' }), {
        status: 200,
      });
    };
    const result = await exchangeCode({
      clientId: 'cid',
      clientSecret: 'csecret',
      redirectUri: 'http://localhost:8787/callback',
      code: 'the-code',
      fetchImpl: fetchImpl as unknown as typeof fetch,
    });
    expect(seenUrl).toBe(OAUTH_TOKEN_URL);
    expect(seenBody).toContain('grant_type=authorization_code');
    expect(seenBody).toContain('code=the-code');
    expect(seenBody).toContain('client_id=cid');
    expect(result.access_token).toBe('AT');
  });

  it('throws on a non-ok response', async () => {
    const fetchImpl = async () => new Response('nope', { status: 400 });
    await expect(
      exchangeCode({
        clientId: 'cid',
        clientSecret: 'csecret',
        redirectUri: 'http://localhost:8787/callback',
        code: 'bad',
        fetchImpl: fetchImpl as unknown as typeof fetch,
      })
    ).rejects.toThrow(/HTTP 400/);
  });
});

describe('refreshAccessToken', () => {
  it('POSTs a refresh_token grant', async () => {
    let seenBody = '';
    const fetchImpl = async (_url: string, init: RequestInit) => {
      seenBody = String(init.body);
      return new Response(JSON.stringify({ access_token: 'AT2', expires_in: 7200 }), { status: 200 });
    };
    const result = await refreshAccessToken({
      clientId: 'cid',
      clientSecret: 'csecret',
      refreshToken: 'RT',
      fetchImpl: fetchImpl as unknown as typeof fetch,
    });
    expect(seenBody).toContain('grant_type=refresh_token');
    expect(seenBody).toContain('refresh_token=RT');
    expect(result.access_token).toBe('AT2');
  });
});

describe('toTokenFile / writeTokenFile, token file shape', () => {
  it('computes expires_at from now + expires_in and keeps the four documented fields', () => {
    const shaped = toTokenFile(
      { access_token: 'AT', refresh_token: 'RT', expires_in: 100, scope: 'offline_access' },
      { now: 1000 }
    );
    expect(shaped).toEqual({ access_token: 'AT', refresh_token: 'RT', expires_at: 1000 + 100_000, scope: 'offline_access' });
    expect(Object.keys(shaped).sort()).toEqual(['access_token', 'expires_at', 'refresh_token', 'scope']);
  });

  it('defaults refresh_token and scope to null when the response omits them', () => {
    const shaped = toTokenFile({ access_token: 'AT' }, { now: 0 });
    expect(shaped.refresh_token).toBeNull();
    expect(shaped.scope).toBeNull();
  });

  it('round-trips through disk unchanged', () => {
    const file = tempFile('.salla-token.json');
    cleanupPaths.push(file);
    const shaped = toTokenFile({ access_token: 'AT', refresh_token: 'RT', expires_in: 10, scope: 'offline_access' }, { now: 0 });
    writeTokenFile(shaped, { tokenFile: file });
    const onDisk = JSON.parse(fs.readFileSync(file, 'utf8'));
    expect(onDisk).toEqual(shaped);
  });
});

describe('parseEnvFile / loadEnv / resolveAccessToken (salla-lib)', () => {
  it('parses KEY=VALUE lines, skipping blanks and # comments, stripping quotes', () => {
    const parsed = parseEnvFile('# comment\n\nSALLA_CLIENT_ID=abc123\nSALLA_CLIENT_SECRET="quoted value"\n');
    expect(parsed).toEqual({ SALLA_CLIENT_ID: 'abc123', SALLA_CLIENT_SECRET: 'quoted value' });
  });

  it('loadEnv prefers process.env over the file for the same key', () => {
    const file = tempFile('.env.salla');
    cleanupPaths.push(file);
    fs.writeFileSync(file, 'SALLA_CLIENT_ID=from-file\nSALLA_APP_ID=755989931\n');
    const original = process.env.SALLA_CLIENT_ID;
    process.env.SALLA_CLIENT_ID = 'from-env';
    try {
      const env = loadEnv({ envFile: file });
      expect(env.SALLA_CLIENT_ID).toBe('from-env');
      expect(env.SALLA_APP_ID).toBe('755989931');
    } finally {
      if (original === undefined) delete process.env.SALLA_CLIENT_ID;
      else process.env.SALLA_CLIENT_ID = original;
    }
  });

  it('loadEnv throws naming a missing required key, never a value', () => {
    const file = tempFile('.env.salla');
    cleanupPaths.push(file);
    fs.writeFileSync(file, '# empty\n');
    expect(() => loadEnv({ envFile: file, required: ['SALLA_CLIENT_ID'] })).toThrow(/SALLA_CLIENT_ID/);
  });

  it('resolveAccessToken: SALLA_ACCESS_TOKEN in the environment overrides the token file', () => {
    const original = process.env.SALLA_ACCESS_TOKEN;
    process.env.SALLA_ACCESS_TOKEN = 'from-env-override';
    const envFile = tempFile('.env.salla');
    const tokenFile = tempFile('.salla-token.json');
    cleanupPaths.push(envFile, tokenFile);
    try {
      const result = resolveAccessToken({ envFile, tokenFile });
      expect(result).toEqual({ token: 'from-env-override', source: 'env' });
    } finally {
      if (original === undefined) delete process.env.SALLA_ACCESS_TOKEN;
      else process.env.SALLA_ACCESS_TOKEN = original;
    }
  });

  it('resolveAccessToken: reads the token file when no env override exists', () => {
    const original = process.env.SALLA_ACCESS_TOKEN;
    delete process.env.SALLA_ACCESS_TOKEN;
    const tokenFile = tempFile('.salla-token.json');
    cleanupPaths.push(tokenFile);
    fs.writeFileSync(tokenFile, JSON.stringify({ access_token: 'AT', expires_at: Date.now() + 100_000 }));
    try {
      const result = resolveAccessToken({ envFile: tempFile('.env.salla'), tokenFile });
      expect(result).toEqual({ token: 'AT', source: 'file' });
    } finally {
      if (original !== undefined) process.env.SALLA_ACCESS_TOKEN = original;
    }
  });

  it('resolveAccessToken: rejects an expired token file', () => {
    const original = process.env.SALLA_ACCESS_TOKEN;
    delete process.env.SALLA_ACCESS_TOKEN;
    const tokenFile = tempFile('.salla-token.json');
    cleanupPaths.push(tokenFile);
    fs.writeFileSync(tokenFile, JSON.stringify({ access_token: 'AT', expires_at: Date.now() - 1000 }));
    try {
      const result = resolveAccessToken({ envFile: tempFile('.env.salla'), tokenFile });
      expect(result).toEqual({ token: null, source: 'expired' });
    } finally {
      if (original !== undefined) process.env.SALLA_ACCESS_TOKEN = original;
    }
  });
});
