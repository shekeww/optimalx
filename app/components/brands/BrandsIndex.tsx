import { useTranslation } from '@salla.sa/twilight-theme-engine/i18n';
import type { BrandsPageProps } from '@salla.sa/twilight-theme-engine/routes/brands';
import { Button } from '../common/Button';
import { EmptyState } from '../common/EmptyState';
import { OxBreadcrumb } from '../common/OxBreadcrumb';
import { BrandTile, isBrand, type BrandWithCount } from './BrandTile';

/**
 * The brands index, `/brands` (DIRECTION 6.14; owner brief 2026-09-23 late,
 * item 2): our own composition around the engine's loader data, in the
 * theme's own chrome.
 *
 * The page: the listing masthead band (so `/brands` and a brand's own
 * products open identically), the X watermark over the head at §4.1's 0.06
 * ceiling, the LETTER GROUPS THE API ITSELF SERVES, the same tile the home
 * carousel draws in a 2/3/6-up grid, and a letter rail at 1024 and up.
 *
 * The groups are not regrouped here. Salla's `/brands` endpoint answers with
 * an object keyed by first letter (the engine's own `brandsLoader` sorts
 * `Object.keys(data)`), so the letters on the page are the platform's own
 * split; inventing a second grouping client-side would mean the rail and the
 * API could disagree. Group ids are positional (`brand-letter-0`) rather than
 * the letter itself, so a fragment link never has to carry a percent-encoded
 * Arabic character.
 *
 * The h1 is the page's own title, resolved: the engine hands `/brands` the
 * PLATFORM key `common.titles.brands`, which this store's own dictionary does
 * carry, and which rendered raw as the h1 and the `<title>` before this batch
 * (verified live on 2026-09-23). A label that still looks like a lookup key
 * is translated; anything else is the merchant's own words and is left alone.
 *
 * No claim of distribution, authenticity or exclusivity appears anywhere on
 * this page: the intro line states only that these are the brands the store
 * stocks, which is what the catalogue itself says.
 */

/** Whether a label is still an i18n lookup key rather than a word. The same
 * narrow test `OxBreadcrumb` uses: dotted lowercase ASCII and nothing else,
 * so no Arabic name and no English word can match. */
function isUnresolvedKey(name: string): boolean {
  return /^[a-z][a-z0-9_]*(\.[a-z0-9_]+)+$/.test(name.trim());
}

export interface BrandLetterGroup {
  /** DOM id the letter rail links to. */
  id: string;
  char: string;
  brands: BrandWithCount[];
}

/** The API's own letter groups, in letter order, with empty ones dropped. */
export function letterGroupsOf(brands: BrandsPageProps['brands']): BrandLetterGroup[] {
  return Object.keys(brands ?? {})
    .sort()
    .map((char, index) => ({
      id: `brand-letter-${index}`,
      char,
      brands: ((brands?.[char] ?? []) as unknown[]).filter(isBrand).filter((item) => item.url),
    }))
    .filter((group) => group.brands.length > 0);
}

export function BrandsIndex({ page, brands }: BrandsPageProps) {
  const { t } = useTranslation();
  const groups = letterGroupsOf(brands);
  const rawTitle = page.title ?? '';
  const title = rawTitle
    ? isUnresolvedKey(rawTitle)
      ? t(rawTitle)
      : rawTitle
    : t('ox.nav.brands');

  return (
    <div className="ox-brandhub">
      <div className="ox-listing__band ox-brandhub__band">
        <div className="ox-container ox-listing__band-inner">
          <OxBreadcrumb page={page} className="ox-crumbs" />
          <header className="ox-brandhub__head">
            <h1 className="ox-h1">{title}</h1>
            <p className="ox-body ox-brandhub__intro">{t('ox.brands.intro')}</p>
          </header>
        </div>
        {/* The mark as a picture, never a cut: drawn from the already-inlined
            sprite, never a `url()` request (X-IDENTITY §4.1 render path). The
            viewBox is the mark's own bounding box, so the figure fills the
            reserved 240x212.1 / 420x371.2 box at its true aspect. */}
        <span className="ox-x-watermark ox-brandhub__watermark" aria-hidden="true">
          <svg viewBox="0 1.393 24 21.214" focusable="false">
            <use href="#ox-mark" />
          </svg>
        </span>
      </div>

      <div className="ox-container ox-brandhub__body">
        {groups.length === 0 ? (
          <div className="ox-listing__empty">
            <EmptyState
              icon="shaker"
              title={t('ox.brands.empty')}
              primary={
                <Button variant="primary" size={48} to="/latest-products">
                  {t('ox.brands.empty_cta')}
                </Button>
              }
            />
          </div>
        ) : (
          <>
            <nav className="ox-brandhub__letters" aria-label={t('ox.brands.letters_label')}>
              <ul className="ox-brandhub__letters-list">
                {groups.map((group) => (
                  <li key={group.id}>
                    <a className="ox-brandhub__letter" href={`#${group.id}`}>
                      {group.char}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>

            <div className="ox-brandhub__groups">
              {groups.map((group) => (
                <section
                  key={group.id}
                  id={group.id}
                  className="ox-brandhub__group"
                  aria-labelledby={`${group.id}-title`}
                >
                  <h2 className="ox-brandhub__group-title" id={`${group.id}-title`}>
                    <span aria-hidden="true">{group.char}</span>
                    <span className="ox-sr-only">
                      {t('ox.brands.group_label', { char: group.char })}
                    </span>
                  </h2>
                  <ul className="ox-brandhub__grid">
                    {group.brands.map((item) => (
                      <li key={item.id ?? item.name}>
                        <BrandTile
                          brand={item}
                          sizes="(min-width: 1280px) 203px, (min-width: 768px) 230px, 171px"
                        />
                      </li>
                    ))}
                  </ul>
                </section>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default BrandsIndex;
