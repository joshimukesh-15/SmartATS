/**
 * Standardized API client for SmartATS.
 */

export class ApiError extends Error {
  constructor(message, status, data = null) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

const DEFAULT_BASE_URL = '/api/v1';

export function getApiBaseUrl() {
  return import.meta.env.VITE_API_BASE || DEFAULT_BASE_URL;
}

export async function apiClient(endpoint, options = {}) {
  const baseUrl = getApiBaseUrl().replace(/\/$/, '');
  const url = `${baseUrl}/${endpoint.replace(/^\//, '')}`;

  const { method = 'GET', headers = {}, body, ...customConfig } = options;

  const isFormData = body instanceof FormData;
  const config = {
    method,
    headers: {
      ...(!isFormData ? { 'Content-Type': 'application/json' } : {}),
      ...headers,
    },
    ...customConfig,
  };

  if (body) {
    config.body = isFormData ? body : JSON.stringify(body);
  }

  let response;
  try {
    response = await fetch(url, config);
  } catch (networkError) {
    throw new ApiError(networkError.message || 'Unable to connect to SmartATS server', 0, null);
  }

  if (!response.ok) {
    let errorData = null;
    let errorMessage = `HTTP Error ${response.status}: ${response.statusText}`;
    try {
      errorData = await response.json();
      if (errorData?.detail) {
        errorMessage =
          typeof errorData.detail === 'string'
            ? errorData.detail
            : JSON.stringify(errorData.detail);
      } else if (errorData?.message) {
        errorMessage = errorData.message;
      }
    } catch {
      // Non-JSON error payload
    }
    throw new ApiError(errorMessage, response.status, errorData);
  }

  // If 204 No Content
  if (response.status === 204) {
    return null;
  }

  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    return response.json();
  }

  return response.text();
}
