/**
 * Dependency-free HTML sanitiser for merchant-authored product and article
 * copy (PLAN-final C6). SSR runs in workerd, so a DOM-based sanitiser is not
 * an option and no new dependency may be added; this is a hand-written
 * tokenizer with a strict tag and attribute allowlist.
 *
 * Contract:
 *  - the output is re-serialised from the parsed token tree, never spliced
 *    out of the input, so an attacker cannot smuggle markup past the parser
 *    by exploiting a difference between what we matched and what a browser
 *    would match;
 *  - text is entity-decoded once and then re-escaped, so `&#106;avascript:`
 *    and `&lt;script&gt;` can never become live markup;
 *  - a tag outside the allowlist is unwrapped (its text survives, the element
 *    does not); a tag in RAW_DROP takes its whole subtree with it;
 *  - attributes are dropped unless the element explicitly allows them, so
 *    `style`, `on*`, `srcset`, `formaction` and friends never reach the DOM;
 *  - `a[href]` accepts http, https, protocol-less relative paths, `?` queries
 *    and `#` fragments only, and always gains rel="nofollow noopener".
 *
 * No regular expressions and no backslash escapes: this file is scanned by
 * hand over char codes because the repo's tooling has mangled escapes before
 * (PLAN-final 2.3, last bullet).
 */

/** Text node: `value` is decoded, unescaped text. */
export interface OxTextNode {
  type: 'text';
  value: string;
}

/** Element node: `tag` is lower case and always in the allowlist. */
export interface OxElementNode {
  type: 'element';
  tag: string;
  attrs: Record<string, string>;
  children: OxNode[];
}

export type OxNode = OxTextNode | OxElementNode;

/** Elements that survive sanitising. Everything else is unwrapped or dropped. */
export const ALLOWED_TAGS: readonly string[] = [
  'p',
  'br',
  'strong',
  'em',
  'b',
  'i',
  'u',
  'ul',
  'ol',
  'li',
  'table',
  'thead',
  'tbody',
  'tr',
  'th',
  'td',
  'h2',
  'h3',
  'h4',
  'a',
  'span',
];

/** Elements with no closing tag in the allowlist. */
const VOID_TAGS: readonly string[] = ['br'];

/**
 * Elements whose entire subtree is dropped rather than unwrapped: their text
 * content is code, not copy, and unwrapping would print it (or, for a broken
 * parser, run it).
 */
const RAW_DROP: readonly string[] = [
  'script',
  'style',
  'iframe',
  'frame',
  'frameset',
  'object',
  'embed',
  'applet',
  'svg',
  'math',
  'template',
  'noscript',
  'noembed',
  'title',
  'textarea',
  'xmp',
  'form',
  'button',
  'input',
  'select',
  'option',
  'link',
  'meta',
  'base',
  'audio',
  'video',
  'canvas',
  'map',
  'area',
  'portal',
];

/** Attributes kept, per element. Anything not listed here is dropped. */
const ALLOWED_ATTRS: Record<string, readonly string[]> = {
  a: ['href'],
  th: ['scope', 'colspan', 'rowspan'],
  td: ['colspan', 'rowspan'],
};

const LT = String.fromCharCode(60);
const GT = String.fromCharCode(62);
const AMP = String.fromCharCode(38);
const QUOT = String.fromCharCode(34);
const APOS = String.fromCharCode(39);
const SLASH = String.fromCharCode(47);
const EXCL = String.fromCharCode(33);
const EQ = String.fromCharCode(61);
const DASH = String.fromCharCode(45);
const COLON = String.fromCharCode(58);
const HASH = String.fromCharCode(35);
const QUESTION = String.fromCharCode(63);
const SEMI = String.fromCharCode(59);
const LINE_SEP = String.fromCharCode(0x2028);
const PARA_SEP = String.fromCharCode(0x2029);
/** `[\s]+`, built from char codes because escapes in this repo have been mangled. */
const WHITESPACE_RUN = new RegExp(
  String.fromCharCode(91, 92) + 's' + String.fromCharCode(93, 43),
  'g'
);

/**
 * How far past an `&` an entity may reach. The longest thing we decode is
 * `&#x10FFFF;` (10 characters); 32 leaves room for a long named entity while
 * keeping the scan bounded, which is what makes `decodeEntities` linear.
 */
const MAX_ENTITY_LENGTH = 32;
const SEMI_CODE = 59;
/** `[CDATA[` and `]]>`: a CDATA section ends at its own terminator, not at `>`. */
const CDATA_OPEN = String.fromCharCode(91) + 'CDATA' + String.fromCharCode(91);
const CDATA_CLOSE = String.fromCharCode(93, 93, 62);

