# S8h — the newsletter, wired to a merchant-supplied destination

Builder S8h. One item: make the home newsletter block actually work on the
live store. `docs/build/progress/S8d.md` §2.1 already re-verified there is no
Salla-native newsletter primitive anywhere reachable (a full grep of
`node_modules/@salla.sa/twilight-theme-engine/dist` and the scraped live-Raed
fixture both return zero "newsletter" hits); this batch builds the honest
alternative the brief calls for: a merchant-supplied form action URL, never
an invented endpoint.

Read first, per the brief: `docs/build/progress/S8d.md` item 2 and §4 finding
5, `app/components/blocks/OxNewsletter.tsx`, `app/components/home/
OxCtaBand.tsx`, `twilight.json` (`show_newsletter`), `app/components/product/
lib/claims.ts` (the `settingText`/`settingFlag` pattern this batch's own
`settingString`/`isValidActionUrl` mirror without importing a product-only
module), `tests/blocks/OxNewsletter.test.tsx`, `tests/home/OxCtaBand.test.tsx`.

---

## 1. `twilight.json`: two new settings

Added directly after `show_newsletter` (same "خيارات اوبتيمال اكس" group):

- `newsletter_action_url` (`string`/`text`, default `""`) — the form action
  URL of the merchant's email service. `label`/`label_en` plus a description
  that names Mailchimp, Klaviyo and Brevo, tells the owner exactly where in
  Mailchimp to find it (Audience → Signup forms → Embedded form → the
  `<form action="…">` line), and states plainly that no valid `https://` URL
  means no visible form.
- `newsletter_email_field` (`string`/`text`, default `"EMAIL"`) — the field
  name the service expects for the address; Mailchimp's own embedded-form
  HTML uses `EMAIL`, so that is the shipped default, changeable for a service
  that names it something else.

`show_newsletter`'s own `description` gained one clause noting the form does
not actually appear until the URL is also filled in, so the two settings read
as a pair in the dashboard.

## 2. `OxNewsletter.tsx`: the render gate and the submission

**Render gate (item 3).** The block now renders only when `show_newsletter`
is on **and** `newsletter_action_url` is a valid `https://` URL (new exported
`isValidActionUrl`) — an unset or malformed URL is treated exactly like the
switch being off, because a submit with nowhere to go is a dead form. The
injectable `subscribe` prop **takes precedence**: when a caller supplies one,
the block renders on `show_newsletter` alone, no URL required. This keeps
every existing `subscribe`-driven test working unchanged and is the forward
path the docblock already named: the day a real Salla primitive exists, wiring
it in is `subscribe={salla.newsletter.subscribe}`, no merchant URL required.

**Submission (item 2), three paths in `onSubmit`, checked in this order:**

1. **Honeypot.** A hidden text input (`HONEYPOT_FIELD`, visually off-screen
   via inline `TRAP_STYLE` — no SCSS file is in this batch's scope —
   `aria-hidden="true"`, `tabIndex={-1}`, `autoComplete="off"`). A filled trap
   drops the submit silently: no request, no status change. Not a fake
   success — this file's own rule since S8d ("never a fabricated success")
   ruled out showing a bot a success line it did nothing to earn.
2. **`subscribe` supplied.** Unchanged from S8d: awaited, resolves to
   `success`, rejects to `error`.
