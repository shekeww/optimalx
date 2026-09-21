import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithProviders } from '../helpers/render';

const themeSettings: Record<string, unknown> = {};

vi.mock('@salla.sa/twilight-theme-engine/i18n', async () => (await import('../helpers/i18n')).i18nModuleMock('ar'));
vi.mock('@salla.sa/twilight-theme-engine/hooks/useTheme', () => ({
  useTheme: () => ({ color: {}, font: undefined, settings: themeSettings, isRTL: true }),
}));
vi.mock('@salla.sa/twilight-theme-engine/hooks/useStore', () => ({
  useStore: () => ({ settings: {}, contacts: {} }),
}));
vi.mock('@salla.sa/twilight-theme-engine/hooks', () => ({
  useOpeningHours: () => ({ isOpen: false, isEnabled: false, nextOpen: null, nextOpenFormatted: '' }),
}));
vi.mock('@salla.sa/twilight-theme-engine/common', () => ({
  Image: ({ alt, src }: { alt: string; src?: string }) => <img alt={alt} src={src} />,
  Link: ({ to, children, ...rest }: Record<string, unknown>) =>
    React.createElement('a', { href: to as string, ...rest }, children as React.ReactNode),
}));
vi.mock('@salla.sa/twilight-theme-engine/hooks/useMoney', () => ({
  useMoney: () => ({ format: (value: unknown) => String(value), parse: Number, isValid: () => true }),
}));

const { OxBranch } = await import('../../app/components/blocks/OxBranch');
const { digitsOnly, safeExternalUrl } = await import('../../app/components/blocks/href');

function setSettings(next: Record<string, unknown>) {
  for (const key of Object.keys(themeSettings)) delete themeSettings[key];
  Object.assign(themeSettings, next);
}

// 2026-09-17 is a Thursday inside the Sunday-to-Thursday row.
const THURSDAY_NOON = new Date('2026-09-17T12:00:00');
const HOURS = ['الأحد إلى الخميس: 09:00 - 23:00', 'الجمعة: 16:00 - 23:00'].join('\n');

