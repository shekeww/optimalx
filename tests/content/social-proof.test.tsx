import React from 'react';
import fs from 'node:fs';
import path from 'node:path';
import { describe, it, expect, vi } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithProviders } from '../helpers/render';
import {
  readStoreRating,
  isQuotable,
  quotableReviews,
  CURATED_REVIEWS,
  SOCIAL_PROOF_SETTINGS,
  type CuratedReview,
} from '../../app/content/social-proof';

vi.mock('@salla.sa/twilight-theme-engine/i18n', async () =>
  (await import('../helpers/i18n')).i18nModuleMock('ar')
);

const settings: Record<string, unknown> = {};
vi.mock('@salla.sa/twilight-theme-engine/hooks/useTheme', () => ({
  useTheme: () => ({ settings }),
}));

const { StoreRating } = await import('../../app/components/common/StoreRating');

const LISTING = 'https://maps.app.goo.gl/example';

function withProof(over: Record<string, unknown> = {}) {
  return {
    [SOCIAL_PROOF_SETTINGS.placeUrl]: LISTING,
    [SOCIAL_PROOF_SETTINGS.rating]: '5.0',
    [SOCIAL_PROOF_SETTINGS.reviewCount]: '68',
    [SOCIAL_PROOF_SETTINGS.verifiedAt]: '2026-09-20',
    ...over,
  };
}

function review(over: Partial<CuratedReview> = {}): CuratedReview {
  return {
    id: 'r1',
    author: 'A. M.',
    stars: 5,
    month: '2026-08',
    text: 'Great selection and the staff helped me pick the right protein.',
    lang: 'en',
    ...over,
  };
}

describe('readStoreRating: the gate', () => {
  it('reads a complete, well formed record', () => {
    expect(readStoreRating(withProof())).toEqual({
      rating: 5,
      count: 68,
      url: LISTING,
      verifiedAt: '2026-09-20',
    });
  });

  // Each of these is a way a wrong number could reach a customer's screen.
  // A wrong number is worse than no number, so every one renders nothing.
  it.each([
    ['no settings at all', undefined],
    ['an empty record', {}],
    ['no proof link', withProof({ [SOCIAL_PROOF_SETTINGS.placeUrl]: '' })],
    ['a link that is not Google', withProof({ [SOCIAL_PROOF_SETTINGS.placeUrl]: 'https://example.com/x' })],
    ['an insecure link', withProof({ [SOCIAL_PROOF_SETTINGS.placeUrl]: 'http://maps.google.com/x' })],
    ['a lookalike host', withProof({ [SOCIAL_PROOF_SETTINGS.placeUrl]: 'https://google.com.evil.tld/x' })],
    ['no rating', withProof({ [SOCIAL_PROOF_SETTINGS.rating]: '' })],
    ['an unparseable rating', withProof({ [SOCIAL_PROOF_SETTINGS.rating]: 'five' })],
    ['a rating above five', withProof({ [SOCIAL_PROOF_SETTINGS.rating]: '5.4' })],
    ['a zero rating', withProof({ [SOCIAL_PROOF_SETTINGS.rating]: '0' })],
    ['no count', withProof({ [SOCIAL_PROOF_SETTINGS.reviewCount]: '' })],
    ['a zero count', withProof({ [SOCIAL_PROOF_SETTINGS.reviewCount]: '0' })],
    ['a fractional count', withProof({ [SOCIAL_PROOF_SETTINGS.reviewCount]: '68.5' })],
  ])('returns null for %s', (_label, input) => {
    expect(readStoreRating(input)).toBeNull();
  });

  it('drops a malformed date but keeps the figures, which are the claim', () => {
    const read = readStoreRating(withProof({ [SOCIAL_PROOF_SETTINGS.verifiedAt]: 'last week' }));
    expect(read).not.toBeNull();
    expect(read?.verifiedAt).toBeUndefined();
    expect(read?.count).toBe(68);
  });

  it('does not round a rating up', () => {
    expect(readStoreRating(withProof({ [SOCIAL_PROOF_SETTINGS.rating]: '4.94' }))?.rating).toBe(4.9);
  });
});

