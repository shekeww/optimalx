# Salla React Theme Engine - Extension Surface Report

Repo: `C:\Users\Ahmed\OneDrive\Desktop\optimalx` (pnpm, Windows).
Engine: `@salla.sa/twilight-theme-engine@1.0.47`, real path
`node_modules/.pnpm/@salla.sa+twilight-theme-en_0d498908f52b85eb67136089d73316ea/node_modules/@salla.sa/twilight-theme-engine`
(shortened below to **`<ENG>`**).
Components: `@salla.sa/twilight-components-react@3.0.0-beta.1` ->
`node_modules/.pnpm/@salla.sa+twilight-componen_7a7bf83389819162ee89a2d6cf191a3a/node_modules/@salla.sa/twilight-components-react` (**`<CR>`**),
backed by `@salla.sa/twilight-components@3.0.0-beta.1` (**`<TC>`**).
Tailwind theme: `@salla.sa/twilight-tailwind-theme@3.0.0-beta.1` (**`<TW>`**).

> Engine `dist/` ships **hashed rollup chunks + a full `.d.ts` tree + `.js.map` with sourcesContent**.
> Types are cited from the `.d.ts` files; runtime behaviour from the chunk `.js` files (line numbers are real).

---

## 1. Hook system - the 26 named extension points

### 1.1 The `HookName` enum - complete (26 members)

`<ENG>/dist/types/hooks.d.ts:12-39` (runtime enum in `<ENG>/dist/chunk-TP3LCGE7.js`, re-exported at `<ENG>/dist/index.js:20`)

| # | Enum member | String value | Line |
|---|---|---|---|
| 1 | `BODY_START` | `body:start` | types/hooks.d.ts:13 |
| 2 | `BODY_END` | `body:end` | types/hooks.d.ts:14 |
| 3 | `BODY_INNER` | `body:inner` | types/hooks.d.ts:15 |
| 4 | `HEAD_START` | `head:start` | types/hooks.d.ts:16 |
| 5 | `HEAD_END` | `head:end` | types/hooks.d.ts:17 |
| 6 | `HEAD_INNER` | `head:inner` | types/hooks.d.ts:18 |
| 7 | `HEADER_START` | `header:start` | types/hooks.d.ts:19 |
| 8 | `HEADER_END` | `header:end` | types/hooks.d.ts:20 |
| 9 | `FOOTER_START` | `footer:start` | types/hooks.d.ts:21 |
| 10 | `FOOTER_END` | `footer:end` | types/hooks.d.ts:22 |
| 11 | `PRODUCT_DESCRIPTION_START` | `product:single.description.start` | types/hooks.d.ts:23 |
| 12 | `PRODUCT_DESCRIPTION` | `product:single.description` | types/hooks.d.ts:24 |
| 13 | `PRODUCT_DESCRIPTION_END` | `product:single.description.end` | types/hooks.d.ts:25 |
| 14 | `PRODUCT_FORM_START` | `product:single.form.start` | types/hooks.d.ts:26 |
| 15 | `PRODUCT_FORM_END` | `product:single.form.end` | types/hooks.d.ts:27 |
| 16 | `CART_ITEMS_START` | `cart:items.start` | types/hooks.d.ts:28 |
| 17 | `CART_ITEMS_END` | `cart:items.end` | types/hooks.d.ts:29 |
| 18 | `CART_SUMMARY_START` | `cart:summary.start` | types/hooks.d.ts:30 |
| 19 | `CART_SUMMARY_END` | `cart:summary.end` | types/hooks.d.ts:31 |
| 20 | `SEARCH_START` | `search:start` | types/hooks.d.ts:32 |
| 21 | `SEARCH_ITEMS_START` | `search:items.start` | types/hooks.d.ts:33 |
| 22 | `SEARCH_ITEMS_END` | `search:items.end` | types/hooks.d.ts:34 |
| 23 | `SEARCH_END` | `search:end` | types/hooks.d.ts:35 |
| 24 | `HOMEPAGE_SLIDER` | `homepage:slider` | types/hooks.d.ts:36 |
| 25 | `HOMEPAGE_BANNERS` | `homepage:banners` | types/hooks.d.ts:37 |
| 26 | `HOMEPAGE_FEATURED` | `homepage:featured` | types/hooks.d.ts:38 |

`HookName` is a real (non-const) TS enum, so it exists at runtime and is importable from
`@salla.sa/twilight-theme-engine` (`dist/index.d.ts:10`) and from `.../hooks` (`dist/hooks/index.d.ts:4`).

### 1.2 Registration API

| API | Signature | Path:line |
|---|---|---|
| `hookRegistry.register` | `register<T>(name: HookName \| string, handler: HookHandler<T>, priority?: number): void` (default priority 50) | `<ENG>/dist/hooks/HookRegistry.d.ts:35` |
| `hookRegistry.subscribe` | `(name, cb: () => void) => () => void` | HookRegistry.d.ts:36 |
| `hookRegistry.unsubscribe` | `(name, cb) => void` | HookRegistry.d.ts:37 |
| `hookRegistry.getHandlers` | `(name) => HookDefinition[]` | HookRegistry.d.ts:39 |
| `hookRegistry.has / clear / clearAll / list` | `(name)=>boolean` / `(name)=>void` / `()=>void` / `()=>string[]` | HookRegistry.d.ts:40-43 |
| `defineHooks` | `defineHooks(hooks: HookHandlers): void` bulk register | HookRegistry.d.ts:46 |
| `useHook` | `useHook<T>(name: string, handler: HookHandler<T>, priority?: number): void` - auto-cleanup on unmount | `<ENG>/dist/hooks/useHook.d.ts:23` |
| `HookSlot` | `HookSlot({name, context, fallback, ssr}: HookSlotProps)` | `<ENG>/dist/hooks/HookSlot.d.ts:95` |
| `registerThemeHookSlots` | `(...names: string[]) => void` - whitelists slot names for the Salla SDK `hooks.mount()` | `<ENG>/dist/utils/theme-hook-slots.d.ts:8` |
| `applyThemeHookSlots` | `() => void` (engine-only) | theme-hook-slots.d.ts:19 |
| `getRegisteredThemeHookSlots` | `() => string[]` | theme-hook-slots.d.ts:21 |
| `renderThemeHookSlotsScript` | `(names?: string[]) => string \| null` inline head script | theme-hook-slots.d.ts:35 |

Types: `HookHandler<T> = (context: T) => ReactNode` (`types/hooks.d.ts:43`);
`HookDefinition = {id:number; handler:HookHandler; priority:number}` (`types/hooks.d.ts:47-51`);
`HookHandlers = Record<string, HookHandler | Array<{priority?:number; handler:HookHandler}>>` (`types/hooks.d.ts:55-58`).

### 1.3 `HookSlot` props and handler context

`<ENG>/dist/hooks/HookSlot.d.ts:81-94`

| Prop | Type | Note |
|---|---|---|
| `name` | `HookName \| string` | HookSlot.d.ts:83 |
| `context` | `Record<string, unknown>` | merged with twilight context before handlers run - HookSlot.d.ts:85 |
| `fallback` | `React.ReactNode` | rendered only when NO handler is registered - HookSlot.d.ts:87 |
| `ssr` | `boolean` (default false) | when false the inner `<salla-hook>` is client-only, deliberately, to avoid hydration mismatch from injected DOM - HookSlot.d.ts:88-93 |

Handler context: `interface HookContext { twilight: TwilightContextValue; [K:string]: unknown }`
(`HookSlot.d.ts:75-80`) - so every handler can read
`context.twilight.{isReady, store, theme, currency, config, api, salla}` (`HookSlot.d.ts:11-13`).

**Required global CSS**: `salla-hook{all:unset;display:none}` - stated at `HookSlot.d.ts:49`.

### 1.4 How this theme injects into a slot (existing pattern)

- `app/hooks/index.tsx:9-17` - `hookRegistry.register(HookName.BODY_END, (context: HookContext) => {...}, 50)`;
  gated on `twilight?.theme?.settings?.enable_add_product_toast` (`:13`), renders `<AddProductToast />` (`:14`).
- `app/hooks/index.tsx:21-29` - `hookRegistry.register(HookName.PRODUCT_DESCRIPTION, ...)`; reads
  `context.product` cast to `Product` (`:24`), gated on `product?.digital_files_settings` (`:25`),
  renders `<DigitalFilesSettings {...product.digital_files_settings} />` (`:26`).
- `app/hooks/index.tsx:33` - module-scope self-call `registerThemeHooks()`, and it is called **again**
  at `app/router.tsx:18`. `HookRegistry.register` never dedupes (it appends with an incrementing id,
  `HookRegistry.d.ts:34`), so both handlers are registered twice -> the toast handler runs twice. See section 15.
- `app/components/common/BlockHookSlot.tsx:21-27` - theme slot wrapper rendering
  `<div class="s-blocks-wrapper {wrapper}{className}"><HookSlot name={name} /></div>` so classic
  storefront app blocks (`s-before-*` / `s-after-*`) keep working. Its comment
  (`BlockHookSlot.tsx:18-20`) records that the engine dropped the dotted `product.single.*` /
  `product.index.*` names and this restores them by literal string.
  `BlockHookSlot` is currently **imported nowhere** in `app/` - dormant scaffold.

### 1.5 Default hooks the engine registers for you

`<ENG>/dist/hooks/registerDefaultHooks.d.ts:1-17` - auto-runs on `import '.../hooks'`
(`dist/hooks/index.d.ts:25`). Registers handlers for `body:start` / `body:end` for
tracking + notification components; each self-gates at render time from the twilight context
(`registerDefaultHooks.d.ts:4-8,11-15`).

---

## 2. Component registry - overriding engine components by name

### 2.1 API

`<ENG>/dist/components/ComponentRegistry.d.ts:2-19`, runtime `<ENG>/dist/chunk-342EPVXN.js:1-50`

| API | Signature | Path:line |
|---|---|---|
| `registry` (singleton) | `const registry: ComponentRegistry` | ComponentRegistry.d.ts:14 ; runtime `chunk-342EPVXN.js:48` |
| `registry.register` | `register<P>(name: string, component: ComponentType<P>): void` - plain `Map.set`, **drops any previous entry incl. its `original`** | ComponentRegistry.d.ts:4 ; `chunk-342EPVXN.js:6-11` |
| `registry.override` | `override<P>(name, component): void` - keeps the previous entry as `original`; **falls back to plain `register` if the key does not exist yet** | ComponentRegistry.d.ts:5 ; `chunk-342EPVXN.js:12-23` |
| `registry.resolve` | `resolve<P>(name) => ComponentType<P> \| null` | ComponentRegistry.d.ts:6 ; `chunk-342EPVXN.js:24-27` |
| `registry.getOriginal` | `getOriginal<P>(name) => ComponentType<P> \| null` | ComponentRegistry.d.ts:7 ; `chunk-342EPVXN.js:28-31` |
| `registry.has / list / listByPrefix / clear / remove` | `(name)=>boolean` / `()=>string[]` / `(prefix)=>string[]` / `()=>void` / `(name)=>boolean` | ComponentRegistry.d.ts:8-12 ; `chunk-342EPVXN.js:32-46` |
| `defineComponent` | `defineComponent<P>({name, component, override?}) => ComponentType<P>` | `<ENG>/dist/components/defineComponent.d.ts:7` ; runtime `dist/index.js:68-75` |
| `registerComponents` | `(components: Record<string, ComponentType>) => void` | defineComponent.d.ts:8 ; `dist/index.js:76-80` |
| `overrideComponents` | `(components: Record<string, ComponentType>) => void` | defineComponent.d.ts:9 ; `dist/index.js:81-85` |
| `<Component name=... fallback=... {...props} />` | `ComponentProps { name: string; fallback?: ReactNode; [k:string]: unknown }` | `<ENG>/dist/components/Component.d.ts:2-7` ; `dist/index.js:48-57` (dev warning via `window.salla.logger.warn`, `index.js:52`) |
| `useComponent(name)` | `=> ComponentType<P> \| null` | `<ENG>/dist/components/useComponent.d.ts:2` ; `dist/index.js:60-62` |
| `useOriginalComponent(name)` | `=> ComponentType<P> \| null` (the pre-override component) | useComponent.d.ts:3 ; `dist/index.js:63-65` |
| `registerHomeComponents` | `(components?: Record<string, AnyHomeComponent \| null>, prefix = 'home:') => void` - iterates and calls `registry.register(prefix+path, component)`, skipping nulls | `<ENG>/dist/components/home/register.d.ts:3` ; runtime `chunk-WITIL2MK.js:476-483` |
| `registerHomeComponentConfig` | `(config: Record<string, HomeComponentConfig>) => void` - `Object.assign` into `themeComponentConfig` | `<ENG>/dist/components/home/HomePageRenderer.d.ts:28` ; runtime `chunk-WITIL2MK.js:647-649` |

### 2.2 Exported key constants

`<ENG>/dist/components/ComponentRegistry.d.ts:16-19`

```
COMPONENT_KEYS = { PRODUCT_CARD: 'product:card', PRODUCT_GALLERY: 'product:gallery' }
```

### 2.3 Every registrable name found in the engine

| Registry key | Consumed at | Notes |
|---|---|---|
| `product:card` | `<ENG>/dist/chunk-UQRLBMIO.js:21` (`PRODUCT_CARD_KEY`), read at `:219-231` | **`registry.override()` is required, not `register()`** - `ProductCard` only swaps when `registry.getOriginal('product:card') !== null` (`chunk-UQRLBMIO.js:221`). Resolved **once** inside `useMemo(..., [])` (`:220`), so registration must happen before first render. |
| `product:gallery` | `<ENG>/dist/chunk-UQRLBMIO.js:232` (`PRODUCT_GALLERY_KEY`), read at `:313-321` | Either `register` or `override` works here - it resolves the key directly and only guards against self-reference (`:316`). Also `useMemo(..., [])`. |
| `home:<path>` | `chunk-WITIL2MK.js:589-593` (`home:${path}`) | One key per twilight.json `components[].path`. See section 4. |
| `home:<path>:<view_style>` | `chunk-WITIL2MK.js:583-587` | Style-variant lookup, tried **first**, e.g. `home:featured-products:style1`. |

The 13 `home:*` names the engine registers by default (`DefaultHomeComponents`, `chunk-WITIL2MK.js:461-475`):
`fixed-banner`, `photos-slider`, `testimonial`, `store-features`, `youtube`, `square-photos`,
`fixed-products`, `products-slider`, `parallax-background`, `featured-products:style1`,
`featured-products:style2`, `featured-products:style3`, `bundle-component`.

Anything not in the registry renders `FallbackComponent`, a yellow dev card telling you to
`registry.register('home:<path>', YourComponent)` - and **`null` in production**
(`chunk-WITIL2MK.js:551-579`, prod short-circuit at `:553`).

There is **no** registry key for Header / Footer / MainMenu / MobileMenu / CartSummary / ErrorPage.
Those are plain exports; see section 10.

---

## 3. Every route export under `@salla.sa/twilight-theme-engine/routes/*`

Barrel of re-exported types: `<ENG>/dist/routes/index.d.ts:1-19`.
Every route module is the same shape - `{ id, loader, head, Component }`
(the contract type is `RouteModule<TData,TParams,TProps>` at `<ENG>/dist/routes/types.d.ts:26-35`).
Every `loader` takes an optional **second** arg `extend(data, {params}) => Partial` so a theme can
graft extra fields onto loader data without forking the route.

| Export | `id` | Subpath | loader signature | loader data type | Component props | Path:line |
|---|---|---|---|---|---|---|
| `Home` | `index` | `/routes/home` | `loader(_ctx?: {locale?: string})` (no `extend`) | `HomeLoaderData { locale: string; components: HomeComponentData[]; page: {slug: string} }` | `HomePageProps { locale?: string; components?: HomeComponentData[] }` | `routes/home/index.d.ts:11-20`; `routes/home/loader.d.ts:2-8`; `routes/home/types.d.ts:6-9` |
| `Cart` | `cart` | `/routes/cart` | `loader(_ctx?: {locale?}, extend?)` | `CartPageProps { page: Page; cart?: Cart }` | same | `routes/cart/index.d.ts:8-19`; `routes/cart/types.d.ts:2-5`. **SSR-safe: loader returns page metadata only; cart data is fetched client-side via React Query because the cart id lives in localStorage** (`routes/cart/loader.d.ts:2-7`) |
| `Product` | `product.single` | `/routes/product` | `loader({params: IdParams, locale?}, extend?)` | `ProductPageProps { page: Page; product: Product }` | same | `routes/product/index.d.ts:8-20`; `routes/product/types.d.ts:2-5` |
| `ProductListing` | `product.index` | `/routes/product-listing` | `productListLoader(ctx: ProductListLoaderContext)` | `ProductListLoaderData { page: ProductListPageMeta; source: ProductListSourceConfig; query: ProductListQuery; products: Product[]; pagination: RoutePagination; filters?: Filter[] }` | same | `routes/product-listing/index.d.ts:7-12`; `types.d.ts:41-48` |
| `Blog` | `blog.index` | `/routes/blog` | `(_ctx?: {locale?}, extend?)` | `BlogPageProps { page; articles: ArticleSummary[]; categories?; slides?; popular? }` | same | `routes/blog/index.d.ts:46-51`; `routes/blog/types.d.ts:59-65` |
| `BlogSingle` | `blog.single` | `/routes/blog` | `({params: SlugIdParams, locale?}, extend?)` | `BlogSinglePageProps { page; article: ArticleDetail; related? }` | same | `routes/blog/index.d.ts:52-57`; `types.d.ts:66-70` |
| `BlogAuthorRoute` | `blog.index.author` | `/routes/blog` | `({params: IdParams, locale?}, extend?)` | `BlogAuthorLoaderData { page; author; categories; articles; cursor: Pagination }` | same | `routes/blog/index.d.ts:58-63`; `types.d.ts:71-77` |
| `BlogCategoryRoute` | `blog.index.category` | `/routes/blog` | `({params: SlugIdParams, locale?}, extend?)` | `BlogCategoryLoaderData { page; blogCategory; categories; articles; cursor }` | same | `routes/blog/index.d.ts:64-69`; `types.d.ts:78-84` |
| `BlogTagRoute` | `blog.index.tag` | `/routes/blog` | `({params: SlugIdParams, locale?}, extend?)` | `BlogTagLoaderData { page; blogTag; categories; articles; cursor }` | same | `routes/blog/index.d.ts:70-75`; `types.d.ts:85-91` |
| `Brands` | `brands.index` | `/routes/brands` | `(_ctx?: {locale?}, extend?)` | `BrandsPageProps { page: Page; brands: BrandsGroup }` where `BrandsGroup = {[char: string]: Brand[]}` | `({page, brands})` | `routes/brands/index.d.ts:14-19`; `routes/brands/types.d.ts:25-31` |
| `Profile` | `customer.profile` | `/routes/account` | `(_ctx:{locale?}, extend?)` | `ProfilePageProps { page: Page }` | same | `routes/account/profile/index.d.ts:7-16` |
| `Wishlist` | `customer.wishlist` | `/routes/account` | `(ctx: LoaderContext, extend?)` | `WishlistPageProps { page; query: PageQuery; products: Product[]; pagination: RoutePagination }` | same | `routes/account/wishlist/index.d.ts:8-15`; `wishlist/types.d.ts:3-8` |
| `Wallet` | `customer.wallet` | `/routes/account` | `(ctx: LoaderContext, extend?)` | `WalletPageProps { page; query; transactions: TransactionItem[]; balance: number; pagination }` | same | `routes/account/wallet/index.d.ts:8-15`; `wallet/types.d.ts:4-10` |
| `Notifications` | `customer.notifications` | `/routes/account` | `(_ctx:{locale?}, extend?)` | `NotificationsPageProps { page; notifications: Notification[] }` | same | `routes/account/notifications/index.d.ts:7-16`; `notifications/types.d.ts:2-16` |
| `Settings` | `customer.settings` | `/routes/account` | `(_ctx:{locale?}, extend?)` | `SettingsPageProps { page: Page }` | same | `routes/account/settings/index.d.ts:7-16` |
| `Orders` | `customer.orders.index` | `/routes/account/orders` | `({search?: OrdersSearchParams, locale?, with_items?: boolean\|number}, extend?)` | `OrdersPageProps { page; orders: OrderListItem[]; cursor?: Pagination; query?: OrdersQuery }` | same | `routes/account/orders/index.d.ts:9-29`; `orders/types.d.ts:10-15` |
| `OrderSingle` | `customer.orders.single` | `/routes/account/orders` | `({params: IdParams, locale?}, extend?)` | `OrderSinglePageProps { page; order: Order }` | same | `routes/account/orders/index.d.ts:17-35`; `orders/types.d.ts:16-19` |
| `Loyalty` | `loyalty` | `/routes/loyalty` | `(_ctx?:{locale?}, extend?)` | `LoyaltyPageProps { page; loyalty: Loyalty }` | same | `routes/loyalty/index.d.ts:7-18`; `loyalty/types.d.ts:72-75` |
| `PageSingle` | `page-single` | `/routes/page` | `({params: IdParams, locale?}, extend?)` | `PageSingleProps { page: StaticPage }` | same | `routes/page/index.d.ts:8-20`; `page/types.d.ts:15-17` |
| `Testimonials` | `testimonials` | `/routes/testimonials` | `({locale?}, extend?)` | `TestimonialsPageProps { page: Page }` | same | `routes/testimonials/index.d.ts:7-18` |
| `ThankYou` | `thank-you` | `/routes/thank-you` | `({params: ThankYouLoaderParams /* {orderId:string} */, locale?}, extend?)` | `ThankYouPageProps { page; order?: Order; thank_you_title?; share_message?; short_share_message?; messages?: string[] }` | same | `routes/thank-you/index.d.ts:7-19`; `thank-you/types.d.ts:3-14` |
| `slugBrandRedirectLoader` | (loader only) | `/routes/seo-redirects` | `({params: SlugBrandParams}) => Promise<never>` (always throws a redirect) | - | - | `routes/seo-redirects.d.ts:9-11` |
| `pendingOrdersRedirectLoader` | (loader only) | `/routes/seo-redirects` | `(ctx?: {params: PendingOrdersRedirectParams}) => Promise<never>` | - | - | `routes/seo-redirects.d.ts:16-18` |
| `NotFoundPage` | - | `/routes` (via `routes/not-found`) | - | - | `NotFoundPageProps { title?, message?, showHomeLink?, homeLinkText?, LinkComponent? }` | `routes/not-found.d.ts:2-14` |

**There is no dedicated `search`, `offers`, `tags`, `latest`, `sales` or `brands/$id` route export.**
All six are the single `ProductListing` route driven by `params.source`
(`ProductListSource = 'categories' \| 'latest' \| 'sales' \| 'offers' \| 'search' \| 'tags' \| 'brands'`,
`routes/product-listing/types.d.ts:13`). This theme wires them at:
`app/routes/search.tsx:16-20` (`source:'search'`, `search:{q}`),
`app/routes/offers.tsx:19-27` (`source:'offers'`, `title:'Offers'`, `slug:'offers'`),
`app/routes/latest-products.tsx:19-27` (`source:'latest'`),
`app/routes/most-sales-products.tsx:19-27` (`source:'sales'`),
`app/routes/tags.$id.tsx:19-21` and `app/routes/$slug.tag-$id.tsx:19-21` (`source:'tags'`, `id`),
`app/routes/brands.$id.tsx:19-21` (`source:'brands'`, `id`),
`app/routes/$slug.c$id.tsx:18-23` (default `categories` via `params.id`).

