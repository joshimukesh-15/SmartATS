import { useMutation, useQueryClient } from '@tanstack/react-query';
import { uploadResumes } from '../api/jobs';
import { queryKeys } from '../api/queryKeys';

export function useUploadResumes(jobId) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (files) => uploadResumes(jobId, files),
    onSuccess: () => {
      if (jobId) {
        queryClient.invalidateQueries({ queryKey: queryKeys.jobs.rankings(jobId) });
        queryClient.invalidateQueries({ queryKey: queryKeys.jobs.analytics(jobId) });
      }
      queryClient.invalidateQueries({ queryKey: queryKeys.jobs.lists() });
      queryClient.invalidateQueries({ queryKey: queryKeys.analytics.all });
    },
  });
}
