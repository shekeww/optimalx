import { useRef, type ReactNode } from 'react';
import { useTranslation } from '@salla.sa/twilight-theme-engine/i18n';
import type { Product } from '@salla.sa/twilight-theme-engine/types';
import { OxProductCard } from './OxProductCard';
import { SpecChips } from './BuyZone/SpecChips';
import { SupplyCalculator } from './BuyZone/SupplyCalculator';
import { DeliveryPromise } from './BuyZone/DeliveryPromise';
import { TrustGrid } from './BuyZone/TrustGrid';
import { StickyBar } from './BuyZone/StickyBar';
import { PdpTitleBlock } from './BuyZone/PdpTitleBlock';
import { PdpPriceBlock } from './BuyZone/PdpPriceBlock';
import { PdpGallery } from './BuyZone/PdpGallery';
import { NutritionTable } from './BelowFold/NutritionTable';
import { HowToUse } from './BelowFold/HowToUse';
import { PrePurchaseInfo } from './BelowFold/PrePurchaseInfo';
import { Description } from './BelowFold/Description';
import { BundleMembers } from './BelowFold/BundleMembers';
import { ServicePdp } from './variants/ServicePdp';
import { splitDescription } from './lib/nutritionTable';
import { createGlossaryLookup } from './lib/glossary';
import { prePurchaseRows } from './lib/faq';
import { parseSpecLine } from './lib/specLine';

// Dev-only fixtures. Section chrome is English and hardcoded on purpose, the
// same contract app/routes/kitchen-sink.tsx states: this page is a test
// fixture, not a storefront page, so its labels never enter locales/.

const WHEY_DESCRIPTION =
  '<p>الحصص: 73 | حجم الحصة: 31 جم | الصلاحية: 2029-03 | الشكل: بودرة</p>' + // ox-allow: arabic-literal
  '<p>واي بروتين سريع الذوبان، 24 جم بروتين في كل مغرفة.</p>' + // ox-allow: arabic-literal
  '<table><tr><th>الحقائق الغذائية</th><th>لكل حصة</th></tr>' + // ox-allow: arabic-literal
  '<tr><td>السعرات الحرارية</td><td>120</td></tr>' + // ox-allow: arabic-literal
  '<tr><td>البروتين</td><td>24 جم</td></tr>' + // ox-allow: arabic-literal
  '<tr><td>الكربوهيدرات</td><td>3 جم</td></tr></table>' + // ox-allow: arabic-literal
  '<p>طريقة الاستخدام: تخلط مغرفة واحدة مع 200 مل ماء بارد. تؤخذ بعد التمرين.</p>' + // ox-allow: arabic-literal
  '<p>تنبيه: المكملات لا تغني عن الغذاء المتوازن. يحتوي على الحليب والصويا.</p>'; // ox-allow: arabic-literal

const SERVICE_DESCRIPTION =
  '<p>المدة: 20 دقيقة | القناة: مكالمة مرئية | الرد خلال: 24 ساعة عمل</p>'; // ox-allow: arabic-literal

const HOSTILE_DESCRIPTION =
  '<p>الحصص: 10</p><p>نص عادي<script>alert(1)</script></p>' + // ox-allow: arabic-literal
  '<p onclick="steal()">فقرة بخصائص ممنوعة</p><iframe src="https://evil.example"></iframe>'; // ox-allow: arabic-literal

function fixture(overrides: Partial<Product> = {}): Product {
  return {
    id: 1996831868,
    name: 'Optimum Nutrition Gold Standard 100% Whey 2.27 kg',
    description: WHEY_DESCRIPTION,
    url: '/p1996831868',
    type: 'product',
    status: 'sale',
    price: 240,
    sale_price: 240,
    regular_price: 240,
    base_currency_price: 240,
    currency: 'SAR',
    max_quantity: 10,
    image: { url: 'https://cdn.salla.sa/placeholder.png', alt: '' },
    brand: { id: 1, name: 'Optimum Nutrition' },
    is_taxable: true,
    has_read_more: false,
    can_add_note: false,
    can_show_remained_quantity: false,
    can_upload_file: false,
    has_custom_form: false,
    has_metadata: false,
    is_on_sale: false,
    is_hidden_quantity: false,
    is_available: true,
    is_out_of_stock: false,
    is_require_shipping: true,
    has_size_guide: false,
    ...overrides,
  } as Product;
}

