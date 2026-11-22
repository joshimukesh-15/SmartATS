/* eslint-disable react-refresh/only-export-components */
import { lazy, Suspense } from 'react';
import { createBrowserRouter, Navigate, useParams, useSearchParams } from 'react-router-dom';
import { RouteSkeleton } from './RouteSkeleton';
import { ErrorBoundary } from './ErrorBoundary';
import { RequireAuth } from './RequireAuth';

const LandingPage = lazy(() => import('../features/landing/LandingPage'));
const LoginPage = lazy(() => import('../features/auth/LoginPage'));
const StudioLayout = lazy(() => import('./StudioLayout'));
const OverviewPage = lazy(() => import('../features/overview/OverviewPage'));
const JobsPage = lazy(() => import('../features/jobs/JobsPage'));
const UploadPage = lazy(() => import('../features/upload/UploadPage'));
const CandidateWorkspace = lazy(() => import('../features/candidates/CandidateWorkspace'));
const AnalyticsPage = lazy(() => import('../features/analytics/AnalyticsPage'));

function LeaderboardRedirect() {
  const { jobId } = useParams();
  const [searchParams] = useSearchParams();
  const next = new URLSearchParams(searchParams);
  next.set('view', 'table');
  if (jobId) {
    next.set('job', jobId);
    next.set('jobId', jobId);
  }
  return <Navigate to={`/studio/candidates?${next.toString()}`} replace />;
}

function ReviewRedirect() {
  const [searchParams] = useSearchParams();
  const next = new URLSearchParams(searchParams);
  next.set('view', 'board');
  return <Navigate to={`/studio/candidates?${next.toString()}`} replace />;
}

function CompareRedirect() {
  const { jobId } = useParams();
  const [searchParams] = useSearchParams();
  const next = new URLSearchParams(searchParams);
  if (jobId) {
    next.set('job', jobId);
    next.set('jobId', jobId);
  }
  next.set('compare', 'true');
  return <Navigate to={`/studio/candidates?${next.toString()}`} replace />;
}

const wrap = (node) => (
  <ErrorBoundary>
    <Suspense fallback={<RouteSkeleton />}>{node}</Suspense>
  </ErrorBoundary>
);

export const router = createBrowserRouter([
  {
    path: '/',
    element: wrap(<LandingPage />),
  },
  {
    path: '/login',
    element: wrap(<LoginPage />),
  },
  {
    path: '/studio',
    element: <RequireAuth>{wrap(<StudioLayout />)}</RequireAuth>,
    children: [
      {
        index: true,
        element: wrap(<OverviewPage />),
      },
      {
        path: 'overview',
        element: <Navigate to="/studio" replace />,
      },
      {
        path: 'jobs',
        element: wrap(<JobsPage />),
      },
      {
        path: 'upload',
        element: wrap(<UploadPage />),
      },
      {
        path: 'candidates',
        element: wrap(<CandidateWorkspace />),
      },
      {
        path: 'leaderboard',
        element: <LeaderboardRedirect />,
      },
      {
        path: 'leaderboard/:jobId',
        element: <LeaderboardRedirect />,
      },
      {
        path: 'review',
        element: <ReviewRedirect />,
      },
      {
        path: 'compare',
        element: <CompareRedirect />,
      },
      {
        path: 'compare/:jobId',
        element: <CompareRedirect />,
      },
      {
        path: 'analytics',
        element: wrap(<AnalyticsPage />),
      },
      {
        path: 'analytics/:jobId',
        element: wrap(<AnalyticsPage />),
      },
    ],
  },
  {
    path: '*',
    element: <Navigate to="/" replace />,
  },
]);