/**
 * How deeply elements may nest before the parser stops opening new ones.
 * `serialize` and `textOf` walk the tree recursively, and SSR runs in workerd,
 * whose stack is smaller than Node's (G1 finding 2: a RangeError at 5000
 * levels under Node). Past this depth the content is kept but flattened into
 * the deepest allowed parent, so deeply nested markup degrades instead of
 * throwing a 500 on the request.
 */
export const MAX_DEPTH = 512;

const NAMED_ENTITIES: Record<string, string> = {
  amp: AMP,
  lt: LT,
  gt: GT,
  quot: QUOT,
  apos: APOS,
  nbsp: String.fromCharCode(0xa0),
  middot: String.fromCharCode(0xb7),
  hellip: String.fromCharCode(0x2026),
  mdash: DASH,
  ndash: DASH,
  laquo: String.fromCharCode(0xab),
  raquo: String.fromCharCode(0xbb),
  deg: String.fromCharCode(0xb0),
  times: String.fromCharCode(0xd7),
  copy: String.fromCharCode(0xa9),
  reg: String.fromCharCode(0xae),
  trade: String.fromCharCode(0x2122),
};

function isAlpha(code: number): boolean {
  return (code >= 97 && code <= 122) || (code >= 65 && code <= 90);
}

function isDigit(code: number): boolean {
  return code >= 48 && code <= 57;
}

function isNameChar(code: number): boolean {
  // letters, digits, hyphen, underscore, colon and dot: the whole set a tag or
  // attribute name may legally carry, plus the ones browsers tolerate.
  return (
    isAlpha(code) ||
    isDigit(code) ||
    code === 45 ||
    code === 95 ||
    code === 58 ||
    code === 46
  );
}

function isSpace(code: number): boolean {
  return code === 32 || code === 9 || code === 10 || code === 13 || code === 12;
}

/** Decodes the entity set merchants actually use; unknown entities stay literal. */
export function decodeEntities(input: string): string {
  if (input.indexOf(AMP) < 0) return input;
  let out = '';
  let i = 0;
  while (i < input.length) {
    const char = input.charAt(i);
    if (char !== AMP) {
      out += char;
      i += 1;
      continue;
    }
    // The semicolon scan is bounded, not open-ended: `indexOf(';', i + 1)` on a
    // run of bare ampersands re-scans the rest of the string from every one of
    // them, which is quadratic (G1 finding 1: 120k of `&` measured at 316ms and
    // rising with the square). Only the next MAX_ENTITY_LENGTH characters can
    // hold an entity, so only those are ever looked at.
    const limit = Math.min(input.length, i + 1 + MAX_ENTITY_LENGTH);
    let end = -1;
    for (let scan = i + 1; scan < limit; scan += 1) {
      if (input.charCodeAt(scan) === SEMI_CODE) {
        end = scan;
        break;
      }
    }
    if (end < 0) {
      out += char;
      i += 1;
      continue;
    }
    const body = input.slice(i + 1, end);
    let decoded: string | null = null;
    if (body.charAt(0) === HASH) {
      const hex = body.charAt(1) === 'x' || body.charAt(1) === 'X';
      const digits = hex ? body.slice(2) : body.slice(1);
      if (digits.length > 0) {
        const code = parseInt(digits, hex ? 16 : 10);
        if (Number.isFinite(code) && code > 0 && code <= 0x10ffff) {
          try {
            decoded = String.fromCodePoint(code);
          } catch {
            decoded = null;
          }
        }
      }
    } else {
      const named = NAMED_ENTITIES[body.toLowerCase()];
      if (named !== undefined) decoded = named;
    }
    if (decoded === null) {
      out += char;
      i += 1;
      continue;
    }
    out += decoded;
    i = end + 1;
  }
  return out;
}

/** Escapes text for an HTML text node or a double-quoted attribute value. */
export function escapeText(input: string): string {
  let out = '';
  for (let i = 0; i < input.length; i += 1) {
    const char = input.charAt(i);
    if (char === AMP) out += AMP + 'amp' + SEMI;
    else if (char === LT) out += AMP + 'lt' + SEMI;
    else if (char === GT) out += AMP + 'gt' + SEMI;
    else if (char === QUOT) out += AMP + 'quot' + SEMI;
    else if (char === APOS) out += AMP + HASH + '39' + SEMI;
    else if (char === LINE_SEP) out += AMP + HASH + '8232' + SEMI;
    else if (char === PARA_SEP) out += AMP + HASH + '8233' + SEMI;
    else out += char;
  }
  return out;
}

