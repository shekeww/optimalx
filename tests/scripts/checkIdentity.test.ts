// Unit tests for scripts/check-identity.mjs: the pure per-rule functions,
// and the one thing that has to be true for the gate to mean anything — a
// planted, illegal angle must fail it.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { describe, expect, it, afterEach } from 'vitest';
import {
  checkIdentity,
  walkBlocks,
  blockFamily,
  CANONICAL_MARK_D,
  SPRITE_FILE,
} from '../../scripts/check-identity.mjs';

describe('checkIdentity: angle-value', () => {
  it('fails a rotate() that is not 0, 34, 56 or 90 degrees', () => {
    const findings = checkIdentity('a.scss', '.x { transform: rotate(45deg); }');
    expect(findings.some((f) => f.rule === 'angle-value')).toBe(true);
  });

  it('passes the identity angle and its complement/right-angle siblings', () => {
    const findings = checkIdentity(
      'a.scss',
      '.a { transform: skewX(34deg); } .b { transform: rotate(56deg); } .c { transform: rotate(90deg); } .d { transform: rotate(0deg); }'
    );
    expect(findings.filter((f) => f.rule === 'angle-value')).toEqual([]);
  });

  it('normalises modulo 180, so 214deg (34 + 180) is legal', () => {
    const findings = checkIdentity('a.scss', '.x { transform: rotate(214deg); }');
    expect(findings.filter((f) => f.rule === 'angle-value')).toEqual([]);
  });

  it('respects an ox-allow: angle-value pragma', () => {
    const findings = checkIdentity(
      'a.scss',
      '.legacy { transform: rotate(45deg); } // ox-allow: angle-value inherited Raed scaffolding'
    );
    // The pragma must sit on the same physical line as the finding to opt out.
    const single = checkIdentity('a.scss', '.legacy { transform: rotate(45deg); } // ox-allow: angle-value reason');
    expect(single.filter((f) => f.rule === 'angle-value')).toEqual([]);
    expect(findings).toBeDefined();
  });
});

describe('checkIdentity: angle-tan', () => {
  it('fails the stale 0.404 tangent', () => {
    const findings = checkIdentity('a.scss', '$ox-angle-tan: 0.404;');
    expect(findings.some((f) => f.rule === 'angle-tan')).toBe(true);
  });

  it('passes the locked 0.6745 tangent', () => {
    const findings = checkIdentity('a.scss', '$ox-angle-tan: 0.6745;');
    expect(findings.filter((f) => f.rule === 'angle-tan')).toEqual([]);
  });
});

describe('checkIdentity: polygon-slope', () => {
  it('fails a literal diagonal percentage pair with no identity pragma', () => {
    const findings = checkIdentity('a.scss', '.x { clip-path: polygon(0 0, 100% 0, 100% 88%, 0 100%); }');
    expect(findings.some((f) => f.rule === 'polygon-slope')).toBe(true);
  });

  it('passes the same shape once the identity pragma is present', () => {
    const findings = checkIdentity(
      'a.scss',
      ['/* identity: 34deg, run 202.4 of 864 */', '.x { clip-path: polygon(0 0, 100% 0, 100% 88%, 0 100%); }'].join(
        '\n'
      )
    );
    expect(findings.filter((f) => f.rule === 'polygon-slope')).toEqual([]);
  });

  it('passes a calc()/run() polygon that only ever touches 0% and 100%', () => {
    const findings = checkIdentity(
      'a.scss',
      '.x { clip-path: polygon(0 0, 100% 0, calc(100% - #{$run}) 100%, 0 100%); }'
    );
    expect(findings.filter((f) => f.rule === 'polygon-slope')).toEqual([]);
  });
});

describe('checkIdentity: unmirrored', () => {
  it('fails a skewX with no direction-factor and no --ox-skew', () => {
    const findings = checkIdentity('a.scss', '.x { transform: skewX(34deg); }');
    expect(findings.some((f) => f.rule === 'unmirrored')).toBe(true);
  });

  it('passes a skewX built from --ox-skew (itself direction-factor wrapped)', () => {
    const findings = checkIdentity('a.scss', '.x { transform: skewX(var(--ox-skew)); }');
    expect(findings.filter((f) => f.rule === 'unmirrored')).toEqual([]);
  });

  it('fails a file with a polygon() and no [dir="ltr"] counterpart anywhere', () => {
    const findings = checkIdentity('a.scss', '.x { clip-path: polygon(0 0, 10px 0, 0 10px); }');
    expect(findings.some((f) => f.rule === 'unmirrored')).toBe(true);
  });
});

