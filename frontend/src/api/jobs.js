import { apiClient, getApiBaseUrl } from './client';

export async function fetchJobs() {
  return apiClient('jobs/');
}

export async function createJob(jobData) {
  return apiClient('jobs/', {
    method: 'POST',
    body: jobData,
  });
}

export async function deleteJob(jobId) {
  await apiClient(`jobs/${jobId}`, {
    method: 'DELETE',
  });
  return true;
}

export async function fetchJobRankings(jobId) {
  if (!jobId) return [];
  return apiClient(`jobs/${jobId}/rankings/`);
}

export async function fetchJobAnalytics(jobId) {
  if (!jobId) return null;
  return apiClient(`jobs/${jobId}/analytics`);
}

export async function uploadResumes(jobId, files) {
  const formData = new FormData();
  const fileArray = Array.from(files);
  fileArray.forEach((file) => {
    formData.append('files', file);
  });

  return apiClient(`jobs/${jobId}/upload-resumes/`, {
    method: 'POST',
    body: formData,
  });
}

export async function compareCandidates(jobId, applicationIds) {
  return apiClient(`jobs/${jobId}/compare/`, {
    method: 'POST',
    body: { application_ids: applicationIds },
  });
}

export function getExportCsvUrl(jobId) {
  const base = getApiBaseUrl().replace(/\/$/, '');
  return `${base}/jobs/${jobId}/export/csv`;
}
