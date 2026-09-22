// Unit tests for scripts/gen-icon-mask.mjs: the pure transform functions, and
// the one thing that actually matters day to day — that the committed
// --ox-cart-glyph in app/styles/tokens.css is exactly what the generator
// would write from the sprite that ships beside it. A drift here is a stale
// mask: the sticky bar and the card's native add button would draw last
// week's cart shape while `<Icon name="cart">` draws today's.
import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  SPRITE,
  TARGET,
  SYMBOL_ID,
  readSymbolBody,
  maskDataUri,
  renderBlock,
  spliceBlock,
  START_MARKER,
  END_MARKER,
} from '../../scripts/gen-icon-mask.mjs';

describe('gen-icon-mask', () => {
  it('reads the ox-cart symbol body out of the sprite', () => {
    const source = fs.readFileSync(SPRITE, 'utf8');
    const body = readSymbolBody(source, SYMBOL_ID);
    expect(body).toContain('<path');
    expect(() => readSymbolBody(source, 'ox-does-not-exist')).toThrow();
  });

  it('strokes the outline and fills the accent element solid', () => {
    const uri = maskDataUri(
      "<path d=\"M0 0h1v1z\"/><path class=\"ox-icon__accent\" d=\"M2 2h1v1z\"/>"
    );
    expect(uri).toContain("d='M0 0h1v1z'/%3E");
    expect(uri).toContain("d='M2 2h1v1z' fill='%23000' stroke='none'/%3E");
    expect(uri).not.toContain("d='M0 0h1v1z' fill=");
  });

  it('throws on a <path> with no d attribute rather than emit a broken token', () => {
    expect(() => maskDataUri('<path class="ox-icon__accent"/>')).toThrow();
  });

  it('the committed app/styles/tokens.css token equals the generator output', () => {
    const spriteSource = fs.readFileSync(SPRITE, 'utf8');
    const expectedBlock = renderBlock(spriteSource);
    const current = fs.readFileSync(TARGET, 'utf8');
    expect(current).toContain(expectedBlock.trimEnd());
    expect(spliceBlock(current, expectedBlock)).toBe(current);
  });

  it('splices a fresh block in rather than duplicate markers on a second run', () => {
    const block = `${START_MARKER}\n:root {\n  --ox-cart-glyph: url("a");\n}\n${END_MARKER}\n`;
    const once = spliceBlock('body { color: red; }\n', block);
    const nextBlock = `${START_MARKER}\n:root {\n  --ox-cart-glyph: url("b");\n}\n${END_MARKER}\n`;
    const twice = spliceBlock(once, nextBlock);
    expect(twice.match(new RegExp(START_MARKER.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'))).toHaveLength(1);
    expect(twice).toContain('url("b")');
    expect(twice).not.toContain('url("a")');
  });

  it('TARGET points at the real tokens.css this theme loads', () => {
    expect(path.basename(TARGET)).toBe('tokens.css');
    expect(fs.existsSync(TARGET)).toBe(true);
  });
});
