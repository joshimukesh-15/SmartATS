import { useQuery } from '@tanstack/react-query';
import { fetchJobAnalytics } from '../api/jobs';
import { queryKeys } from '../api/queryKeys';

export function useJobAnalytics(jobId) {
  return useQuery({
    queryKey: queryKeys.jobs.analytics(jobId),
    queryFn: () => fetchJobAnalytics(jobId),
    enabled: Boolean(jobId),
    staleTime: 30 * 1000,
  });
}
