import { useTranslation } from '@salla.sa/twilight-theme-engine/i18n';

/**
 * The OptimalX mark.
 *
 * The owner supplied the real logo, so this draws that file rather than
 * setting the name in the theme's own face. The assets in
 * `public/assets/brand/` are cut tight from it, carry a transparent
 * background, and hold exactly two colours: the ink and the accent.
 *
 * Two axes:
 *
 * - `variant` picks the lockup. `full` carries the NUTRITION & WELLNESS rule
 *   and needs about 40px of height before that line is legible, so it belongs
 *   in the footer and the product page's brand band. `wordmark` is the mark
 *   alone and is what the 88px header has room for.
 * - `tone` is the ground the mark sits ON, not the colour of the mark. On a
 *   dark band the ink has to be cream, so `tone="dark"` loads the reversed
 *   file. Getting this backwards fails contrast in both directions, which is
 *   why it is a prop and not a CSS filter.
 *
 * `width` and `height` are both set from the asset's intrinsic ratio so the
 * header never shifts while the image decodes.
 *
 * It deliberately reads no context. The mark is a fixed brand asset, not store
 * data, and depending on a provider here would make every surface that draws
 * it - header, footer, the product page's brand band - unrenderable outside
 * one. Swapping the mark means replacing the file.
 */
export type WordmarkVariant = 'full' | 'wordmark';
export type WordmarkTone = 'light' | 'dark';

export interface WordmarkProps {
  /** Drawn width in px; the height follows from the asset ratio. */
  width?: number;
  /** Which lockup. `full` includes the strapline. */
  variant?: WordmarkVariant;
  /** The ground the mark sits on. `dark` loads the cream-ink file. */
  tone?: WordmarkTone;
  /** Accessible name. Omit where the store name is already in text nearby. */
  label?: string;
  /** Eager in the header, which is in the first viewport; lazy elsewhere. */
  priority?: boolean;
  className?: string;
}

/** Intrinsic sizes of the generated assets, used to reserve the box. */
const ASSETS: Record<WordmarkVariant, { w: number; h: number; light: string; dark: string }> = {
  full: {
    w: 1179,
    h: 363,
    light: '/assets/brand/optimalx-full.png',
    dark: '/assets/brand/optimalx-full-reverse.png',
  },
  wordmark: {
    w: 1179,
    h: 298,
    light: '/assets/brand/optimalx-wordmark.png',
    dark: '/assets/brand/optimalx-wordmark-reverse.png',
  },
};

export function Wordmark({
  width = 112,
  variant = 'wordmark',
  tone = 'dark',
  label,
  priority = false,
  className,
}: WordmarkProps) {
  const { t } = useTranslation();

  const asset = ASSETS[variant];
  const src = tone === 'dark' ? asset.dark : asset.light;
  const name = label ?? t('ox.header.logo_alt');
  const height = Math.round((width * asset.h) / asset.w);

  return (
    <span
      className={['ox-wordmark', `ox-wordmark--${variant}`, className].filter(Boolean).join(' ')}
      data-testid="ox-wordmark"
    >
      <img
        src={src}
        alt={name}
        width={width}
        height={height}
        decoding={priority ? 'sync' : 'async'}
        loading={priority ? 'eager' : 'lazy'}
        {...(priority ? { fetchPriority: 'high' as const } : {})}
      />
    </span>
  );
}
