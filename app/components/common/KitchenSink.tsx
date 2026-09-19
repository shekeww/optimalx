import { useState, type ReactNode } from 'react';
import { Accordion } from './Accordion';
import { Badge, BadgeStack, type BadgeTone } from './Badge';
import { Band } from './Band';
import { Bdi } from './Bdi';
import { Button, type ButtonSize, type ButtonVariant } from './Button';
import { Chip, ChipRow } from './Chip';
import { EmptyState } from './EmptyState';
import { Icon, OX_ICON_NAMES, type OxIconSize } from './Icon';
import { Panel, PanelRow, PanelRowGroup } from './Panel';
import { Price } from './Price';
import { SectionHeader } from './SectionHeader';
import { Skeleton, SkeletonBar, SkeletonBlock, SkeletonCircle } from './Skeleton';
import { Sprite } from './Sprite';
import { StatStrip } from './StatStrip';
import { Table, TableWrap } from './Table';
import { Tabs } from './Tabs';
import { Tooltip } from './Tooltip';

/**
 * The common-primitives section of the kitchen sink (PLAN-final C16): every
 * primitive in every state, at 390 and 1440, on paper and inside a dark band.
 *
 * Dev-only fixture. Section chrome is English and the Arabic strings are
 * deliberate stress cases (the longest real catalogue name, a Latin product
 * name inside Arabic copy, Western numerals), not UI copy; they never enter
 * `locales/`, which is why `check:strings` allowlists the kitchen-sink files.
 */

/** A real catalogue-length Arabic name; short placeholders hide wrapping bugs. */
const LONG_AR_NAME =
  'مكمل غذائي واي بروتين ايزوليت بنكهة الشوكولاتة البلجيكية الفاخرة، عبوة 2 كجم';
const AR_SENTENCE = 'سكوب واحد يعطي 24 غراما من البروتين مع 120 سعرة.';
const LATIN_NAME = 'Optimum Nutrition Gold Standard';

const VARIANTS: ButtonVariant[] = ['primary', 'secondary', 'ghost', 'link'];
const SIZES: ButtonSize[] = [40, 44, 48];
const TONES: BadgeTone[] = ['popular', 'new', 'saving', 'note', 'stop', 'neutral'];
const ICON_SIZES: OxIconSize[] = [16, 20, 24, 32];

interface HoursFixture {
  day: string;
  from: string;
  to: string;
  servings: number;
}

const ROWS: HoursFixture[] = [
  { day: 'Sunday to Thursday', from: '16:00', to: '23:00', servings: 60 },
  { day: 'Friday', from: '16:30', to: '23:00', servings: 30 },
  { day: 'Saturday', from: '10:00', to: '23:00', servings: 74 },
];

function Block({ title, note, children }: { title: string; note?: string; children: ReactNode }) {
  return (
    <section dir="ltr" style={{ marginBlockEnd: 40 }}>
      <h3 style={{ fontSize: 17, fontWeight: 700, marginBlockEnd: note ? 4 : 12 }}>{title}</h3>
      {note ? (
        <p style={{ fontSize: 13, color: 'var(--ox-fg-3)', marginBlockEnd: 12, lineHeight: 1.6 }}>
          {note}
        </p>
      ) : null}
      <div dir="rtl">{children}</div>
    </section>
  );
}

function Row({ children }: { children: ReactNode }) {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center' }}>
      {children}
    </div>
  );
}

