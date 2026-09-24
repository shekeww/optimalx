import { OxCtaBand } from './OxCtaBand';
import type { OxBlockProps } from './defaults';

/**
 * The closing CTA band (DIRECTION 5.2 OxNewsletter, 6.2 row 11; rebuilt as
 * `OxCtaBand`, S2c 2026-09-22): a headline and line that promise nothing, one
 * filled action to `/services`, an image slot, and the newsletter form folded
 * in. Still hidden unless the `show_newsletter` theme setting is on
 * (`OxCtaBand` reads it), see that file's docblock for why the whole band,
 * not only the form, shares that one gate.
 */
export function OxNewsletterBlock({ data }: OxBlockProps) {
  return <OxCtaBand data={data} />;

}
