import { Suspense, lazy, useEffect, useState, type ComponentType } from 'react';
import { createFileRoute } from '@tanstack/react-router';

/**
 * Kitchen sink: every component in every state, one section per batch.
 *
 * Dev-only. A published theme must not expose this route: it is a test
 * fixture, not a storefront page, and Salla's theme review treats stray routes
 * as a defect. The guard mirrors the DevSettingsWidget gate in `__root.tsx`,
 * checked at render rather than at route level so the route tree stays static.
 *
 * Each batch owns `app/components/<dir>/KitchenSink.tsx` and nobody else edits
 * it (PLAN-final C16); this file only lazy-imports the eight fixed paths, so
 * two builders never touch the same file. A directory whose batch has not
 * landed exports a component that renders nothing.
 *
 * Copy in these sections is hardcoded on purpose and does NOT belong in
 * `locales/`: the strings are fixtures chosen to stress the renderer (the
 * longest real product name, Western numerals, a three-line title), not UI
 * strings a merchant or translator would ever edit. `check:strings` allowlists
 * the kitchen-sink files for that reason, and only those.
 */
export const Route = createFileRoute('/{-$locale}/kitchen-sink')({
  component: KitchenSinkRoute,
});

interface SectionDefinition {
  id: string;
  title: string;
  batch: string;
  Component: ComponentType;
}

const SECTIONS: SectionDefinition[] = [
  {
    id: 'common',
    title: 'Common primitives',
    batch: 'P1a',
    Component: lazy(() => import('../components/common/KitchenSink')),
  },
  {
    id: 'blocks',
    title: 'Shared blocks',
    batch: 'P1b',
    Component: lazy(() => import('../components/blocks/KitchenSink')),
  },
  {
    id: 'layout',
    title: 'Chrome and layout',
    batch: 'B1',
    Component: lazy(() => import('../components/layout/KitchenSink')),
  },
  {
    id: 'home',
    title: 'Home blocks',
    batch: 'B2',
    Component: lazy(() => import('../components/home/KitchenSink')),
  },
  {
    id: 'product',
    title: 'Product page and card',
    batch: 'B3',
    Component: lazy(() => import('../components/product/KitchenSink')),
  },
  {
    id: 'listing',
    title: 'Listing, goals and search',
    batch: 'B4',
    Component: lazy(() => import('../components/listing/KitchenSink')),
  },
  {
    id: 'pages',
    title: 'Pages, errors and forms',
    batch: 'B5',
    Component: lazy(() => import('../components/pages/KitchenSink')),
  },
  {
    id: 'commerce',
    title: 'Cart, account and thank-you',
    batch: 'B6',
    Component: lazy(() => import('../components/commerce/KitchenSink')),
  },
];

/** The four Cairo weights the design depends on (DIRECTION 3). */
const FONT_CHECKS = ['400 16px Cairo', '600 16px Cairo', '700 16px Cairo', '800 16px Cairo'];

interface Probe {
  fonts: { spec: string; ok: boolean }[];
  html: string;
  body: string;
  paper: string;
  groundOk: boolean;
}

/**
 * Reads what the browser actually computed. Two assertions live here:
 *   - DIRECTION 3: 600 and 800 fall back silently until the dashboard font is
 *     switched to the custom upload, so a failing weight is shown in red.
 *   - DIRECTION 10.1 rule 7: html and body backgrounds equal the route ground
 *     (`--ox-paper`), so an overscroll at the page end shows paper.
 */
function useProbe(): Probe | null {
  const [probe, setProbe] = useState<Probe | null>(null);
  useEffect(() => {
    const root = document.documentElement;
    const paper = getComputedStyle(root).getPropertyValue('--ox-paper').trim();
    const html = getComputedStyle(root).backgroundColor;
    const body = getComputedStyle(document.body).backgroundColor;
    const fonts = FONT_CHECKS.map((spec) => ({
      spec,
      ok: typeof document.fonts?.check === 'function' ? document.fonts.check(spec) : false,
    }));
    setProbe({ fonts, html, body, paper, groundOk: sameColour(html, body, paper) });
  }, []);
  return probe;
}

