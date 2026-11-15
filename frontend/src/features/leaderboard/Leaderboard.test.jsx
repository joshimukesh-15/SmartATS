import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import LeaderboardPage from './LeaderboardPage';

// Mock TanStack hooks
vi.mock('../../hooks', () => ({
  useJobs: () => ({
    data: [
      {
        job_id: 1,
        title: 'Lead Python Engineer',
        required_skills: ['Python', 'FastAPI'],
      },
    ],
    isLoading: false,
  }),
  useRankings: () => ({
    data: {
      rankings: [
        {
          application_id: 'app-1',
          candidate_name: 'Sarah Jenkins',
          candidate_email: 'sarah@example.com',
          rank: 1,
          final_score: 95.0,
          keyword_score: 100.0,
          tfidf_score: 87.5,
          matched_skills: ['Python', 'FastAPI'],
          missing_skills: [],
        },
        {
          application_id: 'app-2',
          candidate_name: 'Alex Rivera',
          candidate_email: 'alex@example.com',
          rank: 2,
          final_score: 85.0,
          keyword_score: 80.0,
          tfidf_score: 82.5,
          matched_skills: ['Python'],
          missing_skills: ['FastAPI'],
        },
      ],
    },
    isLoading: false,
  }),
}));

describe('Leaderboard Page', () => {
  it('renders candidates and allows selecting rows', () => {
    render(
      <MemoryRouter>
        <LeaderboardPage />
      </MemoryRouter>
    );

    expect(screen.getAllByText('Sarah Jenkins').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Alex Rivera').length).toBeGreaterThan(0);

    // Click second candidate row
    const alexRow = screen.getAllByText('Alex Rivera')[0].closest('tr');
    fireEvent.click(alexRow);

    // Verify right panel updates (detail panel shows Alex's email)
    const emails = screen.getAllByText('alex@example.com');
    expect(emails.length).toBeGreaterThan(0);
  });

  it('supports keyboard navigation via ArrowDown and ArrowUp', () => {
    render(
      <MemoryRouter>
        <LeaderboardPage />
      </MemoryRouter>
    );

    // Press ArrowDown to select next candidate
    fireEvent.keyDown(window, { key: 'ArrowDown' });
    const alexEmails = screen.getAllByText('alex@example.com');
    expect(alexEmails.length).toBeGreaterThan(0);

    // Press ArrowUp to select first candidate again
    fireEvent.keyDown(window, { key: 'ArrowUp' });
    const sarahEmails = screen.getAllByText('sarah@example.com');
    expect(sarahEmails.length).toBeGreaterThan(0);
  });
});
