// Unit tests for scripts/import-owner-icons.mjs: the pure transform
// functions, and the two things that actually matter day to day — that the
// generator is idempotent (a second run must not drift from the first, since
// its "remaining symbols" carry-forward reads whatever the previous run
// wrote), and that every id Icon.tsx names actually exists in the sprite it
// produces (a name with no symbol is a broken `<use>`).
import fs from 'node:fs';
import { describe, expect, it } from 'vitest';
import { OX_ICON_NAMES } from '../../app/components/common/Icon';
import {
  ALIASES,
  ALIAS_ATTRS,
  CATEGORY_ATTRS,
  ownerSvgInner,
  ownerSvgRootAttrs,
  convertAccentStyles,
  selfCloseEmptyTags,
  renderOwnerSymbol,
  renderSpriteAlias,
  parseSymbols,
  buildSpriteFile,
  generate,
  SPRITE_FILE,
} from '../../scripts/import-owner-icons.mjs';

describe('import-owner-icons: the owner source transform', () => {
  it('strips the metadata blob and the xmlns:c2pa attribute, keeping the children', () => {
    const source =
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" xmlns:c2pa="http://c2pa.org/manifest">' +
      '<metadata><c2pa:manifest>AAAA</c2pa:manifest></metadata>' +
      '<path d="M1 1h1v1z"></path></svg>';
    const inner = ownerSvgInner(source);
    expect(inner).toBe('<path d="M1 1h1v1z"></path>');
  });

  it('converts the stroke-accent style to our stroke accent class', () => {
    const out = convertAccentStyles('<path d="M0 0h1v1z" style="stroke:var(--ox-accent,#FF4A1A)"></path>');
    expect(out).toBe('<path d="M0 0h1v1z" class="ox-icon__accent ox-icon__accent--stroke"></path>');
  });

  it('converts both fill-accent style forms to our fill accent class, with an explicit stroke="none"', () => {
    const withStrokeNone = convertAccentStyles(
      '<circle r="1" style="fill:var(--ox-accent,#FF4A1A);stroke:none"></circle>'
    );
    expect(withStrokeNone).toBe('<circle r="1" class="ox-icon__accent" stroke="none"></circle>');
    const withoutStrokeNone = convertAccentStyles(
      '<path d="M0 0z" style="fill:var(--ox-accent,#FF4A1A)"></path>'
    );
    expect(withoutStrokeNone).toBe('<path d="M0 0z" class="ox-icon__accent" stroke="none"></path>');
  });

  it('never leaves a literal colour behind', () => {
    expect(convertAccentStyles('<path d="M0 0z" style="stroke:var(--ox-accent,#FF4A1A)"></path>')).not.toMatch(
      /#[0-9a-fA-F]{3,6}/
    );
  });

  it('throws rather than silently drop an unrecognised style with a literal colour', () => {
    expect(() => convertAccentStyles('<path d="M0 0z" style="fill:#123456"></path>')).toThrow();
  });

  it('self-closes empty path/circle/rect tags, leaving <g> alone', () => {
    const out = selfCloseEmptyTags(
      '<path d="M0 0z"></path><circle cx="1" cy="1" r="1"></circle><rect x="0" y="0"></rect>' +
        '<g transform="rotate(-45 1 1)"><path d="M1 1z"></path></g>'
    );
    expect(out).toBe(
      '<path d="M0 0z"/><circle cx="1" cy="1" r="1"/><rect x="0" y="0"/>' +
        '<g transform="rotate(-45 1 1)"><path d="M1 1z"/></g>'
    );
  });

  it('renders a full <symbol> with our shell attributes and, optionally, data-mirror', () => {
    const source =
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M1 1h1v1z"></path></svg>';
    const symbol = renderOwnerSymbol('ox-example', source, true);
    expect(symbol).toBe(
      '<symbol id="ox-example" viewBox="0 0 24 24" class="ox-sym" fill="none" stroke="currentColor" ' +
        'stroke-width="2" stroke-linecap="square" stroke-linejoin="miter" stroke-miterlimit="4" ' +
        'data-mirror="1"><path d="M1 1h1v1z"/></symbol>'
    );
    expect(renderOwnerSymbol('ox-example', source, false)).not.toContain('data-mirror');
  });

  it('parses every <symbol id="…"> in document order', () => {
    const source = '<svg><symbol id="ox-a" viewBox="0 0 24 24"><path d="M0 0z"/></symbol>' +
      '<symbol id="ox-b" viewBox="0 0 24 24"><path d="M1 1z"/></symbol></svg>';
    expect(parseSymbols(source).map((s) => s.id)).toEqual(['ox-a', 'ox-b']);
  });

  // Item 1 of the owner's 2026-09-24 brief: honour a source root's own
  // viewBox/stroke-width/caps/joins/overflow instead of discarding them.
  it('reads only the five overridable attributes off the source root, when present', () => {
    const full =
      '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="1 1 22 22" fill="none" ' +
      'stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round" ' +
      'overflow="visible"><path d="M1 1z"/></svg>';
    expect(ownerSvgRootAttrs(full)).toEqual({
      viewBox: '1 1 22 22',
      'stroke-width': '2.3',
      'stroke-linecap': 'round',
      'stroke-linejoin': 'round',
      overflow: 'visible',
    });
    const bare = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M1 1z"/></svg>';
    expect(ownerSvgRootAttrs(bare)).toEqual({ viewBox: '0 0 24 24' });
  });

  it("carries the source root's own overridable attributes onto the symbol, in place of the shell defaults", () => {
    const source =
      '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="1 1 22 22" fill="none" ' +
      'stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round" ' +
      'overflow="visible"><path d="M1 1h1v1z"/></svg>';
    const symbol = renderOwnerSymbol('ox-example', source, false);
    expect(symbol).toBe(
      '<symbol id="ox-example" viewBox="1 1 22 22" class="ox-sym" fill="none" stroke="currentColor" ' +
        'stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round" stroke-miterlimit="4" ' +
        'overflow="visible"><path d="M1 1h1v1z"/></symbol>'
    );
  });

  // Item 2 of the owner's 2026-09-24 brief: round the product-category
  // corners, caps stay square, even though the category source files spell
  // out the default stroke-linejoin="miter" themselves.
  it("applies a category attribute override on top of the shell and the source's own attrs", () => {
    const source =
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" stroke-linejoin="miter">' +
      '<path d="M1 1h1v1z"/></svg>';
    const symbol = renderOwnerSymbol('ox-protein', source, false, CATEGORY_ATTRS['product-categories']);
    expect(symbol).toContain('stroke-linejoin="round"');
    expect(symbol).toContain('stroke-linecap="square"');
  });

  // S9j, 2026-09-25: an alias can repaint its source rather than only copy
  // it, so `star-fill` can be `star` painted solid instead of outlined.
  it('applies an attribute override on top of the shell, winning over the plain fill="none" default', () => {
    const source =
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M1 1h1v1z"/></svg>';
    const symbol = renderOwnerSymbol('ox-star-fill', source, false, {}, ALIAS_ATTRS['star-fill']);
    expect(symbol).toContain('fill="currentColor"');
    expect(symbol).toContain('stroke="currentColor"');
    expect(symbol).not.toContain('fill="none"');
  });

  it('leaves fill="none" untouched when no attribute override is given', () => {
    const source =
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M1 1h1v1z"/></svg>';
    expect(renderOwnerSymbol('ox-example', source, false)).toContain('fill="none"');
  });

  // `star-fill`'s source, `star`, is not one of the owner's 47: this is the
  // fallback alias path that copies an existing sprite symbol instead of an
  // owner file.
  it('renders an alias from an existing sprite symbol, applying the same attribute overrides', () => {
    const existing = '<symbol id="ox-star" viewBox="0 0 24 24" class="ox-sym" fill="none" ' +
      'stroke="currentColor" stroke-width="2" stroke-linecap="square" stroke-linejoin="miter" ' +
      'stroke-miterlimit="4"><path d="M12 2 22 9 12 17Z"/></symbol>';
    const symbol = renderSpriteAlias('ox-star-fill', existing, { fill: 'currentColor' });
    expect(symbol).toBe(
      '<symbol id="ox-star-fill" viewBox="0 0 24 24" class="ox-sym" fill="currentColor" ' +
        'stroke="currentColor" stroke-width="2" stroke-linecap="square" stroke-linejoin="miter" ' +
        'stroke-miterlimit="4"><path d="M12 2 22 9 12 17Z"/></symbol>'
    );
  });
});

