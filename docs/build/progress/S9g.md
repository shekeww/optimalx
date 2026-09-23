# S9g — the language switch becomes obvious

Builder S9g, 2026-09-24. Owner instruction, quoted: "arabic and english
language switch can be confusing, as the other would only see the country;
it should be obvious to be a language switch, showing العربية in English,
and EN in the Arabic version." Scope: the Salla theme's
`UtilityBar.tsx`/`MobileDrawer.tsx`/`navLinks.ts`, the header region of
`_b1-layout.scss`, `locales/partials/s9g.*`, `tests/layout/*`, this file and
the `NAV-2026-09-23.md` addendum. The Shopify theme is a separate builder
(same instruction, `sections/header.liquid`).

Working log below, updated through the batch.

---

## Reading

- `UtilityBar.tsx`: the utility bar's end slot held `<CountryControl />` -
  the store's own country name (via `Intl.DisplayNames`) plus a chevron,
  opening Salla's localisation modal (`salla.event.dispatch
  ('localization::open')`). Nothing in it names a language at all; a
  shopper who does not already know the store's own country code would read
  "SA" (or "Saudi Arabia") and have no reason to think it switches language.
- `MobileDrawer.tsx`'s foot carried `<LocalizationButton
  className="ox-drawer__localize" />` - same modal, this one's own label is
  `languageName` (the CURRENT language's own name, e.g. "العربية" while
  already reading Arabic) plus the currency symbol. Also not obviously a
  language *switch*: it names the language you are already reading, not the
  one you would land on.
- `navLinks.ts` already carries every primitive a same-path, other-language
  link needs: `localeSegmentOf` (the leading `/ar`/`/en` segment),
  `stripLocale` (the path without it) and `withLocale` (re-adds a given
  locale, idempotent on a path that already carries one - the property that
  makes it safe to build a raw href by hand). It also documents the one
  precedent for a raw `<a>` in this header: the mega panel's shop trigger,
  kept raw because it carries disclosure props the engine `Link` does not,
  and because a real, hand-prefixed href still reaches the index with no JS.
- The engine's `Link` (`@salla.sa/twilight-theme-engine/common`) is typed
  `BaseLinkProps` - `to, href, children, className, style, title, target,
  rel, onClick, preload, replace, aria-label, itemProp, ref`, no index
  signature. `lang`/`hrefLang` are not in it, so this link had to be a raw
  `<a>` too (`TanStackLinkAdapter`'s own runtime *would* forward them, per
  `chunk-NCGZMLBS.js`, but `pnpm typecheck` would reject them on `<Link>`).
- `store.settings.is_multilingual` is a plain boolean on `Store.settings`
  (`dist/types/index.d.ts:114`), read the same way everywhere in this repo
  (`registerHeadHooks.tsx`, `LocalizationButton.tsx`, `pages/head.ts`). The
  store's own language list is a *different* object:
  `useTwilight().settings.languages` (`StoreContext.languages?: Language[]`,
  `dist/api/store.d.ts:12`) - `useTwilight().settings` is the engine's own
  `StoreContext`, not `Store.settings`, a naming collision `MobileDrawer.tsx`
  already had once (`useTheme().settings` is a third, unrelated
  `ThemeSettings`) and now has twice, commented at both read sites.
- `docs/live-theme/fixtures/fixture-home.html` (2026-09-20 snapshot):
  `is_multilingual: false`, `currencies_enabled: false`,
  `languages: {"AR": {...}}` only - the live store this batch's gate has to
  leave silent. The running preview server's own live data turned out to
  already answer `is_multilingual: true` with both `ar` and `en` by the time
  this batch verified against it (§ Verification) - a useful accident: it
  proved the ON state against real data, not only mocks.
- `docs/build/NAV-2026-09-23.md`'s 2026-09-24 addendum had already audited
  `CountryControl`/`LocalizationButton` against Shopify parity and kept them
  ("Shopify markets/language picker"). That audit was about platform
  *capability*, not about what this instruction is now asking to change -
  today's addendum supersedes that one row only.

---

## Build

**`app/components/layout/navLinks.ts`** - added `otherLocaleLink(pathname,
languages)`, a pure function: the current locale from the pathname's own
segment (default `ar`, the store's unprefixed default), the target is the
other of `{ar, en}` (the only pair this theme ships strings for), `null`
unless the store's own `languages` list carries that target, else `{ locale,
to, labelKey, ariaLabelKey }` - `to` is `withLocale(stripLocale(pathname),
target)`, and the two key names are chosen by `target` alone (`labelKey`:
the target's own name; `ariaLabelKey`: "switch to `<target>`", read from the
CURRENT page's own dictionary).

**`UtilityBar.tsx`** - a small `LanguageSwitch()` component reads
`useTwilight()` for `store.settings.is_multilingual` and
`settings.languages`, `useRouterPathname()` (the same SSR-safe router store
`NavBar.tsx`/`BottomTabBar.tsx` already read, not `useTwilight().location`,
which is empty on the first server pass) for the path, calls
`otherLocaleLink`, and renders `null` or a raw `<a
className="ox-util__lang" lang hrefLang aria-label data-testid>` with no
icon and no chevron - a quiet text link, never a button. Replaces
`<CountryControl />` in the bar's end slot; the `CountryControl` import is
gone from this file.

**`MobileDrawer.tsx`** - the same computation inline (the component already
reads several theme/store values before its return), reusing the drawer's
own `useStore()` for `is_multilingual` and one new `useTwilight()` call for
`settings.languages`. Renders the same `LanguageSwitch | null` shape as a
raw `<a className="ox-drawer__localize ox-localize" ...>` with the globe
glyph the old button carried, `onClick={onClose}` like every other drawer
link. Replaces `<LocalizationButton className="ox-drawer__localize" />`;
the `LocalizationButton` import is gone from this file.

**`_b1-layout.scss`** (header region only) - added `.ox-util__lang`: no
background, no border, the bar's own quiet-text colour pair
(`--ox-ink-2-on-dark` resting, `--ox-ink-on-dark` on hover/focus),
`min-block-size: 44px` (the bar itself is 48px tall at the breakpoint it
shows at, so the link sits centred with headroom either side). `.ox-localize`
is untouched (already 44px, already the drawer-foot shape the new link
reuses) - only its section-header comment was corrected to name what it now
serves. `.ox-util__country` is untouched too: `CountryControl.tsx` is not
deleted (a different file's own scope), so its styling stays valid, just
unreferenced from the render tree.

**Locale keys**, `locales/partials/s9g.{ar,en}.json` (merged with
`node scripts/i18n-merge.mjs`, 4 keys added to each of `locales/ar.json` and
`locales/en.json`, 0 conflicts):

| key | ar value | en value |
|---|---|---|
| `ox.header.lang_switch_en` | `EN` | `EN` |
| `ox.header.lang_switch_ar` | `العربية` | `العربية` |
| `ox.header.switch_language_en` | `تبديل اللغة إلى الإنجليزية` | `Switch language to English` |
| `ox.header.switch_language_ar` | `تبديل اللغة إلى العربية` | `Switch language to Arabic` |

The two `lang_switch_*` values are deliberately identical in both files:
the visible text is always the TARGET language's own name, never something
that changes with the CURRENT page's language, so both dictionaries have to
agree. Only one of each pair of `switch_language_*` keys is ever actually
read in production (`_en` from the ar dictionary, `_ar` from the en
dictionary - the target is always the other language); the other half of
each pair exists only so `i18n-merge.mjs`'s parity check (ar and en partials
must declare the same key set) passes, and is still correct, real copy, not
a placeholder.

**Not touched, on purpose:** `CountryControl.tsx`, `LocalizationButton.tsx`
(files kept; `LocalizationModal` is still mounted by `OptimalXLayout.tsx`
for whenever a currency switch is ever added - inert today, not broken,
since `currencies_enabled` is false on the live store and nothing now opens
it); `ox.header.country_change`, `ox.header.localization`, `ox.header
.language` (existing keys, still referenced by the untouched files, `
ox.header.language` itself unused anywhere already, before this batch).

---

## Verification

```
$ pnpm typecheck
$ tsc --noEmit
(no output - 0 errors)

