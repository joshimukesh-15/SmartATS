import { fireEvent, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { renderWithQueryClient as render } from '../../test-utils/renderWithQueryClient';
import CandidateWorkspace from './CandidateWorkspace';

const applicants = [
  {
    application_id: 'app-1',
    candidate_name: 'Sarah Jenkins',
    candidate_email: 'sarah@example.com',
    review_stage: 'Interviewing',
    rank: 1,
    final_score: 82,
    experience_years: 6,
    seniority_level: 'Senior',
    matched_skills: ['Python', 'FastAPI'],
    missing_skills: ['Kubernetes'],
    strengths: ['Strong backend experience'],
    notes: [],
    status_history: [],
  },
  {
    application_id: 'app-2',
    candidate_name: 'Alex Rivera',
    candidate_email: 'alex@example.com',
    review_stage: 'New',
    rank: 2,
    final_score: 65,
    experience_years: 3,
    matched_skills: ['Python'],
    missing_skills: ['FastAPI'],
    strengths: [],
    notes: [],
    status_history: [],
  },
];

vi.mock('../../hooks', () => ({
  useJobs: () => ({
    data: [{ job_id: 1, title: 'Backend Engineer', required_skills: ['Python', 'FastAPI', 'Kubernetes'] }],
    isLoading: false,
  }),
  useRankings: () => ({ data: { rankings: applicants }, isLoading: false }),
  useUpdateApplicationStage: () => ({ mutateAsync: vi.fn().mockResolvedValue({}), isPending: false }),
  useAddApplicationNote: () => ({ mutateAsync: vi.fn().mockResolvedValue({}), isPending: false }),
}));

describe('Candidate workspace', () => {
  it('shows a candidate list beside a profile and updates the profile selection', () => {
    render(
      <MemoryRouter initialEntries={['/studio/candidates']}>
        <CandidateWorkspace />
      </MemoryRouter>
    );

    expect(screen.getByRole('heading', { name: 'Candidates' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Sarah Jenkins' })).toBeInTheDocument();
    expect(screen.getByText('Candidate list')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /Alex Rivera/ }));

    expect(screen.getByRole('heading', { name: 'Alex Rivera' })).toBeInTheDocument();
  });

  it('filters the list by candidate name while retaining the selected profile', () => {
    render(
      <MemoryRouter initialEntries={['/studio/candidates']}>
        <CandidateWorkspace />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByPlaceholderText('Search by name, email, or skill'), { target: { value: 'Alex' } });

    expect(screen.queryByRole('button', { name: /Sarah Jenkins/ })).not.toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Alex Rivera' })).toBeInTheDocument();
  });

  it('switches between List, Table, and Board views using the segmented control', () => {
    render(
      <MemoryRouter initialEntries={['/studio/candidates']}>
        <CandidateWorkspace />
      </MemoryRouter>
    );

    // Initial view is List
    expect(screen.getByText('Candidate list')).toBeInTheDocument();

    // Switch to Table view
    const tableBtn = screen.getByRole('tab', { name: /Table/i });
    fireEvent.click(tableBtn);
    expect(screen.getByRole('heading', { name: /Leaderboard/i })).toBeInTheDocument();

    // Switch to Board view
    const boardBtn = screen.getByRole('tab', { name: /Board/i });
    fireEvent.click(boardBtn);
    expect(screen.getByText('Pipeline Board')).toBeInTheDocument();
  });

  it('shows floating compare bar when two candidates are selected', () => {
    render(
      <MemoryRouter initialEntries={['/studio/candidates?view=list']}>
        <CandidateWorkspace />
      </MemoryRouter>
    );

    const compareCheckboxes = screen.getAllByRole('checkbox', { name: /Add .* to comparison/i });
    fireEvent.click(compareCheckboxes[0]);
    fireEvent.click(compareCheckboxes[1]);

    expect(screen.getByText(/Compare \(2 candidates\)/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Compare now/i })).toBeInTheDocument();
  });
});
