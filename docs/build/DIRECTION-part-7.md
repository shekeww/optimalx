---

## 7. Motion

The universal motion law applies unchanged: only transform and opacity animate; the native-first ladder is CSS transition, CSS keyframes, IntersectionObserver as a trigger, then View Transitions for routes; scroll-driven timelines are not used because there are no scroll reveals; no motion library is justified anywhere in this theme. Values are the 2.9 tokens. Composition carries the energy; motion confirms that something happened. Every entrance has a shorter exit. Every horizontal translate, including inside keyframes, is written `calc(var(--direction-factor) * Npx)`; vertical translates are not multiplied.

Colour never transitions. A border, fill or text colour on hover, focus, press or selection snaps to its new value with no transition: a 120ms colour fade is a paint per frame across the whole element for a change the eye reads as instant anyway. --dur-fast covers the transform and opacity parts of hover and press only.

### 7.1 Every animated interaction

| Interaction | Element | Property | In | Out | Reduced motion | Rung |
|---|---|---|---|---|---|---|
| Button press | primary and secondary Button | translateY(0 to 1px) | --dur-fast --ease-out | --dur-fast --ease-in | none, the colour snap remains | transition |
| Add-to-cart confirm | BuyRow, ProductCard and StickyBar add button label | opacity 1 to 0 to 1 with the tick swapped at the midpoint | --dur-confirm --ease-out | (single keyframe) | label swaps instantly | keyframes |
| Cart count bump | the count pill in MainBar, MobileHeader, BottomTabBar | scale 1 to 1.15 to 1 | --dur-confirm --ease-out | (single keyframe) | number updates, no scale | keyframes |
| Wishlist toggle | heart icon in ProductCard, WishlistShare, PdpGallery | scale 1 to 1.2 to 1 | --dur-confirm --ease-out | (single keyframe) | none, the fill snaps | keyframes |
| Toast in and out | Toast | desktop: translateX(calc(var(--direction-factor) * 16px)) to 0 plus opacity 0 to 1; mobile: translateY(16px) to 0 plus opacity | --dur-base --ease-out | opacity 1 to 0, --dur-fast --ease-in | opacity only, same durations | transition |
| Variant change | PdpPriceBlock price, PdpGallery main image, StickyBar price | opacity cross-fade of two stacked layers in a min-height slot | --dur-fast --ease-in-out | (cross-fade) | instant swap | transition |
| Card second image | ProductCard image plate | opacity 0 to 1 on the second image layered over the first | --dur-fast --ease-out | --dur-fast --ease-in | instant swap | transition |
| SupplyCalculator result, cart line price, newsletter success line | the text slot | opacity cross-fade | --dur-fast (--dur-base for the newsletter) --ease-in-out | (cross-fade) | instant | transition |
| SectionHeader link hover | the 16 chevron | translateX(calc(var(--direction-factor) * 2px)) | --dur-fast --ease-out | --dur-fast --ease-in | none | transition |
| Accordion open and close | SallaAccordion rows (Faq, PrePurchaseInfo), OxTrustStrip panel, MobileDrawer and Footer groups, FiltersRail groups | wrapper grid-template-rows 0fr to 1fr, panel opacity 0 to 1, chevron rotate 0 to 180deg | --dur-base --ease-out | --dur-fast --ease-in | panel appears at final size, chevron snaps | transition |
| Drawer open and close | MobileDrawer (start edge), FiltersRail drawer (end edge) | inner panel translateX(calc(var(--direction-factor) * -100%)) to 0 for the start edge, the opposite sign for the end edge; backdrop opacity 0 to 1 | --dur-base --ease-out | --dur-fast --ease-in | panel and backdrop fade in place | transition |
| Modal and bottom sheet | Modal, login, localization, offer, rating modals | desktop: opacity 0 to 1 plus translateY(16px) to 0; mobile sheet: translateY(100%) to 0 | --dur-slow --ease-out | --dur-fast --ease-in | opacity only, --dur-base | transition |
| StickyBar and mobile cart checkout bar | StickyBar, cart bottom bar | translateY(100%) to 0 | --dur-slow --ease-out | --dur-base --ease-in | opacity 0 to 1, --dur-fast | transition, IntersectionObserver trigger |
| Mega panel | NavBar goals panel | opacity 0 to 1 plus translateY(-4px) to 0 | --dur-base --ease-out (after the 120ms intent delay) | opacity, --dur-fast --ease-in | opacity only | transition |
| Dropdowns and suggestions | user menu, "المزيد" overflow, search suggestions panel, tooltips | opacity 0 to 1 (dropdowns add translateY(-4px) to 0) | --dur-fast --ease-out | --dur-fast --ease-in | opacity only | transition |
| Tabs indicator | SallaTabs indicator | translateX(calc(var(--direction-factor) * Npx)) plus scaleX to the tab width | --dur-base --ease-in-out | (same) | jumps | transition |
| Skeleton pulse | Skeleton root only | opacity 1 to 0.6 to 1, 1.2s loop | --ease-in-out | (loop) | static at opacity 0.8 | keyframes |
| Goal grid settle | the six GoalCards in OxGoals (7.2) | opacity 0 to 1 plus translateY(8px) to 0, delay index times --stagger-step | --dur-base --ease-out | (once) | cards simply present, no delay | keyframes, IntersectionObserver trigger |
| Route change | the document | see 7.3 | --dur-slow | --dur-fast | root cross-fade only | View Transitions |
| Anchor scrolls | "تسوق حسب هدفك", goal hero button, "قيم المنتج", #faq-N deep links | `scroll-behavior: smooth` on html | browser | browser | `scroll-behavior: auto` | native |

