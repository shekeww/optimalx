import { useTranslation } from '@salla.sa/twilight-theme-engine/i18n';
import type { Cart } from '@salla.sa/twilight-theme-engine/types';
import type { Order } from '@salla.sa/twilight-theme-engine/routes/account';
import { EmptyState } from '../common/EmptyState';
import { Button } from '../common/Button';
import { CartEmpty } from './CartEmpty';
import { CartTrust } from './CartTrust';
import { ThankYouBlocks } from './ThankYouBlocks';
import { BlogIndexHeader } from './BlogIndexHeader';
import { PolicyIntro } from './PolicyIntro';

/**
 * The commerce section of the kitchen sink (PLAN-final C16). Dev-only.
 *
 * It renders what a live walk cannot reach: the cart states without a cart,
 * the thank-you blocks without an order (the store has none yet, open
 * question Q14), and the three account empty states, whose live pages are the
 * engine's own placeholder because those routes expose no hook slot.
 */
const CART_PROGRESS = {
  sub_total: 120,
  free_shipping_bar: { minimum_amount: 200, has_free_shipping: false, percent: 60, remaining: 80 },
} as unknown as Cart;

const CART_REACHED = {
  sub_total: 320,
  free_shipping_bar: { minimum_amount: 200, has_free_shipping: true, percent: 100, remaining: 0 },
} as unknown as Cart;

const ORDER: Order = {
  id: 1,
  type: 'order',
  items: [
    { id: 1, name: 'Whey', quantity: 1, amounts: {}, product: { id: 1996831868, url: '#' } },
    { id: 2, name: 'Creatine', quantity: 1, amounts: {}, product: { id: 995134839, url: '#' } },
  ],
} as unknown as Order;

export default function KitchenSink() {
  const { t } = useTranslation();

  return (
    <section>
      <h2>Commerce (B6)</h2>

      <h3>Cart: empty</h3>
      <div className="ox-cart ox-cart--empty">
        <CartEmpty />
      </div>

      <h3>Cart: free shipping in progress</h3>
      <div className="ox-cart">
        <CartTrust cart={CART_PROGRESS} />
      </div>

      <h3>Cart: free shipping reached</h3>
      <div className="ox-cart">
        <CartTrust cart={CART_REACHED} />
      </div>

      <h3>Thank-you blocks</h3>
      <div className="ox-thankyou__blocks">
        <ThankYouBlocks order={ORDER} />
      </div>

      <h3>Guides index header</h3>
      <div className="ox-blog">
        <BlogIndexHeader />
      </div>

      <h3>Policy intros</h3>
      <div className="ox-policy">
        <PolicyIntro slug="shipping-policy" />
        <PolicyIntro slug="return-policy" />
        <PolicyIntro slug="privacy-policy" />
        <PolicyIntro slug="terms-and-conditions" />
      </div>

      <h3>Account empty states</h3>
      <EmptyState
        icon="gift"
        title={t('ox.empty.wishlist_title')}
        body={t('ox.empty.wishlist_body')}
        primary={<Button to="/latest-products">{t('ox.empty.cta_shop')}</Button>}
      />
      <EmptyState
        icon="plan"
        title={t('ox.empty.orders_title')}
        body={t('ox.empty.orders_body')}
        primary={<Button to="/latest-products">{t('ox.empty.cta_shop')}</Button>}
        secondary={
          <Button to="/" variant="secondary">
            {t('ox.empty.cta_goals')}
          </Button>
        }
      />
      <EmptyState
        icon="help"
        title={t('ox.empty.notifications_title')}
        body={t('ox.empty.notifications_body')}
        primary={<Button to="/account/orders">{t('ox.account.back')}</Button>}
      />
    </section>
  );
}
