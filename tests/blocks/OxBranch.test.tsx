import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithProviders } from '../helpers/render';
import { BRANCH_LISTING } from '../../app/content/branch';
import { STORE_PHOTOS, storePhotoSrcSet } from '../../app/content/store-photos';

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
  Image: ({
    alt,
    src,
    width,
    height,
    srcSet,
    sizes,
    className,
  }: {
    alt: string;
    src?: string;
    width?: number;
    height?: number;
    srcSet?: string;
    sizes?: string;
    className?: string;
  }) => (
    <img alt={alt} src={src} width={width} height={height} srcSet={srcSet} sizes={sizes} className={className} />
  ),
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

  it('renders no cover at all until a real photograph is supplied', () => {
    setSettings({});
    const { container } = renderWithProviders(<OxBranch now={THURSDAY_NOON} />);
    // An angled cover with nothing in it reads as a failed upload, and the
    // theme may not ship an invented shopfront captioned as this branch: the
    // same content stack renders on a plain card instead.
    expect(container.querySelector('.ox-cover')).toBeNull();
    expect(container.querySelector('.ox-branch__content--flat')).not.toBeNull();
    // The booking and directions actions are unconditional (VISIT-2026-09-24
    // §4.1), so the flat card always carries a second group of controls, even
    // with no other setting filled.
    expect(container.querySelectorAll('.ox-branch__actions a').length).toBeGreaterThan(0);
  });

  it('takes the cover once the facts exist', () => {
    setSettings({ whatsapp_number: '+966 50 123 4567' });
    const { container } = renderWithProviders(
      <OxBranch photo="https://cdn.example/branch.jpg" now={THURSDAY_NOON} />
    );
    expect(container.querySelector('.ox-cover img')?.getAttribute('src')).toBe(
      'https://cdn.example/branch.jpg'
    );
    expect(container.querySelector('.ox-cover')).not.toBeNull();
    expect(container.querySelector('.ox-branch__content--flat')).toBeNull();
  });

  it('builds the cover photo from the storefront manifest entry, srcset included, with the slug-tuned gradient', () => {
    setSettings({});
    const branchPhoto = STORE_PHOTOS.storefront;
    const { container } = renderWithProviders(
      <OxBranch photo={branchPhoto.photo} now={THURSDAY_NOON} />
    );
    const img = container.querySelector('.ox-cover__photo');
    expect(img?.getAttribute('src')).toBe(branchPhoto.photo);
    expect(img?.getAttribute('width')).toBe(String(branchPhoto.width));
    expect(img?.getAttribute('height')).toBe(String(branchPhoto.height));
    expect(img?.getAttribute('srcset')).toBe(storePhotoSrcSet(branchPhoto));
    expect(container.querySelector('.ox-cover')?.className).toContain('ox-cover--storefront-block');
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

  it('always shows the booking and directions actions, and adds the quiet WhatsApp link once the number is set', () => {
    setSettings({});
    const bare = renderWithProviders(<OxBranch now={THURSDAY_NOON} />);
    const bareLinks = Array.from(
      bare.container.querySelectorAll<HTMLAnchorElement>('.ox-branch__actions a')
    );
    expect(bareLinks).toHaveLength(2);
    expect(bareLinks[0].textContent).toBe('احجز زيارتك');
    expect(bareLinks[1].textContent).toBe('الاتجاهات');
    expect(bareLinks[1].getAttribute('href')).toBe(BRANCH_LISTING.directionsUrl);
    expect(bareLinks[1].getAttribute('target')).toBe('_blank');
    expect(bareLinks[1].getAttribute('rel')).toBe('noopener noreferrer');
    bare.unmount();

    setSettings({ whatsapp_number: '+966 50 123 4567' });
    const filled = renderWithProviders(<OxBranch now={THURSDAY_NOON} />);
    const links = Array.from(
      filled.container.querySelectorAll<HTMLAnchorElement>('.ox-branch__actions a')
    );
    expect(links).toHaveLength(3);
    expect(links[2].getAttribute('href')).toContain('https://wa.me/966501234567?text=');
    expect(links[2].className).toContain('ox-btn--link');
  });

  it('shows the store rating once the four google_* settings are filled, nothing before', () => {
    setSettings({});
    const off = renderWithProviders(<OxBranch now={THURSDAY_NOON} />);
    expect(off.container.querySelector('[data-testid="ox-store-rating"]')).toBeNull();
    off.unmount();

    setSettings({
      google_place_url: 'https://maps.google.com/?cid=1',
      google_rating: '5.0',
      google_review_count: '80',
      google_verified_at: '2026-09-24',
    });
    const on = renderWithProviders(<OxBranch now={THURSDAY_NOON} />);
    expect(on.container.querySelector('[data-testid="ox-store-rating"]')).not.toBeNull();
  });

  it('states the visit offer only on the home block, and only while inbody_included is on', () => {
    setSettings({});
    const page = renderWithProviders(<OxBranch now={THURSDAY_NOON} />);
    expect(page.container.querySelector('.ox-branch__offer')).toBeNull();
    page.unmount();

    const home = renderWithProviders(<OxBranch showOfferLine now={THURSDAY_NOON} />);
    expect(home.container.querySelector('.ox-branch__offer')?.textContent).toBe(
      'قياس تكوين الجسم (InBody) مجانا في الفرع.'
    );
    home.unmount();

    setSettings({ inbody_included: false });
    const off = renderWithProviders(<OxBranch showOfferLine now={THURSDAY_NOON} />);
    expect(off.container.querySelector('.ox-branch__offer')).toBeNull();
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
