/**
 * The spec line: the first paragraph of every OptimalX product description,
 * written to a fixed convention by the catalogue (FINAL-catalogue reading
 * rules, verified against all 47 lines in research/catalogue.json):
 *
 *   <p>الحصص: 73 | حجم الحصة: 31 جم | الصلاحية: 2028-03 | الشكل: بودرة</p>
 *
 * Every field is optional and the label set changes by product type: the
 * digital guide carries الصفحات and الصيغة, the gift card القيمة, the services
 * المدة and القناة. The parser therefore reads every "label: value" pair in
 * order and maps the four known labels onto named fields; anything else stays
 * in `fields` for the variant facts cards to render.
 *
 * Nothing here guesses. A missing field is null and the chip, the calculator
 * or the facts row that depends on it does not render.
 *
 * No regular expressions: string scanning only (PLAN-final 2.3, last bullet).
 */
import { parseFragment, textOf, type OxNode } from './sanitizeHtml';

export interface SpecField {
  /** The label exactly as the merchant wrote it, minus surrounding spaces. */
  label: string;
  /** The value exactly as written. */
  value: string;
}

export interface SpecLine {
  /** Servings as a number, only when the value is a bare integer. */
  servings: number | null;
  /** The servings value as written ("73", "30 يوما"), for the chip. */
  servingsText: string | null;
  /** Serving size as written ("31 جم", "كبسولة واحدة"). */
  servingSize: string | null;
  /** Expiry as YYYY-MM, only when the value is exactly that shape. */
  expiry: string | null;
  /** The expiry value as written, including "غير منطبق". */
  expiryText: string | null;
  /** Dosage form as written ("بودرة", "كبسولات", "خدمة"). */
  form: string | null;
  /** Every label/value pair on the line, in source order. */
  fields: SpecField[];
}

export const LABEL_SERVINGS = 'الحصص';
export const LABEL_SERVING_SIZE = 'حجم الحصة';
export const LABEL_EXPIRY = 'الصلاحية';
export const LABEL_FORM = 'الشكل';
/** A reply-time promise the merchant wrote into the data; gated on reply_sla_hours. */
export const LABEL_REPLY_TIME = 'الرد خلال';

const PIPE = String.fromCharCode(124);
const COLON = String.fromCharCode(58);
const ARABIC_COLON = String.fromCharCode(0x061b); // Arabic semicolon, seen in hand-typed copy
const NOT_APPLICABLE = 'غير منطبق';

function splitPair(chunk: string): SpecField | null {
  let at = chunk.indexOf(COLON);
  if (at < 0) at = chunk.indexOf(ARABIC_COLON);
  if (at < 0) return null;
  const label = chunk.slice(0, at).trim();
  const value = chunk.slice(at + 1).trim();
  if (label.length === 0 || value.length === 0) return null;
  return { label, value };
}

/** The leading integer of a value, or null when the value does not start with one. */
function leadingInteger(value: string): number | null {
  let digits = '';
  for (let i = 0; i < value.length; i += 1) {
    const code = value.charCodeAt(i);
    if (code < 48 || code > 57) break;
    digits += value.charAt(i);
  }
  if (digits.length === 0) return null;
  const parsed = parseInt(digits, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}

/** True when the whole value is exactly `YYYY-MM` with Western digits. */
function isYearMonth(value: string): boolean {
  if (value.length !== 7) return false;
  for (let i = 0; i < 7; i += 1) {
    const code = value.charCodeAt(i);
    if (i === 4) {
      if (code !== 45) return false;
      continue;
    }
    if (code < 48 || code > 57) return false;
  }
  return true;
}

/** Parses one already-plain spec line. Null when it holds no label/value pair. */
export function parseSpecLineText(line: string | null | undefined): SpecLine | null {
  if (!line) return null;
  const fields: SpecField[] = [];
  for (const chunk of line.split(PIPE)) {
    const pair = splitPair(chunk);
    if (pair) fields.push(pair);
  }
  if (fields.length === 0) return null;
  const find = (label: string): string | null => {
    const hit = fields.find((field) => field.label === label);
    return hit ? hit.value : null;
  };
  const servingsText = find(LABEL_SERVINGS);
  const expiryText = find(LABEL_EXPIRY);
  return {
    servings: servingsText === null ? null : leadingInteger(servingsText),
    servingsText,
    servingSize: find(LABEL_SERVING_SIZE),
    expiry: expiryText !== null && isYearMonth(expiryText) ? expiryText : null,
    expiryText,
    form: find(LABEL_FORM),
    fields,
  };
}

/** The first paragraph of a parsed description tree, as plain text. */
export function firstParagraphText(nodes: readonly OxNode[]): string | null {
  for (const node of nodes) {
    if (node.type !== 'element') continue;
    if (node.tag === 'p') return textOf(node.children);
    const nested = firstParagraphText(node.children);
    if (nested !== null) return nested;
  }
  return null;
}

/**
 * Parses the spec line out of a raw description. Returns null when the first
 * paragraph is prose rather than a spec line, so the chips and the supply
 * calculator hide instead of guessing.
 */
export function parseSpecLine(descriptionHtml: string | null | undefined): SpecLine | null {
  if (!descriptionHtml) return null;
  return parseSpecLineText(firstParagraphText(parseFragment(descriptionHtml)));
}

/** True when the value is the catalogue's explicit "does not apply". */
export function isNotApplicable(value: string | null | undefined): boolean {
  return typeof value === 'string' && value.trim() === NOT_APPLICABLE;
}
