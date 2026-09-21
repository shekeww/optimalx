/**
 * The dark brand band's copy, keyed by category (design region 31).
 *
 * The approved image sets a two line statement over the photograph. That
 * statement is brand copy, not product copy: writing it per product would mean
 * inventing a sentence for all 47 products, and inventing sentences about
 * supplements is exactly what the claims rules forbid. So a category picks one
 * of a small set of approved statements, and everything unmapped gets the
 * default.
 *
 * Only locale keys live here. The sentences themselves are in locales/, where
 * a reviewer reads them next to every other string in the store.
 */
export interface BandCopy {
  /** First headline line. */
  line1Key: string;
  /** Second headline line. */
  line2Key: string;
  /** The sub line under the headline. */
  sublineKey: string;
}

export const DEFAULT_BAND: BandCopy = {
  line1Key: 'ox.pdp.band_headline_1',
  line2Key: 'ox.pdp.band_headline_2',
  sublineKey: 'ox.pdp.band_subline',
};

/**
 * Category slug to copy. The slugs are the catalogue's own, taken from the
 * category URL (`/whey-protein/c123` reads as `whey-protein`).
 */
export const BAND_BY_CATEGORY: Record<string, BandCopy> = {
  'whey-protein': {
    line1Key: 'ox.pdp.band_headline_protein_1',
    line2Key: 'ox.pdp.band_headline_protein_2',
    sublineKey: 'ox.pdp.band_subline',
  },
  protein: {
    line1Key: 'ox.pdp.band_headline_protein_1',
    line2Key: 'ox.pdp.band_headline_protein_2',
    sublineKey: 'ox.pdp.band_subline',
  },
};

/** The copy for a category slug, or the default when the slug is unmapped. */
export function bandCopyFor(slug: string | undefined | null): BandCopy {
  if (!slug) return DEFAULT_BAND;
  return BAND_BY_CATEGORY[slug] ?? DEFAULT_BAND;
}
