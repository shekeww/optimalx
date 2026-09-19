import { hookRegistry, HookName, type HookContext } from '@salla.sa/twilight-theme-engine/hooks';
import type { Product } from '@salla.sa/twilight-theme-engine/types';
import { AddProductToast } from '../components/cart';
import { DigitalFilesSettings } from '../components/product';

export function registerThemeHooks() {
  // Register AddProductToast at body:end hook slot
  // Only renders when theme.settings.enable_add_product_toast is true
  hookRegistry.register(
    HookName.BODY_END,
    (context: HookContext) => {
      const { twilight } = context;
      if (!twilight?.theme?.settings?.enable_add_product_toast) return null;
      return <AddProductToast />;
    },
    50
  );

  // Register DigitalFilesSettings at the product:single.description hook slot.
  // The engine's own ProductPage passes no context to any of its eleven slots
  // (dist/routes/product.js:85-117), so this handler never fired. Our
  // ProductPage renders the same slots with `context={{ product }}`
  // (PLAN-final C4), which is what makes `context.product` available here.
  hookRegistry.register(
    HookName.PRODUCT_DESCRIPTION,
    (context: HookContext) => {
      const { product } = context as { product?: Product };
      if (!product?.digital_files_settings) return null;
      return <DigitalFilesSettings {...product.digital_files_settings} />;
    },
    50
  );
}
