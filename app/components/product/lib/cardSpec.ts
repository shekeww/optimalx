/**
 * The card's meta lines. Line 1 (`cardSpecLine`, CARD-2026-09-23 section 3.4,
 * reshaped on the owner's 2026-09-24 item, S8a): "<type> | <servings or
 * size>", the product's root TYPE (`productType.ts`, resolved by the card)
 * then ONE fact, the servings, else the pack size, else the dosage form,
 * joined by the theme's own divider; otherwise null, so the row keeps its
 * reserved 18px empty rather than guessing at a fact the product does not
 * carry. Line 2 (`descriptionExcerpt`, restored on the same
 * addendum): the first sentence of the description's own prose paragraph —
 * the former merchant-pitch line, now read off `description` instead of the
 * `subtitle` field it used before CARD-2026-09-23 removed it.
 *
 * No regular expressions, matching the parser this reads from (specLine.ts).
 */
import type { Product } from '@salla.sa/twilight-theme-engine/types';
import { parseFragment, textOf, type OxNode } from './sanitizeHtml';
import { parseSpecLineText, type SpecLine } from './specLine';
import { specField, unitBearingWeight, PACK_SIZE_LABELS } from './stats';

/**
 * A thin space each side of the divider (U+2009): wide enough that a digit
 * before the bar and a digit after it never read as one number (S8a note 3,
 * "أوميغا 3|90 حصة" at 13px), narrow enough that the line still reads as one.
 */
export const DIVIDER =
  String.fromCharCode(0x2009) + String.fromCharCode(124) + String.fromCharCode(0x2009);

export type Translate = (key: string, vars?: Record<string, unknown>) => string;

/**
 * `cardSpecLine(product, spec, t, typeName)`: the type name the card
 * resolved (`productTypeOf` → `ox.card.type.<key>`, or null when no source
 * could name it), then ONE fact: the servings text, else the pack size (the
 * spec line's own field, else the product's own unit-bearing weight), else
 * the dosage form; joined by `DIVIDER`; null when there is neither.
 *
 * One fact, not two (owner item 2026-09-24: "<type> · <servings or size>"):
 * the row is one `nowrap` line, and with the type in front a second fact
 * pushed the first behind the ellipsis on a two-up phone card. Nothing here
 * is inferred: the type comes from `productType.ts`, which says nothing
 * rather than guess, and every fact is the parsed spec line or the product's
 * own `weight`, exactly as `stats.ts` and `specLine.ts` read them for the PDP.
 */
export function cardSpecLine(
  product: Pick<Product, 'weight'>,
  spec: SpecLine | null | undefined,
  t: Translate,
  typeName: string | null = null
): string | null {
  const servings = spec?.servings != null ? t('ox.card.servings', { n: spec.servings }) : null;
  const pack = specField(spec, PACK_SIZE_LABELS) ?? unitBearingWeight(product.weight);
  const fact = servings ?? pack ?? spec?.form ?? null;
  const parts = [typeName?.trim() || null, fact].filter((value): value is string => Boolean(value));
  return parts.length > 0 ? parts.join(DIVIDER) : null;
}

/** Every top-level `<p>` node's plain text, depth-first, in source order. */
function paragraphTexts(nodes: readonly OxNode[]): string[] {
  const out: string[] = [];
  for (const node of nodes) {
    if (node.type !== 'element') continue;
    if (node.tag === 'p') {
      out.push(textOf(node.children));
      continue;
    }
    out.push(...paragraphTexts(node.children));
  }
  return out;
}

/**
 * The first sentence of `text` (through its first `.`, `؟` or `!`), or the
 * whole trimmed text when none of those appear. No regular expressions,
 * matching this file's own convention.
 */
function firstSentence(text: string): string {
  const PERIOD = String.fromCharCode(0x2e);
  const ARABIC_QUESTION = String.fromCharCode(0x61f);
  const BANG = String.fromCharCode(0x21);
  for (let i = 0; i < text.length; i += 1) {
    const char = text.charAt(i);
    if (char === PERIOD || char === ARABIC_QUESTION || char === BANG) {
      return text.slice(0, i + 1).trim();
    }
  }
  return text;
}

/**
 * The description excerpt (coordinator addendum, 2026-09-23): the first
 * sentence of the description's own prose paragraph, stripped of markup.
 *
 * The catalogue's own convention (specLine.ts) puts the spec line in the
 * description's first paragraph; when that first paragraph actually parses
 * as one, the excerpt is the paragraph AFTER it — never the spec line's own
 * label/value pairs, which `cardSpecLine` already owns. When the first
 * paragraph does not parse as a spec line, it IS the prose, and is read
 * directly. Null when the description carries no prose paragraph at all;
 * nothing here invents a sentence the merchant did not write.
 */
export function descriptionExcerpt(descriptionHtml: string | null | undefined): string | null {
  const paragraphs = paragraphTexts(parseFragment(descriptionHtml));
  if (paragraphs.length === 0) return null;
  const firstIsSpecLine = parseSpecLineText(paragraphs[0]) !== null;
  const prose = (firstIsSpecLine ? paragraphs[1] : paragraphs[0]) ?? null;
  if (prose === null) return null;
  const trimmed = prose.trim();
  return trimmed.length > 0 ? firstSentence(trimmed) : null;
}
