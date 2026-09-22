import {
  registerHomeComponents,
  registerHomeComponentConfig,
  DefaultHomeComponents,
} from '@salla.sa/twilight-theme-engine/routes/home';
import type { AnyHomeComponent } from '@salla.sa/twilight-theme-engine/routes/home';
import { createElement } from 'react';
import { HOME_BLOCK_HEIGHT_CSS, HOME_BLOCK_PATHS, type HomeBlockPath } from './defaults';
import { BLOCK_SKELETONS } from './HomeSkeleton';
import { OxHero } from './OxHero';
import { OxNeeds } from './OxNeeds';
import { OxProducts } from './OxProducts';
import { OxPoster } from './OxPoster';
import { OxPosters } from './OxPosters';
import { OxProductsSecondary } from './OxProductsSecondary';
import { OxCertifications } from './OxCertifications';
import { OxBrands } from './OxBrands';
import { OxServices } from './OxServices';
import { OxGuides } from './OxGuides';
import { OxBranchBlock } from './OxBranchBlock';
import { OxFaq } from './OxFaq';
import { OxNewsletterBlock } from './OxNewsletterBlock';
import { OxBanner } from './OxBanner';

/**
 * The sixteen home blocks (DIRECTION 6.2, extended by homepage-scale-spec)
 * and their render shells.
 *
 * `registerHomeComponents` writes `home:<path>` registry keys; the loader
 * strips the `home.` prefix off the manifest path, so `home.ox-hero` in
 * twilight.json resolves to the `ox-hero` key here (theme-engine
 * chunk-L42W6YS3.js:20, chunk-WITIL2MK.js:580-595). The engine's own
 * `DefaultHomeComponents` stay registered underneath: a merchant who still has
 * a stock Salla block on the page keeps it rendering.
 *
 * `registerHomeComponentConfig` is what keeps the page from jumping. Every
 * block declares the exact height its DIRECTION 6.2 row reserves, expressed as
 * a clamp that is linear between 390 and 1440, plus its own skeleton as the
 * placeholder (amendment A7) and the `s-block--<path>` wrapper class the
 * stylesheet and the G2 measurements key off. Theme config wins over the
 * engine's per-path table (`resolveComponentConfig`, chunk-WITIL2MK.js:650-652).
 *
 * Called once from `app/router.tsx` before `getRouter()`.
 */

const BLOCKS: Record<HomeBlockPath, AnyHomeComponent> = {
  'ox-hero': OxHero,
  // Both legacy block keys point at the SAME merged component (S2b, 2026-09-22):
  // OxNeeds claims whichever slot the current composition renders first
  // (`useClaimPrimaryNeedsSlot`) and the other renders null, so a store whose
  // dashboard composition still carries both (twilight.json marks both
  // `is_default: true`) draws the section once. See OxNeeds.tsx's docblock.
  'ox-goals': OxNeeds,
  'ox-categories': OxNeeds,
  'ox-products': OxProducts,
  'ox-poster': OxPoster,
  'ox-posters': OxPosters,
  'ox-products-secondary': OxProductsSecondary,
  'ox-certifications': OxCertifications,
  'ox-brands': OxBrands,
  'ox-services': OxServices,
  'ox-guides': OxGuides,
  'ox-branch': OxBranchBlock,
  'ox-faq': OxFaq,
  'ox-newsletter': OxNewsletterBlock,
  'ox-banner': OxBanner,
};

export function registerOxHomeComponents() {
  registerHomeComponents({ ...DefaultHomeComponents, ...BLOCKS });

  registerHomeComponentConfig(
    Object.fromEntries(
      HOME_BLOCK_PATHS.map((path) => [
        path,
        {
          height: HOME_BLOCK_HEIGHT_CSS[path],
          className: `s-block s-block--${path}`,
          placeholder: createElement(BLOCK_SKELETONS[path]),
        },
      ])
    )
  );
}
