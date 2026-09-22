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

/**
 * At most this many swatches draw before the row folds the rest into a "+N"
 * pill: at the card's own padding (`var(--ox-4)`, 16px each side) a 173px
 * phone cell leaves 141px of row, and five 24px circles at a 4px gap (the
 * fourth swatch plus the pill) measure 136px - the fifth real swatch would
 * not have left room for the count beside it.
 */
const MAX_VISIBLE = 4;

export interface VariantChipsProps {
  /** Null reserves the row's own height with nothing to choose - most cards. */
  option: ProductOption | null;
  /** Scopes the radio ids, so two cards for one product cannot cross-wire. */
  uid: string;
  value: number | string | null;
  onChange: (valueId: number | string) => void;
}

type SwatchFill = { kind: 'color'; value: string } | { kind: 'image'; value: string };

/** A trimmed non-empty string, or null. */
function trimmed(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const out = value.trim();
  return out.length > 0 ? out : null;
}

/**
 * The value's own fill, when the engine carries one.
 *
 * `ProductOptionValue` - the shape the LISTING payload sends as
 * `option.values[]` - types only `image` / `image_url` today, never a colour:
 * the listing endpoint sends a value's NAME and no hex. `color` / `hex` are
 * read anyway, defensively, in case a future payload (or the `details[]`
 * shape a product-detail request carries) puts one there; the swatch simply
 * falls back to the value's own uploaded image, then to a neutral circle with
 * the value's first letter, when nothing above carries one.
 */
function swatchFill(value: ProductOptionValue): SwatchFill | null {
  const raw = value as unknown as Record<string, unknown>;
  const color = trimmed(raw.color) ?? trimmed(raw.hex);
  if (color !== null) return { kind: 'color', value: color };
  const image = trimmed(value.image_url) ?? trimmed(value.image);
  if (image !== null) return { kind: 'image', value: image };
  return null;
}

/** The first character of a trimmed name, or '' when there is nothing to show. */
function firstLetter(name: string): string {
  const out = name.trim();
  return out.length > 0 ? out[0] : '';
}

/**
 * The card's variant chooser: one row of swatch circles carrying SALLA'S OWN
 * field names, so the choice reaches the cart through Salla's own path.
 *
 * ## Why our swatches and not `salla-product-options`
 *
 * Two reasons, both measured. First, the listing payload sends
 * `option.values[]` while every renderer inside `salla-product-options` reads
 * `option.details[]`, so handing it the data a grid actually has blanks the
 * component; the alternative is letting it fetch, which costs one request per
 * card that has options. Second, the component draws the product page's full
 * chooser, which does not fit a card.
 *
 * ## The row is reserved, not conditional
 *
 * `option === null` still returns a box at the row's own height: most cards in
 * this catalogue carry no chippable option, and without that empty box those
 * cards rendered one row shorter than the one that does (today, the shaker),
 * which is what made a grid of cards ragged. Radio semantics stay real for the
 * chosen state too: a genuine `<input type="radio">`, keyboard-reachable and
 * carrying `aria-checked` alongside its native `checked`, under a real
 * `<label>` - never a `<button>` standing in for one.
 */
export function VariantChips({ option, uid, value, onChange }: VariantChipsProps) {
  if (option === null) {
    return <div className="ox-card-product__variants" aria-hidden="true" />;
  }

  const values: ProductOptionValue[] = option.values ?? [];
  const name = optionFieldName(option.id);
  const visible = values.slice(0, MAX_VISIBLE);
  const hiddenCount = values.length - visible.length;

  return (
    <fieldset className="ox-card-product__variants">
      {/* The option's own name, from the merchant's data — "اللون", "النكهة".
          Screen-reader only: the swatches are self-describing on screen, and a
          card in a grid has no room for a second label row. */}
      <legend className="ox-sr-only">{option.name}</legend>
      {visible.map((v) => {
        const id = `${uid}-${option.id}-${v.id}`;
        const fill = swatchFill(v);
        const checked = String(value) === String(v.id);
        return (
          <label className="ox-swatch" key={v.id} htmlFor={id}>
            <input
              className="ox-swatch__input"
              type="radio"
              id={id}
              name={name}
              value={String(v.id)}
              required
              checked={checked}
              aria-checked={checked}
              onChange={() => onChange(v.id)}
            />
            <span
              className="ox-swatch__face"
              aria-hidden="true"
              style={
                fill?.kind === 'color'
                  ? { ['--ox-swatch' as string]: fill.value }
                  : fill?.kind === 'image'
                    ? { backgroundImage: `url(${fill.value})` }
                    : undefined
              }
            >
              {fill === null ? firstLetter(v.name) : null}
            </span>
            <span className="ox-sr-only">{v.name}</span>
          </label>
        );
      })}
      {hiddenCount > 0 ? (
        <span className="ox-card-product__variant-more" aria-hidden="true">
          {'+' + hiddenCount}
        </span>
      ) : null}
    </fieldset>
  );
}

export default VariantChips;
