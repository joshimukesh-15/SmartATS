import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Kbd } from './Kbd';

describe('Kbd component', () => {
  it('renders children with shortcut styling', () => {
    render(<Kbd>⌘K</Kbd>);
    const kbd = screen.getByText('⌘K');
    expect(kbd).toBeInTheDocument();
    expect(kbd.tagName.toLowerCase()).toBe('kbd');
    expect(kbd).toHaveClass('rounded-[6px]');
    expect(kbd).toHaveClass('bg-surface-alt');
    expect(kbd).toHaveClass('border-line');
  });
});
