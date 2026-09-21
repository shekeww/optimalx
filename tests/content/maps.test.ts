import fs from 'node:fs';
import path from 'node:path';
import { describe, it, expect } from 'vitest';
import { GOALS, GOAL_SLUGS, goalBySlug, goalSkus, isGoalSlug } from '../../app/content/goals';
import {
  CATEGORIES,
  CATEGORY_SLUGS,
  ROOT_CATEGORY_SLUGS,
  categoryBySlug,
  childrenOf,
} from '../../app/content/categories';
import {
  SERVICE_CHANNELS,
  SERVICES_HUB,
  SERVICE_STEPS,
  TRAINING_SESSION,
} from '../../app/content/services';
import { BRANCH, BRANCH_GEO, parseBranchHours, hoursStatus, toSchemaOpeningHours } from '../../app/content/branch';
import { HOME_FAQ, PDP_INFO_ROWS, pdpFaq, PRICE_FAQ } from '../../app/content/faq';
import { THANKYOU, THANKYOU_LINE_BY_CATEGORY, thankYouLines } from '../../app/content/thankyou';
import {
  CONTENT_TERM_IDS,
  GLOSSARY,
  glossaryForLabel,
  LABEL_COVERED_TERM_IDS,
  LABEL_TERM_IDS,
} from '../../app/content/glossary';
import { SALLA_IDS, SALLA_PRODUCT_IDS, idForSku, pathForSku } from '../../app/content/salla-ids';
import { loadDictionary } from '../helpers/i18n';

/** FINAL-catalogue A.3, in order. */
const CATALOGUE_GOAL_SLUGS = [
  'goal-energy',
  'goal-general-health',
  'goal-performance',
  'goal-recovery',
  'goal-hair-skin',
  'goal-ideal-weight',
];

/** FINAL-catalogue A.1, in order (10 type categories plus 5 protein children). */
const CATALOGUE_CATEGORY_SLUGS = [
  'protein',
  'whey-protein',
  'whey-isolate',
  'casein',
  'plant-protein',
  'mass-gainer',
  'creatine',
  'pre-workout',
  'amino-acids',
  'omega-3',
  'vitamins-minerals',
  'collagen-beauty',
  'daily-health',
  'snacks-bars',
  'accessories',
];

const ar = loadDictionary('ar');
const en = loadDictionary('en');

/** Every key any content map references, collected once. */
function collectKeys(node: unknown, out: Set<string>): Set<string> {
  if (typeof node === 'string') {
    if (node.startsWith('ox.')) out.add(node);
    return out;
  }
  if (Array.isArray(node)) {
    for (const item of node) collectKeys(item, out);
    return out;
  }
  if (node && typeof node === 'object') {
    for (const value of Object.values(node)) collectKeys(value, out);
  }
  return out;
}

const REFERENCED = collectKeys(
  [
    GOALS,
    CATEGORIES,
    SERVICE_CHANNELS,
    SERVICES_HUB,
    SERVICE_STEPS,
    TRAINING_SESSION,
    BRANCH,
    HOME_FAQ,
    PDP_INFO_ROWS,
    THANKYOU,
    THANKYOU_LINE_BY_CATEGORY,
    GLOSSARY,
  ],
  new Set<string>()
);

