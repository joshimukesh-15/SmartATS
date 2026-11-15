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
});
