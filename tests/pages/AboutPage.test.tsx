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
  it('renders one h1 and the four story paragraphs', () => {
    renderWithProviders(<AboutPage />);
    const headings = screen.getAllByRole('heading', { level: 1 });
    expect(headings).toHaveLength(1);
    expect(headings[0].textContent).toBe(t('ox.pages.about.h1'));
    expect(screen.getByText(t('ox.pages.about.story_1'))).toBeTruthy();
    expect(screen.getByText(t('ox.pages.about.story_4'))).toBeTruthy();
  });

  it('carries the medical line verbatim', () => {
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

  it('names no titles and no team size beyond the claims-source wording', () => {
    renderWithProviders(<AboutPage />);
    const text = document.body.textContent ?? '';
    for (const banned of ['أخصائي', 'صيدلي', 'مدرب معتمد', '%']) {
      expect(text).not.toContain(banned);
    }
  });
});
