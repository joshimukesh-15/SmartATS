import { useQuery } from '@tanstack/react-query';
import { fetchOverviewAnalytics } from '../api/analytics';
import { queryKeys } from '../api/queryKeys';

export function useOverviewAnalytics() {
  return useQuery({
    queryKey: queryKeys.analytics.overview(),
    queryFn: fetchOverviewAnalytics,
    staleTime: 30 * 1000,
  });
}
