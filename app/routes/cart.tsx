import { createFileRoute } from '@tanstack/react-router';
import { Cart } from '@salla.sa/twilight-theme-engine/routes/cart';
import type { CartPageProps } from '@salla.sa/twilight-theme-engine/routes/cart';
import { CartSkeleton } from '@salla.sa/twilight-theme-engine/skeleton';
import { withHead } from '@salla.sa/twilight-theme-engine/tanstack';
import { CartContextProvider } from '@salla.sa/twilight-theme-engine/contexts';
import { CartEmpty } from '../components/commerce/CartEmpty';
import { CheckoutBar } from '../components/commerce/CheckoutBar';
import { useCartData } from '../components/commerce/useCartData';
import { commerceHeadExtend } from '../components/commerce/head';

/**
 * The cart (DIRECTION 6.9). The engine page is wrapped, never rebuilt: the
 * rows, the quantity inputs, the coupon field, the totals and the checkout
 * submit all stay Salla's, and this file adds three things around them.
 *
 *  1. `CartContextProvider`. The engine exports it and documents it
 *     (contexts/CartContext.d.ts:11-20) but mounts it nowhere, so every
 *     `cart:*` hook handler would otherwise see a null context. Mounting it
 *     here is what lets `CartHeader` at `cart:start` and `CartTrust` at
 *     `cart:items.end` read the cart: the title row's item count and the
 *     free-shipping bar both come from it.
 *  2. The empty state. The engine renders its own `NoContent` with a "Back to
 *     Home" button; FINAL-content 6.5 routes the visitor to their goal, to the
 *     type list, or to a free written question instead.
 *  3. The mobile checkout bar, fixed at the bottom below 1024.
 *
 * The cart is read with the engine's own query key (see `useCartData`), so
 * the wrapper and the engine page share one request.
 *
 * Head: `noindex, follow` and the C12 canonical correction. No JSON-LD: a
 * cart is not a document search engines should hold, and the engine
 * `Breadcrumb` inside the page emits the one BreadcrumbList (C11).
 */
export const Route = createFileRoute('/{-$locale}/cart')({
  loader: ({ params }): Promise<CartPageProps> => Cart.loader({ locale: params.locale }),
  head: withHead(Cart, commerceHeadExtend({ noindex: true })),
  pendingComponent: () => <CartSkeleton />,
  component: CartComponent,
});

function CartComponent() {
  const data: CartPageProps = Route.useLoaderData();
  const { cart, loading } = useCartData();

  if (loading) return <CartSkeleton />;
  if (!cart || cart.items.length === 0) {
    return (
      <div className="ox-cart ox-cart--empty">
        <div className="ox-container">
          <CartEmpty />
        </div>
      </div>
    );
  }

  return (
    <div className="ox-cart">
      <CartContextProvider value={{ cart }}>
        <Cart.Component {...data} />
      </CartContextProvider>
      <CheckoutBar cart={cart} />
    </div>
  );
}
