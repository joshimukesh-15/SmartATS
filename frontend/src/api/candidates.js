import { apiClient } from './client';

export async function fetchCandidateDetails(candidateId) {
  if (!candidateId) return null;
  return apiClient(`candidates/${candidateId}`);
}
