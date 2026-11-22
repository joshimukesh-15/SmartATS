import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
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
});