Lazy variants of every page component: `<ENG>/dist/routes/lazy.d.ts:1-22`
(`LazyHomePage`, `LazyCartPage`, `LazyProductPage`, `LazyProductListingPage`, `LazyBlogPage`,
`LazyBlogSinglePage`, `LazyBlogAuthorPage`, `LazyBlogCategoryPage`, `LazyBlogTagPage`,
`LazyBrandsPage`, `LazyProfilePage`, `LazyWishlistPage`, `LazyWalletPage`, `LazyNotificationsPage`,
`LazySettingsPage`, `LazyOrdersPage`, `LazyOrderSinglePage`, `LazyLoyaltyPage`, `LazyPageSingle`,
`LazyTestimonialsPage`, `LazyThankYouPage`, `LazyNotFoundPage`).

Semantic route ids: `RouteId` const object, 30 members, `<ENG>/dist/router/route-ids.d.ts:5-35`
(includes ids with no route module of their own: `product.index.search`, `product.index.latest`,
`product.index.sales`, `product.index.offers`, `product.index.tag`, `brands.single`,
`customer.layout`, `customer.orders.index.pending`).

---

## 4. The Home route - how `components[].path` becomes a React component

### 4.1 The resolution chain, end to end

1. **twilight.json** declares blocks with a dotted, `home.`-prefixed path. This theme declares 6:
   `home.enhanced-slider`, `home.main-links`, `home.slider-products-with-header`,
   `home.enhanced-square-banners`, `home.brands`, `home.custom-testimonials`.
2. **API** returns the merchant-configured blocks: `home.components()` -> `Promise<HomeComponentData[]>`
   (`<ENG>/dist/api/home.d.ts:2-3`).
3. **`homeLoader`** strips the prefix: `path: comp.path?.replace('home.', '') || comp.path`
   (`<ENG>/dist/chunk-L42W6YS3.js:20`). So `home.enhanced-slider` -> `enhanced-slider`.
   It also sets `locale: ctx?.locale || 'ar'` (`:17`) and `page: {slug: RouteId.INDEX}` (`:22`).
4. **`HomePage`** maps the array to `<HomeComponentRenderer data index key={data.key ?? JSON.stringify(data)} />`
   (`chunk-L42W6YS3.js:44`).
5. **`getComponentByPath(data)`** (`chunk-WITIL2MK.js:580-595`) tries, in order:
   - `registry.resolve('home:' + path + ':' + data.view_style)` when `view_style` is set (`:582-588`)
   - `registry.resolve('home:' + path)` (`:589-593`)
   - `FallbackComponent` (`:594`) - dev-only yellow card, **`null` in production** (`:553`)
6. **`registerHomeComponents(map, prefix)`** writes those keys, default prefix `home:`
   (`chunk-WITIL2MK.js:476-483`).

### 4.2 Theme wiring in this repo

`app/router.tsx:20-29` - one `registerHomeComponents({...})` call at module scope:

| Registered key | Component | File |
|---|---|---|
| `home:brands` | `Brands` | `app/components/home/Brands.tsx:18` |
| `home:enhanced-slider` | `EnhancedSlider` | `app/components/home/EnhancedSlider.tsx:33` |
| `home:custom-testimonials` | `CustomTestimonials` | `app/components/home/CustomTestimonials.tsx:21` |
| `home:main-links` | `MainLinks` | `app/components/home/MainLinks.tsx:43` |
| `home:square-links` | `MainLinks` (aliased to the same component) | `app/router.tsx:26` |
| `home:slider-products-with-header` | `SliderProductsWithHeader` | `app/components/home/SliderProductsWithHeader.tsx:26` |
| `home:enhanced-square-banners` | `EnhancedSquareBanners` | `app/components/home/EnhancedSquareBanners.tsx:19` |
| + the 13 `DefaultHomeComponents` keys | engine components | `app/router.tsx:21` |

### 4.3 What each home component receives

Contract: `AnyHomeComponent = ComponentType<{ data: any; priority?: boolean }>`
(`<ENG>/dist/components/home/types.d.ts:2-5`) - but the renderer passes only **one** prop:
`<Component data={{ ...data, position: index + 1, priority: index <= 2 }} />`
(`chunk-WITIL2MK.js:678`, with `isFirstComponent = index <= 2` at `:672`).
So `priority` arrives **inside `data`**, not as a sibling prop; the declared top-level
`priority?: boolean` is never set. `position` is 1-based.

`HomeComponentData` (`<ENG>/dist/types/index.d.ts:702-708`):
`path: string`, `key?: string|number|null`, `view_style?: string|null`, `component?: JsonObject`,
plus an index signature - merchant fields are spread **flat onto `data`**, keyed by the
twilight.json field `id`.

| Block (`data.path`) | Fields on `data` | twilight.json field types |
|---|---|---|
| `enhanced-slider` | `slides[]` -> `{image, title, description, without_overlay}`; theme also accepts `slider_banner[]`, `slider_view_height`, `slider_animation_time`, `slider_animation_enabled` | `slides`: `collection/collection` with `string/image`, `string/text`, `string/textarea`, `boolean/switch`; 2x `static/description` |
| `main-links` | `title`, `merge_with_top_component`, `show_controls`, `show_cats`, `categories[]`, `links[]` -> `{icon, title, url}` | `string/text` (multilanguage), 2x `boolean/switch`, `items/dropdown-list` (multichoice + searchable + `source`), `collection/collection` with `string/icon`, `string/text`, `items/variable-list`; 3x `static/description` (2 carry `conditions`) |
| `slider-products-with-header` | `background`, `title`, `description`, `products` (`{source, source_value}` **or** `Product[]`), `display_all_url` | `string/image`, `string/text`, `string/textarea`, `items/dropdown-list`, `items/variable-list` |
| `enhanced-square-banners` | `banners[]` -> `{image, url, title, description}` | `collection/collection` with `string/image`, `items/variable-list`, `string/text`, `string/textarea` |
| `brands` | `title`, `brands[]` (`Brand[]`) | `string/text`, `items/dropdown-list` |
| `custom-testimonials` | `items[]` -> `{name, avatar, stars, text}` | `collection/collection` with `string/text`, `string/image`, `number/integer`, `string/textarea` |

Theme-side prop interfaces: `EnhancedSlider.tsx:4-31`, `MainLinks.tsx:5-41`,
`SliderProductsWithHeader.tsx:7-24`, `EnhancedSquareBanners.tsx:4-17`, `Brands.tsx:6-16`,
`CustomTestimonials.tsx:6-19`. All declare `position?: number` plus an index-signature catch-all
and read `data.position ?? 1` (or `?? 0`).
`SliderProductsWithHeader.tsx:39-57` shows the dual `products` shape handling
(source config vs a literal `Product[]` -> `source: 'selected'` + id list).

### 4.4 Render shell: lazy loading, height reservation, class names

`HomeComponentRenderer` (`chunk-WITIL2MK.js:653-691`) wraps every block in `LazyRenderWhenVisible`:
`rootMargin: '50px'` (`:682`), `estimatedHeight` (`:685`), `renderOnMount: index <= 2` (`:686`),
skeleton `placeholder` (`:687`). Default wrapper class when no config exists:
`s-block s-block--${data.path}` (`:675`).
Engine per-path config table `COMPONENT_CONFIG` at `chunk-WITIL2MK.js:596-645`:
products-slider / fixed-products / featured-products `450px`, testimonial `350px`,
store-features `200px`, parallax-background `500px`, fixed-banner `350px`,
photos-slider `clamp(130px, 30vw, 350px)`, square-photos `250px`, youtube `350px`,
bundle-component `400px`, main-links `200px`, square-links `200px`; global fallback `400px` (`:677`).
`featured-products` and `main-links` compute their wrapper class from `data` (`:602-612`, `:633-642`).
Theme config registered via `registerHomeComponentConfig` **wins** over the engine table
(`resolveComponentConfig`, `:650-652`).
**This theme never calls `registerHomeComponentConfig`** - so all six custom blocks get the generic
`400px` reservation and a `ProductsSliderSkeleton` placeholder.

In development `HomeComponentRenderer` logs a RENDER line (`chunk-WITIL2MK.js:659-663`), and it also
has an **ungated** MOUNT/UNMOUNT `console.log` inside a `useEffect` that runs in production too
(`:664-671` - no `NODE_ENV` check on that one).

### 4.5 Extra hook slots the Home page renders (not in `HookName`)

`chunk-L42W6YS3.js:42,43,45` - `home:start`, `home:content`, `home:end`.
All three are **absent from the `HookName` enum**; register them by raw string.

### 4.6 Errors

`ComponentErrorBoundary` wraps every block (`chunk-WITIL2MK.js:678`; class at `:508-547`).
It logs via `twilight.log` (requires `TwilightProvider`, warns otherwise at `:519-523`),
shows a red `DevelopmentErrorCard` in dev (`:484-506`) and renders `null` in production (`:540-543`).

### 4.7 Dev override of home block data

`useDevHomeComponentOverrides(components)` (`chunk-2JV6WZ6O.js:115-132`) merges the DevSettingsWidget's
per-block field overrides into loader data, looking each block up by
`byPath['home.' + path] ?? byPath[path]` (`:125`) - the widget keys by the **prefixed** twilight.json
path while loader data is unprefixed. Returns `components` untouched when `!import.meta.env.DEV` (`:116`).

### 4.8 The rest of the app wiring

| File | What it does | Line refs |
|---|---|---|
| `app/router.tsx` | registers theme hooks + home components, then `getRouter()` keeps a **client-side singleton** so the QueryClient cache survives navigation; SSR builds a fresh router per request | `:18`, `:20-29`, `:33`, `:36-54`; `createRouter(routeTree, {defaultPendingMs:100, defaultPendingMinMs:200})` at `:43-46`; `declare module '@tanstack/react-router'` Register at `:56-60` |
| `app/routes.ts` | virtual-file-routes extension point auto-discovered by `twilightReact()`; only `route('/kitchen-sink','kitchen-sink.tsx')` registered | `:33-40`; merge/override semantics at `:5-8`; **never prefix a custom route file with `// @auto-generated` or the engine overwrites it** (`:10-11`) |
| `app/start.ts` | `createStart` with `requestMiddleware: [twilightMiddleware(), earlyHintsMiddleware()]` | `:4-8` |
| `app/server.ts` | `withThemeSentry(handler, 'raed')` - the theme id is still the scaffold value `'raed'`, not `optimalx` | `:1-4` |
| `app/client.tsx` | `initThemeSentry('raed')` then `hydrateRoot(document, <StrictMode><StartClient/></StrictMode>)` inside `startTransition` - **hydrates the whole `document`**, so `<html>`/`<head>` are React-owned | `:6`, `:8-15` |
| `app/routes/__root.tsx` | `createTwilightRootRoute()({shellComponent})`; renders `<html lang={ctx.locale} dir={ctx.dir} suppressHydrationWarning>`, `<HeadContent/>`, `<TwilightProvider translations={themeTranslations}>`, `<Outlet/>`, devtools, `DevSettingsWidget`, `<Scripts/>` | `:22-24`, `:27`, `:30`, `:35`, `:45-47`, `:49-53`, `:54`; virtual imports at `:9-10`; dev-only lazy widget gate at `:16-20` |

---

## 5. Typed hooks - complete list

All exported from `@salla.sa/twilight-theme-engine/hooks` (`<ENG>/dist/hooks/index.d.ts:1-26`);
most also have a dedicated subpath export in `package.json` `exports` (e.g. `/hooks/useStore`).

| Hook | Signature | Returns | Path:line |
|---|---|---|---|
| `useStore` | `() => UseStoreResult` | `Store & { refresh(): Promise<void> }` - the whole `Store`: `id, name, username, description, slogan, logo, url, api, icon, favicon, about, meta{title,description,keywords}, settings: StoreSettings, contacts, social, country, store_country, ray, features, apps, template, scope, is_merchant` | `hooks/useStore.d.ts:8-10,35`; `Store` at `types/index.d.ts:19-53` |
| `useTheme` | `() => UseThemeResult` | `{ color: ThemeColor; font: ThemeFont\|undefined; settings: ThemeSettings; isRTL: boolean }` | `hooks/useTheme.d.ts:10-15,40` |
| `useUser` | `() => UseUserReturn` | `UseQueryResult<User\|null> & { isLoggedIn: boolean }`; `isLoggedIn` is true whenever an auth token exists, independent of query state | `hooks/useUser.d.ts:3-7` |
| `useMoney` | `() => UseMoneyResult` | `{ format(amount, {currency?, locale?, type?: 'product'\|'general'}) => ReactNode; parse(str) => number; isValid(v) => boolean }` - **`format` returns a ReactNode, not a string** (SAR renders an `<i className="sicon-sar"/>` glyph) | `hooks/useMoney.d.ts:5-16,25`; SAR note `:23` |
| `useNumber` | `() => UseNumberResult` | `{ format(n) => string; toArabic(n) => string; useArabicNumerals: boolean }`; `useArabicNumerals` mirrors `store.settings.arabic_numbers_enabled` | `hooks/useNumber.d.ts:4-11,23`; setting `types/index.d.ts:111` |
| `useProduct` | `(initialProduct: Product, options?: {isPreview?: boolean}) => UseProductResult` | `{ product: Product; reload(): Promise<void> }`; subscribes to SDK price/stock events; `is_out_of_stock` flips on failed price calc | `hooks/useProduct.d.ts:5-18,56` |
| `useWishlist` | `() => UseToggleWithItems<number>` | `{ ids: number[]; count: number; has(id); add(id); remove(id); toggle(id); loading; error }`; also exports `resetWishlistStore()` | `hooks/useWishlist.d.ts:2-4`; shape `hooks/types.d.ts:44-65` |
| `useCoupon` | `() => UseApply<string>` | `{ value: string\|null; apply(code): Promise<boolean>; remove(): Promise<boolean>; loading; error }` | `hooks/useCoupon.d.ts:23,65`; `hooks/types.d.ts:78-81` |
| `useBlogLike` | `(blogId: number, initialCount?: number) => UseToggle` | `{ active; count; add/remove/toggle; loading; error }` | `hooks/useBlogLike.d.ts:5-6`; `hooks/types.d.ts:69-74` |
| `useGtm` | `() => UseGtmResult` | `{ enabled; push(data); viewPage(type); detail(product); impressions(products,list?); click(product,list?,position?); add(product,qty?); remove(item); checkout(cart,step?); purchase(orderId,cart) }` | `hooks/useGtm.d.ts:2-23,37` |
| `useAsset` | `() => UseAssetResult` | `{ asset(path); cdn(path, w?, h?); isPlaceholder(url) }` | `hooks/useAsset.d.ts:5-12,25` |
| `useDate` | `() => UseDateResult` | `{ format(date, 'full'\|'long'\|'medium'\|'short'\|'time'); ago(date); now: Date }`; `DateInput` also accepts the PHP `{date,timezone_type,timezone}` shape | `hooks/useDate.d.ts:1-11,22` |
| `useComments` | `() => UseCommentsResult` | `{ commentsKey: number; refresh() }` - pass `commentsKey` as React `key` on `<salla-comments>` to remount it after a comment is added | `hooks/useComments.d.ts:7-10,35` |
| `useOpeningHours` | `(settings?: OpeningHoursSettings) => UseOpeningHoursResult` | `{ isOpen; isEnabled; nextOpen: Date\|null; nextOpenFormatted: string }` | `hooks/useOpeningHours.d.ts:2-11,27` |
| `useAsyncFn` | `<T>(fn: T, deps?, initialState?) => [AsyncState, T]` | tuple; dedupes concurrent calls, guards unmounted setState | `hooks/useAsyncFn.d.ts:36-39,66` |
| `useDocumentClass` | `(descriptor: DocumentElementDescriptor) => void` | registers `<html>`/`<body>` attrs with auto-cleanup; SSR-aware via `DocumentClassProvider` | `hooks/useDocumentClass.d.ts:41` |
| `usePageConfig` | `(pageData: PageConfigData) => void` | pushes `salla.config.set('page', ...)`; `PageConfigData {slug, id?, title, url?, parent?}`, URL auto-derived from the router | `hooks/usePageConfig.d.ts:4-15,43` |
| `useIsClient` | `() => boolean` | true only after client mount - the sanctioned hydration-mismatch escape hatch | `hooks/useIsClient.d.ts:6` |
| `useBreadcrumbs` | `(page?: Page\|null) => Breadcrumb[]` | falls back to a synthesised trail when `page.breadcrumbs` is absent | `hooks/useBreadcrumbs.d.ts:2`; note `types/index.d.ts:661` |
| `useHook` | `(name, handler, priority?) => void` | registers a hook handler for the component lifetime | `hooks/useHook.d.ts:23` |
| `useTranslation` | `(ns?: string\|string[]) => { t, i18n, ready, locale, direction, isRTL, isLTR, languageName }` | from `.../i18n` | `<ENG>/dist/providers/I18nProvider.d.ts:20-29` |
| `useTwilight` | `() => TwilightContextValue` | `{ isReady, store, _setStore, theme, currency, config, salla, log, settings: StoreContext, locale, routeId, location, authToken, i18n, dir, extras? }` | `dist/index.d.ts:1`; type `types/twilight.d.ts:25-43` |
| `useRouteId`, `useIsHome`, `useIsProduct`, `useIsCart`, `useIsCustomer`, `useIsBlog`, `useIsBrands`, `useIsSearch` | `() => string` / `() => boolean` | route predicates | `dist/index.d.ts:5` |
| `useComponent` / `useOriginalComponent` | `(name) => ComponentType\|null` | registry lookups | `components/useComponent.d.ts:2-3` |
| `useCartContext` / `useProductContext` | `() => {cart}\|null` / `() => {product}\|null` | from `/contexts` | `contexts/CartContext.d.ts:32`; `contexts/ProductContext.d.ts:32` |

**There is no `useCart` and no `useLocale`.** Cart data comes from `useCartContext()` or the route
loader (`contexts/CartContext.d.ts:23-33`); locale/dir come from `useTranslation()`
(`I18nProvider.d.ts:20-29`) or `useTwilight().locale` / `.dir` (`types/twilight.d.ts:36,41`).

Where the data actually lives:

| Data | Source | Path:line |
|---|---|---|
| store settings | `useStore().settings` / `useTwilight().store.settings` -> `StoreSettings` | `types/index.d.ts:77-171` |
| branches | **not on `Store`**; only `LoyaltyPoint.branches` (`routes/loyalty/types.d.ts:33`), `OrderPackage.branch.name` (`routes/account/types.d.ts:151-153`), `ShippingAddress.branch_id` (`:176`) | - |
| menus | `menu.header()` / `menu.footer()` -> `MenuItem[]`, plus react-query `menu.queries.header()` | `<ENG>/dist/api/menu.d.ts:2-15`; `MenuItem` `types/index.d.ts:756-762` |
| currencies | `useTwilight().settings.currencies: Record<string,{code,name,symbol,amount,country_code}>`; active one `useTwilight().currency` | `api/store.d.ts:13-19`; `types/twilight.d.ts:31` |
| languages | `useTwilight().settings.languages: Language[]` = `{name, code, iso_code?, url (flag SVG), is_rtl, country_code}` | `api/store.d.ts:11-12`; `types/index.d.ts:9-18` |
| locale / dir | `useTwilight().locale`, `.dir`; or `useTranslation().locale/.direction/.isRTL` | `types/twilight.d.ts:36,41`; `I18nProvider.d.ts:24-25` |

---

## 6. Data types

All from `<ENG>/dist/types/index.d.ts` unless noted.

### 6.1 `Product` - every field (`types/index.d.ts:374-441`)

| Field | Type | Line |
|---|---|---|
| `id` | `number` | 375 |
| `name` | `string` | 376 |
| `description` | `string` | 377 |
| `url` | `string` | 378 |
| `promotion_title?` | `string` | 379 |
| `subtitle?` | `string` | 380 |
| `type` | `ProductType` | 381 |
| `status` | `ProductStatus` | 382 |
| `weight?` | `string \| null` | 383 |
| `calories?` | `number \| null` | 384 |
| `sku?` / `mpn?` / `gtin?` | `string \| null` | 385-387 |
| `price` | `number \| string` | 388 |
| `sale_price` | `number` | 389 |
| `regular_price` | `number` | 390 |
| `starting_price?` | `number \| null` | 391 |
| `base_currency_price` | `{currency, amount} \| number` | 392-395 |
| `currency` | `string` | 396 |
| `discount_percentage?` | `string` | 397 |
| `price_as_float?` / `price_as_float_for_payment?` | `number` | 398-399 |
| `currency_for_payment?` | `string` | 400 |
| `quantity?` | `number \| null` | 401 |
| `sold_quantity?` | `number` | 402 |
| `max_quantity` | `number` | 403 |
| `discount_ends?` | `string` | 404 |
| `rating?` | `ProductRating {count, stars}` | 405 / 442-445 |
| `category?` | `ProductCategory {id?, name, url, icon?, image?, sub_categories?: Category[]}` | 406 / 446-453 |
| `brand?` | `ProductBrand {id, name?, description?, url?, logo?}` | 407 / 454-460 |
| `tags?` | `ProductTag[] {id?, name, url}` | 408 / 461-465 |
| `image` | `ProductImage` | 409 |
| `images?` | `ProductImage[] {id?, url?, alt?, video_url?, type?: image\|video, three_d_image_url?, main?, sort?}` | 410 / 466-475 |
| `options?` | `ProductOption[]` | 411 / 476-484 |
| `skus?` | `ProductSku[]` | 412 / 499-511 |
| `notify_availability?` | `NotifyAvailability {channels[], subscribed, subscribed_options?, options?}` | 413 / 520-525 |
| `donation?` | `ProductDonation {target_message?, collected_amount, target_amount, target_percent, target_end_date?, can_donate}` | 414 / 526-533 |
| `is_taxable` | `boolean` | 415 |
| `has_read_more` | `boolean` | 416 |
| `can_add_note` | `boolean` | 417 |
| `can_show_remained_quantity` | `boolean` | 418 |
| `can_show_sold?` | `boolean` | 419 |
| `can_upload_file` | `boolean` | 420 |
| `has_custom_form` | `boolean` | 421 |
| `has_metadata` | `boolean` | 422 |
| `has_options?` | `boolean` | 423 |
| `has_bundle_products?` | `boolean` | 424 |
| `is_on_sale` | `boolean` | 425 |
| `is_hidden_quantity` | `boolean` | 426 |
| `is_available` | `boolean` | 427 |
| `is_in_wishlist?` | `boolean` | 428 |
| `is_out_of_stock` | `boolean` | 429 |
| `is_require_shipping` | `boolean` | 430 |
| `has_3d_image?` | `boolean` | 431 |
| `has_size_guide` | `boolean` | 432 |
| `giftable?` | `boolean` | 433 |
| `can_quick_buy?` | `boolean` | 434 |
| `show_availability?` | `boolean` | 435 |
| `has_preorder_campaign?` | `boolean` | 436 |
| `add_to_cart_label?` | `string` | 437 |
| `notes?` | `string` | 438 |
| `digital_files_settings?` | `JsonObject` | 439 |
| `preorder?` | `JsonObject` | 440 |

**Absent from `Product`:** `metadata`, `promotion` (only `promotion_title`), `services_blocks`,
`categories` (plural - only singular `category`), and any reservation/booking payload.
Booking data appears only as `OrderItem.product_reservations?: Record<string, string|number|boolean>[]`
(`routes/account/types.d.ts:145`) and `OrderItem.booking_location?: string` (`:144`).
`metadata` exists on `Brand` (`routes/brands/types.d.ts:19-23`) and `StaticPage`
(`routes/page/types.d.ts:6-9`), not on `Product`; `has_metadata: boolean` (`:422`) is the only signal.

### 6.2 Unions and supporting product types

