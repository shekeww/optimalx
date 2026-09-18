# OptimalX theme deployment runbook (draft, 2026-09-18)

Verified facts: the repo has no git remote; Salla CLI 3.2.56 is installed; the Partners Portal offers public, beta and private installation for a theme and every publish request is reviewed by Salla even for private themes (docs.salla.dev/421880m0, 421879m0); the theme's twilight.json is synced from the connected GitHub repository; the store's active version today is Salla's Raed theme (version 499745075); the custom domain optimalx.com.sa is connected and in maintenance mode.

## 1. Local verification (every release)

```
pnpm install
pnpm typecheck
pnpm test
pnpm check:copy
pnpm check:jsonld
pnpm build
pnpm preview   # workerd; open http://localhost:4173 and click through home, a product, a category, search, cart, /services, /branch, a bad URL
```
If preview dies with "Workers runtime crashed unexpectedly" after a vite.config.ts edit, clear the optimizer cache: `node -e "fs.rmSync('node_modules/.vite',{recursive:true,force:true})"` and rerun.

Development against the live store data: `pnpm dev` (or `salla theme dev --store 1888890798`), then the dev settings widget (bottom corner) edits twilight.json values live.

## 2. Repository

```
git checkout -b main            # or merge the working branch into master and rename
git remote add origin https://github.com/<owner>/optimalx-theme.git
git push -u origin main
```
Keep `.env` out of git (already ignored). The repository URL goes into twilight.json "repository".

## 3. Partners Portal

1. https://salla.partners → login (the account that owns the Salla_Dev connection) → My Themes → Create theme → type React → connect the GitHub repository and branch.
2. Basic information: name اوبتيمال اكس / OptimalX, category "الصحة والجمال" (health and beauty; the industry-focus requirement), icon and screenshots (home, PDP, category, services at 1440 and 390).
3. Settings and components are read from twilight.json on every push; confirm the ox-* components appear in the components list.
4. Installation method: Private. Add store 1888890798 as the allowed store (and a demo store for preview).
5. Preview: `salla theme preview --store 1888890798` (or the portal's Preview Theme) and walk the same click-through as step 1.
6. Submit "Complete Theme publication". Salla reviews; fix findings; resubmit. Updates later go through the same request.

## 4. Install on the store

Dashboard → تصميم المتجر → my themes → install اوبتيمال اكس → it appears as a new version → customise: the home blocks come pre-filled from twilight.json defaults; replace the placeholder images with the generated assets; set the theme settings (announcement, WhatsApp, branch hours, CR/VAT/Maroof) → Publish version.

## 5. After install

- Turn maintenance mode off only when categories, brands, booking schedules and real product photos are in.
- Submit https://optimalx.com.sa/sitemap.xml in Google Search Console (robots.txt already points to it); add the property in Arabic and, when enabled, the /en pages.
- Measure Core Web Vitals on the production URL (two runs, Slow 4G, 4x CPU); expect the LCP ceiling recorded in BUILD.md section 14 until Salla fixes the engine hydration defect.
- Keep docs/store-write-log.md as the record of every API write.