describe('import-owner-icons: assembly and idempotency', () => {
  it('assembles the three symbol groups into one sprite, in order', () => {
    const out = buildSpriteFile({
      ownerSymbols: ['<symbol id="ox-owner">o</symbol>'],
      aliasSymbols: ['<symbol id="ox-alias">a</symbol>'],
      carryForward: [{ id: 'ox-legacy', full: '<symbol id="ox-legacy">l</symbol>' }],
    });
    expect(out.indexOf('ox-owner')).toBeLessThan(out.indexOf('ox-alias'));
    expect(out.indexOf('ox-alias')).toBeLessThan(out.indexOf('ox-legacy'));
    expect(out.startsWith('<svg')).toBe(true);
    expect(out.trimEnd().endsWith('</svg>')).toBe(true);
  });

  // The generator's carry-forward step reads whatever sprite is already on
  // disk for the symbols the owner's set does not cover, so two consecutive
  // runs — the second reading the first's output — must produce identical
  // bytes. A generator that drifts on a second run would slowly rot the
  // committed sprite every time this script is re-run.
  it('is idempotent: generating twice from the committed sprite yields the same bytes', () => {
    const committed = fs.readFileSync(SPRITE_FILE, 'utf8');
    const once = generate();
    expect(once).toBe(committed);
    const twice = generate();
    expect(twice).toBe(once);
  });

  it('ships a symbol for every id Icon.tsx names', () => {
    const source = fs.readFileSync(SPRITE_FILE, 'utf8');
    const ids = new Set(parseSymbols(source).map((s) => s.id));
    const missing = OX_ICON_NAMES.filter((name) => !ids.has(`ox-${name}`));
    expect(missing).toEqual([]);
  });

  it('every alias id is one of the ids Icon.tsx names', () => {
    for (const id of Object.keys(ALIASES)) {
      expect((OX_ICON_NAMES as readonly string[])).toContain(id);
    }
  });

  // S9j, 2026-09-25: `star-fill` is generated, not hand-added to the sprite,
  // and carries its ALIAS_ATTRS override on the committed file.
  it('generates ox-star-fill as a solid copy of ox-star', () => {
    const source = fs.readFileSync(SPRITE_FILE, 'utf8');
    const symbols = new Map(parseSymbols(source).map((s) => [s.id, s.full]));
    expect(symbols.get('ox-star-fill')).toContain('fill="currentColor"');
    expect(symbols.get('ox-star-fill')).toContain('stroke="currentColor"');
    const starPath = symbols.get('ox-star')?.match(/<path d="([^"]+)"/)?.[1];
    const fillPath = symbols.get('ox-star-fill')?.match(/<path d="([^"]+)"/)?.[1];
    expect(fillPath).toBe(starPath);
  });
});
