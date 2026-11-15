/* eslint-disable react-refresh/only-export-components */
import { lazy, Suspense } from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { RouteSkeleton } from './RouteSkeleton';
import { ErrorBoundary } from './ErrorBoundary';

const LandingPage = lazy(() => import('../features/landing/LandingPage'));
const StudioLayout = lazy(() => import('./StudioLayout'));
const OverviewPage = lazy(() => import('../features/overview/OverviewPage'));
const JobsPage = lazy(() => import('../features/jobs/JobsPage'));
const UploadPage = lazy(() => import('../features/upload/UploadPage'));
const LeaderboardPage = lazy(() => import('../features/leaderboard/LeaderboardPage'));
const ComparePage = lazy(() => import('../features/compare/ComparePage'));
const AnalyticsPage = lazy(() => import('../features/analytics/AnalyticsPage'));

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
    path: '/studio',
    element: wrap(<StudioLayout />),
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
        path: 'leaderboard',
        element: wrap(<LeaderboardPage />),
      },
      {
        path: 'leaderboard/:jobId',
        element: wrap(<LeaderboardPage />),
      },
      {
        path: 'compare',
        element: wrap(<ComparePage />),
      },
      {
        path: 'compare/:jobId',
        element: wrap(<ComparePage />),
      },
      {
        path: 'analytics',
        element: wrap(<AnalyticsPage />),
      },
      {
        path: 'analytics/:jobId',
        element: wrap(<AnalyticsPage />),
      },
      {
        path: '*',
        element: <Navigate to="/studio" replace />,
      },
    ],
  },
  {
    path: '*',
    element: <Navigate to="/" replace />,
  },
]);
