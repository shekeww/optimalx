import { useQuery } from '@tanstack/react-query';
import { menu } from '@salla.sa/twilight-theme-engine/api/menu';
import { useTheme } from '@salla.sa/twilight-theme-engine/hooks/useTheme';
import { useTranslation } from '@salla.sa/twilight-theme-engine/i18n';
import { Button } from '../common/Button';
import { OxNewsletter } from '../blocks/OxNewsletter';
import { findMenuLink } from '../../content/nav';
import { fieldText, type OxBlockProps } from './defaults';

/**
 * The closing CTA band (S2c, 2026-09-22): a dark band with an image slot, a
 * headline and line that promise nothing, one filled `ox-angled()` action to
 * `/services`, and the newsletter form folded in.
 *
 * IT SHARES THE `ox-newsletter` REGISTRY SLOT, not a new one, so the whole
 * band — headline, line, CTA and the form — stays behind the one gate that
 * slot has: `show_newsletter` (default true since owner brief 2026-09-24,
 * item 2 — `twilight.json`, the merchant switch is unchanged). `OxNewsletter`
 * reads that setting itself; this component mirrors the same check so the
 * headline and the form never disagree about whether they are on the page.
 * `HOME_BLOCK_HEIGHTS['ox-newsletter']` and `BLOCK_SKELETONS['ox-newsletter']`
 * (`HomeSkeleton.tsx`) now reserve the band's real height, re-measured for the
 * default-on state (that file's own docblock has the numbers).
 *
 * THE NEWSLETTER'S OWN IDENTITY PLATE (item 2: "a conversion block on the
 * identity plate, corner cut per §3.3"): `.ox-cta-band__newsletter` carries
 * its own raised ground and corner cut (`_b2-home.scss`), the same
 * construction `.ox-services__offer` already draws on its own dark band — a
 * plate is its own component under X-IDENTITY's "one angled gesture per
 * component" rule, distinct from this band's own `.ox-cta-band__motif`.
 *
 * The privacy line's link (item 2) is resolved here, never invented: the
 * merchant's own footer menu (`menu.footer()`, `findMenuLink` — the exact
 * mechanism `UtilityTrust.tsx`/`FooterColumns.tsx` already use for the same
 * kind of policy-page link), passed down as `privacyUrl`. No match, no link —
 * `OxNewsletter` falls back to the plain sentence it always had.
 */
export function OxCtaBand({ data }: OxBlockProps) {
  const { t } = useTranslation();
  const { settings } = useTheme();
  const visible = Boolean((settings as Record<string, unknown> | undefined)?.show_newsletter);
  // `enabled: visible`: the query never fires while the band is hidden, and
  // the hook still runs on every render either way (Rules of Hooks — this
  // call has to sit above the early return below).
  const { data: footerMenu } = useQuery({
    queryKey: ['menu', 'footer'],
    queryFn: () => menu.footer(),
    staleTime: 5 * 60 * 1000,
    enabled: visible,
  });
  if (!visible) return null;

  const image = fieldText(data, 'image');
  const headline = fieldText(data, 'headline') || t('ox.home.cta_headline');
  const line = fieldText(data, 'line') || t('ox.home.cta_line');
  // Tokens duplicated from `content/nav.ts`'s own `privacy` footer entry
  // rather than imported (`UtilityTrust.tsx`'s own `AUTHENTICITY_TOKENS` is
  // the same local-const precedent): these are matchers against the
  // merchant's own page titles, not copy, so they stay out of locales/.
  const privacyUrl = findMenuLink(footerMenu, ['privacy', 'الخصوصية'])?.url; // ox-allow: arabic-literal match token, not copy

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
        <OxNewsletter className="ox-cta-band__newsletter" enabled={visible} privacyUrl={privacyUrl} />
      </div>
    </section>
  );
}
