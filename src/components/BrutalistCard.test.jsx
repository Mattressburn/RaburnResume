import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import BrutalistCard from './BrutalistCard';

describe('BrutalistCard', () => {
  it('renders children inside the inner layer', () => {
    render(
      <BrutalistCard>
        <span>contents</span>
      </BrutalistCard>
    );
    const inner = screen.getByText('contents').closest('.bcard-inner');
    expect(inner).toBeInTheDocument();
  });

  it('renders a sibling shadow element for the hard offset', () => {
    const { container } = render(<BrutalistCard>x</BrutalistCard>);
    expect(container.querySelector('.bcard-shadow')).toBeInTheDocument();
  });
});
