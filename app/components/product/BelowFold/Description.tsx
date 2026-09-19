import { useTranslation } from '@salla.sa/twilight-theme-engine/i18n';
import { SectionHeader } from '../../common/SectionHeader';

export interface DescriptionProps {
  /** Already sanitised by `sanitizeHtml`; never raw merchant HTML. */
  html: string;
}

/**
 * The benefits region (design region 39): the merchant's remaining prose on
 * the page ground, at the full container width, between the panel row and the
 * carousel. It is the strip's second anchor.
 *
 * `html` arrives from `splitDescription`, which has already taken the spec
 * line, the short description, the label table, the how-to-use paragraph and
 * the warning out of it, and has run the rest through the dependency-free
 * sanitiser (PLAN-final C6). This is one of exactly two places the theme
 * writes HTML into the DOM.
 *
 * Claims gate B20: with nothing left after the split there is no region and no
 * tab, rather than a heading over an empty box.
 */
export function Description({ html }: DescriptionProps) {
  const { t } = useTranslation();
  if (!html) return null;
  return (
    <section
      className="ox-pdp__description"
      id="ox-benefits"
      aria-labelledby="ox-description-title"
    >
      <SectionHeader title={t('ox.pdp.tab_benefits')} titleId="ox-description-title" />
      <div className="ox-prose" dangerouslySetInnerHTML={{ __html: html }} />
    </section>
  );
}
