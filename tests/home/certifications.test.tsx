import { describe, it, expect, vi } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithProviders } from '../helpers/render';
import { loadDictionary } from '../helpers/i18n';
import {
  CERTIFICATIONS,
  CERTIFICATION_IDS,
  CERT_DISCLAIMER_EN,
  CERT_PRODUCT_PHOTO,
  resolveCertifications,
  type CertificationEvidence,
} from '../../app/content/certifications';
import { HOME_BLOCK_FIELDS, type OxBlockData } from '../../app/components/home/defaults';

/**
 * The certification band (certification-band-spec.md).
 *
 * Two things are being proved here and the first one matters more.
 *
 * ONE: with no evidence, which is the state of the store today, the band
 * renders nothing at all. Not a heading with an empty grid, not a disclaimer
 * on its own, not an element of any kind. A certification is a claim, and the
 * only honest number of claims a store with no certificates can make is zero.
 * The reserved height and the absent skeleton are proved next door in
 * optionalBlocks.test.ts; what is proved here is that the markup is absent
 * too, so there is nothing to reserve height for.
 *
 * TWO: with evidence, it prints exactly the badges the evidence proves, in
 * the canonical order, from the theme's own definitions, with the regulatory
 * disclaimer in both languages beneath them.
 *
 * The gate is the reference. A row with no certificate or registration
 * reference is not evidence, and `halal` is the one to be hardest on: this is
 * the Saudi market and an unbacked halal claim is the most damaging on the
 * list.
 */

vi.mock('@salla.sa/twilight-theme-engine/i18n', async () =>
  (await import('../helpers/i18n')).i18nModuleMock('ar')
);

const { OxCertifications } = await import('../../app/components/home/OxCertifications');
const { CertificationBand } = await import('../../app/components/home/CertificationBand');

const ar = loadDictionary('ar');

/** The block as the dashboard ships it: the manifest defaults, nothing set. */
function data(fields: Record<string, unknown> = {}): OxBlockData {
  return {
    path: 'ox-certifications',
    key: 'certifications',
    ...HOME_BLOCK_FIELDS['ox-certifications'],
    ...fields,
  } as OxBlockData;
}

/** A collection row as the engine sends it: sub-fields under their full id. */
function row(id: unknown, reference: unknown): Record<string, unknown> {
  return { 'certifications.id': id, 'certifications.reference': reference };
}

function badgeIds(): string[] {
  return screen
    .getAllByRole('listitem')
    .map((item) => item.getAttribute('data-cert') ?? '')
    .filter((id) => id !== '');
}

describe('the certification band with no evidence, which is the store today', () => {
  it('renders nothing at all from the shipped block defaults', () => {
    renderWithProviders(<OxCertifications data={data()} />);
    expect(screen.queryByTestId('ox-certifications')).toBeNull();
    expect(screen.getByTestId('ox-test-root').childElementCount).toBe(0);
  });

  it('renders nothing when the collection is missing, null or not a list', () => {
    for (const value of [undefined, null, '', 0, {}, 'halal']) {
      const { unmount } = renderWithProviders(
        <OxCertifications data={data({ certifications: value })} />
      );
      expect(screen.queryByTestId('ox-certifications'), String(value)).toBeNull();
      unmount();
    }
  });

  it('renders nothing when a badge id arrives with no reference behind it', () => {
    renderWithProviders(
      <OxCertifications
        data={data({
          certifications: CERTIFICATION_IDS.map((id) => row(id, '')),
        })}
      />
    );
    expect(screen.queryByTestId('ox-certifications')).toBeNull();
  });

  it('will not print halal against a blank, a space or a dash', () => {
    for (const reference of ['', '   ', '-', '.', '--']) {
      const { unmount } = renderWithProviders(
        <OxCertifications data={data({ certifications: [row('halal', reference)] })} />
      );
      expect(screen.queryByTestId('ox-certifications'), JSON.stringify(reference)).toBeNull();
      unmount();
    }
  });

  it('renders nothing for a certification the theme does not define', () => {
    renderWithProviders(
      <OxCertifications
        data={data({
          certifications: [row('sfda', 'REG-1'), row('organic', 'REG-2'), row('', 'REG-3')],
        })}
      />
    );
    expect(screen.queryByTestId('ox-certifications')).toBeNull();
  });

  it('renders nothing when the band itself is handed an empty badge list', () => {
    renderWithProviders(<CertificationBand badges={[]} />);
    expect(screen.getByTestId('ox-test-root').childElementCount).toBe(0);
  });
});

