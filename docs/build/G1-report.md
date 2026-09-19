# G1 security review, wave 1 (OWASP focus)

Scope: OptimalX Salla React theme, `C:\Users\Ahmed\OneDrive\Desktop\optimalx`, branch
`docs/engine-defect-and-spec-trueup`. No repository files were modified during this
review; all test runs used a copy of the additional vectors under the scratchpad
folder, executed with the repo's own `node_modules/.bin/vitest` binary.

## 1. sanitizeHtml.ts + tests/security/sanitize.test.ts

Read `app/components/product/lib/sanitizeHtml.ts` in full (554 lines): a hand-written,
regex-free (mostly), char-code tokenizer with a strict tag/attribute allowlist,
RAW_DROP subtree removal, single-pass entity decode, and re-serialisation from the
parsed node tree (never spliced from the input).

Ran the existing corpus: `npx vitest run tests/security/sanitize.test.ts` -> **37/37
pass** (20 XSS vectors + allowlist/behaviour/helper tests).

Wrote 25 additional adversarial vectors (18 pass/fail "must not contain" vectors + 7
structural/timing probes) in
`scratchpad/sanitize-extra.test.ts` and `scratchpad/sanitize-timing.test.ts`, run via
`cd <scratchpad> && node_modules/.bin/vitest.CMD run` (the repo's own
`vitest.config.ts` restricts `include` to `tests/**/*.test.{ts,tsx}`, so an external
path is invisible to it; running the binary directly with cwd = scratchpad picks up
vitest's zero-config default instead, without touching the repo tree).

**Result: 25/25 pass** (after correcting 3 of my own over-strict/inverted assertions;
see below). Full vector list and console output are in the scratchpad test files.

### Vectors and outcome

| # | Vector | Outcome |
|---|--------|---------|
| E1 | Entity-encoded quote breakout in href (`&quot;onmouseover=&quot;`) | Safe: decoded quote is re-escaped to `&quot;` on serialise, no attribute breakout. My first assertion (`mustNotContain: ['onmouseover']`) was wrong — it flagged the word appearing as **inert escaped text**, not a live attribute. Corrected to check for an unescaped `"onmouseover=` break; passes. |
| E2/E3 | Duplicate `href` attribute (malicious value first or last) | Safe: object-key overwrite means only the *last* occurrence is evaluated by `isSafeHref`; whichever wins is still gated. A malicious duplicate first or last never survives. |
| E4 | Form-feed + vertical-tab inside a `javascript:` scheme | Safe: both are control chars stripped by `isSafeHref`'s `code <= 32` filter; resulting scheme string is still `javascript`, still rejected. |
| E5 | Uppercase `DATA:` scheme with embedded `<script>` | Safe: scheme check lowercases before compare; RAW_DROP still eats the nested `<script>` text. |
| E6 | Backtick-"quoted" unquoted href value | Safe: backtick isn't a recognised quote char, so it's captured as part of the (rejected) scheme string. |
| E7 | `&#0;` (NUL) inside `java...script:` | Interesting case — see Finding 3 below. Not exploitable, but surfaces a real heuristic weakness in `isSafeHref`. |
| E8 | Fullwidth colon `：` (U+FF1A) standing in for `:` | Accepted as a "relative path" (no ASCII colon found) — harmless, since a browser's URL parser doesn't treat U+FF1A as a scheme delimiter either. Documented as F5, not a defect. |
| E9 | Mixed-case `<ScRipT SrC=...>` | Safe: `readTag` lowercases both tag and attribute names before the RAW_DROP/allowlist checks. |
| E10 | Duplicate `colspan` on `<td>` | Safe: last value wins, same object-key mechanics as E2/E3, still passed through the numeric-range check. |
| E11 | `xlink:href` on `<a>` alongside a real `href` | Safe: attribute allowlist keys are exact (`href` only for `a`); `xlink:href` is simply dropped. |
| E12 | Unterminated `<!--` comment swallowing a real `<script>` and trailing markup | Safe: `close < 0` branch consumes to end of input, correctly. |
| E13 | Protocol-relative href hidden behind a leading tab | Safe: tab stripped, `//` still detected, still rejected. |
| E14 | `mailto:` with an embedded `javascript:` in the query string | Safe: scheme check runs on the *whole* value; `mailto` isn't in the `http`/`https` allowlist, rejected outright (matches existing corpus's `mailto:` rejection). |
| E15 | `scope="javascript:alert(1)"` on `<th>` | Safe: `scope` is matched against an explicit enum (`row`/`col`/`rowgroup`/`colgroup`); anything else is dropped. |
| E16 | Self-closing `<base href="evil">` | Safe: `base` is in `RAW_DROP`; self-closing path (`tag.selfClosing`) is handled explicitly. |
| E17 | Uppercase-hex numeric entity `&#X6A;avascript&#X3A;` | Safe: `decodeEntities` checks `body.charAt(1) === 'x' || 'X'`, so uppercase hex decodes too, and the resulting `javascript:` string is still rejected by the scheme check. |

