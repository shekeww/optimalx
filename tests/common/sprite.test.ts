import fs from 'node:fs';
import path from 'node:path';
import { describe, it, expect } from 'vitest';
import {
  OX_ICON_NAMES,
  OX_MIRRORED_ICON_NAMES,
  OX_SIMPLIFIED_ICON_NAMES,
} from '../../app/components/common/Icon';

/**
 * The sprite contract, rewritten with the S6a redraw (2026-09-23,
 * docs/build/progress/S6a.md). These are the rules a G2 reviewer cannot check
 * by eye across 88 symbols at five sizes.
 *
 * The weight assertion changed direction. The old file set `stroke-width` on
 * the sprite's root `<svg>` and this suite *forbade* it on a `<symbol>` — but
 * `<use>` clones a symbol into a shadow tree that inherits from the `<use>`
 * element, not from the sprite root, so the root value never reached a
 * rendered path and every icon in the live theme drew at SVG's initial
 * `stroke-width: 1`. The weight now lives on each symbol, and this suite
 * requires it there.
 */
const FILE = path.join('app', 'assets', 'ox-sprite.svg');
const SOURCE = fs.readFileSync(FILE, 'utf8');
const PRIMITIVES_FILE = path.join('app', 'styles', '06-ox', '_primitives.scss');
const PRIMITIVES_SOURCE = fs.readFileSync(PRIMITIVES_FILE, 'utf8');

interface Sym {
  id: string;
  attrs: Record<string, string>;
  body: string;
}

function attrsOf(source: string): Record<string, string> {
  const out: Record<string, string> = {};
  for (const attr of source.matchAll(/([a-zA-Z-]+)="([^"]*)"/g)) out[attr[1]] = attr[2];
  return out;
}

const SYMBOLS: Sym[] = [...SOURCE.matchAll(/<symbol\s+([^>]*)>([\s\S]*?)<\/symbol>/g)].map(
  (match) => {
    const attrs = attrsOf(match[1]);
    return { id: attrs.id, attrs, body: match[2] };
  }
);


/**
 * The ten product-category symbols the owner restored verbatim from the
 * pre-redraw sprite ("the icons in shop by category were fine, they just got
 * ruined", 2026-09-24). They are kept byte-for-byte — no `class="ox-sym"`, no
 * stroke attributes, curve commands and all — because that is the only way
 * they paint exactly as they did: the width was *inherited* before the
 * redraw, and it was not one number (1 on the tiles, 1.25 on the categories
 * index, which sets `stroke-width` on `.ox-cat-card__icon`). Writing any
 * value onto the symbol would beat that inherited one and change the
 * categories index. So they are exempt from the new system's drawing
 * assertions, and from nothing else: they still have to be declared, unique,
 * on the 24 grid, transform-free and accent-through-the-class like everything
 * else.
 */
const OWNER_APPROVED_ORIGINALS = new Set([
  'ox-protein', 'ox-creatine', 'ox-pre-workout', 'ox-amino-acids', 'ox-omega-3',
  'ox-vitamins-minerals', 'ox-collagen-beauty', 'ox-daily-health',
  'ox-snacks-bars', 'ox-accessories',
]);

/**
 * `#ox-mark` is the mark, not a symbol drawn to the icon grid: single colour,
 * full bleed, and pinned byte-for-byte by `scripts/check-identity.mjs`
 * (rule `mark-drift`). It is exempt from the stroke contract and the live
 * area, and from nothing else.
 */
const drawn = SYMBOLS.filter(
  (symbol) => symbol.id !== 'ox-mark' && !OWNER_APPROVED_ORIGINALS.has(symbol.id)
);
const standard = SYMBOLS.filter((symbol) => !symbol.id.endsWith('-s'));
const twins = SYMBOLS.filter((symbol) => symbol.id.endsWith('-s'));

/**
 * Universal UI icons whose conventional geometry is 45 degrees: a magnifier
 * handle and an arrowhead. The owner's brief keeps the universal set
 * conventional, so these are named exceptions to the no-45 rule rather than
 * redrawn into something a shopper would not recognise.
 */
const ANGLE_45_EXEMPT = new Set([
  'ox-search', 'ox-external', 'ox-arrow', 'ox-search-s', 'ox-external-s', 'ox-arrow-s',
]);

interface Seg { x0: number; y0: number; x1: number; y1: number; close: boolean }