describe('content maps: locale keys', () => {
  it('references at least one key from every ox.content block', () => {
    const blocks = ['goals', 'categories', 'services', 'branch', 'faq', 'thankyou', 'glossary'];
    for (const block of blocks) {
      const found = [...REFERENCED].some((key) => key.startsWith(`ox.content.${block}.`));
      expect(found, `no key referenced under ox.content.${block}`).toBe(true);
    }
  });

  it('resolves every referenced key in the Arabic dictionary', () => {
    // ox.pdp.* is B3's block; the locked medical row points at it by design.
    const missing = [...REFERENCED]
      .filter((key) => key.startsWith('ox.content.'))
      .filter((key) => ar[key] === undefined)
      .sort();
    expect(missing).toEqual([]);
  });

  it('resolves every referenced key in the English dictionary', () => {
    const missing = [...REFERENCED]
      .filter((key) => key.startsWith('ox.content.'))
      .filter((key) => en[key] === undefined)
      .sort();
    expect(missing).toEqual([]);
  });

  it('references a key outside ox.content only for the medical line and the taxonomy name/description keys', () => {
    // Contract B: `nameKey` and `descriptionKey` point at `ox.tax.*` (S1's new
    // partial), never duplicated under `ox.content.*`, so both categories.ts
    // and goals.ts legitimately reach outside this block now.
    const outside = [...REFERENCED]
      .filter((key) => !key.startsWith('ox.content.'))
      .filter((key) => key !== 'ox.pdp.medical_line' && !key.startsWith('ox.tax.'))
      .sort();
    expect(outside).toEqual([]);
  });

  it('leaves no ox.content key in the partial unreferenced by a map, except the page chrome', () => {
    // Page-level keys (h1, title, column heads, closing lines) are rendered by
    // the route rather than by a map entry; everything else must be reachable.
    const PAGE_LEVEL = /\.(page_h1|page_title|col_[a-z]+|closing|home_title|pdp_warning_a)$/;
    const orphans = Object.keys(ar)
      .filter((key) => key.startsWith('ox.content.'))
      .filter((key) => !REFERENCED.has(key))
      .filter((key) => !PAGE_LEVEL.test(key))
      // Glossary aliases and definitions are reached through GLOSSARY entries;
      // goal and category sub-keys through their own arrays.
      .filter((key) => !key.startsWith('ox.content.glossary.'))
      .sort();
    expect(orphans).toEqual([]);
  });
});

describe('goals.ts', () => {
  it('has the six slugs from FINAL-catalogue A.3, in order', () => {
    expect(GOAL_SLUGS).toEqual(CATALOGUE_GOAL_SLUGS);
  });

  it('gives every goal three sub-needs and three FAQ pairs', () => {
    for (const goal of GOALS) {
      const subNeeds =
        goal.groups && goal.groups.length > 0
          ? goal.groups.flatMap((group) => group.subNeeds)
          : goal.subNeeds;
      expect(subNeeds.length, goal.slug).toBeGreaterThanOrEqual(3);
      expect(goal.faq, goal.slug).toHaveLength(3);
    }
  });

  it('routes every sub-need to a category that exists', () => {
    const unknown = GOALS.flatMap((goal) => [
      ...goal.subNeeds,
      ...(goal.groups ?? []).flatMap((group) => group.subNeeds),
    ])
      .map((need) => need.categorySlug)
      .filter((slug) => !CATEGORY_SLUGS.includes(slug));
    expect(unknown).toEqual([]);
  });

  it('gives the performance goal an explainer and the ideal-weight goal two anchors', () => {
    expect(goalBySlug('goal-performance')?.explainer?.bodyKeys).toHaveLength(2);
    expect(goalBySlug('goal-ideal-weight')?.groups?.map((group) => group.anchor)).toEqual([
      'gain',
      'lean',
    ]);
    expect(goalBySlug('goal-energy')?.explainer).toBeUndefined();
  });

  it('names only SKUs that exist in the id map', () => {
    const unknown = GOALS.flatMap((goal) => goalSkus(goal)).filter((sku) => !(sku in SALLA_IDS));
    expect(unknown).toEqual([]);
  });

  it('detects a goal slug and rejects a type slug', () => {
    expect(isGoalSlug('goal-recovery')).toBe(true);
    expect(isGoalSlug('creatine')).toBe(false);
    expect(isGoalSlug(undefined)).toBe(false);
  });
});

describe('categories.ts', () => {
  it('has the fifteen slugs from FINAL-catalogue A.1, in order', () => {
    expect(CATEGORY_SLUGS).toEqual(CATALOGUE_CATEGORY_SLUGS);
  });

  it('nests the five protein subcategories under protein and leaves ten at the root', () => {
    expect(ROOT_CATEGORY_SLUGS).toHaveLength(10);
    expect(childrenOf('protein').map((category) => category.slug)).toEqual([
      'whey-protein',
      'whey-isolate',
      'casein',
      'plant-protein',
      'mass-gainer',
    ]);
  });

  it('gives every category chips, three FAQ pairs and three related guides', () => {
    for (const category of CATEGORIES) {
      expect(category.chipKeys.length, category.slug).toBeGreaterThan(0);
      expect(category.faq, category.slug).toHaveLength(3);
      expect(category.relatedGuides, category.slug).toHaveLength(3);
      for (const guide of category.relatedGuides) {
        expect(guide.startsWith('guides/'), `${category.slug}: ${guide}`).toBe(true);
      }
    }
  });

  it('names only SKUs that exist in the id map', () => {
    const unknown = CATEGORIES.flatMap((category) => category.skus).filter(
      (sku) => !(sku in SALLA_IDS)
    );
    expect(unknown).toEqual([]);
  });

  it('resolves a slug and rejects an unknown one', () => {
    expect(categoryBySlug('creatine')?.parent).toBeNull();
    expect(categoryBySlug('whey-isolate')?.parent).toBe('protein');
    expect(categoryBySlug('nope')).toBeUndefined();
  });
});