/**
 * True when `href` is a link we are willing to render: http, https, a rooted
 * or relative path, a query or a fragment. Protocol-relative `//host` is
 * rejected with every other scheme, so `javascript:`, `data:`, `vbscript:`
 * and `file:` have no way through, decoded or not.
 */
export function isSafeHref(raw: string): boolean {
  let value = '';
  // Strip the control characters and separators browsers ignore inside a URL
  // before they resolve the scheme (the classic "java\tscript:" bypass).
  for (let i = 0; i < raw.length; i += 1) {
    const code = raw.charCodeAt(i);
    if (code <= 32 || code === 0x7f || code === 0x2028 || code === 0x2029) continue;
    value += raw.charAt(i);
  }
  if (value.length === 0) return false;
  // `keptAttrs` decodes the value before calling this, so a numeric-entity
  // marker can only still be here because the entity did NOT decode: `&#0;`
  // is the case G1 finding 3 was built on, where the surviving `#` made the
  // rest of the string look like a fragment. A real link never needs one.
  if (value.indexOf(AMP + HASH) >= 0) return false;
  if (value.charAt(0) === HASH || value.charAt(0) === QUESTION) return true;
  if (value.charAt(0) === SLASH) return value.charAt(1) !== SLASH;
  // Reject a leading backslash, which some browsers normalise to a slash.
  if (value.charCodeAt(0) === 92) return false;
  const colon = value.indexOf(COLON);
  if (colon < 0) return true; // No colon at all: a relative path.

  // A colon after the first path separator belongs to the path (`a/b:c`).
  const separator = firstSeparatorIndex(value);
  if (colon > separator) return true;

  // A colon in the first segment is either a scheme or nothing we will render.
  // Whether it is a scheme is decided by the URI grammar, not by where a `#`
  // or `?` happens to sit (G1 finding 3: a stray `#` from an entity that
  // failed to decode could push the colon past the "first separator" and win
  // the benefit of the doubt). RFC 3986: scheme is
  // ALPHA *( ALPHA / DIGIT / "+" / "-" / "." ), and a relative reference may
  // not carry a colon in its first segment at all, so anything that is not a
  // well-formed http or https scheme is refused rather than guessed at.
  const beforeColon = value.slice(0, colon);
  if (!isSchemeName(beforeColon)) return false;
  const scheme = beforeColon.toLowerCase();
  return scheme === 'http' || scheme === 'https';
}

/** Index of the first `/`, `?` or `#`, or the length when there is none. */
function firstSeparatorIndex(value: string): number {
  for (let i = 0; i < value.length; i += 1) {
    const char = value.charAt(i);
    if (char === SLASH || char === QUESTION || char === HASH) return i;
  }
  return value.length;
}

/** RFC 3986 scheme grammar: `ALPHA *( ALPHA / DIGIT / "+" / "-" / "." )`. */
function isSchemeName(value: string): boolean {
  if (value.length === 0) return false;
  if (!isAlpha(value.charCodeAt(0))) return false;
  for (let i = 1; i < value.length; i += 1) {
    const code = value.charCodeAt(i);
    // 43 is "+", 45 is "-", 46 is ".".
    if (isAlpha(code) || isDigit(code) || code === 43 || code === 45 || code === 46) continue;
    return false;
  }
  return true;
}

interface RawTag {
  name: string;
  closing: boolean;
  selfClosing: boolean;
  attrs: Record<string, string>;
  /** Index just past the closing `>` (or past the end for an unterminated tag). */
  end: number;
}

