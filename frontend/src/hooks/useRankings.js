import { useQuery } from '@tanstack/react-query';
import { fetchJobRankings } from '../api/jobs';
import { queryKeys } from '../api/queryKeys';

export function useRankings(jobId) {
  return useQuery({
    queryKey: queryKeys.jobs.rankings(jobId),
    queryFn: () => fetchJobRankings(jobId),
    enabled: Boolean(jobId),
    staleTime: 20 * 1000,
  });
}
