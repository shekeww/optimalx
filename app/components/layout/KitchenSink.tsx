import { useEffect, useState, type ReactNode } from 'react';
import { openMobileDrawer } from './Header/Header';

/**
 * The chrome is already on the page (the layout renders it), so duplicating a
 * header here would duplicate the landmarks the checklist counts. This section
 * measures the real thing instead and exposes the two controls that are hard
 * to reach by hand.
 *
 * Section chrome is English and hardcoded, the same contract
 * `app/routes/kitchen-sink.tsx` states for a dev-only fixture page.
 */
const PROBES: Array<{ label: string; selector: string; expected: string }> = [
  { label: 'announcement', selector: '.ox-announce', expected: '40 mobile / 36 desktop' },
  { label: 'utility bar', selector: '.ox-utility__inner', expected: '0 mobile / 36 desktop' },
  { label: 'main bar (desktop)', selector: '.ox-mainbar__inner', expected: '0 mobile / 72 desktop' },
  { label: 'mobile bar', selector: '.ox-mobilebar__row', expected: '56 mobile / 0 desktop' },
  { label: 'nav row', selector: '.ox-nav__inner', expected: '0 mobile / 48 desktop' },
  { label: 'header total', selector: '.store-header', expected: '96 mobile / 192 desktop' },
  { label: 'tab bar', selector: '.ox-tabbar', expected: '56 plus safe area / 0 desktop' },
  { label: 'footer', selector: '.store-footer', expected: '640 mobile / 720 desktop' },
];

function useMeasured() {
  const [rows, setRows] = useState<Array<{ label: string; height: number; expected: string }>>([]);
  useEffect(() => {
    const read = () =>
      setRows(
        PROBES.map((probe) => ({
          label: probe.label,
          expected: probe.expected,
          height: Math.round(
            document.querySelector(probe.selector)?.getBoundingClientRect().height ?? 0
          ),
        }))
      );
    read();
    window.addEventListener('resize', read);
    return () => window.removeEventListener('resize', read);
  }, []);
  return rows;
}

function Panel({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section dir="ltr" style={{ marginBlockEnd: 48, textAlign: 'start' }}>
      <h2 style={{ fontSize: 20, fontWeight: 700, marginBlockEnd: 16 }}>{title}</h2>
      {children}
    </section>
  );
}

/** Chrome (B1): measured heights and the controls that open the overlays. */
export function KitchenSink() {
  const rows = useMeasured();

  return (
    <div>
      <Panel title="Chrome heights, measured from the live layout">{/* ox-allow: latin-sentence */}
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr>
              <th style={{ padding: 8, textAlign: 'start', borderBlockEnd: '1px solid #E6E6E9' }}>block</th>
              <th style={{ padding: 8, textAlign: 'start', borderBlockEnd: '1px solid #E6E6E9' }}>measured</th>
              <th style={{ padding: 8, textAlign: 'start', borderBlockEnd: '1px solid #E6E6E9' }}>spec</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.label}>
                <td style={{ padding: 8, borderBlockEnd: '1px solid #F0F0F2' }}>{row.label}</td>
                <td style={{ padding: 8, borderBlockEnd: '1px solid #F0F0F2' }}>
                  <code>{row.height}</code>
                </td>
                <td style={{ padding: 8, borderBlockEnd: '1px solid #F0F0F2', color: '#5A5A61' }}>
                  {row.expected}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Panel>

      <Panel title="Overlays">{/* ox-allow: latin-sentence */}
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <button type="button" style={{ minHeight: 44, padding: '0 16px' }} onClick={() => openMobileDrawer('goals')}>
            open drawer at goals
          </button>
          <button
            type="button"
            style={{ minHeight: 44, padding: '0 16px' }}
            onClick={() => openMobileDrawer('categories')}
          >
            open drawer at categories
          </button>
        </div>
        <p style={{ fontSize: 13, color: '#5A5A61', marginBlockStart: 12, lineHeight: 1.6 }}>
          The drawer is not in the DOM while closed, so an element count before and after is the
          check for render-budget rule 6. Tab once from the top of the page to reach the skip link;
          it lands on <code>#main-content</code>.
        </p>
      </Panel>
    </div>
  );
}

export default KitchenSink;
