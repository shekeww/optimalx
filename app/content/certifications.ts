/**
 * The certification band (certification-band-spec.md).
 *
 * Four certifications in a two by two grid, each three lines: the name, an
 * English line, then the same line in Arabic. It is the only place in the
 * theme where the two languages sit together by design, and that is taken
 * from the reference deliberately: a certification name is a proper noun that
 * is never translated, and the store serves Saudis and residents from
 * elsewhere on one page.
 *
 * **Every badge is gated on a real per-product datum and nothing here is a
 * store-level claim.** A reseller may display a manufacturer's certification
 * for a product that genuinely holds it. It may never display one as a
 * property of the shop, and it may never display one for a product that does
 * not. The claims source lists حلال and معتمد من SFDA as CONDITIONAL, needing
 * named evidence, and the store holds none today.
 *
 * So `resolveCertifications` returns an empty list until a product carries
 * the data, the band renders nothing on an empty list, and its reserved
 * height is 0. That is the state a visitor meets today and it is the state
 * the design is checked in.
 *
 * Where the datum lives is an owner decision that has not been taken (a
 * product tag, a custom field, or the spec-line convention). The evidence
 * shape below is the shape it will arrive in; until the owner picks one,
 * nothing writes to it.
 */

/** The four the reference carries. Proper nouns: never translated, never copy. */
export const CERTIFICATION_IDS = ['nsf', 'informed-choice', 'halal', 'non-gmo'] as const;

export type CertificationId = (typeof CERTIFICATION_IDS)[number];

export interface CertificationDefinition {
  id: CertificationId;
  /** The proper noun, printed as-is in both locales. */
  name: string;
  /** The English line. A literal, because the band prints English by design. */
  englishLine: string;
  /** The Arabic line, as a locale key like every other string in the theme. */
  arabicLineKey: string;
}

const KEY = 'ox.home.cert';

export const CERTIFICATIONS: CertificationDefinition[] = [
  {
    id: 'nsf',
    name: 'NSF',
    englishLine: 'Tested by an independent laboratory',
    arabicLineKey: `${KEY}.nsf_ar`,
  },
  {
    id: 'informed-choice',
    name: 'Informed-Choice',
    englishLine: 'Batch tested for banned substances',
    arabicLineKey: `${KEY}.informed_ar`,
  },
  {
    id: 'halal',
    name: 'Halal',
    englishLine: 'Certificate held by the manufacturer',
    arabicLineKey: `${KEY}.halal_ar`,
  },
  {
    id: 'non-gmo',
    name: 'Non-GMO',
    englishLine: 'Declared on the manufacturer label',
    arabicLineKey: `${KEY}.nongmo_ar`,
  },
];

/**
 * One product's certification evidence, as the owner's chosen source will
 * hand it over: the badge id and the reference that proves it. A badge with
 * no reference is not evidence and is dropped.
 */
export interface CertificationEvidence {
  id: string;
  /** Certificate number, registration id or batch reference. Required. */
  reference: string;
}

/**
 * The badge id as the theme spells it, from whatever the merchant typed.
 *
 * Case and separator only: `Informed Choice`, `INFORMED_CHOICE` and
 * `informed-choice` are the same certification, and a merchant who types the
 * proper noun the way the reference prints it should not silently get
 * nothing. It cannot loosen the gate, because a name that is not one of the
 * four is still dropped, and the reference is a separate condition.
 */
export function normalizeCertificationId(value: unknown): string {
  if (typeof value !== 'string') return '';
  return value.trim().toLowerCase().replace(/[\s_]+/g, '-');
}

/** Narrowing guard: only the four the theme defines may reach the band. */
export function isCertificationId(value: unknown): value is CertificationId {
  return (CERTIFICATION_IDS as readonly string[]).includes(value as string);
}

/**
 * A reference is evidence only if it carries a letter or a digit.
 *
 * Blank, whitespace and a lone punctuation mark are all the same thing: a
 * required field filled in to get past it. `-` is not a certificate number.
 */
const REFERENCE_HAS_SUBSTANCE = /[\p{L}\p{N}]/u;

export function isCertificationReference(value: unknown): boolean {
  return typeof value === 'string' && REFERENCE_HAS_SUBSTANCE.test(value);
}

/**
 * Turns whatever the product carries into the badges the band may print.
 *
 * Nothing on the store writes this yet, so every caller passes nothing and
 * gets nothing back. When the owner picks the source, this is the one
 * function that changes, and the gate stays where it is.
 *
 * Four conditions, and each one drops the row rather than degrading it:
 *
 *   1. the row is an object;
 *   2. its reference is a string with a letter or a digit in it;
 *   3. its id, normalized, is one of the four the theme defines;
 *   4. the result is drawn from `CERTIFICATIONS`, so a row can only ever
 *      switch a badge on. It can never supply a name, a line, or a fifth
 *      certification of its own.
 *
 * Duplicates collapse and the order is always the canonical one, so two rows
 * for `halal` cannot print the badge twice and the grid cannot be reordered
 * by the order the merchant happened to type.
 */
export function resolveCertifications(
  evidence: readonly CertificationEvidence[] | undefined | null
): CertificationDefinition[] {
  const rows: readonly unknown[] = Array.isArray(evidence) ? evidence : [];
  if (rows.length === 0) return [];

  const proven = new Set<CertificationId>();
  for (const row of rows) {
    if (!row || typeof row !== 'object') continue;
    const record = row as Record<string, unknown>;
    if (!isCertificationReference(record.reference)) continue;
    const id = normalizeCertificationId(record.id);
    if (isCertificationId(id)) proven.add(id);
  }

  return CERTIFICATIONS.filter((definition) => proven.has(definition.id));
}

/**
 * The regulatory disclaimer, adopted from the reference and made prominent.
 *
 * It is the positive form of the rule the claims source states negatively:
 * the products are not for diagnosing, treating, curing or preventing
 * anything. It is true of every supplement the store will ever sell, so it is
 * gated on nothing and renders whenever the band does.
 */
export const CERT_DISCLAIMER_EN =
  '*This product is not intended to diagnose, treat, cure, or prevent any disease.';
export const CERT_DISCLAIMER_AR_KEY = `${KEY}.disclaimer_ar`;

/** The product still beneath the badges, and its intrinsic box. */
export interface CertificationPhoto {
  src: string;
  width?: number;
  height?: number;
}

/**
 * The shipped still, and the reason it is NOT a default.
 *
 * The reference sets a product photograph under the grid, and structurally
 * that is right. But a photograph under four certification badges says that
 * THAT product holds them, and the evidence rows are not tied to any product
 * on the home page. Shipping a still by default would manufacture exactly the
 * claim the spec forbids: a certification displayed for a product that does
 * not hold it.
 *
 * So the band draws a still only when the merchant supplies one, which is the
 * merchant asserting which product the certificates they entered belong to.
 * This constant stays for the surface that does have a product in hand, the
 * product page, where the still is the product being looked at.
 */
export const CERT_PRODUCT_PHOTO: CertificationPhoto = {
  src: '/assets/images/product-creatine.webp',
  width: 713,
  height: 637,
};
