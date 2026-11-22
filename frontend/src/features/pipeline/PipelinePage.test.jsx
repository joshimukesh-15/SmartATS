import { screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { renderWithQueryClient as render } from '../../test-utils/renderWithQueryClient';
import PipelinePage from './PipelinePage';

const mockUseJobs = vi.fn();
const mockUseRankings = vi.fn();
const mockMutateAsync = vi.fn();

vi.mock('../../hooks', () => ({
  useJobs: () => mockUseJobs(),
  useRankings: (...args) => mockUseRankings(...args),
  useUpdateApplicationStage: () => ({
    mutateAsync: mockMutateAsync,
    isPending: false,
  }),
  useAddApplicationNote: () => ({
    mutateAsync: vi.fn(),
    isPending: false,
  }),
  useApplicationHistory: () => ({
    data: [],
    isLoading: false,
  }),
}));

describe('PipelinePage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders all 6 Kanban stage columns and candidate count', () => {
    mockUseJobs.mockReturnValue({
      data: [{ job_id: 1, title: 'Senior Frontend Engineer' }],
      isLoading: false,
    });

    mockUseRankings.mockReturnValue({
      data: {
        rankings: [
          {
            application_id: 'app-1',
            candidate_name: 'Alice Smith',
            candidate_email: 'alice@example.com',
            review_stage: 'New',
            rank: 1,
            final_score: 92.0,
            experience_years: 6,
            seniority_level: 'Senior',
            matched_skills: ['React', 'TypeScript', 'Tailwind'],
          },
          {
            application_id: 'app-2',
            candidate_name: 'Bob Johnson',
            candidate_email: 'bob@example.com',
            review_stage: 'Interviewing',
            rank: 2,
            final_score: 84.5,
            experience_years: 4,
            seniority_level: 'Mid-level',
            matched_skills: ['JavaScript', 'HTML'],
          },
        ],
      },
      isLoading: false,
      error: null,
    });

    render(
      <MemoryRouter>
        <PipelinePage />
      </MemoryRouter>
    );

    // Header verification
    expect(screen.getByText('Pipeline Board')).toBeInTheDocument();
    expect(screen.getByText('2 candidates')).toBeInTheDocument();
    expect(screen.getAllByText(/Senior Frontend Engineer/)[0]).toBeInTheDocument();

    // Verify all 6 stage columns are rendered
    expect(screen.getAllByText('New').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Reviewing').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Interviewing').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Offer').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Hired').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Rejected').length).toBeGreaterThanOrEqual(1);

    // Verify candidate cards in appropriate columns
    expect(screen.getByText('Alice Smith')).toBeInTheDocument();
    expect(screen.getByText('Bob Johnson')).toBeInTheDocument();
    expect(screen.getByText('92% match')).toBeInTheDocument();
    expect(screen.getByText('85% match')).toBeInTheDocument();
    expect(screen.getByText(/6 yrs/)).toBeInTheDocument();
    expect(screen.getByText(/4 yrs/)).toBeInTheDocument();
  });

  it('displays empty state when active job has zero applicants', () => {
    mockUseJobs.mockReturnValue({
      data: [{ job_id: 2, title: 'Backend Architect' }],
      isLoading: false,
    });

    mockUseRankings.mockReturnValue({
      data: { rankings: [] },
      isLoading: false,
      error: null,
    });

    render(
      <MemoryRouter>
        <PipelinePage />
      </MemoryRouter>
    );

    expect(screen.getByText('No candidates in pipeline')).toBeInTheDocument();
    expect(screen.getByText(/Upload resumes for this job opening/)).toBeInTheDocument();
  });

  it('opens slide-over drawer when a candidate card is clicked', () => {
    mockUseJobs.mockReturnValue({
      data: [{ job_id: 1, title: 'Lead Architect' }],
      isLoading: false,
    });

    mockUseRankings.mockReturnValue({
      data: {
        rankings: [
          {
            application_id: 'app-10',
            candidate_name: 'Elena Rostova',
            candidate_email: 'elena@example.com',
            review_stage: 'Reviewing',
            rank: 1,
            final_score: 95.0,
            experience_years: 8,
            seniority_level: 'Lead',
            matched_skills: ['Architecture', 'Cloud', 'System Design'],
          },
        ],
      },
      isLoading: false,
      error: null,
    });

    render(
      <MemoryRouter>
        <PipelinePage />
      </MemoryRouter>
    );

    // Card should be rendered
    const card = screen.getByText('Elena Rostova');
    expect(card).toBeInTheDocument();

    // Click candidate card to open slide-over drawer
    fireEvent.click(card);

    // Candidate detail header inside drawer should appear
    expect(screen.getByText('Elena Rostova — Dossier')).toBeInTheDocument();
  });
});
