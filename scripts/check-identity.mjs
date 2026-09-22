// Identity lint (X-IDENTITY-2026-09-22.md §7.1): the mark re-derived the
// angle system from 22deg to 34deg, and this gate is what stops it drifting
// back or spreading to a size the mark's own construction forbids.
//
// Same shape as check-rtl.mjs / check-motion.mjs: reuses their `listFiles`,
// `isAllowed`, `stripComments` and `hasPragma`, and check-motion's selector
// resolver, prints one finding per line as `file:line [rule] text`, exits 1
// on any finding.
//
// Rules (one finding per line unless noted):
//   angle-value    a rotate()/skew()/--ox-angle* degree value, mod 180, that
//                  is not 0, 34, 56 or 90
//   angle-tan      a numeric literal used as an angle tangent that is not
//                  0.6745 (or the unrounded 0.6745085) — catches a stale
//                  0.404/0.4040
//   polygon-slope  a `polygon()` call whose points are percentages, with no
//                  `/* identity: NNdeg, run N of M */` pragma above it (a
//                  percentage pair's angle depends on the box aspect — §2.5 —
//                  so it cannot be verified statically without one)
//   one-angled-per-block   a single selector's own declarations mixing more
//                  than one kind of angled construction (a corner cut and a
//                  step edge, say) — §3.3 "one angled gesture per component".
//                  `ox-angled()` itself is one kind; two `ox-angled()` calls
//                  in sibling *modifier* selectors (`.ox-btn--s40` next to
//                  `.ox-btn--s44`) are mutually exclusive by construction and
//                  are not what this rule is for, so it counts *kinds*
//                  within one selector's own body, not selectors across a
//                  BEM family
//   small-angle    an angled primitive on a selector whose own declarations
//                  also carry block-size/min-block-size/height below 158px
//                  (the 3.2 law). `ox-angled()` is exempted by name — §3.2's
//                  own text: it is a control-scale mark, "never inside the
//                  158px case to begin with". A notch (`ox-x-notch`/
//                  `ox-notch`) is axis-aligned and never a finding.
//   section-identity   a home section file with no accent, no angled
//                  primitive and no watermark anywhere in its own text —
//                  self-contained (does not cross into the paired stylesheet)
//   unmirrored     a `skew`/`skewX`/`skewY` not wrapped in
//                  `calc(var(--direction-factor) * …)`, or a file with a
//                  `polygon(` and no `[dir='ltr']` counterpart anywhere in it
//   mark-drift     the `d` of `#ox-mark` in app/assets/ox-sprite.svg not
//                  byte-equal to the string in X-IDENTITY §1.6
//   watermark-contrast   a watermark-named rule (`.ox-*watermark*`) whose own
//                  opacity exceeds 0.06 (every §4.1 row ships at 0.06, the
//                  conservative floor across every ground), or that reads
//                  `--ox-accent` (BUILD 3.1 — no watermark may carry it)
//   focus-clipped  a selector's own declarations combining an angled
//                  primitive with `@include ox-focus` or a bare, non-`none`
//                  `outline:`, and no `::before`/`::after` opened in the same
//                  block to carry the clip instead
//
// Scope: app/** (default). Comments are stripped before matching except
// where a rule is explicitly about a comment pragma. Usage:
//   node scripts/check-identity.mjs [path ...]
// Exits 1 on a finding.

import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { listFiles, isAllowed, stripComments, hasPragma } from './check-rtl.mjs';
import { resolveSelector } from './check-motion.mjs';

/** Same reasoning as check-rtl's and check-motion's lists: inherited Raed
 * scaffolding only; the OptimalX layer is 06-ox and app/components. */
export const ALLOWLIST = [
  'app/styles/01-settings/',
  'app/styles/02-generic/',
  'app/styles/03-elements/',
  'app/styles/04-components/',
  'app/styles/05-utilities/',
];

/** The canonical `#ox-mark` path, byte-equal to X-IDENTITY-2026-09-22.md §1.6. */
export const CANONICAL_MARK_D =
  "M15.136 1.393 L21.892 1.393 L15.591 10.735 L9.557 10.735 L9.196 10.199 Z M8.307 11.903 L13.53 11.903 L14.365 13.14 L7.98 22.607 L1.087 22.607 Z M0 7.427 L6.431 7.427 L10.5 13.46 L4.069 13.46 Z M12.841 9.567 L19.406 9.567 L24 16.379 L17.436 16.379 Z";