### Structural / timing findings (F1–F7) — see Findings 1–5 below for the security write-up

- F1: CDATA-style bogus declaration → content-integrity leak (Finding 5).
- F2: `</scripts>` satisfies a `</script` search → parser boundary bug, not exploitable in testing (Finding 4).
- F3: 20,000 levels of `<span>` nesting → **`RangeError: Maximum call stack size exceeded`**, thrown. Bisected: safe at 500/1000/2000 levels, throws at 5000/10000 (Finding 2).
- F4: `decodeEntities` on N repeated `&` with no `;` → confirmed **O(n²)**: 15k=6ms, 30k=20ms, 60k=81ms, 120k=316ms (each doubling of N roughly quadruples time) (Finding 1).
- F6: idempotency holds across the whole extra corpus (`sanitizeHtml(sanitizeHtml(x)) === sanitizeHtml(x)`).
- F7: `serialize()` alone (bypassing `keptAttrs`/`isSafeHref`, simulating a hypothetical future caller that hands it an unvetted node) still safely escapes a hostile attribute value (`"><script>alert(1)</script>` → `&quot;&gt;&lt;script&gt;...`). Good defense-in-depth signal for the serialise boundary.

## 2. dangerouslySetInnerHTML inventory (grepped all of `app/`)

Exactly four call sites, not three as the brief's expected inventory implies — the
fourth (`Sprite.tsx`) is a build-time static asset, not user/merchant data:

