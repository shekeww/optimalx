import { Link } from '@salla.sa/twilight-theme-engine/common';
import { useStore } from '@salla.sa/twilight-theme-engine/hooks/useStore';
import { useTranslation } from '@salla.sa/twilight-theme-engine/i18n';

/**
 * The stopgap mark: `public/Logo.webp` is a 1254 square raster on white
 * (DIRECTION 8.6 allows it until the SVG set exists). It is drawn inside a
 * fixed box with `object-fit: contain`, so the reserved space never depends on
 * the file's own ratio and swapping in the SVG changes nothing but the `src`.
 */
export const LOGO_SRC = '/Logo.webp';

export interface LogoProps {
  /** Rendered box; the mark is contained inside it. */
  size?: number;
  /** Eager on the header (it is in the first viewport), lazy in the footer. */
  priority?: boolean;
  /** `true` on a dark band: the raster is on white, so it gets a paper plate. */
  onDark?: boolean;
  className?: string;
}

export function Logo({ size = 40, priority = false, onDark = false, className }: LogoProps) {
  const { t } = useTranslation();
  const store = useStore();
  const name = store?.name || t('ox.header.logo_alt');
  const src = store?.logo || LOGO_SRC;

  return (
    <Link to="/" className={['ox-logo', onDark ? 'ox-logo--on-dark' : null, className].filter(Boolean).join(' ')}>
      <img
        src={src}
        alt={name}
        width={size}
        height={size}
        decoding={priority ? 'sync' : 'async'}
        loading={priority ? 'eager' : 'lazy'}
        {...(priority ? { fetchPriority: 'high' as const } : {})}
      />
    </Link>
  );
}
