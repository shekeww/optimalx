import React, { useEffect, useState } from 'react';
import { createFileRoute } from '@tanstack/react-router';
import {
  SallaButton,
  SallaBadge,
  SallaAlert,
  SallaRatingStars,
  SallaQuantityInput,
  SallaTooltip,
  SallaProgressBar,
  SallaPriceRange,
  SallaAccordion,
  SallaAccordionHead,
  SallaAccordionBody,
  SallaLoading,
  SallaPlaceholder,
  ProductCardSkeleton,
  CardSkeleton,
  InputSkeleton,
  CircleSkeleton,
  SkeletonPulse,
  HydrationBoundary,
} from '@salla.sa/twilight-components-react';

/**
 * Kitchen sink — every component in every state, on one page.
 *
 * Dev-only. A published theme must not expose this route: it is a test fixture,
 * not a storefront page, and Salla's theme review treats stray routes as a
 * defect. The guard mirrors the DevSettingsWidget gate in __root.tsx — it is
 * checked at render rather than at route level so the route tree stays static.
 *
 * Copy here is hardcoded on purpose and does NOT belong in locales/ar.json.
 * These are fixtures chosen to stress the renderer (longest real product name,
 * Arabic-Indic vs Western numerals, a 3-line title), not UI strings a merchant
 * or translator would ever edit. Adding ~60 keys to the locale files for a page
 * that never ships would be noise in the thing translators actually read.
 */
export const Route = createFileRoute('/{-$locale}/kitchen-sink')({
  component: KitchenSink,
});

/** Candidate radii for the open radius decision, plus what ships today. */
const RADIUS_OPTIONS = [
  { value: '0px', label: 'square' },
  { value: '4px', label: '4px' },
  { value: '8px', label: '8px' },
  { value: '12px', label: '12px' },
  { value: '16px', label: '16px — current default' },
];

/** Every custom property the brand depends on, and who is expected to own it. */
const TRACKED_VARS = [
  { name: '--font-main', owner: 'Salla (inline on <html>)' },
  { name: '--font-ar', owner: 'tokens.css' },
  { name: '--color-primary', owner: 'Salla (inline on <html>)' },
  { name: '--color-primary-dark', owner: 'Salla (inline on <html>)' },
  { name: '--color-primary-light', owner: 'Salla (inline on <html>)' },
  { name: '--color-primary-reverse', owner: 'Salla (inline on <html>)' },
  { name: '--color-primary-rgb', owner: 'tokens.css' },
];

const TYPE_SCALE = [
  { size: 44, weight: 800, label: 'display' },
  { size: 32, weight: 700, label: 'display sm' },
  { size: 24, weight: 700, label: 'h2' },
  { size: 17, weight: 600, label: 'h3' },
  { size: 15, weight: 400, label: 'body' },
  { size: 13, weight: 400, label: 'small' },
];

/** A real catalogue-length Arabic name — short placeholders hide RTL wrapping bugs. */
const LONG_AR_NAME = 'مكمل غذائي واي بروتين أيزوليت بنكهة الشوكولاتة البلجيكية الفاخرة — عبوة 2 كجم';

/**
 * Section chrome is English, so it is explicitly dir="ltr". The document is
 * dir="rtl" (Arabic is the store's primary locale), and without this the Latin
 * punctuation reorders — a trailing full stop renders at the start of the line.
 * The Arabic fixtures below deliberately stay in the inherited RTL direction;
 * that is the thing under test.
 */
function Section({ title, note, children }: { title: string; note?: string; children: React.ReactNode }) {
  return (
    <section dir="ltr" style={{ marginBlockEnd: 48, textAlign: 'start' }}>
      <h2 style={{ fontSize: 24, fontWeight: 700, letterSpacing: '-0.025em', marginBlockEnd: note ? 4 : 16 }}>
        {title}
      </h2>
      {note && <p style={{ fontSize: 13, color: '#5A5A61', marginBlockEnd: 16, lineHeight: 1.6 }}>{note}</p>}
      {children}
    </section>
  );
}

function Row({ children }: { children: React.ReactNode }) {
  return <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center' }}>{children}</div>;
}

/** Reads what the browser actually computed, which is the only honest source. */
function useComputedVars() {
  const [vars, setVars] = useState<Record<string, string> | null>(null);
  useEffect(() => {
    const cs = getComputedStyle(document.documentElement);
    const out: Record<string, string> = {};
    for (const v of TRACKED_VARS) out[v.name] = cs.getPropertyValue(v.name).trim() || '(unset)';
    setVars(out);
  }, []);
  return vars;
}

