# B0 Foundation progress (resume notes)

Baseline: `pnpm typecheck` clean (19s), tests 44/44 per brief. Untracked from a prior attempt and kept as-is (sound): tests/i18n.test.ts, tests/seo/jsonld.test.ts. Owner files Logo.webp, public/Logo.webp untouched.

## Step 1 tokens.css - DONE
- app/styles/tokens.css rewritten to DIRECTION 2.1-2.9. 90 distinct custom properties; postcss parse OK; every required name present (checked by script). `--ox-h-bar` 56 -> 72 at 1024, `--ox-gutter` 16/24/32 at 640/1024 (DIRECTION 4.1 breakpoints). `--ox-band-h` given a root default of 560px so `--ox-wedge-run` resolves outside a band.
- `pnpm typecheck` exit 0.

## Facts verified for later steps
- `registerHomeComponentConfig` config key is `height` (engine maps it to `estimatedHeight` at chunk-WITIL2MK.js:685). Exported from `@salla.sa/twilight-theme-engine/routes/home`.
- `registry` exported from engine root (`dist/index.d.ts`), `registry.override(name, component)`.
- `head:end` is `<HookSlot name="head:end" ssr />` inside WidgetHead (chunk-RJPPO3ET.js:27), which TwilightProvider renders in readyContent (inside <body>). JSON-LD is valid there.
- MasterLayout runtime props: SallaLoginModal {isEmailAllowed, isMobileAllowed, isEmailRequired, suppressHydrationWarning}; SallaScopes {selection: 'mandatory'|'optional', suppressHydrationWarning}; SallaOfferModal {}. Wrapper subpaths: `@salla.sa/twilight-components-react/{login-modal,scopes,offer-modal}` via the `./*` export map. The Stencil types package (@salla.sa/twilight-components) is NOT installed (CDN external), so wrapper prop types are loose.
- `Header`/`Footer` from `/layout` are React.lazy; engine MasterLayout renders the non-lazy chunk versions without Suspense; I wrap with Suspense.
- `@uidotdev/usehooks`: unused in app/tests BUT an engine peerDependency (^2.4.1) and imported at runtime by 5 engine chunks -> must stay.
- Engine peer range for @tanstack/react-query is `~5.101.4` -> do not bump to 5.102/5.103 (would breach the engine peer contract).
- pnpm 12.4.2; settings live in pnpm-workspace.yaml (allowBuilds has sharp). Audit: 1 high, sharp 0.35.2 (<0.35.4) transitive via webpack>minimizer-webpack-plugin and miniflare.

## Step 2 tailwind.config.cjs - DONE
- colors dark/darker/danger -> var(--ox-graphite) / #0F0F12 / var(--ox-stop); `colors.ox.*` (28 keys) mapped to vars; boxShadow remapped to the three tokens, `progress` and `mobile` deleted (grep: zero consumers in app/ and engine dist); borderRadius sm 6px + full 9999px; transitionTimingFunction out/in/in-out; slideUp/DownFromBottom -> var(--dur-slow) + var(--ease-out|in); fontSize display/h1/h2/h3/lead/body/small/micro (clamp + lineHeight). Every legacy key kept.
- Verified with tailwindcss/resolveConfig (script) - all keys resolve.

## Step 3 bug fixes - DONE
- app/hooks/index.tsx: module-scope registerThemeHooks() removed (router.tsx call kept).
- app/server.ts + app/client.tsx: Sentry id 'raed' -> 'optimalx'.
- app/routes/__root.tsx: TanStackRouterDevtools now DEV-gated lazy import (RouterDevtools) like DevSettingsWidget.

## Step 4 layout seam - IN PROGRESS
- Created app/components/layout/SkipLink.tsx (sr-only until focus, targets #main-content, t('ox.a11y.skip')).
- Created app/components/layout/OptimalXLayout.tsx (engine tree + SkipLink first; Header/Footer from /layout in Suspense; three lazy modals with the engine's runtime props).
- TODO: pass layout={OptimalXLayout} in __root.tsx, typecheck.

## Resume note (after session reset)
- HEAD moved to 5464b3a "commit_editmsg" (owner tooling committed the tree). All B0 files up to step 7's non-app parts are in it; tree clean on top. Never stage/commit.

## Step 4 - DONE (layout={OptimalXLayout} wired in __root.tsx; typecheck 0)
## Step 5 - DONE (home/register.ts + product/register.ts; router.tsx calls both; typecheck 0)
- product/register.ts is a documented no-op: engine never registers product:card, so override degrades to register and never swaps; existing wrapper renders the engine card so an effective override would recurse. B3 owns the real override. DEVIATION to report.
## Step 6/7 - IN PROGRESS
- Written: scripts/check-jsonld.mjs, scripts/check-copy.mjs, tests/fixtures/jsonld/{site,product-page}.json, package.json scripts check:copy + check:jsonld, locales ox.* keys (5 each), ar diacritics stripped in 2 existing values (thank_you.hero_title, header.browse_all) because the mandated tests/check:copy forbid them. DEVIATION to report.
- Written now: app/components/seo/head.ts, jsonld.ts, registerHeadHooks.tsx; router.tsx calls registerHeadHooks().
- NEXT: typecheck, pnpm test, check:copy, check:jsonld. Then step 8 deps, step 9 twilight.json, final verification.
