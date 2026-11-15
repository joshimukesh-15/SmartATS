import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import AnalyticsPage from './AnalyticsPage';

const mockUseJobs = vi.fn();
const mockUseJobAnalytics = vi.fn();

vi.mock('../../hooks', () => ({
  useJobs: () => mockUseJobs(),
  useJobAnalytics: (...args) => mockUseJobAnalytics(...args),
}));

describe('AnalyticsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders clean empty state with true zeros when job has 0 candidates/applications', () => {
    mockUseJobs.mockReturnValue({
      data: [{ job_id: 1, title: 'Backend Engineer', application_count: 0 }],
      isLoading: false,
    });

    mockUseJobAnalytics.mockReturnValue({
      data: {
        job_id: 1,
        job_title: 'Backend Engineer',
        total_applications: 0,
        total_processed: 0,
        average_final_score: 0.0,
        score_buckets: { '80-100%': 0, '60-79%': 0, '40-59%': 0, '<40%': 0 },
        stage_distribution: { New: 0, Reviewing: 0, Interview: 0, Hired: 0, Rejected: 0 },
        most_common_matched_skills: [],
        most_frequently_missing_skills: [],
      },
      isLoading: false,
    });

    render(
      <MemoryRouter>
        <AnalyticsPage />
      </MemoryRouter>
    );

    // Verify NO fabricated fallback values
    expect(screen.queryByText(/82\.5%/)).toBeNull();
    expect(screen.queryByText(/84\.0%/)).toBeNull();
    expect(screen.queryByText('Python')).toBeNull();
    expect(screen.queryByText('Docker')).toBeNull();
    expect(screen.queryByText('Kubernetes')).toBeNull();

    // Verify true zero metrics
    expect(screen.getAllByText('0.0%')).toHaveLength(2);
    expect(screen.getByText('No verified skill coverage data available yet.')).toBeInTheDocument();
    expect(screen.getByText('No skill gaps detected in applicant pool.')).toBeInTheDocument();
    expect(screen.getByText('No evaluated candidates to display score tiers.')).toBeInTheDocument();
    expect(screen.getByText('No applicants in the review pipeline yet.')).toBeInTheDocument();
  });

  it('consumes backend response contract cleanly with real metrics', () => {
    mockUseJobs.mockReturnValue({
      data: [{ job_id: 42, title: 'AI Platform Engineer', application_count: 5 }],
      isLoading: false,
    });

    mockUseJobAnalytics.mockReturnValue({
      data: {
        job_id: 42,
        job_title: 'AI Platform Engineer',
        total_applications: 5,
        total_processed: 4,
        average_final_score: 88.5,
        average_keyword_score: 91.0,
        duplicate_count: 1,
        score_buckets: {
          '80-100%': 3,
          '60-79%': 1,
          '40-59%': 0,
          '<40%': 0,
        },
        stage_distribution: {
          New: 1,
          Reviewing: 2,
          Interview: 1,
          Hired: 1,
          Rejected: 0,
        },
        most_common_matched_skills: [
          { skill: 'PyTorch', count: 4 },
          { skill: 'Rust', count: 2 },
        ],
        most_frequently_missing_skills: [
          { skill: 'Triton', count: 3 },
        ],
      },
      isLoading: false,
    });

    render(
      <MemoryRouter>
        <AnalyticsPage />
      </MemoryRouter>
    );

    // Verify real metrics are rendered
    expect(screen.getByText('88.5%')).toBeInTheDocument();
    expect(screen.getByText('91.0%')).toBeInTheDocument();
    expect(screen.getByText('PyTorch')).toBeInTheDocument();
    expect(screen.getByText('Rust')).toBeInTheDocument();
    expect(screen.getByText('Triton')).toBeInTheDocument();

    // Verify skill counts: 4 / 4 (100%) and 2 / 4 (50%)
    expect(screen.getByText('4 / 4 (100%)')).toBeInTheDocument();
    expect(screen.getByText('2 / 4 (50%)')).toBeInTheDocument();
    expect(screen.getByText(/Missing in 3 resumes \(75%\)/)).toBeInTheDocument();
  });

  it('renders empty state when no jobs exist', () => {
    mockUseJobs.mockReturnValue({
      data: [],
      isLoading: false,
    });

    mockUseJobAnalytics.mockReturnValue({
      data: null,
      isLoading: false,
    });

    render(
      <MemoryRouter>
        <AnalyticsPage />
      </MemoryRouter>
    );

    expect(screen.getByText('No jobs to analyze')).toBeInTheDocument();
  });
});
