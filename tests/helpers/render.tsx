/**
 * Render helper for component tests (P0 shared-file protocol).
 *
 * The existing tests render bare with `@testing-library/react` and mock the
 * engine sub-paths per file; this keeps that contract and adds the two
 * providers OptimalX components lean on: a fresh react-query client (blocks
 * that call `product.findOrThrow` through `useQuery`) and a direction wrapper
 * (`dir` and `lang` on the root element and on `<html>`), Arabic by default.
 *
 * Translations are not a provider: mock `@salla.sa/twilight-theme-engine/i18n`
 * per file with `i18nModuleMock` from ./i18n (see that file's header).
 */
import React, { type ReactElement, type ReactNode } from 'react';
import { render, type RenderOptions, type RenderResult } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

export type Lang = 'ar' | 'en';

export interface RenderWithProvidersOptions extends Omit<RenderOptions, 'wrapper'> {
  /** Document language; drives `dir` (ar is rtl, en is ltr). Default ar. */
  locale?: Lang;
  /** A client to share between renders; a fresh one otherwise. */
  queryClient?: QueryClient;
}

export interface RenderWithProvidersResult extends RenderResult {
  queryClient: QueryClient;
}

/** A client that never retries and never garbage-collects mid-test. */
export function createTestQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: Infinity, staleTime: Infinity },
      mutations: { retry: false },
    },
  });
}

export function renderWithProviders(
  ui: ReactElement,
  { locale = 'ar', queryClient = createTestQueryClient(), ...options }: RenderWithProvidersOptions = {}
): RenderWithProvidersResult {
  const dir = locale === 'ar' ? 'rtl' : 'ltr';
  document.documentElement.setAttribute('dir', dir);
  document.documentElement.setAttribute('lang', locale);

  function Wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        <div dir={dir} lang={locale} data-testid="ox-test-root">
          {children}
        </div>
      </QueryClientProvider>
    );
  }

  return { queryClient, ...render(ui, { wrapper: Wrapper, ...options }) };
}

export * from '@testing-library/react';
