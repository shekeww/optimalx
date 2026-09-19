# Deploying the design through a Salla app

Written for: the store owner. One click from you, then the design deploys and updates without you again.

## The one thing you do

Open this link while logged in to the OptimalX dashboard and approve the install:

**https://s.salla.sa/apps/install/755989931**

That is the private app `OptimalX Storefront Design`, created on your own Partners account. Nothing else is needed from you.

## What it asks for, and why that matters

The app requests exactly one permission: **read basic information**. Nothing else. It cannot read your orders, your customers, your carts or your payouts, and it cannot write to any of them. It does not need to: it only puts styling and markup on the storefront.

You can confirm that on the install screen before approving, and you can remove the app at any time from the dashboard, which removes the design with it.

## Why this replaces pasting

Until now the design went into the two custom code boxes in the theme customizer, which meant you pasting two long files by hand every time anything changed, and each box caps at 65,535 characters. The script had already grown past that cap, so it could not be installed at all.

The app channel removes both problems:

- **No size ceiling.** The design ships as several snippets rather than one file, each well under the limit, so the stylesheet and the behaviour no longer compete for the same box.
- **No more pasting.** Once the app is installed, updates are published straight to it. You do not touch the dashboard again.
- **It survives a theme change.** The custom code boxes belong to the Raed theme version. The app does not, so the identity keeps working if the theme is switched or updated.
- **It is reversible in one action.** Uninstall the app and the storefront returns to stock Raed, with nothing left behind.

## How it works, in one paragraph

A Salla app can register storefront snippets: JavaScript files that Salla serves from its own CDN and runs on every page of the store. Salla wraps each snippet so it runs once the storefront SDK is ready and scopes it to the app. One snippet injects the stylesheet, another builds the parts of the product page that Raed has no concept of, such as the statistic cards, the tab strip, the information panels and the supply calculator. Each feature is wrapped so that a failure in one cannot affect the others or the page.

## After you install

Tell me it is installed. I will publish the current build to it, then verify the live pages and report what rendered. If anything needs changing after that, I change the snippet and it is live, with no further action from you.

## The theme is still the real destination

This app is how the identity reaches your customers now. The OptimalX React theme, which is finished and pushed, remains the permanent answer: it carries the same design natively instead of layering it over Raed, and it is not exposed to a Raed update renaming a class. `docs/DEPLOY.md` is the path for submitting it. When it is published, uninstall this app.
