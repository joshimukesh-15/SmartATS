import { renderHook, act } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { useCandidateSelection } from './useCandidateSelection';

const mockCandidates = [
  { application_id: 101, candidate_name: 'Alice Smith', review_stage: 'New' },
  { application_id: 202, candidate_name: 'Bob Jones', review_stage: 'Interviewing' },
  { application_id: 303, candidate_name: 'Charlie Brown', review_stage: 'Hired' },
];

describe('useCandidateSelection hook', () => {
  it('defaults to first candidate when URL parameter is absent', () => {
    const wrapper = ({ children }) => (
      <MemoryRouter initialEntries={['/studio/leaderboard/1']}>
        {children}
      </MemoryRouter>
    );

    const { result } = renderHook(() => useCandidateSelection(mockCandidates), { wrapper });

    expect(result.current.selectedIndex).toBe(0);
    expect(result.current.safeSelectedIndex).toBe(0);
    expect(result.current.selectedCandidate.application_id).toBe(101);
    expect(result.current.selectedCandidateId).toBe(101);
  });

  it('resolves candidate matching URL ?candidate= parameter', () => {
    const wrapper = ({ children }) => (
      <MemoryRouter initialEntries={['/studio/leaderboard/1?candidate=202']}>
        {children}
      </MemoryRouter>
    );

    const { result } = renderHook(() => useCandidateSelection(mockCandidates), { wrapper });

    expect(result.current.selectedIndex).toBe(1);
    expect(result.current.selectedCandidate.application_id).toBe(202);
    expect(result.current.selectedCandidate.candidate_name).toBe('Bob Jones');
  });

  it('falls back safely to first candidate when URL parameter is unknown', () => {
    const wrapper = ({ children }) => (
      <MemoryRouter initialEntries={['/studio/leaderboard/1?candidate=999']}>
        {children}
      </MemoryRouter>
    );

    const { result } = renderHook(() => useCandidateSelection(mockCandidates), { wrapper });

    expect(result.current.selectedIndex).toBe(0);
    expect(result.current.selectedCandidate.application_id).toBe(101);
  });

  it('handles empty candidates array gracefully', () => {
    const wrapper = ({ children }) => (
      <MemoryRouter initialEntries={['/studio/leaderboard/1?candidate=101']}>
        {children}
      </MemoryRouter>
    );

    const { result } = renderHook(() => useCandidateSelection([]), { wrapper });

    expect(result.current.selectedIndex).toBe(-1);
    expect(result.current.safeSelectedIndex).toBe(0);
    expect(result.current.selectedCandidate).toBeNull();
    expect(result.current.selectedCandidateId).toBeNull();
  });

  it('updates selection and URL param when setSelectedCandidateId is called', () => {
    const wrapper = ({ children }) => (
      <MemoryRouter initialEntries={['/studio/leaderboard/1']}>
        {children}
      </MemoryRouter>
    );

    const { result } = renderHook(() => useCandidateSelection(mockCandidates), { wrapper });

    act(() => {
      result.current.setSelectedCandidateId(303);
    });

    expect(result.current.selectedIndex).toBe(2);
    expect(result.current.selectedCandidate.application_id).toBe(303);
  });

  it('supports setting selection by index', () => {
    const wrapper = ({ children }) => (
      <MemoryRouter initialEntries={['/studio/leaderboard/1']}>
        {children}
      </MemoryRouter>
    );

    const { result } = renderHook(() => useCandidateSelection(mockCandidates), { wrapper });

    act(() => {
      result.current.setSelectedIndex(1);
    });

    expect(result.current.selectedIndex).toBe(1);
    expect(result.current.selectedCandidate.application_id).toBe(202);
  });

  it('manages candidate comparison selection and limit', () => {
    const wrapper = ({ children }) => (
      <MemoryRouter initialEntries={['/studio/leaderboard/1']}>
        {children}
      </MemoryRouter>
    );

    const { result } = renderHook(() => useCandidateSelection(mockCandidates), { wrapper });

    act(() => {
      result.current.handleToggleCompare(101);
      result.current.handleToggleCompare(202);
    });

    expect(result.current.selectedForCompare).toEqual([101, 202]);

    act(() => {
      result.current.handleToggleCompare(101);
    });

    expect(result.current.selectedForCompare).toEqual([202]);

    act(() => {
      result.current.clearCompare();
    });

    expect(result.current.selectedForCompare).toEqual([]);
  });
});
