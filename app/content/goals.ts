import type { OxIconName } from '../components/common/Icon';

/**
 * The six goal collections (FINAL-catalogue A.3, FINAL-content 2).
 *
 * Structure and locale keys only: no copy lives in this file. Every string a
 * goal landing page renders is a `t('ox.content.goals.*')` key defined in
 * `locales/partials/p1a.{ar,en}.json`.
 *
 * Goals key by SLUG, never by category id (PLAN-final C15): the categories do
 * not exist on the store yet, and `Category.url` carries whatever SEO slug the
 * owner sets. A sub-need links to a type category by slug; a page that cannot
 * resolve the slug at runtime falls back to `/search?q=<name>`.
 */

export interface GoalSubNeed {
  /** Heading of the need row. */
  titleKey: string;
  /** One line under it. */
  lineKey: string;
  /** Type category slug the row routes to (CATEGORIES in ./categories). */
  categorySlug: string;
  /**
   * Filter to apply on the destination listing, as a chip label key from the
   * destination category's own chip list. Optional.
   */
  filterChipKey?: string;
}

export interface GoalFaqItem {
  qKey: string;
  aKey: string;
}

/** An anchored group: only `goal-ideal-weight` has them (FINAL-content 2.6). */
export interface GoalGroup {
  /** Fragment target, e.g. `gain` renders as `#gain`. */
  anchor: string;
  titleKey: string;
  introKey: string;
  subNeeds: GoalSubNeed[];
  skus: string[];
}

export interface GoalContent {
  /** Category slug on the store, from FINAL-catalogue A.3. */
  slug: string;
  /** Sprite symbol (DIRECTION 8.7). */
  icon: OxIconName;
  h1Key: string;
  /** Meta title; the head helper appends nothing to it. */
  titleKey: string;
  introKey: string;
  subNeeds: GoalSubNeed[];
  faq: GoalFaqItem[];
  needHelpKey: string;
  needHelpCtaKey: string;
  /** Catalogue SKUs in scope; resolved to ids through ./salla-ids. */
  skus: string[];
  /**
   * The 150 to 250 word block above the grid. Only `goal-performance` has one
   * (FINAL-content 2.3, keywords G03 editorial note).
   */
  explainer?: { titleKey: string; bodyKeys: string[] };
  /** Two anchored directions; only `goal-ideal-weight` has them. */
  groups?: GoalGroup[];
}

const KEY = 'ox.content.goals';

