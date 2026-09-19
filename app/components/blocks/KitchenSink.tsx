import type { ReactNode } from 'react';
import type { ArticleSummary } from '@salla.sa/twilight-theme-engine/routes/blog';
import { ChannelCard } from './ChannelCard';
import { GuideCard } from './GuideCard';
import { HoursTable } from './HoursTable';
import { OxBranch } from './OxBranch';
import { OxNewsletter } from './OxNewsletter';
import { ProductsSliderWrapper } from './ProductsSliderWrapper';
import { parseBranchHours } from '../../content/branch';
import { SERVICE_CHANNELS } from '../../content/services';

// Dev-only fixtures. Section chrome is English and hardcoded on purpose, the
// same contract `app/routes/kitchen-sink.tsx` states: this page is a test
// fixture, not a storefront page, so its labels never enter locales/.
const HOURS_FIXTURE = [
  'الأحد إلى الخميس: 09:00 - 23:00', // ox-allow: arabic-literal
  'الجمعة: 16:00 - 23:00', // ox-allow: arabic-literal
  'السبت: 10:00 - 23:00', // ox-allow: arabic-literal
].join('\n');

const ARTICLE_FIXTURE = {
  id: 'kitchen-sink',
  name: 'متى آخذ الكرياتين وكيف أستخدمه بالطريقة الصحيحة', // ox-allow: arabic-literal
  url: '/blog',
  author: { name: 'اوبتيمال اكس', url: '/about' }, // ox-allow: arabic-literal
  tags: [{ id: 1, name: 'الكرياتين', url: '/blog' }], // ox-allow: arabic-literal
} as unknown as ArticleSummary;

function Panel({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section dir="ltr" style={{ marginBlockEnd: 48, textAlign: 'start' }}>
      <h2 style={{ fontSize: 20, fontWeight: 700, marginBlockEnd: 16 }}>{title}</h2>
      <div dir="rtl">{children}</div>
    </section>
  );
}

/** Shared blocks (P1b), every one in the states DIRECTION 5.2 names. */
export function KitchenSink() {
  const rows = parseBranchHours(HOURS_FIXTURE);
  // A Thursday inside opening hours, so the "today" row and the open chip both show.
  const now = new Date('2026-09-17T12:00:00');

  return (
    <div>
      <Panel title="HoursTable: parsed rows, pinned clock">{/* ox-allow: latin-sentence */}
        <HoursTable rows={rows} now={now} />
      </Panel>
      <Panel title="HoursTable: empty setting renders nothing">{/* ox-allow: latin-sentence */}
        <HoursTable rows={[]} />
      </Panel>
      <Panel title="OxBranch: on paper, h2 with the eyebrow (home)">{/* ox-allow: latin-sentence */}
        <OxBranch headingLevel="h2" now={now} />
      </Panel>
      <Panel title="OxBranch: on .ox-band-dark, h1, no eyebrow (branch page)">{/* ox-allow: latin-sentence */}
        <div className="ox-band-dark" style={{ padding: 24 }}>
          <OxBranch headingLevel="h1" showEyebrow={false} now={now} />
        </div>
      </Panel>
      <Panel title="ChannelCard: price comes from the live product">{/* ox-allow: latin-sentence */}
        <div className="ox-channels">
          {SERVICE_CHANNELS.map((channel) => (
            <ChannelCard key={channel.id} channel={channel} />
          ))}
        </div>
      </Panel>
      <Panel title="GuideCard: with and without a reading time">{/* ox-allow: latin-sentence */}
        <div className="ox-guides">
          <GuideCard article={ARTICLE_FIXTURE} readMinutes={4} />
          <GuideCard article={ARTICLE_FIXTURE} />
        </div>
      </Panel>
      <Panel title="OxNewsletter: forced on (the setting ships off)">{/* ox-allow: latin-sentence */}
        <OxNewsletter enabled subscribe={async () => {}} />
      </Panel>
      <Panel title="ProductsSliderWrapper: hides itself when empty">{/* ox-allow: latin-sentence */}
        <ProductsSliderWrapper source="latest" sliderId="ox-kitchen-sink-rail" perPage={8} />
      </Panel>
    </div>
  );
}

export default KitchenSink;
