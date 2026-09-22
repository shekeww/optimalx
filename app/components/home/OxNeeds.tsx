import { useMemo, useState } from 'react';
import { useQueryClient, type QueryClient } from '@tanstack/react-query';
import { useTranslation } from '@salla.sa/twilight-theme-engine/i18n';
import { SectionHeader } from '../common/SectionHeader';
import { Tabs, type TabItem } from '../common/Tabs';
import { useTaxonomyLinks, type TaxonomyLinks } from '../listing/useTaxonomyLinks';
import { matchesSlug, searchFallback } from '../listing/resolve';
import { GOALS, GOAL_CARD_LINES } from '../../content/goals';
import { CATEGORIES, categoryBySlug } from '../../content/categories';
import { nodeBySlug } from '../../content/taxonomy';
import type { OxIconName } from '../common/Icon';
import { NeedCard, type NeedTone } from './NeedCard';
import { useSectionReveal } from './useSectionReveal';
import { fieldList, rowText, type OxBlockData, type OxBlockProps } from './defaults';

/**
 * "Shop by need" (owner amendment 2026-09-22): one section, two tab panes,
 * replacing the separate goal row and type grid (`OxGoals` + `OxCategories`,
 * now `NeedCard` under one composition). Both legacy block keys stay
 * registered against this component (`register.ts`) so neither a fresh
 * store's default composition nor a merchant's already-saved one breaks; see
 * `useClaimPrimaryNeedsSlot` below for what keeps two registered slots from
 * drawing the section twice.
 *
 * Two panes, both built from the SAME content maps and the SAME
 * `useTaxonomyLinks()` resolution every other taxonomy link on the theme
 * shares, so a goal or type card here never points somewhere different from
 * the header's own menu for that slug:
 *
 *   - goals (default, 6 cards): `content/goals.ts`, in its fixed order. No
 *     merchant field; every store shows the same six.
 *   - types (8 cards): the four categories that already carried a shaker tone
 *     (protein, creatine, vitamins-minerals, collagen-beauty) plus the four
 *     the owner named for their own tint (pre-workout, amino-acids, omega-3,
 *     daily-health). A merchant's own `categories` selection (the field the
 *     legacy `ox-categories` block carried) overrides this list exactly the
 *     way it did before, when this render is the instance driven by that
 *     block's data.
 *
 * Every pale card is coloured (owner amendment; the identity judges' four-
 * ground limit is superseded), one card per pane stays the black emphasis
 * card (`collagen-beauty` on types, `goal-performance` on goals - the goal
 * this catalogue's guide set cites most, GOAL_TONE's docblock), and the
 * measured tint hexes and their contrast against `--ox-accent-dark` are
 * written in `docs/build/progress/S2b.md` and in `_b2-home.scss`'s "1.
 * OxNeeds and NeedCard" section, never invented at a call site.
 */

/**
 * Which registered slot renders the section, when a composition (today's
 * default, and any merchant's dashboard-saved one — `home.ox-goals` and
 * `home.ox-categories` are both `is_default: true` in `twilight.json`) still
 * carries both legacy block keys.
 *
 * `register.ts` points BOTH `ox-goals` and `ox-categories` at this same
 * component, so the engine mounts two instances of it, one per slot, in
 * array order. The FIRST one to render claims a per-`QueryClient` flag; the
 * second sees the flag already set and renders null. `QueryClient` rather
 * than a bare module boolean because it is already the one object this app
 * creates fresh per server request and keeps stable for the lifetime of one
 * client session (`RouterInitialContext.queryClient`), so the claim can
 * never leak between two different requests, and an unmount effect releases
 * it so a later client-side revisit to the home route claims it again.
 */
const claimedNeedsSlot = new WeakMap<QueryClient, boolean>();

function useClaimPrimaryNeedsSlot(): boolean {
  const queryClient = useQueryClient();
  const [isPrimary] = useState(() => {
    if (claimedNeedsSlot.get(queryClient)) return false;
    claimedNeedsSlot.set(queryClient, true);
    return true;
  });
  return isPrimary;
}

