import type { ReactNode } from 'react';
import { Skeleton, SkeletonBar, SkeletonBlock } from '../common/Skeleton';
import { HOME_BLOCK_HEIGHT_CSS, type HomeBlockPath } from './defaults';

/**
 * One skeleton per home block (amendment A7, DIRECTION 6.2 heights).
 *
 * Each root reserves exactly the height its block occupies at that viewport, so
 * the swap from skeleton to content shifts nothing. Rectangles are static plate
 * colour; only the text bars pulse, and only inside the one root currently in
 * the viewport, which the shared observer in `common/Skeleton` enforces.
 */

function rows(count: number): number[] {
  return Array.from({ length: count }, (unused, index) => index);
}

interface BlockSkeletonProps {
  path: HomeBlockPath;
  className?: string;
  children?: ReactNode;
}

function BlockSkeleton({ path, className, children }: BlockSkeletonProps) {
  return (
    <Skeleton
      height={HOME_BLOCK_HEIGHT_CSS[path]}
      className={['ox-skel-block', className].filter(Boolean).join(' ')}
      data-block={path}
    >
      {children}
    </Skeleton>
  );
}

export function HeroSkeleton() {
  return (
    <BlockSkeleton path="ox-hero" className="ox-skel-hero">
      <span className="ox-skel-hero__text">
        <SkeletonBar width="40%" />
        <SkeletonBar width="70%" height={40} />
        <SkeletonBar width="90%" />
      </span>
    </BlockSkeleton>
  );
}

export function TrustSkeleton() {
  return (
    <BlockSkeleton path="ox-trust-strip" className="ox-skel-trust">
      {rows(4).map((index) => (
        <SkeletonBar key={index} width="80%" />
      ))}
    </BlockSkeleton>
  );
}

export function GoalsSkeleton() {
  return (
    <BlockSkeleton path="ox-goals" className="ox-skel-grid ox-skel-grid--goals">
      {rows(6).map((index) => (
        <SkeletonBlock key={index} height="100%" />
      ))}
    </BlockSkeleton>
  );
}

export function CategoriesSkeleton() {
  return (
    <BlockSkeleton path="ox-categories" className="ox-skel-grid ox-skel-grid--tiles">
      {rows(8).map((index) => (
        <SkeletonBlock key={index} height="100%" />
      ))}
    </BlockSkeleton>
  );
}

/** The rail placeholder the slider itself shows while its first page loads. */
export function ProductsRailSkeleton() {
  return (
    <div className="ox-skel-rail" aria-hidden="true">
      {rows(4).map((index) => (
        <SkeletonBlock key={index} height="100%" />
      ))}
    </div>
  );
}

export function ProductsSkeleton() {
  return (
    <BlockSkeleton path="ox-products" className="ox-skel-products">
      <SkeletonBar width="35%" />
      <div className="ox-skel-rail">
        {rows(4).map((index) => (
          <SkeletonBlock key={index} height="100%" />
        ))}
      </div>
    </BlockSkeleton>
  );
}

export function BrandsSkeleton() {
  return (
    <BlockSkeleton path="ox-brands" className="ox-skel-strip">
      {rows(8).map((index) => (
        <SkeletonBlock key={index} height="100%" />
      ))}
    </BlockSkeleton>
  );
}

/**
 * The services band is dark, so its placeholder is too: a light grey box where
 * a near-black band is about to land is a flash, not a placeholder. The root
 * carries `.ox-band-dark`, which is what re-points the skeleton's own fills at
 * the graphite step.
 */
export function ServicesSkeleton() {
  return (
    <BlockSkeleton path="ox-services" className="ox-skel-services ox-band-dark">
      <SkeletonBar width="30%" />
      <div className="ox-skel-grid ox-skel-grid--channels">
        {rows(3).map((index) => (
          <SkeletonBlock key={index} height="100%" />
        ))}
      </div>
    </BlockSkeleton>
  );
}

export function GuidesSkeleton() {
  return (
    <BlockSkeleton path="ox-guides" className="ox-skel-grid ox-skel-grid--guides">
      {rows(3).map((index) => (
        <SkeletonBlock key={index} height="100%" />
      ))}
    </BlockSkeleton>
  );
}

/**
 * One card, not a photo panel beside one: the storefront photograph is gated
 * and the theme ships none, so the block that lands here is the flat card.
 */
export function BranchSkeleton() {
  return (
    <BlockSkeleton path="ox-branch" className="ox-skel-branch">
      <span className="ox-skel-branch__card">
        <SkeletonBar width="30%" />
        <SkeletonBar width="55%" height={28} />
        <SkeletonBar width="70%" />
      </span>
    </BlockSkeleton>
  );
}

export function FaqSkeleton() {
  return (
    <BlockSkeleton path="ox-faq" className="ox-skel-faq">
      {rows(5).map((index) => (
        <SkeletonBar key={index} width="90%" />
      ))}
    </BlockSkeleton>
  );
}

/**
 * The two optional blocks draw no placeholder.
 *
 * A skeleton is a promise that something is about to land there. Both of these
 * render null until the merchant turns them on, so the promise was false: the
 * pair put 588px of grey above the footer on a phone and then took it away on
 * scroll. Drawing nothing is the honest placeholder for a block that may well
 * be nothing, and it matches the 0 their rows now reserve.
 */
export function NewsletterSkeleton() {
  return null;
}

export function BannerSkeleton() {
  return null;
}

/**
 * The route's pending state: the first screen only. The remaining blocks are
 * lazy and bring their own placeholders when they scroll into view, and twelve
 * skeleton roots on one screen is exactly what A7 exists to prevent.
 */
export function HomeSkeleton() {
  return (
    <div className="ox-home-skeleton" data-testid="ox-home-skeleton">
      <HeroSkeleton />
      <TrustSkeleton />
      <GoalsSkeleton />
    </div>
  );
}

/** Every block's placeholder, keyed by registry path (registerHomeComponentConfig). */
export const BLOCK_SKELETONS: Record<HomeBlockPath, () => ReactNode> = {
  'ox-hero': HeroSkeleton,
  'ox-trust-strip': TrustSkeleton,
  'ox-goals': GoalsSkeleton,
  'ox-categories': CategoriesSkeleton,
  'ox-products': ProductsSkeleton,
  'ox-brands': BrandsSkeleton,
  'ox-services': ServicesSkeleton,
  'ox-guides': GuidesSkeleton,
  'ox-branch': BranchSkeleton,
  'ox-faq': FaqSkeleton,
  'ox-newsletter': NewsletterSkeleton,
  'ox-banner': BannerSkeleton,
};
