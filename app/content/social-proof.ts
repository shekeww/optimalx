/**
 * Social proof: the store's real, verifiable reputation (FINAL-claims-source
 * row "تقييم العملاء (real reviews)", which is a CONDITIONAL claim, permitted
 * once real reviews exist).
 *
 * The claims source was drafted on 2026-09-18 with the line "No reviews, no
 * order counts, no certifications". That was true of Salla's review system and
 * wrong about the business: the Google Business Profile for the Al Khalidiyah
 * branch carries a real rating over a real review count, written by real
 * customers, publicly checkable by anyone who follows the link. The condition
 * on that row is met. The evidence just does not live in the Salla API, so
 * `reviews_list` still returns zero and every product-level gate stays shut.
 *
 * So this module models reputation the way the theme already models every
 * other conditional claim (compare `claim_official_distributors` in
 * OxTrustStrip): the merchant supplies the evidence through theme settings,
 * and no surface renders a word of it until the evidence is there. A store
 * that has not filled the settings prints nothing, which is the correct render
 * for a store without reviews and the render this theme shipped with.
 *
 * TWO RULES THAT ARE NOT NEGOTIABLE, both sourced rather than inferred.
 *
 * 1. NO STRUCTURED DATA. `aggregateRating` is never emitted for this figure,
 *    on any node. Google's review snippet guidelines say "Don't aggregate
 *    reviews or ratings from other websites", and separately that when "the
 *    entity that's being reviewed controls the reviews about itself, their
 *    pages that use LocalBusiness or any other type of Organization structured
 *    data are ineligible for star review feature". A Google-sourced rating
 *    marked up on our own Store node breaks both at once. It looks like free
 *    stars in search and it is a manual action waiting to happen.
 *    `seo/jsonld.ts#localBusiness` therefore has no rating field and must not
 *    grow one.
 *
 * 2. NO PLACES API. The Places terms forbid pre-fetching, caching or storing
 *    Places content, which rules out rendering it during SSR, and they require
 *    the Google Maps logo plus each author's avatar, name and profile link
 *    wherever their words appear. A per-view licensed call on the critical
 *    path of a store whose whole pitch is speed is the wrong trade. Figures
 *    and quotes come from the OWNER'S OWN Business Profile export instead:
 *    that is the merchant's own data about the merchant's own business, and a
 *    plain sentence citing its public source is not redistribution.
 *
 * What we do instead is cheaper, faster and more honest: state the figure,
 * date it, and link to the listing so any visitor can check it in one tap.
 */

/** Theme setting ids carrying the evidence. All of them, or nothing renders. */
export const SOCIAL_PROOF_SETTINGS = {
  /** The public listing. Doubles as the proof link and as the gate. */
  placeUrl: 'google_place_url',
  /** The average, as shown on the listing. */
  rating: 'google_rating',
  /** The review count, as shown on the listing. */
  reviewCount: 'google_review_count',
  /** ISO date the merchant last checked the two figures above. */
  verifiedAt: 'google_verified_at',
} as const;

export interface StoreRating {
  /** 0 to 5, one decimal. */
  rating: number;
  /** A whole count above zero. */
  count: number;
  /** The listing, for the proof link. */
  url: string;
  /** ISO "YYYY-MM-DD", when the merchant recorded the figures. */
  verifiedAt?: string;
}

/**
 * Hosts a proof link may point at. A rating whose link goes anywhere else is
 * not checkable, and an unverifiable number is the thing this whole module
 * exists to avoid, so it is dropped rather than shown.
 */
const PROOF_HOSTS = [
  'google.com',
  'www.google.com',
  'maps.google.com',
  'goo.gl',
  'maps.app.goo.gl',
  'share.google',
];

function hostOf(url: string): string | undefined {
  const afterScheme = url.split('://')[1];
  if (!afterScheme) return undefined;
  return afterScheme.split('/')[0].split('?')[0].toLowerCase();
}

function settingText(settings: unknown, key: string): string {
  if (!settings || typeof settings !== 'object') return '';
  const raw = (settings as Record<string, unknown>)[key];
  if (typeof raw === 'string') return raw.trim();
  if (typeof raw === 'number' && Number.isFinite(raw)) return String(raw);
  return '';
}

/**
 * The store's rating, or null when the evidence is incomplete or unusable.
 *
 * Every condition below is a reason a figure could be wrong on screen, and a
 * wrong figure is worse than no figure: an unparseable average, a count of
 * zero typed to "turn the section on", a rating above five, a proof link that
 * does not reach Google. Each of those returns null and the surface renders
 * nothing.
 */
