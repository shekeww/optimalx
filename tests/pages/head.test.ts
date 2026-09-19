import { describe, it, expect, vi } from 'vitest';
import type { TwilightContext } from '@salla.sa/twilight-theme-engine/tanstack';
import { pageHead } from '../../app/components/pages/head';
import { dropBaseCanonical, stopDarkMode, DARK_MODE_CLASS } from '../../app/components/pages/rootHead';
import { resolveFaq } from '../../app/components/pages/faq';
import { isPendingCopy } from '../../app/components/pages/copy';
import { convert, formatAmount, UNIT_IDS } from '../../app/components/pages/convert';
import { createT } from '../helpers/i18n';

const t = createT('ar');

function context(multilingual: boolean): TwilightContext {
  return {
    locale: 'ar',
    i18n: { t: (key: string) => t(key) },
    settings: {
      store: {
        name: 'اوبتيمال اكس',
        url: 'https://optimalx.sa',
        logo: 'https://cdn.salla.sa/logo.png',
        settings: { is_multilingual: multilingual },
      },
      languages: [{ code: 'ar' }, { code: 'en' }],
    },
  } as unknown as TwilightContext;
}

describe('pageHead', () => {
  it('builds a locale-prefixed canonical and matching og:url on a multilingual store', () => {
    const head = pageHead({
      path: '/services',
      titleKey: 'ox.services.meta_title',
      descriptionKey: 'ox.services.meta_description',
    })(context(true));
    expect(head.canonical).toBe('https://optimalx.sa/ar/services');
    expect(head.openGraph?.url).toBe('https://optimalx.sa/ar/services');
    expect(head.title).toBe(t('ox.services.meta_title'));
    expect(head.description).toBe(t('ox.services.meta_description'));
  });

  it('drops the locale prefix and the hreflang cluster on a single-language store', () => {
    const head = pageHead({
      path: '/about',
      titleKey: 'ox.pages.about.meta_title',
      descriptionKey: 'ox.pages.about.meta_description',
    })(context(false));
    expect(head.canonical).toBe('https://optimalx.sa/about');
    expect(head.alternateLanguages).toBeUndefined();
  });

  it('emits the hreflang cluster with x-default on a multilingual store', () => {
    const head = pageHead({
      path: '/branch',
      titleKey: 'ox.content.branch.title',
      descriptionKey: 'ox.branch.meta_description',
    })(context(true));
    expect(head.alternateLanguages).toEqual([
      { hreflang: 'x-default', href: 'https://optimalx.sa/ar/branch' },
      { hreflang: 'ar', href: 'https://optimalx.sa/ar/branch' },
      { hreflang: 'en', href: 'https://optimalx.sa/en/branch' },
    ]);
  });

  it('marks only the converter noindex', () => {
    const indexed = pageHead({
      path: '/contact',
      titleKey: 'ox.pages.contact.meta_title',
      descriptionKey: 'ox.pages.contact.meta_description',
    })(context(true));
    const tool = pageHead({
      path: '/tools/converter',
      titleKey: 'ox.tools.converter.meta_title',
      descriptionKey: 'ox.tools.converter.meta_description',
      noindex: true,
    })(context(true));
    expect(indexed.robots).toBe('index, follow');
    expect(tool.robots).toBe('noindex, follow');
  });

  it('publishes an FAQPage node only when rows resolve', () => {
    const rows = [{ id: 'a', qKey: 'ox.services.faq_1_q', aKey: 'ox.services.faq_1_a' }];
    const withFaq = pageHead({
      path: '/services',
      titleKey: 'ox.services.meta_title',
      descriptionKey: 'ox.services.meta_description',
      faq: (translate) => resolveFaq(translate, rows),
    })(context(true));
    const graph = withFaq.jsonLd as { '@graph': Array<Record<string, unknown>> };
    expect(graph['@graph'][0]['@type']).toBe('FAQPage');
    expect(graph['@graph'][0]['@id']).toBe('https://optimalx.sa/ar/services#faq');

    const without = pageHead({
      path: '/services',
      titleKey: 'ox.services.meta_title',
      descriptionKey: 'ox.services.meta_description',
    })(context(true));
    expect(without.jsonLd).toBeUndefined();
  });
});

