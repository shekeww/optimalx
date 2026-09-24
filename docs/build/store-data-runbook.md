# Store data runbook, categories, brands, product assignments

What `scripts/salla-auth.mjs` and `scripts/salla-categories.mjs` do, in the order the owner runs them, and
the dashboard alternative for every step in case a script step is blocked. The scripts are dependency-free
Node 20 (`node scripts/salla-auth.mjs`, `node scripts/salla-categories.mjs ...`, no `pnpm` script exists for
them; `package.json` is frozen until S7). Nothing in this document was run this session: **`--apply` has not
been executed**; only `--plan` (offline, read-only) has.

## 1. Preflight, Partners app scopes and install

The write path needs the Partner app **755989931** to carry the scopes `categories.read_write`,
`brands.read_write`, `products.read_write`, with the redirect URL `http://localhost:8787/callback`
registered. The conductor's attempt to set these through the Partners MCP (`salla_apps action=connect`) was
declined by the harness (it changes the app's OAuth configuration, which needs the owner's own approval).
Two ways to finish this:

1. **Owner sets it directly**: open <https://portal.salla.partners/apps/755989931>, add the three scopes
   above under OAuth Scopes, set the redirect URL to `http://localhost:8787/callback`, save.
2. **Owner approves the MCP action**: ask the conductor to retry `salla_apps action=connect` in the next
   turn and approve the permission prompt when it appears.

Once the scopes and redirect URL are set, install the app on the store:

- Open <https://s.salla.sa/apps/install/755989931> while signed in to store **1888890798**
  (optimalx.com.sa), and approve the install / scope consent screen.

Nothing in `--apply` can substitute for this step: without the scopes, every write in §3 below returns
`403`.

## 2. Credentials