- `ProductType` (9 members) = `'product' | 'service' | 'group_products' | 'codes' | 'digital' | 'food' | 'donating' | 'booking' | 'financial_support'` - `types/index.d.ts:372`
- `ProductStatus` = `'sale' | 'out' | 'out-and-notify' | 'hidden'` - `:373`
- `ProductOption {id, name, type: 'text'|'textarea'|'radio'|'checkbox'|'select'|'image'|'color'|string, required, values?, details?}` - `:476-484`. **`values` is the listing shape; `products/{id}/details` sends `details` instead** (`:481-482`).
- `ProductOptionDetail {id, name, option_id, additional_price, option_value, image, color, code, is_out, is_default: 0|1, skus_availability: Record<string,boolean>}` - `:485-497`
- `ProductOptionValue {id, name, price?, image_url?, image?, is_selected?}` - `:512-519`
- `ProductSku {id, product_id, price: Money, regular_price: Money, sale_price: Money|null, has_special_price, stock_quantity: number|null, unlimited_quantity, is_default, related_options: number[], related_option_values: number[]}` - `:498-511` (from `products/{id}/details?with[]=skus`)
- `Money {amount: number; currency: string; formatted?: string}` - `:638-642`

### 6.3 Other core types

| Type | Shape summary | Path:line |
|---|---|---|
| `Category` | `{id: number\|string (hashed, e.g. "xzjvNQ"); id_?: number (raw numeric); name; description?; url; icon?: string\|null (CSS class); image?: string\|null (flat URL, NOT a ProductImage); products_count?; sub_categories?: Category[]; items?: null}` | `types/index.d.ts:664-683` |
| `Brand` (core) | `{id: number; name; logo; url}` | `types/index.d.ts:719-724` |
| `Brand` (brands route - richer, **`id` typed `string` here**) | `{id: string; url; name; label; description; banner?; logo; status: boolean; ar_char; en_char; channels?; metadata?{title,description,url}}` | `routes/brands/types.d.ts:6-24` |
| `BrandsGroup` | `{[char: string]: Brand[]}` - brands bucketed by first letter | `routes/brands/types.d.ts:25-27` |
| `StoreSettings` | `auth{email_allowed,mobile_allowed,is_email_required,countries?,force_login?}`, `cart{apply_coupon_enabled}`, `product{total_sold_enabled, manual_quantity?, fit_type?, related_products_enabled?, filters?, show_comments?, user_can_comment?, show_price_as_dash?, notify_options_availability?, show_special_offers?, show_more?, availability_notify?}`, `category{testimonial_enabled}`, `payments?`, `arabic_numbers_enabled`, `content_copyright?`, `use_sar_symbol?`, `is_multilingual`, `currencies_enabled`, `rating_enabled`, `rating?` (15 flags), `blog?{is_enabled, allow_likes_and_comments}`, `is_loyalty_enabled?`, `keys?{maps,gtm,sift}`, `is_salla_gateway?`, `upload_size?`, `tax?`, `certificate?`, `made_in_ksa?`, `commercial_number?`, `freelance_number?`, `buy_now?`, `installments?`, `quick_order?`, `bullet_delivery?`, `ticketing_system_enabled?`, `opening_hours?`, `features?{price_quote?, pre-order-campaigns?}` | `types/index.d.ts:77-171` |
| `StoreContacts` / `StoreSocial` / `StoreApps` / `StoreScope` | contacts `{mobile,phone,email,whatsapp,telegram}`; social `{instagram,snapchat,twitter,youtube,facebook,pinterest,maroof,whatsapp,tiktok}`; apps `{appstore,googleplay}`; scope `{id?,name,selected?,type?,is_open?,display_as: popup\|inline\|default, languages?, currencies?, countries?, always_ask?, allocation?}` | `:59-76`, `:55-58`, `:183-198` |
| `StoreContext` (settings endpoint) | `{store?, theme?, languages?: Language[], currencies?: Record<string,{code,name,symbol,amount,country_code}>, external_services?, headers?, login?{url,turnstile_site_key}, affiliate?{utm_url,cta_enabled}, debug?, trace_console?, policy_url?}` | `<ENG>/dist/api/store.d.ts:8-33` |
| `BootData` (full settings payload) | `{store, theme, debug, trace_console, external_services, currencies, languages, headers, login: LoginConfig, jitsu: JitsuConfig, affiliate, swoole, policy_url}` | `types/index.d.ts:331-345` |
| `Theme` | `{id?, name, profile?{id,name}, mode: live\|preview\|string, is_rtl, color: ThemeColor, settings: ThemeSettings, assets?, bundle_assets?, customization?{css,js}, side_menu_enabled?, twilight?{version}, font?: ThemeFont, components?: unknown[], isDark?, translations_hash?}` | `types/index.d.ts:199-227` |
| `ThemeColor` | `{primary, text, is_dark: boolean, reverse_primary, reverse_text}` | `:228-234` |
| `ThemeFont` | `{id?, name, path?, url?, type?: string\|number, family_name?}` | `:235-242` |
| `ThemeSettings` | 34 optional keys incl. `header_is_sticky`, `topnav_is_dark`, `footer_is_dark`, `header_layout: lite\|default`, `footer_layout: columns\|centered`, `product_card_img_ratio`, `sticky_add_to_cart`, `slider_background_size`, `squar_photo_bg_image_size`, `is_breadcrumbs_enabled`, `enable_add_product_toast`, `enable_more_menu`, `imageZoom`, `show_tags`, `homepage_type`, `theme_version`, `important_links`, `store_font_type`, `footer_menu_type`, `header_menu_type`, `default_font_name`, `is_more_button_enabled`, `vertical_fixed_products`, `is_custom_widgets_enabled`, `is_show_more_detail_enabled`, `is_custom_js`, `customization_js_ver`, `store_color`, `font` | `:243-276` |
| `MenuItem` | `{id: number\|string; title: string; url: string; children?: MenuItem[]; has_children?: boolean}` - **no `Menu` wrapper type exists**; `menu.header()`/`menu.footer()` return `MenuItem[]` | `types/index.d.ts:756-762`; `api/menu.d.ts:3-4` |
| `User` | `{type: 'guest'\|'user'; id?; first_name?; last_name?; email?; mobile?; avatar?; country_code?; gender?; birthday?: string\|null; created_at?: number; preferences?: UserPreferences{currency_code,language_code,name_visible,notifications_enabled}; social_accounts?: UserSocialAccount[]{provider_id,provider,linked}}` | `types/index.d.ts:346-371` |
| `Order` | `{id, reference_id, references{checkout}, type, features{shippable,digitalable,multiple_shipments_supported,show_weight,is_read}, actions{cancellable,reorderable,payable,rateable}, customer: OrderCustomer, receiver?, amounts: Moneys, exchange_rate, currency, urls: OrderUrls, status: OrderStatus, weight, tags: string[], payment: OrderPayment, source: OrderSource, created_at: OrderDate, items: OrderItem[], shipping?, shipments?, ratings?, refund_message?, email_sent?, instructions?}` | `routes/account/types.d.ts:274-300` |
| `OrderListItem` | lighter list row; `items?` present only with `with_items` | `routes/account/types.d.ts:239-254` |
| `OrderItem` | `{id, type?, name, sku?, image?, thumbnail?, product_thumbnail?, quantity, amounts: OrderItemAmounts, exchange_rate?, references?{mpn,gtin,hscode}, product?{id,url,type}, note?, notes?, options?: OrderItemOption[], attachments?, rating?: OrderItemRating, availability_date?, booking_location?, product_reservations?}` | `routes/account/types.d.ts:117-146` |
| `Moneys` (order totals) | `{sub_total, shipping_cost?, cash_on_delivery?, tax?{percent,amount}, discounts?: OrderDiscount[], total}` | `:77-84` |
| `OrderShipment` / `OrderShipmentItem` / `ShipmentPackage` / `ShippingAddress` | multi-shipment tracking shapes | `:158-200` |
| `Cart` | `{id: string; count; items: CartItem[]; sub_total; total; discount; coupon?; tax_amount; is_require_shipping?; has_shipping; real_shipping_cost; free_shipping_bar?; options: CartOption[]; options_total?; total_discount?; should_refresh? (React-only flag); gift?{enabled,text,type}; loyalty?{prize{points,title}}}` | `types/index.d.ts:534-573` |
| `CartItem` | `{id: string; product_id; product_name; product_image; url; quantity; max_quantity?; type; price; product_price; original_price?; total; total_special_price?; weight_label?; notes?; is_available; is_hidden_quantity; is_on_sale?; has_discount?; can_add_note; can_upload_file; offer?; detailed_offers?; donation?; attachments?; options?; has_pre_order_campaign?}` | `:574-604` |
| `Page` | `{title, slug, description?, id?, url?, parent?{id,name,url}\|null, breadcrumbs?: Breadcrumb[]}` | `:647-663` |
| `StaticPage extends Page` | `+ {id?: number, content?: string, url?, metadata?{title,description}, created_at?{published_time,modified_time}}`; raw API shape `ApiPageResponse` | `routes/page/types.d.ts:2-31` |
| `Breadcrumb` | `{name: string; url: string}` | `:643-646` |
| `Language` | `{name, code, iso_code?, url (flag SVG, **not** the store URL), is_rtl, country_code}` | `:9-18` |
| `HomeComponentData` | `{path, key?, view_style?, component?, [k]: ...}` | `:702-708` |
| `HomeComponentConfig` (data flavour; distinct from the render-shell one) | `{key, title?, path, position, data: JsonObject}` | `:691-697` |
| Blog | `ArticleSummary {id: string, name, description?, image?, url, promotion_title?, author: BlogAuthor{name,url}, created_at?: DateInput, stats?{likes,comments}, tags?: BlogTag[], meta?: ArticleMeta{title,description,canonical,og_image}}`; `ArticleDetail extends ArticleSummary {categories?: BlogCategory[]; related?: ArticleSummary[]}`; `Article = ArticleSummary \| ArticleDetail`; `BlogCategory {id: string, name, url, meta?: CategoryMeta, is_current?}`; `BlogTag {id: number, name, url}`; `BlogOverview {categories, slides, articles, popular}` | `routes/blog/types.d.ts:4-58` |
| Loyalty | `Loyalty {loyalty_program_id, id, name, description?, image?, customer: LoyaltyCustomer\|null, points: LoyaltyPoint[], prizes: LoyaltyPrize[], promotion_title?, promotion_description?, prize_promotion_*, points_validity_by?, points_validity_value?, status?}`; `LoyaltyPoint` carries `steps[]`, `branches[]`, `conditions: LoyaltyCondition[]`; `LoyaltyPrize {type: coupon_discount\|free_product\|free_shipping\|string, title, items: LoyaltyPrizeItem[]}`; plus `PointBalanceItem/Cursor/Response` | `routes/loyalty/types.d.ts:3-95` |
| `Notification` | `{id, title, color, icon, url, body, is_read, time_ago, created_at: number}` | `routes/account/notifications/types.d.ts:2-12` |
| `Pagination` (cursor) | `{next?: string\|null; previous?: string\|null; current: number}`; `PaginatedResult<T> {items: T[]; next: string\|null}` | `<ENG>/dist/api/types.d.ts:21-25,50-53` |
| `RoutePagination` | `{current?, next?, previous?}` | `routes/types.d.ts:5-9` |
| `Slider`, `Feature`, `Testimonial`, `HomeComponent`, `LayoutProps`, `TranslationMap`, `JsonObject`, `ComponentDefinition` | small helper shapes | `types/index.d.ts:684-690, 725-752, 709-717, 6-8` |

**No `Reservation` type exists anywhere in the engine typings.** The booking surface is the
`salla-booking-field` / `salla-datetime-picker` web components plus `ProductType = 'booking'`
(`types/index.d.ts:372`) and `OrderItem.product_reservations` (`routes/account/types.d.ts:145`).

---

## 7. Head / SEO surface

### 7.1 `HeadDescriptor` - the whole vocabulary

`<ENG>/dist/utils/head.d.ts:45-93`: `title`, `description`, `keywords` (string or array),
`canonical`, `robots`,
`openGraph{type,siteName,title,description,url,locale,alternateLocale[],images,publishedTime,modifiedTime}`,
`twitter{card,title,description,images,site,creator,url}`,
`alternateLanguages: {hreflang,href}[]`, `jsonLd` (object or array), `importMap`,
`meta[]` (name / property / httpEquiv + content), `links: LinkDescriptor[]`
(with `as`, `hreflang`, `media`, `sizes`, `crossOrigin`, `integrity`, **`fetchPriority`** at `:20`),
`styles: StyleDescriptor[]` (`{id?, media?, children}`), `scripts: ScriptDescriptor[]`
(`{id?, type?, src?, async?, defer?, nonce?, crossOrigin?, children?}`).
Helpers: `mergeHead(base, extension)` (`:94`), `setHeadAdapter(adapter)` (`:97`),
`resolveHead(descriptor)` (`:98`), `HeadResult = Record<string, unknown>` (`:95`).

### 7.2 `withHead`

`withHead<T>(route: {head(ctx: TwilightContext, data: T): HeadDescriptor}, extend?: (result, ctx, data) => HeadDescriptor)`
-> `(_ctx: Record<string, unknown>) => Record<string, unknown>` - `<ENG>/dist/tanstack/head.d.ts:21-23`,
runtime at `<ENG>/dist/chunk-4D44TJ72.js:108+` (reads `ctx.loaderData` at `:110`).
Every route in this theme uses it bare, e.g. `app/routes/index.tsx:14`, `app/routes/$slug.p$id.tsx:15`.
The documented extend pattern is at `tanstack/head.d.ts:14-18` and `tanstack/index.d.ts:9-10`:
`head: withHead(Product, (result, ctx) => ({...result, title: result.title + ' | ' + ctx.settings?.store?.name}))`.

`tanstackHeadAdapter` (exported as `head` from `/tanstack`, `tanstack/index.d.ts:19`) converts the
descriptor to TanStack's `{meta, links, styles, scripts}` - `chunk-4D44TJ72.js:42-107`:

| Descriptor field | Emitted tag | Line |
|---|---|---|
| `title` | `{title}` meta entry | 47 |
| `description` / `keywords` / `robots` | `<meta name=...>` | 48-53 |
| `openGraph.*` | `og:site_name, og:type, og:title, og:description, og:url, og:locale, og:locale:alternate (repeated), og:image(+:width,:height,:alt), article:published_time, article:modified_time` | 54-75 |
| `twitter.*` | `twitter:card, :title, :description, :site, :creator, :url, :image (repeated)` | 76-88 |
| `canonical` | `<link rel="canonical">` | 89 |
| `alternateLanguages` | `<link rel="alternate" hrefLang=... href=...>` | 90-92 |
| `jsonLd` | `<script type="application/ld+json">` (single tag, `JSON.stringify` of the whole value) | 93-95 |
| `meta[]` / `links[]` / `styles[]` | passed through verbatim | 96-101 |
| `importMap` | `<script type="importmap">` | 102-104 |
| `scripts[]` | passed through | 105 |

### 7.3 What JSON-LD the engine already emits

| Schema | Where | Path:line |
|---|---|---|
| `Product` with nested `Offer`, `Organization` (seller), `Brand`, `AggregateRating`, `Review`/`Rating`, `gtin8`, `mpn` | product route `head()` | `<ENG>/dist/routes/product.js:146-199`; `priceValidUntil` auto-set to +1 month (`:140-141,159`); description HTML-stripped and truncated to 160 chars (`:139`); images = `images[].url` with `image.url` unshifted (`:142-145`) |
| `BreadcrumbList` + `ListItem` | `Breadcrumb` / `BreadcrumbJsonLd` component | `<ENG>/dist/Breadcrumb-W64WMO56.js:121-138`; also emits microdata `itemType: https://schema.org/ListItem` (`:89`) |

**Nothing else.** A grep of `dist/**/*.js` for `"@type"` returns only those two files - so there is
**no `Organization`, `WebSite`, `LocalBusiness`, `ItemList`, `Article`, `BlogPosting`, `FAQPage`,
`Offer`-list or `SearchAction` JSON-LD**. Blog and listing pages get OG/Twitter meta only.
Types allow `jsonLd` to be an array (`utils/head.d.ts:76`), so a theme can add more via the
`withHead(route, extend)` second argument.

### 7.4 hreflang and canonical behaviour

`buildHreflangAlternates(settings, path)` - `<ENG>/dist/chunk-TZ3E5BN4.js:38-53`:
- returns `undefined` when `settings.languages` is empty (`:40-42`)
- `extractPath` strips a **leading 2-character** path segment, assuming it is the locale (`:13-29`)
- emits `x-default` first, pointing at the `ar` language (`FALLBACK_LOCALE`) or `languages[0]` (`:45,:50`)
- then one entry per language (`:51`)
- every href is `origin + '/' + langCode + path` (`:46-48`) - **so even the default locale gets a
  `/ar/` prefix in hreflang, while the canonical does not**: `buildBaseHead` canonical is
  `origin + path` (`:61`) but `og:url` is `origin + '/' + locale + path` (`:62`). Canonical vs
  og:url vs hreflang disagree on the locale prefix - worth a deliberate decision in the theme.
- `localeToOgLocale`: `ar -> ar_AR`, `en -> en_US`, else `xx_XX` (`:4-12`)
- `buildBaseHead` also derives `twitter:site` from `store.social.twitter`, prefixing `@` (`:63`)

Per-route canonicals: home = `store.url` (`chunk-L42W6YS3.js:63`), product = `product.url`
(`routes/product.js:203`), listing = `category.url ?? tag.url` (`routes/product-listing.js:495-501`),
static page = `data.page.url` (`routes/page.js:47`), blog single =
`article.meta?.canonical ?? article.url` (`routes/blog.js:183`), blog category (`:220`),
blog tag = `blogTag.url` (`:237`).
Those routes all also call `buildHreflangAlternates` (`routes/product.js:218`,
`routes/product-listing.js:515`, `chunk-L42W6YS3.js:77`).
`chunk-HOSHJBPS.js:39-41` is the Next.js head adapter, which folds `alternateLanguages` into a
`{[hreflang]: href}` map instead.

---

## 8. Locale routing - `/{-$locale}/`

### 8.1 Where the locale route lives (it is NOT in the theme)

The locale segment is a **real TanStack optional path param route**, in an engine-owned file route
that sits *outside* `app/routes/`:

