import { useTranslation } from '@salla.sa/twilight-theme-engine/i18n';
import { useTheme } from '@salla.sa/twilight-theme-engine/hooks/useTheme';
import { EmptyState } from '../common/EmptyState';
import { Button } from '../common/Button';
import { freeShippingThreshold } from '../product/lib/claims';
import { amountText } from './freeShipping';

export interface CartEmptyProps {
  /** Overrides the goal link (kitchen sink). */
  goalsHref?: string;
  categoriesHref?: string;
  askHref?: string;
}

/**
 * The empty cart (DIRECTION 5.6, FINAL-content 6.5 row 1). It replaces the
 * engine's `NoContent` placeholder, which the cart route renders with a
 * "Back to Home" button and no route out that matches how this shop is
 * browsed.
 *
 * The free-shipping sentence is claims gated: with no threshold set, the body
 * drops that clause rather than inventing a number.
 */
export function CartEmpty({
  goalsHref = '/',
  categoriesHref = '/latest-products',
  askHref = '/services',
}: CartEmptyProps) {
  const { t } = useTranslation();
  const { settings } = useTheme();
  const threshold = freeShippingThreshold(settings as Record<string, unknown> | undefined);

  return (
    <EmptyState
      className="ox-cart-empty"
      data-testid="ox-cart-empty"
      icon="shipping"
      headingLevel="h1"
      title={t('ox.empty.cart_title')}
      body={
        threshold === null
          ? t('ox.empty.cart_body_plain')
          : t('ox.empty.cart_body', { threshold: amountText(threshold) })
      }
      primary={
        <Button to={goalsHref} size={48} variant="primary">
          {t('ox.empty.cta_goals')}
        </Button>
      }
      secondary={
        <Button to={categoriesHref} size={48} variant="secondary">
          {t('ox.empty.cta_categories')}
        </Button>
      }
      footer={
        <Button to={askHref} variant="link">
          {t('ox.empty.cta_ask')}
        </Button>
      }
    />
  );
}
