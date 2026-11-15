import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { ScoreBar } from './ScoreBar';

describe('ScoreBar component', () => {
  it('renders progressbar with correct aria attributes', () => {
    render(<ScoreBar skillsPoints={40} textMatchPoints={30} finalScore={70} />);
    const bar = screen.getByRole('progressbar');
    expect(bar).toBeInTheDocument();
    expect(bar).toHaveAttribute('aria-valuenow', '70');
  });

  it('renders segment breakdown labels when showLabel is true', () => {
    render(
      <ScoreBar skillsPoints={40.2} textMatchPoints={28.4} finalScore={68.6} showLabel={true} />
    );
    expect(screen.getByText(/Skills: 40.2/)).toBeInTheDocument();
    expect(screen.getByText(/Text: 28.4/)).toBeInTheDocument();
    expect(screen.getByText('68.6%')).toBeInTheDocument();
  });
});