3. **The merchant's URL.** `fetch(actionUrl, { method: 'POST', mode:
   'no-cors', body: FormData })`, the `FormData` keyed by `newsletter_email_
   field` (default `EMAIL`). `no-cors` makes the response opaque — the
   merchant's email service is not expected to send this storefront's origin
   a CORS header — so a **resolved** fetch is treated as success and a
   **rejected** one (offline, DNS, a hard block) as error; no status code is
   ever read, because none is ever visible.

**No-JS fallback.** The `<form>` itself now always carries `method="post"
action={actionUrl} target="_blank"` whenever the URL is valid (omitted
entirely otherwise), so a visitor with JavaScript off still gets a working
submit: the browser posts directly to the merchant's service and opens its
own reply in a new tab, this page never navigating away. The email `<input>`'s
own `name` is the configured `newsletter_email_field`, not a hardcoded
`"email"`, because the no-JS path's field name is whatever the browser
literally serialises from that attribute.

**A considered corollary, not asked for verbatim but required to make the
above true: `noValidate` is removed from the `<form>`.** The brief asks the
email input to carry `required`; with `noValidate` still set, the browser
skips all constraint validation on every native submit, so `required` would
be inert exactly in the one path it exists for (no JS, no custom validation
code to fall back on). Dropping `noValidate` costs nothing in the JS-on path:
`fireEvent.submit` in every existing test dispatches the `submit` event
directly and has never gone through native constraint validation (confirmed —
no test needed a change here), and a real browser's own native email-format
check is strictly looser than this file's `looksLikeEmail` (it accepts
single-label domains like `a@b`), so the custom Arabic error message still
has cases to catch even when native validation passes first.

**Accessibility (item 2's "status line is `aria-live="polite"`").** Both the
success line and the error line (which already covers both the immediate
"bad format" case and the async "transport failed" case, one `status` state
driving both) now carry `role="status"` **and** an explicit `aria-live=
"polite"` together — compatible, since `status`'s own implicit live setting
is already polite, so nothing conflicts. The error line previously carried
`role="alert"` (implicit `aria-live="assertive"`), which the brief's literal
instruction rules out; changed to match the success line's politeness
uniformly. Each line also gained `data-testid` (`ox-newsletter-success`,
`ox-newsletter-error`) so tests target them directly instead of by role, now
that both share `role="status"`. `autoComplete="email"`, `inputMode="email"`
and the screen-reader label were already correct and are unchanged;
`required` is new (above).

## 3. `OxCtaBand.tsx`: the gate mirrored

The band shares `OxNewsletter`'s registry slot and must never show a headline
promising a form that then does not render. Its own `visible` now reads
`show_newsletter && isValidActionUrl(newsletter_action_url)` — the exact
same exported check `OxNewsletter` itself uses, imported rather than
duplicated as a second regex — replacing the old `show_newsletter`-only
check. The band never passes `subscribe`, so it never gets that prop's
precedence; the URL is the only transport it can ever offer the form it
folds in.

## 4. The offline preview: `OFFLINE_SETTINGS`

`docs/build/progress/S8d.md` §4 finding 5 first named the gap: the offline
snapshot's `store-settings.json` predates every custom setting this theme has
since declared, so `data.theme.settings` never carried `show_newsletter`,
`inbody_included`, `reply_sla_hours`, `whatsapp_number` or (now)
`newsletter_action_url` — every gated block rendered its off state locally no
matter what a developer set in `twilight.json`.

Fixed in `scripts/serve-store.mjs`: a new `loadSettingsOverlay()` reads
`fixtures/store/overlay/settings.json` (new file, five keys exactly as the
brief specifies — `show_newsletter: true`, `newsletter_action_url:
"https://example.com/subscribe"`, `inbody_included: true`,
`reply_sla_hours: 24`, `whatsapp_number: "966500000000"`), merged over
`snapshot.settings.data.theme.settings` under the existing `OFFLINE_TAXONOMY=
1` switch — no new environment variable, the same one the categories/brands
overlay already uses. `newsletter_action_url`'s placeholder value is a valid
`https://` URL (so the "is this real" gate opens and the form renders
locally) but obviously not a real subscriber list; documented plainly so
nobody submits a test address expecting it to land anywhere.

Verified directly (§6 below): a temporary second instance on
`OFFLINE_API_PORT`-style port 5199, `OFFLINE_TAXONOMY=1`, `curl /store/
settings` — the five overlay keys are present in `data.theme.settings`
alongside the pre-existing engine-native ones — then stopped by this batch,
never left running, never touching the live `3210` preview.

