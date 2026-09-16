# Bug report — `@salla.sa/twilight-theme-engine`: SSR tree discarded on every page

**Severity:** High — affects every page of every React theme on this engine version. Silent in production.
**Package:** `@salla.sa/twilight-theme-engine@1.0.47` (current `latest`, published 2026-09-15)
**Reported:** 2026-09-16
**Environment:** React 19.2.8 · `@tanstack/react-start` 1.168.54 · Vite 8.2.2 · `@salla.sa/twilight-components-react@3.0.0-beta.1` · Node 22.22.2 · Windows
**Reproduction:** `salla theme create --type react` scaffold, unmodified root shell, any store. Reproduced on store `1888890798` in both `salla theme dev` and a production `vite build` + `vite preview`.

---

## Symptom

Every page throws React **error #418** (`Hydration failed because the server rendered HTML didn't match the client`). React discards the entire server-rendered tree and re-renders client-side. The storefront is not effectively server-rendered.

In development the console also shows:

```
[Twilight] Could not hydrate twilight context: no root match in router state
```

In production that warning is suppressed — `warnHydrationBail` is gated behind `import.meta.env?.DEV` — so the only visible symptom is a slow site. **We would not have found this without a dev build.**

---

## Root cause

### 1. `hydrateTwilightContext` bails before populating the client context

`dist/chunk-QVPMWMPP.js:483-503`

```js
function setupTwilightSsrIntegration(router, queryClient) {
  if (typeof window === "undefined") return;
  const ogHydrate = router.options.hydrate;
  router.options.hydrate = async (dehydratedData) => {
    await ogHydrate?.(dehydratedData);
    hydrateTwilightContext(router, queryClient);
  };
}

function hydrateTwilightContext(router, queryClient) {
  const rootMatch = router.state?.matches?.[0];
  if (!rootMatch) {
    warnHydrationBail("no root match in router state");
    return;                                    // ← context never populated
  }
  ...
}
```

`router.state.matches` is still empty at this point, even after `await ogHydrate(...)`. The function returns early, so `updateTwilightContext({ settings, locale, ... })` never runs on the client.

### 2. `isReady` therefore diverges between server and client

`dist/chunk-DTWFNS3F.js:130`

```js
const [isReady, setReady] = useState(() => !!settingsData);
```

Server: `settingsData` present → `isReady === true`.
Client: context was never populated → `settingsData` undefined → `isReady === false`.

### 3. `MasterLayout` renders `isReady` as a conditional child, so the children array changes shape

`dist/chunk-DTWFNS3F.js:1297`

```js
jsxs(I18nProvider, { i18nInstance, themeTranslations, children: [
  jsx(ThemeDocumentSync, { ... }),
  documentSyncElement,
  !isReady && jsx("div", { className: "loading-overlay", children: skeleton || jsx("div", { className: "loading-spinner" }) }),
  readyContent
]})
```

Server emits `[ThemeDocumentSync, documentSyncElement, false, readyContent]`.
Client emits `[ThemeDocumentSync, documentSyncElement, <div.loading-overlay>, null]`.

That is a structural mismatch, and React discards the tree.

**Confirmed against the served HTML.** In the SSR response, `app-inner` appears once outside `<style>`, and `loading-overlay` appears **zero** times outside `<style>` (its only occurrence is the CSS rule inside `<style id="twilight-loading">`). So the server rendered the app and the client renders the overlay.

---

## What this is *not*

The dev hydration diff prominently shows `<style id="twilight-loading">` mismatching against the Stencil `data-styles` nodes that the SDK inserts at the top of `<head>`. **That is a mis-binding, not the cause**, and it sent us down a dead end for some time. In React 19:

- `react-dom-client.development.js:4922` — `"head" === type` makes `<head>` fiber **tag 27** (HostSingleton)
- `:5358` — `if ((JSCompiler_temp = 3 !== tag && 27 !== tag))` — the leftover-unmatched-node throw is **disabled for tag 27**
- `:22390` — `case "style": if (instance.hasAttribute("data-precedence")) break;` — this is what makes the `twilight-loading` fiber claim the wrong node

React tolerates foreign children of a React-rendered `<head>`. Head ordering cannot raise #418. Adding `href` + `precedence` to `buildRootStyles()` output would silence the dev diff while React continues to discard the tree — please don't treat that as the fix.

---

## Why a theme cannot work around this

- `hydrateTwilightContext` and `updateTwilightContext` are internal — absent from `dist/index.d.ts` and `dist/tanstack.d.ts`.
- `TwilightProvider` exposes no `layout` prop, so `MasterLayout` cannot be replaced without re-implementing the login modal, scopes and offer-modal wiring by hand.
- Re-invoking `router.options.hydrate` after matches populate fails structurally: `Failed to execute 'getReader' on 'ReadableStream': ReadableStreamDefaultReader constructor can only accept readable streams that are not yet locked to a reader`. TanStack's dehydrated stream is single-read.
- `dist/vite/plugins/salla-hydration.plugin` (auto `suppressHydrationWarning` on `salla-*` JSX) is already active via `twilightReact()` and does not help — it covers the body, not the provider's own conditional render.

---

## Suggested fix

Either:

**(a)** Populate the twilight context from the dehydrated payload rather than from `router.state.matches`, so it does not depend on router timing; or

**(b)** Seed `isReady` identically on both sides — e.g. always start `false` and flip in an effect, so the first client render matches the server — rather than deriving initial state from data that is only available on one side.

(b) is the smaller change and removes the whole class of bug. Rendering a conditional child from state that is knowingly asymmetric across SSR and CSR will keep producing mismatches wherever it appears.

Please also consider un-gating `warnHydrationBail` in production, or emitting it once at `error` level. A silent hydration bail on every page is very hard for a theme developer to discover.

---

## Measured impact

Production build, Slow 4G, 4× CPU throttle, 390×844:

| Metric | Measured | Target |
|---|---|---|
| LCP | 6,582 – 7,798 ms (4 runs) | < 2,500 ms |
| CLS | 0.29 (invariant across 4 runs) | < 0.1 |

The LCP element's image downloads in **3–5 ms** but is discovered **~5.6–6.3 s** in — it does not exist in the painted DOM until the client re-render completes.

**Note, separately:** of 165 KB of SSR HTML only 18.7 KB (11%) is markup; `<main>` is 5.2 KB of skeletons inside Suspense boundaries, and the hero element appears zero times in server markup. So fixing hydration is necessary but likely not sufficient to hit the LCP target, and there may be a second issue in how home-block Suspense boundaries resolve during SSR. We have not investigated that one.