$ pnpm vitest run tests/layout
 Test Files  8 passed (8)
      Tests  111 passed (111)

$ node scripts/check-strings.mjs
check-strings: 350 file(s), 0 problem(s)

$ node scripts/check-copy.mjs
check-copy: 56 file(s), 0 problem(s)

$ node scripts/check-identity.mjs
check-identity: 337 file(s), 0 problem(s)

$ node scripts/i18n-merge.mjs --check
i18n-merge: locales\ar.json: 1461 partial key(s), 0 added, 0 updated
i18n-merge: locales\en.json: 1461 partial key(s), 0 added, 0 updated
```

**Live preview** (`http://localhost:3210`, already running - not restarted,
per the brief): `curl /ar` and `/en` (the home page) both timed out at 90s -
the same pre-existing platform limitation `docs/build/progress/S9a-V3.md`
§2 and `S8e.md` §5 already recorded (the shared instance under concurrent
load). `/ar/branch` and `/en/branch` answered in under half a second and
carry the proof:

```
$ curl -s http://localhost:3210/ar/branch | grep -oE '<a[^>]*data-testid="ox-language-switch"[^>]*>[^<]*</a>'
<a href="/en/branch" class="ox-util__lang" lang="en" hrefLang="en" aria-label="تبديل اللغة إلى الإنجليزية" data-testid="ox-language-switch">EN</a>

$ curl -s http://localhost:3210/en/branch | grep -oE '<a[^>]*data-testid="ox-language-switch"[^>]*>[^<]*</a>'
<a href="/ar/branch" class="ox-util__lang" lang="ar" hrefLang="ar" aria-label="Switch language to Arabic" data-testid="ox-language-switch">العربية</a>
```

