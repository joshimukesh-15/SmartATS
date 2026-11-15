import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchJobs, createJob, deleteJob } from '../api/jobs';
import { queryKeys } from '../api/queryKeys';

export function useJobs() {
  return useQuery({
    queryKey: queryKeys.jobs.lists(),
    queryFn: fetchJobs,
    staleTime: 30 * 1000,
  });
}

export function useCreateJob() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createJob,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.jobs.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.analytics.all });
    },
  });
}

export function useDeleteJob() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteJob,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.jobs.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.analytics.all });
    },
  });
}