/** Reads one tag starting at `start` (which points at `<`). Null when it is text. */
function readTag(input: string, start: number): RawTag | null {
  let i = start + 1;
  let closing = false;
  if (input.charAt(i) === SLASH) {
    closing = true;
    i += 1;
  }
  if (!isAlpha(input.charCodeAt(i))) return null;
  let name = '';
  while (i < input.length && isNameChar(input.charCodeAt(i))) {
    name += input.charAt(i);
    i += 1;
  }
  const attrs: Record<string, string> = {};
  let selfClosing = false;
  while (i < input.length) {
    while (i < input.length && isSpace(input.charCodeAt(i))) i += 1;
    if (i >= input.length) break;
    const char = input.charAt(i);
    if (char === GT) {
      i += 1;
      break;
    }
    if (char === SLASH) {
      selfClosing = true;
      i += 1;
      continue;
    }
    if (!isNameChar(input.charCodeAt(i))) {
      // Junk inside the tag (a stray quote or equals): skip one char so an
      // unparsable attribute can never stall the scan.
      i += 1;
      continue;
    }
    let attrName = '';
    while (i < input.length && isNameChar(input.charCodeAt(i))) {
      attrName += input.charAt(i);
      i += 1;
    }
    while (i < input.length && isSpace(input.charCodeAt(i))) i += 1;
    let attrValue = '';
    if (input.charAt(i) === EQ) {
      i += 1;
      while (i < input.length && isSpace(input.charCodeAt(i))) i += 1;
      const quote = input.charAt(i);
      if (quote === QUOT || quote === APOS) {
        i += 1;
        const close = input.indexOf(quote, i);
        if (close < 0) {
          attrValue = input.slice(i);
          i = input.length;
        } else {
          attrValue = input.slice(i, close);
          i = close + 1;
        }
      } else {
        while (
          i < input.length &&
          !isSpace(input.charCodeAt(i)) &&
          input.charAt(i) !== GT
        ) {
          attrValue += input.charAt(i);
          i += 1;
        }
      }
    }
    attrs[attrName.toLowerCase()] = attrValue;
  }
  return { name: name.toLowerCase(), closing, selfClosing, attrs, end: i };
}

/** Index just past the close of a RAW_DROP element, or the end of the input. */
function skipRawElement(input: string, from: number, name: string): number {
  const needle = LT + SLASH + name;
  const lowered = input.toLowerCase();
  let at = from;
  for (;;) {
    at = lowered.indexOf(needle, at);
    if (at < 0) return input.length;
    // The name must end where the match ends, exactly as `readTag` parses one:
    // without this, `</scripts>` satisfies a search for `</script` and the
    // element is closed at the wrong place (G1 finding 4).
    const after = lowered.charCodeAt(at + needle.length);
    const ends =
      Number.isNaN(after) || isSpace(after) || after === 62 || after === 47; // ">" or "/"
    if (ends) {
      const close = input.indexOf(GT, at);
      return close < 0 ? input.length : close + 1;
    }
    at += needle.length;
  }
}

function keptAttrs(tag: string, attrs: Record<string, string>): Record<string, string> {
  const allowed = ALLOWED_ATTRS[tag];
  const out: Record<string, string> = {};
  if (!allowed) return out;
  for (const name of allowed) {
    const raw = attrs[name];
    if (raw === undefined) continue;
    const value = decodeEntities(raw).trim();
    if (value.length === 0) continue;
    if (name === 'href') {
      if (!isSafeHref(value)) continue;
      out.href = value;
      continue;
    }
    if (name === 'scope') {
      const scope = value.toLowerCase();
      if (scope === 'row' || scope === 'col' || scope === 'rowgroup' || scope === 'colgroup') {
        out.scope = scope;
      }
      continue;
    }
    // colspan and rowspan: a small positive integer or nothing.
    let digits = '';
    for (let i = 0; i < value.length && digits.length < 2; i += 1) {
      if (!isDigit(value.charCodeAt(i))) break;
      digits += value.charAt(i);
    }
    const span = parseInt(digits, 10);
    if (Number.isFinite(span) && span > 1) out[name] = String(span);
  }
  return out;
}

/**
 * Parses untrusted HTML into an allowlisted node tree. Unknown elements are
 * unwrapped, RAW_DROP elements take their subtree with them, comments and
 * doctypes vanish, and text is decoded exactly once.
 */
