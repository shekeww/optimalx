import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithProviders } from '../helpers/render';

/**
 * The three surfaces PAGES lands for the whole build: `Panel`, `Band` and
 * `StatStrip` (all-pages-plan section 1.1).
 *
 * Every assertion here is a contract another batch writes against, so a change
 * that breaks one of them breaks HOME, LISTING or COMMERCE and not only this
 * batch. The empty renders matter most: the default render, with every claims
 * gate off, is the render the design is checked in.
 */
vi.mock('@salla.sa/twilight-theme-engine/i18n', async () =>
  (await import('../helpers/i18n')).i18nModuleMock('ar')
);

const { Panel, PanelRow, PanelRowGroup } = await import('../../app/components/common/Panel');
const { Band } = await import('../../app/components/common/Band');
const { StatStrip } = await import('../../app/components/common/StatStrip');

const PHOTO = '/assets/images/services-band.jpg';

describe('Panel', () => {
  it('renders the heading at h3 by default and the body beside it', () => {
    renderWithProviders(
      <Panel title="details">
        <p>body</p>
      </Panel>
    );
    const heading = screen.getByRole('heading', { level: 3 });
    expect(heading.className).toContain('ox-panel__title');
    expect(screen.getByTestId('ox-panel').querySelector('.ox-panel__body')?.textContent).toBe(
      'body'
    );
  });

  it('takes the plate tone and a head action without a shadow class', () => {
    renderWithProviders(
      <Panel title="scope" tone="plate" headingLevel="h2" action={<button type="button">go</button>}>
        <p>body</p>
      </Panel>
    );
    const panel = screen.getByTestId('ox-panel');
    expect(panel.className).toContain('ox-panel--plate');
    expect(screen.getByRole('heading', { level: 2 })).toBeTruthy();
    expect(panel.querySelector('.ox-panel__action')?.textContent).toBe('go');
  });

  it('renders a head row only when there is something to put in it', () => {
    renderWithProviders(
      <Panel>
        <p>body</p>
      </Panel>
    );
    expect(screen.getByTestId('ox-panel').querySelector('.ox-panel__head')).toBeNull();
  });
});

describe('PanelRow', () => {
  it('draws the key and value contract the approved image uses', () => {
    renderWithProviders(<PanelRow label="brand" value="GHOST" />);
    const row = screen.getByTestId('ox-panel-row');
    expect(row.className).toBe('ox-details__row');
    expect(row.querySelector('.ox-details__key')?.textContent).toBe('brand');
    expect(row.querySelector('.ox-details__value')?.textContent).toBe('GHOST');
  });
});

describe('PanelRowGroup', () => {
  it('publishes the real panel count so the stylesheet can re-space the row', () => {
    const { container } = renderWithProviders(
      <PanelRowGroup>
        <Panel title="one">a</Panel>
        {null}
        <Panel title="two">b</Panel>
      </PanelRowGroup>
    );
    const group = container.querySelector('.ox-panels');
    expect(group?.getAttribute('data-count')).toBe('2');
  });

  it('renders nothing at all when every panel is gated off', () => {
    const { container } = renderWithProviders(
      <PanelRowGroup>
        {null}
        {false}
      </PanelRowGroup>
    );
    expect(container.querySelector('.ox-panels')).toBeNull();
  });
});

describe('Band', () => {
  it('emits the product page brand-band markup, wedge included', () => {
    renderWithProviders(<Band photo={PHOTO} line1="one" line2="two" subline="sub" />);
    const band = screen.getByTestId('ox-band');
    expect(band.className).toContain('ox-bband');
    expect(band.querySelectorAll('.ox-bband__wedge')).toHaveLength(2);
    expect(band.querySelector('.ox-bband__photo')?.getAttribute('alt')).toBe('');
    expect(band.querySelectorAll('.ox-bband__line')).toHaveLength(2);
    expect(band.querySelector('.ox-bband__sub')?.textContent).toBe('sub');
  });

  it('drops the wedge on request, because a screen carries at most one', () => {
    renderWithProviders(<Band photo={PHOTO} line1="one" wedge={false} />);
    expect(screen.getByTestId('ox-band').querySelectorAll('.ox-bband__wedge')).toHaveLength(0);
  });

  it('collapses the lower tier when no badge has real data behind it', () => {
    renderWithProviders(<Band photo={PHOTO} line1="one" />);
    const band = screen.getByTestId('ox-band');
    expect(band.className).toContain('ox-bband--short');
    expect(band.querySelector('.ox-bband__badges')).toBeNull();
  });

  it('keeps its proportions with one, two or three badges', () => {
    for (const count of [1, 2, 3]) {
      const badges = Array.from({ length: count }, (unused, index) => ({
        id: `b${index}`,
        glyph: 'tick' as const,
        label: `label ${index}`,
      }));
      const { unmount } = renderWithProviders(<Band photo={PHOTO} line1="one" badges={badges} />);
      const band = screen.getByTestId('ox-band');
      expect(band.className).not.toContain('ox-bband--short');
      expect(band.querySelectorAll('.ox-bband__badge')).toHaveLength(count);
      unmount();
    }
  });

  it('names the heading it labels, at the level the page asks for', () => {
    renderWithProviders(<Band id="ox-test-band" photo={PHOTO} headingLevel="h1" line1="one" />);
    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading.getAttribute('id')).toBe('ox-test-band-title');
    expect(screen.getByTestId('ox-band').getAttribute('aria-labelledby')).toBe('ox-test-band-title');
  });

  it('draws the owner mark as an asset, never as typeset text', () => {
    renderWithProviders(<Band photo={PHOTO} line1="one" />);
    const mark = screen.getByTestId('ox-wordmark').querySelector('img');
    expect(mark?.getAttribute('src')).toBe('/assets/brand/optimalx-full-reverse.png');
  });

  it('omits the lockup when the caller says the surface already carries one', () => {
    renderWithProviders(<Band photo={PHOTO} line1="one" lockup={false} />);
    expect(screen.queryByTestId('ox-wordmark')).toBeNull();
  });
});

describe('StatStrip', () => {
  it('renders nothing when no cell has a source behind it', () => {
    const { container } = renderWithProviders(<StatStrip cells={[]} />);
    expect(container.querySelector('.ox-stats')).toBeNull();
  });

  it('publishes the surviving cell count so the hairlines follow the data', () => {
    renderWithProviders(
      <StatStrip
        cells={[
          { id: 'a', value: '20g', label: 'protein' },
          { id: 'b', glyph: 'tick', label: 'vegan', sub: 'Vegan' },
        ]}
      />
    );
    const strip = screen.getByTestId('ox-stat-strip');
    expect(strip.getAttribute('data-count')).toBe('2');
    expect(strip.querySelectorAll('.ox-stats__cell')).toHaveLength(2);
    expect(strip.querySelectorAll('.ox-stats__glyph')).toHaveLength(1);
    expect(strip.querySelectorAll('.ox-stats__label-line')).toHaveLength(3);
  });
});
