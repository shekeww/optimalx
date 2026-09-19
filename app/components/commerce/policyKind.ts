export type PolicyKind = 'shipping' | 'returns' | 'privacy' | 'terms';

/**
 * Tokens that identify a policy page, in the store's slug or its title.
 *
 * The engine's `PageSingle` sets `page.slug` to the route id (`page.single`),
 * not to the page's own slug (theme-engine routes/page.js `pageSingleLoader`),
 * so the route param and the page title are what is left to match on. Both
 * languages are covered because the owner may name the page either way, and
 * anything that matches nothing gets no intro rather than the wrong one.
 */
const TOKENS: Record<PolicyKind, readonly string[]> = {
  shipping: ['shipping', 'delivery', 'الشحن', 'التوصيل'], // ox-allow: arabic-literal match tokens, not copy
  returns: ['return', 'refund', 'exchange', 'الاسترجاع', 'الاستبدال', 'الارجاع'], // ox-allow: arabic-literal match tokens, not copy
  privacy: ['privacy', 'الخصوصية'], // ox-allow: arabic-literal match tokens, not copy
  terms: ['terms', 'conditions', 'الشروط', 'الاحكام'], // ox-allow: arabic-literal match tokens, not copy
};

/** The order matters: "terms of return" must not be read as a terms page. */
const ORDER: readonly PolicyKind[] = ['shipping', 'returns', 'privacy', 'terms'];

/**
 * Alef and ya variants that a merchant may or may not type, plus the tatweel.
 *
 * The live store's own page is named "سياسة الإستبدال والإسترجاع" with a
 * hamza under the alef, while the same words are written with a bare alef in
 * FINAL-content. Both have to match the one token, so both sides of the
 * comparison are folded to the bare forms. Built from char codes because
 * escape sequences in this repo's source have been mangled by tooling before
 * (PLAN-final 2.3).
 */
const FOLD: ReadonlyArray<readonly [string, string]> = [
  [String.fromCharCode(0x0623), String.fromCharCode(0x0627)], // alef with hamza above
  [String.fromCharCode(0x0625), String.fromCharCode(0x0627)], // alef with hamza below
  [String.fromCharCode(0x0622), String.fromCharCode(0x0627)], // alef with madda
  [String.fromCharCode(0x0671), String.fromCharCode(0x0627)], // alef wasla
  [String.fromCharCode(0x0649), String.fromCharCode(0x064a)], // alef maksura to ya
  [String.fromCharCode(0x0629), String.fromCharCode(0x0647)], // ta marbuta to ha
  [String.fromCharCode(0x0640), ''], // tatweel
];

export function foldArabic(value: string): string {
  let out = value.toLowerCase();
  for (const [from, to] of FOLD) out = out.split(from).join(to);
  return out;
}

export function policyKind(...candidates: (string | undefined | null)[]): PolicyKind | null {
  const raw = candidates
    .filter((value): value is string => typeof value === 'string' && value.length > 0)
    .join(' ');
  if (raw.length === 0) return null;
  const haystack = foldArabic(decodeSafely(raw));
  for (const kind of ORDER) {
    if (TOKENS[kind].some((token) => haystack.includes(foldArabic(token)))) return kind;
  }
  return null;
}

/** A route param arrives percent-encoded when the slug is Arabic. */
function decodeSafely(value: string): string {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

/**
 * Tokens that identify the store's FAQ page, in either language.
 *
 * The FAQ is the one store page whose body the theme replaces rather than
 * renders: its questions live in `app/content/faq.ts`, where they are shared
 * with the hub, the home block and the branch page, so a merchant editing the
 * dashboard page cannot put a second version of the same answer in front of a
 * shopper. Everything else the merchant writes in the dashboard is rendered as
 * written.
 */
const FAQ_TOKENS: readonly string[] = [
  'faq',
  'questions',
  'الاسئلة', // ox-allow: arabic-literal match tokens, not copy
  'أسئلة', // ox-allow: arabic-literal match tokens, not copy
  'اسئلة', // ox-allow: arabic-literal match tokens, not copy
];

/** True when the route's slug or the page title names the FAQ page. */
export function isFaqPage(...candidates: (string | undefined | null)[]): boolean {
  const raw = candidates
    .filter((value): value is string => typeof value === 'string' && value.length > 0)
    .join(' ');
  if (raw.length === 0) return false;
  const haystack = foldArabic(decodeSafely(raw));
  return FAQ_TOKENS.some((token) => haystack.includes(foldArabic(token)));
}
