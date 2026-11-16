import { apiClient } from './client';

export async function fetchApplication(applicationId) {
  return apiClient(`applications/${applicationId}`);
}

export async function updateApplicationStage(applicationId, { stage, note, changed_by }) {
  return apiClient(`applications/${applicationId}/stage`, {
    method: 'PATCH',
    body: { stage, note, changed_by },
  });
}

export async function addApplicationNote(applicationId, { content, author }) {
  return apiClient(`applications/${applicationId}/notes`, {
    method: 'POST',
    body: { content, author },
  });
}

export async function fetchApplicationHistory(applicationId) {
  return apiClient(`applications/${applicationId}/history`);
}

export async function downloadResumeFile(applicationId, filename = 'resume.pdf') {
  const blob = await apiClient(`applications/${applicationId}/download`, { responseType: 'blob' });
  const blobUrl = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = blobUrl;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => window.URL.revokeObjectURL(blobUrl), 1000);
}

export async function previewResumeFile(applicationId) {
  const blob = await apiClient(`applications/${applicationId}/preview`, { responseType: 'blob' });
  const blobUrl = window.URL.createObjectURL(blob);
  window.open(blobUrl, '_blank', 'noopener,noreferrer');
  setTimeout(() => window.URL.revokeObjectURL(blobUrl), 60000);
}
