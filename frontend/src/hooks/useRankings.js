import { useQuery } from '@tanstack/react-query';
import { fetchJobRankings } from '../api/jobs';
import { queryKeys } from '../api/queryKeys';

export function useRankings(jobId, weights = null) {
  return useQuery({
    queryKey: queryKeys.jobs.rankings(jobId, weights),
    queryFn: () => fetchJobRankings(jobId, weights),
    enabled: Boolean(jobId),
    staleTime: 20 * 1000,
    refetchInterval: (query) => {
      const hasWorkInProgress = (query.state.data?.rankings || []).some((candidate) => {
        const status = (candidate.processing_status || '').toUpperCase();
        return ['PENDING', 'PROCESSING', 'RE-SCORING', 'RE_SCORING'].includes(status);
      });
      return hasWorkInProgress ? 2000 : false;
    },
  });
}