1. `app/components/seo/registerHeadHooks.tsx:99` — `toScriptText(doc)` output, JSON-LD `<script>`. Reviewed under section 3.
2. `app/components/product/BelowFold/Description.tsx:24` — `parts.bodyHtml` from `splitDescription()` (`app/components/product/lib/nutritionTable.ts:157-210`), which runs the raw product description through `parseFragment`/`serialize` (i.e. `sanitizeHtml`'s own primitives) before any of it reaches the DOM. Confirmed by reading `ProductPage.tsx:74-77,176`: `splitDescription(product.description, glossary)` is the only place `product.description` (merchant HTML) is consumed.
3. `app/components/common/Sprite.tsx:18` — `spriteMarkup`, imported at build time via `?raw` from a static file under `public/assets/icons/ox-sprite.svg` (per the file's own header comment). Not merchant or visitor data; not part of the OWASP-relevant inventory, but flagged here since it wasn't in the brief's named list.
4. Blog/article HTML is **not** rendered by custom theme code at all: `app/routes/blog_.$slug.a-$id.tsx` delegates entirely to `BlogSingle.Component` from `@salla.sa/twilight-theme-engine/routes/blog` (a Salla-native component, out of this theme's code). So "sanitised article HTML" the brief expected to find does not exist as theme code to review this wave — it's Salla's own, consistent with the CLAUDE.md rule to use Salla native components before building custom ones.

No other `dangerouslySetInnerHTML`, `eval(`, `new Function(`, `document.write(`, or
`innerHTML =` assignment was found under `app/`.

## 3. `toScriptText` (app/components/seo/jsonld.ts:253-258)

```
const SCRIPT_ESCAPES = [
  ['<', '\u003c'], ['>', '\u003e'], ['&', '\u0026'],
  [U+2028, '\u2028'], [U+2029, '\u2029'],
];
toScriptText(doc) = SCRIPT_ESCAPES.reduce(replaceAll, JSON.stringify(doc));
```

This correctly closes the three classic JSON-LD-in-`<script>` holes:
- `</script` breakout — defeated, `<` is always unicode-escaped.
- `<!--` comment-open inside the script body — defeated, same `<` escape.
- U+2028/U+2029 "JS line terminators inside a JSON string" parse bug in some older
  JS engines — defeated explicitly.

`registerHeadHooks.tsx` only calls this on `graph(organization(...), website(...),
localBusiness(...))`, built from `store` and `theme.settings` (branch address/hours/
whatsapp number), never from request-controlled data. No finding here.

## 4. URL construction: `app/components/seo/head.ts` + `registerHeadHooks.tsx`

`originOf()`/`tryOriginOf()` are called only with `store.url`, `product.url`, or
`detail.url` (article) across the whole app — grepped every call site (11 total). All
are Salla-engine-supplied fields (loader/context data), never raw request or
visitor-supplied strings. `canonicalFor`/`currentUrl`/`hreflangFor` build off that
origin plus `ctx.location.pathname`, which TanStack Router already resolves against
the app's own route table (not an open string). No injection surface found.

One robustness note: `originOf()` (line 12) `throw`s on a malformed URL and is called
directly (not the null-safe `tryOriginOf`) from `organization`, `website`,
`localBusiness`, `article`, and `service` in `jsonld.ts` (lines 94, 108, 124, 197,
215). Every route-level caller pre-checks with `tryOriginOf` before reaching these
builders, so this is not reachable with attacker input today — flagged only as a
low-likelihood availability note (Finding 6).

## 5. `wa.me` links

Two call sites, both correctly digits-only before interpolation:
- `app/components/blocks/OxBranch.tsx:38-42,78-83` — `whatsappDigits()`.
- `app/components/layout/Header/MobileDrawer.tsx:29-32,96-98` — `digitsOnly()`
  (a separate, functionally identical implementation — code-duplication note for
  G3/reviewer, not a security issue).

Both strip everything outside ASCII `0`-`9` before building `https://wa.me/{number}`,
so no scheme/host/query injection is possible through `whatsapp_number` or
`store.contacts.whatsapp`. `OxBranch`'s prefill text goes through
`encodeURIComponent`. No finding.

One adjacent, lower-confidence item: `OxBranch.tsx:76,125` reads `branch_map_url`
straight from theme settings with **no** scheme validation and passes it directly to
`Button href={mapUrl}` (target=_blank). See Finding 7.

## 6. Newsletter / converter inputs

- `app/components/blocks/OxNewsletter.tsx` — `email` state only ever reaches a
  React-controlled `<input value={email}>` and an injected `subscribe(email)`
  transport (no provider wired yet per its own doc comment); never rendered as HTML.
  `looksLikeEmail()` is a format check only, not a security boundary, and doesn't need
  to be one given how the value is used. No finding.
- `app/routes/tools.converter.tsx` — P0 stub (`noindex`, loading text only, `TODO B5`
  comment). Nothing to review yet.

## 7. `pnpm audit`

```
"vulnerabilities": { "info": 0, "low": 0, "moderate": 0, "high": 0, "critical": 0 },
"dependencies": 392, "devDependencies": 171, "optionalDependencies": 161, "total": 724
```
Clean.

## 8. Dependency diff vs HEAD

`git diff HEAD -- package.json pnpm-lock.yaml`: **no dependency version changes**.
`package.json` only gained new `pnpm` script entries (`check:rtl`, `check:motion`,
`check:strings`, `check:all`, `gen:salla-ids`); `pnpm-lock.yaml` is untouched.

## 9. Secrets / `store.settings.keys.*` / `SallaMap`

Grepped `app/` for `SallaMap`, `salla-map`, `maps_api`, `apiKey`, `api_key`, `secret`,
`token`, `process.env`/`import.meta.env` (excluding NODE_ENV/DEV/PROD/MODE), and
`.keys`. **No `store.settings.keys.*` usage and no `SallaMap` component exist
anywhere in `app/` at this wave** — the branch block (`OxBranch.tsx`) only renders a
plain `branch_map_url` link, not an embedded map with an API key, so the exception the
brief anticipates doesn't yet apply. `twilight.json`'s `"key"` fields are theme-builder
block/component UUIDs, not credentials. No secret, token, or API key found echoed
anywhere in the reviewed surfaces.

---

## Findings

1. **`app/components/product/lib/sanitizeHtml.ts:182-228` (`decodeEntities`), specifically the `input.indexOf(SEMI, i + 1)` call at line 193** — O(n²) worst case: a string of N `&` characters with no `;` re-scans the remaining string from every `&`. Measured 15k=6ms, 30k=20ms, 60k=81ms, 120k=316ms (confirmed quadratic growth, not linear). At ~1MB of adversarial input this extrapolates to double-digit seconds per SSR render, with no caching in front of `sanitizeHtml` visible in this wave. Dimension: availability (resource exhaustion / DoS).
2. **`app/components/product/lib/sanitizeHtml.ts:491-512` (`serialize`) and `:542-553` (`textOf`)** — unbounded-depth recursion with no nesting cap. Confirmed `RangeError: Maximum call stack size exceeded` at 5,000/10,000 levels of nested `<span>` (safe at 500/1000/2000 in this Node test environment). The file's own header states SSR runs in workerd, whose default stack is typically smaller than Node's, so production could throw at a lower, more easily reachable depth (deeply nested markup is a realistic accident from WYSIWYG/Word-paste, not only a deliberate attack). An uncaught throw here during head/body generation is a per-request 500, not data exposure. Dimension: availability (DoS).
3. **`app/components/product/lib/sanitizeHtml.ts:253-280` (`isSafeHref`)** — the "does this colon belong to a scheme or a path/fragment" check (lines 272-278) uses the raw position of the first `/`, `?`, or `#` character, not a scheme-grammar check. A literal `#` that isn't a real fragment marker (e.g. left over from an entity that failed to decode, such as `&#0;`, which fails the `code > 0` guard in `decodeEntities` and survives as literal text) can trick the heuristic into accepting a string as "safe" when it structurally isn't. Tested concretely with `java&#0;script:alert(1)`: `isSafeHref` returns `true`, but no live exploit results, because (a) `escapeText` re-escapes the `&` on serialise, and (b) the resulting string never forms a browser-valid scheme name (WHATWG URL scheme grammar rejects `&`/`#`/`;` in a scheme). Not confirmed exploitable in this review; flagged as a hardening item because it relies on a second, independent safety net (the browser's own scheme grammar) rather than being self-contained. Dimension: input validation / defense-in-depth.
4. **`app/components/product/lib/sanitizeHtml.ts:363-371` (`skipRawElement`)** — the RAW_DROP terminator search (`lowered.indexOf(LT + SLASH + name, from)`) has no boundary check after the matched tag name, so `</script` is satisfied by the first 8 characters of a longer token like `</scripts>`. Verified: `<script>1</scripts><b>bold</b></script><p>after</p>` sanitizes to `<p>before</p><b>bold</b><p>after</p>` — no live tag leaked in testing (the mis-terminated region's leftover content still passes through the same tokenizer/allowlist on the next iteration), but the element boundary itself is objectively wrong, which contradicts the file's own header guarantee ("an attacker cannot smuggle markup past the parser by exploiting a difference between what we matched and what a browser would match" — this is exactly such a difference, even though no working bypass was found here). Recommend requiring the character after the matched name to be one of space/`>`/`/`, mirroring `readTag`'s own tag-name parsing. Dimension: parsing correctness / defense-in-depth.
5. **`app/components/product/lib/sanitizeHtml.ts:434-444` (`<!` declaration handling in `parseFragment`)** — a CDATA-style bogus declaration (`<![CDATA[`) is handled by the same code path as a doctype: it searches for the *first* `>` after `<!`, which can land inside a subsequent real tag. Verified: `<p>x</p><![CDATA[<script>alert(1)</script>]]><p>y</p>` sanitizes to `<p>x</p>alert(1)]]&gt;<p>y</p>` — the literal text `alert(1)` from inside what should have been a fully-dropped `<script>` element leaks into the visible page as inert, properly-escaped text. Not XSS (no live markup results, confirmed no `<script` in output), but a content-integrity / information-disclosure defect: raw script/style source that the design explicitly says should never reach the page ("`<script>`...takes its whole subtree with it") can become visible body copy. Dimension: content integrity / information disclosure.
6. **`app/components/seo/jsonld.ts:94,108,124,197,215`** — `organization`, `website`, `localBusiness`, `article`, `service` call `originOf()` (`app/components/seo/head.ts:12`) directly, which `throw`s on a malformed URL, rather than the null-safe `tryOriginOf`. Every current route-level caller pre-guards with `tryOriginOf` before reaching these builders (confirmed for all 4 route files and `registerHeadHooks.tsx`), so this is not reachable with attacker-controlled input today. Flagged as a low-likelihood availability note only. Dimension: availability (robustness).
7. **`app/components/blocks/OxBranch.tsx:76,125`** — `mapUrl` (`readSetting(themeSettings, 'branch_map_url')`) is passed straight into `<Button href={mapUrl}>` with no scheme validation, unlike `whatsappDigits()` (digits-only, same file) and unlike `isSafeHref()` already exported from `sanitizeHtml.ts` for exactly this purpose. This is merchant/admin-configured theme-settings data, not visitor input, so exploitability requires the merchant's own dashboard/settings pipeline to be compromised or a malicious merchant acting against their own storefront (self-XSS-adjacent) — low likelihood, but zero cost to close by reusing `isSafeHref` here too. Dimension: defense-in-depth / injection (not directly exploitable by a store customer).

## Recommendations

- Rewrite `decodeEntities`'s semicolon search to bound its worst case — e.g. cap the
  forward scan itself (it already caps decoded-entity length at 10 via
  `end - i > 10`, but the *scan* to find `end` isn't bounded the same way when no
  `;` exists at all in the remaining string) or track the last-seen `&` position so a
  run of bare `&` characters is consumed in one pass instead of N.
- Cap recursion depth in `parseFragment` (refuse to `stack.push` past e.g. 500-1000
  levels, flattening/unwrapping the excess) so `serialize`/`textOf` never need to
  recurse deeper than that cap, removing the stack-overflow class entirely; or convert
  both to an explicit-stack iterative walk.
- Tighten `isSafeHref`'s scheme detection to validate the pre-colon substring against
  the actual URI scheme grammar (`^[a-zA-Z][a-zA-Z0-9+.-]*$`) instead of inferring it
  from the position of the first `/`/`?`/`#`.
- Require a boundary character (space/`>`/`/`) immediately after the matched name in
  `skipRawElement`'s terminator search, matching `readTag`'s own name-parsing rule.
- Route the `<!` declaration branch in `parseFragment` through the same
  comment-vs-declaration split CDATA needs, or simply drop everything from `<![` to
  the next `]>`/`]]>` instead of the first bare `>`.
- Run `mapUrl` in `OxBranch.tsx` through the already-exported `isSafeHref()` before
  using it as an `href`, for consistency with how every other merchant-controlled URL
  in this theme is gated.
- Consider de-duplicating `whatsappDigits`/`digitsOnly` (two files, identical logic) —
  a G3 note, not a security finding.
- No action needed on `toScriptText`, the `dangerouslySetInnerHTML` inventory's
  sanitised-description path, `wa.me` digit stripping, `pnpm audit`, or the dependency
  diff — all clean as reviewed.

## Blockers

None. No confirmed, exploitable XSS, secret leak, or dependency vulnerability was
found in this wave. The two DoS-class findings (1 and 2) are real and evidenced
(quadratic scan, confirmed stack overflow) and should be fixed before this sanitiser
is trusted against arbitrary large or adversarial merchant input at production scale,
but neither blocks this wave's build from proceeding to the next gate; they should be
tracked as follow-up work items against `sanitizeHtml.ts` before general availability.