describe('services.ts', () => {
  it('has the three channels with their catalogue codes', () => {
    expect(SERVICE_CHANNELS.map((channel) => channel.code)).toEqual([
      'OX-044',
      'OX-045',
      'OX-046',
    ]);
    expect(TRAINING_SESSION.code).toBe('OX-047');
  });

  it('gates the consultation credit on the setting and gives the video card no badge key', () => {
    const video = SERVICE_CHANNELS.find((channel) => channel.id === 'video');
    expect(video?.badgeKey).toBeUndefined();
    expect(video?.gatedSetting).toBe('consultation_credit_note');
    expect(SERVICES_HUB.replyTimeSetting).toBe('reply_sla_hours');
  });

  it('never states a reply time, a price or a payment name in its copy', () => {
    const values = [...SERVICE_CHANNELS, SERVICES_HUB, TRAINING_SESSION]
      .flatMap((entry) => collectKeys(entry, new Set<string>()).values().toArray?.() ?? [...collectKeys(entry, new Set<string>())])
      .map((key) => ar[key] ?? '')
      .join(' ');
    expect(values).not.toContain('299');
    expect(/\b\d+\s*(hour|ساعة|ساعات)\b/.test(values)).toBe(false);
  });
});

describe('branch.ts', () => {
  it('carries the public coordinates and the setting ids it reads', () => {
    expect(BRANCH_GEO).toEqual({ latitude: 24.46276125, longitude: 39.653138015 });
    expect(BRANCH.settings.hours).toBe('branch_hours');
    expect(BRANCH.settings.mapUrl).toBe('branch_map_url');
    expect(BRANCH.settings.pickupHoldDays).toBe('pickup_hold_days');
  });

  it('parses a weekday range, a single day and a closed row, and drops a broken line', () => {
    const rows = parseBranchHours(
      ['الأحد إلى الخميس: 16:00 - 23:00', 'الجمعة 16:30-23:00', 'السبت: مغلق', 'ساعات العمل'].join(
        '\n'
      )
    );
    expect(rows).toHaveLength(3);
    expect(rows[0].days).toEqual([0, 1, 2, 3, 4]);
    expect(rows[0].from).toBe('16:00');
    expect(rows[1].days).toEqual([5]);
    expect(rows[2].closed).toBe(true);
  });

  it('prints nothing for an empty setting (FINAL-content 5.3)', () => {
    expect(parseBranchHours(undefined)).toEqual([]);
    expect(parseBranchHours('')).toEqual([]);
  });

  it('reads open and closed from the parsed table against a fixed clock', () => {
    const rows = parseBranchHours('الأحد إلى الخميس: 16:00 - 23:00\nالجمعة: مغلق');
    // 2026-09-20 is a Sunday.
    expect(hoursStatus(rows, new Date(2026, 8, 20, 18, 0)).isOpen).toBe(true);
    const closed = hoursStatus(rows, new Date(2026, 8, 20, 9, 0));
    expect(closed.isOpen).toBe(false);
    expect(closed.nextOpen).toBe('16:00');
  });

  it('compresses contiguous weekdays into schema.org openingHours', () => {
    const rows = parseBranchHours('الأحد إلى الخميس: 16:00 - 23:00');
    expect(toSchemaOpeningHours(rows)).toEqual(['Su-Th 16:00-23:00']);
  });
});

