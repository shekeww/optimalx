import React from 'react';
import { describe, it, expect, afterEach, beforeEach } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';

/**
 * The page's one reveal, and the photograph layer the dark cards sit on.
 *
 * Both exist for the same reason: the home page has to be correct in the
 * state it is actually in today, which is JavaScript still loading and ten of
 * the sixteen photographs not shot. So the two properties worth asserting are
 * that nothing is ever hidden before the client chooses to hide it, and that
 * a missing file leaves a finished card rather than a broken image.
 */

const { useSectionReveal, resetSectionRevealObserver } = await import(
  '../../app/components/home/useSectionReveal'
);
const { BandPhoto } = await import('../../app/components/home/BandPhoto');

interface FakeObserver {
  observed: Element[];
  fire: (target: Element) => void;
}

let current: FakeObserver | null = null;
let created = 0;

function installObserver() {
  created = 0;
  class Fake {
    observed: Element[] = [];
    callback: IntersectionObserverCallback;
    constructor(callback: IntersectionObserverCallback) {
      this.callback = callback;
      created += 1;
      current = {
        observed: this.observed,
        fire: (target: Element) =>
          this.callback(
            [{ target, isIntersecting: true } as unknown as IntersectionObserverEntry],
            this as unknown as IntersectionObserver
          ),
      };
    }
    observe(node: Element) {
      this.observed.push(node);
    }
    unobserve(node: Element) {
      // Spliced rather than reassigned: the handle below holds a reference to
      // this array, so a new one would hide every later change from the test.
      const at = this.observed.indexOf(node);
      if (at >= 0) this.observed.splice(at, 1);
    }
    disconnect() {
      this.observed.length = 0;
    }
  }
  Object.defineProperty(window, 'IntersectionObserver', {
    writable: true,
    configurable: true,
    value: Fake,
  });
}

/** jsdom lays everything out at 0x0, so the fold test needs a real number. */
function stubGeometry(top: number) {
  Object.defineProperty(window, 'innerHeight', { writable: true, configurable: true, value: 800 });
  Element.prototype.getBoundingClientRect = function rect() {
    return { top, bottom: top + 100, left: 0, right: 0, width: 100, height: 100, x: 0, y: top, toJSON: () => ({}) };
  } as typeof Element.prototype.getBoundingClientRect;
}

function stubMatchMedia(reduced: boolean) {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    configurable: true,
    value: (query: string) => ({
      matches: reduced,
      media: query,
      addEventListener: () => {},
      removeEventListener: () => {},
    }),
  });
}

function Row({ enabled = true }: { enabled?: boolean }) {
  const ref = useSectionReveal<HTMLUListElement>({ enabled });
  return (
    <ul className="ox-reveal" ref={ref} data-testid="row">
      <li>a</li>
      <li>b</li>
    </ul>
  );
}

const originalRect = Element.prototype.getBoundingClientRect;

beforeEach(() => {
  resetSectionRevealObserver();
  installObserver();
  stubMatchMedia(false);
});

afterEach(() => {
  Element.prototype.getBoundingClientRect = originalRect;
  Reflect.deleteProperty(window, 'IntersectionObserver');
  Reflect.deleteProperty(window, 'matchMedia');
  current = null;
});

describe('useSectionReveal', () => {
  it('arms a row that is below the fold, then reveals it once', () => {
    stubGeometry(1200);
    render(<Row />);
    const row = screen.getByTestId('row');
    expect(row.getAttribute('data-reveal')).toBe('ready');
    expect(current?.observed).toContain(row);

    current?.fire(row);
    expect(row.getAttribute('data-reveal')).toBe('in');
    // Once: the observer stops watching it, so scrolling back cannot replay.
    expect(current?.observed).not.toContain(row);
  });

  it('leaves a row the visitor can already see exactly as the server painted it', () => {
    stubGeometry(100);
    render(<Row />);
    // This is the whole safety property. An element on screen at hydration is
    // never hidden and never animates, so there is no flash of empty column
    // between the server's paint and the client's decision.
    expect(screen.getByTestId('row').getAttribute('data-reveal')).toBeNull();
    expect(current?.observed ?? []).toHaveLength(0);
  });

  it('never arms anything under reduced motion', () => {
    stubGeometry(1200);
    stubMatchMedia(true);
    render(<Row />);
    expect(screen.getByTestId('row').getAttribute('data-reveal')).toBeNull();
  });

  it('respects an explicit opt out', () => {
    stubGeometry(1200);
    render(<Row enabled={false} />);
    expect(screen.getByTestId('row').getAttribute('data-reveal')).toBeNull();
  });

  it('shares one observer across every row on the page', () => {
    stubGeometry(1200);
    render(
      <>
        <Row />
        <Row />
        <Row />
      </>
    );
    // One observer, three targets. Nine sections each constructing their own
    // is the cost this hook exists to avoid.
    expect(created).toBe(1);
    expect(current?.observed).toHaveLength(3);
  });

  it('does nothing at all where IntersectionObserver is missing', () => {
    stubGeometry(1200);
    Reflect.deleteProperty(window, 'IntersectionObserver');
    render(<Row />);
    expect(screen.getByTestId('row').getAttribute('data-reveal')).toBeNull();
  });
});

describe('BandPhoto', () => {
  it('is decorative and lazy', () => {
    render(<BandPhoto src="/assets/images/goal-muscle.jpg" className="x" />);
    const img = screen.getByTestId('ox-band-photo');
    expect(img.getAttribute('alt')).toBe('');
    expect(img.getAttribute('loading')).toBe('lazy');
    expect(img.getAttribute('decoding')).toBe('async');
  });

  it('takes itself out of the tree when the file is not there yet', () => {
    render(<BandPhoto src="/assets/images/plan-nutrition.jpg" />);
    fireEvent.error(screen.getByTestId('ox-band-photo'));
    // Ten of the sixteen frames the brief lists do not exist, so this is the
    // normal path today, not the error path: the card's own dark ground is
    // what shows and nothing broken is ever painted.
    expect(screen.queryByTestId('ox-band-photo')).toBeNull();
  });
});
