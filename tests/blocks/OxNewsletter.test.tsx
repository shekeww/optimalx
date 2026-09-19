import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { fireEvent, screen, waitFor } from '@testing-library/react';
import { renderWithProviders } from '../helpers/render';

const themeSettings: Record<string, unknown> = {};

vi.mock('@salla.sa/twilight-theme-engine/i18n', async () => (await import('../helpers/i18n')).i18nModuleMock('ar'));
vi.mock('@salla.sa/twilight-theme-engine/hooks/useTheme', () => ({
  useTheme: () => ({ color: {}, font: undefined, settings: themeSettings, isRTL: true }),
}));
vi.mock('@salla.sa/twilight-theme-engine/common', () => ({
  Link: ({ to, children, ...rest }: Record<string, unknown>) =>
    React.createElement('a', { href: to as string, ...rest }, children as React.ReactNode),
  Image: ({ alt, src }: { alt: string; src?: string }) => <img alt={alt} src={src} />,
}));

const { OxNewsletter, looksLikeEmail } = await import('../../app/components/blocks/OxNewsletter');

function setSettings(next: Record<string, unknown>) {
  for (const key of Object.keys(themeSettings)) delete themeSettings[key];
  Object.assign(themeSettings, next);
}

describe('OxNewsletter', () => {
  it('renders nothing while show_newsletter is off', () => {
    setSettings({});
    const { container } = renderWithProviders(<OxNewsletter />);
    expect(container.querySelector('[data-testid="ox-newsletter"]')).toBeNull();
  });

  it('renders once the setting is on', () => {
    setSettings({ show_newsletter: true });
    renderWithProviders(<OxNewsletter />);
    expect(screen.getByTestId('ox-newsletter')).toBeTruthy();
  });

  it('labels the field, keeps it dir ltr, and never submits an invalid address', async () => {
    setSettings({ show_newsletter: true });
    const subscribe = vi.fn().mockResolvedValue(undefined);
    const { container } = renderWithProviders(<OxNewsletter subscribe={subscribe} />);
    const input = container.querySelector('input') as HTMLInputElement;
    const label = container.querySelector('label') as HTMLLabelElement;

    expect(label.getAttribute('for')).toBe(input.id);
    expect(label.className).toContain('ox-sr-only');
    expect(input.getAttribute('dir')).toBe('ltr');

    fireEvent.change(input, { target: { value: 'not-an-email' } });
    fireEvent.submit(container.querySelector('form') as HTMLFormElement);
    await waitFor(() => expect(input.getAttribute('aria-invalid')).toBe('true'));
    expect(subscribe).not.toHaveBeenCalled();
    expect(input.getAttribute('aria-describedby')).toBe(container.querySelector('[role="alert"]')?.id);
  });

  it('replaces the form with one announced success line', async () => {
    setSettings({ show_newsletter: true });
    const subscribe = vi.fn().mockResolvedValue(undefined);
    const { container } = renderWithProviders(<OxNewsletter subscribe={subscribe} />);
    fireEvent.change(container.querySelector('input') as HTMLInputElement, {
      target: { value: 'a@b.co' },
    });
    fireEvent.submit(container.querySelector('form') as HTMLFormElement);

    await waitFor(() => expect(screen.getByTestId('ox-newsletter-success')).toBeTruthy());
    expect(subscribe).toHaveBeenCalledWith('a@b.co');
    expect(container.querySelector('form')).toBeNull();
    expect(screen.getByTestId('ox-newsletter-success').getAttribute('role')).toBe('status');
  });

  it('shows the error line when the transport rejects', async () => {
    setSettings({ show_newsletter: true });
    const subscribe = vi.fn().mockRejectedValue(new Error('nope'));
    const { container } = renderWithProviders(<OxNewsletter subscribe={subscribe} />);
    fireEvent.change(container.querySelector('input') as HTMLInputElement, {
      target: { value: 'a@b.co' },
    });
    fireEvent.submit(container.querySelector('form') as HTMLFormElement);
    await waitFor(() => expect(container.querySelector('[role="alert"]')).not.toBeNull());
  });

  it('accepts only an address with one at sign and a dotted domain', () => {
    expect(looksLikeEmail('a@b.co')).toBe(true);
    expect(looksLikeEmail('a@b')).toBe(false);
    expect(looksLikeEmail('a@@b.co')).toBe(false);
    expect(looksLikeEmail('@b.co')).toBe(false);
    expect(looksLikeEmail('a b@c.co')).toBe(false);
  });
});