/** Endpoint -> centre parameterisation, sampled, so an arc's bulge is real. */
function arcPoints(
  x0: number, y0: number, rx: number, ry: number, phiDeg: number,
  laf: number, sf: number, x1: number, y1: number
): number[][] {
  const phi = (phiDeg * Math.PI) / 180;
  const cos = Math.cos(phi);
  const sin = Math.sin(phi);
  const x1p = cos * ((x0 - x1) / 2) + sin * ((y0 - y1) / 2);
  const y1p = -sin * ((x0 - x1) / 2) + cos * ((y0 - y1) / 2);
  let a = Math.abs(rx);
  let b = Math.abs(ry);
  const lambda = (x1p * x1p) / (a * a) + (y1p * y1p) / (b * b);
  if (lambda > 1) {
    const s = Math.sqrt(lambda);
    a *= s;
    b *= s;
  }
  const num = a * a * b * b - a * a * y1p * y1p - b * b * x1p * x1p;
  const den = a * a * y1p * y1p + b * b * x1p * x1p;
  const co = (laf === sf ? -1 : 1) * Math.sqrt(Math.max(0, num / den));
  const cxp = (co * a * y1p) / b;
  const cyp = (-co * b * x1p) / a;
  const cx = cos * cxp - sin * cyp + (x0 + x1) / 2;
  const cy = sin * cxp + cos * cyp + (y0 + y1) / 2;
  const angle = (ux: number, uy: number, vx: number, vy: number) => {
    const dot = (ux * vx + uy * vy) / (Math.hypot(ux, uy) * Math.hypot(vx, vy));
    const ang = Math.acos(Math.min(1, Math.max(-1, dot)));
    return ux * vy - uy * vx < 0 ? -ang : ang;
  };
  const theta = angle(1, 0, (x1p - cxp) / a, (y1p - cyp) / b);
  let delta = angle((x1p - cxp) / a, (y1p - cyp) / b, (-x1p - cxp) / a, (-y1p - cyp) / b);
  if (!sf && delta > 0) delta -= 2 * Math.PI;
  if (sf && delta < 0) delta += 2 * Math.PI;
  const pts: number[][] = [];
  for (let i = 0; i <= 32; i++) {
    const t = theta + (delta * i) / 32;
    pts.push([
      cos * a * Math.cos(t) - sin * b * Math.sin(t) + cx,
      sin * a * Math.cos(t) + cos * b * Math.sin(t) + cy,
    ]);
  }
  return pts;
}

/** Walks a path into straight segments plus every drawn point. */
function walk(d: string): { straight: Seg[]; points: number[][]; endsStraight: boolean } {
  const tokens = d.match(/[MmLlHhVvZzAaCc]|-?\d*\.?\d+/g) ?? [];
  const straight: Seg[] = [];
  const points: number[][] = [];
  let i = 0;
  let cx = 0;
  let cy = 0;
  let sx = 0;
  let sy = 0;
  let cmd = '';
  let endsStraight = false;
  const n = () => Number(tokens[i++]);
  const line = (x: number, y: number, close = false) => {
    straight.push({ x0: cx, y0: cy, x1: x, y1: y, close });
    points.push([cx, cy], [x, y]);
    cx = x;
    cy = y;
    endsStraight = true;
  };
  while (i < tokens.length) {
    if (/[A-Za-z]/.test(tokens[i])) cmd = tokens[i++];
    const rel = cmd === cmd.toLowerCase();
    const up = cmd.toUpperCase();
    if (up === 'M') {
      const x = rel ? cx + n() : n();
      const y = rel ? cy + n() : n();
      cx = x; cy = y; sx = x; sy = y;
      points.push([x, y]);
      cmd = rel ? 'l' : 'L';
      continue;
    }
    if (up === 'L') line(rel ? cx + n() : n(), rel ? cy + n() : n());
    else if (up === 'H') line(rel ? cx + n() : n(), cy);
    else if (up === 'V') line(cx, rel ? cy + n() : n());
    else if (up === 'Z') { line(sx, sy, true); cmd = ''; }
    else if (up === 'A') {
      const rx = n(); const ry = n(); const rot = n(); const laf = n(); const sf = n();
      const x = rel ? cx + n() : n();
      const y = rel ? cy + n() : n();
      points.push(...arcPoints(cx, cy, rx, ry, rot, laf, sf, x, y));
      cx = x; cy = y; endsStraight = false;
    } else if (up === 'C') {
      const p: number[][] = [];
      for (let k = 0; k < 3; k++) p.push([rel ? cx + n() : n(), rel ? cy + n() : n()]);
      const p0 = [cx, cy];
      for (let k = 1; k <= 32; k++) {
        const t = k / 32;
        const u = 1 - t;
        points.push([
          u * u * u * p0[0] + 3 * u * u * t * p[0][0] + 3 * u * t * t * p[1][0] + t * t * t * p[2][0],
          u * u * u * p0[1] + 3 * u * u * t * p[0][1] + 3 * u * t * t * p[1][1] + t * t * t * p[2][1],
        ]);
      }
      cx = p[2][0]; cy = p[2][1]; endsStraight = false;
    } else throw new Error(`unsupported path command "${cmd}"`);
  }
  return { straight, points, endsStraight };
}

