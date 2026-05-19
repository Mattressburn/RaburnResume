import { render } from '@testing-library/react';
import { describe, it, expect, beforeAll } from 'vitest';
import Marquee from './Marquee';

describe('Marquee + prefers-reduced-motion', () => {
  beforeAll(() => {
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: (query) => ({
        matches: query.includes('reduce'),
        media: query,
        onchange: null,
        addListener: () => {},
        removeListener: () => {},
        addEventListener: () => {},
        removeEventListener: () => {},
        dispatchEvent: () => false,
      }),
    });
  });

  it('still renders marquee element when reduced-motion is on', () => {
    const { container } = render(<Marquee text="X" />);
    expect(container.querySelector('.marquee')).toBeInTheDocument();
  });
});
