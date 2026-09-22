import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { fireEvent } from '@testing-library/react';
import { renderWithProviders } from '../helpers/render';
import type { ProductOption } from '@salla.sa/twilight-theme-engine/types';

const { VariantChips } = await import('../../app/components/product/VariantChips');

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

  it('falls back to a neutral circle with the first letter when nothing carries a fill', () => {
    const { container } = renderWithProviders(
      <VariantChips option={makeOption()} uid="oxcard-1" value={11} onChange={vi.fn()} />
    );
    const faces = container.querySelectorAll<HTMLElement>('.ox-swatch__face');
    // Value 2 ("أبيض") carries no colour and no image.
    expect(faces[1].style.getPropertyValue('--ox-swatch')).toBe('');
    expect(faces[1].style.backgroundImage).toBe('');
    expect(faces[1].textContent).toBe('أ');
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
});