/**
 * Five real catalogue images, so the gallery's thumbnail rail can be looked
 * at. No product in the live store carries more than one image today (the
 * write log records exactly one `product_image_add` per product), so the rail
 * never appears on a real product page and the only way to see it is here.
 * Five is one past the four the rail draws, which is what makes its chevrons
 * live.
 */
const GALLERY_IMAGES = [
  'https://cdn.salla.sa/dPrxBd/7c0a3ecd-515d-48d8-b575-1fa8b30c11dc-500x500-M3GIPfzBrU7DXXZJsNrmoqZ7u4kRejfSXKMQtV1h.jpg',
  'https://cdn.salla.sa/dPrxBd/335faea8-5dae-4157-94d8-cbc0415953e2-500x500-va7a4JfENowR83Szqdm771ErO8No3smnu8JCmTkG.jpg',
  'https://cdn.salla.sa/dPrxBd/28308f33-fbf9-4682-8d55-5b9fa8fc2fd8-500x500-3wZJASuQpBlzCZEmbOXLWgp14KpXbg4Hu123tDPG.jpg',
  'https://cdn.salla.sa/dPrxBd/ec122d27-551a-4680-8df4-5c3a5b47a460-500x500-R6PBB0mLYlAzRRW6m0gHEQEgwVtbioNeDysidPOS.webp',
  'https://cdn.salla.sa/dPrxBd/304b903e-d5e2-4705-9bb2-c9231b4ff5bd-500x500-ecvwzCk8Cgk6Xul5OyaHJGw8fpO0IPnqJINPCk4V.jpg',
].map((url, index) => ({ id: 900 + index, url, alt: '' }));

function Panel({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section dir="ltr" style={{ marginBlockEnd: 48, textAlign: 'start' }}>
      <h2 style={{ fontSize: 20, fontWeight: 700, marginBlockEnd: 16 }}>{title}</h2>
      <div dir="rtl">{children}</div>
    </section>
  );
}

function Grid({ children }: { children: ReactNode }) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(171px, 1fr))',
        gap: 16,
      }}
    >
      {children}
    </div>
  );
}

