import { useTranslation } from '@salla.sa/twilight-theme-engine/i18n';
import { SectionHeader } from '../../common/SectionHeader';

export interface DescriptionProps {
  /** Already sanitised by `sanitizeHtml`; never raw merchant HTML. */
  html: string;
}

/**
 * The merchant's prose, minus the spec line, the nutrition table, the
 * how-to-use line and the warning, which the PDP renders as their own blocks.
 *
 * `html` arrives from `splitDescription`, which runs everything through the
 * dependency-free sanitiser first (PLAN-final C6). This is one of exactly two
 * places the theme writes HTML into the DOM; the other is the JSON-LD script,
 * which goes through `toScriptText`.
 */
export function Description({ html }: DescriptionProps) {
  const { t } = useTranslation();
  if (!html) return null;
  return (
    <section className="ox-pdp__description" aria-labelledby="ox-description-title">
      <SectionHeader title={t('ox.pdp.description')} titleId="ox-description-title" />
      <div className="ox-prose" dangerouslySetInnerHTML={{ __html: html }} />
    </section>
  );
}
