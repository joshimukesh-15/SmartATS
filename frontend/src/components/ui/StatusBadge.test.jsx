import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { StatusBadge } from './StatusBadge';

describe('StatusBadge component', () => {
  it('renders nothing when status is empty or undefined', () => {
    const { container } = render(<StatusBadge status={null} />);
    expect(container.firstChild).toBeNull();
  });

  it('renders "Re-scoring" with champagne styling and pulse for "Re-scoring"', () => {
    render(<StatusBadge status="Re-scoring" />);
    const badge = screen.getByTestId('status-badge');
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveTextContent('Re-scoring');
    expect(badge.className).toContain('bg-champagne-soft');
  });

  it('renders "Processing" with pulse for "PROCESSING"', () => {
    render(<StatusBadge status="PROCESSING" />);
    const badge = screen.getByTestId('status-badge');
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveTextContent('Processing');
    expect(badge.className).toContain('bg-champagne-soft');
  });

  it('renders completed status correctly', () => {
    render(<StatusBadge status="COMPLETED" />);
    const badge = screen.getByTestId('status-badge');
    expect(badge).toHaveTextContent('Completed');
    expect(badge.className).toContain('bg-emerald-500/10');
  });

  it('renders failed status correctly', () => {
    render(<StatusBadge status="FAILED" />);
    const badge = screen.getByTestId('status-badge');
    expect(badge).toHaveTextContent('Failed');
    expect(badge.className).toContain('bg-rose-500/10');
  });
});