export function parseFragment(html: string | null | undefined): OxNode[] {
  if (!html) return [];
  const root: OxElementNode = { type: 'element', tag: 'root', attrs: {}, children: [] };
  const stack: OxElementNode[] = [root];
  const top = (): OxElementNode => stack[stack.length - 1];
  const pushText = (value: string) => {
    if (value.length === 0) return;
    const decoded = decodeEntities(value);
    if (decoded.length === 0) return;
    const siblings = top().children;
    const last = siblings[siblings.length - 1];
    if (last && last.type === 'text') last.value += decoded;
    else siblings.push({ type: 'text', value: decoded });
  };

  let i = 0;
  let textStart = 0;
  while (i < html.length) {
    if (html.charAt(i) !== LT) {
      i += 1;
      continue;
    }
    const next = html.charAt(i + 1);
    if (next === EXCL) {
      pushText(html.slice(textStart, i));
      if (html.slice(i + 2, i + 4) === DASH + DASH) {
        const close = html.indexOf(DASH + DASH + GT, i + 4);
        i = close < 0 ? html.length : close + 3;
      } else if (html.slice(i + 2, i + 9).toUpperCase() === CDATA_OPEN) {
        // A CDATA section ends at `]]>`, not at the first `>`. Searching for a
        // bare `>` lands inside whatever tag follows, which leaked the text of
        // a dropped `<script>` into the page as visible copy (G1 finding 5).
        const close = html.indexOf(CDATA_CLOSE, i + 9);
        i = close < 0 ? html.length : close + CDATA_CLOSE.length;
      } else {
        const close = html.indexOf(GT, i + 2);
        i = close < 0 ? html.length : close + 1;
      }
      textStart = i;
      continue;
    }
    const tag = readTag(html, i);
    if (!tag) {
      // A `<` that no browser would read as a tag start: plain text.
      i += 1;
      continue;
    }
    pushText(html.slice(textStart, i));
    if (!tag.closing && RAW_DROP.indexOf(tag.name) >= 0) {
      i = tag.selfClosing ? tag.end : skipRawElement(html, tag.end, tag.name);
      textStart = i;
      continue;
    }
    if (tag.closing) {
      if (ALLOWED_TAGS.indexOf(tag.name) >= 0 && VOID_TAGS.indexOf(tag.name) < 0) {
        for (let depth = stack.length - 1; depth > 0; depth -= 1) {
          if (stack[depth].tag === tag.name) {
            stack.length = depth;
            break;
          }
        }
      }
      i = tag.end;
      textStart = i;
      continue;
    }
    if (ALLOWED_TAGS.indexOf(tag.name) >= 0) {
      const element: OxElementNode = {
        type: 'element',
        tag: tag.name,
        attrs: keptAttrs(tag.name, tag.attrs),
        children: [],
      };
      top().children.push(element);
      // Past MAX_DEPTH the element is kept but never becomes a parent, so the
      // tree stops deepening and everything below it flattens into the last
      // allowed level. `serialize` and `textOf` recurse over this tree, and a
      // workerd stack is smaller than Node's, so an uncapped tree turns deeply
      // nested markup into a 500 on the request (G1 finding 2).
      if (
        !tag.selfClosing &&
        VOID_TAGS.indexOf(tag.name) < 0 &&
        stack.length <= MAX_DEPTH
      ) {
        stack.push(element);
      }
    }
    // An element outside the allowlist is unwrapped: nothing is pushed, and
    // its children land in the current parent.
    i = tag.end;
    textStart = i;
  }
  pushText(html.slice(textStart));
  return root.children;
}

/** Serialises a node tree back to HTML, escaping every text and attribute value. */
export function serialize(nodes: readonly OxNode[]): string {
  let out = '';
  for (const node of nodes) {
    if (node.type === 'text') {
      out += escapeText(node.value);
      continue;
    }
    let attrs = '';
    for (const [name, value] of Object.entries(node.attrs)) {
      attrs += ' ' + name + EQ + QUOT + escapeText(value) + QUOT;
    }
    if (node.tag === 'a' && node.attrs.href) {
      attrs += ' rel' + EQ + QUOT + 'nofollow noopener' + QUOT;
    }
    if (VOID_TAGS.indexOf(node.tag) >= 0) {
      out += LT + node.tag + attrs + ' ' + SLASH + GT;
      continue;
    }
    out += LT + node.tag + attrs + GT + serialize(node.children) + LT + SLASH + node.tag + GT;
  }
  return out;
}

/** Parse plus serialise: the only path merchant HTML takes into the DOM. */
export function sanitizeHtml(html: string | null | undefined): string {
  return serialize(parseFragment(html));
}

/** Elements that end a run of text: their content never fuses with the next. */
const BLOCK_TAGS: readonly string[] = [
  'p',
  'br',
  'ul',
  'ol',
  'li',
  'table',
  'thead',
  'tbody',
  'tr',
  'th',
  'td',
  'h2',
  'h3',
  'h4',
];

/**
 * Visible text of a node tree, for meta descriptions and JSON-LD. Inline
 * elements fuse with the surrounding text; block elements are separated by a
 * space, so two table cells never read as one number.
 */
export function textOf(nodes: readonly OxNode[]): string {
  let out = '';
  for (const node of nodes) {
    if (node.type === 'text') {
      out += node.value;
      continue;
    }
    out += textOf(node.children);
    if (BLOCK_TAGS.indexOf(node.tag) >= 0) out += ' ';
  }
  return out.split(WHITESPACE_RUN).filter(Boolean).join(' ');
}