/**
 * The pastel run (X-IDENTITY-2026-09-22.md §4.6): six measured tints plus one
 * this batch derived by the same method (12% tint, `--ox-accent-dark` on it
 * at the graphical 3:1 floor, WCAG 1.4.11 - the exact ratios are in
 * `docs/build/progress/S2b.md`). A NAME here, never a hex: every value lives
 * once, in `_b2-home.scss`, as `--ox-need-tint-<name>`.
 */
const TYPE_TONE: Record<string, NeedTone> = {
  protein: 'peach',
  creatine: 'ash',
  'pre-workout': 'mint',
  'amino-acids': 'sand',
  'omega-3': 'sky',
  'vitamins-minerals': 'rose',
  'daily-health': 'violet',
  'collagen-beauty': 'black',
};

/**
 * `goal-performance` is the black emphasis card on the goals pane: five of
 * the twelve guide slugs `content/categories.ts` cites name creatine and
 * performance is the goal that routes to creatine, whey protein and pre-
 * workout together - the same reasoning `SHAKER_CATEGORY_SLUGS` already
 * gives for why creatine leads the type row. The other five reuse the same
 * five tints the type pane does not spend on its own black card.
 */
const GOAL_TONE: Record<string, NeedTone> = {
  'goal-energy': 'peach',
  'goal-general-health': 'ash',
  'goal-recovery': 'mint',
  'goal-hair-skin': 'sand',
  'goal-ideal-weight': 'sky',
  'goal-performance': 'black',
};

/**
 * The eight type cards, in tile order. Ten root categories exist
 * (`content/categories.ts`); `snacks-bars` and `accessories` are left off so
 * the pane holds a full row at every breakpoint (S2b brief: "8 to 10 cards")
 * without a half-empty one.
 */
const TYPE_PANE_SLUGS = [
  'protein',
  'creatine',
  'pre-workout',
  'amino-acids',
  'omega-3',
  'vitamins-minerals',
  'collagen-beauty',
  'daily-health',
] as const;

/**
 * New `s2.*` keys (S2b brief: claims-clean product-type lists, verified
 * against `fixtures/store/products.json`). Six of the eight are the brief's
 * own literal lines; omega-3 and daily-health are this batch's own reading of
 * their SKUs (omega-3: two fish-oil softgels; daily-health: a probiotic, an
 * electrolyte tablet and a liquid chlorophyll - three different shelves, so
 * the line names all three rather than picking one).
 */
const TYPE_LINE_KEY: Record<string, string> = Object.fromEntries(
  CATEGORIES.filter((entry) => entry.cardLineKey).map((entry) => [entry.slug, entry.cardLineKey as string])
);

interface NeedCardVM {
  slug: string;
  tone: NeedTone;
  icon: OxIconName;
  title: string;
  line: string;
  to: string;
  count?: number;
  image?: string;
}

function buildGoalCards(taxonomy: TaxonomyLinks, t: (key: string) => string): NeedCardVM[] {
  return GOALS.map((goal) => {
    const link = taxonomy.bySlug(goal.slug);
    const title = t(goal.cardKey);
    const lineKey = GOAL_CARD_LINES[goal.slug];
    return {
      slug: goal.slug,
      tone: GOAL_TONE[goal.slug] ?? 'peach',
      icon: goal.icon,
      title,
      line: lineKey ? t(lineKey) : '',
      to: link?.to ?? searchFallback(title),
      count: link?.count,
      image: link?.image,
    } satisfies NeedCardVM;
  });
}

