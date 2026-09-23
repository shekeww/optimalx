import { useQuery } from '@tanstack/react-query';
import { brand } from '@salla.sa/twilight-theme-engine/api/brands';
import type { Brand } from '@salla.sa/twilight-theme-engine/routes/brands';
import { Image, Link } from '@salla.sa/twilight-theme-engine/common';
import { useTranslation } from '@salla.sa/twilight-theme-engine/i18n';
import { SectionHeader } from '../common/SectionHeader';
import { fieldList, fieldText, type OxBlockProps } from './defaults';

/**
 * The brand strip (DIRECTION 6.2 row 6): a section header, logos on plates,
 * a scroller on mobile and eight per row on desktop.
 *
 * Shown from ONE brand up (owner call, 2026-09-22; was four): the store
 * carries real supplier brands today and a single logo still reads as a real
 * strip, not a claim about "brands" plural the way three or fewer used to.
 * The strip is a `nav`-less list of links inside a labelled region so a
 * screen reader still knows what it is. The reserved height stays 0 while
 * there are none (`HOME_BLOCK_HEIGHTS['ox-brands']`, `optionalBlocks.test.ts`).
 *
 * The manifest's `image` field (S2c, 2026-09-22) is the owner's generated
 * background, exposed as `--ox-band-image` and painted at low opacity behind
 * the header and the strip: the logo plates stay opaque, so legibility never
 * depends on what the merchant drops in, and the section looks finished with
 * no image at all (the custom property's own fallback is `none`).
 *
 * Owner review 2026-09-23 (late), item 4: every brand the API returns is
 * rendered (no longer just the raw API order), sorted by product count
 * DESC and capped at `MAX_BRANDS` so the strip stays browsable once the
 * catalogue carries the fifteen-plus real brands it derives from
 * (`fixtures/store/overlay/brands.json`, `docs/build/progress/S4a.md`). A
 * brand with no logo renders a name mark instead of an empty plate — the
 * first character in its own span (`.ox-brands__mark-first`, accent colour,
 * Cairo 700 — the strip's own font and weight already, see `_b2-home.scss`)
 * so a merchant who has not uploaded artwork yet still gets a tile that
 * looks finished rather than a blank rectangle.
 */

export const MIN_BRANDS = 1;
/** The strip never grows past this many tiles (owner review 2026-09-23 (late), item 4). */
export const MAX_BRANDS = 24;

interface BrandWithCount extends Brand {
  /** Not part of the engine's typed `Brand`; the fixture and (once created)
   * the real API carry it, so the strip can sort the heaviest brand first. */
  products_count?: number;
}

function isBrand(value: unknown): value is BrandWithCount {
  return Boolean(value) && typeof value === 'object' && typeof (value as Brand).name === 'string';
}

/** The first grapheme and the rest, by codepoint (`Array.from`) rather than
 * a UTF-16 slice, so a name mark never splits a surrogate pair. */
function splitMark(name: string): [string, string] {
  const chars = Array.from(name.trim());
  return [chars[0] ?? '', chars.slice(1).join('')];
}

export function OxBrands({ data }: OxBlockProps) {
  const { t } = useTranslation();
  const selected = fieldList(data, 'brands').filter(isBrand);
  const { data: group } = useQuery({ ...brand.queries.list(), enabled: selected.length === 0 });

  const source: BrandWithCount[] =
    selected.length > 0 ? selected : (Object.values(group ?? {}).flat() as unknown[]).filter(isBrand);
  const brands = [...source]
    .sort((a, b) => (b.products_count ?? 0) - (a.products_count ?? 0))
    .slice(0, MAX_BRANDS);
  if (brands.length < MIN_BRANDS) return null;

  const image = fieldText(data, 'image');

  return (
    <section
      className="ox-brands"
      aria-labelledby="ox-brands-title"
      data-testid="ox-brands"
      style={image ? { ['--ox-band-image' as string]: `url("${image}")` } : undefined}
    >
      <div className="ox-container">
        <div className="ox-brands__head">
          {/* The section's one true accent element. Not skewed (X-IDENTITY
              §3.2's 158px law: an angle below that block-size may live only
              inside a sprite symbol) — see _b2-home.scss for the note and
              the pending angled primitive this section still owes. */}
          <span className="ox-brands__accent" aria-hidden="true" />
          <SectionHeader title={t('ox.home.brands_title')} titleId="ox-brands-title" as="h2" />
        </div>
        <ul className="ox-brands__strip">
          {brands.map((item) => {
            const [first, rest] = splitMark(item.name);
            return (
              <li className="ox-brands__item" key={item.id ?? item.name}>
                <Link to={item.url} className="ox-brands__link">
                  {item.logo ? (
                    <Image
                      src={item.logo}
                      alt={item.name}
                      width={120}
                      height={48}
                      srcSetWidths={[120, 240]}
                      sizes="120px"
                      objectFit="contain"
                      className="ox-brands__logo"
                      noWrapper
                    />
                  ) : (
                    <span className="ox-brands__mark ox-small">
                      <span className="ox-brands__mark-first">{first}</span>
                      {rest}
                    </span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