function KitchenSink() {
  const vars = useComputedVars();
  const [radius, setRadius] = useState('16px');

  if (!import.meta.env.DEV) {
    return (
      <main style={{ padding: 48, textAlign: 'center' }}>
        <p>Not found.</p>
      </main>
    );
  }

  return (
    <main
      dir="ltr"
      style={{
        padding: '32px 16px',
        maxWidth: 1200,
        marginInline: 'auto',
        fontFamily: 'var(--font-main)',
        textAlign: 'start',
      }}
    >
      <h1 style={{ fontSize: 32, fontWeight: 800, letterSpacing: '-0.035em', marginBlockEnd: 8 }}>
        Kitchen sink
      </h1>
      <p style={{ fontSize: 15, color: '#5A5A61', marginBlockEnd: 40, lineHeight: 1.7 }}>
        Dev-only. Every value below is read from the running page, not from a spec.
      </p>

      <Section
        title="Radius — open decision"
        note="One value drives all of it: borderRadius.DEFAULT in tailwind.config.cjs. Verified to propagate into Salla's own components (s-product-card and s-button-element both render it), so this is a single-lever change like the colour was."
      >
        <Row>
          {RADIUS_OPTIONS.map((o) => (
            <button
              key={o.value}
              onClick={() => setRadius(o.value)}
              style={{
                padding: '8px 14px',
                minHeight: 44,
                border: `1px solid ${radius === o.value ? 'var(--color-primary)' : '#D2D2D8'}`,
                background: radius === o.value ? 'var(--color-primary)' : '#FFF',
                color: radius === o.value ? '#FFF' : '#17171A',
                borderRadius: 6,
                cursor: 'pointer',
                fontFamily: 'inherit',
                fontSize: 13,
              }}
            >
              {o.label}
            </button>
          ))}
        </Row>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 16, marginBlockStart: 24 }}>
          {['card', 'button', 'input', 'badge'].map((kind) => (
            <div key={kind} dir="rtl" style={{ border: '1px solid #E6E6E9', borderRadius: 8, padding: 16 }}>
              <p style={{ fontSize: 11, fontWeight: 600, color: '#8A8A93', marginBlockEnd: 12 }}>{kind}</p>
              {kind === 'card' && (
                <div style={{ border: '1px solid #E6E6E9', borderRadius: radius, overflow: 'hidden' }}>
                  <div style={{ height: 96, background: '#F7F7F8' }} />
                  <div style={{ padding: 12 }}>
                    <p style={{ fontSize: 15, lineHeight: 1.5, margin: 0 }}>واي بروتين</p>
                    <p style={{ fontSize: 15, fontWeight: 700, margin: '4px 0 0' }}>349.00</p>
                  </div>
                </div>
              )}
              {kind === 'button' && (
                <button
                  style={{
                    background: 'var(--color-primary)',
                    color: '#FFF',
                    border: 0,
                    padding: '12px 20px',
                    minHeight: 44,
                    borderRadius: radius,
                    fontFamily: 'inherit',
                    fontSize: 15,
                    width: '100%',
                  }}
                >
                  أضف إلى السلة
                </button>
              )}
              {kind === 'input' && (
                <input
                  defaultValue="ابحث عن منتج"
                  style={{
                    width: '100%',
                    padding: '12px',
                    minHeight: 44,
                    border: '1px solid #D2D2D8',
                    borderRadius: radius,
                    fontFamily: 'inherit',
                    fontSize: 15,
                  }}
                />
              )}
              {kind === 'badge' && (
                <span
                  style={{
                    display: 'inline-block',
                    background: 'rgba(var(--color-primary-rgb), 0.12)',
                    color: 'var(--color-primary)',
                    padding: '4px 10px',
                    borderRadius: radius,
                    fontSize: 11,
                    fontWeight: 600,
                  }}
                >
                  الأكثر مبيعاً
                </span>
              )}
            </div>
          ))}
        </div>
      </Section>

      <Section
        title="Tokens — declared vs computed"
        note="Salla writes theme settings as an inline style on <html>, which outranks every stylesheet. Anything marked Salla below is NOT coming from tokens.css, whatever tokens.css says."
      >
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ textAlign: 'start' }}>
              <th style={{ padding: 8, borderBlockEnd: '1px solid #E6E6E9', textAlign: 'start' }}>variable</th>
              <th style={{ padding: 8, borderBlockEnd: '1px solid #E6E6E9', textAlign: 'start' }}>computed</th>
              <th style={{ padding: 8, borderBlockEnd: '1px solid #E6E6E9', textAlign: 'start' }}>effective owner</th>
            </tr>
          </thead>
          <tbody>
            {TRACKED_VARS.map((v) => (
              <tr key={v.name}>
                <td style={{ padding: 8, borderBlockEnd: '1px solid #F0F0F2', fontFamily: 'monospace' }}>{v.name}</td>
                <td style={{ padding: 8, borderBlockEnd: '1px solid #F0F0F2' }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                    {v.name.includes('color') && !v.name.includes('rgb') && vars?.[v.name] && (
                      <span
                        style={{
                          width: 16,
                          height: 16,
                          borderRadius: 3,
                          background: vars[v.name],
                          border: '1px solid #D2D2D8',
                        }}
                      />
                    )}
                    <code>{vars ? vars[v.name] : '…'}</code>
                  </span>
                </td>
                <td style={{ padding: 8, borderBlockEnd: '1px solid #F0F0F2', color: '#5A5A61' }}>{v.owner}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Section>

      <Section title="Type — Cairo" note="Arabic body text must not go below 15px / weight 400; the two smallest rows are the floor.">
        {TYPE_SCALE.map((t) => (
          <div key={t.label} style={{ display: 'flex', gap: 16, alignItems: 'baseline', marginBlockEnd: 12 }}>
            <code style={{ fontSize: 11, color: '#8A8A93', minWidth: 90 }}>
              {t.label} {t.size}/{t.weight}
            </code>
            <span dir="rtl" style={{ fontSize: t.size, fontWeight: t.weight, letterSpacing: t.size >= 24 ? '-0.025em' : 'normal', lineHeight: 1.3 }}>
              قوة أداءك من كفاءة أدواتك
            </span>
          </div>
        ))}
      </Section>

      <Section title="SallaButton — native, every variant" note="Props verified against the package's own types: shape · color · fill · size · width · loading · disabled.">
        <Row>
          {(['solid', 'outline', 'none'] as const).map((fill) => (
            <SallaButton key={fill} fill={fill} color="primary">
              {fill}
            </SallaButton>
          ))}
        </Row>
        <div style={{ height: 12 }} />
        <Row>
          {(['small', 'medium', 'large'] as const).map((size) => (
            <SallaButton key={size} size={size} color="primary" fill="solid">
              {size}
            </SallaButton>
          ))}
        </Row>
        <div style={{ height: 12 }} />
        <Row>
          {(['primary', 'success', 'warning', 'danger', 'light', 'gray', 'dark'] as const).map((color) => (
            <SallaButton key={color} color={color} fill="solid">
              {color}
            </SallaButton>
          ))}
        </Row>
        <div style={{ height: 12 }} />
        <Row>
          <SallaButton color="primary" fill="solid" loading>
            loading
          </SallaButton>
          <SallaButton color="primary" fill="solid" disabled>
            disabled
          </SallaButton>
          <SallaButton color="primary" fill="solid" width="wide">
            wide
          </SallaButton>
          <SallaButton color="primary" fill="solid" href="#">
            as link
          </SallaButton>
        </Row>
      </Section>

      <Section
        title="Native components"
        note="Wrapped in the package's own HydrationBoundary. These are CDN-registered custom elements that populate their own shadow content on the client, so server HTML and client DOM never match — rendering them during SSR throws 'Hydration failed' and React discards the whole tree. forceHydrate mounts them straight after hydration instead of waiting for viewport intersection."
      >
        <div dir="rtl">
          <HydrationBoundary forceHydrate fallback={<SkeletonPulse />}>
          <Row>
            <SallaBadge>جديد</SallaBadge>
            <SallaRatingStars value={4} />
            <SallaQuantityInput value={1} max={10} />
            <SallaTooltip>تلميح</SallaTooltip>
            <SallaLoading />
          </Row>
          <div style={{ height: 16 }} />
          <SallaProgressBar value={60} />
          <div style={{ height: 16 }} />
          <SallaPriceRange />
          <div style={{ height: 16 }} />
          <SallaAlert>تنبيه — المخزون منخفض</SallaAlert>
          <div style={{ height: 16 }} />
          <SallaAccordion>
            <SallaAccordionHead>الأسئلة الشائعة</SallaAccordionHead>
            <SallaAccordionBody>
              <p style={{ fontSize: 15, lineHeight: 1.7 }}>نص الإجابة.</p>
            </SallaAccordionBody>
          </SallaAccordion>
        </HydrationBoundary>
        </div>
      </Section>

      <Section title="Loading — skeletons, never spinners">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16 }}>
          <ProductCardSkeleton />
          <CardSkeleton />
          <div>
            <InputSkeleton />
            <div style={{ height: 12 }} />
            <CircleSkeleton />
            <div style={{ height: 12 }} />
            <SkeletonPulse />
          </div>
        </div>
      </Section>

      <Section title="Empty state">
        <SallaPlaceholder />
      </Section>

      <Section
        title="RTL stress"
        note="Longest realistic catalogue name, at card width. Placeholder text hides wrapping and truncation bugs, so this uses a real one."
      >
        <div dir="rtl" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 16 }}>
          {[1, 2, 3].map((i) => (
            <div key={i} style={{ border: '1px solid #E6E6E9', borderRadius: radius, padding: 12 }}>
              <div style={{ height: 120, background: '#F7F7F8', borderRadius: radius, marginBlockEnd: 12 }} />
              <p style={{ fontSize: 15, lineHeight: 1.5, margin: 0 }}>{LONG_AR_NAME}</p>
              <p style={{ fontSize: 15, fontWeight: 700, margin: '8px 0 0' }}>349.00 ر.س</p>
            </div>
          ))}
        </div>
      </Section>
    </main>
  );
}
