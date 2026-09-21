// Claims lint for locale copy (GOV-013).
//
// The claims source is docs/build/research/FINAL-claims-source.md; no
// customer-facing string may state a fact that file does not support
// (CONDUCTOR-2026-09-21.md §3, PLAN-ship-2026-09-21.md §2 Batch S4). This
// script is the repeatable half of that rule; docs/build/research/claims-
// audit.md is the one-time human read that found the defects this gate now
// watches for.
//
// Rules (one finding per key, `file:key [rule] value`):
//   superlative          an unearned superlative: "the best", "at the best
//                        price", "#1", "most sold" (FINAL-claims-source §3:
//                        no row supports "the best in Saudi Arabia" or a
//                        price comparison against competitors)
//   health-outcome       a treatment, cure, prevention or outcome promise, or
//                        a safety verdict ("not harmful", "100% safe"), banned
//                        outright by FINAL-claims-source §3 (SFDA S1 2.2.1,
//                        2.2.3); "دفع آمن" (secure checkout) is not this claim
//                        and is exempted
//   professional-title   a professional title used as a self-description
//                        (دكتور، أخصائي، صيدلي، طبيب); a value that redirects
//                        the reader to an outside professional ("راجع
//                        طبيبك", "لا تغني عن استشارة طبيب أو أخصائي تغذية")
//                        is exempted, since that is not a self-description
//   payment-name         a payment method brand named in copy; marks render
//                        through SallaPayments, never as text (FINAL-claims-
//                        source §3); the ordinary MSA word مدى ("extent", as
//                        in "على مدى ساعات") is exempted when it follows على
//   threshold-literal    the free-shipping number 299 outside {{threshold}}
//   reply-time           a reply verb (نرد، رد، نجيب) collocated with a
//                        literal hour or day count; the templated
//                        "{{hours}}" form carries no digit and is not this
//                        claim (FINAL-claims-source row 6 is conditional)
//   official-distributor "موزعون رسميون" outside the keys gated behind the
//                        claim_official_distributors setting (row 8)
//   invented-number      a customer count, satisfaction rate or years-in-
//                        business figure FINAL-claims-source §3 bans until
//                        real order data exists
//
// A finding may be allowlisted by exact key with a written reason (below);
// the allowlist is reviewed at every change, not a way to silence a genuine
// defect. It never allowlists a whole file or a whole rule.
//
// Usage: node scripts/check-claims.mjs [file ...]
// With no arguments it checks locales/*.json and locales/partials/*.json,
// the same file set check-copy.mjs uses. Exits 1 on a finding outside the
// allowlist.

import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

/** A word character in any script, so a token test has real boundaries. */
const LETTER = '\\p{L}\\p{M}';

/** Matches `token` as a whole word and captures the word before it. */
function wordPattern(token) {
  return new RegExp(`([${LETTER}]+)?\\s*(?<![${LETTER}])${token}(?![${LETTER}])`, 'gu');
}

/**
 * True when `token` appears in `value` as a whole word, unless the word
 * immediately before it is in `exemptBefore`.
 * @param {string} value
 * @param {string} token  a plain string, not a regex fragment
 * @param {string[]} exemptBefore
 * @returns {string | null} the matched token, or null
 */
function findToken(value, token, exemptBefore = []) {
  for (const match of value.matchAll(wordPattern(token))) {
    const before = (match[1] ?? '').trim();
    if (!exemptBefore.includes(before)) return token;
  }
  return null;
}

