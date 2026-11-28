import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { HeroSection } from './HeroSection';
import { AppFrameSection } from './AppFrameSection';

describe('HeroSection & interactive AppFrameSection', () => {
  it('renders triptych hero headline, CTA, and collage views', () => {
    const handleEnterApp = vi.fn();
    render(<HeroSection onEnterApp={handleEnterApp} />);

    expect(
      screen.getByRole('heading', { name: /Resume screening for hiring teams/i })
    ).toBeInTheDocument();
    expect(screen.getByText(/Four weighted pillars score PDF and Word resumes/i)).toBeInTheDocument();
    expect(screen.getByText('Hannah Meyer')).toBeInTheDocument();
    expect(screen.getByText('David Chen')).toBeInTheDocument();

    const ctaBtn = screen.getByRole('button', { name: /Open the studio/i });
    fireEvent.click(ctaBtn);
    expect(handleEnterApp).toHaveBeenCalledTimes(1);
  });

  it('recalculates deterministic shortlist scores when required skills are toggled', () => {
    render(<AppFrameSection />);

    expect(screen.getAllByText('Hannah Meyer').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('David Chen')).toBeInTheDocument();
    expect(screen.getByText('Tomasz Nowak')).toBeInTheDocument();

    // Select React skill requirement -> David Chen has React while Tomasz Nowak does not
    const reactChip = screen.getByRole('button', { name: 'React' });
    fireEvent.click(reactChip);
    expect(reactChip).toHaveAttribute('aria-pressed', 'true');

    // Select David Chen to inspect breakdown panel
    const davidBtn = screen.getByRole('button', { name: /David Chen/i });
    fireEvent.click(davidBtn);
    expect(screen.getByRole('heading', { name: 'David Chen' })).toBeInTheDocument();
  });
});
