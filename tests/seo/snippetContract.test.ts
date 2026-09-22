import { describe, expect, it } from 'vitest';
import { TAXONOMY } from '../../app/content/taxonomy';
import { headString } from '../../app/components/seo/strings';

/**
 * The SEO-ENG-010 snippet contract (brief-S3-S6-2026-09-22.md, "Rules for
 * both builders" item 1), measured against the shipped locale values rather
 * than asserted in the abstract: Arabic titles 45-55 characters (hard
 * ceiling 60), Arabic descriptions 130-150 (ceiling 160); English titles
 * 50-60, descriptions 140-160. A breach is reported as "key: title 81/60" so
 * a failing run names the exact key and the exact overage, never a bare
 * verdict.
 *
 * Covers every head-bearing page whose title and description are our own
 * locale keys: home, the 25 taxonomy nodes, `/categories`, services, branch,
 * about, contact. The blog index and the dashboard-authored policy pages are
 * out of scope: their title and description come from the engine's own head
 * at request time (the merchant's own copy, or the platform dictionary), not
 * from a key this dictionary carries, so there is nothing here to measure
 * (progress/S3.md records this as a known gap).
 *
 * A breach may be allowlisted by exact `key.field`, with a written reason
 * (below), the same convention `scripts/check-claims.mjs` uses: reviewed at
 * every change, not a way to silence a genuine defect, and never a whole key
 * or a whole locale. Every entry here is content S3 does not own (`ox.tax.*`
 * is S1's, `ox.pages.about.*` is S4's) and is filed as a request in
 * progress/S3.md instead of edited, per the "never edit an existing value
 * under locales/" rule; a second test below asserts every allowlisted entry
 * still actually breaches, so a fix that lands without updating this list
 * fails loudly instead of leaving a stale exemption.
 */

interface ContractPage {
  key: string;
  titleKey: string;
  descriptionKey: string;
}

const PAGES: ContractPage[] = [
  { key: 'home', titleKey: 'ox.seo.home.title', descriptionKey: 'ox.seo.home.description' },
  { key: 'categories', titleKey: 'ox.tax.index.title', descriptionKey: 'ox.tax.index.description' },
  { key: 'services', titleKey: 'ox.services.meta_title', descriptionKey: 'ox.services.meta_description' },
  { key: 'branch', titleKey: 'ox.content.branch.title', descriptionKey: 'ox.branch.meta_description' },
  { key: 'about', titleKey: 'ox.pages.about.meta_title', descriptionKey: 'ox.pages.about.meta_description' },
  { key: 'contact', titleKey: 'ox.pages.contact.meta_title', descriptionKey: 'ox.pages.contact.meta_description' },
  ...TAXONOMY.map((node) => ({ key: `tax.${node.key}`, titleKey: node.titleKey, descriptionKey: node.descriptionKey })),
];

const LIMITS = {
  ar: {
    title: { target: [45, 55] as const, ceiling: 60 },
    description: { target: [130, 150] as const, ceiling: 160 },
  },
  en: {
    title: { target: [50, 60] as const, ceiling: 60 },
    description: { target: [140, 160] as const, ceiling: 160 },
  },
} as const;

type Field = 'title' | 'description';
type Locale = 'ar' | 'en';

/**
 * Pre-existing breaches in content S3 does not own, found by this gate and
 * filed in progress/S3.md rather than edited (locales protocol). Key is
 * `locale:page.field`.
 */
