import type { OxIconName } from '../components/common/Icon';

/**
 * The About page's structure map (DIRECTION 6.15, FINAL-content 6.1).
 *
 * Keys and gates only; every string is a `t('ox.pages.about.*')` value.
 *
 * ## The statistic strip, and why these three cells
 *
 * `references/about_desktop.png` carries a three-cell strip reading
 * "100+ Personalized Plans", "5+ Expert Specialists" and "98% Client
 * Satisfaction". All three are invented, two of them also claim professional
 * titles, and the claims source bans every one of them outright. The strip's
 * FORM is part of the design system, so it survives; its CONTENT is replaced
 * with three facts the store can prove today, each of which is already stated
 * verbatim in copy the claims review passed:
 *
 *  - one branch in Al Khalidiyah, Madinah   (`ox.pages.about.lead`, `why_4_body`)
 *  - shipping to every city in Saudi Arabia (`ox.pages.about.lead`, `why_4_body`)
 *  - a team of two partners                 (`ox.pages.about.story_2`, `why_4_body`)
 *
 * Nothing here is a count of customers, orders, reviews, years or plans, and
 * no cell carries a percentage. `ABOUT_FACTS_ENABLED` is the single switch: a
 * reviewer who decides the strip says too much sets it to false and the page
 * goes straight from the band to the four cards, still finished.
 */
export interface AboutFact {
  id: string;
  /** Locale key of the figure. Western numerals in both languages. */
  valueKey?: string;
  /** Rendered instead of a figure when the fact is a mark, not a number. */
  glyph?: OxIconName;
  labelKey: string;
  subKey?: string;
}

export const ABOUT_FACTS_ENABLED = true;

export const ABOUT_FACTS: AboutFact[] = [
  {
    id: 'branch',
    valueKey: 'ox.pages.about.stat_branch_value',
    labelKey: 'ox.pages.about.stat_branch_label',
    subKey: 'ox.branch.locality',
  },
  {
    id: 'shipping',
    glyph: 'shipping',
    labelKey: 'ox.pages.about.stat_shipping_label',
    subKey: 'ox.pages.about.stat_shipping_sub',
  },
  {
    id: 'team',
    valueKey: 'ox.pages.about.stat_team_value',
    labelKey: 'ox.pages.about.stat_team_label',
    subKey: 'ox.pages.about.stat_team_sub',
  },
];

/** The four reasons, 2 by 2 (DIRECTION 6.15 block 3). */
export const ABOUT_WHY = [1, 2, 3, 4].map((n) => ({
  id: `about-why-${n}`,
  titleKey: `ox.pages.about.why_${n}_title`,
  bodyKey: `ox.pages.about.why_${n}_body`,
}));

/**
 * The founders' story, in order (voice-ksa.md 7.2/7.3, owner-authored
 * persona source, 7.4 claims-audited). Seven paragraphs under the "قصة
 * اوبتيمال اكس" heading, ending on the "ما الذي تحتاجه فعلا؟" question.
 */
export const ABOUT_STORY = [1, 2, 3, 4, 5, 6, 7].map((n) => `ox.pages.about.story_${n}`);

/**
 * "كيف نعمل؟": three paragraphs describing the work, then five short
 * declarative lines (voice-ksa.md 7.2), the last of which is the honesty
 * statement 7.1 calls out ("لن نخترع تقييمات أو أرقاما لا نملكها").
 */
export const ABOUT_HOW = [1, 2, 3].map((n) => `ox.pages.about.how_${n}`);
export const ABOUT_HOW_LINES = [1, 2, 3, 4, 5].map((n) => `ox.pages.about.how_line_${n}`);

/** "ما نملكه اليوم واضح:" the five things the store owns today, as a list. */
export const ABOUT_OWN = [1, 2, 3, 4, 5].map((n) => `ox.pages.about.own_${n}`);

/**
 * The registration panel's rows. It renders only when ALL THREE settings are
 * filled: a registration block with one number missing is worse than no block,
 * because a shopper reads the gap as something being hidden.
 */
export const ABOUT_REGISTRATION = [
  { id: 'cr', setting: 'cr_number', labelKey: 'ox.pages.about.cr_label' },
  { id: 'vat', setting: 'vat_number', labelKey: 'ox.pages.about.vat_label' },
  { id: 'maroof', setting: 'maroof_url', labelKey: 'ox.pages.about.maroof_label' },
] as const;
