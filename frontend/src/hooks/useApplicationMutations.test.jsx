import { renderHook, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  useUpdateApplicationStage,
  useAddApplicationNote,
  useApplicationHistory,
} from './useApplicationMutations';
import * as appApi from '../api/applications';
import { queryKeys } from '../api/queryKeys';

vi.mock('../api/applications', () => ({
  updateApplicationStage: vi.fn(),
  addApplicationNote: vi.fn(),
  fetchApplicationHistory: vi.fn(),
}));

describe('useApplicationMutations hooks', () => {
  it('useUpdateApplicationStage invalidates rankings, analytics, history, and overview on success', async () => {
    const queryClient = new QueryClient();
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

    appApi.updateApplicationStage.mockResolvedValueOnce({
      application_id: 101,
      review_stage: 'Interviewing',
    });

    const wrapper = ({ children }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );

    const { result } = renderHook(() => useUpdateApplicationStage(5), { wrapper });

    result.current.mutate({
      applicationId: 101,
      stage: 'Interviewing',
      note: 'Candidate advancing to interview',
      changed_by: 'Recruiter',
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: queryKeys.jobs.rankings(5),
    });
    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: queryKeys.jobs.analytics(5),
    });
    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: queryKeys.applications.history(101),
    });
    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: queryKeys.analytics.overview(),
    });
  });

  it('useAddApplicationNote invalidates rankings and history on success', async () => {
    const queryClient = new QueryClient();
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

    appApi.addApplicationNote.mockResolvedValueOnce({
      note_id: 1,
      content: 'Strong fit',
    });

    const wrapper = ({ children }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );

    const { result } = renderHook(() => useAddApplicationNote(5), { wrapper });

    result.current.mutate({
      applicationId: 101,
      content: 'Strong fit',
      author: 'Recruiter',
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: queryKeys.jobs.rankings(5),
    });
    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: queryKeys.applications.history(101),
    });
  });

  it('useApplicationHistory executes query when applicationId provided', async () => {
    const queryClient = new QueryClient();
    appApi.fetchApplicationHistory.mockResolvedValueOnce({
      application_id: 101,
      status_history: [],
      notes: [],
    });

    const wrapper = ({ children }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );

    const { result } = renderHook(() => useApplicationHistory(101), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data.application_id).toBe(101);
  });
});
