import type { OxIconName } from '../components/common/Icon';
import { pathForSku } from './salla-ids';

/**
 * The three "ask before you buy" channels plus the personal training session
 * (FINAL-content 4, catalogue items OX-044 to OX-047).
 *
 * Structure and locale keys only. Two claims gates are encoded as data rather
 * than as copy (PLAN-final 5.1):
 *   - the video channel has NO badge key: the 50 riyal credit line renders
 *     verbatim from the `consultation_credit_note` setting, and only when that
 *     setting is non-empty (`gatedSetting`);
 *   - no channel carries a reply-time promise. A surface that wants to state
 *     one interpolates the `reply_sla_hours` setting and renders nothing when
 *     it is empty (`replyTimeSetting`).
 *
 * Prices never live here: a channel's price comes from its live product
 * through `product.findOrThrow(id)` and `useMoney().format()`.
 */

export type ServiceChannelId = 'written' | 'video' | 'visit';

export interface ServiceChannel {
  id: ServiceChannelId;
  /** Slug used in the URL fragment and the intake form's channel field. */
  slug: string;
  /** Catalogue code (FINAL-catalogue C). */
  code: string;
  /** Live product id from ./salla-ids; the price and stock come from the API. */
  sku: string;
  icon: OxIconName;
  titleKey: string;
  /** Rendered only when set: the video channel's badge is a gated setting. */
  badgeKey?: string;
  metaKey: string;
  descKey: string;
  scopeKeys: string[];
  prepareKey: string;
  outputKey: string;
  changeKey: string;
  ctaKey: string;
  /** Route the CTA opens. */
  to: string;
  /**
   * A theme setting that must be non-empty before the channel's money line
   * renders; the setting's own text is what renders, verbatim.
   */
  gatedSetting?: 'consultation_credit_note';
}

const KEY = 'ox.content.services';

function scope(prefix: string, count: number): string[] {
  return Array.from({ length: count }, (unused, index) => `${KEY}.${prefix}_scope_${index + 1}`);
}

export const SERVICE_CHANNELS: ServiceChannel[] = [
  {
    id: 'written',
    slug: 'written-question',
    code: 'OX-044',
    sku: 'OX-044',
    icon: 'written-question',
    titleKey: `${KEY}.written_title`,
    badgeKey: `${KEY}.written_badge`,
    metaKey: `${KEY}.written_meta`,
    descKey: `${KEY}.written_desc`,
    scopeKeys: scope('written', 5),
    prepareKey: `${KEY}.written_prepare`,
    outputKey: `${KEY}.written_output`,
    changeKey: `${KEY}.written_change`,
    ctaKey: `${KEY}.written_cta`,
    to: pathForSku('OX-044') ?? '/services',
  },
  {
    id: 'video',
    slug: 'video-consultation',
    code: 'OX-045',
    sku: 'OX-045',
    icon: 'video-consult',
    titleKey: `${KEY}.video_title`,
    metaKey: `${KEY}.video_meta`,
    descKey: `${KEY}.video_desc`,
    scopeKeys: scope('video', 4),
    prepareKey: `${KEY}.video_prepare`,
    outputKey: `${KEY}.video_output`,
    changeKey: `${KEY}.video_change`,
    ctaKey: `${KEY}.video_cta`,
    to: pathForSku('OX-045') ?? '/services',
    gatedSetting: 'consultation_credit_note',
  },
  {
    id: 'visit',
    slug: 'branch-visit',
    code: 'OX-046',
    sku: 'OX-046',
    icon: 'branch-visit',
    titleKey: `${KEY}.visit_title`,
    badgeKey: `${KEY}.visit_badge`,
    metaKey: `${KEY}.visit_meta`,
    descKey: `${KEY}.visit_desc`,
    scopeKeys: scope('visit', 4),
    prepareKey: `${KEY}.visit_prepare`,
    outputKey: `${KEY}.visit_output`,
    changeKey: `${KEY}.visit_change`,
    ctaKey: `${KEY}.visit_cta`,
    to: pathForSku('OX-046') ?? '/services',
  },
];

/** The services hub hero and scope panel (FINAL-content 4.1 and 4.2). */
export const SERVICES_HUB = {
  h1Key: `${KEY}.hub_h1`,
  sublineKey: `${KEY}.hub_subline`,
  introKey: `${KEY}.hub_intro`,
  ctaPrimaryKey: `${KEY}.cta_primary`,
  ctaSecondaryKey: `${KEY}.cta_secondary`,
  scopeTitleKey: `${KEY}.scope_title`,
  scopeKeys: Array.from({ length: 7 }, (unused, index) => `${KEY}.scope_${index + 1}`),
  /** The lawyer-gated closing line; it renders on every services surface. */
  scopeClosingKey: `${KEY}.scope_closing`,
  /** Footer line under all three cards. */
  cardFooterKey: `${KEY}.card_footer`,
  /** The setting that must be set before any reply-time line renders. */
  replyTimeSetting: 'reply_sla_hours' as const,
} as const;