describe('resolveCertifications, which is where the gate lives', () => {
  it('returns nothing for nothing', () => {
    expect(resolveCertifications(undefined)).toEqual([]);
    expect(resolveCertifications(null)).toEqual([]);
    expect(resolveCertifications([])).toEqual([]);
  });

  it('drops a row whose reference is empty, blank or not a string', () => {
    const evidence = [
      { id: 'halal', reference: '' },
      { id: 'nsf', reference: '  ' },
      { id: 'non-gmo', reference: undefined },
      { id: 'informed-choice', reference: 1234 },
    ] as unknown as CertificationEvidence[];
    expect(resolveCertifications(evidence)).toEqual([]);
  });

  it('keeps the canonical order and collapses duplicates', () => {
    const evidence = [
      { id: 'non-gmo', reference: 'LBL-9' },
      { id: 'halal', reference: 'HC-441' },
      { id: 'halal', reference: 'HC-441' },
      { id: 'nsf', reference: 'NSF-7788' },
    ];
    expect(resolveCertifications(evidence).map((badge) => badge.id)).toEqual([
      'nsf',
      'halal',
      'non-gmo',
    ]);
  });

  it('reads the proper noun the way a merchant types it, case and separator', () => {
    const evidence = [
      { id: '  Informed Choice ', reference: 'IC-01' },
      { id: 'NON_GMO', reference: 'LBL-9' },
    ];
    expect(resolveCertifications(evidence).map((badge) => badge.id)).toEqual([
      'informed-choice',
      'non-gmo',
    ]);
  });

  it('returns the theme definition, never anything the row carried', () => {
    const evidence = [
      { id: 'nsf', reference: 'NSF-7788', name: 'FDA', englishLine: 'Cures fatigue' },
    ] as unknown as CertificationEvidence[];
    expect(resolveCertifications(evidence)).toEqual([CERTIFICATIONS[0]]);
  });
});

describe('the certification band with evidence behind it', () => {
  const evidence = [row('nsf', 'NSF-7788'), row('halal', 'HC-441')];

  it('prints only the badges the evidence proves, in the canonical order', () => {
    renderWithProviders(<OxCertifications data={data({ certifications: evidence })} />);
    expect(screen.getByTestId('ox-certifications')).toBeTruthy();
    expect(badgeIds()).toEqual(['nsf', 'halal']);
  });

  it('gives each badge the proper noun, the English line and the Arabic line', () => {
    const { container } = renderWithProviders(
      <OxCertifications data={data({ certifications: evidence })} />
    );
    const halal = container.querySelector('[data-cert="halal"]');
    expect(halal?.querySelector('.ox-certs__name')?.textContent).toBe('Halal');
    expect(halal?.querySelector('.ox-certs__en')?.textContent).toBe(
      'Certificate held by the manufacturer'
    );
    expect(halal?.querySelector('.ox-certs__ar')?.textContent).toBe(ar['ox.home.cert.halal_ar']);
  });

  it('marks the language and direction of both runs, since they share one block', () => {
    const { container } = renderWithProviders(
      <OxCertifications data={data({ certifications: evidence })} />
    );
    for (const selector of ['.ox-certs__name', '.ox-certs__en', '.ox-certs__legal-en']) {
      const element = container.querySelector(selector);
      expect(element?.getAttribute('lang'), selector).toBe('en');
      expect(element?.getAttribute('dir'), selector).toBe('ltr');
    }
    for (const selector of ['.ox-certs__ar', '.ox-certs__legal-ar']) {
      const element = container.querySelector(selector);
      expect(element?.getAttribute('lang'), selector).toBe('ar');
      expect(element?.getAttribute('dir'), selector).toBe('rtl');
    }
  });

  it('prints the regulatory disclaimer in both languages, gated on nothing', () => {
    const { container } = renderWithProviders(
      <OxCertifications data={data({ certifications: [row('non-gmo', 'LBL-9')] })} />
    );
    expect(badgeIds()).toEqual(['non-gmo']);
    expect(container.querySelector('.ox-certs__legal-en')?.textContent).toBe(CERT_DISCLAIMER_EN);
    expect(container.querySelector('.ox-certs__legal-ar')?.textContent).toBe(
      ar['ox.home.cert.disclaimer_ar']
    );
  });

  it('is a labelled section headed as the PRODUCT certifications, not the store', () => {
    const { container } = renderWithProviders(
      <OxCertifications data={data({ certifications: evidence })} />
    );
    const section = screen.getByTestId('ox-certifications');
    const heading = container.querySelector('.ox-certs__title');
    expect(heading?.textContent).toBe(ar['ox.home.cert_title']);
    expect(section.getAttribute('aria-labelledby')).toBe(heading?.getAttribute('id'));
    expect(heading?.getAttribute('id')).toBeTruthy();
  });

  it('leaves no raw locale key on the page', () => {
    const { container } = renderWithProviders(
      <OxCertifications data={data({ certifications: evidence })} />
    );
    expect(container.textContent).not.toContain('ox.home.cert');
  });

  it('carries the supplier green nowhere: no inline colour is set at all', () => {
    const { container } = renderWithProviders(
      <OxCertifications data={data({ certifications: evidence })} />
    );
    for (const element of Array.from(container.querySelectorAll<HTMLElement>('*'))) {
      expect(element.getAttribute('style')).toBeNull();
    }
  });
});