const ALLOWLIST: Record<string, string> = {
  // S1 owns ox.tax.index.title (CATEGORIES_INDEX_KEYS, app/routes/categories.tsx).
  'ar:categories.title': 'S1 content, request filed in progress/S3.md',
  // S4 owns ox.pages.about.meta_description values (locales voice sweep).
  'en:about.description': 'S4 content, request filed in progress/S3.md',
  // S4 owns every ox.tax.*.description EN value (locales/partials/tax.en.json).
  'en:tax.creatine.description': 'S4 content, request filed in progress/S3.md',
  'en:tax.pre_workout.description': 'S4 content, request filed in progress/S3.md',
  'en:tax.amino_acids.description': 'S4 content, request filed in progress/S3.md',
  'en:tax.omega_3.description': 'S4 content, request filed in progress/S3.md',
  'en:tax.vitamins_minerals.description': 'S4 content, request filed in progress/S3.md',
  'en:tax.collagen_beauty.description': 'S4 content, request filed in progress/S3.md',
  'en:tax.daily_health.description': 'S4 content, request filed in progress/S3.md',
  'en:tax.snacks_bars.description': 'S4 content, request filed in progress/S3.md',
  'en:tax.whey_isolate.description': 'S4 content, request filed in progress/S3.md',
  'en:tax.casein.description': 'S4 content, request filed in progress/S3.md',
  'en:tax.plant_protein.description': 'S4 content, request filed in progress/S3.md',
  'en:tax.mass_gainer.description': 'S4 content, request filed in progress/S3.md',
  'en:tax.bundles.description': 'S4 content, request filed in progress/S3.md',
  'en:tax.gift_cards.description': 'S4 content, request filed in progress/S3.md',
  'en:tax.goal_energy.description': 'S4 content, request filed in progress/S3.md',
  'en:tax.goal_general_health.description': 'S4 content, request filed in progress/S3.md',
  'en:tax.goal_performance.description': 'S4 content, request filed in progress/S3.md',
  'en:tax.goal_recovery.title': 'S4 content, request filed in progress/S3.md',
  'en:tax.goal_recovery.description': 'S4 content, request filed in progress/S3.md',
  'en:tax.goal_hair_skin.description': 'S4 content, request filed in progress/S3.md',
  'en:tax.goal_ideal_weight.description': 'S4 content, request filed in progress/S3.md',
};

/** "key: title 81/60" when `value` breaks the hard ceiling, else null. */
function breachOf(key: string, field: Field, locale: Locale, value: string): string | null {
  const limit = LIMITS[locale][field];
  if (value.length <= limit.ceiling) return null;
  return `${key}: ${field} ${value.length}/${limit.ceiling}`;
}

function rawBreachesOf(locale: Locale): string[] {
  const breaches: string[] = [];
  for (const page of PAGES) {
    const title = headString(locale, page.titleKey);
    const description = headString(locale, page.descriptionKey);
    const titleBreach = breachOf(page.key, 'title', locale, title);
    if (titleBreach) breaches.push(titleBreach);
    const descriptionBreach = breachOf(page.key, 'description', locale, description);
    if (descriptionBreach) breaches.push(descriptionBreach);
  }
  return breaches;
}

function allowlistKeyOf(locale: Locale, breach: string): string {
  const [page, rest] = breach.split(': ');
  const [field] = rest.split(' ');
  return `${locale}:${page}.${field}`;
}

function breachesOf(locale: Locale): string[] {
  return rawBreachesOf(locale).filter((breach) => !(allowlistKeyOf(locale, breach) in ALLOWLIST));
}

describe('SEO-ENG-010 snippet contract', () => {
  it('resolves a real value for every title and description key (no raw key leaked)', () => {
    const unresolved: string[] = [];
    for (const locale of ['ar', 'en'] as const) {
      for (const page of PAGES) {
        if (headString(locale, page.titleKey) === page.titleKey) unresolved.push(`${locale}:${page.key}.title`);
        if (headString(locale, page.descriptionKey) === page.descriptionKey) {
          unresolved.push(`${locale}:${page.key}.description`);
        }
      }
    }
    expect(unresolved).toEqual([]);
  });

  it('never breaches the Arabic hard ceiling (title 60, description 160), outside the allowlist', () => {
    expect(breachesOf('ar')).toEqual([]);
  });

  it('never breaches the English hard ceiling (title 60, description 160), outside the allowlist', () => {
    expect(breachesOf('en')).toEqual([]);
  });

  it('keeps no stale allowlist entry (every listed key still actually breaches)', () => {
    const stale = Object.keys(ALLOWLIST).filter((entry) => {
      const [locale] = entry.split(':') as [Locale];
      return !rawBreachesOf(locale).some((breach) => allowlistKeyOf(locale, breach) === entry);
    });
    expect(stale).toEqual([]);
  });
});