`.env.salla` (gitignored, repo root) holds `SALLA_CLIENT_ID`, `SALLA_CLIENT_SECRET`, `SALLA_APP_ID`,
`SALLA_STORE_ID`, `SALLA_REDIRECT_URI=http://localhost:8787/callback`. The scripts hand-parse this file
(`scripts/salla-lib.mjs`'s `parseEnvFile`); nothing here needs `dotenv` or any other dependency. Values in
the real shell environment always win over the file, so `SALLA_ACCESS_TOKEN` (see §4) can be exported for
one command without touching the file.

## 3. Local run (the normal path)

```sh
# 1. Get a token: opens a browser tab, waits on a local callback, writes .salla-token.json
node scripts/salla-auth.mjs

# 2. Look before writing anything, this makes NO network call
node scripts/salla-categories.mjs --plan --brands --assign --images

# 3. Apply, once the plan output looks right
node scripts/salla-categories.mjs --apply --brands --assign --images
```

`salla-auth.mjs` binds its callback server to `127.0.0.1:8787` only (never `0.0.0.0`) and prints an
authorize URL: `https://accounts.salla.sa/oauth2/auth?client_id=...&response_type=code&redirect_uri=...
&scope=offline_access&state=<random>`. Open it, approve the app, and the script exchanges the code for a
token pair and writes `.salla-token.json` (`{access_token, refresh_token, expires_at, scope}`), it never
prints a token, only "received"/"written". A mismatched `state` on the callback is rejected before any
token exchange is attempted. Refresh a token whose `expires_at` has passed with `node scripts/salla-auth.mjs
--refresh` (needs the stored `refresh_token`).

`salla-categories.mjs --apply` is idempotent: it matches each of the 25 taxonomy categories and each brand
by `metadata_url` first, then by exact name, and reuses the existing id instead of creating a duplicate, a
second `--apply` run after a partial failure is safe to re-run. Parents (`protein`) are always created
before their five children. Every write is read back with a `GET` immediately after and diffed against what
was sent; the read-back result is what lands in the log (§6), never an assumption that the write succeeded.

Flags:
- `--brands` also creates the brands from `FINAL-catalogue.md` §B (plus two documented gaps -
  `Centrum` and `Myprotein`, both used by a real SKU but missing from §B's table; add proper research for
  them there when convenient).
- `--assign` sets `categories = [leaf, parent? ...goals]` and `brand_id` on all 47 products from
  `docs/build/salla-ids.json`.
- `--images` sets each category's `image` to its `image_sku` product's photo URL (from
  `fixtures/store/products.json`, the same offline snapshot the theme preview reads). If the API rejects a
  URL for a field that expects an upload, the run logs `image rejected (set manually per the runbook)` for
  that category and continues, it does not fail the whole run. Set the image by hand in that case:
  المنتجات > التصنيفات > (category) > الصورة.

On success, `docs/build/taxonomy-ids.json` is written (`{slug: id}` for all 25 categories) and
`docs/build/store-write-log.md` gets a new `## Run <run-id>` section (§6).

## 4. Vercel-sandbox run (when this machine is challenged)

`api.salla.dev` answers requests from this machine's IP with a Cloudflare challenge: `HTTP 429` with the
header `Cf-Mitigated: challenge`. `scripts/salla-lib.mjs`'s client checks for that exact signature and
stops immediately, no retry, since retrying a challenge only spends the API's rate limit for no gain. If
`--plan` or `--apply` prints that message:

1. Run `node scripts/salla-auth.mjs` **locally** as in §3 (the OAuth callback needs a browser; the sandbox
   has none) to produce `.salla-token.json`.
2. Deploy or open a throwaway Vercel sandbox / serverless function whose outbound IP is not challenged.
3. Copy the repo (or just `scripts/salla-lib.mjs` and `scripts/salla-categories.mjs`, which are
   dependency-free) and the files they read (`app/content/taxonomy.json`, `docs/build/research/
   optimalx-catalogue.csv`, `docs/build/salla-ids.json`, `fixtures/store/products.json`) to the sandbox.
4. Export the access token from step 1 as an environment variable instead of copying the token file:
   `SALLA_ACCESS_TOKEN=<value from .salla-token.json's access_token>`, `resolveAccessToken()` reads this
   before it ever looks at `.salla-token.json`, so the sandbox never needs the file.
5. Run `node scripts/salla-categories.mjs --apply --brands --assign --images` in the sandbox.
6. Copy `docs/build/store-write-log.md`'s new run section and `docs/build/taxonomy-ids.json` back into the
   repo (the sandbox's copies are the source of truth for that run; do not hand-merge, replace).

## 5. Dashboard alternative (no script at all)

Every write the script makes can be done by hand in المتجر > المنتجات:

1. **Categories** (المنتجات > التصنيفات > إضافة تصنيف): create the 10 type categories, then the 5 protein
   subcategories (parent = بروتين), then the 4 utility categories, then the 6 goal collections, 25 total,
   from `docs/build/research/FINAL-catalogue.md` §A (or `app/content/taxonomy.json` once S1 has landed it).
   Set each one's SEO URL (الرابط المخصص) to the Latin slug in the table exactly (e.g. `protein`,
   `whey-protein`, `goal-energy`), the theme's routes assume `metadata_url === slug`.
2. **Brands** (المنتجات > الماركات): create the brands from §B (plus Centrum and Myprotein, see §3).
3. **Product assignments**: for each of the 47 products, open it and set: تصنيف المنتج (categories) to its
   leaf category, its parent when the leaf has one, and every goal collection listed in the `categories`
   column of `docs/build/research/optimalx-catalogue.csv`; set الماركة (brand) from the same row's `brand`
   column.
4. **Category images**: المنتجات > التصنيفات > (category) > الصورة, use the `image_sku` product's own
   photo (`fixtures/store/products.json`, field `image.url`, or just save the photo from the live product
   page) so the category tile matches a real product in the catalogue.

## 6. Verification

After any `--apply` run (script or by hand):

- `curl -s https://api.salla.dev/admin/v2/categories` (with the token) or المنتجات > التصنيفات in the
  dashboard: 25 categories, each `metadata_url` equal to its slug, the 5 protein children showing `protein`
  as their parent.
- Spot-check a few of the 47 products: categories array contains the leaf + parent (if any) + every goal the
  CSV lists; brand set.
- `docs/build/store-write-log.md`: the new `## Run <run-id>` section lists every id created, with a
  `Read-back` column of `match` (no diff), anything else needs a look before trusting the run.
- `docs/build/taxonomy-ids.json`: `{slug: id}` for all 25 slugs, no `null`/missing entries.
- Rebuild the theme's SKU→category resolver where relevant (S1's `app/content/taxonomy-ids.ts`
  generator reads this file once it exists) and re-run the offline preview to see the categories reflected
  where the fixture overlay is off.

## 7. Rollback

```sh
node scripts/salla-categories.mjs --rollback <run-id>
```

`<run-id>` is the id printed at the end of the `--apply` run and recorded in
`docs/build/store-write-log.md`'s `## Run <run-id>` heading. Rollback:

- Deletes every category/brand **that run created** (never one it merely reused, a category that already
  existed before the run is left untouched).
- Restores every touched product's `categories`/`brand_id` to the exact pre-write state recorded in that
  run's log entry (the `before` snapshot taken by the read-back immediately before the write).
- Leaves category `image` writes as-is (nothing destructive to undo there) and logs the rollback itself as
  a new run (`<run-id>-rollback`) in `store-write-log.md`, so the rollback is itself auditable.

A rollback for a run id not present in the log fails loudly (`no run "<run-id>" found`) rather than doing
nothing silently.
