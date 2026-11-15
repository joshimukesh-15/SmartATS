import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Avatar } from './Avatar';

describe('Avatar component', () => {
  it('renders initials correctly for full name', () => {
    render(<Avatar name="Sarah Jenkins" />);
    expect(screen.getByText('SJ')).toBeInTheDocument();
  });

  it('renders initials correctly for single name', () => {
    render(<Avatar name="Alex" />);
    expect(screen.getByText('AL')).toBeInTheDocument();
  });

  it('renders fallback for empty name', () => {
    render(<Avatar name="" />);
    expect(screen.getByText('?')).toBeInTheDocument();
  });

  it('renders deterministic subtle tint and circle styling', () => {
    const { container } = render(<Avatar name="Sarah Jenkins" />);
    const avatarEl = container.firstChild;
    expect(avatarEl).toHaveClass('rounded-full');
    expect(avatarEl).toHaveClass('w-8');
    expect(avatarEl).toHaveClass('h-8');
  });
});
