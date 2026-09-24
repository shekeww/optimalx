# React Doctor false positives, theme-custom

Each entry is suppressed at its own line with
`// react-doctor-disable-next-line <plugin>/<rule>`, with the reason in a comment above it.
The suppression is per line, not per file, so a genuine case added to the same file later still
gets reported. The engine keeps its own list in `packages/theme-engine/.react-doctor/`.

**Why not `doctor.config.json`.** React Doctor scans `packages/theme-custom` as a project of its
own and matches paths relative to it (`app/components/...`). An `ignore.overrides` entry in the
repo-root config with a `**/theme-custom/app/components/...` glob therefore never matched. Checked
on PR #308 with react-doctor 0.9.14.

## react-doctor/prefer-html-dialog

- `app/components/common/BottomSheet.tsx`
- `app/components/layout/HeaderNav.tsx`

The rule's concern is that a `role="dialog"` wrapper lets keyboard users tab out. Both call
`useDialogFocus`, which moves focus in on open, wraps Tab and Shift+Tab inside the panel, and
restores focus to the trigger on close. Both also close on Escape. They are portalled overlays
with theme-owned enter/exit transitions (`mounted`/`entered`), which `showModal()` would not
preserve.

## react-doctor/no-array-index-as-key

- `app/components/common/TestimonialsCarousel.tsx`
- `app/components/home/EnhancedSquareBanners.tsx`
- `app/components/home/MainLinks.tsx`

The rule warns that index keys break when a list reorders or filters. These lists do neither:
they render arrays from the merchant's home-component settings unchanged. Their item types
(`TestimonialItem`, `BannerItem`, `LinkItem`, `Category`) have no `id` or `slug`, and a
content-derived key (image, url, name) can repeat, which would produce duplicate keys.
`MainLinks` already keys by url where one exists.

## react-doctor/no-pass-data-to-parent

- `app/components/product/ProductListPage.tsx` (`usePref`). No parent is involved. The hook
  reads a stored toolbar preference from `localStorage` after mount, into its own state, so the
  server render and the first client render agree.

## Resolved in code, not suppressed

- `react-doctor/effect-needs-cleanup` in `app/components/cart/AddProductToast.tsx` and
  `app/components/layout/MobileBottomBar.tsx`. Both cleanups already removed their listeners, but
  each subscribed through one variable (`event.on`, `sdk.event.on`) and unsubscribed through
  another (`boundTo.off`, `subscribed.event.off`). The rule pairs `on` with `off` by receiver, so
  both now subscribe through the reference the cleanup uses. In `AddProductToast` that also fixed
  a real gap: its cleanup used to look `window.salla.event` up again, which after an SDK re-init
  is a different emitter.
