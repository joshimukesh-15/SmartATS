import { apiClient, getApiBaseUrl } from './client';

export async function fetchJobs() {
  const res = await apiClient('jobs/');
  if (Array.isArray(res)) return res;
  if (res && Array.isArray(res.items)) {
    const items = [...res.items];
    items.total = res.total;
    items.limit = res.limit;
    items.offset = res.offset;
    items.items = res.items;
    return items;
  }
  return res;
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

export async function checkJobQuality(jobData) {
  return apiClient('jobs/quality-check/', {
    method: 'POST',
    body: jobData,
  });
}

export async function fetchJobQuality(jobId) {
  if (!jobId) return null;
  return apiClient(`jobs/${jobId}/quality-check/`);
}

export async function updateJobWeights(jobId, weights) {
  return apiClient(`jobs/${jobId}/weights`, {
    method: 'PATCH',
    body: weights,
  });
}

export async function fetchJobRankings(jobId, weights = null) {
  if (!jobId) return [];
  let url = `jobs/${jobId}/rankings/`;
  if (weights) {
    const params = new URLSearchParams();
    if (weights.weight_skills !== undefined) params.set('w_skills', weights.weight_skills);
    if (weights.weight_text !== undefined) params.set('w_text', weights.weight_text);
    if (weights.weight_experience !== undefined) params.set('w_exp', weights.weight_experience);
    if (weights.weight_education !== undefined) params.set('w_edu', weights.weight_education);
    const qs = params.toString();
    if (qs) url += `?${qs}`;
  }
  return apiClient(url);
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
