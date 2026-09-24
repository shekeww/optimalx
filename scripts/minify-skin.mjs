/**
 * Minifier for the live-store skin.
 *
 * Salla's custom code boxes cap at 65535 CHARACTERS each, and the copy is
 * Arabic, so a byte-based tool would overstate the size and cut content that
 * would have fitted. This counts characters.
 *
 * It is deliberately conservative: it removes comments and collapses
 * whitespace, and it does not rename anything. A skin that silently breaks on a
 * production storefront costs far more than the characters a clever pass saves.
 *
 * Usage: node scripts/minify-skin.mjs
 */

import { readFileSync, writeFileSync } from 'node:fs';

const CAP = 65535;
const DIR = 'docs/live-theme';

/** Strip JS comments and collapse whitespace, leaving strings and regexes alone. */
function minifyJs(src) {
  // LF, always. The source files are checked out with CRLF on Windows, and the
  // stylesheet this script carries inside a template literal keeps whatever
  // line endings it was read with, so the artifact differed from the same
  // artifact built anywhere else, byte for byte, while being identical CSS.
  // That is harmless to a browser and fatal to a read-back check: it reports a
  // mismatch on every publish and there is no way to tell that one from a real
  // one. Normalising here makes the comparison mean something.
  src = src.replace(/\r\n/g, '\n');
  let out = '';
  let i = 0;
  const n = src.length;
  const BS = String.fromCharCode(92); // backslash, written this way so no tool mangles it

  // True when the previous significant character means a `/` starts a regex
  // rather than a division: after these, a literal regex is legal.
  const regexAllowed = () => {
    for (let k = out.length - 1; k >= 0; k--) {
      const c = out[k];
      if (c === ' ' || c === '\n') continue;
      return '(,=:[!&|?{};+-*%<>~^'.includes(c);
    }
    return true;
  };

  while (i < n) {
    const c = src[i];
    const nx = i + 1 < n ? src[i + 1] : '';

    if (c === '/' && nx === '/') {
      const j = src.indexOf('\n', i);
      i = j < 0 ? n : j;
      continue;
    }
    if (c === '/' && nx === '*') {
      const j = src.indexOf('*/', i + 2);
      i = j < 0 ? n : j + 2;
      continue;
    }
    if (c === '"' || c === "'" || c === '`') {
      const quote = c;
      out += c;
      i++;
      while (i < n) {
        const d = src[i];
        out += d;
        if (d === BS) {
          if (i + 1 < n) out += src[i + 1];
          i += 2;
          continue;
        }
        i++;
        if (d === quote) break;
      }
      continue;
    }
    if (c === '/' && regexAllowed()) {
      // A regex literal: copy it verbatim, including its character class.
      out += c;
      i++;
      let inClass = false;
      while (i < n) {
        const d = src[i];
        out += d;
        if (d === BS) {
          if (i + 1 < n) out += src[i + 1];
          i += 2;
          continue;
        }
        i++;
        if (d === '[') inClass = true;
        else if (d === ']') inClass = false;
        else if (d === '/' && !inClass) break;
      }
      continue;
    }
    if (c === ' ' || c === '\t') {
      while (i < n && (src[i] === ' ' || src[i] === '\t')) i++;
      const prev = out[out.length - 1] ?? '';
      const next = i < n ? src[i] : '';
      // Keep one space only where removing it would join two tokens.
      if (/[A-Za-z0-9_$)\]]/.test(prev) && /[A-Za-z0-9_$([]/.test(next)) out += ' ';
      continue;
    }
    if (c === '\n' || c === '\r') {
      while (i < n && (src[i] === '\n' || src[i] === '\r' || src[i] === ' ' || src[i] === '\t')) i++;
      const prev = out[out.length - 1] ?? '';
      const next = i < n ? src[i] : '';
      // A newline can end a statement, so keep one unless it is clearly safe.
      if (prev && !'{};,([=+-*/<>!&|?:\n'.includes(prev) && next && !'})]'.includes(next)) out += '\n';
      continue;
    }
    out += c;
    i++;
  }
  return out.trim();
}

/**
 * Strip CSS comments and collapse whitespace.
 *
 * THE COLON IS HANDLED SEPARATELY, and this is the whole reason this function
 * is not three lines. Collapsing whitespace on BOTH sides of `:` also eats the
 * DESCENDANT COMBINATOR in front of a pseudo-class, so
 *
 *     .theme-raed :is(h1,h2,h3)      an h1 inside .theme-raed
 *
 * silently became
 *
 *     .theme-raed:is(h1,h2,h3)       an element that is BOTH
 *
 * which matches nothing, because `.theme-raed` is on <body>. Fifteen selectors
 * in this stylesheet are written that way and every one of them was being
 * dropped on the floor: the minified skin was a different stylesheet from the
 * source it was generated from, and nothing said so.
 *
 * So `{};,>~+` collapse on both sides, which is safe, none of them can be a
 * combinator that a preceding space is carrying meaning for, and `:` collapses
 * only AFTER itself. The cost is that `color : red` keeps one space; the source
 * does not write declarations that way, and correctness is worth the byte.
 */
function minifyCss(src) {
  let s = src.replace(/\/\*[\s\S]*?\*\//g, '');
  s = s.replace(/\s+/g, ' ');
  s = s.replace(/\s*([{};,>~+])\s*/g, '$1');
  s = s.replace(/:\s+/g, ':');
  s = s.replace(/;}/g, '}');
  return s.trim();
}

/**
 * A selector this minifier must not change the meaning of.
 *
 * ` :` is a DESCENDANT COMBINATOR followed by a pseudo-class, and losing the
 * space turns it into a compound selector that matches something else, or, as
 * happened here, nothing at all. This counts them on both sides and refuses to
 * write a file where the count moved. It is the specific regression that got
 * past review once, so it is the one with a guard on it.
 */
function countDescendantPseudo(css) {
  return (css.match(/[\w)\]] :(?:is|where|not|has|hover|focus|first|last|nth)/g) ?? []).length;
}

const jobs = [
  { from: 'optimalx-raed.css', to: 'optimalx-raed.min.css', fn: minifyCss, guard: countDescendantPseudo },
  { from: 'optimalx-raed.js', to: 'optimalx-raed.min.js', fn: minifyJs },
];

let over = false;
for (const job of jobs) {
  const src = readFileSync(`${DIR}/${job.from}`, 'utf8');
  const min = job.fn(src);
  if (job.guard) {
    const before = job.guard(src.replace(/\/\*[\s\S]*?\*\//g, ''));
    const after = job.guard(min);
    if (before !== after) {
      console.error(
        `\n${job.to}: REFUSED. ${before} descendant pseudo-class selectors in the source, ${after} in the output.\n` +
          `Minifying changed what the stylesheet selects. Fix minifyCss before shipping this.\n`
      );
      process.exit(1);
    }
  }
  writeFileSync(`${DIR}/${job.to}`, min + '\n', 'utf8');
  const fits = min.length <= CAP;
  if (!fits) over = true;
  console.log(
    `${job.to.padEnd(24)} ${String(src.length).padStart(7)} -> ${String(min.length).padStart(6)} chars  ${
      fits ? `fits, ${CAP - min.length} spare` : `OVER CAP by ${min.length - CAP}`
    }`
  );
}
process.exit(over ? 1 : 0);
