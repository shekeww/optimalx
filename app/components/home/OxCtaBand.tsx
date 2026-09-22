import { useTheme } from '@salla.sa/twilight-theme-engine/hooks/useTheme';
import { useTranslation } from '@salla.sa/twilight-theme-engine/i18n';
import { Button } from '../common/Button';
import { OxNewsletter } from '../blocks/OxNewsletter';
import { fieldText, type OxBlockProps } from './defaults';

/**
 * The closing CTA band (S2c, 2026-09-22): a dark band with an image slot, a
 * headline and line that promise nothing, one filled `ox-angled()` action to
 * `/services`, and the newsletter form folded in.
 *
 * IT SHARES THE `ox-newsletter` REGISTRY SLOT, not a new one. `HomeSkeleton.tsx`
 * and its reserved-height table (`BLOCK_SKELETONS['ox-newsletter']`,
 * `HOME_BLOCK_HEIGHTS['ox-newsletter']`) belong to a different batch in this
 * plan, and both currently reserve nothing on the reasoning that a block which
 * may render null must not promise a box that then collapses
 * (`tests/home/optionalBlocks.test.ts`). A second, always-on gate on this same
 * band would need its own skeleton entry to stay CLS-safe, which is a file
 * this batch cannot touch, so the whole band — headline, line, CTA, and the
 * form — stays behind the one gate that slot already has: `show_newsletter`.
 * `OxNewsletter` reads that setting itself; this component mirrors the same
 * check so the headline and the form never disagree about whether they are on
 * the page.
 */
export function OxCtaBand({ data }: OxBlockProps) {
  const { t } = useTranslation();
  const { settings } = useTheme();
  const visible = Boolean((settings as Record<string, unknown> | undefined)?.show_newsletter);
  if (!visible) return null;

  const image = fieldText(data, 'image');
  const headline = fieldText(data, 'headline') || t('ox.home.cta_headline');
  const line = fieldText(data, 'line') || t('ox.home.cta_line');

  return (
    <section
      className="ox-cta-band ox-band-dark"
      aria-labelledby="ox-cta-band-title"
      data-testid="ox-cta-band"
      style={image ? { ['--ox-band-image' as string]: `url("${image}")` } : undefined}
    >
      {/* The section's one angled band edge (identity rule); the accent
          colour lives on the CTA below, the thing a reader can click. */}
      <span className="ox-cta-band__motif" aria-hidden="true" />
      <div className="ox-container ox-cta-band__inner">
        <div className="ox-cta-band__copy">
          <h2 id="ox-cta-band-title" className="ox-cta-band__title ox-h2">
            {headline}
          </h2>
          <p className="ox-cta-band__line">{line}</p>
          <Button to="/services" size={44} variant="primary" className="ox-cta-band__cta">
            {t('ox.common.view_all')}
          </Button>
        </div>
        <OxNewsletter className="ox-cta-band__newsletter" enabled={visible} />
      </div>
    </section>
  );
}
