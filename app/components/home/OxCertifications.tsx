import { CertificationBand } from './CertificationBand';
import {
  resolveCertifications,
  type CertificationEvidence,
  type CertificationPhoto,
} from '../../content/certifications';
import { fieldList, fieldText, rowText, type OxBlockProps } from './defaults';

/**
 * The certification band block (homepage-scale-spec section 10).
 *
 * **Absent everywhere today, and that is the correct default.** The store
 * holds no certifications of its own and no product carries the per-product
 * evidence a badge needs, so `resolveCertifications` returns an empty list,
 * the band renders `null`, and the block reserves 0 height on both
 * viewports. The page is designed to close correctly without it: the
 * advisory band above and the FAQ below both carry their own separation.
 *
 * The distinction that makes the section buildable at all is that these are
 * PRODUCT attributes, not STORE attributes. A reseller may display a
 * manufacturer's certification for a product that genuinely holds it. It may
 * never display one as a property of the shop, and it may never display one
 * for a product that does not hold it. `Halal` in particular ships only
 * against a certificate reference: this is the Saudi market, and an unbacked
 * halal claim is the most damaging one on the list.
 *
 * The evidence arrives through the `certifications` collection, which is a
 * merchant field so the owner can wire it to whatever source they settle on
 * without a code change: each row is a badge id and the certificate or
 * registration reference that proves it. A row with no reference is not
 * evidence and is dropped by the resolver, so an empty reference cannot turn
 * a badge on, and neither can a lone dash typed to get past a field.
 *
 * The still is the merchant's `photo`, and it has no fallback. A photograph
 * under four badges says that product holds them, and nothing on the home
 * page ties the evidence rows to a product. A merchant who uploads one is
 * the party asserting the link; the theme will not assert it for them.
 */

/**
 * One cell of a collection row.
 *
 * `rowText` covers the two shapes the engine sends for a plain field. Both
 * of this block's sub-fields are declared `multilanguage` in the manifest,
 * though, and a multilanguage field arrives as `{ ar, en }`, which `rowText`
 * reads as empty. A certificate number is the same number in both languages,
 * so the first non-empty value is the value. (The manifest should drop
 * `multilanguage` on both; this keeps the evidence readable either way.)
 */
function cellText(row: unknown, id: string): string {
  const direct = rowText(row, id);
  if (direct !== '') return direct;
  if (!row || typeof row !== 'object') return '';
  const record = row as Record<string, unknown>;
  const suffix = `.${id}`;
  for (const key of Object.keys(record)) {
    if (key !== id && !key.endsWith(suffix)) continue;
    const value = record[key];
    if (!value || typeof value !== 'object') continue;
    for (const localized of Object.values(value as Record<string, unknown>)) {
      if (typeof localized === 'string' && localized.trim() !== '') return localized.trim();
    }
  }
  return '';
}

export function OxCertifications({ data }: OxBlockProps) {
  const evidence: CertificationEvidence[] = fieldList(data, 'certifications')
    .map((row) => ({ id: cellText(row, 'id'), reference: cellText(row, 'reference') }))
    .filter((row) => row.id !== '' && row.reference !== '');

  const badges = resolveCertifications(evidence);
  if (badges.length === 0) return null;

  const src = fieldText(data, 'photo');
  const photo: CertificationPhoto | undefined = src === '' ? undefined : { src };

  return <CertificationBand badges={badges} photo={photo} />;
}
