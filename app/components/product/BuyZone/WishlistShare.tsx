import { useTranslation } from '@salla.sa/twilight-theme-engine/i18n';
import { useWishlist } from '@salla.sa/twilight-theme-engine/hooks/useWishlist';
import { SallaSocialShare } from '@salla.sa/twilight-components-react/social-share';
import { Icon } from '../../common/Icon';

export interface WishlistShareProps {
  productId: number;
}

/**
 * The two ghost buttons under the form (DIRECTION 5.4 WishlistShare). The
 * wishlist state is the engine's `useWishlist`; sharing is the native
 * `salla-social-share`, so no share URL is built by hand.
 */
export function WishlistShare({ productId }: WishlistShareProps) {
  const { t } = useTranslation();
  const wishlist = useWishlist();
  const inWishlist = wishlist.has(productId);

  return (
    <div className="ox-pdp__wishshare">
      <button
        type="button"
        className={'ox-btn ox-btn--ghost ox-pdp__wish' + (inWishlist ? ' is-active' : '')}
        onClick={() => wishlist.toggle(productId)}
        aria-pressed={inWishlist}
      >
        <i className="sicon-heart" aria-hidden="true" />
        <span>{inWishlist ? t('ox.pdp.wishlist_added') : t('ox.pdp.wishlist_add')}</span>
      </button>
      <div className="ox-pdp__share">
        <span className="ox-pdp__share-label">
          <Icon name="referral" size={20} />
          {t('ox.pdp.share')}
        </span>
        <SallaSocialShare />
      </div>
    </div>
  );
}