`docs/build/offline-preview.md` gained a new "The settings overlay" section,
same place and shape as the existing taxonomy/brand-overlay sections, stating
the theme reads these through the identical `settings.<key>` path on the live
store — a different SOURCE of the same object, never a different mechanism.

## 5. `docs/build/owner-checklist.md`

New dated section G, item 29: how to get the form action URL from Mailchimp
(Audience → Signup forms → Embedded form → the `<form action="…">` line, the
email field already named `EMAIL`) and from Klaviyo (an Embed-type Form's own
published endpoint), a one-line note for any other service (the same
`action`/`name` pair, read off that service's own embeddable form HTML), and
the reminder that the theme cannot read the response back (`no-cors`), so a
real test address is the only way to confirm it lands.

## 6. Verification

```
$ pnpm typecheck
$ tsc --noEmit
(clean, no output)
```

```
$ pnpm vitest run tests/blocks tests/home tests/common
 Test Files  25 passed (25)
      Tests  288 passed (288)
```

```
$ pnpm check:rtl        → check-rtl: 331 file(s), 0 problem(s)
$ pnpm check:motion     → check-motion: 331 file(s), 0 problem(s)
$ pnpm check:strings    → check-strings: 339 file(s), 0 problem(s)
$ node scripts/check-copy.mjs locales/ar.json locales/en.json
                        → check-copy: 2 file(s), 0 problem(s)
$ node scripts/check-claims.mjs
                        → check-claims: 48 file(s), 0 problem(s), 4 allowlisted
                          (the four pre-existing official_distributors rows)
$ node scripts/check-tokens.mjs
                        → 123 token(s) defined, 325 file(s) scanned, 0 problem(s)
```

`scripts/serve-store.mjs` (no server was started or stopped on the shared
`3210`/`5178` preview — a temporary, isolated instance only, stopped by this
batch itself):

```
$ node --check scripts/serve-store.mjs        → syntax OK
$ OFFLINE_TAXONOMY=1 node scripts/serve-store.mjs --port 5199 &
$ curl -s http://127.0.0.1:5199/store/settings | … data.theme.settings …
  → show_newsletter: true, newsletter_action_url: "https://example.com/subscribe",
    inbody_included: true, reply_sla_hours: 24, whatsapp_number: "966500000000"
    (plus every pre-existing engine-native key, untouched)
$ [stopped: Stop-Process on the listening PID; confirmed by a refused
   connection on 127.0.0.1:5199 afterward]
```

---

## 7. Deviations, every one flagged

1. **`noValidate` removed from `OxNewsletter.tsx`'s `<form>`**, a line the
   brief does not name directly. Reason: the brief's own `required` on the
   email input would be inert in the no-JS fallback path this same batch
   builds if `noValidate` stayed — see §2 above for the full reasoning. No
   test needed a change to accommodate this (`fireEvent.submit` never went
   through native validation either way).
2. **The error line's `role` changed from `alert` to `status`** (both status
   lines now match), because `role="alert"`'s implicit `aria-live=
   "assertive"` directly contradicts the brief's literal "the status line is
   `aria-live="polite"`". Two existing tests that located the error line via
   `[role="alert"]` were updated to the new `data-testid="ox-newsletter-
   error"` instead (added for exactly this purpose, mirroring the success
   line's existing `data-testid`).
3. **No new locale keys.** Every string `OxNewsletter.tsx` reads
   (`ox.newsletter.title/.line/.success/.error/.invalid/.button/.placeholder/
   .privacy`) already existed before this batch; the honeypot field carries no
   visible or announced text at all. `locales/partials/s8h.*.json` was not
   created — there is nothing to put in it.
4. **`tests/home/OxCtaBand.test.tsx` edits touch every existing test's
   `setSettings` call**, not only new ones, because the band's own gate
   changed shape (`show_newsletter` alone → `show_newsletter` **and** a valid
   URL) and every existing test that renders the band now needs both.
