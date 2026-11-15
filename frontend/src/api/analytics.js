import { apiClient } from './client';

export async function fetchOverviewAnalytics() {
  return apiClient('analytics/overview');
}
