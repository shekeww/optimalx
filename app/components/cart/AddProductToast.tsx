import { useState, useEffect, useCallback, useRef } from 'react';
import { useTranslation } from '@salla.sa/twilight-theme-engine/i18n';
import { Link } from '@salla.sa/twilight-theme-engine/common';
import { useMoney } from '@salla.sa/twilight-theme-engine/hooks/useMoney';
import type { Money } from '@salla.sa/twilight-theme-engine/types';
import { Icon } from '../common/Icon';

interface ToastProduct {
  id: number;
  name: string;
  image: string;
  price: number | Money;
  originalPrice?: number | Money;
  hasDiscount?: boolean;
  isOnSale?: boolean;
  quantity: number;
  url: string;
  options: Array<{ name: string; value: string; hideValue?: boolean }>;
}

interface CartAnalyticsItem {
  cart_item_id?: number;
}

interface CartOptionDetail {
  name: string;
  is_selected: boolean;
}

interface CartOption {
  type: string;
  name: string;
  details?: CartOptionDetail[];
  value?: string;
}

interface CartItemWithOptions {
  id: string | number;
  product_id: number;
  product_name: string;
  product_image: string;
  url: string;
  quantity: number;
  price: number | Money;
  original_price?: number | Money;
  total: number | Money;
  has_discount?: boolean;
  is_on_sale?: boolean;
  options?: CartOption[];
}

interface CartDetailsResponse {
  data?: {
    cart?: {
      items?: CartItemWithOptions[];
    };
  };
}

const TOAST_DURATION = 5000;
const UPDATE_INTERVAL = 50;
const EMPTY_OPTIONS: ToastProduct['options'] = [];

function extractOptions(options: CartOption[] | undefined): ToastProduct['options'] {
  if (!options?.length) return EMPTY_OPTIONS;

  return options.reduce<ToastProduct['options']>((result, option) => {
    if (option.type === 'splitter') return result;

    if (option.details?.length) {
      const selected = option.details.filter((d: CartOptionDetail) => d.is_selected);

      if (selected.length > 0) {
        result.push({
          name: option.name,
          value: selected.map((d: CartOptionDetail) => d.name).join(', '),
        });
      }
    } else if (option.value) {
      const hideValue = ['image', 'file', 'map'].includes(option.type);
      result.push({ name: option.name, value: option.value, hideValue });
    }

    return result;
  }, []);
}