describe('the bilingual pair, which is the only place the two languages share a block', () => {
  /**
   * The Arabic line is Arabic whatever locale the page is in. It still comes
   * through `t`, because an Arabic literal may not live in app/**, so the /en
   * dictionary has to carry the Arabic sentence under the same key. Until it
   * does, `t` hands back the English one on /en, and a badge that printed the
   * same sentence twice is a defect a visitor can see. The band drops the
   * duplicate rather than print it.
   */
  it('drops the Arabic run when the dictionary hands back the English line', () => {
    const badge = {
      ...CERTIFICATIONS[0],
      englishLine: ar['ox.home.cert.nsf_ar'],
    };
    const { container } = renderWithProviders(<CertificationBand badges={[badge]} />);
    expect(container.querySelectorAll('.ox-certs__en')).toHaveLength(1);
    expect(container.querySelectorAll('.ox-certs__ar')).toHaveLength(0);
  });

  it('never prints a raw key when the dictionary does not carry one', () => {
    const badge = { ...CERTIFICATIONS[0], arabicLineKey: 'ox.home.cert.not_a_key' };
    const { container } = renderWithProviders(<CertificationBand badges={[badge]} />);
    expect(container.textContent).not.toContain('ox.home.cert.not_a_key');
    expect(container.querySelectorAll('.ox-certs__ar')).toHaveLength(0);
    expect(container.querySelector('.ox-certs__name')?.textContent).toBe('NSF');
  });
});

describe('the product still, which is the one element that could invent a claim', () => {
  const evidence = [row('nsf', 'NSF-7788')];

  it('draws no still, and never the shipped file, until a merchant supplies one', () => {
    const { container } = renderWithProviders(
      <OxCertifications data={data({ certifications: evidence })} />
    );
    expect(container.querySelectorAll('img')).toHaveLength(0);
    expect(container.innerHTML).not.toContain(CERT_PRODUCT_PHOTO.src);
  });

  it('draws the merchant photo when they supply one, decoratively and lazily', () => {
    const { container } = renderWithProviders(
      <OxCertifications
        data={data({ certifications: evidence, photo: '/assets/images/product-creatine.webp' })}
      />
    );
    const image = container.querySelector('img');
    expect(image?.getAttribute('src')).toBe('/assets/images/product-creatine.webp');
    expect(image?.getAttribute('alt')).toBe('');
    expect(image?.getAttribute('loading')).toBe('lazy');
  });
});

describe('the evidence the engine actually sends', () => {
  it('reads a row keyed plainly as well as under its full manifest id', () => {
    renderWithProviders(
      <OxCertifications
        data={data({ certifications: [{ id: 'nsf', reference: 'NSF-7788' }] })}
      />
    );
    expect(badgeIds()).toEqual(['nsf']);
  });

  it('reads a multilanguage cell, which arrives as an object, not a string', () => {
    renderWithProviders(
      <OxCertifications
        data={data({
          certifications: [
            {
              'certifications.id': { ar: 'halal', en: 'halal' },
              'certifications.reference': { ar: 'HC-441', en: 'HC-441' },
            },
          ],
        })}
      />
    );
    expect(badgeIds()).toEqual(['halal']);
  });

  it('still refuses a multilanguage cell that is empty in every language', () => {
    renderWithProviders(
      <OxCertifications
        data={data({
          certifications: [
            {
              'certifications.id': { ar: 'halal', en: 'halal' },
              'certifications.reference': { ar: '', en: '   ' },
            },
          ],
        })}
      />
    );
    expect(screen.queryByTestId('ox-certifications')).toBeNull();
  });
});
