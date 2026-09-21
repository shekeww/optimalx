import type { Product, ProductOption, ProductOptionValue } from '@salla.sa/twilight-theme-engine/types';

/**
 * The option types worth putting on a card. A card has room for one row of
 * chips, not a textarea, a date picker or a file upload, and a shopper who has
 * to type something is a shopper who belongs on the product page.
 */
const CHIPPABLE = new Set(['radio', 'select', 'color', 'image']);

/** Salla's own field name for an option. Never invent this; it is the contract. */
export function optionFieldName(optionId: number | string): string {
  return `options[${optionId}]`;
}

/**
 * The one option a card may show, or null.
 *
 * ONE, not all of them. A product with a flavour AND a size AND a bundle count
 * cannot be chosen correctly in a 274px row, and a half-chosen product is worse
 * than an honest trip to the product page: Salla requires every required option
 * before it will add. So a card offers the chooser only when there is exactly
 * one required, chippable option with two or more values, and otherwise falls
 * back to "اختر الخيارات" pointing at the page, which is what it does today.
 */
export function cardOption(product: Product): ProductOption | null {
  const options = product.options;
  if (!Array.isArray(options) || options.length !== 1) return null;
  const option = options[0];
  if (!option || !CHIPPABLE.has(option.type)) return null;
  const values = option.values;
  if (!Array.isArray(values) || values.length < 2) return null;
  return option;
}

/** The value a card starts on: the platform's own default, else the first. */
export function defaultValueId(option: ProductOption): number | string | null {
  const values = option.values ?? [];
  const selected = values.find((v) => v.is_selected);
  return (selected ?? values[0])?.id ?? null;
}

export interface VariantChipsProps {
  option: ProductOption;
  /** Scopes the radio ids, so two cards for one product cannot cross-wire. */
  uid: string;
  value: number | string | null;
  onChange: (valueId: number | string) => void;
}

/**
 * The card's variant chooser: one row of radio chips carrying SALLA'S OWN field
 * names, so the choice reaches the cart through Salla's own path.
 *
 * ## Why our chips and not `salla-product-options`
 *
 * Two reasons, both measured. First, the listing payload sends
 * `option.values[]` while every renderer inside `salla-product-options` reads
 * `option.details[]`, so handing it the data a grid actually has blanks the
 * component; the alternative is letting it fetch, which costs one request per
 * card that has options. Second, the component draws the product page's full
 * chooser, which does not fit a card.
 *
 * What matters is not who draws the control but what it is NAMED. Salla builds
 * its request from `new FormData(form)`, and its own inputs are named
 * `options[<option_id>]` with the value id as the value. These chips use that
 * exact contract, so the POST this card produces is byte-for-byte the one the
 * product page produces. Nothing here calls the cart.
 *
 * ## Colour is a name here, not a swatch
 *
 * The listing payload carries no hex and no image for a value — only an id, a
 * name and a price. Painting a swatch would mean inventing the colour, so the
 * chip shows the name the merchant typed. When Salla starts sending a colour or
 * an image on the listing shape, a swatch can replace the label without
 * touching the field contract.
 */
export function VariantChips({ option, uid, value, onChange }: VariantChipsProps) {
  const values: ProductOptionValue[] = option.values ?? [];
  const name = optionFieldName(option.id);

  return (
    <fieldset className="ox-card-product__variants">
      {/* The option's own name, from the merchant's data — "اللون", "النكهة".
          Screen-reader only: the chips are self-describing on screen, and a
          card in a grid has no room for a second label row. */}
      <legend className="ox-sr-only">{option.name}</legend>
      {values.map((v) => {
        const id = `${uid}-${option.id}-${v.id}`;
        return (
          <label className="ox-chip" key={v.id} htmlFor={id}>
            <input
              className="ox-chip__input"
              type="radio"
              id={id}
              name={name}
              value={String(v.id)}
              required
              checked={String(value) === String(v.id)}
              onChange={() => onChange(v.id)}
            />
            <span className="ox-chip__label">{v.name}</span>
          </label>
        );
      })}
    </fieldset>
  );
}

export default VariantChips;
