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
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
  });

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
          screen.getByText(/Resume screening for hiring teams/i)
        ).toBeInTheDocument();
      },
      { timeout: 4000 }
    );
  });

  it('redirects /studio to /login when unauthenticated without a token', async () => {
    localStorage.removeItem('smartats_token');
    sessionStorage.removeItem('smartats_token');

    const memoryRouter = createMemoryRouter(router.routes, {
      initialEntries: ['/studio'],
    });

    render(
      <Providers>
        <RouterProvider router={memoryRouter} />
      </Providers>
    );

    await waitFor(
      () => {
        expect(screen.getByRole('heading', { name: /Recruiter sign in/i })).toBeInTheDocument();
      },
      { timeout: 4000 }
    );
  });

  it('renders login page directly at /login route', async () => {
    const memoryRouter = createMemoryRouter(router.routes, {
      initialEntries: ['/login'],
    });

    render(
      <Providers>
        <RouterProvider router={memoryRouter} />
      </Providers>
    );

    await waitFor(
      () => {
        expect(screen.getByRole('heading', { name: /Recruiter sign in/i })).toBeInTheDocument();
        expect(screen.getByLabelText(/Recruiter email/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Password/i)).toBeInTheDocument();
      },
      { timeout: 4000 }
    );
  });
});
