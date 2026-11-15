import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import HeroSection from './HeroSection';

describe('HeroSection component and live demo', () => {
  it('renders headline, CTAs, and ProductFrame browser demo', () => {
    const handleEnterApp = vi.fn();
    render(<HeroSection onEnterApp={handleEnterApp} />);

    // Verify main display headline
    expect(
      screen.getByText('Know exactly why every candidate ranks where they do.')
    ).toBeInTheDocument();

    // Verify local privacy note
    expect(screen.getByText('No account needed. Runs locally.')).toBeInTheDocument();

    // Verify browser chrome URL
    expect(screen.getByText('smartats.app/studio/leaderboard')).toBeInTheDocument();

    // Verify candidates rendered in demo table
    expect(screen.getByText('Sarah Jenkins')).toBeInTheDocument();
    expect(screen.getByText('Alex Rivera')).toBeInTheDocument();
    expect(screen.getByText('Jordan Lee')).toBeInTheDocument();

    // Verify call to onEnterApp when clicking CTA
    const ctaBtn = screen.getByRole('button', { name: /Open the studio/i });
    fireEvent.click(ctaBtn);
    expect(handleEnterApp).toHaveBeenCalledTimes(1);
  });

  it('re-scores and dynamically re-orders candidates when toggling skill chips', () => {
    render(<HeroSection onEnterApp={vi.fn()} />);

    // Initial required skills: React, TypeScript, Node.js
    const nodeBtn = screen.getByRole('button', { name: /Node\.js/i });
    expect(nodeBtn).toBeInTheDocument();

    // Toggle off Node.js
    fireEvent.click(nodeBtn);

    // Toggle on PostgreSQL (only Sarah Jenkins has it among candidates)
    const postgresBtn = screen.getByRole('button', { name: /PostgreSQL/i });
    fireEvent.click(postgresBtn);

    // Candidates are dynamically re-ordered
    const candidateNames = screen.getAllByText(/Sarah Jenkins|Alex Rivera|Jordan Lee/i);
    expect(candidateNames.length).toBeGreaterThanOrEqual(3);
    // Sarah Jenkins remains top rank with PostgreSQL match
    expect(candidateNames[0]).toHaveTextContent('Sarah Jenkins');
  });
});
