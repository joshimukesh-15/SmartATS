import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { RouterProvider, createMemoryRouter } from 'react-router-dom';
import { Providers } from './providers';
import { router } from './router';

// Mock matchMedia for testing environment
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

describe('App Router Smoke Test', () => {
  it('renders landing page at root route', async () => {
    const memoryRouter = createMemoryRouter(router.routes, {
      initialEntries: ['/'],
    });

    render(
      <Providers>
        <RouterProvider router={memoryRouter} />
      </Providers>
    );

    await waitFor(
      () => {
        expect(
          screen.getByText(/Know exactly why every candidate ranks where they do/i)
        ).toBeInTheDocument();
      },
      { timeout: 4000 }
    );
  });
});