/**
 * Compares computed colours without a colour library: the probe only needs to
 * know whether both surfaces resolve to the paper token, so the token is
 * rendered on a throwaway element and the three results compared as strings.
 */
function sameColour(html: string, body: string, paper: string): boolean {
  if (typeof document === 'undefined') return false;
  const probe = document.createElement('div');
  probe.style.backgroundColor = paper;
  document.body.appendChild(probe);
  const resolved = getComputedStyle(probe).backgroundColor;
  probe.remove();
  return html === resolved && body === resolved;
}

function Banner({ probe }: { probe: Probe | null }) {
  if (!probe) return null;
  const failingFonts = probe.fonts.filter((font) => !font.ok);
  const failing = failingFonts.length > 0 || !probe.groundOk;
  return (
    <div
      dir="ltr"
      role="status"
      style={{
        marginBlockEnd: 24,
        padding: 12,
        border: `1px solid ${failing ? 'var(--ox-stop)' : 'var(--ox-go)'}`,
        background: failing ? 'var(--ox-stop-soft)' : 'var(--ox-go-soft)',
        borderRadius: 8,
        fontSize: 13,
        lineHeight: 1.7,
      }}
    >
      <p style={{ margin: 0 }}>
        <strong>Fonts</strong>{' '}
        {probe.fonts.map((font) => `${font.spec}: ${font.ok ? 'ok' : 'MISSING'}`).join(' · ')}
        {failingFonts.length > 0
          ? ' — display falls back to 700 at the same size and line height (DIRECTION 3).'
          : ''}
      </p>
      <p style={{ margin: '4px 0 0' }}>
        <strong>Ground</strong> html {probe.html} · body {probe.body} · --ox-paper {probe.paper} ·{' '}
        {probe.groundOk ? 'ok' : 'MISMATCH (DIRECTION 10.1 rule 7)'}
      </p>
    </div>
  );
}

function SectionFallback({ title }: { title: string }) {
  return (
    <p dir="ltr" style={{ fontSize: 13, color: 'var(--ox-fg-3)' }}>
      Loading {title}…
    </p>
  );
}

function KitchenSinkRoute() {
  const probe = useProbe();

  if (!import.meta.env.DEV) {
    return (
      <main style={{ padding: 48, textAlign: 'center' }}>
        <p>Not found.</p>
      </main>
    );
  }

  return (
    <main
      style={{
        padding: '32px 16px',
        maxInlineSize: 1200,
        marginInline: 'auto',
        fontFamily: 'var(--font-main)',
        textAlign: 'start',
      }}
    >
      <h1 dir="ltr" className="ox-h1" style={{ marginBlockEnd: 8 }}>
        Kitchen sink
      </h1>
      <p dir="ltr" style={{ fontSize: 15, color: 'var(--ox-fg-2)', marginBlockEnd: 24 }}>
        Dev-only. Every value below is read from the running page, not from a spec.
      </p>

      <Banner probe={probe} />

      <nav dir="ltr" style={{ marginBlockEnd: 32 }}>
        <ul style={{ display: 'flex', flexWrap: 'wrap', gap: 12, listStyle: 'none', padding: 0 }}>
          {SECTIONS.map((section) => (
            <li key={section.id}>
              <a href={`#ks-${section.id}`} style={{ fontSize: 13 }}>
                {section.title}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      {SECTIONS.map((section) => (
        <section
          key={section.id}
          id={`ks-${section.id}`}
          style={{
            marginBlockEnd: 64,
            paddingBlockStart: 24,
            borderBlockStart: '1px solid var(--ox-bd)',
          }}
        >
          <h2 dir="ltr" className="ox-h2" style={{ marginBlockEnd: 4 }}>
            {section.title}
          </h2>
          <p dir="ltr" style={{ fontSize: 12, color: 'var(--ox-fg-3)', marginBlockEnd: 20 }}>
            {`app/components/${section.id}/KitchenSink.tsx · batch ${section.batch}`}
          </p>
          <Suspense fallback={<SectionFallback title={section.title} />}>
            <section.Component />
          </Suspense>
        </section>
      ))}
    </main>
  );
}