/** The PDP and the card (B3), in the states DIRECTION 5.3 and 5.4 name. */
export function KitchenSink() {
  const { t } = useTranslation();
  const anchor = useRef<HTMLDivElement | null>(null);
  const parts = splitDescription(WHEY_DESCRIPTION, createGlossaryLookup(t));
  const spec = parts.specLine;
  const hostile = splitDescription(HOSTILE_DESCRIPTION);
  const withThreshold = { free_shipping_threshold: '299', branch_address: 'حي الخالدية' }; // ox-allow: arabic-literal

  return (
    <div>
      <Panel title="OxProductCard: default, on sale, out of stock, no spec line">{/* ox-allow: latin-sentence */}
        <Grid>
          <OxProductCard product={fixture()} />
          <OxProductCard
            product={fixture({ id: 2, is_on_sale: true, regular_price: 300, sale_price: 240 })}
          />
          <OxProductCard product={fixture({ id: 3, is_out_of_stock: true, status: 'out' })} />
          <OxProductCard product={fixture({ id: 4, description: '<p>بدون سطر مواصفات.</p>' })} />
          <OxProductCard
            product={fixture({ id: 5, rating: { count: 12, stars: 4 }, brand: undefined })}
          />
        </Grid>
      </Panel>

      <Panel title="PdpGallery: five images (rail and chevrons) and one (plate alone)">{/* ox-allow: latin-sentence */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 32 }}>
          <PdpGallery product={fixture({ images: GALLERY_IMAGES })} />
          <PdpGallery product={fixture({ images: [GALLERY_IMAGES[0]] })} />
        </div>
      </Panel>

      <Panel title="PdpTitleBlock and PdpPriceBlock: plain, on sale, with a VAT number">{/* ox-allow: latin-sentence */}
        <PdpTitleBlock product={fixture()} lead={parts.lead} />
        <PdpPriceBlock product={fixture()} servings={spec?.servings} expiry={spec?.expiry} />
        <hr />
        <PdpTitleBlock
          product={fixture({ is_on_sale: true, regular_price: 300, sale_price: 240 })}
          lead={parts.lead}
        />
        <PdpPriceBlock
          product={fixture({ is_on_sale: true, regular_price: 300, sale_price: 240 })}
          servings={spec?.servings}
          expiry="2026-11"
          settings={{ vat_number: '310000000000003', claim_official_distributors: true }}
        />
      </Panel>

      <Panel title="SpecChips, SupplyCalculator, DeliveryPromise">{/* ox-allow: latin-sentence */}
        <SpecChips spec={spec} />
        <SupplyCalculator servings={spec?.servings} />
        <DeliveryPromise settings={withThreshold} currency="SAR" shippable />
        <p>Nothing below: no servings, and a product that ships nothing.</p>{/* ox-allow: latin-sentence */}
        <SpecChips spec={parseSpecLine('<p>نص عادي.</p>')} />
        <SupplyCalculator servings={null} />
        <DeliveryPromise settings={withThreshold} currency="SAR" shippable={false} />
      </Panel>

      <Panel title="TrustGrid: physical and digital">{/* ox-allow: latin-sentence */}
        <TrustGrid />
        <TrustGrid digital />
        <TrustGrid settings={{ claim_official_distributors: true }} />
      </Panel>

      <Panel title="Description through the sanitiser: clean and hostile input">{/* ox-allow: latin-sentence */}
        <Description html={parts.bodyHtml} />
        <Description html={hostile.bodyHtml} />
      </Panel>

      <Panel title="NutritionTable, HowToUse, PrePurchaseInfo">{/* ox-allow: latin-sentence */}
        <NutritionTable data={parts.nutrition} servingSize={spec?.servingSize} />
        <HowToUse steps={parts.howToUse} />
        <PrePurchaseInfo warning={parts.warning} rows={prePurchaseRows(t)} />
      </Panel>

      <Panel title="BundleMembers and the service buy zone">{/* ox-allow: latin-sentence */}
        <BundleMembers
          members={[
            { id: 11, name: 'واي بروتين', url: '/p11', quantity: 1 }, // ox-allow: arabic-literal
            { id: 12, name: 'كرياتين مونوهيدرات', url: '/p12', quantity: 1 }, // ox-allow: arabic-literal
          ]}
        />
        <ServicePdp
          product={fixture({ type: 'booking', description: SERVICE_DESCRIPTION })}
          spec={parseSpecLine(SERVICE_DESCRIPTION)}
          settings={{ consultation_credit_note: 'يخصم مبلغ الاستشارة من طلبك التالي.' }} // ox-allow: arabic-literal
        />
        <ServicePdp
          product={fixture({ type: 'service', sale_price: 0, description: SERVICE_DESCRIPTION })}
          spec={parseSpecLine(SERVICE_DESCRIPTION)}
        />
      </Panel>

      <Panel title="StickyBar: its anchor is the box below; scroll past it">{/* ox-allow: latin-sentence */}
        <div ref={anchor} style={{ blockSize: 160, background: 'var(--ox-plate)' }} />
        <StickyBar product={fixture()} anchorRef={anchor} />
      </Panel>
    </div>
  );
}

export default KitchenSink;
