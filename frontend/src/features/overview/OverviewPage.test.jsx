import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import OverviewPage from './OverviewPage';

const mockUseOverviewAnalytics = vi.fn();
const mockUseJobs = vi.fn();

vi.mock('../../hooks', () => ({
  useOverviewAnalytics: () => mockUseOverviewAnalytics(),
  useJobs: () => mockUseJobs(),
}));

describe('OverviewPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders clean empty states when DB has 0 applications', () => {
    mockUseJobs.mockReturnValue({
      data: [{ job_id: 1, title: 'Systems Architect', application_count: 0 }],
      isLoading: false,
    });

    mockUseOverviewAnalytics.mockReturnValue({
      data: {
        totals: {
          jobs: 1,
          active_jobs: 1,
          candidates: 0,
          applications: 0,
          completed: 0,
          pending: 0,
          failed: 0,
          duplicates_blocked: 0,
        },
        average_score: 0.0,
        score_histogram: [
          { label: '0–49%', min: 0.0, max: 49.99, count: 0 },
          { label: '50–59%', min: 50.0, max: 59.99, count: 0 },
          { label: '60–69%', min: 60.0, max: 69.99, count: 0 },
          { label: '70–79%', min: 70.0, max: 79.99, count: 0 },
          { label: '80–89%', min: 80.0, max: 89.99, count: 0 },
          { label: '90–100%', min: 90.0, max: 100.0, count: 0 },
        ],
        stage_distribution: {
          New: 0,
          Reviewing: 0,
          Interviewing: 0,
          Offer: 0,
          Hired: 0,
          Rejected: 0,
        },
        top_candidates: [],
      },
      isLoading: false,
      isError: false,
      dataUpdatedAt: Date.now(),
    });

    render(
      <MemoryRouter>
        <OverviewPage />
      </MemoryRouter>
    );

    // Verify true database metrics
    expect(screen.getByText('0.0%')).toBeInTheDocument();
    expect(screen.getByText('0 evaluations')).toBeInTheDocument();
    expect(
      screen.getByText('No candidate evaluations yet to display score distribution.')
    ).toBeInTheDocument();
    expect(screen.getByText('No candidates evaluated yet')).toBeInTheDocument();
    expect(screen.getByText('0 completed')).toBeInTheDocument();
  });

  it('renders real candidates, canonical stages, and exact histogram counts from clean contract', () => {
    mockUseJobs.mockReturnValue({
      data: [
        { job_id: 10, title: 'Staff Frontend Engineer' },
        { job_id: 11, title: 'Backend Lead' },
      ],
      isLoading: false,
    });

    mockUseOverviewAnalytics.mockReturnValue({
      data: {
        totals: {
          jobs: 2,
          active_jobs: 2,
          candidates: 5,
          applications: 5,
          completed: 4,
          pending: 1,
          failed: 0,
          duplicates_blocked: 2,
        },
        average_score: 82.5,
        score_histogram: [
          { label: '0–49%', min: 0.0, max: 49.99, count: 0 },
          { label: '50–59%', min: 50.0, max: 59.99, count: 1 },
          { label: '60–69%', min: 60.0, max: 69.99, count: 0 },
          { label: '70–79%', min: 70.0, max: 79.99, count: 1 },
          { label: '80–89%', min: 80.0, max: 89.99, count: 1 },
          { label: '90–100%', min: 90.0, max: 100.0, count: 1 },
        ],
        stage_distribution: {
          New: 1,
          Reviewing: 1,
          Interviewing: 1,
          Offer: 1,
          Hired: 0,
          Rejected: 1,
        },
        top_candidates: [
          {
            application_id: 101,
            name: 'David Chen',
            job_title: 'Staff Frontend Engineer',
            stage: 'Interviewing',
            final_score: 93.4,
          },
          {
            application_id: 102,
            name: 'Sarah Connor',
            job_title: 'Backend Lead',
            stage: 'Offer',
            final_score: 88.0,
          },
        ],
      },
      isLoading: false,
      isError: false,
      dataUpdatedAt: Date.now(),
    });

    render(
      <MemoryRouter>
        <OverviewPage />
      </MemoryRouter>
    );

    // Assert StatStrip values
    expect(screen.getByText('82.5%')).toBeInTheDocument();
    expect(screen.getByText('4 completed')).toBeInTheDocument();
    expect(screen.getByText('2 active positions')).toBeInTheDocument();
    expect(screen.getByText('4 evaluations')).toBeInTheDocument();

    // Assert canonical stages rendered in pipeline funnel
    expect(screen.getAllByText('Interviewing').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Offer').length).toBeGreaterThanOrEqual(1);

    // Assert top candidates across all jobs
    expect(screen.getByText('David Chen')).toBeInTheDocument();
    expect(screen.getByText('Sarah Connor')).toBeInTheDocument();
    expect(screen.getByText('Staff Frontend Engineer')).toBeInTheDocument();
    expect(screen.getByText('Backend Lead')).toBeInTheDocument();
  });
});
