import { Fragment, type ReactNode } from 'react';
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

/** Six dark card placeholders: `OxGoals`' row, restored 2026-09-22. */
export function GoalsSkeleton() {
  return (
    <BlockSkeleton path="ox-goals" className="ox-skel-grid ox-skel-grid--goals">
      {rows(6).map((index) => (
        <SkeletonBlock key={index} height="100%" className="ox-skel-dark" />
      ))}
    </BlockSkeleton>
  );
}

/** Eight tile placeholders: `OxCategories`' grid, restored 2026-09-22. */
export function CategoriesSkeleton() {
  return (
    <BlockSkeleton path="ox-categories" className="ox-skel-grid ox-skel-grid--tiles">
      {rows(8).map((index) => (
        <SkeletonBlock key={index} height="100%" />
      ))}
    </BlockSkeleton>
  );
}

/**
 * Null, not a placeholder (S2e, 2026-09-22): `ox-category-rail` renders
 * nothing whenever its category has not resolved to a real Salla id yet
 * (`OxCategoryRail.tsx`), which is every one of its eight default instances
 * on the live store today (`fixtures/store/categories.json` is empty). Same
 * reasoning as `BrandsSkeleton`/`GuidesSkeleton` above.
 */
export function CategoryRailSkeleton() {
  return null;
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

/**
 * The product GRID placeholder, for the two grid blocks (OxProducts and
 * OxProductsSecondary). `ProductsSkeleton` above is the rail-era shape and is
 * still correct for the blocks that kept a rail.
 *
 * It borrows `.ox-grid-products` rather than declaring its own columns, on
 * purpose: the skeleton and the grid it stands in for have to break to two,
 * three and four columns at the same widths, and the only way to guarantee
 * that as the grid changes is to use the same rule. A skeleton one column out
 * is a skeleton that reserves the wrong height and hands back the layout shift
 * it exists to prevent.
 */
export function ProductsGridSkeleton({ count = 8 }: { count?: number } = {}) {
  return (
    <div
      className="ox-skel-pgrid ox-grid-products ox-grid-products--home"
      aria-hidden="true"
    >
      {rows(count).map((index) => (
        <SkeletonBlock key={index} height="var(--ox-skel-card, 380px)" />
      ))}
    </div>
  );
}

/**
 * The three new bands.
 *
 * Two of them render `null`: the campaign poster is gated on a headline and
 * the certification band on per-product evidence, and neither exists today,
 * so reserving a box for them would be reserving a box for nothing. The same
 * reasoning the newsletter and banner already follow.
 */
export function PosterSkeleton() {
  return null;
}

export function CertificationsSkeleton() {
  return null;
}

export function PostersSkeleton() {
  return (
    <BlockSkeleton path="ox-posters" className="ox-skel-posters">
      <div className="ox-skel-rail">
        {rows(4).map((index) => (
          <SkeletonBlock key={index} height="100%" />
        ))}
      </div>
    </BlockSkeleton>
  );
}

export function BrandsSkeleton() {
  // Null, not a placeholder: the store has zero brands, so `OxBrands` renders nothing today,
  // and its row reserves 0. A skeleton here would promise content that
  // never arrives and then collapse (tests/home/optionalBlocks.test.ts).
  return null;
}

/**
 * The advisory band is TWO ROWS of three now (owner review 2026-09-23
 * (late), item 3: the three channels rejoin the three plan doors), so the
 * placeholder reserves six dark blocks, not three, matching the six real
 * cards `OxServices` mounts underneath it.
 */
export function ServicesSkeleton() {
  return (
    <BlockSkeleton path="ox-services" className="ox-skel-services">
      <SkeletonBar width="30%" />
      {/* Two rows of three, each under its own row title (owner review
          2026-09-23, late night): the real section reserves a title and a
          note over each row now, so a single six-block grid would resolve
          into a taller thing than it drew. */}
      {rows(2).map((row) => (
        <Fragment key={row}>
          <SkeletonBar width="40%" />
          <div className="ox-skel-grid ox-skel-grid--channels">
            {rows(3).map((index) => (
              <SkeletonBlock key={index} height="100%" className="ox-skel-dark" />
            ))}
          </div>
        </Fragment>
      ))}
    </BlockSkeleton>
  );
}

export function GuidesSkeleton() {
  // Null, not a placeholder: there are no guide entries, so `OxGuides` renders nothing today,
  // and its row reserves 0. A skeleton here would promise content that
  // never arrives and then collapse (tests/home/optionalBlocks.test.ts).
  return null;
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
      <GoalsSkeleton />
    </div>
  );
}

/** Every block's placeholder, keyed by registry path (registerHomeComponentConfig). */
export const BLOCK_SKELETONS: Record<HomeBlockPath, () => ReactNode> = {
  'ox-hero': HeroSkeleton,
  'ox-goals': GoalsSkeleton,
  'ox-categories': CategoriesSkeleton,
  'ox-category-rail': CategoryRailSkeleton,
  'ox-products': ProductsSkeleton,
  'ox-brands': BrandsSkeleton,
  'ox-services': ServicesSkeleton,
  'ox-poster': PosterSkeleton,
  'ox-posters': PostersSkeleton,
  'ox-products-secondary': ProductsGridSkeleton,
  'ox-certifications': CertificationsSkeleton,
  'ox-guides': GuidesSkeleton,
  'ox-branch': BranchSkeleton,
  'ox-faq': FaqSkeleton,
  'ox-newsletter': NewsletterSkeleton,
  'ox-banner': BannerSkeleton,
};
