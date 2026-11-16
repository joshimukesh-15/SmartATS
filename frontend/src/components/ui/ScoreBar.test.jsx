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

  it('renders 4 segments when experience/education points > 0', () => {
    render(
      <ScoreBar
        skillsPoints={36.0}
        textMatchPoints={17.0}
        experiencePoints={20.0}
        educationPoints={15.0}
        finalScore={88.0}
      />
    );
    const progressbar = screen.getByRole('progressbar');
    const segments = progressbar.querySelectorAll('.h-full');
    expect(segments.length).toBe(4);
    expect(screen.getByTestId('score-bar-skills')).toBeInTheDocument();
    expect(screen.getByTestId('score-bar-text')).toBeInTheDocument();
    expect(screen.getByTestId('score-bar-experience')).toBeInTheDocument();
    expect(screen.getByTestId('score-bar-education')).toBeInTheDocument();
  });

  it('renders 4 segments when hasMultiPillar is true even if experience points are 0', () => {
    render(
      <ScoreBar
        skillsPoints={40.0}
        textMatchPoints={20.0}
        experiencePoints={0}
        educationPoints={0}
        hasMultiPillar={true}
        finalScore={60.0}
      />
    );
    const progressbar = screen.getByRole('progressbar');
    const segments = progressbar.querySelectorAll('.h-full');
    expect(segments.length).toBe(4);
  });

  it('renders 2 segments otherwise (when experience/education points are 0 and not multi-pillar)', () => {
    render(
      <ScoreBar
        skillsPoints={48.0}
        textMatchPoints={28.0}
        experiencePoints={0}
        educationPoints={0}
        finalScore={76.0}
      />
    );
    const progressbar = screen.getByRole('progressbar');
    const segments = progressbar.querySelectorAll('.h-full');
    expect(segments.length).toBe(2);
    expect(screen.getByTestId('score-bar-skills')).toBeInTheDocument();
    expect(screen.getByTestId('score-bar-text')).toBeInTheDocument();
    expect(screen.queryByTestId('score-bar-experience')).toBeNull();
    expect(screen.queryByTestId('score-bar-education')).toBeNull();
  });
});
