import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockUseQuery = vi.hoisted(() => vi.fn());
vi.mock('@tanstack/react-query', () => ({ useQuery: mockUseQuery }));

import { useRankings } from './useRankings';

describe('useRankings', () => {
  beforeEach(() => {
    mockUseQuery.mockReset();
  });

  it('polls while applications are pending or being re-scored', () => {
    useRankings('12');
    const queryOptions = mockUseQuery.mock.calls[0][0];

    expect(
      queryOptions.refetchInterval({
        state: { data: { rankings: [{ processing_status: 'Re-scoring' }] } },
      })
    ).toBe(2000);
    expect(
      queryOptions.refetchInterval({
        state: { data: { rankings: [{ processing_status: 'PENDING' }] } },
      })
    ).toBe(2000);
  });

  it('stops polling when every application has a terminal status', () => {
    useRankings('12');
    const queryOptions = mockUseQuery.mock.calls[0][0];

    expect(
      queryOptions.refetchInterval({
        state: { data: { rankings: [{ processing_status: 'COMPLETED' }, { processing_status: 'FAILED' }] } },
      })
    ).toBe(false);
  });
});