describe('isQuotable: the claims filter on reprinted reviews', () => {
  it('passes a review about service and selection', () => {
    expect(isQuotable(review())).toBe(true);
  });

  it('passes an Arabic review about authenticity', () => {
    expect(isQuotable(review({ lang: 'ar', text: 'منتجات اصلية وتعامل راقي، والاسعار مناسبة.' }))).toBe(
      true
    );
  });

  // The live listing contains all of these, which is why the filter exists.
  it.each([
    ['an English professional title', 'They also have a great fitness and health instructor and a doctor on site.'],
    ['an Arabic professional title', 'الصيدلي في المحل نصحني بالمنتج المناسب.'],
    ['a treatment claim', 'This supplement cured my joint pain completely.'],
    ['an Arabic treatment claim', 'المنتج عالج مشكلتي تماما.'],
    ['a result with a timeframe', 'I lost 8 kg in 3 months with their plan.'],
    ['a guarantee', 'Results are guaranteed, and it is 100% safe.'],
    ['an Arabic absolute', 'أفضل في السعودية بلا منازع، ونتيجة مضمونة.'],
  ])('excludes %s', (_label, text) => {
    expect(isQuotable(review({ text }))).toBe(false);
  });

  it('holds the store reply to the same line as the quote', () => {
    const clean = review();
    expect(isQuotable(clean)).toBe(true);
    expect(isQuotable({ ...clean, reply: 'Thank you. Our pharmacist is always here to help.' })).toBe(
      false
    );
  });

  it('ships no quote today, and every shipped quote must pass the filter', () => {
    // The aggregate is live from settings; the text waits on the owner's
    // Business Profile export. When quotes land, this is the guard.
    expect(CURATED_REVIEWS).toHaveLength(0);
    expect(quotableReviews(CURATED_REVIEWS)).toHaveLength(CURATED_REVIEWS.length);
    for (const item of CURATED_REVIEWS) {
      expect(isQuotable(item), `quote ${item.id} breaks the claims filter`).toBe(true);
    }
  });
});

describe('StoreRating', () => {
  it('renders nothing when the evidence is absent', () => {
    renderWithProviders(<StoreRating value={null} />);

    expect(screen.queryByTestId('ox-store-rating')).toBeNull();
  });

  it('renders the figure, names the store as its subject, and links to the source', () => {
    renderWithProviders(<StoreRating value={readStoreRating(withProof())} />);

    const el = screen.getByTestId('ox-store-rating');

    expect(el.textContent).toContain('5.0');
    expect(el.textContent).toContain('68');
    // The subject is always named: this is the shop's rating, not a product's.
    expect(el.textContent).toMatch(/المتجر/);
    expect(el.getAttribute('href')).toBe(LISTING);
    expect(el.getAttribute('rel')).toContain('noopener');
  });

  it('reads the settings when no value is passed', () => {
    Object.assign(settings, withProof());
    renderWithProviders(<StoreRating />);
    expect(screen.getByTestId('ox-store-rating').textContent).toContain('68');
    for (const key of Object.keys(settings)) delete settings[key];
  });

  // S9j, 2026-09-25: the accent-fill row draws the solid `star-fill` icon -
  // `star` itself is outline-only and a CSS fill can never override a
  // <symbol>'s own presentation attribute, which is why the stars used to
  // render empty.
  it('draws the base row in the plain outline star and the fill row in the solid star', () => {
    renderWithProviders(<StoreRating value={readStoreRating(withProof())} />);

    const el = screen.getByTestId('ox-store-rating');
    const baseUses = el.querySelectorAll('.ox-gr__row--base use');
    const fillUses = el.querySelectorAll('.ox-gr__row--fill use');
    expect(baseUses).toHaveLength(5);
    expect(fillUses).toHaveLength(5);
    for (const use of baseUses) expect(use.getAttribute('href')).toBe('#ox-star');
    for (const use of fillUses) expect(use.getAttribute('href')).toBe('#ox-star-fill');
  });
});

describe('no structured data carries this rating', () => {
  // Google: "Don't aggregate reviews or ratings from other websites", and a
  // business that controls its own reviews is ineligible for the star feature
  // on LocalBusiness or Organization. A Google-sourced rating in our JSON-LD
  // breaks both. This test is the thing standing between a future well meaning
  // change and a manual action.
  const seoDir = path.join(process.cwd(), 'app', 'components', 'seo');

  it('emits no aggregateRating, ratingValue or reviewCount anywhere in the SEO graph', () => {
    for (const file of fs.readdirSync(seoDir)) {
      const text = fs.readFileSync(path.join(seoDir, file), 'utf8');
      expect(text, `${file} must not mark up a rating`).not.toMatch(
        /aggregateRating|ratingValue|reviewCount|ratingCount/
      );
    }
  });

  it('keeps the rating out of the component that would be tempted to emit it', () => {
    const text = fs.readFileSync(
      path.join(process.cwd(), 'app', 'components', 'common', 'StoreRating.tsx'),
      'utf8'
    );
    expect(text).not.toMatch(/ld\+json|schema\.org|aggregateRating/);
  });
});