/** The merchant's own `categories` selection - the legacy `ox-categories` field, read unchanged. */
function buildSelectedTypeCards(rows: unknown[], t: (key: string) => string): NeedCardVM[] {
  return rows
    .map((row, index) => {
      const label = rowText(row, 'name');
      const url = rowText(row, 'url');
      const image = rowText(row, 'image');
      const slug = TYPE_PANE_SLUGS.find((candidate) => url && matchesSlug(url, candidate));
      const content = slug ? categoryBySlug(slug) : undefined;
      const node = slug ? nodeBySlug(slug) : undefined;
      const title = node ? t(node.nameKey) : label;
      return {
        slug: slug ?? `merchant-${index}`,
        tone: (slug && TYPE_TONE[slug]) || 'ash',
        icon: content?.icon ?? 'protein',
        title,
        line: slug && TYPE_LINE_KEY[slug] ? t(TYPE_LINE_KEY[slug]) : '',
        to: url || searchFallback(label),
        image: image || undefined,
      } satisfies NeedCardVM;
    })
    .filter((card) => card.title !== '');
}

function buildDefaultTypeCards(taxonomy: TaxonomyLinks, t: (key: string) => string): NeedCardVM[] {
  return TYPE_PANE_SLUGS.map((slug) => {
    const link = taxonomy.bySlug(slug);
    const content = categoryBySlug(slug);
    const node = nodeBySlug(slug);
    const title = node ? t(node.nameKey) : slug;
    return {
      slug,
      tone: TYPE_TONE[slug] ?? 'ash',
      icon: content?.icon ?? 'protein',
      title,
      line: TYPE_LINE_KEY[slug] ? t(TYPE_LINE_KEY[slug]) : '',
      to: link?.to ?? searchFallback(title),
      count: link?.count,
      image: link?.image,
    } satisfies NeedCardVM;
  });
}

function buildTypeCards(
  data: OxBlockData,
  taxonomy: TaxonomyLinks,
  t: (key: string) => string
): NeedCardVM[] {
  const selected = fieldList(data, 'categories');
  return selected.length > 0
    ? buildSelectedTypeCards(selected, t)
    : buildDefaultTypeCards(taxonomy, t);
}

interface NeedsGridProps {
  cards: NeedCardVM[];
  variant: 'goals' | 'types';
}

function NeedsGrid({ cards, variant }: NeedsGridProps) {
  const gridRef = useSectionReveal<HTMLUListElement>();
  return (
    <ul
      className={`ox-needs__grid ox-needs__grid--${variant} ox-reveal`}
      ref={gridRef}
      role="list"
    >
      {cards.map((card, index) => (
        <li key={card.slug} style={{ ['--i' as string]: String(index) }}>
          <NeedCard
            slug={card.slug}
            tone={card.tone}
            icon={card.icon}
            title={card.title}
            line={card.line}
            to={card.to}
            count={card.count}
            image={card.image}
            index={index}
          />
        </li>
      ))}
    </ul>
  );
}

export function OxNeeds({ data }: OxBlockProps) {
  const { t } = useTranslation();
  const taxonomy = useTaxonomyLinks();
  const isPrimary = useClaimPrimaryNeedsSlot();

  const goalCards = useMemo(() => buildGoalCards(taxonomy, t), [taxonomy, t]);
  const typeCards = useMemo(() => buildTypeCards(data, taxonomy, t), [data, taxonomy, t]);

  if (!isPrimary) return null;

  const items: TabItem[] = [
    {
      id: 'goals',
      label: t('ox.home.needs_tab_goal'),
      children: <NeedsGrid cards={goalCards} variant="goals" />,
    },
    {
      id: 'types',
      label: t('ox.home.needs_tab_type'),
      children: <NeedsGrid cards={typeCards} variant="types" />,
    },
  ];

  return (
    <section className="ox-needs" data-testid="ox-needs">
      <div className="ox-container">
        <SectionHeader
          title={t('ox.home.needs_title')}
          subline={t('ox.home.needs_subline')}
          viewAll={{ to: '/categories' }}
        />
        <Tabs
          items={items}
          defaultTab="goals"
          label={t('ox.home.needs_title')}
          className="ox-needs__toggle"
        />
      </div>
    </section>
  );
}