export const SPRITE_FILE = path.join('app', 'assets', 'ox-sprite.svg');

const ALLOWED_DEGREES = new Set([0, 34, 56, 90]);
const DEGREE_TOLERANCE = 0.05;

/** Mixins that draw the mark's own leaned-and-ledged construction, per §3.4. */
const LEAN_MIXINS = ['ox-wedge-corner', 'ox-wedge-photo-stroked', 'ox-wedge-stroke', 'ox-wedge', 'ox-lean-corner'];
const STEP_MIXINS = ['ox-step-edge', 'ox-x-step'];
const CORNER_MIXINS = ['ox-x-corner'];
/** `ox-angled()` is deliberately not in any of the three kinds above: §3.2
 * names it by name as the control-scale exception the 158px law never
 * reached, and §3.3's "one gesture per block" is about a panel/card mixing
 * *techniques*, not a button owning its one parallelogram. */
const ANGLED_MIXIN_RE = /@include\s+(ox-angled|ox-wedge[\w-]*|ox-lean-corner|ox-step-edge|ox-x-corner|ox-x-step)\s*\(/;
const NOTCH_MIXIN_RE = /@include\s+(ox-notch|ox-x-notch)\s*\(/;
const RAW_POLYGON_RE = /clip-path\s*:\s*polygon\(/;
const SKEW_RE = /(^|[^-\w])skewX?\s*\(/;

/**
 * @param {string} bodyText  the concatenation of one selector's own stripped
 *   declaration lines (not its nested children's)
 * @returns {boolean}
 */
function carriesAngledPrimitive(bodyText) {
  return ANGLED_MIXIN_RE.test(bodyText) || (RAW_POLYGON_RE.test(bodyText) && !NOTCH_MIXIN_RE.test(bodyText)) || SKEW_RE.test(bodyText);
}

/** Which "kind" of angled construction a body carries, for one-angled-per-block. */
function angledKinds(bodyText) {
  const kinds = new Set();
  const mixinCall = bodyText.match(ANGLED_MIXIN_RE);
  if (mixinCall) {
    const name = mixinCall[1];
    if (CORNER_MIXINS.includes(name)) kinds.add('corner');
    else if (STEP_MIXINS.includes(name)) kinds.add('step');
    else if (LEAN_MIXINS.some((m) => name.startsWith(m))) kinds.add('lean');
    else kinds.add('angled');
  }
  if (RAW_POLYGON_RE.test(bodyText) && !NOTCH_MIXIN_RE.test(bodyText)) kinds.add('polygon');
  if (SKEW_RE.test(bodyText)) kinds.add('skew');
  return kinds;
}

/** `ox-angled()` is exempt from the 158px law by name (§3.2). */
function carriesSmallAngleTarget(bodyText) {
  if (RAW_POLYGON_RE.test(bodyText) && !NOTCH_MIXIN_RE.test(bodyText)) return true;
  if (SKEW_RE.test(bodyText)) return true;
  const mixinCall = bodyText.match(ANGLED_MIXIN_RE);
  if (!mixinCall) return false;
  return mixinCall[1] !== 'ox-angled';
}

/**
 * Walks a stylesheet brace by brace (the same technique check-motion's
 * `checkWedgeMotion` uses for its selector stack), but also buffers each
 * frame's own directly-owned lines — not its nested children's — so a rule
 * can be inspected in isolation from whatever it nests.
 * @param {string} stripped  comment-stripped source
 * @param {string} raw       original source, same line count
 * @returns {{ selector: string, chain: string, lines: { line: number, raw: string, stripped: string }[] }[]}
 */
export function walkBlocks(stripped, raw) {
  const results = [];
  const lines = stripped.split(/\r?\n/);
  const rawLines = raw.split(/\r?\n/);
  const stack = [];
  let pendingSelector = '';

  lines.forEach((line, index) => {
    let pos = 0;
    for (;;) {
      const nextOpen = line.indexOf('{', pos);
      const nextClose = line.indexOf('}', pos);
      if (nextOpen === -1 && nextClose === -1) {
        const chunk = line.slice(pos);
        if (stack.length) {
          stack[stack.length - 1].lines.push({ line: index + 1, raw: rawLines[index], stripped: chunk });
        } else if (chunk.trim()) {
          pendingSelector += ` ${chunk}`;
        }
        break;
      }
      if (nextOpen !== -1 && (nextClose === -1 || nextOpen < nextClose)) {
        const selectorText = `${pendingSelector} ${line.slice(pos, nextOpen)}`.trim();
        pendingSelector = '';
        const parentChain = stack.length ? stack[stack.length - 1].chain : '';
        const chain = resolveSelector(selectorText || '&', parentChain);
        const frame = { selector: selectorText, chain, lines: [] };
        stack.push(frame);
        results.push(frame);
        pos = nextOpen + 1;
        continue;
      }
      const chunk = line.slice(pos, nextClose);
      if (stack.length && chunk.trim()) {
        stack[stack.length - 1].lines.push({ line: index + 1, raw: rawLines[index], stripped: chunk });
      }
      if (stack.length) stack.pop();
      pos = nextClose + 1;
    }
  });

  return results;
}

/** The class token's block family: everything before the first `--`/`__`. */
export function blockFamily(selectorOrChain) {
  const match = selectorOrChain.match(/\.((?:ox|s)-[a-zA-Z0-9-]+)/);
  if (!match) return null;
  return match[1].split(/--|__/)[0];
}

/**
 * Every degree literal attached to `rotate(`, `skew(`/`skewX(`/`skewY(` or an
 * `--ox-angle*` custom property declaration, mod 180.
 * @param {string} file
 * @param {string} stripped
 * @param {string[]} rawLines
 */
function checkAngleValue(file, stripped, rawLines) {
  const findings = [];
  const lines = stripped.split(/\r?\n/);
  const DEG_CONTEXT = /(rotate|skewX?|skewY?)\s*\(\s*(-?[\d.]+)deg|--ox-angle[\w-]*\s*:\s*(-?[\d.]+)deg/g;
  lines.forEach((line, index) => {
    let match;
    DEG_CONTEXT.lastIndex = 0;
    while ((match = DEG_CONTEXT.exec(line))) {
      const raw = Number(match[2] ?? match[3]);
      if (Number.isNaN(raw)) continue;
      const normalised = ((raw % 180) + 180) % 180;
      const ok = [...ALLOWED_DEGREES].some((allowed) => Math.abs(normalised - allowed) <= DEGREE_TOLERANCE);
      if (!ok && !hasPragma(rawLines[index], 'angle-value')) {
        findings.push({ file, line: index + 1, rule: 'angle-value', text: rawLines[index].trim() });
      }
    }
  });
  return findings;
}

/**
 * A numeric literal assigned to something naming an angle tangent that is
 * not 0.6745 (the rounded value used throughout the theme) or 0.6745085
 * (the unrounded constant it comes from); also flags the specific stale
 * 0.404/0.4040 wherever it appears as its own token.
 */
function checkAngleTan(file, stripped, rawLines) {
  const findings = [];
  const lines = stripped.split(/\r?\n/);
  const TAN_DECL = /(ox-angle-tan|angle-tan)\s*:\s*([\d.]+)/;
  const STALE_TOKEN = /(^|[^\d.])0\.404(0)?([^\d]|$)/;
  lines.forEach((line, index) => {
    const declared = line.match(TAN_DECL);
    if (declared && !['0.6745', '0.6745085'].includes(declared[2]) && !hasPragma(rawLines[index], 'angle-tan')) {
      findings.push({ file, line: index + 1, rule: 'angle-tan', text: rawLines[index].trim() });
      return;
    }
    if (STALE_TOKEN.test(line) && !hasPragma(rawLines[index], 'angle-tan')) {
      findings.push({ file, line: index + 1, rule: 'angle-tan', text: rawLines[index].trim() });
    }
  });
  return findings;
}

/**
 * A `polygon()` whose points are percentages must carry a
 * `/* identity: NNdeg, run N of M *\/` pragma within the two lines above it
 * (§2.5/§7.1: a percentage pair's angle is not resolvable without knowing
 * the box, so the pragma is the only static check available).
 */
function checkPolygonSlope(file, stripped, rawLines) {
  const findings = [];
  const lines = stripped.split(/\r?\n/);
  lines.forEach((line, index) => {
    const openIndex = line.indexOf('polygon(');
    if (openIndex < 0) return;
    // Gather the polygon call, which may span more than one line.
    let call = line.slice(openIndex);
    let cursor = index;
    while (!call.includes(')') && cursor + 1 < lines.length) {
      cursor += 1;
      call += ` ${lines[cursor]}`;
    }
    // A polygon built from px/calc()/Sass-interpolated runs (ox-run() and
    // friends) is fully resolvable — `0%`/`100%` box edges paired with a
    // computed px offset carry no aspect ambiguity. Only a *literal*
    // percentage away from the box's own 0/100 edges is the case §2.5/§7.1
    // mean: its angle depends on the box aspect and cannot be checked
    // statically, so it needs the `/* identity: NNdeg, run N of M */` pragma.
    const percentTokens = call.match(/\d+(\.\d+)?%/g) ?? [];
    const hasDiagonalPercent = percentTokens.some((token) => !['0%', '100%'].includes(token));
    if (!hasDiagonalPercent) return;
    const context = [rawLines[index - 2], rawLines[index - 1], rawLines[index]].filter(Boolean).join('\n');
    if (!/identity:\s*\d+(\.\d+)?deg,\s*run/.test(context) && !hasPragma(rawLines[index], 'polygon-slope')) {
      findings.push({ file, line: index + 1, rule: 'polygon-slope', text: rawLines[index].trim() });
    }
  });
  return findings;
}

// `blockFamily` strips everything from the first `--`/`__` on, so
// `.ox-footer__wedge` resolves to the family `ox-footer`, not
// `ox-footer__wedge` — named here as what the function actually produces.
const EXEMPT_SMALL_ANGLE_FAMILIES = new Set(['ox-footer', 'ox-x-divider']);

/** §3.2/§3.3 rules that need a selector's own (non-nested) declaration text. */
function checkBlockScopedRules(file, blocks, rawLinesLength) {
  const findings = [];
  const familyAngledCounts = new Map(); // family -> Set(kind)

  for (const block of blocks) {
    if (!block.lines.length) continue;
    const bodyStripped = block.lines.map((l) => l.stripped).join('\n');
    const firstLine = block.lines[0].line;
    const family = blockFamily(block.chain) ?? blockFamily(block.selector);

    // one-angled-per-block: more than one *kind* of angled construction
    // mixed into one selector's own declarations.
    const kinds = angledKinds(bodyStripped);
    if (kinds.size > 1) {
      findings.push({
        file,
        line: firstLine,
        rule: 'one-angled-per-block',
        text: `"${block.selector.trim() || block.chain}" mixes ${[...kinds].join('+')} in one rule`,
      });
    }
    if (family && kinds.size) {
      if (!familyAngledCounts.has(family)) familyAngledCounts.set(family, new Set());
      for (const kind of kinds) familyAngledCounts.get(family).add(kind);
    }

    // small-angle: an angled primitive (ox-angled() exempted) alongside a
    // sub-158px block-size/min-block-size/height in the same declarations.
    if (carriesSmallAngleTarget(bodyStripped) && !EXEMPT_SMALL_ANGLE_FAMILIES.has(family ?? '')) {
      const sizeMatch = bodyStripped.match(/(?:^|;|\{)\s*(block-size|min-block-size|height)\s*:\s*([\d.]+)px/);
      if (sizeMatch && Number(sizeMatch[2]) < 158) {
        const sizeLine = block.lines.find((l) => l.stripped.includes(sizeMatch[0].trim()))?.line ?? firstLine;
        if (!hasPragma(rawLinesLength[sizeLine - 1] ?? '', 'small-angle')) {
          findings.push({
            file,
            line: sizeLine,
            rule: 'small-angle',
            text: `"${block.selector.trim() || block.chain}" is ${sizeMatch[1]} ${sizeMatch[2]}px with an angled primitive`,
          });
        }
      }
    }

    // focus-clipped: an angled primitive and a live outline in the same
    // selector's own declarations, with no ::before/::after opened here to
    // carry the clip instead.
    const hasAngled = carriesAngledPrimitive(bodyStripped);
    const hasFocus = /@include\s+ox-focus\s*\(/.test(bodyStripped) || /(^|[^-\w])outline\s*:\s*(?!none)/.test(bodyStripped);
    const hasPseudo = /&::(before|after)/.test(bodyStripped) || block.selector.includes('::before') || block.selector.includes('::after');
    if (hasAngled && hasFocus && !hasPseudo) {
      if (!hasPragma(block.lines[0].raw, 'focus-clipped')) {
        findings.push({
          file,
          line: firstLine,
          rule: 'focus-clipped',
          text: `"${block.selector.trim() || block.chain}" combines an angled primitive with a live outline`,
        });
      }
    }

    // watermark-contrast: a watermark-named rule over the 0.06 ceiling, or
    // one that reads --ox-accent (BUILD 3.1: no watermark may carry it).
    if (/watermark/i.test(block.selector) || /watermark/i.test(block.chain)) {
      const opacityMatch = bodyStripped.match(/(^|[^-\w])opacity\s*:\s*([\d.]+)/);
      if (opacityMatch && Number(opacityMatch[2]) > 0.06 && !hasPragma(block.lines[0].raw, 'watermark-contrast')) {
        findings.push({
          file,
          line: firstLine,
          rule: 'watermark-contrast',
          text: `"${block.selector.trim() || block.chain}" opacity ${opacityMatch[2]} exceeds the 0.06 ceiling`,
        });
      }
      if (/var\(\s*--ox-accent\b/.test(bodyStripped) && !hasPragma(block.lines[0].raw, 'watermark-contrast')) {
        findings.push({
          file,
          line: firstLine,
          rule: 'watermark-contrast',
          text: `"${block.selector.trim() || block.chain}" reads --ox-accent (BUILD 3.1)`,
        });
      }
    }
  }

  return findings;
}

/** `skew`/`skewX`/`skewY` with no `direction-factor` in the same call; a file
 * with a `polygon(` and nowhere carrying `[dir='ltr']`. */
function checkUnmirrored(file, stripped, rawLines) {
  const findings = [];
  const lines = stripped.split(/\r?\n/);
  lines.forEach((line, index) => {
    // `var(--ox-skew)` is itself `calc(var(--direction-factor) * var(--ox-angle))`
    // (tokens.css), so a call site that reads the token is already mirrored
    // one level up — only a skew built from something else, with no
    // direction-factor anywhere in the call, is a real finding.
    const mirrored = line.includes('direction-factor') || line.includes('--ox-skew');
    if (SKEW_RE.test(line) && !mirrored && !hasPragma(rawLines[index], 'unmirrored')) {
      findings.push({ file, line: index + 1, rule: 'unmirrored', text: rawLines[index].trim() });
    }
  });
  if (stripped.includes('polygon(') && !stripped.includes("[dir='ltr']") && !stripped.includes('[dir="ltr"]')) {
    const firstPolygonLine = lines.findIndex((line) => line.includes('polygon('));
    if (firstPolygonLine >= 0 && !hasPragma(rawLines[firstPolygonLine], 'unmirrored')) {
      findings.push({
        file,
        line: firstPolygonLine + 1,
        rule: 'unmirrored',
        text: `polygon() with no [dir='ltr'] counterpart anywhere in ${file}`,
      });
    }
  }
  return findings;
}

/**
 * §6's surface matrix names the home sections that carry a primitive "by
 * decision"; product rails, posters, guides, brands and the newsletter are
 * named "by decision" the *other* way (no primitive at all) and are not
 * checked. A home section's markup only ever carries a semantic class name —
 * every declaration lives in the paired `06-ox` stylesheet — so pairing a
 * `.tsx` file to "no accent/angle/watermark anywhere in it" is not a
 * meaningful check for this codebase (every home `.tsx` file would fail it
 * identically, styled or not) and would need real cross-file resolution to
 * mean anything. This checks the thing that is actually verifiable: each
 * named block *family* in the compiled stylesheet corpus carries at least
 * one of the three signals somewhere among its own selectors — a regression
 * guard, not a fresh audit of every section, and the block-family mapping is
 * literal (verified against the working tree on 2026-09-22), not inferred.
 */
// `ox-need` swapped for `ox-tile` (S2e, 2026-09-22): the owner reverted the
// "shop by need" merge into two sections again, so the merged `OxNeeds`/
// `NeedCard` component and every `.ox-need*` rule are gone from the corpus.
// `ox-tile` (`CategoryTile.tsx`/`_b2-home.scss`) is the type grid's card
// family now, the direct analogue of `ox-goal` for its own section - the
// representative CARD family, not the `ox-cats` grid wrapper, matching how
// this list already tracks `ox-goal` rather than `ox-goals`.
export const HOME_SECTION_FAMILIES = ['ox-hero', 'ox-tile', 'ox-goal', 'ox-plan', 'ox-bband', 'ox-tab', 'ox-footer'];

function checkSectionIdentity(blocksByFile) {
  const familyHasSignal = new Map(HOME_SECTION_FAMILIES.map((family) => [family, false]));
  for (const blocks of Object.values(blocksByFile)) {
    for (const block of blocks) {
      const family = blockFamily(block.chain) ?? blockFamily(block.selector);
      if (!family || !familyHasSignal.has(family)) continue;
      const bodyStripped = block.lines.map((l) => l.stripped).join('\n');
      const signal =
        /var\(\s*--ox-accent/.test(bodyStripped) ||
        carriesAngledPrimitive(bodyStripped) ||
        /watermark/i.test(block.selector) ||
        /watermark/i.test(block.chain);
      if (signal) familyHasSignal.set(family, true);
    }
  }
  const findings = [];
  for (const [family, has] of familyHasSignal) {
    if (!has) {
      findings.push({
        file: 'app/styles/06-ox',
        line: 1,
        rule: 'section-identity',
        text: `block family .${family} carries no accent, angled primitive or watermark anywhere in the corpus`,
      });
    }
  }
  return findings;
}

/** The sprite's `#ox-mark` `d` must be byte-equal to X-IDENTITY §1.6. */
function checkMarkDrift() {
  if (!fs.existsSync(SPRITE_FILE)) return [];
  const source = fs.readFileSync(SPRITE_FILE, 'utf8');
  const match = source.match(/<symbol id="ox-mark"[^>]*>[\s\S]*?<path[^>]*\sd="([^"]+)"/);
  if (!match) return [{ file: SPRITE_FILE, line: 1, rule: 'mark-drift', text: '#ox-mark symbol not found' }];
  if (match[1] !== CANONICAL_MARK_D) {
    return [{ file: SPRITE_FILE, line: 1, rule: 'mark-drift', text: '#ox-mark path does not match X-IDENTITY §1.6' }];
  }
  return [];
}

/**
 * Per-file findings only — angle-value/angle-tan (any file) and, for a
 * stylesheet, polygon-slope/unmirrored/the block-scoped rules. The corpus-
 * level `section-identity` rule is run once from `main`, not per file.
 * @param {string} file
 * @param {string} text  original source
 * @returns {{ file: string, line: number, rule: string, text: string }[]}
 */
export function checkIdentity(file, text) {
  const stripped = stripComments(text);
  const rawLines = text.split(/\r?\n/);
  const findings = [
    ...checkAngleValue(file, stripped, rawLines),
    ...checkAngleTan(file, stripped, rawLines),
  ];
  if (file.endsWith('.scss') || file.endsWith('.css')) {
    findings.push(...checkPolygonSlope(file, stripped, rawLines));
    findings.push(...checkUnmirrored(file, stripped, rawLines));
    const blocks = walkBlocks(stripped, text);
    findings.push(...checkBlockScopedRules(file, blocks, rawLines));
  }
  return findings.sort((a, b) => a.line - b.line);
}

function main(args) {
  const roots = args.length ? args : ['app'];
  const files = roots.flatMap((root) => listFiles(root)).filter((file) => !isAllowed(file, ALLOWLIST));
  let problems = 0;
  const blocksByFile = {};
  for (const file of files) {
    const text = fs.readFileSync(file, 'utf8');
    for (const f of checkIdentity(file, text)) {
      problems++;
      console.error(`${f.file}:${f.line} [${f.rule}] ${f.text}`);
    }
    if (file.endsWith('.scss') || file.endsWith('.css')) {
      blocksByFile[file] = walkBlocks(stripComments(text), text);
    }
  }
  for (const f of [...checkSectionIdentity(blocksByFile), ...checkMarkDrift()]) {
    problems++;
    console.error(`${f.file}:${f.line} [${f.rule}] ${f.text}`);
  }
  console.log(`check-identity: ${files.length} file(s), ${problems} problem(s)`);
  return problems === 0 ? 0 : 1;
}

const invokedDirectly =
  process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href;
if (invokedDirectly) process.exitCode = main(process.argv.slice(2));