export function AddProductToast() {
  const { t, isRTL } = useTranslation();
  const { format } = useMoney();

  const [product, setProduct] = useState<ToastProduct | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [progressPercent, setProgressPercent] = useState(100);
  const [isPaused, setIsPaused] = useState(false);

  const progressIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const remainingTimeRef = useRef(TOAST_DURATION);

  const clearTimers = useCallback(() => {
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = null;
    }
  }, []);

  const close = useCallback(() => {
    clearTimers();
    setIsVisible(false);
    setTimeout(() => setProduct(null), 300);
  }, [clearTimers]);

  const startAutoHideTimer = useCallback(() => {
    clearTimers();
    setIsPaused(false);
    remainingTimeRef.current = TOAST_DURATION;
    setProgressPercent(100);

    progressIntervalRef.current = setInterval(() => {
      if (isPaused) return;

      remainingTimeRef.current = Math.max(0, remainingTimeRef.current - UPDATE_INTERVAL);
      const newProgress = (remainingTimeRef.current / TOAST_DURATION) * 100;
      setProgressPercent(newProgress);

      if (remainingTimeRef.current <= 0) {
        close();
      }
    }, UPDATE_INTERVAL);
  }, [isPaused, clearTimers, close]);

  const handleProductAdded = useCallback(
    async (analyticsData: unknown) => {
      try {
        const items = analyticsData as CartAnalyticsItem[];
        if (!items?.length) return;

        const cartItemId = items[0].cart_item_id;
        if (!cartItemId) return;

        const salla = window.salla as {
          cart?: {
            api?: {
              details?: (id?: null, include?: string[]) => Promise<CartDetailsResponse>;
            };
            submit?: () => void;
          };
          url?: {
            get?: (key: string) => string | undefined;
            asset?: (path: string) => string | undefined;
          };
          log?: (message: string, error?: unknown) => void;
          event?: {
            on?: (event: string, handler: (data: unknown) => void) => void;
            off?: (event: string, handler: (data: unknown) => void) => void;
          };
        };

        const cartResponse = await salla?.cart?.api?.details?.(null, ['options']);
        if (!cartResponse?.data?.cart?.items) return;

        const cartItem = cartResponse.data.cart.items.find(
          (item) => Number(item.id) === cartItemId
        );
        if (!cartItem) return;

        const toastProduct: ToastProduct = {
          id: cartItem.product_id,
          name: cartItem.product_name,
          image: cartItem.product_image,
          price: cartItem.total,
          originalPrice: cartItem.original_price
            ? typeof cartItem.original_price === 'number'
              ? cartItem.original_price * cartItem.quantity
              : cartItem.original_price
            : undefined,
          hasDiscount: cartItem.has_discount,
          isOnSale: cartItem.is_on_sale,
          quantity: cartItem.quantity,
          url: cartItem.url,
          options: extractOptions(cartItem.options),
        };

        setProduct(toastProduct);
        setIsVisible(true);
        startAutoHideTimer();
      } catch (error) {
        (window.salla as { log?: (msg: string, err?: unknown) => void })?.log?.(
          'Error processing product added event:',
          error
        );
      }
    },
    [startAutoHideTimer]
  );

  useEffect(() => {
    const salla = window.salla as {
      event?: {
        on?: (event: string, handler: (data: unknown) => void) => void;
        off?: (event: string, handler: (data: unknown) => void) => void;
      };
    };
    salla?.event?.on?.('Product Added', handleProductAdded);
    return () => {
      salla?.event?.off?.('Product Added', handleProductAdded);
      clearTimers();
    };
  }, [handleProductAdded, clearTimers]);

  useEffect(() => {
    if (isPaused && progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = null;
    } else if (!isPaused && isVisible && !progressIntervalRef.current) {
      progressIntervalRef.current = setInterval(() => {
        remainingTimeRef.current = Math.max(0, remainingTimeRef.current - UPDATE_INTERVAL);
        const newProgress = (remainingTimeRef.current / TOAST_DURATION) * 100;
        setProgressPercent(newProgress);

        if (remainingTimeRef.current <= 0) {
          close();
        }
      }, UPDATE_INTERVAL);
    }
    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }
    };
  }, [isPaused, isVisible, close]);

  const handleCheckout = useCallback(() => {
    const salla = window.salla as { cart?: { submit?: () => void } };
    salla?.cart?.submit?.();
    close();
  }, [close]);

  const handleMouseEnter = useCallback(() => setIsPaused(true), []);
  const handleMouseLeave = useCallback(() => setIsPaused(false), []);

  if (!isVisible || !product) {
    return null;
  }

  const visibleOptions = product.options.slice(0, 3);
  const showMoreButton = product.options.length > 3;
  const salla = window.salla as {
    url?: {
      get?: (key: string) => string | undefined;
      asset?: (path: string) => string | undefined;
    };
  };
  const cartUrl = salla?.url?.get?.('cart') || '/cart';
  const checkIconUrl = salla?.url?.asset?.('images/check.svg') || '/images/check.svg';

  const formatMoney = (value: number | Money): React.ReactNode => {
    return typeof value === 'object' && value.formatted
      ? value.formatted
      : format(typeof value === 'object' ? value.amount : value);
  };

  const priceDisplay = formatMoney(product.price);
  const originalPriceDisplay = product.originalPrice ? formatMoney(product.originalPrice) : null;

  return (
    <div
      className={`s-add-product-toast ${isVisible ? 's-add-product-toast--visible' : ''}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      <div className="s-add-product-toast__progress">
        <div
          className="s-add-product-toast__progress-bar"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      <div className="s-add-product-toast__header">
        <div className="s-add-product-toast__header-content">
          <img
            src={checkIconUrl}
            alt="Success"
            width={16}
            height={16}
            className="s-add-product-toast__icon"
          />
          <span className="s-add-product-toast__title">
            {t('pages.cart.added_to_cart', 'Added to Cart')}
          </span>
        </div>
        <button
          type="button"
          className="s-add-product-toast__close"
          aria-label="Close"
          onClick={close}
        >
          <Icon name="close" size={24} />
        </button>
      </div>

      <div className="s-add-product-toast__divider" />

      <div className="s-add-product-toast__body">
        <Link to={product.url} className="s-add-product-toast__image">
          <img src={product.image} alt={product.name} loading="lazy" />
        </Link>
        <div className="s-add-product-toast__details">
          <Link to={product.url} className="s-add-product-toast__name">
            {product.name}
          </Link>
          {visibleOptions.length > 0 && (
            <div className="s-add-product-toast__options">
              {visibleOptions.map((opt, idx) => (
                <span key={idx}>{opt.hideValue ? opt.name : `${opt.name}: ${opt.value}`}</span>
              ))}
              {showMoreButton && (
                <Link to={cartUrl} className="s-add-product-toast__show-more">
                  {t('pages.checkout.show_more', 'Show more')}
                </Link>
              )}
            </div>
          )}
        </div>
        <div className="s-add-product-toast__price">
          {(product.hasDiscount || product.isOnSale) && originalPriceDisplay ? (
            <>
              <div className="s-add-product-toast__price-sale">{priceDisplay}</div>
              <div className="s-add-product-toast__price-original">{originalPriceDisplay}</div>
            </>
          ) : (
            <div>{priceDisplay}</div>
          )}
        </div>
      </div>

      <div className="s-add-product-toast__actions">
        <button
          type="button"
          className="s-add-product-toast__button s-add-product-toast__button--primary"
          onClick={handleCheckout}
        >
          <span>{t('pages.cart.complete_order', 'Complete Order')}</span>
          <Icon name="secure-payment" size={20} />
        </button>
        <Link
          to={cartUrl}
          className="s-add-product-toast__button s-add-product-toast__button--outline"
        >
          <span>{t('pages.cart.view_cart', 'View Cart')}</span>
          <Icon name="cart" size={20} />
        </Link>
      </div>
    </div>
  );
}
