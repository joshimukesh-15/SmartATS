import { useQuery } from '@tanstack/react-query';
import { fetchJobRankings } from '../api/jobs';
import { queryKeys } from '../api/queryKeys';

export function useRankings(jobId, weights = null) {
  return useQuery({
    queryKey: queryKeys.jobs.rankings(jobId, weights),
    queryFn: () => fetchJobRankings(jobId, weights),
    enabled: Boolean(jobId),
    staleTime: 20 * 1000,
  });
}