describe('checkIdentity: small-angle', () => {
  it('fails a raw polygon under 158px of block-size', () => {
    const findings = checkIdentity(
      'a.scss',
      '.x { block-size: 40px; clip-path: polygon(0 0, 10px 0, 0 10px); }'
    );
    expect(findings.some((f) => f.rule === 'small-angle')).toBe(true);
  });

  it('exempts ox-angled() by name, per §3.2 (a control-scale mark, not a panel cut)', () => {
    const findings = checkIdentity('a.scss', '.ox-btn--s40 { block-size: 40px; @include ox-angled(40px); }');
    expect(findings.filter((f) => f.rule === 'small-angle')).toEqual([]);
  });

  it('never flags a notch: an axis-aligned polygon is legal at any size', () => {
    const findings = checkIdentity('a.scss', '.x { block-size: 20px; @include ox-x-notch(4px, 14px); }');
    expect(findings.filter((f) => f.rule === 'small-angle')).toEqual([]);
  });
});

describe('checkIdentity: focus-clipped', () => {
  it('fails an angled primitive and a live outline on the same selector', () => {
    const findings = checkIdentity(
      'a.scss',
      '.x { @include ox-angled(44px); outline: var(--ox-focus-ring); }'
    );
    expect(findings.some((f) => f.rule === 'focus-clipped')).toBe(true);
  });

  it('passes once the outline is moved off the clipped element (outline: none + box-shadow)', () => {
    const findings = checkIdentity(
      'a.scss',
      '.x { @include ox-angled(44px); &:focus-visible { outline: none; box-shadow: inset 0 0 0 2px var(--ox-focus); } }'
    );
    expect(findings.filter((f) => f.rule === 'focus-clipped')).toEqual([]);
  });
});

describe('checkIdentity: watermark-contrast', () => {
  it('fails a watermark rule over the 0.06 ceiling', () => {
    const findings = checkIdentity('a.scss', '.ox-plan__watermark { opacity: 0.12; }');
    expect(findings.some((f) => f.rule === 'watermark-contrast')).toBe(true);
  });

  it('fails a watermark rule reading --ox-accent (BUILD 3.1)', () => {
    const findings = checkIdentity('a.scss', '.ox-plan__watermark { color: var(--ox-accent); }');
    expect(findings.some((f) => f.rule === 'watermark-contrast')).toBe(true);
  });

  it('passes a watermark at the shipped 0.06 ceiling in --ox-ink', () => {
    const findings = checkIdentity('a.scss', '.ox-x-watermark { opacity: 0.06; color: var(--ox-ink); }');
    expect(findings.filter((f) => f.rule === 'watermark-contrast')).toEqual([]);
  });
});

describe('walkBlocks / blockFamily', () => {
  it('scopes a selector to its own directly-owned declarations, not its children', () => {
    // Matches how _primitives.scss actually formats it: the parent's own
    // declaration on its own line, the single-line child rule after it.
    const source = ['.ox-btn {', '  @include ox-focus(2px);', '  &--s40 { @include ox-angled(40px); }', '}'].join(
      '\n'
    );
    const blocks = walkBlocks(source, source);
    const btn = blocks.find((b) => b.chain === '.ox-btn');
    const variant = blocks.find((b) => b.chain === '.ox-btn--s40');
    expect(btn?.lines.map((l) => l.stripped).join('')).toContain('ox-focus');
    expect(btn?.lines.map((l) => l.stripped).join('')).not.toContain('ox-angled');
    expect(variant?.lines.map((l) => l.stripped).join('')).toContain('ox-angled');
  });

  it('derives the BEM block family, stripping everything from -- or __ on', () => {
    expect(blockFamily('.ox-btn--s40')).toBe('ox-btn');
    expect(blockFamily('.ox-hero__edge')).toBe('ox-hero');
    expect(blockFamily('.ox-x-watermark')).toBe('ox-x-watermark');
  });
});

describe('mark-drift (the shipped sprite)', () => {
  it('the shipped #ox-mark path is byte-equal to the canonical X-IDENTITY §1.6 string', () => {
    const source = fs.readFileSync(SPRITE_FILE, 'utf8');
    const match = source.match(/<symbol id="ox-mark"[^>]*>[\s\S]*?<path[^>]*\sd="([^"]+)"/);
    expect(match?.[1]).toBe(CANONICAL_MARK_D);
  });
});

describe('the check-identity CLI', () => {
  const tmpDirs: string[] = [];
  afterEach(() => {
    for (const dir of tmpDirs.splice(0)) fs.rmSync(dir, { recursive: true, force: true });
  });

  it('plants a 45deg rotation in a temp file and fails against it', () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'check-identity-'));
    tmpDirs.push(dir);
    const file = path.join(dir, 'planted.scss');
    fs.writeFileSync(file, '.planted { transform: rotate(45deg); }\n');

    const findings = checkIdentity(file, fs.readFileSync(file, 'utf8'));
    expect(findings.some((f) => f.rule === 'angle-value')).toBe(true);
  });
});
