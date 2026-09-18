# Locale partials (shared-file protocol)

`locales/ar.json` and `locales/en.json` are shared by every batch, so batches
never edit them directly. Each batch writes its own pair of partials here:

```
locales/partials/<batch>.ar.json
locales/partials/<batch>.en.json
```

Rules:

- Flat dotted keys under the `ox.` prefix only (`"ox.header.search": "بحث"`).
  Nested objects are accepted and flattened, but flat is the convention.
- Engine keys (`pages.*`, `blocks.*`, `common.*`) are never written by a
  partial; the merge rejects them, and the merge never deletes or rewrites a
  key it does not own.
- The same key may appear in two partials only with the same value; a
  different value is a conflict and the merge fails, naming both files.
- Every key must exist in both the `ar` and the `en` partial of a batch (the
  i18n test asserts parity on the merged files).
- Copy rules apply (tests/i18n.test.ts, `pnpm check:copy`): no Arabic
  diacritics, no dialect tokens, no em-dash.

Merge with `pnpm i18n:merge` (writes `locales/ar.json` and `locales/en.json`,
idempotent) or check without writing with `pnpm i18n:merge -- --check`.
B0's own keys live in `b0.ar.json` / `b0.en.json` as the reference example.
