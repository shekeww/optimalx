import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithProviders } from '../helpers/render';
import { createT } from '../helpers/i18n';

const themeSettings: Record<string, unknown> = {};

vi.mock('@salla.sa/twilight-theme-engine/i18n', async () =>
  (await import('../helpers/i18n')).i18nModuleMock('ar')
);
vi.mock('@salla.sa/twilight-theme-engine/hooks/useTheme', () => ({
  useTheme: () => ({ color: {}, font: undefined, settings: themeSettings, isRTL: true }),
}));
vi.mock('@salla.sa/twilight-theme-engine/common', () => ({
  Breadcrumb: () => <nav data-testid="ox-breadcrumb" />,
  Link: ({ to, children, ...rest }: Record<string, unknown>) =>
    React.createElement('a', { href: String(to), ...rest }, children as React.ReactNode),
}));

const { AboutPage } = await import('../../app/components/pages/AboutPage');

const t = createT('ar');
const FULL = { cr_number: '1010', vat_number: '3000', maroof_url: 'https://maroof.sa/1' };

function setSettings(next: Record<string, unknown>) {
  for (const key of Object.keys(themeSettings)) delete themeSettings[key];
  Object.assign(themeSettings, next);
}

beforeEach(() => setSettings({}));

describe('AboutPage', () => {
  it('renders one h1 and the seven founders-story paragraphs', () => {
    renderWithProviders(<AboutPage />);
    const headings = screen.getAllByRole('heading', { level: 1 });
    expect(headings).toHaveLength(1);
    expect(headings[0].textContent).toBe(t('ox.pages.about.h1'));
    for (const n of [1, 2, 3, 4, 5, 6, 7]) {
      expect(screen.getByText(t(`ox.pages.about.story_${n}`))).toBeTruthy();
    }
  });

  it('names the story section after the store, not "the store\'s story"', () => {
    renderWithProviders(<AboutPage />);
    const heading = screen.getByRole('heading', { level: 2, name: t('ox.pages.about.story_title') });
    expect(heading).toBeTruthy();
  });

  it('renders the "how we work" section: three paragraphs and five short lines', () => {
    renderWithProviders(<AboutPage />);
    expect(
      screen.getByRole('heading', { level: 2, name: t('ox.pages.about.how_title') })
    ).toBeTruthy();
    for (const n of [1, 2, 3]) {
      expect(screen.getByText(t(`ox.pages.about.how_${n}`))).toBeTruthy();
    }
    for (const n of [1, 2, 3, 4, 5]) {
      expect(screen.getByText(t(`ox.pages.about.how_line_${n}`))).toBeTruthy();
    }
  });

  it('renders "what we have today" as a five-item list', () => {
    renderWithProviders(<AboutPage />);
    expect(screen.getByText(t('ox.pages.about.own_title'))).toBeTruthy();
    const items = screen.getAllByRole('listitem').filter((li) =>
      [1, 2, 3, 4, 5].some((n) => li.textContent === t(`ox.pages.about.own_${n}`))
    );
    expect(items).toHaveLength(5);
  });

  it('renders the closing tagline as a display line', () => {
    renderWithProviders(<AboutPage />);
    expect(screen.getByTestId('ox-about-closing').textContent).toBe(t('ox.pages.about.closing'));
  });

  it('orders the story before how-we-work before the own list before the closing tagline before the why panels', () => {
    renderWithProviders(<AboutPage />);
    const body = document.body;
    const at = (text: string): number => {
      const walker = document.createTreeWalker(body, NodeFilter.SHOW_TEXT);
      let node = walker.nextNode();
      let index = 0;
      while (node) {
        if (node.textContent === text) return index;
        index += 1;
        node = walker.nextNode();
      }
      return -1;
    };
    const storyAt = at(t('ox.pages.about.story_title'));
    const howAt = at(t('ox.pages.about.how_title'));
    const ownAt = at(t('ox.pages.about.own_title'));
    const closingAt = at(t('ox.pages.about.closing'));
    const whyAt = at(t('ox.pages.about.why_title'));
    expect(storyAt).toBeGreaterThanOrEqual(0);
    expect(storyAt).toBeLessThan(howAt);
    expect(howAt).toBeLessThan(ownAt);
    expect(ownAt).toBeLessThan(closingAt);
    expect(closingAt).toBeLessThan(whyAt);
  });

  it('carries the medical line verbatim, once', () => {
    renderWithProviders(<AboutPage />);
    expect(screen.getByTestId('ox-medical-line').textContent).toBe(t('ox.services.medical_line'));
  });

  it('hides the registration panel until all three registration settings are filled', () => {
    renderWithProviders(<AboutPage />);
    expect(screen.queryByTestId('ox-registration-panel')).toBeNull();

    for (const missing of Object.keys(FULL)) {
      const partial = { ...FULL } as Record<string, unknown>;
      delete partial[missing];
      setSettings(partial);
      const { unmount } = renderWithProviders(<AboutPage />);
      expect(screen.queryByTestId('ox-registration-panel')).toBeNull();
      unmount();
    }
  });

  it('renders the registration line with every number interpolated once all three are set', () => {
    setSettings(FULL);
    renderWithProviders(<AboutPage />);
    const panel = screen.getByTestId('ox-registration-panel');
    expect(panel.textContent).toContain('1010');
    expect(panel.textContent).toContain('3000');
    expect(panel.textContent).toContain('https://maroof.sa/1');
    expect(panel.textContent).not.toContain('{{');
  });

  it('opens on the band, which carries the h1 and the owner mark as an asset', () => {
    renderWithProviders(<AboutPage />);
    const band = screen.getByTestId('ox-band');
    expect(band).toBeTruthy();
    // Both tones render (S9e item 2): CSS picks the dark-ground file from
    // 1024 and the page-ink file below it (`_b5-pages.scss` §2a).
    const mark = band.querySelector('.ox-bband__lockup-mark--dark img');
    expect(mark?.getAttribute('src')).toBe('/assets/brand/optimalx-full-reverse.png');
  });

  it('replaces the reference stat strip with three facts the store can prove', () => {
    renderWithProviders(<AboutPage />);
    const strip = screen.getByTestId('ox-stat-strip');
    expect(strip.getAttribute('data-count')).toBe('3');
    const text = strip.textContent ?? '';
    // The reference reads "100+ Personalized Plans", "5+ Expert Specialists"
    // and "98% Client Satisfaction". None of the three may appear in any form.
    for (const banned of ['%', '100', '98', '+']) {
      expect(text).not.toContain(banned);
    }
    expect(text).toContain(t('ox.branch.locality'));
    expect(text).toContain(t('ox.pages.about.stat_shipping_sub'));
  });

  it('labels each registration number rather than running them into one line', () => {
    setSettings(FULL);
    renderWithProviders(<AboutPage />);
    const panel = screen.getByTestId('ox-registration-panel');
    expect(panel.querySelectorAll('[data-testid="ox-panel-row"]')).toHaveLength(3);
    expect(panel.textContent).toContain(t('ox.pages.about.cr_label'));
    expect(panel.textContent).toContain(t('ox.pages.about.vat_label'));
  });

  it('names no titles and no team size beyond the claims-source wording', () => {
    renderWithProviders(<AboutPage />);
    const text = document.body.textContent ?? '';
    for (const banned of ['أخصائي', 'صيدلي', 'مدرب معتمد', '%']) {
      expect(text).not.toContain(banned);
    }
  });
});
