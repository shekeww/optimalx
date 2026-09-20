import { CertificationBand } from './CertificationBand';
import { resolveCertifications, type CertificationEvidence } from '../../content/certifications';
import { fieldList, rowText, type OxBlockProps } from './defaults';

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
 * a badge on.
 */
export function OxCertifications({ data }: OxBlockProps) {
  const evidence: CertificationEvidence[] = fieldList(data, 'certifications')
    .map((row) => ({ id: rowText(row, 'id'), reference: rowText(row, 'reference') }))
    .filter((row) => row.id !== '' && row.reference !== '');

  const badges = resolveCertifications(evidence);
  if (badges.length === 0) return null;

  return <CertificationBand badges={badges} />;
}
