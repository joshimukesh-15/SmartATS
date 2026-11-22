import { screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { renderWithQueryClient as render } from '../../test-utils/renderWithQueryClient';
import LeaderboardPage from './LeaderboardPage';
import TableView from '../candidates/views/TableView';

vi.mock('../../hooks', () => ({
  useJobs: () => ({
    data: [
      {
        job_id: 1,
        title: 'Lead Python Engineer',
        processing_status: 'Re-scoring',
      },
    ],
    isLoading: false,
  }),
  useRankings: () => ({
    data: {
      processing_status: 'Re-scoring',
      rankings: [
        {
          application_id: 'app-rescore',
          candidate_name: 'Morgan Rescore',
          candidate_email: 'morgan@example.com',
          review_stage: 'Reviewing',
          processing_status: 'Re-scoring',
          rank: 1,
          final_score: 91.0,
          keyword_score: 90.0,
          tfidf_score: 85.0,
          experience_years: 5.0,
          seniority_level: 'Mid-Senior',
          matched_skills: ['Python'],
          missing_skills: [],
          notes: [],
          status_history: [],
        },
      ],
    },
    isLoading: false,
  }),
  useUpdateApplicationStage: () => ({
    mutateAsync: vi.fn().mockResolvedValue({}),
    isPending: false,
  }),
  useAddApplicationNote: () => ({
    mutateAsync: vi.fn().mockResolvedValue({}),
    isPending: false,
  }),
  useUpdateJobWeights: () => ({
    mutateAsync: vi.fn().mockResolvedValue({}),
    isPending: false,
  }),
}));

describe('Leaderboard Re-scoring Status rendering', () => {
  it('renders re-scoring banner and badges when application or job is re-scoring', () => {
    render(
      <MemoryRouter>
        <LeaderboardPage />
      </MemoryRouter>
    );

    // Banner is rendered
    expect(screen.getByTestId('rescoring-banner')).toBeInTheDocument();
    expect(screen.getByText('Re-scoring in progress')).toBeInTheDocument();

    // Badges are rendered
    const rescoreBadges = screen.getAllByText('Re-scoring');
    expect(rescoreBadges.length).toBeGreaterThan(0);
  });

  it('renders StatusBadge inside TableView row when candidate processing_status is PROCESSING', () => {
    const candidate = {
      application_id: 'app-99',
      candidate_name: 'Taylor Test',
      processing_status: 'PROCESSING',
      review_stage: 'New',
      rank: 1,
      final_score: 75.0,
      matched_skills: ['Python'],
    };

    render(
      <MemoryRouter>
        <TableView
          candidates={[candidate]}
          rawCandidates={[candidate]}
          activeJob={{ job_id: 1, title: 'Lead Python Engineer' }}
          activeJobId="1"
          selection={{ selectedForCompare: [] }}
        />
      </MemoryRouter>
    );

    expect(screen.getByText('Processing')).toBeInTheDocument();
  });
});
