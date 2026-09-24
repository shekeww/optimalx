import { Link } from '@salla.sa/twilight-theme-engine/common';
import { useTheme } from '@salla.sa/twilight-theme-engine/hooks/useTheme';
import { useTranslation } from '@salla.sa/twilight-theme-engine/i18n';
import { Icon } from '../common/Icon';
import { BRANCH, BRANCH_LISTING } from '../../content/branch';
import { STORE_PHOTOS, storePhotoSrcSet, type StorePhotoSlug } from '../../content/store-photos';
import { channelById } from '../../content/services';
import { inbodyIncluded, type Settings } from '../product/lib/claims';
import { toInternalPath } from '../layout/navLinks';

export interface BranchGalleryProps {
  className?: string;
  /**
   * S9h (owner screenshots 2026-09-24): `OxBranch`'s own cover now shows the
   * storefront photograph too (item 1), so the identical photograph would
   * appear twice on `/branch` if this gallery kept its storefront tile.
   * `BranchPage` passes `false` to drop it there, leaving three tiles from
   * 640 (`.ox-branch-gallery__list--3`, this file's own grid modifier); any
   * future caller that does not sit under a storefront cover keeps the
   * default four.
   */
  showStorefront?: boolean;
}

interface GalleryCover {
  slug: StorePhotoSlug;
  coverModifier: string;
  statementKey: string;
  lineKey: string;
  /** Internal route; absent for the one external tile (storefront). */
  to?: string;
  /** External URL, opened in a new tab (BRANCH_LISTING.directionsUrl). */
  href?: string;
}

/**
 * The four gallery covers (S9c direction §5): four statements, in the order
 * the direction gives them, two noun phrases and two imperatives. The
 * waiting-area cover is resolved to one of two variants at render time
 * (`inbodyIncluded`); every other cover has one fixed pair of keys.
 */
function galleryCovers(inbodyOn: boolean, showStorefront: boolean): GalleryCover[] {
  const waiting = inbodyOn ? BRANCH.covers.waitingOn : BRANCH.covers.waitingOff;
  const covers: GalleryCover[] = [
    {
      slug: 'advisory-room',
      coverModifier: 'ox-cover--advisory-room',
      statementKey: BRANCH.covers.advisory.statementKey,
      lineKey: BRANCH.covers.advisory.lineKey,
      to: channelById('visit')?.to ?? '/services',
    },
    {
      slug: 'waiting-area',
      coverModifier: 'ox-cover--waiting-area',
      statementKey: waiting.statementKey,
      lineKey: waiting.lineKey,
      to: '/services',
    },
    {
      slug: 'storefront',
      coverModifier: 'ox-cover--storefront',
      statementKey: BRANCH.covers.storefront.statementKey,
      lineKey: BRANCH.covers.storefront.lineKey,
      href: BRANCH_LISTING.directionsUrl,
    },
    {
      slug: 'shelves',
      coverModifier: 'ox-cover--shelves',
      statementKey: BRANCH.covers.shelves.statementKey,
      lineKey: BRANCH.covers.shelves.lineKey,
      to: '/categories',
    },
  ];
  return showStorefront ? covers : covers.filter((cover) => cover.slug !== 'storefront');
}

/**
 * The other branch photographs on `/branch` (VISIT-2026-09-24 §4.4 item 2;
 * rebuilt as covers by S9c, creative director direction 2026-09-24): a
 * two-up grid from 640px (three-up when `showStorefront` is false, S9h), a
 * scroll-snap rail below it (the shared `.ox-rail` primitive is built for
 * the carousel's chevron cue and progress strap, machinery a handful of
 * static tiles do not need, so this draws the plain fallback the direction
 * names explicitly).
 *
 * Each tile is now the whole `.ox-cover` card (`_covers.scss`): the
 * photograph, a cinematic two-gradient scrim and an accent glow behind an
 * overlay statement, a supporting line and the angled arrow chip, reading as
 * one clickable surface rather than a captioned photograph. The old visible
 * `<figcaption>` under each tile is retired, the overlay statement is the
 * accessible content now, real DOM text rather than a caption, but every
 * `ox.content.branch.photo_*` key stays registered in the locale
 * (`content/branch.ts`), unrendered. `srcset` is built only from the
 * manifest's own `widths` (`store-photos.ts`), never a slot width table of
 * this component's own, so the 415px-wide `storefront` file is served sharp
 * rather than blurred up; `shelves` anchors its crop to the top
 * (`.ox-cover--shelves`) so the labelled shelf row survives the 16:10 cut.
 *
 * `showStorefront` (S9h, owner screenshots 2026-09-24): `OxBranch`'s own
 * cover shows the storefront photograph now too (item 1), so `BranchPage`
 * passes `false` here to avoid printing the identical photograph twice on
 * one page, three tiles, `.ox-branch-gallery__list--3` (three-up from
 * 640px). Defaults to `true` (all four) for any caller that does not sit
 * under a storefront cover.
 */
export function BranchGallery({ className, showStorefront = true }: BranchGalleryProps) {
  const { t } = useTranslation();
  const { settings } = useTheme();
  const covers = galleryCovers(inbodyIncluded(settings as Settings), showStorefront);
  const listClasses = [
    'ox-branch-gallery__list',
    covers.length === 3 ? 'ox-branch-gallery__list--3' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <section
      className={['ox-branch-gallery', className].filter(Boolean).join(' ')}
      aria-label={t(BRANCH.gallery.labelKey)}
      data-testid="ox-branch-gallery"
    >
      <ul className={listClasses}>
        {covers.map((cover) => {
          const photo = STORE_PHOTOS[cover.slug];
          const statement = t(cover.statementKey);
          const line = t(cover.lineKey);
          const coverClasses = ['ox-cover', 'ox-cover--tile', 'ox-band-dark', cover.coverModifier].join(
            ' '
          );
          const body = (
            <>
              <img
                className="ox-cover__photo"
                src={photo.photo}
                srcSet={storePhotoSrcSet(photo)}
                sizes="(min-width: 640px) 45vw, 78vw"
                width={photo.width}
                height={photo.height}
                alt=""
                loading="lazy"
                decoding="async"
              />
              <span className="ox-cover__scrim" aria-hidden="true" />
              <span className="ox-cover__glow" aria-hidden="true" />
              <span className="ox-cover__body">
                <span className="ox-cover__statement">{statement}</span>

                <span className="ox-cover__row">
                  <span className="ox-cover__line">{line}</span>

                  <span className="ox-cover__arrow ox-iconbtn--angled" aria-hidden="true">
                    <Icon name="chevron-end" size={16} />

                  </span>

                </span>

              </span>

            </>

          );

          return (
            <li key={cover.slug} className="ox-branch-gallery__item">
              {cover.href ? (
                <a
                  className={coverClasses}
                  href={cover.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  data-testid="ox-branch-gallery-cover"
                  data-cover={cover.slug}
                >
                  {body}
                </a>

              ) : (
                <Link
                  className={coverClasses}
                  to={toInternalPath(cover.to ?? '/services')}
                  data-testid="ox-branch-gallery-cover"
                  data-cover={cover.slug}
                >
                  {body}
                </Link>

              )}
            </li>

          );
        })}
      </ul>

    </section>

  );
}

export default BranchGallery;