function pathsOf(symbol: Sym) {
  return [...symbol.body.matchAll(/<path([^>]*)\/>/g)].map((match) => {
    const attrs = attrsOf(match[1]);
    return {
      accent: (attrs.class ?? '').includes('ox-icon__accent'),
      ...walk(attrs.d ?? ''),
    };
  });
}

/** Degrees from vertical, 0 to 90. */
function angleFromVertical({ x0, y0, x1, y1 }: Seg): number | null {
  const dx = Math.abs(x1 - x0);
  const dy = Math.abs(y1 - y0);
  if (dx === 0 && dy === 0) return null;
  if (dy === 0) return 90;
  return (Math.atan(dx / dy) * 180) / Math.PI;
}

const STEEP = (Math.atan(0.675) * 180) / Math.PI;
const ALLOWED_ANGLES = [0, STEEP, 90 - STEEP, 90];
const TOL = 0.06;

describe('ox-sprite.svg', () => {
  // The real count, hardcoded rather than read off `OX_ICON_NAMES.length`: the
  // two lists are meant to be edited together, and a test that derives its own
  // expectation from the same source it is checking cannot catch the case
  // where both are edited in lockstep but wrong (S2a, 2026-09-22).
  it('has 92 standard symbols and 16 simplified twins, with no duplicate id', () => {
    expect(standard).toHaveLength(92);
    expect(twins).toHaveLength(16);
    expect(OX_ICON_NAMES).toHaveLength(92);
    expect(new Set(SYMBOLS.map((symbol) => symbol.id)).size).toBe(108);
  });

  it('declares exactly the standard symbols Icon.tsx names', () => {
    const ids = standard.map((symbol) => symbol.id).sort();
    expect(ids).toEqual(OX_ICON_NAMES.map((name) => `ox-${name}`).sort());
  });

  // Icon.tsx rewrites the href to `#ox-{name}-s` below 21px, so a name in the
  // list with no twin in the sprite is a broken reference at 16 and 20.
  it('ships a twin for exactly the names Icon.tsx simplifies, each over a real standard symbol', () => {
    const twinIds = twins.map((symbol) => symbol.id).sort();
    expect(twinIds).toEqual(OX_SIMPLIFIED_ICON_NAMES.map((name) => `ox-${name}-s`).sort());
    const standardIds = new Set(standard.map((symbol) => symbol.id));
    expect(twins.filter((t) => !standardIds.has(t.id.slice(0, -2)))).toEqual([]);
  });

  // Mirroring is opt-in and tiny on purpose: brand geometry must not flip.
  it('marks exactly the directional symbols Icon.tsx mirrors', () => {
    const marked = SYMBOLS.filter((symbol) => symbol.attrs['data-mirror'] === '1')
      .map((symbol) => symbol.id)
      .sort();
    expect(marked).toEqual(OX_MIRRORED_ICON_NAMES.map((name) => `ox-${name}`).sort());
    expect(SYMBOLS.find((symbol) => symbol.id === 'ox-mark')?.attrs['data-mirror']).toBeUndefined();
  });

  // "Do not place a tiny orange slash inside every icon" (owner brief). The
  // accent is a real part of the object where one exists, and absent where it
  // would be decoration - so a healthy share of the set stays pure mono.
  // The ten restored originals are the one place a symbol may carry the
  // pre-redraw drawing wholesale; nothing else may opt out of the system.
  it('restores the ten owner-approved category symbols and exempts only those', () => {
    const untouched = SYMBOLS.filter(
      (symbol) => !symbol.id.endsWith('-s') && !(symbol.attrs.class ?? '').includes('ox-sym')
    ).map((symbol) => symbol.id);
    expect(untouched.sort()).toEqual([...OWNER_APPROVED_ORIGINALS, 'ox-mark'].sort());
    // and none of them ships a twin, so 16 and 20 show the same drawing
    const twinIds = new Set(twins.map((symbol) => symbol.id));
    for (const id of OWNER_APPROVED_ORIGINALS) expect(twinIds.has(`${id}-s`)).toBe(false);
  });

  it('leaves a substantial part of the set monochrome', () => {
    const mono = SYMBOLS.filter((symbol) => !symbol.body.includes('ox-icon__accent'));
    expect(mono.length).toBeGreaterThanOrEqual(Math.round(SYMBOLS.length * 0.3));
  });

  it('paints the accent only through the two accent classes, never a literal colour', () => {
    const wrong = SYMBOLS.filter((symbol) =>
      [...symbol.body.matchAll(/<path[^>]*class="([^"]*)"/g)].some(
        (match) =>
          match[1].trim() !== 'ox-icon__accent' &&
          match[1].trim() !== 'ox-icon__accent ox-icon__accent--stroke'
      )
    ).map((symbol) => symbol.id);
    expect(wrong).toEqual([]);
    expect(/#[0-9a-fA-F]{3}\b/.test(SOURCE)).toBe(false);
  });

  // The weight law, carried where it actually reaches a rendered path: on the
  // symbol. A value on the sprite root never crosses the `<use>` boundary.
  it('sets the stroke contract on every drawn symbol', () => {
    const wrong = drawn
      .filter(
        (symbol) =>
          symbol.attrs.fill !== 'none' ||
          symbol.attrs.stroke !== 'currentColor' ||
          symbol.attrs['stroke-width'] !== '2' ||
          symbol.attrs['stroke-miterlimit'] !== '4' ||
          !(symbol.attrs.class ?? '').split(/\s+/).includes('ox-sym')
      )
      .map((symbol) => symbol.id);
    expect(wrong).toEqual([]);
  });

  it('declares square caps and miter joins on every drawn symbol', () => {
    expect(drawn.filter((s) => s.attrs['stroke-linecap'] !== 'square').map((s) => s.id)).toEqual([]);
    expect(drawn.filter((s) => s.attrs['stroke-linejoin'] !== 'miter').map((s) => s.id)).toEqual([]);
  });

  it('has no rounded corner anywhere in the file', () => {
    // The prose in the header comment is allowed to say "rounded"; the
    // geometry is not allowed to be.
    expect(/(linecap|linejoin)="round"/.test(SOURCE)).toBe(false);
    expect(/stroke-linejoin="bevel"/.test(SOURCE)).toBe(false);
    expect(/\srx=/.test(SOURCE)).toBe(false);
    expect(/\sry=/.test(SOURCE)).toBe(false);
  });

  it('bumps the relative stroke only at the 16 step of the size ladder', () => {
    expect(SOURCE).toContain('.ox-sym{stroke-width:var(--ox-icon-stroke,2px)}');
    expect(SOURCE).toContain('.ox-icon--16{--ox-icon-stroke:2.25px}');
    // S6b deviation 6: the bump also lives in _primitives.scss's own
    // `.ox-icon--16` rule now (the tidier home for it, docs/build/progress/
    // S6a.md deviation 6) — additive, not a replacement of the assertion
    // above, since app/assets/ox-sprite.svg is another batch's file.
    expect(PRIMITIVES_SOURCE).toMatch(/&--16\s*\{[^}]*--ox-icon-stroke:\s*2\.25px/);
  });

  it('draws every symbol on the 24 grid, with no transform and no primitive shape', () => {
    expect(SYMBOLS.filter((s) => s.attrs.viewBox !== '0 0 24 24').map((s) => s.id)).toEqual([]);
    expect(/<symbol[^>]*\stransform=/.test(SOURCE)).toBe(false);
    expect(/<path[^>]*\stransform=/.test(SOURCE)).toBe(false);
    expect(/<(circle|ellipse|rect|polygon|polyline|line)\b/.test(SOURCE)).toBe(false);
  });

  // The angle law is selective, not total (owner brief: "extract one signature
  // forward diagonal/chamfer ... and use it selectively"). What is forbidden
  // outright is 45 degrees - the one angle X-IDENTITY 2.1 rules out by name -
  // and the rest is measured: most straight edges sit on the 0/34/56/90
  // lattice the mark defines.
  it('never draws a 45 degree edge outside the conventional UI glyphs', () => {
    const offenders: string[] = [];
    for (const symbol of SYMBOLS) {
      if (ANGLE_45_EXEMPT.has(symbol.id) || OWNER_APPROVED_ORIGINALS.has(symbol.id)) continue;
      for (const { straight } of pathsOf(symbol)) {
        for (const seg of straight) {
          const angle = angleFromVertical(seg);
          if (angle !== null && Math.abs(angle - 45) <= 0.5) {
            offenders.push(`${symbol.id} ${angle.toFixed(2)}deg`);
          }
        }
      }
    }
    expect(offenders).toEqual([]);
  });

  it('keeps most straight edges on the lattice the mark defines', () => {
    let total = 0;
    let onSystem = 0;
    for (const symbol of SYMBOLS) {
      if (OWNER_APPROVED_ORIGINALS.has(symbol.id)) continue;
      for (const { straight } of pathsOf(symbol)) {
        for (const seg of straight) {
          const angle = angleFromVertical(seg);
          if (angle === null) continue;
          total += 1;
          if (ALLOWED_ANGLES.some((allowed) => Math.abs(angle - allowed) <= TOL)) onSystem += 1;
        }
      }
    }
    expect(onSystem / total).toBeGreaterThan(0.6);
  });

  it('keeps every drawn point inside the 2-unit live area', () => {
    const offenders: string[] = [];
    for (const symbol of drawn) {
      for (const { points } of pathsOf(symbol)) {
        for (const [x, y] of points) {
          if (x < 2 - 1e-6 || x > 22 + 1e-6 || y < 2 - 1e-6 || y > 22 + 1e-6) {
            offenders.push(`${symbol.id} ${x.toFixed(2)},${y.toFixed(2)}`);
          }
        }
      }
    }
    expect(offenders).toEqual([]);
  });

  // Fill the box: an object floating in the middle of a 24 grid dies at 16 px.
  it('reaches the live-area inset on at least two sides', () => {
    const offenders: string[] = [];
    for (const symbol of drawn) {
      const points = pathsOf(symbol).flatMap((p) => p.points);
      const xs = points.map((p) => p[0]);
      const ys = points.map((p) => p[1]);
      const touching = [
        Math.min(...xs) <= 3.25,
        Math.max(...xs) >= 20.75,
        Math.min(...ys) <= 3.25,
        Math.max(...ys) >= 20.75,
      ].filter(Boolean).length;
      if (touching < 2) offenders.push(`${symbol.id} touches ${touching}`);
    }
    expect(offenders).toEqual([]);
  });

  // 88 recognisable objects at stroke 2.25 cost more markup than 53 outlines
  // at 1.8 did, and this file is inlined on every route, so the ceiling is a
  // real budget. 52 KB raw is roughly 8 KB over the wire.
  it('stays under 52 KB', () => {
    expect(Buffer.byteLength(SOURCE, 'utf8')).toBeLessThan(52 * 1024);
  });
});

