import fs from 'node:fs';
import path from 'node:path';
import { describe, it, expect } from 'vitest';
import {
  DEFAULT_HOME_COMPONENTS,
  HOME_BLOCK_FIELDS,
  HOME_BLOCK_HEIGHTS,
  HOME_BLOCK_HEIGHT_CSS,
  HOME_BLOCK_PATHS,
  blockPath,
  clampHeight,
  hasHeroBlock,
  type HomeBlockPath,
} from '../../app/components/home/defaults';

/**
 * PLAN-final C2: `virtual:twilight/schema` is empty in production, so the
 * manifest's defaults never reach the browser and `defaults.ts` is what a fresh
 * install renders. These assertions are the contract that keeps the two the
 * same file in two places.
 */

interface ManifestField {
  id?: string;
  type?: string;
  format?: string;
  value?: unknown;
  fields?: ManifestField[];
}

interface ManifestComponent {
  path?: string;
  key?: string;
  is_default?: boolean;
  title?: { ar?: string; en?: string };
  fields?: ManifestField[];
}

const manifest = JSON.parse(
  fs.readFileSync(path.join(process.cwd(), 'twilight.json'), 'utf8')
) as { components: ManifestComponent[] };

const byPath = new Map(manifest.components.map((component) => [component.path ?? '', component]));

/** `static` fields are dropped by the engine's own classify(); we declare none. */
function merchantFields(component: ManifestComponent): ManifestField[] {
  return (component.fields ?? []).filter((field) => field.type !== 'static');
}

describe('home block manifest', () => {
  it('declares exactly the twelve DIRECTION 6.2 blocks, in order', () => {
    expect(manifest.components.map((component) => component.path)).toEqual(
      HOME_BLOCK_PATHS.map((blockName) => `home.${blockName}`)
    );
  });

  it('gives every block a unique key and a bilingual title', () => {
    const keys = manifest.components.map((component) => component.key);
    expect(new Set(keys).size).toBe(keys.length);
    for (const component of manifest.components) {
      expect(typeof component.title?.ar).toBe('string');
      expect(typeof component.title?.en).toBe('string');
    }
  });

  it('turns every block on by default except the campaign banner', () => {
    for (const component of manifest.components) {
      const expected = component.path !== 'home.ox-banner';
      expect(component.is_default === true).toBe(expected);
    }
  });

  it('mirrors every manifest field id and value in defaults.ts', () => {
    for (const blockName of HOME_BLOCK_PATHS) {
      const component = byPath.get(`home.${blockName}`);
      expect(component, blockName).toBeDefined();
      const fields = merchantFields(component as ManifestComponent);
      const ids = fields.map((field) => field.id);
      expect(new Set(ids), blockName).toEqual(new Set(Object.keys(HOME_BLOCK_FIELDS[blockName])));
      for (const field of fields) {
        const declared = HOME_BLOCK_FIELDS[blockName][field.id as string];
        expect(field.value ?? null, `${blockName}.${field.id}`).toEqual(declared ?? null);
      }
    }
  });

  it('ships every merchant field empty so the locale copy is the single source', () => {
    for (const component of manifest.components) {
      for (const field of merchantFields(component)) {
        const value = field.value;
        const empty = value === null || value === undefined || (Array.isArray(value) && value.length === 0);
        expect(empty, `${component.path}.${field.id}`).toBe(true);
      }
    }
  });

  it('prefixes every collection sub-field id with its collection id', () => {
    for (const component of manifest.components) {
      for (const field of merchantFields(component)) {
        for (const sub of field.fields ?? []) {
          expect(sub.id, `${component.path}.${field.id}`).toMatch(new RegExp(`^${field.id}\\.`));
        }
      }
    }
  });
});

describe('default composition', () => {
  it('is the twelve blocks in DIRECTION 6.2 order with their manifest defaults', () => {
    expect(DEFAULT_HOME_COMPONENTS.map((component) => component.path)).toEqual([
      ...HOME_BLOCK_PATHS,
    ]);
    for (const component of DEFAULT_HOME_COMPONENTS) {
      const blockName = component.path as HomeBlockPath;
      for (const [id, value] of Object.entries(HOME_BLOCK_FIELDS[blockName])) {
        expect(component[id]).toEqual(value);
      }
    }
  });

  it('gives every default block a distinct render key', () => {
    const keys = DEFAULT_HOME_COMPONENTS.map((component) => component.key);
    expect(new Set(keys).size).toBe(keys.length);
  });

  it('knows whether a composition carries the hero (the C19 h1 rule)', () => {
    expect(hasHeroBlock(DEFAULT_HOME_COMPONENTS)).toBe(true);
    expect(hasHeroBlock([{ path: 'ox-goals' }, { path: 'ox-faq' }])).toBe(false);
    // The loader strips the prefix, but a dev override may not have.
    expect(hasHeroBlock([{ path: 'home.ox-hero' }])).toBe(true);
    expect(blockPath({ path: 'home.ox-faq' })).toBe('ox-faq');
  });
});

describe('reserved heights', () => {
  /** Evaluates `clamp(a, calc(Npx +- Mvw), b)` at one viewport width. */
  function heightAt(css: string, viewport: number): number {
    const match = css.match(new RegExp('calc\\((-?[0-9.]+)px ([+-]) ([0-9.]+)vw\\)'));
    if (!match) return Number(css.replace('px', ''));
    const intercept = Number(match[1]);
    const sign = match[2] === '-' ? -1 : 1;
    const slope = Number(match[3]);
    const low = Number(css.slice('clamp('.length).split('px')[0]);
    const high = Number(css.slice(css.lastIndexOf(', ') + 2).replace('px)', ''));
    const raw = intercept + (sign * slope * viewport) / 100;
    return Math.min(Math.max(raw, low), high);
  }

  it('resolves to the DIRECTION 6.2 value at 390 and at 1440', () => {
    for (const blockName of HOME_BLOCK_PATHS) {
      const css = HOME_BLOCK_HEIGHT_CSS[blockName];
      const { mobile, desktop } = HOME_BLOCK_HEIGHTS[blockName];
      expect(heightAt(css, 390), `${blockName} at 390`).toBeCloseTo(mobile, 1);
      expect(heightAt(css, 1440), `${blockName} at 1440`).toBeCloseTo(desktop, 1);
    }
  });

  it('puts the smaller bound first, whichever viewport it belongs to', () => {
    expect(clampHeight(500, 560)).toBe('clamp(500px, calc(477.714px + 5.714vw), 560px)');
    expect(clampHeight(144, 72)).toBe('clamp(72px, calc(170.743px - 6.857vw), 144px)');
    expect(clampHeight(200, 200)).toBe('200px');
  });
});
