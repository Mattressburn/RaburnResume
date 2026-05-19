import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import Marquee from './Marquee';

describe('Marquee', () => {
  it('renders the same text twice for seamless loop', () => {
    render(<Marquee text="HELLO" />);
    const matches = screen.getAllByText((content) => content.includes('HELLO'));
    expect(matches.length).toBeGreaterThanOrEqual(2);
  });

  it('respects an empty text prop without crashing', () => {
    const { container } = render(<Marquee text="" />);
    expect(container.querySelector('.marquee')).toBeInTheDocument();
  });
});
