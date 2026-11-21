import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { StatStrip } from './StatStrip';
import {
  useStatStripConfig,
  formatStatProcessed,
  formatStatAverageScore,
  formatStatDuplicatesBlocked,
} from './statStripConfig';

function TestStatStripConsumer({ data, options }) {
  const { processed, averageScore, duplicatesBlocked } = useStatStripConfig(data, options);
  return <StatStrip items={[processed, averageScore, duplicatesBlocked]} />;
}

describe('StatStrip and shared helpers', () => {
  it('renders stat items properly', () => {
    const items = [
      { label: 'Job Openings', value: 3, caption: 'Active jobs' },
      { label: 'Processed', value: 10, caption: 'Ingested resumes' },
    ];
    render(<StatStrip items={items} />);

    expect(screen.getByText('Job Openings')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.getByText('Active jobs')).toBeInTheDocument();
    expect(screen.getByText('Processed')).toBeInTheDocument();
    expect(screen.getByText('10')).toBeInTheDocument();
  });

  it('formats processed, average score, and duplicates blocked correctly', () => {
    const mockData = {
      total_processed: 25,
      average_final_score: 87.4,
      duplicate_count: 3,
    };

    const processed = formatStatProcessed(mockData);
    expect(processed.label).toBe('Processed');
    expect(processed.value).toBe(25);

    const avgScore = formatStatAverageScore(mockData);
    expect(avgScore.label).toBe('Average Score');
    expect(avgScore.value).toBe('87.4%');

    const duplicates = formatStatDuplicatesBlocked(mockData);
    expect(duplicates.label).toBe('Duplicates Blocked');
    expect(duplicates.value).toBe(3);
  });

  it('useStatStripConfig unifies stat items for consumers', () => {
    const mockData = {
      total_applications: 14,
      average_score: 79.2,
      duplicate_resumes: 2,
    };

    render(
      <TestStatStripConsumer
        data={mockData}
        options={{
          processed: { label: 'Applications Ingested' },
          averageScore: { caption: 'Score average' },
          duplicatesBlocked: { caption: 'Duplicates' },
        }}
      />
    );

    expect(screen.getByText('Applications Ingested')).toBeInTheDocument();
    expect(screen.getByText('14')).toBeInTheDocument();
    expect(screen.getByText('Average Score')).toBeInTheDocument();
    expect(screen.getByText('79.2%')).toBeInTheDocument();
    expect(screen.getByText('Score average')).toBeInTheDocument();
    expect(screen.getByText('Duplicates Blocked')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
  });
});
