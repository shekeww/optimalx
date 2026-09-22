# Taking OptimalX live

Written for: the store owner, doing this in the Salla dashboard and the Salla Partners Portal.

The theme is built, tested and pushed. What is left needs a person logged in to Salla, because Salla reviews every theme before a store can run it. Nothing below needs a developer.

## What is already done

- The theme code is on GitHub at `shekeww/optimalx`, branch `main`, which is the default and only branch of that repository.
- The theme is registered in your Partners account as **optimalx**, id **1938498306**, status development.
- The store already holds the 47 mock products with photos, and the theme reads them live.
- Checks at the last build (2026-09-23): 1177 tests pass, `pnpm typecheck` is clean, the production build passes and emits every route, and the copy, structured-data, right-to-left, motion, string, claims, token and identity checks are clean.

## Step 1: point the Partners theme at the repository

Open https://salla.partners, go to My Themes, open **optimalx**, and in its settings connect the GitHub repository `shekeww/optimalx` and the branch `main`. Salla reads `twilight.json` from the repository on every push, which is where the theme name, the dashboard settings and the twelve home blocks are declared.

If the repository is already connected, press the button that re-syncs it so Salla picks up today's commits.

## Step 2: set the installation method to private

In the same screen choose **Private** installation and add store **1888890798** as the allowed store. This keeps the theme off the public marketplace and available only to you. Do this before you submit, because a submitted public theme is listed for every merchant.

## Step 3: submit for publication

Press Complete Theme publication. Salla reviews it. If they return notes, fix and resubmit; the same button handles updates later.

## Step 4: install it on the store

When the review passes, open the store dashboard, go to تصميم المتجر, open my themes, install **اوبتيمال اكس**, then press Publish version. The home page arrives pre-filled with the twelve default blocks, so the storefront is complete the moment it is installed.

## Step 5: fill the settings that keep claims honest

Design settings, section **خيارات اوبتيمال اكس**. Every one of these is empty on purpose: the matching sentence stays hidden until you fill it, so the storefront never claims something that is not yet true.

| Setting | What it turns on |
|---|---|
| `free_shipping_threshold` | the free-shipping line and the cart progress bar |
| `reply_sla_hours` | the reply-time promise on the services pages |
| `consultation_credit_note` | the consultation credit line |
| `claim_official_distributors` | the official-distributor wording, instead of the neutral originality line |
| `vat_number`, `cr_number`, `maroof_url` | the VAT line and the footer registration row |
| `branch_hours`, `branch_address`, `branch_map_url`, `branch_landmark` | the branch hours table and the map button |
| `pickup_ready_hours`, `pickup_hold_days` | the branch pickup steps |
| `whatsapp_number` | every WhatsApp button |
| `announcement_text` | the announcement bar above the header |
| `show_newsletter` | the newsletter block |

## Step 6: the last two things before you switch maintenance off

1. Create the categories and brands from `docs/build/research/FINAL-catalogue.md` section A and B, set each category's URL to the Latin slug in that table, and assign the products. Until they exist, the goal and category links fall back to search results.
2. Turn maintenance mode off on optimalx.com.sa.

## Still on your side, not blocking launch

The asset list with exact sizes is `docs/build/DIRECTION.md` section 8. The two that matter most: the logo as SVG (the current file is a raster on a white square, which cannot sit on the dark footer or become a favicon) and real photographs of the Madinah branch. Everything else renders on a clean plate until the images land.

The full list of owner tasks, including the legal wording that needs a lawyer, is `docs/build/owner-checklist.md`.
