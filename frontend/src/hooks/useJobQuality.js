import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchJobQuality, checkJobQuality, updateJobWeights } from '../api/jobs';
import { queryKeys } from '../api/queryKeys';

export function useJobQuality(jobId) {
  return useQuery({
    queryKey: queryKeys.jobs.quality(jobId),
    queryFn: () => fetchJobQuality(jobId),
    enabled: Boolean(jobId),
    staleTime: 60 * 1000,
  });
}

export function useCheckJobQuality() {
  return useMutation({
    mutationFn: (jobData) => checkJobQuality(jobData),
  });
}

export function useUpdateJobWeights(jobId) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (weights) => updateJobWeights(jobId, weights),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.jobs.detail(jobId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.jobs.all });
      queryClient.invalidateQueries({ queryKey: [...queryKeys.jobs.all, 'rankings', String(jobId)] });
    },
  });
}