/**
 * A hand-drawn `<path d="M...">` outside the sprite is exactly the defect
 * this batch removed (PdpIcon.tsx's 14 glyphs, icons.tsx, BoltGlyph, the two
 * AddProductToast vendor paths): a second, undeclared icon family nobody can
 * audit against the weight law or the 34 degree rule. `ox-sprite.svg` and
 * `Icon.tsx` are the only files allowed to define one.
 */
describe('no inline icon paths outside the sprite', () => {
  const ROOT = 'app';
  const ALLOWED = new Set([
    path.join('app', 'assets', 'ox-sprite.svg'),
    path.join('app', 'components', 'common', 'Icon.tsx'),
    // Legacy shim, one glyph wide (`cart`), kept only for two Header-owned
    // call sites this batch could not edit (docs/build/progress/S2a.md).
    // Delete this exception when PdpIcon.tsx is deleted.
    path.join('app', 'components', 'product', 'PdpIcon.tsx'),
  ]);
  const INLINE_PATH = /<path[^>]*\sd=/;

  function listTsxFiles(dir: string): string[] {
    const out: string[] = [];
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) out.push(...listTsxFiles(full));
      else if (entry.name.endsWith('.tsx')) out.push(full);
    }
    return out;
  }

  it('finds no <path> element outside ox-sprite.svg and Icon.tsx', () => {
    const offenders = listTsxFiles(ROOT)
      .filter((file) => !ALLOWED.has(file))
      .filter((file) => INLINE_PATH.test(fs.readFileSync(file, 'utf8')));
    expect(offenders).toEqual([]);
  });
});
