import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import OverviewPage from './OverviewPage';

const mockUseOverviewAnalytics = vi.fn();
const mockUseJobs = vi.fn();
const mockUseRankings = vi.fn();

vi.mock('../../hooks', () => ({
  useOverviewAnalytics: () => mockUseOverviewAnalytics(),
  useJobs: () => mockUseJobs(),
  useRankings: (...args) => mockUseRankings(...args),
}));

describe('OverviewPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders clean empty states with no hardcoded fallbacks when DB has 0 applications', () => {
    mockUseJobs.mockReturnValue({
      data: [{ job_id: 1, title: 'Systems Architect', application_count: 0 }],
      isLoading: false,
    });

    mockUseOverviewAnalytics.mockReturnValue({
      data: {
        total_jobs: 1,
        total_candidates: 0,
        total_applications: 0,
        processed_resumes: 0,
        pending_resumes: 0,
        failed_resumes: 0,
        duplicate_resumes: 0,
        average_score: 0.0,
        score_distribution: { '80-100%': 0, '60-79%': 0, '<60%': 0 },
        stage_distribution: { New: 0, Reviewing: 0, Interview: 0, Hired: 0, Rejected: 0 },
      },
      isLoading: false,
      isError: false,
    });

    mockUseRankings.mockReturnValue({
      data: { rankings: [] },
      isLoading: false,
    });

    render(
      <MemoryRouter>
        <OverviewPage />
      </MemoryRouter>
    );

    // Verify NO hardcoded 78.4 average score
    expect(screen.queryByText(/78\.4%/)).toBeNull();

    // Verify NO hardcoded sample candidates
    expect(screen.queryByText('Sarah Jenkins')).toBeNull();
    expect(screen.queryByText('Alex Rivera')).toBeNull();
    expect(screen.queryByText('Jordan Lee')).toBeNull();

    // Verify NO hardcoded 12 evaluations
    expect(screen.queryByText(/12 evaluations/)).toBeNull();

    // Verify true database metrics
    expect(screen.getByText('0.0%')).toBeInTheDocument();
    expect(screen.getByText('0 evaluations')).toBeInTheDocument();
    expect(screen.getByText('No candidate evaluations yet to display score distribution.')).toBeInTheDocument();
    expect(screen.getByText('No candidates evaluated yet')).toBeInTheDocument();
  });

  it('renders real candidates and score distributions when data exists', () => {
    mockUseJobs.mockReturnValue({
      data: [{ job_id: 10, title: 'Staff Frontend Engineer', application_count: 2 }],
      isLoading: false,
    });

    mockUseOverviewAnalytics.mockReturnValue({
      data: {
        total_jobs: 1,
        total_candidates: 2,
        total_applications: 2,
        processed_resumes: 2,
        pending_resumes: 0,
        failed_resumes: 0,
        duplicate_resumes: 0,
        average_score: 86.4,
        score_distribution: { '80-100%': 2, '60-79%': 0, '<60%': 0 },
        stage_distribution: { New: 1, Reviewing: 1, Interview: 0, Hired: 0, Rejected: 0 },
      },
      isLoading: false,
      isError: false,
    });

    mockUseRankings.mockReturnValue({
      data: {
        rankings: [
          {
            application_id: 'real-app-1',
            candidate_name: 'David Chen',
            candidate_email: 'david@company.com',
            review_stage: 'Reviewing',
            rank: 1,
            final_score: 91.5,
            keyword_score: 94.0,
            tfidf_score: 89.0,
          },
        ],
      },
      isLoading: false,
    });

    render(
      <MemoryRouter>
        <OverviewPage />
      </MemoryRouter>
    );

    expect(screen.getByText('86.4%')).toBeInTheDocument();
    expect(screen.getByText('David Chen')).toBeInTheDocument();
    expect(screen.getByText('david@company.com')).toBeInTheDocument();
    expect(screen.getByText('2 evaluations')).toBeInTheDocument();
  });
});