export const GOALS: GoalContent[] = [
  {
    slug: 'goal-energy',
    icon: 'goal-energy',
    h1Key: `${KEY}.energy.h1`,
    titleKey: `${KEY}.energy.title`,
    introKey: `${KEY}.energy.intro`,
    subNeeds: [
      {
        titleKey: `${KEY}.energy.need_1_title`,
        lineKey: `${KEY}.energy.need_1_line`,
        categorySlug: 'pre-workout',
      },
      {
        titleKey: `${KEY}.energy.need_2_title`,
        lineKey: `${KEY}.energy.need_2_line`,
        categorySlug: 'pre-workout',
        filterChipKey: 'ox.content.categories.pre_workout.chip_2',
      },
      {
        titleKey: `${KEY}.energy.need_3_title`,
        lineKey: `${KEY}.energy.need_3_line`,
        categorySlug: 'daily-health',
      },
    ],
    faq: [
      { qKey: `${KEY}.energy.faq_1_q`, aKey: `${KEY}.energy.faq_1_a` },
      { qKey: `${KEY}.energy.faq_2_q`, aKey: `${KEY}.energy.faq_2_a` },
      { qKey: `${KEY}.energy.faq_3_q`, aKey: `${KEY}.energy.faq_3_a` },
    ],
    needHelpKey: `${KEY}.energy.need_help`,
    needHelpCtaKey: `${KEY}.energy.need_help_cta`,
    skus: ['OX-017', 'OX-018', 'OX-021', 'OX-028', 'OX-034', 'OX-040'],
  },
  {
    slug: 'goal-general-health',
    icon: 'goal-general-health',
    h1Key: `${KEY}.general_health.h1`,
    titleKey: `${KEY}.general_health.title`,
    introKey: `${KEY}.general_health.intro`,
    subNeeds: [
      {
        titleKey: `${KEY}.general_health.need_1_title`,
        lineKey: `${KEY}.general_health.need_1_line`,
        categorySlug: 'vitamins-minerals',
      },
      {
        titleKey: `${KEY}.general_health.need_2_title`,
        lineKey: `${KEY}.general_health.need_2_line`,
        categorySlug: 'omega-3',
      },
      {
        titleKey: `${KEY}.general_health.need_3_title`,
        lineKey: `${KEY}.general_health.need_3_line`,
        categorySlug: 'daily-health',
      },
    ],
    faq: [
      { qKey: `${KEY}.general_health.faq_1_q`, aKey: `${KEY}.general_health.faq_1_a` },
      { qKey: `${KEY}.general_health.faq_2_q`, aKey: `${KEY}.general_health.faq_2_a` },
      { qKey: `${KEY}.general_health.faq_3_q`, aKey: `${KEY}.general_health.faq_3_a` },
    ],
    needHelpKey: `${KEY}.general_health.need_help`,
    needHelpCtaKey: `${KEY}.general_health.need_help_cta`,
    skus: [
      'OX-006',
      'OX-007',
      'OX-011',
      'OX-012',
      'OX-022',
      'OX-023',
      'OX-024',
      'OX-025',
      'OX-027',
      'OX-028',
      'OX-029',
      'OX-033',
      'OX-035',
      'OX-039',
      'OX-041',
    ],
  },
  {
    slug: 'goal-performance',
    icon: 'goal-performance',
    h1Key: `${KEY}.performance.h1`,
    titleKey: `${KEY}.performance.title`,
    introKey: `${KEY}.performance.intro`,
    explainer: {
      titleKey: `${KEY}.performance.explainer_title`,
      bodyKeys: [`${KEY}.performance.explainer_1`, `${KEY}.performance.explainer_2`],
    },
    subNeeds: [
      {
        titleKey: `${KEY}.performance.need_1_title`,
        lineKey: `${KEY}.performance.need_1_line`,
        categorySlug: 'whey-protein',
      },
      {
        titleKey: `${KEY}.performance.need_2_title`,
        lineKey: `${KEY}.performance.need_2_line`,
        categorySlug: 'creatine',
      },
      {
        titleKey: `${KEY}.performance.need_3_title`,
        lineKey: `${KEY}.performance.need_3_line`,
        categorySlug: 'pre-workout',
      },
    ],
    faq: [
      { qKey: `${KEY}.performance.faq_1_q`, aKey: `${KEY}.performance.faq_1_a` },
      { qKey: `${KEY}.performance.faq_2_q`, aKey: `${KEY}.performance.faq_2_a` },
      { qKey: `${KEY}.performance.faq_3_q`, aKey: `${KEY}.performance.faq_3_a` },
    ],
    needHelpKey: `${KEY}.performance.need_help`,
    needHelpCtaKey: `${KEY}.performance.need_help_cta`,
    skus: [
      'OX-001',
      'OX-002',
      'OX-003',
      'OX-005',
      'OX-008',
      'OX-015',
      'OX-016',
      'OX-017',
      'OX-018',
      'OX-019',
      'OX-021',
      'OX-036',
      'OX-041',
    ],
  },
  {
    slug: 'goal-recovery',
    icon: 'goal-recovery',
    h1Key: `${KEY}.recovery.h1`,
    titleKey: `${KEY}.recovery.title`,
    introKey: `${KEY}.recovery.intro`,
    subNeeds: [
      {
        titleKey: `${KEY}.recovery.need_1_title`,
        lineKey: `${KEY}.recovery.need_1_line`,
        categorySlug: 'whey-protein',
      },
      {
        titleKey: `${KEY}.recovery.need_2_title`,
        lineKey: `${KEY}.recovery.need_2_line`,
        categorySlug: 'casein',
      },
      {
        titleKey: `${KEY}.recovery.need_3_title`,
        lineKey: `${KEY}.recovery.need_3_line`,
        categorySlug: 'vitamins-minerals',
      },
    ],
    faq: [
      { qKey: `${KEY}.recovery.faq_1_q`, aKey: `${KEY}.recovery.faq_1_a` },
      { qKey: `${KEY}.recovery.faq_2_q`, aKey: `${KEY}.recovery.faq_2_a` },
      { qKey: `${KEY}.recovery.faq_3_q`, aKey: `${KEY}.recovery.faq_3_a` },
    ],
    needHelpKey: `${KEY}.recovery.need_help`,
    needHelpCtaKey: `${KEY}.recovery.need_help_cta`,
    skus: [
      'OX-001',
      'OX-002',
      'OX-004',
      'OX-008',
      'OX-009',
      'OX-010',
      'OX-011',
      'OX-014',
      'OX-019',
      'OX-020',
      'OX-024',
      'OX-026',
      'OX-034',
      'OX-037',
    ],
  },
  {
    slug: 'goal-hair-skin',
    icon: 'goal-hair-skin',
    h1Key: `${KEY}.hair_skin.h1`,
    titleKey: `${KEY}.hair_skin.title`,
    introKey: `${KEY}.hair_skin.intro`,
    subNeeds: [
      {
        titleKey: `${KEY}.hair_skin.need_1_title`,
        lineKey: `${KEY}.hair_skin.need_1_line`,
        categorySlug: 'collagen-beauty',
      },
      {
        titleKey: `${KEY}.hair_skin.need_2_title`,
        lineKey: `${KEY}.hair_skin.need_2_line`,
        categorySlug: 'vitamins-minerals',
      },
      {
        titleKey: `${KEY}.hair_skin.need_3_title`,
        lineKey: `${KEY}.hair_skin.need_3_line`,
        categorySlug: 'omega-3',
      },
    ],
    faq: [
      { qKey: `${KEY}.hair_skin.faq_1_q`, aKey: `${KEY}.hair_skin.faq_1_a` },
      { qKey: `${KEY}.hair_skin.faq_2_q`, aKey: `${KEY}.hair_skin.faq_2_a` },
      { qKey: `${KEY}.hair_skin.faq_3_q`, aKey: `${KEY}.hair_skin.faq_3_a` },
    ],
    needHelpKey: `${KEY}.hair_skin.need_help`,
    needHelpCtaKey: `${KEY}.hair_skin.need_help_cta`,
    skus: ['OX-022', 'OX-029', 'OX-030', 'OX-031', 'OX-032'],
  },
  {
    slug: 'goal-ideal-weight',
    icon: 'goal-ideal-weight',
    h1Key: `${KEY}.ideal_weight.h1`,
    titleKey: `${KEY}.ideal_weight.title`,
    introKey: `${KEY}.ideal_weight.intro`,
    // One URL, two anchored directions. The goal name never stands alone as an
    // H1 (keywords G06: it is also a retail chain's trade name), which is why
    // the h1 key pairs it with the outcome words.
    groups: [
      {
        anchor: 'gain',
        titleKey: `${KEY}.ideal_weight.group_gain_title`,
        introKey: `${KEY}.ideal_weight.group_gain_intro`,
        subNeeds: [
          {
            titleKey: `${KEY}.ideal_weight.group_gain_need_1_title`,
            lineKey: `${KEY}.ideal_weight.group_gain_need_1_line`,
            categorySlug: 'mass-gainer',
          },
          {
            titleKey: `${KEY}.ideal_weight.group_gain_need_2_title`,
            lineKey: `${KEY}.ideal_weight.group_gain_need_2_line`,
            categorySlug: 'whey-protein',
          },
          {
            titleKey: `${KEY}.ideal_weight.group_gain_need_3_title`,
            lineKey: `${KEY}.ideal_weight.group_gain_need_3_line`,
            categorySlug: 'creatine',
          },
        ],
        skus: [
          'OX-001',
          'OX-002',
          'OX-013',
          'OX-014',
          'OX-015',
          'OX-016',
          'OX-036',
          'OX-039',
          'OX-040',
        ],
      },
      {
        anchor: 'lean',
        titleKey: `${KEY}.ideal_weight.group_lean_title`,
        introKey: `${KEY}.ideal_weight.group_lean_intro`,
        subNeeds: [
          {
            titleKey: `${KEY}.ideal_weight.group_lean_need_1_title`,
            lineKey: `${KEY}.ideal_weight.group_lean_need_1_line`,
            categorySlug: 'whey-isolate',
          },
          {
            titleKey: `${KEY}.ideal_weight.group_lean_need_2_title`,
            lineKey: `${KEY}.ideal_weight.group_lean_need_2_line`,
            categorySlug: 'snacks-bars',
          },
          {
            titleKey: `${KEY}.ideal_weight.group_lean_need_3_title`,
            lineKey: `${KEY}.ideal_weight.group_lean_need_3_line`,
            categorySlug: 'creatine',
          },
        ],
        skus: [
          'OX-004',
          'OX-005',
          'OX-006',
          'OX-007',
          'OX-008',
          'OX-015',
          'OX-016',
          'OX-037',
          'OX-038',
        ],
      },
    ],
    subNeeds: [],
    faq: [
      { qKey: `${KEY}.ideal_weight.faq_1_q`, aKey: `${KEY}.ideal_weight.faq_1_a` },
      { qKey: `${KEY}.ideal_weight.faq_2_q`, aKey: `${KEY}.ideal_weight.faq_2_a` },
      { qKey: `${KEY}.ideal_weight.faq_3_q`, aKey: `${KEY}.ideal_weight.faq_3_a` },
    ],
    needHelpKey: `${KEY}.ideal_weight.need_help`,
    needHelpCtaKey: `${KEY}.ideal_weight.need_help_cta`,
    skus: [],
  },
];

/** The six slugs, in navigation order. */
export const GOAL_SLUGS: string[] = GOALS.map((goal) => goal.slug);

/** True when a listing route's slug is a goal collection rather than a type. */
export function isGoalSlug(slug: string | undefined): boolean {
  return slug !== undefined && GOAL_SLUGS.includes(slug);
}

export function goalBySlug(slug: string | undefined): GoalContent | undefined {
  return GOALS.find((goal) => goal.slug === slug);
}

/** Every SKU a goal covers, its groups included, without duplicates. */
export function goalSkus(goal: GoalContent): string[] {
  const all = [...goal.skus, ...(goal.groups ?? []).flatMap((group) => group.skus)];
  return [...new Set(all)];
}
