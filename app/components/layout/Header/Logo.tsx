import { Link } from '@salla.sa/twilight-theme-engine/common';
import { useStore } from '@salla.sa/twilight-theme-engine/hooks/useStore';
import { useTranslation } from '@salla.sa/twilight-theme-engine/i18n';
import { Wordmark } from '../../common/Wordmark';

/**
 * The stopgap raster: `public/Logo.webp` is a 1254 square on white. It is
 * still the mark on a light ground where the store has uploaded nothing else.
 */
export const LOGO_SRC = '/Logo.webp';

export interface LogoProps {
  /** Drawn width of the lockup in px (112 header, 108 mobile, 150 footer). */
  width?: number;
  /**
   * Draw the store's uploaded raster instead of the reversed lockup. Only the
   * drawer head uses this: it is the one place the mark sits on paper.
   */
  raster?: boolean;
  /** Reserved box for the raster; ignored by the lockup. */
  size?: number;
  /** Eager in the header (it is in the first viewport), lazy elsewhere. */
  priority?: boolean;
  className?: string;
}

/**
 * The store mark, linked home.
 *
 * Everywhere the approved design puts the mark, it sits on a dark band, so the
 * default is the reversed `Wordmark` lockup rather than the raster (a raster
 * on white needs a paper plate on graphite, which is a rectangle the design
 * does not have). `raster` keeps the uploaded logo available for the one
 * light-ground placement.
 */
export function Logo({ width = 112, raster = false, size = 40, priority = false, className }: LogoProps) {
  const { t } = useTranslation();
  const store = useStore();
  const name = store?.name || t('ox.header.logo_alt');

  return (
    <Link to="/" className={['ox-logo', className].filter(Boolean).join(' ')} aria-label={name}>
      {raster ? (
        <img
          src={store?.logo || LOGO_SRC}
          alt=""
          width={size}
          height={size}
          decoding={priority ? 'sync' : 'async'}
          loading={priority ? 'eager' : 'lazy'}
          {...(priority ? { fetchPriority: 'high' as const } : {})}
        />
      ) : (
        // The bar is not tall enough for the strapline to be legible, so the
        // header carries the mark alone. The Link already names the store, so
        // the image inside it is not announced a second time.
        <Wordmark width={width} variant="wordmark" tone="dark" label="" priority={priority} />
      )}
    </Link>
  );
}
