import type { ReactNode } from 'react';
import { OxHero } from './OxHero';
import { OxTrustStrip } from './OxTrustStrip';
import { OxGoals } from './OxGoals';
import { OxCategories } from './OxCategories';
import { OxProducts } from './OxProducts';
import { OxBrands } from './OxBrands';
import { OxServices } from './OxServices';
import { OxGuides } from './OxGuides';
import { OxBranchBlock } from './OxBranchBlock';
import { OxFaq } from './OxFaq';
import { OxNewsletterBlock } from './OxNewsletterBlock';
import { OxBanner } from './OxBanner';
import { HomeSkeleton } from './HomeSkeleton';
import { HOME_BLOCK_FIELDS, HOME_BLOCK_HEIGHT_CSS, type OxBlockData } from './defaults';

// Dev-only fixtures. Section chrome is English and hardcoded on purpose, the
// contract `app/routes/kitchen-sink.tsx` states: this page is a test fixture,
// not a storefront page, so its labels never enter locales/.

function block(path: keyof typeof HOME_BLOCK_FIELDS, extra: Record<string, unknown> = {}): OxBlockData {
  return { path, key: `ks-${path}`, ...HOME_BLOCK_FIELDS[path], ...extra } as OxBlockData;
}

function Panel({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section dir="ltr" style={{ marginBlockEnd: 48, textAlign: 'start' }}>
      <h2 style={{ fontSize: 20, fontWeight: 700, marginBlockEnd: 16 }}>{title}</h2>
      <div dir="rtl">{children}</div>
    </section>
  );
}

/** The twelve home blocks (B2), each in the state DIRECTION 6.2 reserves for it. */
export function KitchenSink() {
  return (
    <div>
      <Panel title="Reserved heights (DIRECTION 6.2, register.ts)">
        <table dir="ltr" style={{ fontSize: 13 }}>
          <tbody>
            {Object.entries(HOME_BLOCK_HEIGHT_CSS).map(([path, height]) => (
              <tr key={path}>
                <td style={{ paddingInlineEnd: 16 }}>{path}</td>
                <td>{height}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Panel>

      <Panel title="OxHero, no upload (the theme photograph, art directed per breakpoint)">
        <OxHero data={block('ox-hero')} />
      </Panel>

      <Panel title="OxTrustStrip (the shared statistic strip; one panel open at a time)">
        <OxTrustStrip data={block('ox-trust-strip')} />
      </Panel>

      <Panel title="OxGoals (settle runs once when 30% in view)">
        <OxGoals data={block('ox-goals')} />
      </Panel>

      <Panel title="OxCategories (eight tiles, sprite while artwork is missing)">
        <OxCategories data={block('ox-categories')} />
      </Panel>

      <Panel title="OxProducts (latest, engine card through the registry)">
        <OxProducts data={block('ox-products')} />
      </Panel>

      <Panel title="OxBrands (hidden under four brands)">
        <OxBrands data={block('ox-brands')} />
      </Panel>

      <Panel title="OxServices (photographic band, one wedge, the lockup, three channels)">
        <OxServices data={block('ox-services')} />
      </Panel>

      <Panel title="OxGuides (hidden under three articles)">
        <OxGuides data={block('ox-guides')} />
      </Panel>

      <Panel title="OxBranch (home heading level)">
        <OxBranchBlock data={block('ox-branch')} />
      </Panel>

      <Panel title="OxFaq (price item first)">
        <OxFaq data={block('ox-faq')} />
      </Panel>

      <Panel title="OxNewsletter (hidden unless show_newsletter)">
        <OxNewsletterBlock data={block('ox-newsletter')} />
      </Panel>

      <Panel title="OxBanner, empty then filled">
        <OxBanner data={block('ox-banner')} />
        <OxBanner data={block('ox-banner', { line: 'Campaign line', url: '/offers' })} />
      </Panel>

      <Panel title="Home skeleton (route pending state)">
        <HomeSkeleton />
      </Panel>
    </div>
  );
}

export default KitchenSink;
