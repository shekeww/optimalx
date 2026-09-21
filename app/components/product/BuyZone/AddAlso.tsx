import { useQuery } from '@tanstack/react-query';
import { product } from '@salla.sa/twilight-theme-engine/api/product';
import { ProductCard } from '@salla.sa/twilight-theme-engine/product';
import { useTranslation } from '@salla.sa/twilight-theme-engine/i18n';
import type { Product } from '@salla.sa/twilight-theme-engine/types';

export interface AddAlsoProps {
  productId: number;
  /** The product's own category, when the catalogue puts it in one. */
  categoryId?: number | null;
  className?: string;
}

/** Three, the number the reference puts in this slot; a fourth is scroll. */
const STRIP_SIZE = 3;

/**
 * The cross-sell strip directly under the buy zone.
 *
 * The highest-intent moment on a product page is the second after the shopper
 * has read the price and the delivery line, and nothing was offered there:
 * the theme's one rail sat at the very bottom, after the reviews. Every
 * reference retailer puts something in this slot.
 *
 * ## What it may not say
 *
 * It may not say these products are bought together, or bought at all: that
 * is order data and the store has none. The heading is `أضف إلى طلبك`, which
 * states what the strip is for and claims nothing about anybody else's
 * basket. No badge, no count, no rating.
 *
 * ## Why it can be empty, and why that is the point
 *
 * Two sources, in order: the merchant's own hand-linked related products,
 * then the product's own category. There is deliberately no `latest`
 * fallback, which is what the bottom rail has. With one, both rails would
 * show the same products on a catalogue with no curation and no categories,
 * and a shopper would scroll past the same strip twice. Without one, this
 * renders nothing at all until the merchant links related products or
 * assigns a category, which is a dashboard action that turns it on with no
 * code change. On the live store today neither exists: the catalogue has no
 * categories at all (`categories_list` returns an empty set, checked
 * 2026-09-20) and `product.list({source: 'related'})` came back empty on
 * every product checked when `Alternatives` was built, which is why that
 * rail needed its `latest` fallback. So the honest current render of this
 * region is no region.
 *
 * ## Why it is not `ProductsSliderWrapper`
 *
 * That component paints its heading and slider first and removes itself once
 * its loader comes back empty. On a page where the answer is almost always
 * empty, that is a block that appears and then collapses under the buy zone,
 * exactly as the shopper reaches it. This one asks first and renders only
 * with products in hand, so there is nothing to take away: no heading over an
 * empty strip, no reserved box, no shift. Three cards also do not need a
 * carousel; below 640 they are a native scroll-snap row and from 640 a row of
 * three, and no JavaScript runs per frame either way.
 *
 * The current product is excluded, so the strip never offers the page it is
 * on, and the whole section is behind `RenderWhenVisible` at the call site so
 * a phone pays for the request only on scroll.
 */
export function AddAlso({ productId, categoryId, className }: AddAlsoProps) {
  const { t } = useTranslation();

  const { data } = useQuery({
    queryKey: ['ox', 'add-also', productId, categoryId ?? null],
    queryFn: async (): Promise<Product[]> => {
      const sources = [
        { source: 'related' as const, sourceValue: productId },
        ...(categoryId ? [{ source: 'categories' as const, sourceValue: categoryId }] : []),
      ];
      for (const query of sources) {
        const result = await product.list({ ...query, perPage: STRIP_SIZE + 1 });
        const items = result.items.filter((item) => String(item.id) !== String(productId));
        if (items.length > 0) return items.slice(0, STRIP_SIZE);
      }
      return [];
    },
    staleTime: 5 * 60 * 1000,
  });

  if (!data || data.length === 0) return null;

  return (
    <section
      className={['ox-add-also', className].filter(Boolean).join(' ')}
      aria-labelledby="ox-add-also-title"
      data-testid="ox-add-also"
    >
      <h2 id="ox-add-also-title" className="ox-add-also__title ox-h3">
        {t('ox.pdp.add_also')}
      </h2>
      <ul className="ox-add-also__items">
        {data.map((item) => (
          <li key={item.id}>
            <ProductCard product={item} />
          </li>
        ))}
      </ul>
    </section>
  );
}

export default AddAlso;
