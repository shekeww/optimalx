import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import { renderWithProviders } from '../helpers/render';
import { SERVICE_CHANNELS } from '../../app/content/services';

const detail = vi.fn();
const themeSettings: Record<string, unknown> = {};

vi.mock('@salla.sa/twilight-theme-engine/i18n', async () => (await import('../helpers/i18n')).i18nModuleMock('ar'));
vi.mock('@salla.sa/twilight-theme-engine/hooks/useTheme', () => ({
  useTheme: () => ({ color: {}, font: undefined, settings: themeSettings, isRTL: true }),
}));
vi.mock('@salla.sa/twilight-theme-engine/api/product', () => ({
  product: {
    queries: {
      detail: (id: string) => ({ queryKey: ['products', 'detail', id], queryFn: () => detail(id) }),
    },
  },
}));
vi.mock('@salla.sa/twilight-theme-engine/common', () => ({
  Link: ({ to, children, ...rest }: Record<string, unknown>) =>
    React.createElement('a', { href: to as string, ...rest }, children as React.ReactNode),
  Image: ({ alt, src }: { alt: string; src?: string }) => <img alt={alt} src={src} />,
}));
vi.mock('@salla.sa/twilight-theme-engine/hooks/useMoney', () => ({
  useMoney: () => ({
    format: (value: unknown) => `${value} SAR`,
    parse: Number,
    isValid: () => true,
  }),
}));

const { ChannelCard } = await import('../../app/components/blocks/ChannelCard');

const WRITTEN = SERVICE_CHANNELS.find((channel) => channel.id === 'written')!;
const VIDEO = SERVICE_CHANNELS.find((channel) => channel.id === 'video')!;

beforeEach(() => {
  for (const key of Object.keys(themeSettings)) delete themeSettings[key];
});

describe('ChannelCard', () => {
  it('shows the shared free label when the live product costs nothing', async () => {
    detail.mockResolvedValueOnce({ id: 1, price: 0 });
    renderWithProviders(<ChannelCard channel={WRITTEN} productId={1} />);
    await waitFor(() => expect(screen.getByTestId('ox-channel-price').textContent).toBe('مجاني'));
  });

  it('formats a real price through useMoney and never prints it as copy', async () => {
    detail.mockResolvedValueOnce({ id: 2, price: '50' });
    renderWithProviders(<ChannelCard channel={VIDEO} productId={2} />);
    await waitFor(() => expect(screen.getByTestId('ox-channel-price').textContent).toBe('50 SAR'));
  });

  it('leaves the price row empty while the product is unknown', () => {
    renderWithProviders(<ChannelCard channel={WRITTEN} productId={undefined} />);
    expect(screen.getByTestId('ox-channel-price').textContent).toBe('');
  });

  it('renders the consultation credit only when the owner has written it', () => {
    const bare = renderWithProviders(<ChannelCard channel={VIDEO} productId={2} />);
    expect(bare.container.querySelector('[data-testid="ox-channel-credit"]')).toBeNull();
    bare.unmount();

    themeSettings.consultation_credit_note = 'قيمتها تعود إليك على طلبك الأول.';
    renderWithProviders(<ChannelCard channel={VIDEO} productId={2} />);
    expect(screen.getByTestId('ox-channel-credit').textContent).toBe(
      'قيمتها تعود إليك على طلبك الأول.'
    );
  });

  it('links the CTA at the channel route', () => {
    const { container } = renderWithProviders(<ChannelCard channel={WRITTEN} productId={1} />);
    expect(container.querySelector('.ox-channel__cta')?.getAttribute('href')).toBe(WRITTEN.to);
  });
});
