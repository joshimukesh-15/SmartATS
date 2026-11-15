import { useMutation, useQueryClient } from '@tanstack/react-query';
import { uploadResumes } from '../api/jobs';
import { queryKeys } from '../api/queryKeys';

export function useUploadResumes(jobId) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (files) => uploadResumes(jobId, files),
    onSuccess: () => {
      if (jobId) {
        queryClient.invalidateQueries({ queryKey: ['jobs', 'rankings', String(jobId)] });
        queryClient.invalidateQueries({ queryKey: queryKeys.jobs.rankings(jobId) });
        queryClient.invalidateQueries({ queryKey: queryKeys.jobs.analytics(jobId) });
        queryClient.invalidateQueries({ queryKey: queryKeys.jobs.detail(jobId) });
      } else {
        queryClient.invalidateQueries({ queryKey: ['jobs', 'rankings'] });
      }
      queryClient.invalidateQueries({ queryKey: queryKeys.jobs.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.jobs.lists() });
      queryClient.invalidateQueries({ queryKey: queryKeys.analytics.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.analytics.overview() });
      queryClient.invalidateQueries({ queryKey: queryKeys.applications.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.candidates.all });
    },
  });
}
