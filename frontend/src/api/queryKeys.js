/**
 * TanStack Query Key Factory for SmartATS.
 */

export const queryKeys = {
  jobs: {
    all: ['jobs'],
    lists: () => [...queryKeys.jobs.all, 'list'],
    detail: (id) => [...queryKeys.jobs.all, 'detail', String(id)],
    rankings: (id, weights = null) => [
      ...queryKeys.jobs.all,
      'rankings',
      String(id),
      weights ? JSON.stringify(weights) : 'default',
    ],
    quality: (id) => [...queryKeys.jobs.all, 'quality', String(id)],
    analytics: (id) => [...queryKeys.jobs.all, 'analytics', String(id)],
  },
  analytics: {
    all: ['analytics'],
    overview: () => [...queryKeys.analytics.all, 'overview'],
  },
  candidates: {
    all: ['candidates'],
    detail: (id) => [...queryKeys.candidates.all, 'detail', String(id)],
  },
  applications: {
    all: ['applications'],
    detail: (id) => [...queryKeys.applications.all, 'detail', String(id)],
    history: (id) => [...queryKeys.applications.all, 'history', String(id)],
  },
};