describe('faq.ts and thankyou.ts', () => {
  it('puts the mandatory price item first in a five-item home FAQ', () => {
    expect(HOME_FAQ).toHaveLength(5);
    expect(HOME_FAQ[0]).toBe(PRICE_FAQ);
    expect(new Set(HOME_FAQ.map((item) => item.id)).size).toBe(5);
  });

  it('locks the medical row and points it at the key B3 owns', () => {
    const warning = PDP_INFO_ROWS.find((row) => row.id === 'pdp-warning');
    expect(warning?.locked).toBe(true);
    expect(warning?.aKey).toBe('ox.pdp.medical_line');
  });

  it('builds a PDP FAQ from the price item plus the owning category', () => {
    expect(pdpFaq('creatine')).toHaveLength(4);
    expect(pdpFaq(undefined)).toEqual([PRICE_FAQ]);
  });

  it('gives every category in the map a thank-you line, de-duplicated per order', () => {
    for (const slug of CATEGORY_SLUGS) {
      expect(THANKYOU_LINE_BY_CATEGORY[slug], slug).toBeDefined();
    }
    expect(thankYouLines(['whey-protein', 'whey-isolate', 'creatine'])).toHaveLength(2);
    expect(thankYouLines(['nope'])).toEqual([]);
  });
});

describe('glossary.ts', () => {
  it('has the thirty terms from FINAL-content 8 plus the eleven label nutrients', () => {
    expect(CONTENT_TERM_IDS).toHaveLength(30);
    expect(LABEL_TERM_IDS).toHaveLength(11);
    expect(GLOSSARY).toHaveLength(41);
    expect(new Set(GLOSSARY.map((term) => term.id)).size).toBe(41);
  });

  it('matches a label cell to a term through the translated aliases', () => {
    const t = (key: string) => ar[key] ?? key;
    expect(glossaryForLabel('كرياتين', t)?.id).toBe('creatine');
    expect(glossaryForLabel('BCAA', t)?.id).toBe('bcaa');
    expect(glossaryForLabel('electrolytes', t)?.id).toBe('electrolytes');
  });

  it('matches the macronutrient rows a label prints, longest alias winning', () => {
    const t = (key: string) => ar[key] ?? key;
    expect(glossaryForLabel('البروتين', t)?.id).toBe('protein');
    expect(glossaryForLabel('إجمالي الكربوهيدرات', t)?.id).toBe('carbohydrates');
    expect(glossaryForLabel('الدهون', t)?.id).toBe('fat');
    expect(glossaryForLabel('الدهون المشبعة', t)?.id).toBe('saturated_fat');
    expect(glossaryForLabel('صوديوم', t)?.id).toBe('sodium');
    expect(glossaryForLabel('Saturated Fat', t)?.id).toBe('saturated_fat');
  });

  it('returns nothing rather than inventing text for an uncovered nutrient', () => {
    const t = (key: string) => ar[key] ?? key;
    expect(glossaryForLabel('بوتاسيوم', t)).toBeUndefined();
    expect(glossaryForLabel('', t)).toBeUndefined();
  });

  it('only claims label coverage for terms that exist', () => {
    const ids = GLOSSARY.map((term) => term.id);
    expect(LABEL_COVERED_TERM_IDS.filter((id) => !ids.includes(id))).toEqual([]);
  });
});

describe('salla-ids.ts', () => {
  it('has the 47 products the store write created', () => {
    expect(Object.keys(SALLA_IDS)).toHaveLength(47);
    expect(SALLA_PRODUCT_IDS).toHaveLength(47);
    expect(new Set(SALLA_PRODUCT_IDS).size).toBe(47);
  });

  it('resolves a SKU to an id and a store path', () => {
    expect(idForSku('OX-001')).toBe(1996831868);
    expect(pathForSku('OX-001')).toContain('/p1996831868');
    expect(idForSku('OX-999')).toBeUndefined();
  });

  it('matches the id map committed under docs/build', () => {
    const source = JSON.parse(
      fs.readFileSync(path.join('docs', 'build', 'salla-ids.json'), 'utf8')
    ) as Record<string, { id: number }>;
    expect(Object.keys(source).sort()).toEqual(Object.keys(SALLA_IDS).sort());
    for (const [sku, value] of Object.entries(source)) {
      expect(idForSku(sku), sku).toBe(value.id);
    }
  });
});
