import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import LoginPage from './LoginPage';
import * as clientModule from '../../api/client';

const mockNavigate = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useLocation: () => ({ state: { from: { pathname: '/studio/jobs' } } }),
  };
});

describe('LoginPage', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    mockNavigate.mockClear();
    localStorage.clear();
  });

  it('renders sign in form with inputs and submit button', () => {
    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>
    );

    expect(screen.getByRole('heading', { name: /Recruiter sign in/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/Recruiter email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Sign in to Studio/i })).toBeInTheDocument();
  });

  it('displays inline error with role="alert" on invalid login submission', async () => {
    vi.spyOn(clientModule, 'apiClient').mockRejectedValueOnce(
      new Error('Incorrect email or password')
    );

    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByLabelText(/Recruiter email/i), {
      target: { value: 'bad@smartats.com' },
    });
    fireEvent.change(screen.getByLabelText(/Password/i), {
      target: { value: 'wrongpass' },
    });
    fireEvent.click(screen.getByRole('button', { name: /Sign in to Studio/i }));

    const alert = await screen.findByRole('alert');
    expect(alert).toBeInTheDocument();
    expect(alert).toHaveTextContent(/Incorrect email or password/i);
  });

  it('stores access token and redirects to intended page on successful login', async () => {
    const setAuthTokenSpy = vi.spyOn(clientModule, 'setAuthToken');
    vi.spyOn(clientModule, 'apiClient').mockResolvedValueOnce({
      access_token: 'fake-jwt-token-12345',
      token_type: 'bearer',
    });

    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByLabelText(/Recruiter email/i), {
      target: { value: 'recruiter@smartats.com' },
    });
    fireEvent.change(screen.getByLabelText(/Password/i), {
      target: { value: 'recruiter123' },
    });
    fireEvent.click(screen.getByRole('button', { name: /Sign in to Studio/i }));

    await waitFor(() => {
      expect(clientModule.apiClient).toHaveBeenCalledWith('auth/login', {
        method: 'POST',
        body: {
          email: 'recruiter@smartats.com',
          password: 'recruiter123',
        },
      });
      expect(setAuthTokenSpy).toHaveBeenCalledWith('fake-jwt-token-12345');
      expect(mockNavigate).toHaveBeenCalledWith('/studio/jobs', { replace: true });
    });
  });
});
