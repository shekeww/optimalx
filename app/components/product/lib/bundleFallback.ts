import { useMemo } from 'react';
import type { Product } from '@salla.sa/twilight-theme-engine/types';
import { bundleMembers, type BundleMember } from './variant';
import { useCatalogueProducts } from './catalogue';
import { bundleOfProduct, idsForSkus, SHOW_SAMPLE_BUNDLES } from '../../../content/bundles';

/**
 * A bundle PDP's own member list (BUILD S9d): the live API's own
 * `consisted_products` when the platform has sent one, else the content
 * map's member SKUs, fetched live through the engine's own `selected`
 * source — the fallback the store needs until the owner attaches the
 * bundle's items in the dashboard (owner-checklist item 17). Never a number
 * invented here: every member below is a product the catalogue actually
 * returned.
 */
export function useBundleMembers(
  product: Product,
  isBundle: boolean,
  sample: boolean = SHOW_SAMPLE_BUNDLES
): BundleMember[] {
  const apiMembers = isBundle ? bundleMembers(product) : [];
  const fallbackBundle =
    isBundle && apiMembers.length === 0 ? bundleOfProduct(product.id, { sample }) : undefined;
  const fallbackIds = useMemo(
    () => (fallbackBundle ? idsForSkus(fallbackBundle.memberSkus) : []),
    [fallbackBundle]
  );
  const fallbackProducts = useCatalogueProducts(fallbackIds);

  if (apiMembers.length > 0) return apiMembers;
  return fallbackProducts.map((item) => ({
    id: item.id,
    name: item.name,
    url: item.url,
    image: item.image?.url,
  }));
}
