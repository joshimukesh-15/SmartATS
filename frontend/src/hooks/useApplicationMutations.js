import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  updateApplicationStage,
  addApplicationNote,
  fetchApplicationHistory,
} from '../api/applications';
import { queryKeys } from '../api/queryKeys';

export function useApplicationHistory(applicationId) {
  return useQuery({
    queryKey: queryKeys.applications.history(applicationId),
    queryFn: () => fetchApplicationHistory(applicationId),
    enabled: Boolean(applicationId),
  });
}

export function useUpdateApplicationStage(jobId) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ applicationId, stage, note, changed_by }) =>
      updateApplicationStage(applicationId, { stage, note, changed_by }),
    onSuccess: (data, variables) => {
      if (jobId) {
        queryClient.invalidateQueries({ queryKey: queryKeys.jobs.rankings(jobId) });
        queryClient.invalidateQueries({ queryKey: queryKeys.jobs.analytics(jobId) });
      }
      queryClient.invalidateQueries({ queryKey: ['jobs', 'rankings'] });
      queryClient.invalidateQueries({
        queryKey: queryKeys.applications.history(variables.applicationId),
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.analytics.overview() });
    },
  });
}

export function useAddApplicationNote(jobId) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ applicationId, content, author }) =>
      addApplicationNote(applicationId, { content, author }),
    onSuccess: (data, variables) => {
      if (jobId) {
        queryClient.invalidateQueries({ queryKey: queryKeys.jobs.rankings(jobId) });
      }
      queryClient.invalidateQueries({
        queryKey: queryKeys.applications.history(variables.applicationId),
      });
    },
  });
}