describe('dropBaseCanonical', () => {
  it('leaves exactly one canonical when the engine root and a route both declare one', () => {
    const merged = dropBaseCanonical({
      meta: [{ title: 'x' }],
      links: [
        { rel: 'canonical', href: 'https://optimalx.sa' },
        { rel: 'preload', href: '/font.woff2' },
      ],
    });
    // The root's is gone; the route head adds its own after this one.
    expect(merged.links?.filter((link) => link.rel === 'canonical')).toHaveLength(0);
    expect(merged.links).toHaveLength(1);
    expect(merged.meta).toHaveLength(1);
  });

  it('returns the same object when there is nothing to drop', () => {
    const input = { links: [{ rel: 'preload', href: '/x' }] };
    expect(dropBaseCanonical(input)).toBe(input);
    const empty = { meta: [] };
    expect(dropBaseCanonical(empty)).toBe(empty);
  });
});

describe('stopDarkMode', () => {
  it('removes the dark-mode body class and removes it again when something re-adds it', async () => {
    document.body.classList.add(DARK_MODE_CLASS, 'keep-me');
    const stop = stopDarkMode(document);
    expect(document.body.classList.contains(DARK_MODE_CLASS)).toBe(false);
    expect(document.body.classList.contains('keep-me')).toBe(true);

    document.body.classList.add(DARK_MODE_CLASS);
    await vi.waitFor(() => expect(document.body.classList.contains(DARK_MODE_CLASS)).toBe(false));
    stop();
  });

  it('is a no-op without a document', () => {
    expect(() => stopDarkMode(undefined)()).not.toThrow();
  });
});

describe('resolveFaq', () => {
  it('drops a row whose answer still carries an unresolved placeholder', () => {
    const rows = [
      { id: 'price', qKey: 'ox.content.branch.faq_1_q', aKey: 'ox.content.branch.faq_1_a' },
      { id: 'walkin', qKey: 'ox.content.branch.faq_2_q', aKey: 'ox.content.branch.faq_2_a' },
    ];
    const resolved = resolveFaq(t, rows);
    expect(resolved.map((row) => row.id)).toEqual(['walkin']);
  });

  it('keeps the row once the placeholder has a value', () => {
    const rows = [{ id: 'price', qKey: 'ox.content.branch.faq_1_q', aKey: 'ox.content.branch.faq_1_a' }];
    const resolved = resolveFaq(t, rows, { threshold: 200 });
    expect(resolved).toHaveLength(1);
    expect(resolved[0].answer).toContain('200');
  });

  it('drops a row whose key is missing altogether', () => {
    expect(resolveFaq(t, [{ qKey: 'ox.nope.q', aKey: 'ox.nope.a' }])).toHaveLength(0);
  });
});

describe('isPendingCopy', () => {
  it('treats the lawyer-gated values as pending and real copy as ready', () => {
    expect(isPendingCopy(t('ox.pages.contact.pdpl'))).toBe(true);
    expect(isPendingCopy(t('ox.form.consent'))).toBe(true);
    expect(isPendingCopy(t('ox.services.medical_line'))).toBe(false);
    expect(isPendingCopy('')).toBe(true);
  });
});

describe('unit converter arithmetic', () => {
  it('round-trips every unit through grams', () => {
    for (const unit of UNIT_IDS) {
      const there = convert(1, 'kg', unit);
      expect(there).not.toBeNull();
      expect(convert(there as number, unit, 'kg')).toBeCloseTo(1, 9);
    }
  });

  it('converts the two units a shopper actually compares', () => {
    expect(convert(1, 'kg', 'lb')).toBeCloseTo(2.2046226, 6);
    expect(convert(5, 'lb', 'kg')).toBeCloseTo(2.26796185, 6);
    expect(convert(30, 'g', 'oz')).toBeCloseTo(1.0582188, 6);
  });

  it('refuses a non-positive or unparsable amount instead of printing NaN', () => {
    expect(convert(0, 'kg', 'g')).toBeNull();
    expect(convert(-1, 'kg', 'g')).toBeNull();
    expect(convert(Number.NaN, 'kg', 'g')).toBeNull();
  });

  it('formats with Western numerals and no trailing zeros', () => {
    expect(formatAmount(2.204622621848776)).toBe('2.205');
    expect(formatAmount(1000)).toBe('1000');
    expect(formatAmount(0.5)).toBe('0.5');
  });
});
