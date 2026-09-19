import { Image } from '@salla.sa/twilight-theme-engine/common';
import type { Brand } from '@salla.sa/twilight-theme-engine/routes/brands';
import { Bdi } from '../common/Bdi';

export interface BrandHeaderProps {
  brand: Brand;
}

/**
 * The brand logo plate for the listing title row (DIRECTION 6.14: "a brand
 * route is the 6.3 composition with the logo plate in the ListingHeader").
 *
 * The engine's own brand header is not used: it renders a 300px banner and the
 * brand description through `dangerouslySetInnerHTML`
 * (theme-engine dist/routes/product-listing.js). Merchant HTML never reaches
 * this theme unsanitised, so the description is rendered as text with its tags
 * removed, and the logo is shown on a plate, contained, never recoloured or
 * cropped.
 */

/** Tag-stripped text of a merchant HTML string. Never re-inserted as HTML. */
export function plainText(html: string | undefined | null): string {
  if (!html) return '';
  let out = '';
  let inTag = false;
  for (const char of html) {
    if (char === '<') inTag = true;
    else if (char === '>') inTag = false;
    else if (!inTag) out += char;
  }
  return out.split(String.fromCharCode(160)).join(' ').split(/\s+/).filter(Boolean).join(' ');
}

export function BrandHeader({ brand }: BrandHeaderProps) {
  if (!brand.logo) return null;
  return (
    <span className="ox-brand-plate">
      <Image
        className="ox-brand-plate__img"
        src={brand.logo}
        alt={brand.name}
        width={96}
        height={64}
      />
    </span>
  );
}

export interface BrandIntroProps {
  brand: Brand;
}

/** The brand's own line under the title, as text. Absent when it is empty. */
export function BrandIntro({ brand }: BrandIntroProps) {
  const text = plainText(brand.description);
  if (!text) return null;
  return (
    <p className="ox-listing__intro-text ox-body">
      <Bdi lang={null}>{text}</Bdi>
    </p>
  );
}
