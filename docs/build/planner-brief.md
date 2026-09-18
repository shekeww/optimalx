# Planner brief: turn PLAN.md into the final gated batch plan (PLAN-final.md)

You are the planner of the mastermind team for the OptimalX Salla React theme. Produce `PLAN-final.md` in this scratchpad folder: a phased, file-owned, verifiable batch plan that three builders can execute concurrently in ONE working tree without touching each other's files. Read before writing; cite file paths and line numbers for every engine fact you rely on.

## Inputs (all in this scratchpad folder unless noted)

1. `PLAN.md` (conductor draft v1: decisions D1-D13, route map, component map, styles, twilight.json, store writes, SEO layer, gates, draft batches B0-B9).
2. `engine-surface.md` (2137 lines; the verified engine surface: hook slots, registry keys, withHead, locale, layout seam, i18n, money, bugs, SSR defect). Sections are numbered; cite them.
3. `DIRECTION.md` (designer: direction pick, token sheet 2.1-2.10, typography 3.x, layout 4.x with clip-path polygons, component specs 5.x; sections 6-10 may still be arriving, plan around what exists and mark anything you need from 6-10 as a dependency).
4. `design-constraints.md` (owner brief, platform facts, page list).
5. `B0-progress.md` (what the foundation builder has already changed; verified engine facts it found, for example the `registerHomeComponentConfig` key is `height`, `head:end` renders inside body, `@uidotdev/usehooks` must stay, react-query peer `~5.101.4`).
6. `research/FINAL-content.md` (home copy, goal pages; sections 3-10 may still be arriving), `research/FINAL-catalogue.md`, `research/salla-ids.json` (47 live product ids), `research/keywords-ar.md` section 7 (URL and title conventions).
7. Repo: `C:\Users\Ahmed\OneDrive\Desktop\optimalx` (branch docs/engine-defect-and-spec-trueup, HEAD 5464b3a). Read `app/`, `locales/`, `twilight.json`, `package.json`, `tests/`, `scripts/`, `BUILD.md`, `CLAUDE.md`. Ignore `optimalx/optimalx` (stray scaffold, to be removed) and `references/` (owner images).

## Hard constraints

- Salla native components before custom; checkout, cart logic and search stay Salla's; Arabic first; every UI string in `locales/*.json` under `ox.*`; never shadow engine keys.
- Engine `// @auto-generated` route files are overwritten on build: a route we own must have that line removed and be listed in `app/routes.ts` if custom.
- Product card only through `registry.override('product:card', ...)` before first render; product gallery through `product:gallery`.
- Header and Footer only through the `TwilightProvider layout` prop (B0 has `app/components/layout/OptimalXLayout.tsx`).
- Canonical must be the served URL with the locale prefix when the store is multilingual; hreflang only when multilingual; x-default ar.
- JSON-LD: one declaration per property, stable `@id`, engine already emits Product and BreadcrumbList on the PDP; do not duplicate them.
- Light mode only; graphite bands are components with their own tokens; orange only for interaction; Cairo only; Western numerals.
- Description HTML is untrusted: parse the spec line and the nutrition table from it, sanitise with an allowlist before rendering.
- Money in JSX via `useMoney().format()`; raw numbers plus "SAR" in JSON-LD.
- No em-dashes anywhere in copy or code comments meant for humans; MSA without diacritics.

## What the plan must contain

1. **Corrections to PLAN.md**: anything in D1-D13, the route map or the component map that the engine surface or B0 findings contradict. State the fix and the evidence.
2. **Shared-file protocol**: `locales/ar.json`, `locales/en.json`, `twilight.json`, `app/routes.ts`, `app/router.tsx`, `app/styles/*.scss` index files, `app/components/*/index.ts` are touched by several batches. Define exactly how concurrent builders avoid conflicts (for example: each batch writes its keys to `locales/partials/<batch>.ar.json` and `<batch>.en.json` and a script `pnpm i18n:merge` folds them into `locales/*.json` at the end, or each batch owns a disjoint key block and appends only through a merge script; SCSS via one `@use` line per batch in a file B0 owns; twilight.json components appended by one batch only). Pick one protocol, make it mechanical, and state who runs the merge and when.
3. **Batches B1-B6 (and B7-B9)** as builder-ready specs. For each batch: goal; exact file list it owns (create or modify), files it may read but not modify; the DIRECTION sections that bind it; the content sections it consumes; the engine primitives and salla-* components it must use (with the engine-surface citation); acceptance criteria that a verifier can check by command or by a browser walk; the test files it must add; the commands it must run green (`pnpm typecheck`, `pnpm test`, `pnpm build`); risks and the fallback for each.
4. **Wave order**: which batches run concurrently (at most three at once), in which order, and what each wave needs from the previous one. B0 is done or nearly done; B7 content merge and B9 docs come last; B8 store writes are the conductor's and are mostly done (47 products, 27 images).
5. **Gate plan**: G1 security (sanitiser, forms, deps), G2 UI (designer review against DIRECTION), G3 code review, G4 verifier with the exact browser walk (routes, viewports 390 and 1440, RTL, console errors 0, render-budget probe) and the GO/NO-GO criteria.
6. **Open questions** that only the owner can answer, each with the assumption the build proceeds under.

## Output rules

Write `PLAN-final.md` with the Write tool (not through the shell). Keep it under 700 lines, tables where they help, no em-dashes. Return as your final text a short delegation JSON envelope: `{ "status": "done", "file": "PLAN-final.md", "corrections": <count>, "batches": [..], "waves": [[..],[..]], "open_questions": <count> }`.

## Addendum (2026-09-18 16:20)

- DIRECTION.md is complete (1166 lines): section 6 page compositions (block tables with reserved skeleton heights, kinds F/C/U) at line 465, 7 motion at 759, 8 asset brief at 819, 9 a11y/RTL checklist with amendments A1-A6 at 955, 10 render-budget compliance with amendments A7-A9 at 1089. The amendments change sections 2-5 and must be carried into the batches: A1 new token --ox-line-3 #85858E; A2 controls use it at rest; A3 hero video pause button; A4 eyebrows only when they add a fact; A5 lang="en" on Latin-name bdi; A6 route announcer live region + focus to #main after client navigation; A7 skeleton pulse only on text bars of the one in-viewport root; A8 image widths capped at 2x slot; A9 no transition on wedge elements.
- Section 6 adds a home block OxFaq (home:ox-faq) that PLAN.md section 3 lacks: add it.
- Copy keys the copywriter still owes (section 6 names them): ox.listing.empty, ox.goal.heroCta, ox.pdp.trust.digital, ox.pdp.giftcard.*, ox.services.steps.*, ox.branch.pickup.*, branch FAQ, ox.brands.intro, ox.pages.about.story.*. Batches that need them ship with Arabic placeholders marked TODO-copy in a partial locale file, never with invented claims.
- research/FINAL-content.md sections 3-10 are being written now (parts 3-5 exist as FINAL-content-part-N.md); plan B7 to merge whatever exists and list the gaps.
- Store state: 47 products live (research/salla-ids.json), 27 photos attached, 16 more being attached now; the image API rejects the alt field, so alt text is the owner's dashboard task. B8 is therefore reduced to the menu writes after categories exist.
- B0 builder is still finishing (typecheck against a stale pnpm engine folder hash in app/routeTree.gen.ts is being resolved); read B0-progress.md at the moment you plan and treat anything not marked DONE as a B0 leftover that wave 1 must not depend on.
