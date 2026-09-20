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
 * product tag, a custom field, or the spec-line convention). `CERT_SOURCES`
 * is the shape it will arrive in; until the owner picks one, nothing writes
 * to it.
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
 * Turns whatever the product carries into the badges the band may print.
 *
 * Nothing on the store writes this yet, so every caller passes nothing and
 * gets nothing back. When the owner picks the source, this is the one
 * function that changes, and the gate stays where it is: an id with no
 * reference, or an id the theme does not define, never reaches the band.
 */
export function resolveCertifications(
  evidence: readonly CertificationEvidence[] | undefined
): CertificationDefinition[] {
  if (!evidence || evidence.length === 0) return [];
  const proven = new Set(
    evidence
      .filter((item) => typeof item.reference === 'string' && item.reference.trim() !== '')
      .map((item) => item.id)
  );
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

/** The product still beneath the badges (certification-band-spec, the pattern). */
export const CERT_PRODUCT_PHOTO = '/assets/images/product-creatine.webp';
export const CERT_PRODUCT_PHOTO_WIDTH = 713;
export const CERT_PRODUCT_PHOTO_HEIGHT = 637;
