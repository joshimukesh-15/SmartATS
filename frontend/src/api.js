const API_BASE = '/api/v1';

export async function fetchOverviewAnalytics() {
  const res = await fetch(`${API_BASE}/analytics/overview`);
  if (!res.ok) throw new Error('Failed to fetch overview analytics');
  return res.json();
}

export async function fetchJobs() {
  const res = await fetch(`${API_BASE}/jobs/`);
  if (!res.ok) throw new Error('Failed to fetch jobs');
  return res.json();
}

export async function createJob(jobData) {
  const res = await fetch(`${API_BASE}/jobs/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(jobData),
  });
  if (!res.ok) throw new Error('Failed to create job');
  return res.json();
}

export async function deleteJob(jobId) {
  const res = await fetch(`${API_BASE}/jobs/${jobId}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error('Failed to delete job');
  return true;
}

export async function fetchJobRankings(jobId) {
  const res = await fetch(`${API_BASE}/jobs/${jobId}/rankings/`);
  if (!res.ok) throw new Error('Failed to fetch rankings');
  return res.json();
}

export async function fetchJobAnalytics(jobId) {
  const res = await fetch(`${API_BASE}/jobs/${jobId}/analytics`);
  if (!res.ok) throw new Error('Failed to fetch job analytics');
  return res.json();
}

export async function uploadResumes(jobId, files) {
  const formData = new FormData();
  for (let i = 0; i < files.length; i++) {
    formData.append('files', files[i]);
  }
  const res = await fetch(`${API_BASE}/jobs/${jobId}/upload-resumes/`, {
    method: 'POST',
    body: formData,
  });
  if (!res.ok) throw new Error('Failed to upload resumes');
  return res.json();
}

export async function compareCandidates(jobId, applicationIds) {
  const res = await fetch(`${API_BASE}/jobs/${jobId}/compare/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ application_ids: applicationIds }),
  });
  if (!res.ok) throw new Error('Failed to compare candidates');
  return res.json();
}

export async function fetchCandidateDetails(candidateId) {
  const res = await fetch(`${API_BASE}/candidates/${candidateId}`);
  if (!res.ok) throw new Error('Failed to fetch candidate');
  return res.json();
}

export function getExportCsvUrl(jobId) {
  return `${API_BASE}/jobs/${jobId}/export/csv`;
}