`hrefLang` renders in that exact case (not lowercased to `hreflang`) - not a
defect: the same page's own pre-existing `hreflangFor()` SEO cluster
(`<link rel="alternate" hreflang="...">`, unrelated to this batch) renders
identically as `hrefLang="x-default"`/`hrefLang="ar"`/`hrefLang="en"`, while
a genuinely case-normalised attribute on the same response
(`tabindex="-1"`, three occurrences) IS lowercased - proving this is simply
how this engine's SSR serialises that particular attribute name, and HTML
attribute names are ASCII-case-insensitive on parse regardless (a browser's
DOM has `hreflang` either way). `grep -c "ox-util__country\|ox-country-
control"` on the same response: `0` - the old country control is gone from
the utility bar.

This incidentally also proves the ON state (link present, correct text,
correct href, correct `lang`/`hreflang`, correct aria-label, in both
directions) against the currently connected store's real, live settings -
the running preview answered `is_multilingual: true` with both languages by
the time this batch verified, unlike the 2026-09-20 fixture snapshot in
`docs/live-theme/fixtures/`. The OFF state (no link when the store is not
multilingual, or lists only one language - the state that 2026-09-20
fixture, and the merchant's real live storefront, are actually in) is
covered by `tests/layout/UtilityBar.test.tsx` and the new `describe
('language switch')` block in `tests/layout/MobileDrawer.test.tsx`, plus
`otherLocaleLink`'s own unit tests in `tests/layout/linkResolution.test.ts`.

---

## Files touched

| file | why |
|---|---|
| `app/components/layout/navLinks.ts` | `otherLocaleLink` helper |
| `app/components/layout/Header/UtilityBar.tsx` | `CountryControl` replaced by the new `LanguageSwitch` |
| `app/components/layout/Header/MobileDrawer.tsx` | `LocalizationButton` replaced by the same link, inline |
| `app/styles/06-ox/_b1-layout.scss` | `.ox-util__lang` added; the localize section comment corrected |
| `locales/partials/s9g.ar.json`, `s9g.en.json` | the four new keys |
| `locales/ar.json`, `locales/en.json` | merged by `node scripts/i18n-merge.mjs` |
| `tests/layout/linkResolution.test.ts` | `otherLocaleLink` unit tests |
| `tests/layout/UtilityBar.test.tsx` | new file: the bar's language switch, both states |
| `tests/layout/MobileDrawer.test.tsx` | mocks widened for a mutable store/router state; new `language switch` tests |
| `docs/build/NAV-2026-09-23.md` | 2026-09-24 (S9g) addendum, superseding the country/language selector row |
| `docs/build/progress/S9g.md` | this file |

Read, not edited: `CountryControl.tsx`, `LocalizationButton.tsx`,
`OptimalXLayout.tsx`, `docs/build/progress/S9a-V3.md`,
`docs/live-theme/fixtures/fixture-home.html`.

## Deviations

None. The plan's own two open questions resolved from reading, not from a
guess: (1) the engine `Link` cannot carry `lang`/`hrefLang` (typed
`BaseLinkProps`), so both renders use a raw `<a>`, the same pattern the shop
trigger already established; (2) no new component file was added -
`otherLocaleLink` is the one shared piece (in `navLinks.ts`, as the plan's
own file list allows), and the two renders stayed local to
`UtilityBar.tsx`/`MobileDrawer.tsx` because a `.ts` helper file cannot hold
JSX.
