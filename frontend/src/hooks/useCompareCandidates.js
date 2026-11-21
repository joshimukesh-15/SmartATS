import { useQuery } from '@tanstack/react-query';
import { compareCandidates } from '../api/jobs';

export function useCompareQuery(jobId, applicationIds) {
  const isEnabled = Boolean(jobId) && Array.isArray(applicationIds) && applicationIds.length >= 2;
  return useQuery({
    queryKey: ['compare', jobId, applicationIds],
    queryFn: () => compareCandidates(jobId, applicationIds),
    enabled: isEnabled,
    staleTime: 60 * 1000,
  });
}