The accordion row is the one property outside transform and opacity, and it is written down here as the exception: a user-initiated open of a single panel bounded by its content, once per click, on one subtree. `grid-template-rows` is the reliable way to animate to an unknown height; `height` itself is never animated, and no accordion opens on load or on scroll.

Not animated, by decision: colour and border changes; image load (the image covers the plate with no fade); header shadow on scroll; badges, chips and applied filters appearing or leaving; LoadMore rows (they mount at final height); the BottomTabBar hiding under a drawer; the free-shipping bar fill (snaps to its new width); focus rings; star fills; the wedge and every polygon; the mark on the 404 and empty states; the hero video (it is a video, governed by 8.7, not a motion primitive).

### 7.2 The signature moment: the goal grid settle

The one entrance animation on the site. When OxGoals first enters the viewport at 30% (IntersectionObserver, once per mount), the six GoalCards run from opacity 0 and translateY(8px) to opacity 1 and translateY(0) over --dur-base with --ease-out, each delayed by its DOM index times --stagger-step: 0, 40, 80, 120, 160, 200ms, the last card landing at 380ms. DOM order is reading order, so in Arabic the wave runs from the top-right card across the row on desktop and down the two columns on mobile; the translate is vertical, so no direction factor is involved.

Rules. The grid's box is reserved at final size (6.2) before the settle starts, so nothing shifts. The cards are focusable and pressable from the first frame (no pointer-events change). The settle runs once per page mount, never on return to the route, never in the mega panel's GoalCards, and never on any other grid: --stagger-step has exactly one consumer. On the first load it happens to coincide with the skeleton resolving into content (constraint 10), which is the point: the shop arrives, the rest of the page is simply there. Under reduced motion the six cards are present at opacity 1 with no delay.

### 7.3 Route changes: the view-transition rule

Mechanism. Same-document View Transitions around the router's DOM commit (`document.startViewTransition`, the router's view-transition option), after the loader resolves; pending states use the skeleton, never a transition. Where the API is unsupported the navigation swaps instantly; no polyfill, no library. Because the SSR defect discards the server tree, transitions apply only to client navigations after hydration, which is every navigation the user makes.

Root. `::view-transition-old(root)` fades out over --dur-fast with --ease-in; `::view-transition-new(root)` fades in over --dur-slow with --ease-out. The root never translates: a whole-viewport slide is the largest layer move a phone can be asked for.

Named groups, and only these:

| view-transition-name | Set on | Behaviour |
|---|---|---|
| ox-header | the sticky header (MainBar or MobileHeader) | pinned: it does not fade with the root |
| ox-tabbar | BottomTabBar | pinned |
| ox-product-{id} | the image of the one ProductCard the user activated (assigned on pointerdown or keydown, removed on navigation end) and the PdpGallery main image | the group morphs position and size over --dur-slow --ease-out; card plate and gallery plate share --ox-plate, so the morph is clean |
| ox-hero-photo | the photo panel of OxHero, the GoalLanding hero and the services hub hero | the band's photo box morphs between heroes over --dur-slow --ease-out; the polygon is inside the snapshot, so the angled edge travels with the box and is never interpolated as a path (this is the exception 4.5 names) |

Rules. At most four named groups exist in any one transition; no per-item element other than the single activated card is ever named; nothing inside a horizontal scroller is named except that activated card, and its name is removed if the navigation is cancelled. Traversals (back and forward) skip the transition so the browser's own swipe gesture is not doubled. Under reduced motion the named groups set `view-transition-name: none` and only the root cross-fade remains. Groups animate in physical coordinates, so the direction factor does not apply. The same names serve the cross-document form (`@view-transition { navigation: auto; }`) should any route ever fall back to a full page load; nothing else changes.