/** The three steps under the cards (FINAL-content 4.4). */
export const SERVICE_STEPS = [1, 2, 3].map((n) => ({
  titleKey: `${KEY}.how_${n}_title`,
  lineKey: `${KEY}.how_${n}_line`,
}));

/**
 * The personal training session (OX-047). It is not an "ask before you buy"
 * channel, so it never appears among the three cards; it has its own product
 * page and a card on the services hub.
 */
export const TRAINING_SESSION = {
  code: 'OX-047',
  sku: 'OX-047',
  icon: 'plan' as OxIconName,
  titleKey: `${KEY}.training_title`,
  descKey: `${KEY}.training_desc`,
  scopeKeys: scope('training', 4),
  prepareKey: `${KEY}.training_prepare`,
  whereKey: `${KEY}.training_where`,
  changeKey: `${KEY}.training_change`,
  footerKey: `${KEY}.training_footer`,
  ctaKey: `${KEY}.training_cta`,
} as const;

export function channelById(id: string | undefined): ServiceChannel | undefined {
  return SERVICE_CHANNELS.find((channel) => channel.id === id || channel.slug === id);
}

/** The channel a service or booking product belongs to, by catalogue code. */
export function channelByCode(code: string | undefined): ServiceChannel | undefined {
  return SERVICE_CHANNELS.find((channel) => channel.code === code);
}

// ---------------------------------------------------------------------------
// The five advisory services, as anchored sections of `/services`
// ---------------------------------------------------------------------------

/**
 * Band photography. Three files, reused across the five pages on purpose:
 * the store owns three clean photographs and a stretched or text-burnt frame
 * would undo the design faster than a repeat does. Every reference cover in
 * `references/` carries burnt-in headline text, which is never reproduced.
 */
export const SERVICE_PHOTOS = {
  services: '/assets/images/services-band.jpg',
  training: '/assets/images/athlete-band.jpg',
  nutrition: '/assets/images/nutrition-band.jpg',
} as const;

export interface ServicePage {
  /** Anchor id on `/services`, so the service has a `#slug` address. */
  slug: string;
  /** Catalogue code; absent when no product backs the page. */
  sku?: string;
  icon: OxIconName;
  photo: string;
  /** Band line 1, and the page's h1. */
  titleKey: string;
  /** Band line 2, when the title reads better split. */
  line2Key?: string;
  /** The supporting line inside the band. */
  sublineKey: string;
  /** The paragraph under the band, in the text measure. */
  introKey: string;
  scopeTitleKey: string;
  scopeKeys: readonly string[];
  prepareKey?: string;
  outputKey?: string;
  /** How a booking is moved or cancelled; also the third statistic cell. */
  changeKey?: string;
  /** The limit-of-our-work line; it renders on every service surface. */
  footerKey: string;
  ctaKey: string;
  /**
   * Where the primary action goes when no product backs the section. With a
   * `sku` the action resolves to that product's own page instead.
   */
  ctaTo?: string;
}

const PAGE = 'ox.services';

/**
 * The five advisory services.
 *
 * Four are backed by a real catalogue item (OX-044 to OX-047) and their
 * primary action opens that product, which is where Salla takes the booking
 * and the payment: no slot grid is built in theme markup, because slots are
 * checkout configuration (BUILD.md section 5).
 *
 * `nutrition-plans` is the fifth and it is deliberately different. No
 * nutrition-plan product exists and BUILD.md defers the three advisory
 * services on legal review, so the page is editorial: no price, no product of
 * its own, no timeframe, no outcome, and a single action that routes to the
 * video consultation, which is how a plan is actually delivered today. The
 * reference image's "real results" sub-line is an outcome promise and is not
 * built.
 */