`<ENG>/.twilight/$locale.tsx` (whole file, 28 lines) - header `// @auto-generated` + `// @ts-nocheck`.
It is written by the vite plugin from the template `getLocaleWrapperTemplate()` at
`<ENG>/dist/vite/index.js:1409-1446`; doc comment `<ENG>/dist/tanstack/templates/locale-wrapper.d.ts:1-13`
("Uses TanStack Router's optional path parameter syntax /{-$locale}: /{-$locale}/cart matches both
/cart and /ar/cart ... loader and head are in __root.tsx").

Sibling auto-generated engine routes in the same folder: `.twilight/account.tsx`,
`.twilight/redirect.$type.$id.tsx` (template `getRedirectTemplate` at `<ENG>/dist/vite/index.js:1449+`).

The generated route tree imports it by its absolute pnpm path and makes it the **parent of every
theme route**:
- import: `app/routeTree.gen.ts:12`
- `.update({ id: '/{-$locale}', path: '/{-$locale}', getParentRoute: () => rootRouteImport })` -
  `app/routeTree.gen.ts:48-56`
- e.g. `indexRoute` `getParentRoute: () => ...LocaleRoute` - `app/routeTree.gen.ts:57-63`;
  the account subtree the same at `:64-72`
- the flattened path table shows every route prefixed: `'/{-$locale}'`, `'/{-$locale}/'`,
  `'/{-$locale}/account'`, ... - `app/routeTree.gen.ts:261-277+`

So a theme route file `app/routes/cart.tsx` declaring `/cart` really serves `/cart` **and** `/ar/cart`.

### 8.2 The `$locale` route's own logic (verbatim, `<ENG>/.twilight/$locale.tsx`)

| Phase | Line | Behaviour |
|---|---|---|
| `beforeLoad` | `:9-15` | `if (!locale) return;` - no prefix, pass through. If `!isLocale(locale)` -> `throw redirect({ to: '/'+FALLBACK_LOCALE+location.pathname, replace: true })`. **It prepends to the *full* pathname including the bad segment**: `/xx/cart` -> `/ar/xx/cart`. |
| `loader` | `:16-19` | `ensureQueryData(store.queries.settings())`; `isMultilingual = settings?.store?.settings?.is_multilingual ?? true` |
| " | `:21-26` | `!isMultilingual && params.locale` -> strip the prefix: `redirect({ to: location.pathname.slice(('/'+locale).length) \|\| '/', replace: true })` |
| " | `:27-29` | `isMultilingual && !params.locale` -> **add** the prefix: `redirect({ to: '/'+FALLBACK_LOCALE+location.pathname, replace: true })` |
| `component` | `:30` | `() => <Outlet />` - no DOM, no provider, no head |

**Consequence for a multilingual store: the default locale is prefixed too.** `/` -> `/ar/`,
`/cart` -> `/ar/cart`, and `/en/cart` stays. It is a **redirect** (TanStack `redirect`,
`replace: true`), *not* a rewrite - the browser URL changes. A single-language store is the
mirror image: any `/ar/...` is redirected back down to `/...`.

The only true **rewrite** in the router is the *store-base* one (multi-store path prefix, e.g.
`/mystore/...`), never the locale: `createRouter` passes
`...storeBase ? { rewrite: storeBaseRewrite(storeBase) } : {}` - `<ENG>/dist/chunk-QVPMWMPP.js:578`;
`storeBaseRewrite` `:362-373`, with `stripStoreBase`/`prefixStoreBase` at
`<ENG>/dist/chunk-XTMHHLNK.js:140-149`. `withoutStoreUrlBase` (`:151-161`) is locale-aware -
it skips segment 1 when `isLocale(segments[1])`.

### 8.3 `createTwilightRootRoute()` - what it hard-wires

`<ENG>/dist/chunk-QVPMWMPP.js:459-467`, typed `<ENG>/dist/tanstack/router.d.ts:41`,
re-exported `<ENG>/dist/tanstack.js:2` and `<ENG>/dist/tanstack/index.d.ts:22`:
`createRootRouteWithContext()` called with `{ beforeLoad: rootBeforeLoad, head: rootHead,
errorComponent: RootErrorComponent, ...options }`.

Because `...options` is spread **last**, a theme *can* override `beforeLoad`/`head`/`errorComponent`
- and would then lose the settings prefetch entirely. This theme overrides nothing; it passes only
`shellComponent` (`app/routes/__root.tsx:22-24`).

`rootBeforeLoad` - `<ENG>/dist/chunk-QVPMWMPP.js:36-104`:
- `const locale = ctx.params.locale || FALLBACK_LOCALE` (`:37`) - reads the param off `{-$locale}`
- `const { dir } = getLanguageInfo(locale)` (`:38`)
- `updateTwilightContext({ locale })` (`:42`), `syncSdkLocale(locale)` (`:43`), `syncScopeCookie()` (`:44`)
- parallel prefetch of `store.queries.settings()`, `translations.queries.byLocale()`,
  `apps.queries.snippets()`, `apps.queries.settings()` (`:45-67`); the last two are `.catch`-swallowed with a `console.warn`
- throws `SettingsError` if settings missing (`:68-70`)
- store-base redirect check -> `throw redirect({ href, reloadDocument: true, replace: true })` (`:71-74`)
- builds the i18next instance `createI18nInstance(locale, translationsResult)` (`:75`)
- resolves `authToken` in order `serverContext.authToken ?? serverCookieToken ?? existingToken ?? cookieToken ?? sallaToken ?? null` (`:85`)
- returns `{ settings, locale, dir, authToken, appsSnippets, appsSettings }` (`:96-103`)

`rootHead(ctx)` repeats `ctx.params.locale || FALLBACK_LOCALE` (`:185`) and feeds it to
`buildBaseHead(settings, locale)` (`:188`).

### 8.4 How the default locale is decided

**It is a hard-coded constant, not a store setting.** `<ENG>/dist/chunk-T72DAX7R.js`:

| Const | Line | Value |
|---|---|---|
| `FALLBACK_LOCALE` | `:2` | `"ar"` |
| `SUPPORTED_LOCALES` | `:3-43` | 38 codes: ar bg bn cs da de el en es et fa fi fr ga he hi hr hu hy **ind** it ja ko lv ms mt nl pl pt ro ru sl sq sv tl tr uk ur zh (note `ind`, not `id`) |
| `isLocale(value)` | `:44-46` | `SUPPORTED_LOCALES.includes(value)` |
| `FALLBACK_DIR` | `:47` | `"rtl"` |
| `FALLBACK_LANGUAGE_NAME` | `:48` | Arabic word for Arabic |
| `RTL_LOCALES` | `:49` | `["ar","fa","he","ur"]` |
| `LANGUAGE_NAMES` | `:50-53` | **only two entries**: `ar` and `en: "English"` |
| `getLanguageInfo(locale)` | `:54-61` | `{ code, name: LANGUAGE_NAMES[locale] \|\| locale.toUpperCase(), dir: RTL_LOCALES.includes(locale) ? 'rtl' : 'ltr' }` |

Public re-exports: `<ENG>/dist/i18n.js:2`, `<ENG>/dist/providers/I18nProvider.d.ts:5`,
`<ENG>/dist/providers/locale-constants.d.ts:5`, and from `@salla.sa/twilight-theme-engine/routes`
(that is the import path the generated `$locale.tsx` uses).

Context default: `DEFAULT_DATA.locale = FALLBACK_LOCALE` - `<ENG>/dist/chunk-PJWFEMBX.js:48`.
`ctx.dir` is a **derived getter**, never stored:
`get dir() { return getLanguageInfo(data.locale).dir }` - `<ENG>/dist/chunk-PJWFEMBX.js:194-195`.
That is what `app/routes/__root.tsx:30` puts on `<html lang={ctx.locale} dir={ctx.dir}>`.

> Implication: the merchant's own default language in `settings.store.settings.languages[]` is never
> consulted for routing. If a store's primary language is English, `/` still redirects to `/ar/`.
> The only per-store gate is the boolean `is_multilingual` (`<ENG>/dist/types/index.d.ts:114`).
> Any language whose name is not `ar`/`en` renders in the header as an upper-cased code ("TR", "FR").

### 8.5 Locale prefixing on every internal link

`localizeDestination(destination, locale)` - `<ENG>/dist/chunk-QUUSMVCP.js:8-13`: skips non-`/` and
protocol-relative hrefs, returns as-is when the first segment already `isLocale`, else prefixes
`/${locale}`. Applied in:
- `TanStackLinkAdapter` - `:14-51` (`const { locale } = useParams({ strict: false })` `:30`, use `:31`)
- `NavigationSetup`'s `navigate` callback - `:67-75` (`:71`)
- but **not** in `TanStackNavigationProvider` (`:76-85`), which navigates raw.

Engine seo-redirect loaders prefix by hand: `<ENG>/dist/chunk-KV5R4LKM.js:5-8`
(`/${locale}/brands/${id}`) and `:9-12` (`/${locale}/orders?status=pending`).

Route-id and body-class lookup tables are keyed on the prefixed ids -
`TANSTACK_ROUTE_ID_MAP` `<ENG>/dist/chunk-QVPMWMPP.js:374-405` (30 entries; `resolveRouteId` `:406-408`),
`ROUTE_CLASS_MAP` `:650-683` (31 entries). **A theme route that is not a child of `{-$locale}` gets
no semantic `RouteId` and no `<body>` route class** - `resolveRouteId` falls through to the raw
TanStack id (`:407`).

### 8.6 How a language switch actually happens

There is **no engine `<LanguageSwitcher>` component and no `setLocale()` hook.** It is the web
component plus the SDK:

1. Engine `Header` renders a plain `<button>` whose `onClick` is
   `window.salla?.event.dispatch("localization::open")` - `<ENG>/dist/chunk-65Z2ZDKZ.js:34-47`
   (dispatch at `:38`). Label = `languageName` from `useTranslation()` (`:22`, `:41`), a `|`
   separator (`:42`), an `iti__flag` for `store.country` (`:43`), and the currency symbol or
   `<i class="sicon-sar">` when `use_sar_symbol && currency.code === 'SAR'` (`:44`).
   The whole block is gated on
   `store?.settings?.is_multilingual || store?.settings?.currencies_enabled` (`:33`).
2. `<SallaLocalizationModal language={locale} currency={currency?.code || "SAR"} suppressHydrationWarning />`
   - `<ENG>/dist/chunk-65Z2ZDKZ.js:48-55`; import from
   `@salla.sa/twilight-components-react/localization-modal` (`:10`).
3. The web component listens for `localization::open`
   (`<TC>/dist/collection/components/salla-localization-modal/salla-localization-modal.js:99`,
   removed `:120`) and for `currency::open` / `language::open`, both gated on "not a native app"
   (`:126-133`, helper `openUnlessNative` `:143-146`). If the `language` prop is empty it falls back
   to `Salla.config.get('user.language_code')` (`:133-134`).
   It renders nothing when `languages.length < 2 && currencies.length < 2` (`:160`).
   Options come from `Salla.config.languages()` (`:210`); the radio value binds `lang.iso_code`
   (`:264`) - hence the type comment "the SDK's salla-localization-modal reads `iso_code`, not
   `code`" at `<ENG>/dist/types/index.d.ts:12`.
4. `submit()` - `<TC>/dist/collection/components/salla-localization-modal/salla-localization-modal.js:224-253`:
   - currency changed -> `Salla.currency.api.change(this.currency)`, `url = window.location.href` (`:232-236`)
   - language changed -> `url = Salla.helpers.addParamToUrl('lang', this.language)` (`:239-241`)
   - always writes cookies `s-lang` and `s-curr` (`:243-246`)
   - then a **full page load**:
     `window.location.href = url.replace('/'+Salla.config.get('user.language_code')+'/', '/'+this.language+'/')` (`:250-252`)

So a language switch is a **hard navigation** to the same path with the locale segment string-replaced
(plus a `?lang=` query param and an `s-lang` cookie) - never a client-side TanStack navigation, and
the React tree is thrown away. If neither language nor currency changed, `url` stays `undefined` and
nothing navigates. The string replace looks for `/<old>/` with **both** slashes, so it silently
fails on a URL with no trailing path (e.g. `https://x.com/ar` -> unchanged, only `?lang=` differs).

`syncSdkLocale(locale)` - `<ENG>/dist/chunk-3FIWHGCZ.js:88-97` - is the other direction: on every
`rootBeforeLoad` it pushes the route locale into `sdk.lang.setLocale()`,
`sdk.api.setHeader('accept-language', locale)` and `sdk.config.set('user.language_code', locale)`.
Also called twice from `useTwilightInit` (`<ENG>/dist/chunk-DTWFNS3F.js:171`, `:189`).

### 8.7 URL behaviour summary

| Store | Requested | Result |
|---|---|---|
| `is_multilingual: true` | `/` | redirect (replace) -> `/ar/` (`$locale.tsx:27-29`) |
| `is_multilingual: true` | `/cart` | redirect -> `/ar/cart` |
| `is_multilingual: true` | `/en/cart` | matches directly; `ctx.locale='en'`, `ctx.dir='ltr'` |
| `is_multilingual: true` | `/zz/cart` | redirect -> `/ar/zz/cart` -> 404 (`$locale.tsx:12-14`) |
| `is_multilingual: false` | `/ar/cart` | redirect -> `/cart` (`$locale.tsx:21-26`) |
| any | `/en` | **never rewritten** - it is a matched optional path param |

Mismatch to carry into the SEO work (see also §7.4): the canonical carries **no** locale prefix
(`<ENG>/dist/chunk-TZ3E5BN4.js:61`), while `og:url` (`:62`) and every hreflang href (`:46-48`) **do**
- and a multilingual store's live URL always has one. The canonical therefore points at a URL that
immediately redirects.

---

## 9. `@salla.sa/twilight-components-react` - every exported component

### 9.0 Where the types live, and the two kinds of component

- **Wrapper (Stencil) components** - 126 of them, generated by `@stencil/react-output-target`.
  - React wrapper: `<CR>/dist/components/salla-*.js`, types `<CR>/dist/types/components/salla-*.d.ts`
  - barrel: `<CR>/dist/components/components.js` (126 `export {}` lines, `<CR>/dist/index.js:1`)
  - **Prop typings are NOT in `<CR>`**. Each wrapper's props are
    `Partial<Omit<Components.SallaXxx, never>>` where `Components` comes from
    `@salla.sa/twilight-components/dist/components` - i.e. the real prop list lives in
    **`<TC>/dist/types/components.d.ts`**, `namespace Components`, lines ~100-3600.
    Example: `<CR>/dist/types/components/salla-booking-field.d.ts:13-18`.
  - The element class in `<CR>/dist/components/*.js` is a **runtime stub**
    (`// @ts-ignore - runtime stubs; web component loaded by CDN`,
    e.g. `<CR>/dist/components/salla-booking-field.js:5-10`) - the real custom element comes from
    the Twilight SDK module loaded from the CDN (see §8.3 `salla-sdk` script).
  - Every wrapper is wrapped in `withDeferredHydration(Core, 'Name')`
    (e.g. `<CR>/dist/components/salla-booking-field.js:21`).
- **Native React components** - 5, real React/Swiper implementations with their own props, no custom
  element at all: `<CR>/dist/index.js:2-6` ->
  `SallaButton` (`native/salla-button`), `SallaProductsList` (`native/salla-products-list`),
  `SallaProductsSlider` (`native/salla-products-slider`), `SallaSlider` (`native/salla-slider`),
  `ItemsList` (`native/items-list`).
  **`SallaSlider` and `SallaButton` resolve to the NATIVE ones** - `index.js` re-exports them
  explicitly after `export * from "./components/components"` (`<CR>/dist/index.js:1` vs `:2`,`:5`),
  and an explicit named export shadows a star re-export.
- Also exported from the root: `<CR>/dist/index.js:7` (`./native/hooks`),
  `:8` hydration helpers, `:9` 27 skeletons.
- Subpath imports are `@salla.sa/twilight-components-react/<tag-without-salla->`
  (`<CR>/package.json` `exports["./*"] -> ./dist/components/salla-*.js`), plus the explicit
  `./button`, `./native/products-list`, `./skeletons` entries (`<CR>/package.json:26-42`).

### 9.1 Complete list of the 126 Stencil wrappers (names only)

Source of truth: `<CR>/dist/components/components.js:6-131`. React name -> tag is mechanical
(`SallaAddProductButton` -> `salla-add-product-button`; each wrapper's `tagName:` literal confirms it).

SallaAccordion, SallaAccordionBody, SallaAccordionHead, SallaAddProductButton, SallaAdvertisement,
SallaAlert, SallaAppInstallAlert, SallaAppsIcons, SallaBadge, SallaBookingField, SallaBottomAlert,
SallaBoughtTogether, SallaBreadcrumb, SallaBulletDelivery, SallaCartCoupons, SallaCartItemOffers,
SallaCartSummary, SallaCartSummaryCard, SallaCashbackBanner, SallaColorPicker, SallaCommentFactors,
SallaCommentForm, SallaCommentItem, SallaComments, SallaConditionalFields, SallaConditionalOffer,
SallaContacts, SallaCookiesBar, SallaCountDown, SallaCustomFields, SallaDatetimePicker,
SallaDeliveryPromise, SallaDrawer, SallaEditOrderButton, SallaFileUpload, SallaFilters,
SallaFiltersWidget, SallaFulfillmentMethods, SallaGifting, SallaHook, SallaInfiniteScroll,
SallaInstallment, SallaListTile, SallaLoading, SallaLocalizationModal, SallaLoginModal,
SallaLoyalty, SallaLoyaltyBanner, SallaLoyaltyHero, SallaLoyaltyPanel, SallaLoyaltyPoint,
SallaLoyaltyPointsBanner, SallaLoyaltyPointsHistory, SallaLoyaltyPrizeItem, SallaLoyaltyProgram,
SallaLoyaltyReward, SallaMaintenanceAlert, SallaMap, SallaMenu, SallaMetadata, SallaModal,
SallaMultipleBundleProduct, SallaMultipleBundleProductCart, SallaMultipleBundleProductDetails,
SallaMultipleBundleProductOptionsModal, SallaMultipleBundleProductSlider, SallaNextOrderCoupon,
SallaNotificationItem, SallaNotifications, SallaOffer, SallaOfferModal, SallaOrderBranch,
SallaOrderCancel, SallaOrderDetails, SallaOrderDetailsMultipleBundleProduct,
SallaOrderDetailsOptions, SallaOrderEdit, SallaOrderEditItem, SallaOrderEditProductCard,
SallaOrderOptionsModal, SallaOrderSummary, SallaOrderTotalsCard, SallaOrders, SallaPayments,
SallaPlaceholder, SallaPriceRange, SallaProductAvailability, SallaProductCard,
SallaProductCardEmbed, SallaProductOptions, SallaProductSizeGuide, SallaProgressBar,
SallaQuantityInput, SallaQuickBuy, SallaQuickOrder, SallaRatingModal, SallaRatingModalV2,
SallaRatingStars, SallaReviewCard, SallaReviewFactorsTags, SallaReviews, SallaReviewsPage,
SallaReviewsSummary, SallaRewardAction, SallaRewardCard, SallaRewardDetails, SallaRewardExchange,
SallaScopes, SallaSearch, SallaSearchableDropdown, SallaSkeleton, SallaSlider*, SallaSocial,
SallaSocialShare, SallaTabContent, SallaTabHeader, SallaTabs, SallaTelInput, SallaTieredOffer,
SallaTooltip, SallaTrustBadges, SallaUserMenu, SallaUserProfile, SallaUserSettings, SallaVerify,
SallaWallet, SallaWishlistActions.

(*) `SallaSlider` is shadowed at the root barrel by the native one; import
`@salla.sa/twilight-components-react/slider` to get the web-component wrapper.

Plus 5 native: **SallaButton, SallaProductsList, SallaProductsSlider, SallaSlider, ItemsList**
(`<CR>/dist/index.js:2-6`).

**Not present anywhere in the package or the engine: `salla-scroll-to-top`.** (grep of
`<TC>/dist/types/components.d.ts`, `<ENG>/dist/**` and `app/**` returns nothing.) A scroll-to-top
control has to be hand-written in the theme.

### 9.2 Full prop typings for the requested components

Legend: **props** are from `<TC>/dist/types/components.d.ts` `namespace Components` (line cited per
component); **events** are from the wrapper's `createComponent({ events: {...} })` map in
`<CR>/dist/components/<tag>.js`; **.d.ts** is `<CR>/dist/types/components/<tag>.d.ts`.
Methods (`() => Promise<...>`) are imperative ref methods, not props.

#### salla-booking-field - `SallaBookingField`
`<TC>/.../components.d.ts:299-308`; `.d.ts` `<CR>/dist/types/components/salla-booking-field.d.ts`
- `option: Option` (from `<TC>/dist/types/components/salla-booking-field/interfaces`, imported at `components.d.ts:10`)
- `productId: number`
- events: `onInvalidInput` -> `invalidInput` (`SallaBookingFieldInvalidInputEvent`) - `<CR>/dist/components/salla-booking-field.js:17`

#### salla-datetime-picker - `SallaDatetimePicker`
`<TC>/.../components.d.ts:795-1038` (the largest prop surface; it is a flatpickr wrapper).
`.d.ts` `<CR>/dist/types/components/salla-datetime-picker.d.ts`
- `allowInput, allowInvalidPreload, altInput, autoFillDefaultTime, clickOpens, closeOnSelect,
  disableMobile, disabled, enableSeconds, enableTime, inline, noCalendar, required,
  shorthandCurrentMonth, static, time_24hr, weekNumbers, wrap: boolean`
- `altFormat, altInputClass, ariaDateFormat, dateFormat, name, nextArrow, placeholder, prevArrow,
  value, conjunction?: string`
- `defaultHour, defaultMinute, defaultSeconds, hourIncrement, minuteIncrement, showMonths: number`
- `defaultDate: DateOption | DateOption[]`, `minDate/maxDate/minTime/maxTime: DateOption`,
  `disable/enable: DateLimit<DateOption>[]`, `locale: LocaleKey`
- `mode: "single" | "multiple" | "range" | "time"`, `monthSelectorType: "dropdown" | "static"`
- `position:` 12 string literals (`"auto"|"above"|"below"|"auto left"|...`) **or** a callback
- `appendTo / positionElement: HTMLElement`; `dateParser`, `formatDate` callbacks
- events: `onPicked` -> `picked` (`SallaDatetimePickerPickedEvent`),
  `onInvalidInput` -> `invalidInput` - `<CR>/dist/components/salla-datetime-picker.js:64-67`

#### salla-products-slider (web component) vs `SallaProductsSlider` (native React)
Two different things with the same name.
1. **Web component** `salla-products-slider`, props `<TC>/.../components.d.ts:2529-2599`:
   `autoplay: boolean`, `blockTitle: string`, `subTitle: string`, `displayAllUrl: string`,
   `includes: string[]`, `limit: number`, `productCardComponent: string`, `sliderConfig: any`,
   `sliderId: string`, `sliderProps: Partial<SallaSliderProps>`, `tag: 'div' | 'section'`,
   `sourceValue: string`, and
   `source: 'categories'|'latest'|'related'|'brands'|'json'|'tags'|'selected'|'offers'|'landing-page'|'wishlist'|'top-rated'|'recently'`.
   There is **no React wrapper for it in `<CR>/dist/components/`** - it is not in the 126.
2. **Native React** `SallaProductsSlider<T>` - `<CR>/dist/types/native/salla-products-slider/types.d.ts:5-17`,
   exported `<CR>/dist/index.js:4`, plus a lazy variant `SallaProductsSliderLazy`
   (`<CR>/dist/types/native/salla-products-slider/index.d.ts:2`):
   `loader: SliderLoaderFn<T>` (**required**), `children: (product: T, index: number) => ReactNode`
   (**required, render-prop**), `blockTitle?`, `subTitle?`, `displayAllUrl?: string`,
   `autoplay?: boolean`, `sliderConfig?: Record<string, unknown>`,
   `sliderProps?: Partial<SallaSliderProps>`, `skeleton?: ReactNode`, `className?`, `id?`,
   `tag?: "div" | "section"`. This is what this theme should use for custom sliders.

#### salla-product-card - `SallaProductCard`  (`<TC>/.../components.d.ts:2271-2308`)
`product: string | object` (JSON string or object), and 8 booleans:
`compact`, `fullImage`, `hideAddBtn`, `horizontal`, `isSpecial`, `minimal`, `shadowOnHover`,
`showQuantity`. No events. Related: `salla-product-card-embed` (`:2309-2322`) -
`productId: string|number`, `source?: string`, `align?: 'left'|'right'|'center'`.

#### salla-bought-together - `SallaBoughtTogether`  (`:332-343`)
`limit: number` (default 3, **max 4**, per the JSDoc at `:334-337`). No events.

#### salla-trust-badges - `SallaTrustBadges`  (`:3465-3471`)
`dark: boolean`. No events. (Also declared in the engine's ambient JSX at
`<ENG>/dist/ambient/salla-components.d.ts:45-47`.)

#### salla-delivery-promise - `SallaDeliveryPromise`  (`:1035-1040`)
**Zero props, zero events.** JSDoc: "Displays delivery promise message (from BE) with city
selection". Everything comes from the SDK.

#### salla-filters - `SallaFilters`  (`:1371-1388`)
- prop: `filters?: Filter[]` (`Filter` from `<TC>/dist/types/components/salla-filters/interfaces`, `components.d.ts:23`)
- methods: `applyFilters()`, `getFilters()`, `resetFilters()`
- event: `onChanged` -> `changed` (`SallaFiltersChangedEvent`) - `<CR>/dist/components/salla-filters.js`
- sibling `salla-filters-widget` (`:1389-1426`): `filtersData: object`, `option: Filter`,
  `withLoadMore: boolean`, methods `reset/showMore/toggleWidget/setWidgetHeight`, event `onChanged`.
- `salla-price-range` (`:2229-2250`): `filtersData: any`, `minPrice/maxPrice: any`, `option: Filter`,
  method `reset()`, event `onChanged` -> `changed`.

#### salla-reviews - `SallaReviews`  (`:2891-2931`)
`limit: number`, `type: ReviewType`, `sort: SortingOption`, `source?: Source`,
`sourceValue?: string | object | Array<number>`, `displayAllLink: boolean`,
`hideCustomerInfo: boolean`. No events. Siblings: `salla-reviews-summary` (`:2934-2939`,
`itemId: number`), `salla-reviews-page` (`:2932-2933`, no props), `salla-review-card` (`:2867-2872`,
`review: Partial<Review>`), `salla-review-factors-tags` (`:2873-2890`).

#### salla-rating-stars - `SallaRatingStars`  (`:2823-2866`)
`value: number`, `reviews: number`, `name: string`, `editable: boolean`, `tag: boolean`,
`withLabel: boolean`, `labelBeforeStars: boolean`,
`size: "large" | "medium" | "small" | "mini"`. No events.

#### salla-installment - `SallaInstallment`  (`:1514-1534`)
`price: string`, `currency: string`, `country: string`, `language: string`. No events.
(Renders the Tamara/Tabby-style widget; all four are plain strings.)

#### salla-quick-buy - `SallaQuickBuy`  (`:2694-2750`)
`amount: number`, `applePayOnly: boolean`, `cartId: string`, `currency: string`,
`isRequireShipping: boolean`, `options: {}`, `productId: string`, `productType: string`,
`validateHost: string`, `type: 'plain'|'buy'|'donate'|'book'|'pay'|'order'`.
events: `onValidationFailed` -> `validationFailed`, `onRequireLogin` -> `requireLogin`
(`<CR>/dist/components/salla-quick-buy.js:25-28`).

#### salla-add-product-button - `SallaAddProductButton`  (`:155-238`)
The single most important PDP component.
- `productId: any`, `quantity: number`, `amount: number` (quick buy), `donatingAmount: number`
- `productType: 'product'|'service'|'codes'|'digital'|'food'|'donating'|'group_products'|'booking'|'financial_support'`
- `productStatus: 'sale'|'out'|'out-and-notify'|'hidden'`
- `fill: 'solid'|'outline'|'clear'|'default'`, `width: 'wide'|'normal'`, `type: string`,
  `loaderPosition: 'start'|'end'|'center'|'after'`
- `hasPreOrder: boolean`, `isSubscribed: boolean`, `notifyOptionsAvailability: boolean`,
  `channels: string`, `subscribedOptions: string` (e.g. `"[[139487,2394739],[1212,1544]]"`),
  `quickBuy: boolean`, `requiredShipping: boolean`, `supportStickyBar: boolean`
- events: `onSuccess` -> `success` (`SallaAddProductButtonSuccessEvent`),
  `onFailed` -> `failed` (`SallaAddProductButtonFailedEvent`) -
  `<CR>/dist/components/salla-add-product-button.js:33-36`

#### salla-product-options - `SallaProductOptions`  (`:2323-2404`)
- props: `productId: number|string`, `options: string` (JSON), `config: string`,
  `bundleContext?: string|object`, `productAvailable: boolean`, `hideOutLabel: string`,
  `noPadding: boolean`, `uniqueKey: string`
- methods (13): `getOption(option_id)`, `getOptionsData()`, `getSelectedOptions()`,
  `getSelectedOptionsData()`, `setOptionsData(optionsData)`, `seedSelectedOptions()`,
  `hasOutOfStockOption()`, `reportValidity()`, `validateAndScroll()`,
  `enableUserInitiatedValidation()`, `enterCartMode()`
- event: `onChanged` -> `changed` (`SallaProductOptionsChangedEvent`)

#### salla-quantity-input - `SallaQuantityInput`  (`:2643-2693`)
`value: number`, `max: number`, `name: string`, `cartItemId: string|number`, `disabled?: boolean`,
`label? / incLabel? / decLabel?: string`; methods `increase()`, `decrease()`,
`setValue(value, fireChangeEvent?)`. **No `events` map** in the wrapper - listen for the native
`change` on the inner input or use `setValue(..., true)`.

#### salla-menu - `SallaMenu`  (`:1799-1826`)
`source: Sources` (from `<TC>/dist/types/components/salla-menu/interfaces`, `components.d.ts:29`),
`sourceValue?: string`, `limit: number`, `topnav: boolean`, `useReactLink: boolean`,
`withCookiePreferences?: boolean`. No events. Engine usage:
`<SallaMenu source="footer" topnav />` - `<ENG>/dist/chunk-65Z2ZDKZ.js:32`.
Ambient JSX decl also at `<ENG>/dist/ambient/salla-components.d.ts:11-14`.

#### salla-search - `SallaSearch`  (`:2983-3014`)
`inline: boolean`, `oval: boolean`, `height: number`, `maxWords: number`, `placeholder: boolean`,
`showAction: boolean`. No events. Engine usage `<SallaSearch inline oval height={36} />` -
`<ENG>/dist/chunk-65Z2ZDKZ.js:71`. Ambient decl `<ENG>/dist/ambient/salla-components.d.ts:19-23`
(note: ambient types `height` as `string`, the real prop is `number`).

#### salla-contacts - `SallaContacts`  (`:629-662`)
`contacts?: ContactsConfig` (`{whatsapp, mobile, phone, email, telegram}`; falls back to SDK
`store.contacts`), `contactsTitle?: string` (falls back to lang key `blocks.footer.social`),
`hideTitle`, `horizontal`, `iconsOnly`, `isHeader: boolean`,
`slotTemplate?: string` (SSR template with `{icon} {value} {link}` placeholders). No events.

#### salla-map - `SallaMap`  (`:1747-1798`)
`apiKey: string`, `lat: number`, `lng: number`, `zoom: number`, `name: string`,
`modalTitle: string`, `theme: string`, `readonly`, `required`, `searchable: boolean`;
method `open()`. events: `onSelected` -> `selected`, `onMapClicked` -> `mapClicked`,
`onCurrentLocationChanged` -> `currentLocationChanged`, `onInvalidInput` -> `invalidInput`
(`<CR>/dist/components/salla-map.js:26-31`).

#### salla-social-share - `SallaSocialShare`  (`:3326-3361`)
`url: string`, `urlName: string`, `platforms: string` (comma list),
`mode: 'modal' | 'default'`, `modalTitle: string`; methods `open()`, `close()`, `refresh()`.
No events. (Distinct from `salla-social`, `:3324-3325`, which has no props.)

#### salla-loyalty - `SallaLoyalty`  (`:1642-1691`)
`customerPoints: number`, `prizePoints: string|number`, `prizeTitle: string`,
`allowEmail`, `allowMobile`, `requireEmail: boolean`, `guestMessage: string`;
methods `open()`, `close()`, `exchangeLoyaltyPoint()`, `resetExchange()`. No events.
Family: `salla-loyalty-banner` (no props), `salla-loyalty-hero` (`:1694`, `name/description/image`),
`salla-loyalty-panel` (`:1708`, `customerPoints/prizePoints/prizeTitle`),
`salla-loyalty-point` (`:1722`, `point: Point`), `salla-loyalty-points-banner`,
`salla-loyalty-points-history`, `salla-loyalty-prize-item` (`:1729`, `item: Item`,
event `onPrizeItemSelected`), `salla-loyalty-program`, `salla-loyalty-reward` (`:1737`,
`group: string`, `prize: Prize`, `size: 'xs'|'md'`, events `onRewardModalOpen`/`onConfirmModalOpen`).

#### salla-slider - web component vs native
1. Web component `salla-slider` (`:3092-3323`) - a huge Swiper facade:
   props `type: 'carousel'|'fullscreen'|'thumbs'|'default'|'hero'|'testimonials'|'blog'|'fullwidth'|''`,
   `blockTitle`, `blockSubtitle`, `displayAllUrl`, `displayAllTitle?`, `slidesPerView: string`,
   `direction: string`, `sliderConfig: any`, `thumbsConfig: any`,
   `autoPlay`, `loop`, `centered`, `pagination`, `showControls`, `controlsOuter`, `arrowsCentered`,
   `autoHeight`, `vertical`, `verticalThumbs`, `gridThumbs`, `showThumbsControls`,
   `staticWhenSingle`, `listenToThumbnailsOption: boolean`;
   ~25 imperative methods (`slideTo`, `slideNext(Loop)`, `slidePrev(Loop)`, `slideToClosest`,
   `slideReset`, `update`, `updateSize`, `updateSlides`, `updateAutoHeight`, `updateProgress`,
   `updateSlidesClasses`, `sliderInit`, `sliderInstance`, `getSlides`, `thumbs*` variants);
   events `onAfterInit`, `onSlideChange`, `onReachBeginning`, `onReachEnd`,
   `onSlideChangeTransitionEnd/Start`, `onSlideNextTransitionEnd/Start` (+ more) -
   `<CR>/dist/components/salla-slider.js:62-70+`.
2. **Native `SallaSlider`** (what `import { SallaSlider } from '@salla.sa/twilight-components-react'`
   actually gives you) - `<CR>/dist/types/native/salla-slider/types.d.ts:4-25`:
   `blockTitle?`, `blockSubtitle?`, `displayAllUrl?`, `displayAllTitle?`, `showControls?`,
   `controlsOuter?`, `autoPlay?`, `loop?`, `centered?`, `slidesPerView?: number | "auto"`,
   `direction?: "rtl"|"ltr"`, `sliderConfig?: Record<string, unknown>`, `slideClassName?`,
   `children?`, `className?`, `id?`, and real React callbacks
   `onAfterInit/onSlideChange/onReachBeginning/onReachEnd/onTransitionEnd: (swiper: Swiper) => void`.
   Ref type `SallaSliderRef` (`:26-33`): `slideTo, slideNext, slidePrev, update, instance, getSlides`.

#### salla-tabs / salla-tab-header / salla-tab-content
- `SallaTabs` (`:3397-3412`): `activeTab?: string`, `backgroundColor: string`, `vertical: boolean`
- `SallaTabHeader` (`:3372-3396`): `name: string`, `activeClass: string`, `centered: boolean`,
  `height: number|string`; method `getChild()`; event `onTabSelected` -> `tabSelected`
- `SallaTabContent` (`:3362-3371`): `name: string`; method `getChild()`

#### salla-accordion / -head / -body
- `SallaAccordion` (`:102-131`): `bordered`, `collapsed`, `collapsible: boolean`,
  `direction?: 'rtl'|'ltr'` (falls back to `document.dir`), `size: "sm"|"md"|"lg"`
- `SallaAccordionHead` (`:143-154`): `collapsed`, `collapsible: boolean`;
  event `onAccordionToggle` -> `accordionToggle`. Slots documented at `:135-142`:
  `title`, `progress`, `html`, `note`
- `SallaAccordionBody` (`:132-142`): no props

#### salla-modal - `SallaModal`  (`:1838-1944`)
`visible`, `centered`, `isClosable`, `isLoading`, `hasSkeleton`, `noPadding`,
`subTitleFirst: boolean`, `subTitle: string`, `position: 'top'|'middle'|'bottom'`,
`width: 'xs'|'sm'|'md'|'lg'|'xl'|'full'`, `iconStyle: 'error'|'success'|'primary'|'normal'`;
methods `open()`, `close()`, `loading()`, `stopLoading()`, `setTitle(html)`.
event: `onModalVisibilityChanged` -> `modalVisibilityChanged`.
`salla-drawer` (`:1041-1118`) is the identical API except `position: 'left'|'right'` and event
`onDrawerVisibilityChanged`.

#### salla-button - `SallaButton`  (`:356-427`) - NOTE: root import gives the **native** one
Web-component props: `color: 'primary'|'success'|'warning'|'danger'|'light'|'gray'|'dark'`,
`fill: 'solid'|'outline'|'none'`, `shape: 'link'|'icon'|'btn'`, `size: 'small'|'large'|'medium'`,
`width: 'wide'|'normal'`, `loaderPosition: 'start'|'end'|'center'|'after'`, `loading`, `disabled`,
`href: string`, `type: string`; methods `load()`, `stop()`, `enable()`, `disable()`, `setText(html)`.
Native React version: `<CR>/dist/types/native/salla-button/types.d.ts`, exported via
`@salla.sa/twilight-components-react/button` (`<CR>/package.json:26-29`).

#### salla-infinite-scroll - `SallaInfiniteScroll`  (`:1488-1513`)
`autoload: boolean`, `container: string` (CSS selector), `item: string` (CSS selector),
`nextPage: string` (URL), `loadMoreText: string`. No events.

#### salla-breadcrumb - `SallaBreadcrumb`  (`:344-345`)
**Zero props, zero events.** The engine does not use it - it ships its own React
`Breadcrumb` + `BreadcrumbJsonLd` (`<ENG>/dist/Breadcrumb-W64WMO56.js`, see §7.3).

#### salla-conditional-fields - `SallaConditionalFields`  (`:625-626`)
**Zero props, zero events.** Driven entirely by the SDK/page context.
(Compare `salla-custom-fields`, `:768-794`: `fields: string | CustomField[]`,
`fileUploadUrl: string`, `isEditable: boolean`; methods `getFieldValues()`, `setFields()`,
`validateFields()`; events `onFieldChanged` -> `fieldChanged`, `onFileUploaded` -> `fileUploaded`.)

#### salla-file-upload - `SallaFileUpload`  (`:1125-1370`) - a FilePond wrapper, ~50 props
- source/target: `url: string`, `method: string`, `accept: string`, `formData: string`,
  `payloadName: string`, `payloadParams?: Record<string, unknown>`, `name?: string`,
  `files: string`, `value: any`, `type: string`, `fileId?: number`, `cartItemId?: string`
- limits: `maxFileSize: \`${number}MB\` | \`${number}KB}\`` (note the typo `KB}` in the template
  literal type), `maxFilesCount: number`, `maxParallelUploads: number`, `ignoredFiles: Array<any>`
- chunking: `chunkUploads`, `chunkForce: boolean`, `chunkSize: number`, `chunkRetryDelays: number[]`
- behaviour flags: `allowBrowse, allowDrop, allowPaste, allowMultiple, allowProcess, allowRemove,
  allowReorder, allowReplace, allowRevert, allowImagePreview, instantUpload, forceRevert,
  storeAsFile, dropOnElement, dropOnPage, dropValidation, checkValidity, required, disabled,
  profileImage: boolean`, `credits: false`
- presentation: `height: string`, `filePosterHeight`, `imagePreviewHeight: number`,
  `labelIdle/labelDecimalSeparator/labelThousandsSeparator: string`,
  `iconProcess/iconRemove/iconRetry/iconUndo: string`, `itemInsertInterval: number`,
  `itemInsertLocation: 'before'|'after'|((a,b)=>number)`
- method: `setOption(key, value)`
- events: `onAdded` -> `added`, `onInvalidInput` -> `invalidInput`, `onUploaded` -> `uploaded`,
  `onRemoved` -> `removed` (`<CR>/dist/components/salla-file-upload.js:56-61`)

#### salla-comments - `SallaComments`  (`:570-624`)
`itemId: number`, `type: CommentType.PAGE | CommentType.PRODUCT | CommentType.BLOG`,
`sort: 'latest'|'oldest'|'bottom_rating'|'top_rating'|'most_helpful'`, `blockTitle: string`,
`loadMoreText: string`, `hideBought`, `hideForm`, `hideTitle`, `showFormAvatar`,
`testimonials: boolean`; method `reload()`. No events.
Children: `salla-comment-form` (`:546-559`, `itemId?: string|number`, `type: 'product'|'page'|'blog'`,
`showAvatar: boolean`, event `onCommentAdded` -> `commentAdded`),
`salla-comment-item` (`:560-569`, `comment: Comment`, `hideBought: Boolean`),
`salla-comment-factors` (`:540-545`, `factors: ReviewFactor[]`).

#### salla-gifting - `SallaGifting`  (`:1429-1476`)
`productId: number`, `formSelector: string`, `physical`, `physicalProducts`, `vertical: boolean`,
`widgetTitle`, `widgetSubtitle: string`; methods `open()`, `close()`, `goToStep2(withValidation?)`.
No events.

#### salla-offer-modal - `SallaOfferModal`  (`:2038-2053`)
**No props** - only methods `open(product_id: number)` and `showOffer(offer: any)`. No events.
(Get a ref and call `open(id)`.) Related: `salla-offer` (`:2030-2037`,
`productCardComponent: string`), `salla-conditional-offer`, `salla-tiered-offer` (both propless).

#### salla-cart-summary - `SallaCartSummary`  (`:452-466`)
`showCartLabel: boolean`; method `animateToCart(image)`. No events. Engine usage with an icon slot:
`<SallaCartSummary className="ml-4 ..."><i slot="icon" className="header-btn__icon icon sicon-shopping-bag" /></SallaCartSummary>`
- `<ENG>/dist/chunk-65Z2ZDKZ.js:112`. Ambient decl `<ENG>/dist/ambient/salla-components.d.ts:43`.
Distinct: `salla-cart-summary-card` (`:467-472`, `validateForms: boolean`, default true;
JSDoc `:463-466`: "Inline on desktop (>=1024px), sticky bar with collapsible sheet on mobile").

#### salla-apps-icons - `SallaAppsIcons`  (`:258-281`)
`apps?: AppsIconsConfig` (`{appstore, googleplay}`; falls back to SDK `store.apps`),
`appsTitle?: string` (falls back to lang `blocks.footer.download_apps`), `hideTitle: boolean`,
`vertical: boolean`, `slotTemplate?: string` (`{icon}`, `{name}` placeholders). No events.
Ambient decl `<ENG>/dist/ambient/salla-components.d.ts:48-57`.

#### salla-payments - `SallaPayments`  (`:2197-2203`)
`exclude: string[]`. No events. Ambient decl `<ENG>/dist/ambient/salla-components.d.ts:58`.

#### salla-advertisement - `SallaAdvertisement`  (`:239-240`)
**Zero props, zero events.** Engine renders it bare at the very top of the header:
`<div className="advertisement-slot"><SallaAdvertisement /></div>` - `<ENG>/dist/chunk-65Z2ZDKZ.js:29`.

#### salla-scroll-to-top
**Does not exist.** No interface in `<TC>/dist/types/components.d.ts`, no wrapper in `<CR>`,
no reference in `<ENG>/dist` or `app/`.

#### salla-localization-modal - `SallaLocalizationModal`  (`:1569-1595`)
`language: string`, `currency: string`, `showTrigger: boolean` (renders its own
`.s-localization-modal-trigger-btn` when true); methods `open()`, `close()`, `submit()`.
No events - it listens on the SDK bus instead (`localization::open`, `currency::open`,
`language::open`). Full switch behaviour in §8.6.
Ambient decl `<ENG>/dist/ambient/salla-components.d.ts:15-18`.

#### salla-user-menu - `SallaUserMenu`  (`:3472-3514`)
`avatarOnly`, `inline`, `relativeDropdown`, `showHeader`, `showTrigger: boolean`. No events.
Engine usage `<SallaUserMenu avatarOnly showHeader className="header-btn" />` -
`<ENG>/dist/chunk-65Z2ZDKZ.js:111`. Ambient decl `<ENG>/dist/ambient/salla-components.d.ts:38-42`
(only 3 of the 5 props are declared there).

---

## 10. Engine layout - where each shell piece lives and how replaceable it is

### 10.1 The file map

| Piece | Runtime chunk | Public import | Replaceable how? |
|---|---|---|---|
| `Header` | `<ENG>/dist/chunk-65Z2ZDKZ.js:20-120`, re-exported by `<ENG>/dist/Header-M5GOR6XZ.js` | `@salla.sa/twilight-theme-engine/layout` -> `Header` (lazy, `<ENG>/dist/components/layout/index.js:8`) | **Not a registry key.** Only by replacing `MasterLayout` |
| `Footer` | `<ENG>/dist/chunk-DTWFNS3F.js:817-925`, re-export `<ENG>/dist/Footer-QD7ASWFT.js` | `/layout` -> `Footer` (`index.js:9`) | same - swap `MasterLayout` |
| `Copyright` | `<ENG>/dist/chunk-JKIRRMBU.js`, re-export `Copyright-OCQCOUFS.js` | `/layout` -> `Copyright` (`index.js:10-12`) | **hook slot `copyright`** - `chunk-DTWFNS3F.js:905-912` renders `<HookSlot name="copyright" context={{storeName}} fallback={<Copyright/>} />` |
| `MasterLayout` | `<ENG>/dist/chunk-DTWFNS3F.js:941-981`, re-export `MasterLayout-SCTQ42ID.js` | `/layout` -> `MasterLayout` (`index.js:13-15`) | **`<TwilightProvider layout={MyLayout}>`** - the prop defaults to `MasterLayout` at `chunk-DTWFNS3F.js:1089`, used at `:1246`. Pass `layout={null}`/your own to drop Header+Footer wholesale |
| `WidgetHead` | `<ENG>/dist/chunk-RJPPO3ET.js:18-29`, re-export `WidgetHead-RWL7D3CT.js` | `/layout` -> `WidgetHead` (`index.js:16-18`) | hard-wired inside `TwilightProvider` (`chunk-DTWFNS3F.js:1229`) |
| `CustomerLayout` | `<ENG>/dist/CustomerLayout-PLJTAXCP.js:48-70` | `/layout` -> `CustomerLayout` (`index.js:19-21`) | passed per-route by the account routes |
| `MainMenu` | `<ENG>/dist/MainMenu-MMAYRKYE.js:26-70` (+ `MainMenuSkeleton` `:18-25`) | none - **not exported** | only by replacing `Header` |
| `MobileMenu` | `<ENG>/dist/MobileMenu-J34MVD6W.js:48-166` (+ `MobileMenuSkeleton` `:41-47`) | none - **not exported** | only by replacing `Header` |
| MobileHeader | **does not exist** - the mobile header is the same `Header`, with a hamburger `<a href="#mobile-menu">` at `chunk-65Z2ZDKZ.js:82-94` toggling local state | - | - |
| UserMenu | **no React component** - the web component `<SallaUserMenu avatarOnly showHeader className="header-btn" />` at `chunk-65Z2ZDKZ.js:111` (and `inline` in the customer sidebar, `CustomerLayout-PLJTAXCP.js:60`) | `@salla.sa/twilight-components-react/user-menu` | not replaceable; re-render the tag yourself |
| `CartSummary` (cart page) | `<ENG>/dist/CartSummary-4V3L56U7.js:52+` - props `{cart, applyCouponEnabled, taxAmount, loyalty, gift, loyaltyPoints}` | via `@salla.sa/twilight-theme-engine/cart` | route-level component |
| Header cart button | web component `<SallaCartSummary>` with an `<i slot="icon">` - `chunk-65Z2ZDKZ.js:112` | - | - |
| `ErrorPage` | `<ENG>/dist/chunk-Z4Y55HWX.js:7-40`, re-export `ErrorPage-XGBROULF.js`; lazy as `LazyErrorPage` in `chunk-LKBWIN26.js` | `/common` | passed as `errorComponent`; `DefaultErrorComponent` maps error -> code at `chunk-QVPMWMPP.js:468-482` |
| `NotFoundPage` | `<ENG>/dist/not-found-3OWRDBD3.js:44-70` | `@salla.sa/twilight-theme-engine/routes` (`routes/not-found.d.ts`) | `createRouter`'s `defaultNotFoundComponent` is hard-coded (`chunk-QVPMWMPP.js:590`); override per-route, or use the 3 hook slots it renders: `notfound:start`, `notfound:content`, `notfound:end` (`not-found-3OWRDBD3.js:65-67`) |
| skeletons | all 27 come from `@salla.sa/twilight-components-react/skeletons`; the engine re-exports 10 + `HomeSkeleton` at `<ENG>/dist/skeleton.js:1-2` / `skeleton.d.ts:1-3` | `@salla.sa/twilight-theme-engine/skeleton` | `createRouter({ defaultPendingComponent })` - `chunk-QVPMWMPP.js:556` (pass `false` to disable) |

### 10.2 `MasterLayout` - the entire body tree

`<ENG>/dist/chunk-DTWFNS3F.js:941-981`:
```
<>
  <div className="app-inner flex flex-col min-h-full">
    <Header />                                   :946
    <main id="main-content" role="main" className="flex-1">{children}</main>   :947
    <Footer />                                   :948
  </div>
  <Suspense><SallaOfferModal /></Suspense>       :950
  {!isLoggedIn && <Suspense><SallaLoginModal isEmailAllowed isMobileAllowed isEmailRequired suppressHydrationWarning /></Suspense>}  :951-961
  {store?.scope && <Suspense><SallaScopes selection={display_as==='popup'?'mandatory':'optional'} suppressHydrationWarning /></Suspense>}  :962-971
</>
```
Three lazily imported web components declared above it: `SallaLoginModal` (`:926-930`),
`SallaScopes` (`:931-935`), `SallaOfferModal` (`:936-940`).

`TwilightProvider` wraps it with (in order, `chunk-DTWFNS3F.js:1226-1252`):
`DocumentClassProvider` -> `TwilightContext.Provider` -> `I18nProvider` ->
`ThemeDocumentSync` + the route-class sync + the loading overlay + `readyContent`, where
`readyContent` = `<WidgetHead/>`, `<AppsSnippets/>`, `HookSlot body:start`,
`Suspense(Toaster + NavigationInterceptor)`, **the layout**, `HookSlot body:end`
(`:1207-1225`), all optionally wrapped in the framework `NavigationSetup` (`:1221-1223`).

**Until `isReady`, the layout is not rendered at all** - `chunk-DTWFNS3F.js:1249` renders
`<div className="loading-overlay">{skeleton || <div className="loading-spinner"/>}</div>`.
The `skeleton` prop on `TwilightProvider` replaces the spinner (`:1080`).

### 10.3 `Header` - props, settings and hook slots  (`<ENG>/dist/chunk-65Z2ZDKZ.js:20-120`)

Signature is `Header(_props)` - **it ignores all props**. Data comes from
`useTwilight()` (`currency, theme, store`, `:21`) and `useTranslation()` (`locale, languageName`, `:22`);
`settings = theme?.settings || {}` (`:23`).

| Setting read | Line | Effect |
|---|---|---|
| `theme.settings.topnav_is_dark` | `:30` | adds `top-navbar--dark` |
| `theme.settings.important_links` | `:32` | renders `<SallaMenu source="footer" topnav />` |
| `store.settings.is_multilingual` / `.currencies_enabled` | `:33` | shows the localization button + modal |
| `store.settings.use_sar_symbol` (+ `currency.code==='SAR'`) | `:44` | `<i class="sicon-sar">` instead of the symbol |
| `store.scope` | `:57-70` | scope button dispatching `scopes::open` |
| `theme.settings.header_is_sticky` | `:79` | adds `sticky top-0` to `#mainnav` |
| `theme.settings.is_more_button_enabled` | `MainMenu-MMAYRKYE.js:33` | "More" dropdown after **7** visible items (`:34`) |

Structure: `<header className="store-header" suppressHydrationWarning>` (`:27`) containing
`HookSlot header:start` (`:28`), `.advertisement-slot > <SallaAdvertisement/>` (`:29`),
`.top-navbar` (`:30-74`), `#mainnav.main-nav-container` (`:75-116`) with `.navbar-brand` +
`<Image src={store.logo} priority width={120} height={48}/>` (`:95-107`), `<LazyMainMenu/>` (`:108`),
`<SallaUserMenu/>` + `<SallaCartSummary/>` (`:110-113`), `<LazyMobileMenu/>` (`:117`),
`HookSlot header:end` (`:118`). `useIsHome()` decides whether the store name is an `<h1>` or a
`<span>` (`:25-26`, `:106` - it is always `sr-only`).

`MainMenu`/`MobileMenu` are `React.lazy` (`:16-19`), fed by `useQuery(menu.queries.header())`
(`MainMenu-MMAYRKYE.js:31`, `MobileMenu-J34MVD6W.js:56`). `MobileMenu` returns `null` when closed
(`:49`), pushes/pops a `menuStack` for sub-menus (`:59-76`), and toggles `document.body.classList`
`menu-opened` (`:78-80`) - which is exactly what `app/styles/app.css` keys its scroll-lock off.

### 10.4 `Footer`  (`<ENG>/dist/chunk-DTWFNS3F.js:817-925`)

`<footer className="store-footer" suppressHydrationWarning>`, `HookSlot footer:start` (`:835`),
a `container grid grid-cols-1 lg:grid-cols-6` (`:836`) with:
store name `<h3>` + `store.description` via `dangerouslySetInnerHTML` (`:839-845`),
`<SallaSocial/>` (`:846`), `<SallaTrustBadges dark={footer_is_dark}/>` (`:848`),
the VAT block with a click-to-zoom certificate (`:849-876`, opens `LazyImageModal` `:915-923`),
`<SallaMenu source="footer"/>` under `t('blocks.footer.pages_links')` (`:878-881`),
`<SallaContacts contacts={store.contacts} contactsTitle={t('blocks.footer.social')}/>` (`:883-891`),
`<SallaAppsIcons apps={store.apps} appsTitle={t('blocks.footer.download_apps')}/>` (`:892-899`),
then a bottom row with the `copyright` HookSlot and `<SallaPayments/>` (`:901-913`),
and `HookSlot footer:end` (`:924`).
Settings read: only **`theme.settings.footer_is_dark`** (`:848`).

### 10.5 `header_layout` / `footer_layout` - declared but dead

`<ENG>/dist/types/index.d.ts:259-260` type them
(`header_layout?: 'lite' | 'default'`, `footer_layout?: 'columns' | 'centered'`)
but **a grep of every `.js` in `<ENG>/dist` finds zero reads**. Same for
`imageZoom, store_color, homepage_type, header_menu_type, footer_menu_type,
product_card_img_ratio, vertical_fixed_products, squar_photo_bg_image_size,
is_show_more_detail_enabled, enable_add_product_toast, default_font_name, store_font_type`
(full type at `types/index.d.ts:243-276`). The engine only actually reads:
`show_tags` (`routes/product.js:91`), `footer_is_dark`, `topnav_is_dark`, `sticky_add_to_cart`
(`chunk-DTWFNS3F.js:98-100`, `routes/product.js:96`), `important_links`, `header_is_sticky`
(`chunk-65Z2ZDKZ.js:32,79`), `is_more_button_enabled` (`MainMenu-MMAYRKYE.js:33`),
`slider_background_size` (`chunk-UQRLBMIO.js:237`), `is_breadcrumbs_enabled`
(`Breadcrumb-W64WMO56.js:146`). **Any other layout switch is the theme's to implement.**

### 10.6 Body/html classes the engine puts on the document

`ThemeDocumentSync` - `<ENG>/dist/chunk-DTWFNS3F.js:85-109`:
`salla-<theme.name>`, `color-mode-dark|light` (from `theme.color.is_dark`),
the direction (`rtl`/`ltr`), `preview-mode` when `theme.mode === 'preview'`,
`font-<slugified font name>` (`fontToClass` `:79-84`), `mobile-webview`,
`footer-is-dark|footer-is-light`, `topnav-is-dark`, `is-sticky-product-bar` (`:91-101`).
Plus `html: { lang, dir }` (`:103`). Route class (`index`, `product-single`, ...) is added by
`RouteDocumentSync`/`TanStackDocumentSync` from `ROUTE_CLASS_MAP` (`chunk-QVPMWMPP.js:650-715`).
Everything funnels through the `DocumentClassProvider` store
(`<ENG>/dist/chunk-JWXJPJBO.js:5-58`), which syncs in a `useEffect` (`:47-57`).

### 10.7 The merchant font link and the `--color-*` CSS variables

**Font (SSR, in `<head>`)** - `buildRootLinks` / `buildRootStyles`, `<ENG>/dist/chunk-QVPMWMPP.js`:
- `deriveFontParts(theme)` `:197-209` reads `theme.font.url || theme.font.path`, detects
  `fonts.googleapis.com`, and appends `display=swap` to a Google URL that lacks it (`:201-207`)
- emits `<link id="salla-theme-font" rel="stylesheet" href={fontUrlWithDisplay} media="print">`
  (`:282-289`) - **`media="print"` is the async-CSS trick**; the inline
  `MEDIA_SWAP_SCRIPT` (`:132-134`, emitted as `<script id="salla-async-css">` at `:339`)
  flips `media` to `all` for `#salla-theme-font` and `#salla-icons-css` once loaded
- for a **non-Google** font with a `family_name` it also emits
  `<link id="salla-font-display-override" rel="preload" as="style">` (`:290-297`) and an inline
  `<style id="salla-font-display-swap">@font-face{font-family:"X";font-display:swap;src:local("X")}</style>` (`:318-323`)
- `<link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin>` only when a font URL exists (`:273-279`)
- The theme's own font CSS vars come from `applyTheme`, below, plus `app/styles/tokens.css`
  and `[dir="rtl"] { --font-main: var(--font-ar) }` in `app/styles/app.css:11-13`.

**Colour variables - NOT server-rendered.** There is **no inline `<html style="--color-primary…">`
in the SSR output**. `applyTheme(theme)` (`<ENG>/dist/chunk-DTWFNS3F.js:36-77`) guards with
`if (typeof document === "undefined") return;` (`:37`) and sets the vars with
`document.documentElement.style.setProperty(...)` (`:73-76`), driven from a `useEffect` inside
`ThemeDocumentSync` (`:105-107`). The variables written:

| Var | Line | Source |
|---|---|---|
| `--font-main`, `--font-light`, `--font-regular` | `:40-42` | `theme.font.name` |
| `--font-medium`, `--font-bold` | `:43-44` | `"<name>-Medium"`, `"<name>-Bold"` |
| `--color-text` | `:50` | hard-coded `#222222` |
| `--color-primary` | `:54` | `theme.color.primary` |
| `--color-primary-dark` / `-light` | `:55-56` | `color(primary).darken(0.15)` / `.lighten(0.15)` (`chunk-VVZNW5CB.js`) |
| `--color-title`, `--color-secondary` | `:57-58` | also `theme.color.primary` |
| `--color-primary-reverse`, `--color-text-reverse`, `--color-reverse-text` | `:62-65` | `theme.color.reverse_text` |
| `--color-reverse-primary` | `:68` | `theme.color.reverse_primary` |
| `--page-height` | `:71` | `100%` |

**Consequences for a theme:**
- These land **after hydration**, in an effect. Anything painted from `var(--color-primary)`
  before that (including the engine's own `.loading-spinner`, which is why it falls back to
  `var(--color-primary,#000)` at `chunk-QVPMWMPP.js:137`) flashes. A theme that wants the brand
  colour at first paint must define its own fallback in CSS (this theme does:
  `app/styles/tokens.css`, referenced from `app/styles/app.css:3`) - `applyTheme` then overwrites
  it at runtime because inline `style` on `<html>` outranks any stylesheet rule.
- **A theme cannot suppress `applyTheme`.** It runs unconditionally from `ThemeDocumentSync`, which
  `TwilightProvider` always renders (`chunk-DTWFNS3F.js:1229-1237`). The only way to win is
  specificity you cannot get (inline style) - so **override by consuming derived vars**
  (define `--color-primary-rgb` etc. yourself in `tokens.css` and use those), or re-set the
  property from your own later effect.
- `app/routes/kitchen-sink.tsx:56-59` already documents these four as
  `owner: 'Salla (inline on <html>)'`, and `:60` marks `--color-primary-rgb` as theme-owned.

---

## 11. `twilight.json` - the schema the engine and dev widget actually understand

### 11.1 Top-level keys (this repo's file, `twilight.json`, 1138 lines)

`type`, `name` (`{ar,en}`), `repository`, `author_email`, `features[]`, `settings[]`,
`components[]`, `support_url`, `description` (`{ar,en}`).

`"type": "react"` is load-bearing and validated at dev-server start:
`getThemeType` `<ENG>/dist/vite/index.js:275-280`, `isReactThemeManifest` `:280-282`,
`describeThemeTypeIssue` `:283-296` - three distinct warnings (missing type, whitespace-padded
`"react "`, or a different type), because "the Salla CLI treats a manifest without it as a twig
theme". Invalid JSON gets its own warning (`:322-326`). Warnings only, never a build failure, and
only in `serve` mode (`isDevServer`, `:313`, `:330`).

`features[]` (17 entries here: `mega-menu`, `fonts`, `color`, `breadcrumb`, `unite-cards-height`,
`component-featured-products`, `component-fixed-banner`, `component-fixed-products`,
`component-products-slider`, `component-photos-slider`, `component-parallax-background`,
`component-testimonials`, `component-square-photos`, `component-store-features`,
`component-youtube`, `menu-images`, `filters`) is **never read by the engine** - it is consumed by
the Salla dashboard/CLI. Note the mismatch: `features[]` still advertises the old Raed component
set, while `components[]` declares a different six.

### 11.2 `settings[]` / `fields[]` entry shape and the `classify()` truth table

The only code that interprets a field is `classify(entry)` -
`<ENG>/dist/vite/index.js:191-224`:

| `type` | `format` | Dev-widget `kind` | Default taken from | Line |
|---|---|---|---|---|
| `static` | any (`line`, `title`, `description`) | **dropped entirely** (returns `null`) | - | `:196` |
| `boolean` | any (in practice `switch`) | `toggle` | `entry.value` if boolean, else `false` | `:197-204` |
| `items` | `dropdown-list` **with** `options[]` | `select` | `firstScalar(entry.value) ?? firstScalar(entry.selected) ?? options[0].value` | `:205-218` |
| `items` | `dropdown-list` **without** `options[]` | `readonly`, note `remote (<source>)` | `null` | `:207-214` |
| `string` | one of `text`, `textarea`, `image`, `icon`, `line` (`TEXTUAL_FORMATS`, `:158`) | `text` | `entry.value` if string, else `""` | `:219-221` |
| anything else (`collection/collection`, `items/variable-list`, `number/integer`, `color/*`, ...) | - | `readonly`, note `"<type>/<format>"` | `null` | `:222-228` |

So **`collection`, `variable-list`, `number`, and any colour picker are read-only in the dev widget**
- they still ship to the merchant dashboard, they just are not editable locally.
An entry with no string `id` is dropped (`:193-194`).

Other recognised keys on an entry, seen in this repo's file and/or used by `classify`:
`id` (required), `type`, `format`, `label` (string; `labelOf` falls back to the `id`, `:159-161`),
`labelHTML`, `description`, `icon` (a `sicon-*` class), `value`, `selected`, `options[]`
(`{label,value,key}` - `toOptions` accepts `value` **or** `key`, and drops empty values, `:170-179`),
`source` (e.g. `"Manual"`, `"products"`, `"custom"`), `sources[]` (for `variable-list`),
`required`, `multichoice`, `searchable`, `multilanguage`, `placeholder`, `hide`,
`minLength`, `maxLength`, `variant` (for `static/title`), `item_label` (for collections).

### 11.3 `components[]` schema

Per component, this repo uses: `key` (a UUID), `title` (`{en,ar}` object **or** a plain string),
`icon` (`sicon-*`), `path` (`"home.<slug>"`), `image` (preview URL), `is_default` (boolean),
`fields[]`.

What the engine reads - `buildTwilightSchema` `<ENG>/dist/vite/index.js:242-274`:
- `path = c.path || c.key || ""`; **a component with neither is skipped silently** (`:254-256`)
- `title` via `titleOf` `:162-169`: object -> `en || ar`, string -> as-is, else falls back to
  `path ?? key ?? "component"`
- `fields[]` -> `classify()` each (`:257-262`)
- `componentDefaults[path] = defaultsFor(fields)` - non-readonly fields only (`:236-241`, `:264`)
- **`icon`, `image`, `is_default`, `key` are never read** by the engine or the widget; they are for
  the Salla dashboard's block picker. `conditions` does not appear in this manifest and there is no
  code path for it in `<ENG>/dist/vite/*` or `<ENG>/dist/dev/*` - a grep for `conditions` in both
  returns nothing.

**`conditions` correction:** the key **does** exist in this repo's manifest - 4 occurrences, all on
`home.main-links` fields (`twilight.json:394-401`, `:407-414`, `:481-488`, and the `links` field),
shape `[{ "id": "<other field id>", "operation": "=", "value": <literal> }]`:

| Field | Shown when |
|---|---|
| `with-bg` (static/description) | `merge_with_top_component = true` |
| `without-bg` (static/description) | `merge_with_top_component = false` |
| `categories` (items/dropdown-list) | `show_cats = true` |
| `links` (collection) | `show_cats = false` |

**The engine ignores `conditions` entirely** - `classify()` never looks at it and a grep of
`<ENG>/dist/vite/index.js` and `<ENG>/dist/dev/**` finds no occurrence. Conditional visibility is a
**dashboard-only** feature; the dev widget shows every field unconditionally.

### 11.4 This repo's declared surface

**22 `settings[]` entries** (`twilight.json`), in order:
`squar_photo_bg_image_size` (items/dropdown-list, required, options cover|contain),
`vertical_fixed_products`, `is_more_button_enabled` (boolean/switch),
`static-line1` (static/line), `static-label2` (static/title, an HTML banner),
`header_is_sticky`, `topnav_is_dark`, `important_links`, `enable_more_menu`,
`static-line3`, `static-label4`,
`footer_is_dark`, `static-line5`, `static-label6`,
`product_show_breadcrumbs`, `product_index_show_breadcrumbs`, `enable_add_product_toast`,
`notify_when_available_in_card`, `sticky_add_to_cart`, `show_tags`,
`slider_background_size` (items/dropdown-list, required), `imageZoom`.

Type/format pairs actually present: `boolean/switch` x14, `items/dropdown-list` x2,
`static/line` x3, `static/title` x3 in settings; and in component fields
`static/description` x10, `collection/collection` x4, `boolean/switch` x3,
`items/dropdown-list` x3, `string/text` x3, `string/image` x1, `string/textarea` x1,
`items/variable-list` x1. (No `string/icon`, no `number/integer`, no `color` anywhere -
those would all land in the `readonly` bucket except `string/icon`.)

**6 `components[]`**, each with `key` (UUID), `title{en,ar}`, `icon`, `path`, `image`, `fields[]`:

| `path` | `is_default` | icon | fields |
|---|---|---|---|
| `home.enhanced-slider` | true | `sicon-image-carousel` | 2 static/description + `slides` collection (min 1, max 10; sub-fields `slides.image` string/image, `slides.title` string/text maxLength 100 multilanguage, `slides.description` string/textarea maxLength 255, `slides.without_overlay` boolean/switch) |
| `home.main-links` | true | `sicon-layout-grid-rearrange` | `with-bg`/`without-bg`/`static-desc` static, `title` string/text, `merge_with_top_component` boolean, `show_controls` boolean, `show_cats` boolean, `categories` items/dropdown-list, `links` collection (min 3, max 100; `links.icon`, `links.title`, `links.url`) |
| `home.slider-products-with-header` | - | `sicon-list-play` | `with-bg` static, `background` string/image, `title` string/text, `description` string/textarea, `products` items/dropdown-list (`source: "products"`, `multichoice: true`, `searchable: true`, min 1 max 8), `display_all_url` items/**variable-list** |
| `home.enhanced-square-banners` | true | `sicon-image` | 2 static + `banners` collection (min 1, max 5; `banners.image`, `banners.url`, `banners.title`, `banners.description`) |
| `home.brands` | - | `sicon-award-ribbon` | `with-bg` static, `title` string/text, `brands` items/dropdown-list |
| `home.custom-testimonials` | true | `sicon-chat-bubbles` | `static-desc` + `items` collection (min 1, max 30; `items.name`, `items.avatar`, `items.stars`, `items.text`) |

A `variable-list` field carries a `sources[]` array of link targets -
`products`, `products_tags`, `categories`, `brands`, `pages`, `blog_articles`, `blog_categories`,
`offers_link`, `brands_link`, `blog_link`, `custom` (`twilight.json`, `display_all_url` field).
That list is exactly the `RedirectType` union in the engine's generated
`redirect.$type.$id` route template (`<ENG>/dist/vite/index.js:1455-1465`).

### 11.5 `virtual:twilight/schema` and the DevSettingsWidget

Plugin `twilightSchemaPlugin(twilightJsonPath = 'twilight.json')` -
`<ENG>/dist/vite/index.js:308-360`; registered 8th in the plugin array (`:2477`).
- `VIRTUAL_ID = "virtual:twilight/schema"`, resolved id `"\0virtual:twilight/schema"` (`:304-305`)
- **In a production build it always returns `EMPTY_MODULE`** - `if (!isDevServer) return EMPTY_MODULE`
  (`:341`), where `EMPTY_DEV_SCHEMA = {settings:[],components:[],settingsDefaults:{},componentDefaults:{}}`
  (`:299-303`, typed `<ENG>/dist/dev/schema-types.d.ts:41`). Any JSON parse error also yields it (`:346-348`).
- In dev it emits `export default <buildTwilightSchema(json)>` (`:343-345`) and hot-invalidates the
  module on every `twilight.json` write (`:350-360`).
- Consumed in this theme at `app/routes/__root.tsx:9` (`import devSchema from 'virtual:twilight/schema'`)
  and passed to the widget at `:47`.

`DevSettingsWidget({ schema })` - `<ENG>/dist/dev/DevSettingsWidget.d.ts:14-18`. Per its own doc
comment (`:1-11`): it "reads the theme's local twilight.json (via `virtual:twilight/schema`), fills
every setting/component field with its default, and lets the developer change those values",
**portals to `<body>`, styles itself inline, and renders `null` when the schema is empty** - so the
production build renders nothing even if the gate were removed. This theme lazy-loads it behind
`import.meta.env.DEV` (`app/routes/__root.tsx:16-20`, mount `:45-49`).

State lives in `devSettingsStore` (`<ENG>/dist/dev/dev-settings-store.d.ts:12-38`), a
localStorage-backed external store with `{ enabled, settings: {[id]:value},
components: {[path]: {[fieldId]: value}} }`, and API `enable(schema)` / `disable()` /
`setSetting(id,value)` / `setComponentField(path,fieldId,value)` / `reset(schema)`.
Two consumers:
- `useDevSettingsOverrides()` (`:52-54`) merges enabled setting overrides into the live theme inside
  `useTwilightInit` (imported at `<ENG>/dist/chunk-DTWFNS3F.js:3`)
- `useDevHomeComponentOverrides(components)` (`:56-59`) shallow-merges component-field overrides onto
  home blocks, looking each block up under **both** `"home.main-links"` and `"main-links"` because
  the home loader strips the `home.` prefix (doc at `dev-settings-store.d.ts:55-63`)

**Validation performed:** only `describeThemeTypeIssue` (the `"type": "react"` check) and JSON
validity. There is **no schema validation of `settings[]`/`components[]`** - a malformed entry is
silently dropped by `classify()`/`buildTwilightSchema`, never reported.
Hydration note: `useDevSettingsOverrides` returns the empty state on the server and for the first
client render, so overrides apply only after mount (`dev-settings-store.d.ts:40-51`).

---

## 12. i18n - two namespaces, flat dotted keys, CDN fallback

### 12.1 The pipeline, end to end

1. **Engine ("app") translations** are fetched at runtime from the Salla CDN, **not** bundled:
   `translations.get()` -> `cdn.get("js/translations.json", {timeout: 5000})` -
   `<ENG>/dist/chunk-KT2MUSRN.js:4-12`, query key `["translations"]` (`:14-19`),
   typed `<ENG>/dist/api/translations.d.ts:2-16`. A failure logs
   `"[translations.get] Failed to load translations"` and returns `null` (`:9-11`).
   Prefetched in `rootBeforeLoad` (`<ENG>/dist/chunk-QVPMWMPP.js:48`).
2. **Theme translations** are bundled at build time by `themeTranslationsPlugin(localesDir)` -
   `<ENG>/dist/vite/index.js:103-155`:
   - virtual id `virtual:twilight/theme-translations`, resolved `"\0virtual:twilight/theme-translations"` (`:103-104`)
   - reads every `*.json` in the configured locales dir (`:121-123`), and for each emits an entry
     keyed **`'<basename>.trans'`** with the raw JSON inlined (`:124-130`) -
     so `locales/ar.json` becomes `{'ar.trans': {...}}`, `locales/en.json` -> `{'en.trans': {...}}`
   - `export default {}` when there is no locales dir, no JSON files, or any read/parse error
     (`:120`, `:123`, `:134-136`)
   - HMR: watches `<localesDir>/*.json` and invalidates the module on `change` and `add`
     (`:137-153`) - **note: not on `unlink`**
   - This theme imports it at `app/routes/__root.tsx:8` and hands it to
     `<TwilightProvider translations={themeTranslations}>` (`:44`)
3. **The i18next instance** - `createI18nInstance(locale, translations, themeTranslations)` -
   `<ENG>/dist/chunk-PJWFEMBX.js:13-33`:
   ```
   lng: locale, fallbackLng: locale,
   ns: ["app", "theme"], defaultNS: "app", fallbackNS: "theme",
   resources: { [locale]: { app: translations?.[`${locale}.trans`] ?? {},
                            theme: themeTranslations?.[`${locale}.trans`] ?? {} } },
   interpolation: { escapeValue: false },
   react: { useSuspense: false },
   keySeparator: ".", nsSeparator: false
   ```
   `rootBeforeLoad` calls it with only **two** args (`chunk-QVPMWMPP.js:75`), so the `theme` bundle
   starts empty; the same at hydration (`chunk-QVPMWMPP.js:518`).
4. **`I18nProvider` injects the theme bundle** afterwards -
   `<ENG>/dist/chunk-TYNZ5B2B.js:17-31`: `i18nInstance.addResourceBundle(locale, "theme",
   themeTranslations['<locale>.trans'], /*deep*/ true, /*overwrite*/ true)` (`:27`), but **only when
   the bundle is non-empty** (`:26`). It also republishes the `app` bundle onto
   `window.translations = { '<locale>.trans': ... }` in an effect (`:45-51`) for the SDK/web
   components to read.
5. `useTranslation(ns?)` - `<ENG>/dist/chunk-TYNZ5B2B.js:12-16` - wraps react-i18next's and merges
   the `I18nContext` value, so one call gives you
   `{ t, i18n, ready, locale, direction, isRTL, isLTR, languageName }`
   (typed `<ENG>/dist/providers/I18nProvider.d.ts:19-28`).

### 12.2 Flat dotted keys DO work - here is why

`locales/ar.json` and `locales/en.json` in this repo are **flat**: 48 top-level keys, every one a
dotted string (`"pages.cart.total"`, `"blocks.header.main_menu"`, ...) with a string value, zero
nesting.

That combination looks wrong against `keySeparator: "."`, but i18next 26 resolves it:
`ResourceStore.getResource` -> `deepFind(data[lng][ns], key, keySeparator)`
(`node_modules/.pnpm/i18next@26.4.2_typescript@6.0.3/node_modules/i18next/dist/esm/i18next.js:351`),
and `deepFind` (`:159-190`) **first tries the whole key as a literal property**
(`if (obj[path]) { ...hasOwnProperty check...; return obj[path]; }`, `:160-164`) before splitting on
the separator. It also re-joins progressively (`:170-185`), so a **nested** file works too.
**Both shapes are valid; flat is what this theme uses, and they can even be mixed.**

`nsSeparator: false` means a `:` in a key is literal - you cannot write `theme:some.key`; pick the
namespace with `useTranslation('theme')` instead.

### 12.3 Lookup order and fallbacks

`defaultNS: "app"`, `fallbackNS: "theme"` -> a bare `t("pages.cart.total")` hits the **engine's CDN
bundle first**, and only falls through to the theme's `locales/*.json` when the engine has no such
key. That is the opposite of what most themes expect.

- To force the theme's copy, call `useTranslation('theme')` (or `t('key', {ns:'theme'})`).
- **There is no cross-locale fallback**: `fallbackLng: locale` (`chunk-PJWFEMBX.js:18`) points at
  the *current* language, so a key missing in `ar` does **not** fall back to `en`.
- A key missing from both namespaces renders **as the key string itself**, unless a default is
  passed. The engine always passes one - the pattern is `t("common.elements.tax_number", "Tax Number")`
  (`chunk-DTWFNS3F.js:873`) or `t("common.errors.404") || "Page Not Found"`
  (`not-found-3OWRDBD3.js:47`).
- If the CDN fetch fails, `app` is `{}` -> everything falls through to `theme` -> then to the inline
  default. So a theme that mirrors the engine's key names in `locales/*.json` gets a full offline
  fallback for free.

### 12.4 Every key the ENGINE itself reads

Extracted by grepping `t("…")` / `t('…')` across every non-map `.js` under `<ENG>/dist`:
**154 distinct keys**, four top-level namespaces:

| Namespace | count | Sub-namespaces (count) |
|---|---|---|
| `pages.*` | 114 | `products` 22, `cart` 22, `orders` 19, `wallet` 9, `thank_you` 9, `categories` 8, `loyalty_program` 7, `order` 5, `testimonials` 4, `rating` 3, `blog_articles` 2, `wishlist` 1, `offer` 1, `brands` 1, `blog_categories` 1 |
| `common.*` | 30 | `titles` 14, `elements` 8, `errors` 3, `uploader` 2, `buttons` 2, `messages` 1 |
| `blocks.*` | 9 | `footer` 5, `home` 2, `header` 2 |
| `store.*` | 1 | `store.closed_notification` |

The full list (alphabetical - this is all 154):

`blocks.footer.blog`, `blocks.footer.copyright`, `blocks.footer.download_apps`,
`blocks.footer.pages_links`, `blocks.footer.social`, `blocks.header.main_menu`,
`blocks.header.no_notifications`, `blocks.home.display_all`, `blocks.home.testimonials`,
`common.buttons.back`, `common.buttons.close`, `common.elements.back_home`,
`common.elements.cancel`, `common.elements.location`, `common.elements.note`,
`common.elements.ok`, `common.elements.remove`, `common.elements.tax_certificate`,
`common.elements.tax_number`, `common.errors.404`, `common.errors.error_occurred`,
`common.errors.no_wishlist`, `common.messages.must_login`, `common.titles.brands`,
`common.titles.cart`, `common.titles.home`, `common.titles.more`, `common.titles.notifications`,
`common.titles.orders`, `common.titles.pending_orders`, `common.titles.products`,
`common.titles.profile`, `common.titles.search`, `common.titles.settings`,
`common.titles.thank_you`, `common.titles.wallet`, `common.titles.wishlist`,
`common.uploader.browse`, `common.uploader.drag_and_drop`,
`pages.blog_articles.no_articles`, `pages.blog_articles.related`,
`pages.blog_categories.categories`, `pages.brands.non_brands`, `pages.cart.VAT_tax_amount`,
`pages.cart.apply_coupon`, `pages.cart.apply_coupon_btn`, `pages.cart.complete_order`,
`pages.cart.coupon_placeholder`, `pages.cart.discount`, `pages.cart.empty_cart`,
`pages.cart.final_total`, `pages.cart.free_shipping`, `pages.cart.gift_widget_title`,
`pages.cart.has_free_shipping`, `pages.cart.have_coupon`, `pages.cart.item_options`,
`pages.cart.items_total`, `pages.cart.items_total_without_tax`, `pages.cart.order_options_total`,
`pages.cart.request_price_quote`, `pages.cart.reservations`, `pages.cart.shipping_cost`,
`pages.cart.summary`, `pages.cart.total`, `pages.cart.weight`, `pages.categories.filters`,
`pages.categories.no_products`, `pages.categories.sort_by_price_az`,
`pages.categories.sort_by_price_za`, `pages.categories.sort_by_rating`,
`pages.categories.sort_by_sales`, `pages.categories.sort_by_suggestions`,
`pages.categories.sorting`, `pages.loyalty_program.completed`, `pages.loyalty_program.copy_link`,
`pages.loyalty_program.exchange_points`, `pages.loyalty_program.free_product`,
`pages.loyalty_program.point`, `pages.loyalty_program.ways_to_get_points`,
`pages.loyalty_program.you_have`, `pages.offer.continue_shopping`,
`pages.order.can_edit_or_delete_your_review_within`, `pages.order.days_since_added`,
`pages.order.order_cancelation_desc`, `pages.order.order_rating_message`,
`pages.order.order_rating_title`, `pages.orders.cancel`, `pages.orders.cancel_confirmation`,
`pages.orders.date`, `pages.orders.digital`, `pages.orders.file_url`,
`pages.orders.finish_payment`, `pages.orders.non_orders`, `pages.orders.order_details`,
`pages.orders.pending_payment_expired`, `pages.orders.print`, `pages.orders.reorder`,
`pages.orders.reorder_confirmation`, `pages.orders.reorder_description`,
`pages.orders.shipment_no`, `pages.orders.status`, `pages.orders.total`, `pages.orders.tracking`,
`pages.orders.tracking_url`, `pages.orders.your_order_is_under_review`,
`pages.products.add_file`, `pages.products.add_note`, `pages.products.attachments`,
`pages.products.availability`, `pages.products.calories`, `pages.products.expected_to_be`,
`pages.products.notes_placeholder`, `pages.products.out_of_stock`, `pages.products.price`,
`pages.products.quantity`, `pages.products.read_more`, `pages.products.remained`,
`pages.products.select_branch`, `pages.products.show_size_guides`,
`pages.products.similar_products`, `pages.products.size_guides`, `pages.products.sku`,
`pages.products.sold`, `pages.products.sold_times`, `pages.products.starting_price`,
`pages.products.tax_included`, `pages.products.weight`, `pages.rating.rate`,
`pages.rating.rate_shipping`, `pages.rating.rate_the_store`,
`pages.testimonials.sort_by_date_asc`, `pages.testimonials.sort_by_date_desc`,
`pages.testimonials.sort_by_rating_asc`, `pages.testimonials.sort_by_rating_desc`,
`pages.thank_you.email_sent_to`, `pages.thank_you.hero_title`,
`pages.thank_you.invoice_sent_success`, `pages.thank_you.order_id`,
`pages.thank_you.order_id_label`, `pages.thank_you.resend_invoice`, `pages.thank_you.send`,
`pages.thank_you.support`, `pages.thank_you.view_order_details`, `pages.wallet.amount`,
`pages.wallet.balance`, `pages.wallet.date`, `pages.wallet.expiry_date`,
`pages.wallet.no_transactions`, `pages.wallet.order_no`, `pages.wallet.title`,
`pages.wallet.transaction_number`, `pages.wallet.transaction_type`, `pages.wishlist.toggle`,
`store.closed_notification`.

Two are template keys, not literals: `` t(`common.errors.${code}`) `` in `ErrorPage`
(`<ENG>/dist/chunk-Z4Y55HWX.js:20`) - so `common.errors.400/401/404/500` are all live - and a
generated key in the money/number formatter chunk.

### 12.5 This theme's own locale files vs the engine's keys

`locales/ar.json` has **48 keys**; **14 of them collide with keys the engine already reads**
(`blocks.header.main_menu`, `blocks.home.testimonials`, `common.titles.home`,
`pages.cart.apply_coupon_btn`, `pages.cart.total`, `pages.products.out_of_stock`, and all 8
`pages.thank_you.*`). Because `defaultNS` is `app`, **those 14 lose to whatever the Salla CDN
bundle says** - the theme's value is only used if the CDN key is absent. The other **34 are
theme-only** (`blocks.catalog.*`, `blocks.footer.newsletter*`, `blocks.home.reviews_*`,
`blocks.header.browse_all`, `common.actions.*`, `pages.cart.empty`, ...) and resolve through
`fallbackNS: "theme"` as intended. `locales/en.json` mirrors the same key set.

---

## 13. Dark mode, money/number formatting, images, lazy rendering

### 13.1 Dark mode - there is no dark mode

Every "dark" in the engine is a **per-region flag**, not a theme-wide colour scheme:

| Flag | Where read | Effect |
|---|---|---|
| `theme.color.is_dark` | `<ENG>/dist/chunk-DTWFNS3F.js:93` | adds body class `color-mode-dark` or `color-mode-light` - **nothing in the engine or the Tailwind theme styles that class** |
| `theme.settings.topnav_is_dark` | `chunk-65Z2ZDKZ.js:30` | appends `top-navbar--dark` to the top bar |
| " | `chunk-DTWFNS3F.js:99` | also adds body class `topnav-is-dark` |
| `theme.settings.footer_is_dark` | `chunk-DTWFNS3F.js:98` | body class `footer-is-dark` / `footer-is-light` |
| " | `chunk-DTWFNS3F.js:848` | passes `dark` to `<SallaTrustBadges>` |
| `theme.settings.sticky_add_to_cart` | `chunk-DTWFNS3F.js:100` | body class `is-sticky-product-bar` |

`tailwind.config.cjs:14` sets `darkMode: 'class'` and the Twilight Tailwind plugin does the same
(`<TW>/index.js:178`), so `dark:` variants key off a literal `.dark` class - **which nothing ever
adds**. The engine writes `color-mode-dark`, not `dark`. To make `dark:` utilities work you must
either add `.dark` yourself or change `darkMode` to `['class', '.color-mode-dark']`.
There is no `prefers-color-scheme` handling anywhere in `<ENG>/dist`.

### 13.2 `useNumber()`  (`<ENG>/dist/chunk-DTWFNS3F.js:284-303`)

- `ARABIC_NUMERALS` = the 10 Arabic-Indic digits U+0660..U+0669 (`:284`)
- `toArabic(input)` - `String(input).replace(/[0-9]/g, ...)` (`:285-288`)
- `useNumber()` returns `{ format, toArabic, useArabicNumerals }` (`:295-302`)
- `useArabicNumerals = store?.settings?.arabic_numbers_enabled ?? false` (`:291`;
  typed `<ENG>/dist/types/index.d.ts:111`)
- `format(n)` = `useArabicNumerals ? toArabic(n) : String(n)` - **no grouping, no `Intl`**

### 13.3 `useMoney()`  (`<ENG>/dist/chunk-DTWFNS3F.js:304-378`)

`{ format, parse, isValid }`.

`format(amount, options?)` - `options = { currency?, locale?, type? }`:
1. `currency` defaults to `"SAR"`; `locale` defaults to the i18n locale; `type` defaults to `"product"` (`:335-337`)
2. empty/`null` amount -> `"-"` when `type==='product'` **and** `store.settings.product.show_price_as_dash`, else `""` (`:338-341`, again `:345-348`)
3. the literal string `"-"` passes through (`:343`); `NaN` returns `String(amount)` (`:344`)
4. formats with a **cached** `Intl.NumberFormat(loc, {min/maxFractionDigits: 2})` - cache keyed
   `` `${loc}|${JSON.stringify(opts)}` `` (`:306-315`, use `:349-352`)
5. Arabic-Indic digit substitution **only when `arabic_numbers_enabled` AND the locale starts with
   `ar`** (`:353-355`)
6. **`SAR` is special-cased and returns JSX**, not a string:
   `<>{formatted} <i className="sicon-sar" /></>` (`:356-362`).
   Every other currency goes through `Intl` with `style:'currency'` (`:363-370`), falling back to
   `` `${formatted} ${currency}` `` if `Intl` throws (`:369`).
   **Consequence: `useMoney().format()` cannot be used where a string is required** (an `alt`,
   `title`, `content=` meta, JSON-LD) when the currency is SAR.
7. `parse(moneyString)` (`:316-325`) strips everything but digits/separators, understands the Arabic
   thousands (`٬`) and decimal (`٫`) marks, and handles multi-separator strings.
   `isValid(value)` (`:326-333`).

`CurrencySymbol` - `<ENG>/dist/CurrencySymbol-TARAYUOT.js:4-7` - the standalone version of the same
rule: `SAR` -> `<i className="sicon-sar" aria-hidden="true"/>`, anything else -> `<span>{currency}</span>`.
Lazy-wrapped as `LazyCurrencySymbol` (`chunk-LKBWIN26.js:16-18`).
The header repeats the rule inline, gated on `store.settings.use_sar_symbol` (`chunk-65Z2ZDKZ.js:44`)
- **note `useMoney` does NOT check `use_sar_symbol`; it always uses the icon for SAR.**
The `sicon-sar` glyph comes from the Salla icon font loaded in the root head
(`SALLA_ICONS_CSS_URL`, `chunk-QVPMWMPP.js:107`, `:301-306`).

### 13.4 `<Image>` - the engine's image component  (`<ENG>/dist/chunk-LKBWIN26.js:21-79`)

Exported from `@salla.sa/twilight-theme-engine/common`. `memo`-wrapped. Props:
`src, alt, priority=false, aspectRatio, objectFit='cover', mobileSrc, mobileBreakpoint=768,
noWrapper=false, className='', style, width, height, sizes, srcSet, srcSetWidths, ...rest`.

- Returns `null` when `!src` (`:39`)
- **srcset**: only generated when you pass `srcSetWidths: number[]` (or a literal `srcSet`) -
  `getCdnImageSrcSet(src, srcSetWidths)` (`:40`). `mobileSrc` gets its own srcset (`:41`)
- the single `src` width is `srcSetWidths.includes(width) ? width : srcSetWidths[0]`, else `width` (`:42`)
- **`height` is dropped from the CDN transform whenever a srcset exists** (`:43`) - so a fixed-ratio
  crop and a responsive srcset are mutually exclusive; use `aspectRatio` instead
- `objectFit` becomes a Tailwind class `object-<fit>` appended to `className` (`:46-47`)
- **loading/priority** (`:48`):
  - `priority: true` -> `loading="eager" fetchPriority="high" decoding="sync"`
  - `priority: false` (default) -> `loading="lazy" decoding="async"`
  - `fetchPriority` is set **only** in the priority branch; there is no `fetchpriority="low"`
- `mobileSrc` renders a `<picture>` with `<source media="(max-width: {mobileBreakpoint}px)">` (`:63-75`)
- `aspectRatio` (and not `noWrapper`) wraps in `<div className="relative overflow-hidden" style={{aspectRatio, ...style}}>` (`:77-78`).
  **When `noWrapper` or no `aspectRatio`, the `style` prop is silently dropped** (`:76`).

Engine call sites: the header logo uses `priority` with explicit dimensions -
`<Image src={store.logo} alt="… logo" priority width={120} height={48}/>` (`chunk-65Z2ZDKZ.js:96-105`);
the footer tax certificate is a raw `<img loading="lazy" decoding="async">` (`chunk-DTWFNS3F.js:858-869`).

### 13.5 The two different CDN URL builders

**(a) `getCdnImageUrl` / `getCdnImageSrcSet`** - `<ENG>/dist/chunk-SKLEJJ6M.js`,
types `<ENG>/dist/utils/cdn-image.d.ts`, subpath `@salla.sa/twilight-theme-engine/utils/cdn-image`.
For **merchant media**:
- only rewrites URLs on `cdn.salla.sa`, `cdn.salla.network`, `cdn.files.salla.network`
  (`CDN_HOSTS`, `:2`); anything else is returned untouched (`:21`)
- returns the URL unchanged when neither width nor height is given (`:25`)
- `stripCdnTransforms` first removes an existing `/cdn-cgi/image/...` prefix so transforms do not
  nest (`:4-17`, called `:26`)
- output shape:
  `https://<origin>/cdn-cgi/image/[quality=Q,]fit=scale-down,onerror=redirect,format=auto[,width=W][,height=H]<pathname><search>`
  (`:27-32`) - note `quality` is **unshifted to the front** (`:29`)
- `getCdnImageSrcSet(url, widths, opts)` (`:35-45`) maps widths to `"<url> <w>w"` and
  **bails to `undefined` if any width produced an unchanged URL** (`:40`) - i.e. a non-Salla host
  yields no srcset at all

**(b) `useAsset().cdn` / `asset`** - `<ENG>/dist/chunk-ZCH7W7DZ.js`, hook `chunk-Z653O7MX.js:4-6`,
docs `<ENG>/dist/hooks/useAsset.d.ts:1-26`. For **theme/engine static assets**:
- base `https://cdn.assets.salla.network` (`:2`) - a **different host** from the media CDN
- `cdn(url)` with an `https://` url returns it as-is (`:6`)
- no dimensions -> `${CDN_BASE}/${path}?v=${VITE_TWILIGHT_VERSION}` (`:8-11`)
- with dimensions -> `${CDN_BASE}/cdn-cgi/image/fit=scale-down[,width=W][,height=H],onerror=redirect,format=auto/${path}?v=…` (`:12-17`)
  (**different transform order from (a)**, and **no `quality` option**)
- `asset(path)` -> `/assets/${path}?v=${VITE_TWILIGHT_VERSION}` (`:19-22`)
- `isPlaceholder(url)` **always returns `false`** (`:23-25`) - a stub
- Engine use: `cdn('/images/placeholder.png')` for the VAT thumbnail (`chunk-DTWFNS3F.js:862`)

### 13.6 `RenderWhenVisible` / `LazyRenderWhenVisible`

`<ENG>/dist/RenderWhenVisible-F44J5MMG.js:12-54`, lazy handle `LazyRenderWhenVisible` at
`<ENG>/dist/chunk-LKBWIN26.js:13-15`. Props:
`{ children, rootMargin='50px', placeholder, className, id, estimatedHeight='400px', renderOnMount=false }`.

- Renders a `<section ref className id>` whose `style.minHeight` is `estimatedHeight` **until the
  child reports mounted** (`:41-47`) - that is the CLS reservation
- An `IntersectionObserver` with `{ rootMargin }` flips `visible` on first intersection and then
  **disconnects** (`:24-39`); the effect is skipped entirely when `renderOnMount` (`:25`)
- Once visible, children render inside a `<Suspense fallback={placeholder ?? <DefaultSkeleton height={estimatedHeight}/>}>`
  together with a `<MarkMounted onMount={setMounted}/>` sentinel (`:48-51`)
- `ref` is detached once visible (`:44`), so it never re-observes

This is the mechanism the Home route uses to defer below-the-fold blocks (see §4.4), and the one a
theme should reuse for any heavy custom section.

Other lazy handles exported from the same chunk (`chunk-LKBWIN26.js:6-23`):
`LazyBreadcrumb`, `LazyNoContent`, `LazyRenderWhenVisible`, `LazyCurrencySymbol`, `LazyErrorPage`,
plus the `DeferredData`/`resolveDeferred` promise helpers (`:80-168`) built on React 19's `use()`
and a `Symbol.for("twilight.deferred")` status cache (`:80-101`) - they let a route stream a
promise into JSX without a second Suspense flash.

---

## 14. Custom-code inventory (this repo)

Legend: **[scaffold]** = shipped by the Salla starter, untouched; **[project]** = written for this
theme; **[dead]** = present but imported by nothing.

### 14.1 `app/components/**`

| File | Lines | What it does | Verdict |
|---|---|---|---|
| `app/components/AnnouncementBar.tsx` | 7 | hard-coded "Free shipping on orders over 200 SAR" bar | **[scaffold, dead]** - zero importers |
| `app/components/CustomBrands.tsx` | 80 | worked example of overriding a home component; its own docblock tells you to wire it in `app/setup.ts` (a file that does not exist) | **[scaffold, dead]** |
| `app/components/CustomCartPage.tsx` | 58 | worked example wrapping `CartPage` from `/routes/cart` with extra chrome | **[scaffold, dead]** |
| `app/components/cart/AddProductToast.tsx` | 394 | full custom add-to-cart toast: product image/name/price via `useMoney`, `Link`, `useTranslation`; the largest single custom component | **[project]** |
| `app/components/cart/index.ts` | 1 | barrel re-export | [project] |
| `app/components/common/BlockHookSlot.tsx` | 27 | wraps a `HookSlot` in `<div class="s-blocks-wrapper s-before-…">` so merchant apps that target the classic storefront markup still find their injection point | **[project, dead]** - no importer yet |
| `app/components/common/routeIds.ts` | 2 | exports `PRODUCT_ROUTE_ID = '/{-$locale}/$slug/p{$id}'` | **[project, dead]** - only self-referenced |
| `app/components/common/useDialogFocus.ts` | 69 | focus trap + restore for portalled overlays (`FOCUSABLE` selector list, Escape/Tab handling) | **[project, dead]** |
| `app/components/common/useHydrated.ts` | 18 | `useSyncExternalStore` SSR-safe "am I hydrated" flag | **[project, dead]** |
| `app/components/home/Brands.tsx` | 71 | home block for `brands`; `Brand[]` + `title`/`show_all`/`position` | **[project]** - registered `app/router.tsx:23` |
| `app/components/home/CustomTestimonials.tsx` | 95 | home block; `SallaSlider` + `SallaRatingStars`, items `{avatar,name,text,stars}` | **[project]** - `app/router.tsx:25` |
| `app/components/home/EnhancedSlider.tsx` | 85 | home block; `SallaSlider`, banner fields incl. `mobile_image`, `video`, `direction[]`, `title_color` | **[project]** - `app/router.tsx:24` |
| `app/components/home/EnhancedSquareBanners.tsx` | 50 | home block; grid of `{image,url,title,description}` | **[project]** - `app/router.tsx:28` |
| `app/components/home/MainLinks.tsx` | 106 | home block; links or categories, `SallaSlider`-backed | **[project]** - registered **twice**, as `main-links` and `square-links` (`app/router.tsx:26-27`) |
| `app/components/home/SliderProductsWithHeader.tsx` | 101 | home block; fetches with `product.list` + `ProductsListSource`, renders `SallaProductsSlider` + engine `ProductCard` behind `ProductsSliderSkeleton` | **[project]** - `app/router.tsx:29` |
| `app/components/home/index.ts` | 6 | barrel for the 6 home blocks | [project] |
| `app/components/icons.tsx` | 293 | ~20 hand-drawn 24x24 stroke-1.5 SVG icon components sharing a `base` props object | **[project, dead]** - no importer anywhere in `app/` or `tests/` |
| `app/components/product/DigitalFilesSettings.tsx` | 79 | renders a digital product's `count/formats/download_period/access_new_files` | **[project]** - mounted via the `product:single.description` hook |
| `app/components/product/ProductCard.tsx` | 93 | wrapper over the engine `ProductCard`: after mount marks vertical cards `is-theme-card`, hides engine bits inline, portals a custom wishlist `SallaButton` | **[project]** - used by `SliderProductsWithHeader` and `kitchen-sink` |
| `app/components/product/index.ts` | 2 | barrel (component + props type) | [project] |

### 14.2 `app/routes/**` (33 files)

**30 of the 33 carry the `// @auto-generated` marker** and are byte-for-byte the engine's generated
scaffold: each imports a route object from `@salla.sa/twilight-theme-engine/routes/*`, wires
`loader` -> `Route.loader`, `head: withHead(X)`, `pendingComponent` -> an engine skeleton,
`component` -> a thin `Route.useLoaderData()` + `<X.Component {...data}/>` function.
**None of them import anything from `app/components/`.**

| File | Engine route it mounts |
|---|---|
| `index.tsx` (27) | `Home` + `HomeSkeleton` |
| `$slug.p$id.tsx` (28) | `Product` + `ProductDetailSkeleton` |
| `$slug.c$id.tsx` (36), `$slug.tag-$id.tsx` (36), `brands.$id.tsx` (36), `tags.$id.tsx` (36), `search.tsx` (33), `latest-products.tsx` (40), `most-sales-products.tsx` (40), `offers.tsx` (40) | `ProductListing` (9 mounts of one component) |
| `$slug.page-$id.tsx` (26) | `PageSingle` |
| `cart.tsx` (27) | `Cart` + `CartSkeleton` |
| `brands.tsx` (25) | `Brands` |
| `blog.tsx` (27), `blog_.$slug.a-$id.tsx`, `blog_.$slug.c-$id.tsx`, `blog_.$slug.tag-$id.tsx`, `blog_.author.$id.tsx` (28 each) | `Blog`, `BlogSingle`, `BlogCategoryRoute`, `BlogTagRoute`, `BlogAuthorRoute` + `BlogSkeleton` |
| `account.profile.tsx` (27), `account.settings.tsx` (27), `account.notifications.tsx` (28), `account.orders.tsx` (33), `account.orders.$id.tsx` (28), `account.wallet.tsx` (33), `account.wishlist.tsx` (33) | `/routes/account` + `/routes/account/orders` + `CustomerPageSkeleton` |
| `loyalty.tsx` (25), `testimonials.tsx` (26), `thankyou.$orderId.tsx` (26) | `Loyalty`, `Testimonials`, `ThankYou` |
| `$slug.brand-$id.tsx` (10), `pending-orders.tsx` (10) | `slugBrandRedirectLoader` / `pendingOrdersRedirectLoader` |

The three **non**-auto-generated files:

| File | Lines | What |
|---|---|---|
| `app/routes/__root.tsx` | 58 | **[project-edited]** the shell: `createTwilightRootRoute()({shellComponent})`, the `<html lang dir suppressHydrationWarning>` document, `<TwilightProvider translations={themeTranslations}>`, the dev-only `DevSettingsWidget`, `TanStackRouterDevtools` |
| `app/routes/kitchen-sink.tsx` | 387 | **[project]** dev-only component gallery: a CSS-variable ownership table (`:56-60`), radius/shadow/colour swatches, and live `SallaButton/SallaBadge/SallaAlert/SallaRatingStars/SallaQuantityInput/...` renders. Registered manually in `app/routes.ts:38` |
| `app/routes/.gitkeep` | 0 | placeholder |

### 14.3 `app/hooks`

| File | Lines | What | Verdict |
|---|---|---|---|
| `app/hooks/index.tsx` | 33 | `registerThemeHooks()` registers two handlers on `hookRegistry`: `HookName.BODY_END` -> `<AddProductToast/>` gated on `theme.settings.enable_add_product_toast`, priority 50 (`:9-17`); `HookName.PRODUCT_DESCRIPTION` -> `<DigitalFilesSettings {...product.digital_files_settings}/>` gated on the product having them, priority 50 (`:20-30`). **Line 33 calls `registerThemeHooks()` at module scope** | **[project]** |

### 14.4 App entry files (not requested, but they are where the wiring lives)

| File | Lines | What |
|---|---|---|
| `app/router.tsx` | ~50 | calls `registerThemeHooks()` (`:17`), then `registerHomeComponents({...DefaultHomeComponents, brands, 'enhanced-slider', 'custom-testimonials', 'main-links', 'square-links', 'slider-products-with-header', 'enhanced-square-banners'})` (`:19-29`), then a `getRouter()` that memoises a single client router to keep the QueryClient cache across navigations (`:31-53`) |
| `app/routes.ts` | 39 | virtual-file-routes list; **only entry is `route('/kitchen-sink', 'kitchen-sink.tsx')`** (`:38`); the rest is the scaffold's docblock explaining "Do NOT prefix your custom route file with `// @auto-generated` or the engine will overwrite it" (`:10-11`) |
| `app/client.tsx` | 15 | `initThemeSentry('raed')` (`:6`) then `hydrateRoot(document, <StrictMode><StartClient/></StrictMode>)` inside `startTransition` |
| `app/server.ts` | 4 | `export default withThemeSentry(handler, 'raed')` |
| `app/start.ts` | 1+ | `createStart(...)` |
| `app/routeTree.gen.ts` | ~300 | **fully generated** by the TanStack router plugin - never edit |

### 14.5 `app/styles/**` (top level)

| Entry | What |
|---|---|
| `app/styles/app.css` (42) | **[project]** the real entry, imported by `app/routes/__root.tsx:11`. Order: `./tokens.css` -> `tailwindcss/base|components|utilities` -> `./app.scss`. Then `[dir="rtl"]{--font-main:var(--font-ar)}` (`:11-13`), `body{font-family:var(--font-main)}` (`:15-17`), `html{scrollbar-gutter:stable}` (`:26-28`), a scroll lock on `body.menu-opened, body.modal-is-open` (`:31-34`) keyed to the classes the engine's `MobileMenu` and `salla-modal` add, and `.app-inner{overflow-x:clip}` |
| `app/styles/tokens.css` (33) | **[project]** the brand token layer, with a long comment explaining that the names are dictated by `@salla.sa/twilight-tailwind-theme` (`index.js:192-195`): `--font-main`, `--font-ar`, `--color-primary: #EE4D22`, `--color-primary-dark: #C93D18`, `--color-primary-light`, `--color-primary-reverse`, `--color-primary-rgb: 238, 77, 34` (hand-kept in sync) |
| `app/styles/app.scss` (89) | **[scaffold]** the ITCSS manifest - a long index comment plus ~35 `@import` lines; explicitly notes "Tailwind directives are in app.css, not here" |
| `app/styles/01-settings/` | 3 files - `fonts.scss`, `global.scss`, `breakpoints.scss` |
| `app/styles/02-generic/` | 7 files - `_mixins`, `reset`, `common` (10.6 KB, the biggest), `tooltip`, `animations`, `rtl`, `ltr` |
| `app/styles/03-elements/` | 4 files - `buttons` (6.1 KB), `form`, `radio`, `radio-images` |
| `app/styles/04-components/` | 15 files - `home-blocks` (9.9 KB), `product` (8.3 KB), `menus` (5.1 KB), `header` (5.0 KB), `slider`, `add-product-toast`, `user-pages`, `loyalty`, `user-menu`, `virtooal`, `brands`, `footer`, `no-content-placeholder`, `gifting`, and an **empty `filters.scss`** |
| `app/styles/05-utilities/` | 4 files - `chat-bots`, `swal`, `safari-fixes`, `font-customization` |

All of `01-` .. `05-` are the Raed scaffold's SCSS, dated with the initial checkout; only
`tokens.css` and the top of `app.css` carry project edits.

### 14.6 `tests/**`

| File | Lines | What | Verdict |
|---|---|---|---|
| `tests/setup.tsx` | 77 | vitest setup: `cleanup()` after each test, plus `vi.mock` stubs for the engine sub-path modules and the `salla-*` custom elements | **[project]** |
| `tests/components/home/Brands.test.tsx` | 70 | renders `Brands` with mocked `/i18n` | [project] |
| `tests/components/home/CustomTestimonials.test.tsx` | 67 | mocks the engine root, renders the testimonials block | [project] |
| `tests/components/home/EnhancedSlider.test.tsx` | 65 | renders the slider with 2 mock slides, no mocks needed | [project] |
| `tests/components/home/EnhancedSquareBanners.test.tsx` | 81 | mocks `/common`'s `Link`, renders banners | [project] |
| `tests/components/home/MainLinks.test.tsx` | 77 | mocks `/common`'s `Link`, renders links | [project] |
| `tests/components/home/SliderProductsWithHeader.test.tsx` | 98 | mocks `/api/product`'s `product.list`, asserts the slider | [project] |
| `tests/components/product/ProductCard.test.tsx` | 130 | the most substantial test - drives a fake wishlist store and asserts the image-corner wishlist button only renders for `!isHorizontal && !isFullImage`, mirroring the engine's own conditional | [project] |

**7 test files, all covering the 6 home blocks plus `ProductCard`.** Nothing covers
`AddProductToast` (394 lines), `useDialogFocus`, `useHydrated`, `BlockHookSlot`,
`DigitalFilesSettings`, or `app/hooks/index.tsx`.

---

## 15. Constraints and gotchas for an implementer

### 15.1 Shadow DOM vs light DOM - Tailwind DOES reach inside (almost everywhere)

Grepping `encapsulation` across `<TC>/dist/collection/components/**` returns **exactly two files**:

| Component | Line |
|---|---|
| `salla-hook` | `<TC>/dist/collection/components/salla-hook/salla-hook.js:26` - `static get encapsulation() { return "shadow"; }` |
| `salla-multiple-bundle-product-options-modal` | `<TC>/dist/collection/components/salla-multiple-bundle-product/components/salla-multiple-bundle-product-options-modal.js:494` |

**Every other `salla-*` element renders into the light DOM.** So your Tailwind utilities, your
`app/styles/04-components/*.scss`, and the engine's `border-radius: DEFAULT` all apply *inside*
`salla-product-card`, `salla-button`, `salla-menu`, `salla-modal`, etc. That is exactly what
`tailwind.config.cjs:6-11` is exploiting by globbing
`./node_modules/@salla.sa/twilight-theme-engine/dist/**/*.js` into `content` - and what the
`borderRadius.DEFAULT` comment in `tailwind.config.cjs` means by "274 call sites … 196 in the engine".

The two shadow components are the ones you cannot style from outside. `salla-hook` being shadowed
matters: content that merchant apps inject through `<salla-hook name="…">` is **isolated from your
CSS**. Note also that Lit (not Stencil) is loaded via the import map for some components
(`LIT_IMPORTS`, `<ENG>/dist/chunk-QVPMWMPP.js:110-119`), and Lit's `ReactiveElement` always calls
`attachShadow` - so anything built on Lit rather than Stencil is shadowed too.

### 15.2 The `s-*` safelist

`@salla.sa/twilight-tailwind-theme/safe-list-css.txt` - **2554 lines, 1888 distinct `s-*` class
names**, one selector per line, plus **36 non-`s-` selectors** (`text-danger`, `flatpickr-*`,
`filepond--root`, `salla-modals-order-cancel-modal .s-modal-*`, gift-step state selectors, ...).
It is wired into `content` (not `safelist`) at `tailwind.config.cjs:10`, which is why Tailwind
keeps the utilities those class names compose.

**Consequences:**
- Do not rename or "clean up" `s-*` classes in your markup - the engine's own CSS and the web
  components both key off them.
- Removing that content line shrinks CSS but silently drops styles on pages you did not click
  through (this repo's `BUILD.md:506` records the same warning and prescribes the A/B test).
- The safelist is a flat text file, so anything you add to it has to be a literal selector.

### 15.3 SSR / hydration rules

**`webHydrationPlugin()`** - `<ENG>/dist/vite/index.js:55-101`, doc
`<ENG>/dist/vite/plugins/salla-hydration.plugin.d.ts:1-11`, registered 6th (`:2475`):
- runs `enforce: 'pre'` on every `.jsx`/`.tsx` (`:60`) that contains `<salla-…` or `<custom-…` (`:61`)
- hand-parses the JSX tag (brace-depth aware, `:68-83`) and **injects `suppressHydrationWarning`
  into every such tag** unless already present (`:85-93`)
- rationale in the doc comment: Stencil adds `class="hydrated"` and may inject light-DOM content
  after parse but before `hydrateRoot`
- **It only rewrites literal JSX tags in your source.** React-wrapper usage (`<SallaMenu/>`) is not
  matched - the engine adds `suppressHydrationWarning` by hand where it matters
  (`chunk-65Z2ZDKZ.js:53`, `chunk-DTWFNS3F.js:957`, `:964`, `chunk-WITIL2MK.js:450`).

**`useIsClient()`** - `<ENG>/dist/chunk-Q7VWURUR.js:7-11`, exported
`@salla.sa/twilight-theme-engine/hooks` (`hooks/index.js:31`, `hooks/index.d.ts:22`):
the classic `useState(false)` + `useEffect(()=>setIsClient(true))`. Used inside `HookSlot` (`:41`)
to decide whether to emit the `<salla-hook>` element: `shouldRenderSallaHook = ssr || isClient`
(`:52`). **So a `HookSlot` without `ssr: true` renders no `salla-hook` tag on the server** - the
engine passes `ssr: true` only for the three head slots (`chunk-RJPPO3ET.js:25-27`).
This theme has its own equivalent, `app/components/common/useHydrated.ts`, built on
`useSyncExternalStore` (no extra render).

**`HydrationBoundary`** - `<CR>/dist/hydration/HydrationBoundary.js:24-60`,
types `<CR>/dist/types/hydration/HydrationBoundary.d.ts:2-10`. Props
`{children, fallback=null, eventTriggered=false, forceHydrate=false, rootMargin='200px', _debugName}`.
- wraps children in a `<div suppressHydrationWarning>` with `style={{width:'100%'}}` while unhydrated (`:59`)
- hydrates on `react-intersection-observer` `inView` with `triggerOnce` (`:31-35`, `:47-49`),
  or immediately when `forceHydrate`/`eventTriggered`/**no fallback** (`:37-46`)
- `eventTriggered: true` -> renders `null` until `isClient` and skips the wrapper div entirely (`:56-58`)
- a `HydrationErrorBoundary` class swallows render errors and shows the fallback (`:5-22`)

**`withDeferredHydration(Component, name, options?)`** - `<CR>/dist/hydration/withDeferredHydration.js:130-145`.
Every one of the 126 wrappers is passed through it. It is a **no-op unless the name is in the
`clientOnlyComponents` map** (`:26-110`, ~75 entries) - which assigns each a skeleton and/or
`eventTriggered`:
- `eventTriggered: true` (render nothing until an SDK event opens them): `SallaLoginModal`,
  `SallaLocalizationModal`, `SallaOfferModal`, `SallaRatingModal`,
  `SallaMultipleBundleProductOptionsModal`, `SallaScopes`, `SallaGifting`
- skeleton-gated below-the-fold: `SallaSlider`->`BackgroundSliderSkeleton`,
  `SallaProductCard`->`ProductCardSkeleton`, `SallaMenu`->`MenuColumnSkeleton`,
  `SallaSearch`->`SearchSkeleton`, `SallaAddProductButton`->`ButtonSkeleton`, ... (full map at `:26-110`)
- `SallaUserMenu` picks its skeleton from props: `props.avatarOnly ? 'CircleSkeleton' : 'MenuIconSkeleton'` (`:51`)
- entries with `{skeleton: null}` (e.g. `SallaAdvertisement`, `SallaMap`, `SallaTrustBadges`,
  `SallaCookiesBar`) hydrate **immediately** - `HydrationBoundary` short-circuits when `!fallback`
  (`HydrationBoundary.js:42-45`)
- a `WebComponentErrorBoundary` (`:112-129`) catches Stencil errors so an SDK failure does not
  remount the whole router tree
- **`salla-hook` is deliberately commented out of the map** (`:109`)

**Known open defect (recorded in this repo).** `BUILD.md:549-563`: every production page fails
hydration with React #418 and the SSR tree is discarded. Root cause cited:
`<ENG>/dist/chunk-QVPMWMPP.js:497` (`hydrateTwilightContext` finds no root match, bails via
`warnHydrationBail`, which is `import.meta.env.DEV`-gated at `:493-497` so production is silent),
then `<ENG>/dist/chunk-DTWFNS3F.js:130` seeds `isReady=false` on the client while the server had
`true`, and `chunk-DTWFNS3F.js:1249` renders the `loading-overlay` as a **conditional child**, so
the children array changes shape. BUILD.md also records that no theme-side fix exists
(`hydrateTwilightContext`/`updateTwilightContext` are not exported) and that the `<head>` style
mismatch is a red herring. **Treat SSR as unavailable when budgeting LCP work.**

### 15.4 Virtual modules - exactly two

| Module | Plugin | Behaviour |
|---|---|---|
| `virtual:twilight/theme-translations` | `themeTranslationsPlugin(localesDir)` - `<ENG>/dist/vite/index.js:103-155` | build-time inline of `locales/*.json` keyed `'<locale>.trans'`; HMR on change/add only |
| `virtual:twilight/schema` | `twilightSchemaPlugin(twilightJson)` - `<ENG>/dist/vite/index.js:304-360` | dev-only; **always the empty schema in a production build** (`:341`) |

There are no others (a grep of `<ENG>/dist` for `virtual:` finds only these two). Both need a
`declare module` for TypeScript; this theme imports them at `app/routes/__root.tsx:8-9`.
`localesDir: './locales'` is set in `vite.config.ts:11`.

### 15.5 The `// @auto-generated` overwrite rule

`tanstackAdapter.generateRouteFiles` - `<ENG>/dist/vite/index.js:2379-2393`, and it runs **twice
per config load** (once directly at `createPlugins`, `:2405`, and again inside the plugin's
`config()` hook, `:2413-2416`):

```js
if (!existsSync(filePath)) { writeFileSync(filePath, content); log("Created"); }
else {
  const existing = readFileSync(filePath, "utf-8");
  if (existing.startsWith("// @auto-generated") && existing !== content) {
    writeFileSync(filePath, content); log("Updated");     // :2387-2391
  }
}
```

**The check is `startsWith`, on the very first bytes.** So:
- a route file whose first line is `// @auto-generated` is **silently rewritten on every
  `vite dev`/`vite build`** the moment the engine's template changes - 30 of this repo's 33 route
  files are in that state
- **to own a route, delete that first line** (the scaffold says so at `app/routes.ts:10-11`)
- a leading blank line, BOM, or license header defeats the marker - and also defeats any future
  engine fix landing in your file
- engine-owned routes under `<ENG>/.twilight/` (`$locale.tsx`, `account.tsx`,
  `redirect.$type.$id.tsx`) are rewritten **unconditionally** whenever they differ (`:2368-2377`) -
  never edit them; they live in `node_modules` and are recreated anyway

### 15.6 `registerThemeHooks()` is called twice

- `app/hooks/index.tsx:33` - `registerThemeHooks();` at module scope, with the comment
  "Auto-register on module load"
- `app/router.tsx:17` - `registerThemeHooks();` again, explicitly

Both hit `hookRegistry.register(HookName.BODY_END, ..., 50)` and
`hookRegistry.register(HookName.PRODUCT_DESCRIPTION, ..., 50)`.

**Confirmed: this duplicates.** `HookRegistry.register` is a plain push with a fresh auto-increment
id and **no dedupe of any kind** - `<ENG>/dist/chunk-GU2KUQVD.js:7-14`:
`handlers.push({ id: this.nextId++, handler, priority })` (`:11`), then a priority sort (`:12`).
`HookSlot` renders one `HookHandlerComponent` per entry, keyed on `def.id`
(`<ENG>/dist/chunk-Q7VWURUR.js:51`). So the storefront renders **two `<AddProductToast/>` and two
`<DigitalFilesSettings/>`**.
Fix: delete one of the two call sites (the module-scope one in `app/hooks/index.tsx:33` is the
surprising one - importing the module for its types would fire it).

### 15.7 `withThemeSentry(handler, 'raed')` / `initThemeSentry('raed')`

- `app/server.ts:4` - `export default withThemeSentry(handler, 'raed')`
- `app/client.tsx:6` - `initThemeSentry('raed')`

`'raed'` is the **theme id used for Sentry tagging**, inherited verbatim from the Raed scaffold and
never changed to `optimalx`. Per `<ENG>/dist/sentry/server.d.ts:4-11` it is the value that decides:
- the Sentry project/service name `twilight-theme-<theme>`
- the `theme` tag on every event (alongside `source`, and a `store` tag derived from the request host)
- `beforeSend` "only enriches - it never drops events"

Both are **no-ops unless a DSN is set** (`VITE_SENTRY_DSN` at build time, or runtime `SENTRY_DSN`
on the server - `sentry/client.d.ts:1-7`, `sentry/server.d.ts:6-7`). `twilight.json` also still
carries `"repository": "https://github.com/SallaApp/theme-raed"`. **If Sentry is ever switched on,
this theme's errors land in Raed's bucket** - change both strings together.

### 15.8 Other things worth knowing before you build

1. **`useMoney().format()` returns JSX for SAR** (§13.3) - never feed it to an attribute or JSON-LD.
2. **`applyTheme` writes inline styles on `<html>` after hydration** (§10.7) - it outranks every
   stylesheet, so brand overrides must be planned around it, and there is a first-paint colour flash.
3. **`darkMode: 'class'` is configured but nothing adds `.dark`** (§13.1) - `dark:` utilities are dead
   as shipped.
4. **The locale prefix is a redirect, not a rewrite** (§8.2) and the canonical disagrees with it (§8.7).
5. **`header_layout` / `footer_layout` are typed but never read** (§10.5) - layout variants are yours to build.
6. **`conditions` in `twilight.json` is dashboard-only** (§11.3) - the dev widget ignores it.
7. **`defaultNS` is `app` (the CDN bundle), not your theme** (§12.3) - 14 of this repo's 48 locale
   keys are shadowed by Salla's.
8. `vite.config.ts:26-35` **dedupes** `react`, `react-dom`, `react/jsx-runtime`,
   `@tanstack/react-router`, `@tanstack/react-query`, `react-i18next`, `i18next` - without it pnpm's
   strict layout resolves a second copy and you get "No QueryClient set".
9. `vite.config.ts:86` marks `@salla.sa/twilight-components` **external** - the custom elements come
   from the CDN module (`resolveTwilightSdkUrl`, `<ENG>/dist/chunk-QVPMWMPP.js:123-131`), never from
   your bundle. A default dev SDK URL is pinned to a commit hash (`:122`).
10. **Stale SSR optimizer trap** documented at `vite.config.ts:55-70`: editing `vite.config.ts`
    rotates the dep `browserHash`, the workerd runner keeps the old `?v=` URL and dies; `optimizeDeps.exclude`
    is a no-op because the Cloudflare plugin's `include` wins. Recovery is `pnpm dev:fresh`.
11. **`TanStackRouterDevtools` is not gated** - `app/routes/__root.tsx:8`, `:48` render it
    unconditionally, unlike `DevSettingsWidget` which is behind `import.meta.env.DEV` (`:16-20`).
12. `isPlaceholder(url)` from `useAsset()` **always returns `false`** (`<ENG>/dist/chunk-ZCH7W7DZ.js:23-25`).
13. The engine calls `registerDefaultHooks()` at **module scope** too
    (`<ENG>/dist/chunk-DTWFNS3F.js:816`), registering 7 default handlers (`:807-815`) - your
    `body:start`/`body:end` handlers share those slots with GTM (priority 100), Sift (90) and the
    store-closed notice (80).
14. `<TwilightProvider>` accepts `layout`, `skeleton`, `toast`, `toastMobilePosition`,
    `addToCartToast`, `routeClass`, `client`, `debug`, `onReady`, `onError`, `translations`
    (`<ENG>/dist/chunk-DTWFNS3F.js:1075-1089`) - **this theme passes only `translations`**, so
    `layout` is still `MasterLayout` and the Header/Footer are Salla's.
15. `RouteId` semantics and the `<body>` route class only exist for routes under `{-$locale}`
    (§8.5); a custom route like `/kitchen-sink` gets neither.
16. **`SallaSlider` and `SallaButton` mean different components depending on the import path** (§9.0) -
    root barrel = native React, `/slider` and `/button` subpaths = the web-component wrappers,
    except `/button` which is *also* mapped to the native one in `<CR>/package.json:26-29`.
