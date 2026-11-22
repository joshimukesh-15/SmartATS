import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import JobsPage from './JobsPage';

const mockDelete = vi.hoisted(() => vi.fn());

vi.mock('../../hooks', () => ({
  useJobs: () => ({
    data: [{
      job_id: 17,
      title: 'Senior Platform Engineer',
      description: 'Build reliable systems.',
      required_skills: ['Python'],
      preferred_skills: [],
      application_count: 3,
    }],
    isLoading: false,
    isError: false,
    refetch: vi.fn(),
  }),
  useDeleteJob: () => ({ mutate: mockDelete, isPending: false }),
}));

vi.mock('./CreateJobDialog', () => ({ default: () => null }));
vi.mock('./JobQualityDialog', () => ({ default: () => null }));

describe('JobsPage destructive actions', () => {
  beforeEach(() => mockDelete.mockReset());

  it('explains the impact and only deletes after explicit confirmation', () => {
    render(
      <MemoryRouter>
        <JobsPage />
      </MemoryRouter>
    );

    fireEvent.click(screen.getByRole('button', { name: 'Delete opening' }));
    expect(screen.getByText('Delete job opening?')).toBeInTheDocument();
    expect(screen.getByText(/3 candidate application\(s\).*cannot be undone/i)).toBeInTheDocument();
    expect(mockDelete).not.toHaveBeenCalled();

    fireEvent.click(screen.getByText('Delete opening'));
    expect(mockDelete).toHaveBeenCalledWith(17, expect.objectContaining({ onSuccess: expect.any(Function) }));
  });
});
