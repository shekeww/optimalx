import type { OxIconName } from '../components/common/Icon';

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
    to: '/services',
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
    to: '/services',
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
    to: '/branch',
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