export function readStoreRating(settings: unknown): StoreRating | null {
  const url = settingText(settings, SOCIAL_PROOF_SETTINGS.placeUrl);
  if (!url.startsWith('https://')) return null;
  const host = hostOf(url);
  if (!host || !PROOF_HOSTS.includes(host)) return null;

  const rating = Number(settingText(settings, SOCIAL_PROOF_SETTINGS.rating));
  if (!Number.isFinite(rating) || rating <= 0 || rating > 5) return null;

  const count = Number(settingText(settings, SOCIAL_PROOF_SETTINGS.reviewCount));
  if (!Number.isInteger(count) || count <= 0) return null;

  const verifiedAt = settingText(settings, SOCIAL_PROOF_SETTINGS.verifiedAt);
  return {
    rating: Math.round(rating * 10) / 10,
    count,
    url,
    verifiedAt: /^\d{4}-\d{2}-\d{2}$/.test(verifiedAt) ? verifiedAt : undefined,
  };
}

/** One quoted review, transcribed from the owner's Business Profile export. */
export interface CuratedReview {
  /** Stable id, so a quote can be removed without reshuffling the rest. */
  id: string;
  /** The author as the listing displays them. Never invented, never expanded. */
  author: string;
  /** The review's own stars. */
  stars: number;
  /** ISO "YYYY-MM"; the day is not shown and is not ours to publish. */
  month: string;
  /** The review body VERBATIM. Trimming the ends is allowed; editing is not. */
  text: string;
  /** 'ar' or 'en', the language it was written in. */
  lang: 'ar' | 'en';
  /** The owner's public reply, verbatim, when there is one. */
  reply?: string;
}

/**
 * Words that disqualify a review from being QUOTED on the site.
 *
 * A customer may write whatever they like and it stays on Google untouched.
 * But a quote the store chooses to reprint on its own storefront is the
 * store's own marketing, and the claims source binds it exactly as it binds
 * copy we write ourselves. Reprinting "he cured my..." is making a treatment
 * claim in a customer's voice, and reprinting "the doctor there" is asserting
 * a credential the store has not documented, which the source forbids outright
 * in its "أخصائي، صيدلي، طبيب، مدرب معتمد" column.
 *
 * This is a filter on WHICH real reviews we quote. It never edits one: a
 * review that trips a pattern is left out whole, with its stars still counted
 * in the aggregate, because the aggregate is Google's arithmetic and not ours.
 *
 * The exclusion is also commercially right. What survives the filter is the
 * service, authenticity, selection and advice, which is precisely the pitch of
 * a reseller, curator and advisor, and converts better than an outcome claim
 * a sceptical shopper discounts on sight.
 */
export const QUOTE_EXCLUSIONS: readonly RegExp[] = [
  // Professional and medical titles.
  /\b(dr|doctor|prof|professor|pharmacist|physician|specialist|dietitian|nutritionist|certified\s+(trainer|coach))\b/i,
  /(طبيب|دكتور|صيدلي|أخصائي|اخصائي|استشاري|مدرب معتمد|كابتن)/, // ox-allow: arabic-literal claims filter
  // Treatment, cure and prevention.
  /\b(cure[ds]?|heal(ed|s|ing)?|treat(ed|s|ment)?|remedy|diagnos)/i,
  /(يعالج|عالج|علاج|يشفي|شفى|شفاء|يقي|الوقاية من)/, // ox-allow: arabic-literal claims filter
  // Outcome promises and results with a timeframe.
  /\b(lost|gained|dropped|burned)\s+\d|\bin\s+(just\s+)?\d+\s+(days?|weeks?|months?)\b/i,
  /(خسرت|نزلت|زاد وزني|حرقت|خلال \d+|في \d+ (يوم|أيام|اسابيع|أسابيع|شهر))/, // ox-allow: arabic-literal claims filter
  // Absolutes and guarantees.
  /\b(guaranteed|100%\s*(safe|effective)|no\s+side\s+effects|clinically\s+proven|the\s+best\s+in\s+saudi|number\s*1|#1)\b/i,
  /(مضمون|آمن 100|امن 100|بدون آثار جانبية|مثبت سريريا|أفضل في السعودية|رقم 1)/, // ox-allow: arabic-literal claims filter
];

/**
 * Whether a real review may be reprinted on the storefront. Applied to the
 * quote and to the owner's reply alike, because a reply we publish is the
 * store speaking in its own voice and is held to the same line.
 */
export function isQuotable(review: CuratedReview): boolean {
  const subject = `${review.text}\n${review.reply ?? ''}`;
  return !QUOTE_EXCLUSIONS.some((pattern) => pattern.test(subject));
}

/**
 * The reviews cleared for quoting.
 *
 * EMPTY UNTIL THE OWNER EXPORTS THEM. The figures in theme settings are one
 * fact the owner can read off their own listing and type in; review text is
 * other people's words, and the way to get it correctly is Business Profile to
 * Reviews to export, not a scrape of the public page, which cannot tell an
 * owner-uploaded photo or an owner-visible reply from a customer's. Until that
 * export arrives this stays empty and the quote surfaces render nothing, while
 * the aggregate above renders as soon as its four settings are filled.
 */
export const CURATED_REVIEWS: readonly CuratedReview[] = [];

/** The quotable reviews, in the order they should appear. */
export function quotableReviews(
  reviews: readonly CuratedReview[] = CURATED_REVIEWS
): CuratedReview[] {
  return reviews.filter(isQuotable);
}