export function KitchenSink() {
  const [loading, setLoading] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [selectedChip, setSelectedChip] = useState(true);
  const [chips, setChips] = useState(['isolate', 'unflavoured']);

  return (
    <div>
      {/* The layout renders one sprite; this page carries its own so the
          section works even when opened before the chrome batch lands. */}
      <Sprite />

      <Block
        title="Sprite"
        note="Thirty-two symbols at 16, 20, 24 and 32. Each has exactly one accent element; none mirrors under RTL. A stray rounded join is a G2 finding."
      >
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
            gap: 12,
          }}
        >
          {OX_ICON_NAMES.map((name) => (
            <div
              key={name}
              style={{ display: 'flex', alignItems: 'center', gap: 8, minBlockSize: 44 }}
            >
              {ICON_SIZES.map((size) => (
                <Icon key={size} name={name} size={size} />
              ))}
              <code dir="ltr" style={{ fontSize: 11, color: 'var(--ox-fg-3)' }}>
                {name}
              </code>
            </div>
          ))}
        </div>
        <div className="ox-band-dark" style={{ marginBlockStart: 16, padding: 16 }}>
          <Row>
            {OX_ICON_NAMES.map((name) => (
              <Icon key={name} name={name} size={24} />
            ))}
          </Row>
        </div>
      </Block>

      <Block title="Button" note="Four variants, three heights, and every state.">
        {VARIANTS.map((variant) => (
          <div key={variant} style={{ marginBlockEnd: 12 }}>
            <Row>
              {SIZES.map((size) => (
                <Button key={size} variant={variant} size={size}>
                  {`${variant} ${size}`}
                </Button>
              ))}
            </Row>
          </div>
        ))}
        <Row>
          <Button disabled>disabled</Button>
          <Button ariaDisabled>aria-disabled</Button>
          <Button loading={loading} onClick={() => setLoading((value) => !value)}>
            toggle loading
          </Button>
          <Button
            confirmed={confirmed}
            confirmedLabel="تمت الإضافة"
            onClick={() => setConfirmed((value) => !value)}
          >
            أضف إلى السلة
          </Button>
          <Button iconStart={<Icon name="shipping" size={20} />}>with icon</Button>
          <Button href="https://example.com">as anchor</Button>
        </Row>
        <div style={{ marginBlockStart: 12 }}>
          <Button block>block</Button>
        </div>
        <div className="ox-band-dark" style={{ marginBlockStart: 16, padding: 16 }}>
          <Row>
            <Button>primary on dark</Button>
            <Button variant="secondary">secondary on dark</Button>
            <Button variant="ghost">ghost on dark</Button>
          </Row>
        </div>
      </Block>

      <Block title="Chip and Badge" note="Spec chips are static; filter chips are controls.">
        <ChipRow>
          <Chip icon="servings">60 حصة</Chip>
          <Chip icon="serving-size">31 غرام</Chip>
          <Chip icon="form">بودرة</Chip>
          <Chip icon="expiry" size="pdp">
            2027-04
          </Chip>
        </ChipRow>
        <div style={{ marginBlockStart: 12 }}>
          <ChipRow>
            <Chip kind="filter">بدون منبهات</Chip>
            <Chip
              kind="filter"
              selected={selectedChip}
              onClick={() => setSelectedChip((value) => !value)}
            >
              محلل مائيا
            </Chip>
            {chips.map((chip) => (
              <Chip
                key={chip}
                kind="filter"
                selected
                onRemove={() => setChips((current) => current.filter((value) => value !== chip))}
              >
                {chip}
              </Chip>
            ))}
          </ChipRow>
        </div>
        <div style={{ marginBlockStart: 12 }}>
          <Row>
            {TONES.map((tone) => (
              <Badge key={tone} tone={tone}>
                {tone}
              </Badge>
            ))}
          </Row>
        </div>
        <div style={{ marginBlockStart: 12, position: 'relative', inlineSize: 200, blockSize: 60 }}>
          <BadgeStack>
            <Badge tone="saving">وفر 15</Badge>
            <Badge tone="note">صلاحية قريبة</Badge>
          </BadgeStack>
        </div>
      </Block>

      <Block
        title="SectionHeader"
        note="The eyebrow renders only when it states a fact the heading lacks (amendment A4)."
      >
        <SectionHeader title="تسوق حسب هدفك" descriptor="ستة أهداف. كل هدف يقودك إلى ما يناسبه فقط." />
        <div style={{ marginBlockStart: 24 }}>
          <SectionHeader
            as="h3"
            eyebrow="الخالدية، المدينة المنورة"
            title="فرعنا في المدينة المنورة"
            viewAll={{ to: '/branch' }}
          />
        </div>
      </Block>

      <Block title="Price and Bdi" note="Money only through useMoney().format(), inside an isolate wrapper.">
        <Row>
          <Price amount={349} size="h2" />
          <Price amount={399} was />
          <Price amount={50} go />
          <Price amount={0} size="small" />
        </Row>
        <p style={{ marginBlockStart: 12 }}>
          {AR_SENTENCE} <Bdi>{LATIN_NAME}</Bdi>.
        </p>
        <p>
          رقم الطلب <Bdi ltr>#OX-2026-0042</Bdi>
        </p>
        <p style={{ maxInlineSize: 240 }}>{LONG_AR_NAME}</p>
      </Block>

      <Block
        title="Skeleton"
        note="Blocks are static plate; only the text bars of the one root in the viewport pulse (amendment A7). Scroll to watch the pulse move."
      >
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
          {[1, 2].map((n) => (
            <Skeleton key={n}>
              <SkeletonBlock height={160} />
              <div style={{ display: 'grid', gap: 8, marginBlockStart: 12 }}>
                <SkeletonBar width="80%" />
                <SkeletonBar width="60%" />
                <SkeletonCircle width={40} />
              </div>
            </Skeleton>
          ))}
        </div>
      </Block>

      <Block title="Accordion" note="One row open at a time; the last row is locked open and has no control.">
        <Accordion
          items={[
            { id: 'ks-acc-1', title: 'ما الفرق بين الايزوليت والكونسنتريت؟', children: <p>{AR_SENTENCE}</p> },
            { id: 'ks-acc-2', title: 'كم سكوب في اليوم؟', children: <p>{AR_SENTENCE}</p> },
            { id: 'ks-acc-3', title: 'تنبيه', children: <p>{AR_SENTENCE}</p>, locked: true },
          ]}
          defaultOpen={['ks-acc-1']}
        />
      </Block>

      <Block title="Tabs" note="Roving tabindex; ArrowLeft is next under RTL.">
        <Tabs
          label="kitchen sink tabs"
          items={[
            { id: 'facts', label: 'الحقائق الغذائية', children: <p>{AR_SENTENCE}</p> },
            { id: 'usage', label: 'طريقة الاستخدام', children: <p>{AR_SENTENCE}</p> },
            { id: 'reviews', label: 'التقييمات', children: <p>{AR_SENTENCE}</p> },
          ]}
        />
      </Block>

      <Block title="Table" note="Header 44 on plate, rows 48, numbers end-aligned, no zebra.">
        <Table<HoursFixture>
          caption="ساعات العمل"
          columns={[
            { id: 'day', header: 'اليوم', cell: (row) => row.day, rowHeader: true },
            { id: 'from', header: 'من', cell: (row) => row.from },
            { id: 'to', header: 'إلى', cell: (row) => row.to },
            { id: 'servings', header: 'الحصص', cell: (row) => row.servings, numeric: true },
          ]}
          rows={ROWS}
          rowKey={(row) => row.day}
          rowClassName={(row, index) => (index === 0 ? 'is-today' : undefined)}
        />
        <div style={{ marginBlockStart: 16 }}>
          <TableWrap>
            <Table<HoursFixture>
              scroll
              caption="جدول يتجاوز عرض الشاشة"
              captionHidden
              columns={[
                { id: 'day', header: 'اليوم', cell: (row) => row.day, rowHeader: true },
                { id: 'from', header: 'من', cell: (row) => row.from },
                { id: 'to', header: 'إلى', cell: (row) => row.to },
                { id: 'servings', header: 'الحصص', cell: (row) => row.servings, numeric: true },
              ]}
              rows={ROWS}
              rowKey={(row) => row.day}
            />
          </TableWrap>
        </div>
      </Block>

      <Block title="EmptyState and Tooltip" note="The tooltip never appears on touch.">
        <EmptyState
          icon="help"
          title="سلتك فارغة"
          body="ابدأ من هدفك، أو تصفح حسب النوع."
          primary={<Button>تسوق حسب هدفك</Button>}
          secondary={<Button variant="secondary">تصفح حسب النوع</Button>}
          footer={
            <ChipRow>
              <Chip kind="filter">واي بروتين</Chip>
              <Chip kind="filter">كرياتين</Chip>
            </ChipRow>
          }
        />
        <div style={{ marginBlockStart: 16 }}>
          <Row>
            <Tooltip label="أضف إلى المفضلة">
              <button type="button" className="ox-btn ox-btn--ghost ox-btn--s44" aria-label="أضف إلى المفضلة">
                <Icon name="tick" size={20} />
              </button>
            </Tooltip>
            <Tooltip label="شارك" placement="top">
              <button type="button" className="ox-btn ox-btn--ghost ox-btn--s44" aria-label="شارك">
                <Icon name="gift" size={20} />
              </button>
            </Tooltip>
          </Row>
        </div>
      </Block>

      <Block
        title="Panel, PanelRow and PanelRowGroup"
        note="The cream card with a hairline. The group stretches one to three panels to a common height and returns null at zero."
      >
        <PanelRowGroup>
          <Panel title="تفاصيل المنتج">
            <PanelRow label="العلامة التجارية" value={<Bdi>{LATIN_NAME}</Bdi>} />
            <PanelRow label="الحجم" value={<Bdi>907g</Bdi>} />
            <PanelRow label="عدد الحصص" value="32" />
          </Panel>
          <Panel title="ما الذي نساعدك فيه" tone="plate">
            <p className="ox-body">{AR_SENTENCE}</p>
          </Panel>
          <Panel title="مع إجراء" action={<Button variant="link">عرض الكل</Button>}>
            <p className="ox-body">{AR_SENTENCE}</p>
          </Panel>
        </PanelRowGroup>
        <PanelRowGroup>{null}</PanelRowGroup>
      </Block>

      <Block
        title="StatStrip"
        note="Every cell must trace to store data, a setting or a content map. Zero cells render nothing at all."
      >
        <StatStrip
          cells={[
            { id: 'a', value: <Bdi>20g</Bdi>, label: 'بروتين', sub: 'في الحصة' },
            { id: 'b', value: <Bdi>150</Bdi>, label: 'سعرة حرارية', sub: 'في الحصة' },
            { id: 'c', glyph: 'vegan-leaf', label: 'نباتي', sub: <Bdi>Vegan</Bdi> },
            { id: 'd', value: <Bdi>907g</Bdi>, label: 'حجم العبوة' },
          ]}
        />
        <div style={{ marginBlockStart: 16 }}>
          <StatStrip cells={[{ id: 'one', value: <Bdi>60</Bdi>, label: 'حصة' }]} />
        </div>
        <StatStrip cells={[]} />
      </Block>

      <Block
        title="Band"
        note="One wedge per screen. Badges are facts: with none the band drops its lower tier and keeps its proportions."
      >
        <Band
          photo="/assets/images/services-band.jpg"
          line1="اسأل قبل أن تشتري"
          line2="ثم اشتر"
          subline={AR_SENTENCE}
          badges={[
            { id: 'v', glyph: 'vegan-leaf', label: 'نباتي', latin: <Bdi>Vegan</Bdi> },
            { id: 's', glyph: 'low-sugar', label: 'منخفض السكر', latin: <Bdi>Low Sugar</Bdi> },
          ]}
        />
        <div style={{ marginBlockStart: 16 }}>
          <Band
            photo="/assets/images/services-band.jpg"
            line1="بلا شارات وبلا وتد"
            subline={AR_SENTENCE}
            wedge={false}
            lockup={false}
            action={<Button>احجز موعدا</Button>}
          />
        </div>
      </Block>

      <Block
        title="Utilities"
        note="The visually hidden text below is announced but never painted; the containers set the gutter."
      >
        <p className="ox-sr-only">نص مخفي بصريا فقط</p>
        <div className="ox-container" style={{ outline: '1px dashed var(--ox-line-2)' }}>
          <p className="ox-body">ox-container</p>
        </div>
        <div className="ox-container--narrow" style={{ outline: '1px dashed var(--ox-line-2)' }}>
          <p className="ox-body">ox-container--narrow</p>
        </div>
        <div className="ox-container--text" style={{ outline: '1px dashed var(--ox-line-2)' }}>
          <p className="ox-body">ox-container--text</p>
        </div>
        <div style={{ marginBlockStart: 12 }}>
          <p className="ox-display">ox-display</p>
          <p className="ox-h1">ox-h1</p>
          <p className="ox-h2">ox-h2</p>
          <p className="ox-h3">ox-h3</p>
          <p className="ox-lead">ox-lead</p>
          <p className="ox-body">ox-body</p>
          <p className="ox-small">ox-small</p>
          <p className="ox-micro">ox-micro</p>
        </div>
      </Block>
    </div>
  );
}

export default KitchenSink;