export const SERVICE_PAGES: ServicePage[] = [
  {
    slug: 'written-question',
    sku: 'OX-044',
    icon: 'written-question',
    photo: SERVICE_PHOTOS.services,
    titleKey: `${KEY}.written_title`,
    sublineKey: `${KEY}.written_meta`,
    introKey: `${KEY}.written_desc`,
    scopeTitleKey: `${PAGE}.covers_title`,
    scopeKeys: scope('written', 5),
    prepareKey: `${KEY}.written_prepare`,
    outputKey: `${KEY}.written_output`,
    changeKey: `${KEY}.written_change`,
    footerKey: `${KEY}.card_footer`,
    ctaKey: `${KEY}.written_cta`,
  },
  {
    slug: 'video-consultation',
    sku: 'OX-045',
    icon: 'video-consult',
    photo: SERVICE_PHOTOS.services,
    titleKey: `${KEY}.video_title`,
    sublineKey: `${KEY}.video_meta`,
    introKey: `${KEY}.video_desc`,
    scopeTitleKey: `${PAGE}.covers_title`,
    scopeKeys: scope('video', 4),
    prepareKey: `${KEY}.video_prepare`,
    outputKey: `${KEY}.video_output`,
    changeKey: `${KEY}.video_change`,
    footerKey: `${KEY}.card_footer`,
    ctaKey: `${KEY}.video_cta`,
  },
  {
    slug: 'branch-visit',
    sku: 'OX-046',
    icon: 'branch-visit',
    photo: SERVICE_PHOTOS.services,
    titleKey: `${KEY}.visit_title`,
    sublineKey: `${KEY}.visit_meta`,
    introKey: `${KEY}.visit_desc`,
    scopeTitleKey: `${PAGE}.covers_title`,
    scopeKeys: scope('visit', 4),
    prepareKey: `${KEY}.visit_prepare`,
    outputKey: `${KEY}.visit_output`,
    changeKey: `${KEY}.visit_change`,
    footerKey: `${KEY}.card_footer`,
    ctaKey: `${KEY}.visit_cta`,
  },
  {
    slug: 'personal-training',
    sku: 'OX-047',
    icon: 'plan',
    photo: SERVICE_PHOTOS.training,
    titleKey: `${KEY}.training_title`,
    sublineKey: `${KEY}.training_where`,
    introKey: `${KEY}.training_desc`,
    scopeTitleKey: `${PAGE}.covers_title`,
    scopeKeys: scope('training', 4),
    prepareKey: `${KEY}.training_prepare`,
    changeKey: `${KEY}.training_change`,
    footerKey: `${KEY}.training_footer`,
    ctaKey: `${KEY}.training_cta`,
  },
  {
    slug: 'nutrition-plans',
    icon: 'plan',
    photo: SERVICE_PHOTOS.nutrition,
    titleKey: `${PAGE}.nutrition.title`,
    sublineKey: `${PAGE}.nutrition.subline`,
    introKey: `${PAGE}.nutrition.intro`,
    scopeTitleKey: `${PAGE}.covers_title`,
    scopeKeys: [1, 2, 3, 4].map((n) => `${PAGE}.nutrition.scope_${n}`),
    prepareKey: `${PAGE}.nutrition.prepare`,
    outputKey: `${PAGE}.nutrition.output`,
    footerKey: `${PAGE}.nutrition.footer`,
    ctaKey: `${PAGE}.nutrition.cta`,
    ctaTo: pathForSku('OX-045') ?? '/services',
  },
];

export function servicePageBySlug(slug: string | undefined): ServicePage | undefined {
  if (!slug) return undefined;
  return SERVICE_PAGES.find((page) => page.slug === slug);
}

/** Every anchor the hub publishes, in order. */
export const SERVICE_PAGE_SLUGS: string[] = SERVICE_PAGES.map((page) => page.slug);

// ---------------------------------------------------------------------------
// The home page's advisory row (reference section 7, `برامج وخطط التغذية`)
// ---------------------------------------------------------------------------

/**
 * The three cards the home page gives to the advisory half of the business.
 *
 * The reference draws three plan cards here and `docs/build/image-brief.md`
 * sections 9 to 11 name exactly three photographs for this row: nutrition
 * plans, training plans and the consultation. Those three are what this map
 * holds, each pointing at the surface that already sells it.
 *
 * The two entry channels that are not plans, the free written question and the
 * branch visit, stay on `/services`, which the section header links to. They
 * are also the trust strip's fourth cell, so neither disappears from the page.
 *
 * Every card is finished without its photograph: none of the three files
 * exists yet and `PlanCard` renders the flat dark ground until they do.
 */
export interface HomePlan {
  id: string;
  /** Anchor or product route the whole card links to. */
  to: string;
  icon: OxIconName;
  titleKey: string;
  lineKey: string;
  /** The brief's exact path, so a generated frame needs no code change. */
  photo: string;
}

export const HOME_PLANS: HomePlan[] = [
  {
    id: 'nutrition',
    to: '/services#nutrition-plans',
    icon: 'plan',
    titleKey: 'ox.home.plan_nutrition_title',
    lineKey: 'ox.home.plan_nutrition_line',
    photo: '/assets/images/plan-nutrition.jpg',
  },
  {
    id: 'training',
    to: pathForSku('OX-047') ?? '/services#personal-training',
    icon: 'form',
    titleKey: 'ox.home.plan_training_title',
    lineKey: 'ox.home.plan_training_line',
    photo: '/assets/images/plan-training.jpg',
  },
  {
    id: 'advisory',
    to: pathForSku('OX-045') ?? '/services#video-consultation',
    icon: 'video-consult',
    titleKey: 'ox.home.plan_advisory_title',
    lineKey: 'ox.home.plan_advisory_line',
    photo: '/assets/images/plan-advisory.jpg',
  },
];
