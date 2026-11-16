import { describe, it, expect, vi, beforeEach } from 'vitest';
import { apiClient, ApiError } from './client';

describe('API Client', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('constructs ApiError with status and custom data', () => {
    const err = new ApiError('Not Found', 404, { detail: 'Job not found' });
    expect(err.message).toBe('Not Found');
    expect(err.status).toBe(404);
    expect(err.data).toEqual({ detail: 'Job not found' });
  });

  it('handles JSON error payload detail from server', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 400,
      statusText: 'Bad Request',
      json: async () => ({ detail: 'Invalid resume file format' }),
      headers: { get: () => 'application/json' },
    });

    await expect(apiClient('jobs/')).rejects.toThrow('Invalid resume file format');
  });

  it('handles network connection failures gracefully', async () => {
    global.fetch = vi.fn().mockRejectedValue(new Error('Failed to fetch'));

    await expect(apiClient('jobs/')).rejects.toThrow('Failed to fetch');
  });

  it('returns parsed json on successful response', async () => {
    const mockData = [{ job_id: 1, title: 'Senior Backend Engineer' }];
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      headers: { get: () => 'application/json' },
      json: async () => mockData,
    });

    const result = await apiClient('jobs/');
    expect(result).toEqual(mockData);
  });

  it('handles 401 unauthorized: clears token and dispatches smartats:unauthorized event', async () => {
    localStorage.setItem('smartats_token', 'expired-token');
    const dispatchSpy = vi.spyOn(window, 'dispatchEvent');

    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 401,
      statusText: 'Unauthorized',
      json: async () => ({ detail: 'Invalid or expired token' }),
      headers: { get: () => 'application/json' },
    });

    await expect(apiClient('jobs/')).rejects.toThrow('Invalid or expired token');
    expect(localStorage.getItem('smartats_token')).toBeNull();
    expect(dispatchSpy).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'smartats:unauthorized' })
    );
  });

  it('does not dispatch smartats:unauthorized when auth/login returns 401', async () => {
    const dispatchSpy = vi.spyOn(window, 'dispatchEvent');

    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 401,
      statusText: 'Unauthorized',
      json: async () => ({ detail: 'Incorrect email or password' }),
      headers: { get: () => 'application/json' },
    });

    await expect(apiClient('auth/login')).rejects.toThrow('Incorrect email or password');
    expect(dispatchSpy).not.toHaveBeenCalledWith(
      expect.objectContaining({ type: 'smartats:unauthorized' })
    );
  });

  it('returns blob when responseType is blob', async () => {
    const dummyBlob = new Blob(['sample pdf content'], { type: 'application/pdf' });
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      headers: { get: () => 'application/pdf' },
      blob: async () => dummyBlob,
    });

    const result = await apiClient('applications/1/download', { responseType: 'blob' });
    expect(result).toBe(dummyBlob);
  });
});
