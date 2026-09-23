import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { fireEvent, screen, waitFor } from '@testing-library/react';
import { renderWithProviders } from '../helpers/render';

const themeSettings: Record<string, unknown> = {};
const VALID_URL = 'https://example.com/subscribe';

vi.mock('@salla.sa/twilight-theme-engine/i18n', async () => (await import('../helpers/i18n')).i18nModuleMock('ar'));
vi.mock('@salla.sa/twilight-theme-engine/hooks/useTheme', () => ({
  useTheme: () => ({ color: {}, font: undefined, settings: themeSettings, isRTL: true }),
}));
vi.mock('@salla.sa/twilight-theme-engine/common', () => ({
  Link: ({ to, children, ...rest }: Record<string, unknown>) =>
    React.createElement('a', { href: to as string, ...rest }, children as React.ReactNode),
  Image: ({ alt, src }: { alt: string; src?: string }) => <img alt={alt} src={src} />,
}));

const { OxNewsletter, looksLikeEmail, isValidActionUrl } = await import('../../app/components/blocks/OxNewsletter');

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

  it('renders once the setting is on and a valid https action URL is saved', () => {
    setSettings({ show_newsletter: true, newsletter_action_url: VALID_URL });
    renderWithProviders(<OxNewsletter />);
    expect(screen.getByTestId('ox-newsletter')).toBeTruthy();
  });

  it('stays hidden with show_newsletter on but no action URL - a dead form must never ship', () => {
    setSettings({ show_newsletter: true });
    const { container } = renderWithProviders(<OxNewsletter />);
    expect(container.querySelector('[data-testid="ox-newsletter"]')).toBeNull();
  });

  it('stays hidden when the saved action URL is not https', () => {
    setSettings({ show_newsletter: true, newsletter_action_url: 'http://example.com/subscribe' });
    const { container } = renderWithProviders(<OxNewsletter />);
    expect(container.querySelector('[data-testid="ox-newsletter"]')).toBeNull();
  });

  it('a supplied subscribe prop takes precedence and renders with no action URL saved', () => {
    setSettings({ show_newsletter: true });
    const subscribe = vi.fn().mockResolvedValue(undefined);
    renderWithProviders(<OxNewsletter subscribe={subscribe} />);
    expect(screen.getByTestId('ox-newsletter')).toBeTruthy();
  });

  it('isValidActionUrl accepts only a real https URL', () => {
    expect(isValidActionUrl(VALID_URL)).toBe(true);
    expect(isValidActionUrl('http://example.com/subscribe')).toBe(false);
    expect(isValidActionUrl('')).toBe(false);
    expect(isValidActionUrl('not a url')).toBe(false);
  });

  it('labels the field, keeps it dir ltr, marks it required, and never submits an invalid address', async () => {
    setSettings({ show_newsletter: true });
    const subscribe = vi.fn().mockResolvedValue(undefined);
    const { container } = renderWithProviders(<OxNewsletter subscribe={subscribe} />);
    const input = container.querySelector('input[type="email"]') as HTMLInputElement;
    const label = container.querySelector('label') as HTMLLabelElement;

    expect(label.getAttribute('for')).toBe(input.id);
    expect(label.className).toContain('ox-sr-only');
    expect(input.getAttribute('dir')).toBe('ltr');
    expect(input.hasAttribute('required')).toBe(true);
    expect(input.getAttribute('autocomplete')).toBe('email');
    expect(input.getAttribute('inputmode')).toBe('email');

    fireEvent.change(input, { target: { value: 'not-an-email' } });
    fireEvent.submit(container.querySelector('form') as HTMLFormElement);
    await waitFor(() => expect(input.getAttribute('aria-invalid')).toBe('true'));
    expect(subscribe).not.toHaveBeenCalled();
    expect(input.getAttribute('aria-describedby')).toBe(screen.getByTestId('ox-newsletter-error').id);
  });

  it('replaces the form with one announced success line', async () => {
    setSettings({ show_newsletter: true });
    const subscribe = vi.fn().mockResolvedValue(undefined);
    const { container } = renderWithProviders(<OxNewsletter subscribe={subscribe} />);
    fireEvent.change(container.querySelector('input[type="email"]') as HTMLInputElement, {
      target: { value: 'a@b.co' },
    });
    fireEvent.submit(container.querySelector('form') as HTMLFormElement);

    await waitFor(() => expect(screen.getByTestId('ox-newsletter-success')).toBeTruthy());
    expect(subscribe).toHaveBeenCalledWith('a@b.co');
    expect(container.querySelector('form')).toBeNull();
    const success = screen.getByTestId('ox-newsletter-success');
    expect(success.getAttribute('role')).toBe('status');
    expect(success.getAttribute('aria-live')).toBe('polite');
  });

  it('shows the announced error line when the transport rejects', async () => {
    setSettings({ show_newsletter: true });
    const subscribe = vi.fn().mockRejectedValue(new Error('nope'));
    const { container } = renderWithProviders(<OxNewsletter subscribe={subscribe} />);
    fireEvent.change(container.querySelector('input[type="email"]') as HTMLInputElement, {
      target: { value: 'a@b.co' },
    });
    fireEvent.submit(container.querySelector('form') as HTMLFormElement);
    await waitFor(() => expect(screen.getByTestId('ox-newsletter-error')).toBeTruthy());
    const error = screen.getByTestId('ox-newsletter-error');
    expect(error.getAttribute('aria-live')).toBe('polite');
  });

  it('accepts only an address with one at sign and a dotted domain', () => {
    expect(looksLikeEmail('a@b.co')).toBe(true);
    expect(looksLikeEmail('a@b')).toBe(false);
    expect(looksLikeEmail('a@@b.co')).toBe(false);
    expect(looksLikeEmail('@b.co')).toBe(false);
    expect(looksLikeEmail('a b@c.co')).toBe(false);
  });

  describe('the honest default path: a merchant-supplied action URL', () => {
    beforeEach(() => {
      setSettings({ show_newsletter: true, newsletter_action_url: VALID_URL });
      vi.stubGlobal('fetch', vi.fn());
    });
    afterEach(() => {
      vi.unstubAllGlobals();
    });

    it('carries the plain-form fallback for a visitor with no JS', () => {
      const { container } = renderWithProviders(<OxNewsletter />);
      const form = container.querySelector('form') as HTMLFormElement;
      expect(form.getAttribute('method')).toBe('post');
      expect(form.getAttribute('action')).toBe(VALID_URL);
      expect(form.getAttribute('target')).toBe('_blank');
    });

    it('POSTs by fetch with mode no-cors and the default EMAIL field once JS runs', async () => {
      (fetch as ReturnType<typeof vi.fn>).mockResolvedValue(new Response());
      const { container } = renderWithProviders(<OxNewsletter />);
      fireEvent.change(container.querySelector('input[type="email"]') as HTMLInputElement, {
        target: { value: 'a@b.co' },
      });
      fireEvent.submit(container.querySelector('form') as HTMLFormElement);

      await waitFor(() => expect(screen.getByTestId('ox-newsletter-success')).toBeTruthy());
      expect(fetch).toHaveBeenCalledTimes(1);
      const [url, init] = (fetch as ReturnType<typeof vi.fn>).mock.calls[0] as [string, RequestInit];
      expect(url).toBe(VALID_URL);
      expect(init.method).toBe('POST');
      expect(init.mode).toBe('no-cors');
      expect((init.body as FormData).get('EMAIL')).toBe('a@b.co');
    });

    it('treats an opaque resolved fetch as success (no-cors carries no readable status)', async () => {
      (fetch as ReturnType<typeof vi.fn>).mockResolvedValue(new Response());
      const { container } = renderWithProviders(<OxNewsletter />);
      fireEvent.change(container.querySelector('input[type="email"]') as HTMLInputElement, {
        target: { value: 'a@b.co' },
      });
      fireEvent.submit(container.querySelector('form') as HTMLFormElement);
      await waitFor(() => expect(screen.getByTestId('ox-newsletter-success')).toBeTruthy());
    });

    it('shows the error line when the fetch itself rejects', async () => {
      (fetch as ReturnType<typeof vi.fn>).mockRejectedValue(new TypeError('network'));
      const { container } = renderWithProviders(<OxNewsletter />);
      fireEvent.change(container.querySelector('input[type="email"]') as HTMLInputElement, {
        target: { value: 'a@b.co' },
      });
      fireEvent.submit(container.querySelector('form') as HTMLFormElement);
      await waitFor(() => expect(screen.getByTestId('ox-newsletter-error')).toBeTruthy());
    });

    it('uses newsletter_email_field when the merchant set one', async () => {
      setSettings({ show_newsletter: true, newsletter_action_url: VALID_URL, newsletter_email_field: 'mail_address' });
      (fetch as ReturnType<typeof vi.fn>).mockResolvedValue(new Response());
      const { container } = renderWithProviders(<OxNewsletter />);
      const input = container.querySelector('input[type="email"]') as HTMLInputElement;
      expect(input.getAttribute('name')).toBe('mail_address');
      fireEvent.change(input, { target: { value: 'a@b.co' } });
      fireEvent.submit(container.querySelector('form') as HTMLFormElement);
      await waitFor(() => expect(screen.getByTestId('ox-newsletter-success')).toBeTruthy());
      const [, init] = (fetch as ReturnType<typeof vi.fn>).mock.calls[0] as [string, RequestInit];
      expect((init.body as FormData).get('mail_address')).toBe('a@b.co');
    });

    it('drops a honeypot-filled submit silently: no fetch, no status change', () => {
      const { container } = renderWithProviders(<OxNewsletter />);
      const trap = container.querySelector('input[aria-hidden="true"]') as HTMLInputElement;
      const email = container.querySelector('input[type="email"]') as HTMLInputElement;
      fireEvent.change(trap, { target: { value: 'a bot filled this' } });
      fireEvent.change(email, { target: { value: 'a@b.co' } });
      fireEvent.submit(container.querySelector('form') as HTMLFormElement);

      expect(fetch).not.toHaveBeenCalled();
      expect(container.querySelector('[data-testid="ox-newsletter-success"]')).toBeNull();
      expect(container.querySelector('[data-testid="ox-newsletter-error"]')).toBeNull();
      expect(trap.getAttribute('tabindex')).toBe('-1');
      expect(trap.getAttribute('aria-hidden')).toBe('true');
    });
  });
});
