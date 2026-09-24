// Geometry tests for the mark itself (X-IDENTITY-2026-09-22.md §1.6/§7.2),
// run against the `d` string XMark.tsx draws through the sprite
// (`#ox-mark`, the 24-grid path), no SVG library, since the path is only
// ever `M x y L x y … Z`.
import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const SPRITE = path.join('app', 'assets', 'ox-sprite.svg');
const source = fs.readFileSync(SPRITE, 'utf8');
const match = source.match(/<symbol id="ox-mark"[^>]*>[\s\S]*?<path[^>]*\sd="([^"]+)"/);
if (!match) throw new Error('ox-mark symbol not found in ox-sprite.svg');
const D = match[1];

interface Point {
  x: number;
  y: number;
}

/** Parses `M x y L x y … Z` (repeated) into one array of subpaths, each a
 * closed ring of points. A command letter never has a space before its own
 * first coordinate (`M15.136 1.393`, not `M 15.136 1.393`), so the command
 * and the numbers are tokenised separately rather than split on whitespace.
 * Throws on any command other than M/L/Z. */
function parseSubpaths(d: string): Point[][] {
  const tokens = d.trim().match(/[MLZ]|-?\d+(?:\.\d+)?/g) ?? [];
  const subpaths: Point[][] = [];
  let current: Point[] = [];
  let i = 0;
  while (i < tokens.length) {
    const command = tokens[i];
    if (command === 'M' || command === 'L') {
      const x = Number(tokens[i + 1]);
      const y = Number(tokens[i + 2]);
      if (Number.isNaN(x) || Number.isNaN(y)) throw new Error(`bad coordinate at token ${i}`);
      if (command === 'M' && current.length) {
        subpaths.push(current);
        current = [];
      }
      current.push({ x, y });
      i += 3;
    } else if (command === 'Z') {
      subpaths.push(current);
      current = [];
      i += 1;
    } else {
      throw new Error(`unexpected command "${command}", only M, L, Z are legal`);
    }
  }
  if (current.length) subpaths.push(current);
  return subpaths;
}

/** Every edge of a closed ring, as consecutive point pairs (wrapping). */
function edgesOf(ring: Point[]): [Point, Point][] {
  return ring.map((point, index) => [point, ring[(index + 1) % ring.length]]);
}

/** Angle from vertical, in degrees, of the segment a→b. 0 = vertical. */
function angleFromVertical(a: Point, b: Point): number {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  return (Math.atan2(Math.abs(dx), Math.abs(dy)) * 180) / Math.PI;
}

const subpaths = parseSubpaths(D);
const allEdges = subpaths.flatMap((ring) => edgesOf(ring));

describe('the mark (#ox-mark, 24-grid path)', () => {
  it('has exactly 18 edges across the four arms', () => {
    expect(subpaths).toHaveLength(4);
    expect(subpaths.map((ring) => ring.length)).toEqual([5, 5, 4, 4]);
    expect(allEdges).toHaveLength(18);
  });

  it('classifies every edge as 0, 34, 56 or 90 degrees from vertical, within 0.5deg', () => {
    const ALLOWED = [0, 34, 56, 90];
    for (const [a, b] of allEdges) {
      const angle = angleFromVertical(a, b);
      const closest = ALLOWED.reduce((best, candidate) =>
        Math.abs(candidate - angle) < Math.abs(best - angle) ? candidate : best
      );
      expect(Math.abs(angle - closest)).toBeLessThan(0.5);
    }
  });

  it('has exactly 8 horizontal edges and 10 edges at 34deg from vertical', () => {
    const horizontal = allEdges.filter(([a, b]) => Math.abs(a.y - b.y) < 0.01);
    const angled = allEdges.filter(([a, b]) => Math.abs(a.y - b.y) >= 0.01);
    expect(horizontal).toHaveLength(8);
    expect(angled).toHaveLength(10);
    for (const [a, b] of angled) {
      expect(angleFromVertical(a, b)).toBeCloseTo(34, 0);
    }
  });

  it('every horizontal edge (a ledge) is exactly horizontal, never a near-miss', () => {
    const horizontal = allEdges.filter(([a, b]) => Math.abs(a.y - b.y) < 0.01);
    for (const [a, b] of horizontal) {
      expect(a.y).toBeCloseTo(b.y, 3);
    }
  });

  it('keeps every arm a real parallelogram, not a degenerate sliver or a full-width span', () => {
    // A coarse, honest sanity check rather than a reproduction of §1.5's own
    // locked-line arithmetic: no arm collapses toward a point, and no arm's
    // bounding span reaches the viewBox's own width (which would mean two
    // arms had merged into one shape, or the channel between the chevrons
    // had closed, owner note 5's "must keep the channel constant").
    const xs = subpaths.flatMap((ring) => ring.map((p) => p.x));
    const width = Math.max(...xs) - Math.min(...xs);
    expect(width).toBeCloseTo(24, 0);
    for (const ring of subpaths) {
      const ringXs = ring.map((p) => p.x);
      const span = Math.max(...ringXs) - Math.min(...ringXs);
      expect(span).toBeGreaterThan(1);
      expect(span).toBeLessThan(width);
    }
  });

  it('the bbox matches X-IDENTITY §1.4: x 0..24, y 1.393..22.607', () => {
    const xs = subpaths.flatMap((ring) => ring.map((p) => p.x));
    const ys = subpaths.flatMap((ring) => ring.map((p) => p.y));
    expect(Math.min(...xs)).toBeCloseTo(0, 2);
    expect(Math.max(...xs)).toBeCloseTo(24, 2);
    expect(Math.min(...ys)).toBeCloseTo(1.393, 2);
    expect(Math.max(...ys)).toBeCloseTo(22.607, 2);
  });
});