const SUPERLATIVE_PHRASES = [
  'الأفضل في السعودية',
  'أفضل في السعودية',
  'بأفضل سعر',
  'أفضل سعر',
  'الأكثر مبيعا',
  'الأكثر مبيعاً',
  'الأكثر طلبا',
  'الأكثر طلباً',
  'رقم واحد',
];
const SUPERLATIVE_EN = /\b(best|#1|number one|top[- ]rated|best[- ]selling)\b/i;

const HEALTH_OUTCOME_PHRASES = [
  'يعالج',
  'تعالج',
  'يشفي',
  'شفاء تام',
  'يقي من',
  'يحمي من',
  'يحرق الدهون',
  'يزيد العضلات',
  'مضمون',
  'نتائج خلال',
  'آمن 100',
  '100% آمن',
  '١٠٠٪ آمن',
  'بدون آثار جانبية',
  'مثبت سريريا',
  'مثبت سريرياً',
];
/** "ليس مضرا", "غير مضر", "لا يضر": a harm verdict, the claim GOV-013 bans. */
const HARM_VERDICT = new RegExp(`(?<![${LETTER}])(?:ليس|غير|لا)\\s+مضر[${LETTER}]*(?![${LETTER}])`, 'u');
/** "دفع آمن" is checkout security, not a health-safety verdict. */
const SAFE_VERDICT_EXEMPT = ['دفع', 'الدفع'];

const PROFESSIONAL_TITLE_TOKENS = ['دكتور', 'أخصائي', 'صيدلي', 'طبيب'];
/**
 * A redirect to an outside professional ("راجع طبيبك", "لا تغني عن استشارة
 * طبيب أو أخصائي تغذية") is not a self-description; a value carrying one of
 * these markers is exempted from the professional-title rule entirely.
 */
const PROFESSIONAL_REDIRECT_MARKERS = ['راجع', 'استشارة', 'استشر', 'زيارة', 'تغني عن', 'يغني عن', 'مراجعة'];

/** exemptBefore: a preceding word that makes the token ordinary MSA. */
const PAYMENT_TOKENS = [
  { token: 'مدى', exemptBefore: ['على'] },
  { token: 'تابي', exemptBefore: [] },
  { token: 'تمارا', exemptBefore: [] },
  { token: 'فيزا', exemptBefore: [] },
  { token: 'أبل باي', exemptBefore: [] },
  { token: 'ابل باي', exemptBefore: [] },
];
const PAYMENT_EN = /\b(apple pay|visa|mastercard|mada|tabby|tamara)\b/i;

const THRESHOLD = /(^|[^0-9.])299([^0-9]|$)/;

const REPLY_VERBS = 'نرد|سنرد|رد|نجيب|سنجيب|الرد';
const REPLY_TIME_AR = new RegExp(
  `(?<![${LETTER}])(?:${REPLY_VERBS})(?![${LETTER}])[^.؟!]{0,20}?(?:خلال|ب)[^.؟!]{0,10}?\\d+\\s*(?:ساعة|ساعات|يوم|أيام)`,
  'u'
);
const REPLY_TIME_EN = /\b(repl(?:y|ies)|respond(?:s|ed)?|answer(?:ed)?)\b[^.]{0,25}\bwithin\b[^.]{0,15}\d+\s*(?:hour|hours|day|days)/i;

const OFFICIAL_DISTRIBUTOR = /موزعون رسميون|موزع رسمي/;

const INVENTED_NUMBER_AR = /\d+\+?\s*عميل|نسبة الرضا|٪\s*رضا|رضا\s*٪|سنوات خبرة|سنوات من الخبرة/;
const INVENTED_NUMBER_EN = /\d+\+?\s*(?:happy )?customers|satisfaction rate|\d+%\s*satisfied|years? of experience/i;

/**
 * Keys where a rule finds a real match but the string is not the claim the
 * rule exists to catch. Every entry needs a reason; it names one rule so it
 * can never blanket-silence a key.
 */
export const ALLOWLIST = [
  {
    key: 'ox.pdp.official_distributors',
    rule: 'official-distributor',
    reason:
      'Renders only when the claim_official_distributors setting is on (app/components/product/lib/claims.ts, BuyZone/PdpPriceBlock.tsx); FINAL-claims-source row 8 conditional claim.',
  },
  {
    key: 'ox.home.trust_distributors',
    rule: 'official-distributor',
    reason:
      'Renders only when the claim_official_distributors setting is on (app/components/home/OxTrustStrip.tsx); FINAL-claims-source row 8 conditional claim.',
  },
  {
    key: 'ox.content.categories.protein.intro',
    rule: 'superlative',
    reason:
      'EN twin of "لا بالعلامة الأشهر": advises the shopper not to choose by brand fame, states no claim about this store.',
  },
];

/**
 * @typedef {{ file: string, key: string, rule: string, value: string, match?: string }} ClaimFinding
 */

/**
 * @param {string} file
 * @param {string} text
 * @returns {ClaimFinding[]}
 */
export function checkClaims(file, text) {
  /** @type {ClaimFinding[]} */
  const findings = [];
  for (const { key, value } of entriesOf(text)) {
    /** One finding per rule per key: the first match is enough to act on. */
    const perRule = new Map();
    const flag = (rule, match) => {
      if (!perRule.has(rule)) perRule.set(rule, match);
    };

    for (const phrase of SUPERLATIVE_PHRASES) {
      if (value.includes(phrase)) flag('superlative', phrase);
    }
    const superlativeEn = value.match(SUPERLATIVE_EN);
    if (superlativeEn) flag('superlative', superlativeEn[0]);

    for (const phrase of HEALTH_OUTCOME_PHRASES) {
      if (value.includes(phrase)) flag('health-outcome', phrase);
    }
    const harmVerdict = value.match(HARM_VERDICT);
    if (harmVerdict) flag('health-outcome', harmVerdict[0]);
    const safeVerdict = findToken(value, 'آمن', SAFE_VERDICT_EXEMPT);
    if (safeVerdict) flag('health-outcome', safeVerdict);

    const isRedirect = PROFESSIONAL_REDIRECT_MARKERS.some((marker) => value.includes(marker));
    if (!isRedirect) {
      for (const token of PROFESSIONAL_TITLE_TOKENS) {
        if (findToken(value, token)) flag('professional-title', token);
      }
    }

    for (const { token, exemptBefore } of PAYMENT_TOKENS) {
      if (findToken(value, token, exemptBefore)) flag('payment-name', token);
    }
    const paymentEn = value.match(PAYMENT_EN);
    if (paymentEn) flag('payment-name', paymentEn[0]);

    if (THRESHOLD.test(value)) flag('threshold-literal', undefined);

    const replyAr = value.match(REPLY_TIME_AR);
    if (replyAr) flag('reply-time', replyAr[0]);
    const replyEn = value.match(REPLY_TIME_EN);
    if (replyEn) flag('reply-time', replyEn[0]);

    if (OFFICIAL_DISTRIBUTOR.test(value)) flag('official-distributor', undefined);

    const inventedAr = value.match(INVENTED_NUMBER_AR);
    if (inventedAr) flag('invented-number', inventedAr[0]);
    const inventedEn = value.match(INVENTED_NUMBER_EN);
    if (inventedEn) flag('invented-number', inventedEn[0]);

    for (const [rule, match] of perRule) findings.push({ file, key, rule, value, match });
  }
  return findings;
}

function entriesOf(text) {
  return flatten(JSON.parse(text), '');
}

function flatten(node, prefix) {
  if (typeof node === 'string') return [{ key: prefix, value: node }];
  if (Array.isArray(node)) return node.flatMap((item, i) => flatten(item, `${prefix}[${i}]`));
  if (node && typeof node === 'object') {
    return Object.entries(node).flatMap(([k, v]) => flatten(v, prefix ? `${prefix}.${k}` : k));
  }
  return [];
}

/** locales/*.json plus every partial pair, the same set check-copy.mjs uses. */
function defaultFiles() {
  const out = [];
  for (const dir of ['locales', path.join('locales', 'partials')]) {
    if (!fs.existsSync(dir)) continue;
    for (const name of fs.readdirSync(dir).sort()) {
      if (name.endsWith('.json')) out.push(path.join(dir, name));
    }
  }
  return out;
}

/** @param {ClaimFinding} f */
function isAllowed(f) {
  return ALLOWLIST.some((a) => a.key === f.key && a.rule === f.rule);
}

function main(args) {
  const files = args.length ? args : defaultFiles();
  let problems = 0;
  let allowed = 0;
  for (const file of files) {
    let findings;
    try {
      findings = checkClaims(file, fs.readFileSync(file, 'utf8'));
    } catch (error) {
      problems++;
      console.error(`${file}: ${error instanceof Error ? error.message : String(error)}`);
      continue;
    }
    for (const f of findings) {
      const detail = f.match ? ` (${f.match})` : '';
      if (isAllowed(f)) {
        allowed++;
        console.warn(`${f.file}:${f.key} [${f.rule}, allowlisted]${detail} ${JSON.stringify(f.value)}`);
        continue;
      }
      problems++;
      console.error(`${f.file}:${f.key} [${f.rule}]${detail} ${JSON.stringify(f.value)}`);
    }
  }
  const allowedLine = allowed ? `, ${allowed} allowlisted` : '';
  console.log(`check-claims: ${files.length} file(s), ${problems} problem(s)${allowedLine}`);
  return problems === 0 ? 0 : 1;
}

const invokedDirectly =
  process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href;
if (invokedDirectly) process.exitCode = main(process.argv.slice(2));
