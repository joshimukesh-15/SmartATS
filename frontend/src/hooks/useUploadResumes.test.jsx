import { renderHook, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useUploadResumes } from './useUploadResumes';
import * as jobsApi from '../api/jobs';

vi.mock('../api/jobs', () => ({
  uploadResumes: vi.fn(),
}));

describe('useUploadResumes hook', () => {
  it('invalidates jobs, rankings, overview, applications and candidate caches on success', async () => {
    const queryClient = new QueryClient();
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

    jobsApi.uploadResumes.mockResolvedValueOnce([
      {
        filename: 'test.pdf',
        status: 'ACCEPTED',
        application_id: 1,
        message: 'Accepted',
      },
    ]);

    const wrapper = ({ children }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );

    const { result } = renderHook(() => useUploadResumes(42), { wrapper });

    const dummyFiles = [new File(['dummy'], 'test.pdf')];
    result.current.mutate(dummyFiles);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    // Verify invalidations
    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: ['jobs', 'rankings', '42'],
    });
    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: ['jobs'],
    });
    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: ['analytics', 'overview'],
    });
    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: ['analytics'],
    });
    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: ['applications'],
    });
    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: ['candidates'],
    });
  });
});
