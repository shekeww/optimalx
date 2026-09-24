import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { fireEvent } from '@testing-library/react';
import { renderWithProviders } from '../helpers/render';
import type { ProductOption } from '@salla.sa/twilight-theme-engine/types';

const { VariantChips, NAMED_COLORS, namedColor, valueImageUrl } = await import(
  '../../app/components/product/VariantChips'
);

/** Every Arabic key the table holds, a run/script check, not a fixed list. */
const ARABIC_COLOR_NAMES = Object.keys(NAMED_COLORS).filter((key) => /[؀-ۿ]/.test(key));

function makeOption(overrides: Partial<ProductOption> = {}): ProductOption {
  return {
    id: 1,
    name: 'اللون',
    type: 'color',
    values: [
      { id: 11, name: 'أسود', color: '#111111' } as never,
      { id: 12, name: 'أبيض' } as never,
      { id: 13, name: 'أخضر', image: 'https://cdn.test/green.jpg' } as never,
      { id: 14, name: 'أزرق' } as never,
      { id: 15, name: 'أحمر' } as never,
      { id: 16, name: 'بني' } as never,
    ],
    ...overrides,
  } as never;
}

describe('VariantChips', () => {
  it('reserves the row height with an empty box when the card has no option', () => {
    const { container } = renderWithProviders(
      <VariantChips option={null} uid="oxcard-1" value={null} onChange={vi.fn()} />

    );
    const row = container.querySelector('.ox-card-product__variants');
    expect(row).not.toBeNull();
    expect(row?.querySelector('input')).toBeNull();
    expect(row?.textContent).toBe('');
  });

  it('draws a swatch circle per value, radio semantics kept', () => {
    const { container } = renderWithProviders(
      <VariantChips option={makeOption()} uid="oxcard-1" value={11} onChange={vi.fn()} />

    );
    const inputs = container.querySelectorAll<HTMLInputElement>('.ox-swatch__input');
    // At most four values show as real swatches; the rest fold into +N.
    expect(inputs.length).toBe(4);
    inputs.forEach((input) => expect(input.type).toBe('radio'));
    expect(inputs[0].name).toBe('options[1]');
    expect(inputs[0].checked).toBe(true);
    expect(inputs[0].getAttribute('aria-checked')).toBe('true');
    expect(inputs[1].checked).toBe(false);
    expect(inputs[1].getAttribute('aria-checked')).toBe('false');
  });

  it('fills a swatch from the value colour when the engine carries one', () => {
    const { container } = renderWithProviders(
      <VariantChips option={makeOption()} uid="oxcard-1" value={11} onChange={vi.fn()} />

    );
    const faces = container.querySelectorAll<HTMLElement>('.ox-swatch__face');
    expect(faces[0].style.getPropertyValue('--ox-swatch')).toBe('#111111');
    expect(faces[0].textContent).toBe('');
  });

  it('resolves a known colour NAME to its own swatch colour, never a letter', () => {
    const { container } = renderWithProviders(
      <VariantChips option={makeOption()} uid="oxcard-1" value={11} onChange={vi.fn()} />

    );
    const faces = container.querySelectorAll<HTMLElement>('.ox-swatch__face');
    // Value 2 ("أبيض") carries no explicit colour or image, but its own name
    // is a colour word: white, not a letter circle.
    expect(faces[1].style.getPropertyValue('--ox-swatch')).toBe('#FFFFFF');
    expect(faces[1].textContent).toBe('');
  });

  it('never renders a first-letter fallback, even for four names sharing one letter', () => {
    const shaker = makeOption({
      values: [
        { id: 21, name: 'أسود' } as never,
        { id: 22, name: 'أبيض' } as never,
        { id: 23, name: 'أخضر' } as never,
        { id: 24, name: 'أزرق' } as never,
      ],
    });
    const { container } = renderWithProviders(
      <VariantChips option={shaker} uid="oxcard-1" value={21} onChange={vi.fn()} />

    );
    const faces = container.querySelectorAll<HTMLElement>('.ox-swatch__face');
    expect(faces).toHaveLength(4);
    const colours = ['#111111', '#FFFFFF', '#16A34A', '#2563EB'];
    faces.forEach((face, index) => {
      expect(face.style.getPropertyValue('--ox-swatch')).toBe(colours[index]);
      // Never a single letter, and never the same letter across four values.
      expect(face.textContent).toBe('');
    });
  });

  it('renders a non-colour value as a compact text pill, never a letter', () => {
    const flavours = makeOption({
      name: 'النكهة',
      values: [
        { id: 31, name: 'شوكولاتة' } as never,
        { id: 32, name: 'فانيليا' } as never,
      ],
    });
    const { container } = renderWithProviders(
      <VariantChips option={flavours} uid="oxcard-1" value={31} onChange={vi.fn()} />

    );
    const faces = container.querySelectorAll<HTMLElement>('.ox-swatch__face');
    expect(faces).toHaveLength(2);
    expect(faces[0].classList.contains('ox-swatch__face--text')).toBe(true);
    // The value's own full label, not a single letter.
    expect(faces[0].textContent).toBe('شوكولاتة');
    expect(faces[0].style.getPropertyValue('--ox-swatch')).toBe('');
    expect(faces[1].textContent).toBe('فانيليا');
  });

  it('mixes colour swatches and text pills in one row, by value', () => {
    const mixed = makeOption({
      values: [
        { id: 41, name: 'أحمر' } as never, // a colour name
        { id: 42, name: '1 كجم' } as never, // a size, not a colour
      ],
    });
    const { container } = renderWithProviders(
      <VariantChips option={mixed} uid="oxcard-1" value={41} onChange={vi.fn()} />

    );
    const labels = container.querySelectorAll<HTMLElement>('.ox-swatch');
    expect(labels[0].classList.contains('ox-swatch--text')).toBe(false);
    expect(labels[1].classList.contains('ox-swatch--text')).toBe(true);
    const faces = container.querySelectorAll<HTMLElement>('.ox-swatch__face');
    expect(faces[0].style.getPropertyValue('--ox-swatch')).toBe('#DC2626');
    expect(faces[1].textContent).toBe('1 كجم');
  });

  it('gives every swatch the value name as a title, for the mouse tooltip', () => {
    const { container } = renderWithProviders(
      <VariantChips option={makeOption()} uid="oxcard-1" value={11} onChange={vi.fn()} />

    );
    const labels = container.querySelectorAll<HTMLLabelElement>('.ox-swatch');
    expect(labels[0].title).toBe('أسود');
    expect(labels[1].title).toBe('أبيض');
  });

  it('folds values past the fourth into a hidden count', () => {
    const { container } = renderWithProviders(
      <VariantChips option={makeOption()} uid="oxcard-1" value={11} onChange={vi.fn()} />

    );
    const more = container.querySelector('.ox-card-product__variant-more');
    expect(more).not.toBeNull();
    expect(more?.textContent).toBe('+2');
  });

  it('carries no hidden-count pill when every value already shows', () => {
    const short = makeOption({ values: [{ id: 1, name: 'أسود' } as never, { id: 2, name: 'أبيض' } as never] });
    const { container } = renderWithProviders(
      <VariantChips option={short} uid="oxcard-1" value={1} onChange={vi.fn()} />

    );
    expect(container.querySelector('.ox-card-product__variant-more')).toBeNull();
  });

  it('calls onChange with the value id on selection, keyboard-reachable', () => {
    const onChange = vi.fn();
    const { container } = renderWithProviders(
      <VariantChips option={makeOption()} uid="oxcard-1" value={11} onChange={onChange} />

    );
    const inputs = container.querySelectorAll<HTMLInputElement>('.ox-swatch__input');
    fireEvent.click(inputs[1]);
    expect(onChange).toHaveBeenCalledWith(12);
  });

  it('carries no form attribute by default, and the given one on every radio when a formId is passed (owner review, 2026-09-24: the chooser renders on the plate now, outside the card\'s own form)', () => {
    const bare = renderWithProviders(
      <VariantChips option={makeOption()} uid="oxcard-1" value={11} onChange={vi.fn()} />

    );
    const bareInputs = bare.container.querySelectorAll<HTMLInputElement>('.ox-swatch__input');
    bareInputs.forEach((input) => expect(input.hasAttribute('form')).toBe(false));
    bare.unmount();

    const withForm = renderWithProviders(
      <VariantChips
        option={makeOption()}
        uid="oxcard-1"
        value={11}
        onChange={vi.fn()}
        formId="oxcard-form-1"
      />
    );
    const formInputs = withForm.container.querySelectorAll<HTMLInputElement>('.ox-swatch__input');
    formInputs.forEach((input) => expect(input.getAttribute('form')).toBe('oxcard-form-1'));
  });

  describe('valueImageUrl (owner review, 2026-09-24, item 3: the plate swaps to a chosen value\'s own photograph)', () => {
    it('returns the value\'s own image when it carries one', () => {
      const withImage = makeOption({
        values: [{ id: 13, name: 'أخضر', image: 'https://cdn.test/green.jpg' } as never],
      });
      expect(valueImageUrl(withImage, 13)).toBe('https://cdn.test/green.jpg');
    });

    it('never invents a photograph from a colour alone', () => {
      expect(valueImageUrl(makeOption(), 11)).toBeNull();
    });

    it('returns null with no option, no matching value, or no value chosen', () => {
      expect(valueImageUrl(null, 11)).toBeNull();
      expect(valueImageUrl(makeOption(), 999)).toBeNull();
      expect(valueImageUrl(makeOption(), null)).toBeNull();
    });
  });

  describe('NAMED_COLORS (owner review, 2026-09-23, item 3)', () => {
    it('holds every canonical Arabic colour name the catalogue uses', () => {
      const required = [
        'أزرق',
        'أخضر',
        'أبيض',
        'أسود',
        'أحمر',
        'وردي',
        'رمادي',
        'بنفسجي',
        'برتقالي',
        'أصفر',
        'بني',
        'ذهبي',
        'فضي',
      ];
      required.forEach((name) => expect(NAMED_COLORS[name]).toBeDefined());
    });

    it('resolves every Arabic name in the table to a real CSS colour', () => {
      expect(ARABIC_COLOR_NAMES.length).toBeGreaterThan(0);
      const hexOrKeyword = /^(#[0-9A-Fa-f]{6}|transparent)$/;
      ARABIC_COLOR_NAMES.forEach((name) => {
        expect(namedColor(name)).toBe(NAMED_COLORS[name]);
        expect(NAMED_COLORS[name]).toMatch(hexOrKeyword);
      });
    });

    it('resolves the hamza-free common variants to the same colour as the canonical spelling', () => {
      expect(namedColor('اسود')).toBe(namedColor('أسود'));
      expect(namedColor('ابيض')).toBe(namedColor('أبيض'));
      expect(namedColor('احمر')).toBe(namedColor('أحمر'));
      expect(namedColor('ازرق')).toBe(namedColor('أزرق'));
    });

    it('returns null for a name that is not a colour, never a guess', () => {
      expect(namedColor('شوكولاتة')).toBeNull();
      expect(namedColor('1 كجم')).toBeNull();
      expect(namedColor('')).toBeNull();
    });
  });
});