describe('OxBranch', () => {
  it('hides the hours table when branch_hours is empty', () => {
    setSettings({});
    renderWithProviders(<OxBranch now={THURSDAY_NOON} />);
    expect(screen.getByTestId('ox-branch')).toBeTruthy();
    expect(screen.queryByTestId('ox-hours-status')).toBeNull();
    expect(screen.queryByRole('table')).toBeNull();
  });

  it('renders no photo panel at all until a real photograph is supplied', () => {
    setSettings({});
    const { container } = renderWithProviders(<OxBranch now={THURSDAY_NOON} />);
    // An angled plate with nothing in it reads as a failed upload, and the
    // theme may not ship an invented shopfront captioned as this branch.
    expect(container.querySelector('.ox-branch__photo')).toBeNull();
    expect(container.querySelector('.ox-branch')?.classList.contains('ox-branch--flat')).toBe(true);
    // Nothing else in the second column either, so the card stays one column.
    expect(container.querySelector('.ox-branch__card')?.getAttribute('data-meta')).toBe('bare');
  });

  it('takes the photo panel and the two column card once the facts exist', () => {
    setSettings({ whatsapp_number: '+966 50 123 4567' });
    const { container } = renderWithProviders(
      <OxBranch photo="https://cdn.example/branch.jpg" now={THURSDAY_NOON} />
    );
    expect(container.querySelector('.ox-branch__photo img')?.getAttribute('src')).toBe(
      'https://cdn.example/branch.jpg'
    );
    expect(container.querySelector('.ox-branch')?.classList.contains('ox-branch--flat')).toBe(false);
    expect(container.querySelector('.ox-branch__card')?.getAttribute('data-meta')).toBe('full');
  });

  it('marks the row covering today and shows the live status chip', () => {
    setSettings({ branch_hours: HOURS });
    renderWithProviders(<OxBranch now={THURSDAY_NOON} />);
    const today = screen.getByTestId('ox-hours-today');
    expect(today.textContent).toContain('الأحد إلى الخميس');
    expect(today.textContent).toContain('اليوم');
    expect(screen.getByTestId('ox-hours-status').textContent).toBe('مفتوح الآن');
  });

  it('renders the eyebrow on the home block and the h1 without it on the branch page', () => {
    setSettings({});
    const home = renderWithProviders(<OxBranch headingLevel="h2" now={THURSDAY_NOON} />);
    expect(home.container.querySelector('.ox-branch__eyebrow')).not.toBeNull();
    expect(home.container.querySelector('h2')).not.toBeNull();
    home.unmount();

    const page = renderWithProviders(<OxBranch headingLevel="h1" showEyebrow={false} now={THURSDAY_NOON} />);
    expect(page.container.querySelector('.ox-branch__eyebrow')).toBeNull();
    expect(page.container.querySelector('h1')).not.toBeNull();
  });

  it('omits the WhatsApp and map buttons until their settings are filled', () => {
    setSettings({});
    const bare = renderWithProviders(<OxBranch now={THURSDAY_NOON} />);
    expect(bare.container.querySelectorAll('.ox-branch__actions a')).toHaveLength(0);
    bare.unmount();

    setSettings({ whatsapp_number: '+966 50 123 4567', branch_map_url: 'https://maps.example/x' });
    const filled = renderWithProviders(<OxBranch now={THURSDAY_NOON} />);
    const links = Array.from(filled.container.querySelectorAll<HTMLAnchorElement>('.ox-branch__actions a'));
    expect(links).toHaveLength(2);
    expect(links[0].getAttribute('href')).toContain('https://wa.me/966501234567?text=');
    expect(links[1].getAttribute('href')).toBe('https://maps.example/x');
  });

  it('adds the pickup hours to the note only when the setting is set', () => {
    setSettings({});
    const bare = renderWithProviders(<OxBranch now={THURSDAY_NOON} />);
    expect(bare.container.querySelector('.ox-branch__pickup')?.textContent).toBe('استلام مجاني من الفرع.');
    bare.unmount();

    setSettings({ pickup_ready_hours: '3' });
    const timed = renderWithProviders(<OxBranch now={THURSDAY_NOON} />);
    expect(timed.container.querySelector('.ox-branch__pickup')?.textContent).toContain('3');
  });

  it('keeps digits only in a wa.me number', () => {
    expect(digitsOnly('+966 (50) 123-4567')).toBe('966501234567');
    expect(digitsOnly('javascript:alert(1)')).toBe('1');
  });

  it('renders no map button for a setting that is not an absolute http URL', () => {
    for (const hostile of [
      'javascript:alert(1)',
      // A real tab inside the scheme: browsers ignore it, so the guard must not.
      `java${String.fromCharCode(9)}script:alert(1)`,
      'data:text/html,<script>alert(1)</script>',
      'vbscript:msgbox(1)',
      'file:///etc/passwd',
      '//evil.example/maps',
      '/maps/branch',
      '#maps',
      '   ',
    ]) {
      setSettings({ branch_map_url: hostile });
      const view = renderWithProviders(<OxBranch now={THURSDAY_NOON} />);
      expect(
        view.container.querySelectorAll('.ox-branch__actions a'),
        hostile
      ).toHaveLength(0);
      view.unmount();
    }
  });

  it('accepts only absolute http and https URLs for the map link', () => {
    expect(safeExternalUrl('https://maps.google.com/?q=1')).toBe('https://maps.google.com/?q=1');
    expect(safeExternalUrl('  http://maps.example/x  ')).toBe('http://maps.example/x');
    expect(safeExternalUrl('javascript:alert(1)')).toBe('');
    // The prefix test stands on its own, so a bypass that slips past
    // `isSafeHref` still cannot reach the href.
    expect(safeExternalUrl('java&#0;script:alert(1)')).toBe('');
    expect(safeExternalUrl('HTTPS://maps.example/x')).toBe('HTTPS://maps.example/x');
    expect(safeExternalUrl('/relative')).toBe('');
    expect(safeExternalUrl('')).toBe('');
  });
});
