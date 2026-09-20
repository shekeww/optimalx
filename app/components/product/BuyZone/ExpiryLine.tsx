import { useTranslation } from '@salla.sa/twilight-theme-engine/i18n';
import { Icon } from '../../common/Icon';
import { monthsUntilExpiry } from '../lib/supply';

export interface ExpiryLineProps {
  /** Expiry as `YYYY-MM`, read off the spec line. */
  expiry?: string | null;
  className?: string;
}

/** Below this the date is a warning and `PdpPriceBlock` badges it instead. */
const NEAR_MONTHS = 6;

/**
 * The expiry date, above the fold, on every product whose label printed one.
 *
 * The trust strip promises `صلاحية واضحة على كل منتج`, and until now the page
 * kept that promise only when the news was bad: a product inside six months
 * of expiry got a warning badge in the price block, and a product two years
 * out showed its date in the details panel, below the fold, behind a tab.
 * In this category and this market the far date is the reassurance, so it
 * belongs where the shopper is deciding.
 *
 * The two renders never both appear. Under six months the badge in
 * `PdpPriceBlock` already carries the date in the warning tone and this
 * component stands down; from six months out this states the fact plainly.
 * A product with no printed expiry renders neither, and the buy column closes
 * the gap: nothing here is defaulted, inferred or rounded.
 *
 * The date is `YYYY-MM` exactly as the label printed it, so the numerals are
 * Western in both locales without anything converting them. It is
 * interpolated into the sentence the way every other date in this theme is,
 * and `.ox-num` sets the figures on one tabular width so two products in a
 * row do not have their dates on different rhythms.
 */
export function ExpiryLine({ expiry, className }: ExpiryLineProps) {
  const { t } = useTranslation();
  if (!expiry) return null;

  const months = monthsUntilExpiry(expiry);
  if (months !== null && months >= 0 && months < NEAR_MONTHS) return null;

  return (
    <p
      className={['ox-pdp__expiry', 'ox-num', className].filter(Boolean).join(' ')}
      data-testid="ox-pdp-expiry"
    >
      <Icon name="expiry" size={18} className="ox-pdp__expiry-icon" />
      <span>{t('ox.pdp.expiry_line', { date: expiry })}</span>
    </p>
  );
}

export default ExpiryLine;
