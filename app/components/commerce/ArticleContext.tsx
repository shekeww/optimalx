import { createContext, useContext, type ReactNode } from 'react';
import type { ArticleDetail, ArticleSummary } from '@salla.sa/twilight-theme-engine/routes/blog';

export interface ArticleContextValue {
  article: ArticleDetail;
  related: ArticleSummary[];
}

const ArticleContext = createContext<ArticleContextValue | null>(null);

/**
 * The article the blog-single route is rendering, for the handlers that sit
 * in the engine's `blog:single.*` hook slots.
 *
 * The engine passes those slots no context (hooks/HookSlot.js builds
 * `{...context, twilight}` and the blog page calls `<HookSlot name=... />`
 * with no `context` prop at all), so the route wrapper puts the article in a
 * context of our own around `BlogSingle.Component`. The handler is rendered
 * as a child of the engine page, so it reads the provider normally.
 */
export function ArticleProvider({
  value,
  children,
}: {
  value: ArticleContextValue;
  children: ReactNode;
}) {
  return <ArticleContext.Provider value={value}>{children}</ArticleContext.Provider>;
}

export function useArticle(): ArticleContextValue | null {
  return useContext(ArticleContext);
}
