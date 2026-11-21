import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useStageWorkflow } from './useStageWorkflow';
import * as appMutations from '../../../hooks/useApplicationMutations';
import { toast } from '../../../components/ui';

vi.mock('../../../components/ui', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
  },
}));

describe('useStageWorkflow hook', () => {
  const mockCandidate = {
    application_id: 101,
    candidate_name: 'John Doe',
    review_stage: 'New',
  };

  const createWrapper = () => {
    const queryClient = new QueryClient();
    return ({ children }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
  };

  it('initializes with default UI state', () => {
    const { result } = renderHook(() => useStageWorkflow(1, mockCandidate), {
      wrapper: createWrapper(),
    });

    expect(result.current.showTransitionPrompt).toBe(false);
    expect(result.current.targetStage).toBe('');
    expect(result.current.transitionNote).toBe('');
    expect(result.current.newNoteContent).toBe('');
    expect(result.current.isUpdatingStage).toBe(false);
    expect(result.current.isAddingNote).toBe(false);
  });

  it('handleStageButtonClick sets targetStage and opens prompt', () => {
    const { result } = renderHook(() => useStageWorkflow(1, mockCandidate), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.handleStageButtonClick('Interviewing');
    });

    expect(result.current.showTransitionPrompt).toBe(true);
    expect(result.current.targetStage).toBe('Interviewing');

    // Clicking same stage does nothing
    act(() => {
      result.current.handleStageButtonClick('New');
    });
    // Still Interviewing from prior click
    expect(result.current.targetStage).toBe('Interviewing');
  });

  it('handleCancelTransition resets stage prompt state', () => {
    const { result } = renderHook(() => useStageWorkflow(1, mockCandidate), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.handleStageButtonClick('Interviewing');
      result.current.setTransitionNote('Waiting on feedback');
    });

    expect(result.current.showTransitionPrompt).toBe(true);
    expect(result.current.transitionNote).toBe('Waiting on feedback');

    act(() => {
      result.current.handleCancelTransition();
    });

    expect(result.current.showTransitionPrompt).toBe(false);
    expect(result.current.targetStage).toBe('');
    expect(result.current.transitionNote).toBe('');
  });

  it('handleConfirmStageUpdate calls mutation, shows toast, and closes prompt', async () => {
    const mutateAsyncSpy = vi.fn().mockResolvedValue({ success: true });
    vi.spyOn(appMutations, 'useUpdateApplicationStage').mockReturnValue({
      mutateAsync: mutateAsyncSpy,
      isPending: false,
    });

    const { result } = renderHook(() => useStageWorkflow(1, mockCandidate), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.handleStageButtonClick('Reviewing');
      result.current.setTransitionNote('Promising background');
    });

    await act(async () => {
      await result.current.handleConfirmStageUpdate();
    });

    expect(mutateAsyncSpy).toHaveBeenCalledWith({
      applicationId: 101,
      stage: 'Reviewing',
      note: 'Promising background',
      changed_by: 'Recruiter',
    });

    expect(toast.success).toHaveBeenCalledWith('Candidate moved to Reviewing');
    expect(result.current.showTransitionPrompt).toBe(false);
    expect(result.current.targetStage).toBe('');
  });

  it('handleQuickStageChange immediately updates stage and formats name', async () => {
    const mutateAsyncSpy = vi.fn().mockResolvedValue({ success: true });
    vi.spyOn(appMutations, 'useUpdateApplicationStage').mockReturnValue({
      mutateAsync: mutateAsyncSpy,
      isPending: false,
    });

    const { result } = renderHook(() => useStageWorkflow(1, mockCandidate), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      await result.current.handleQuickStageChange(mockCandidate, 'Hired');
    });

    expect(mutateAsyncSpy).toHaveBeenCalledWith({
      applicationId: 101,
      stage: 'Hired',
      changed_by: 'Recruiter',
    });

    expect(toast.success).toHaveBeenCalledWith('John Doe moved to Hired');
  });

  it('handleAddNote submits note and clears content', async () => {
    const mutateAsyncSpy = vi.fn().mockResolvedValue({ note_id: 1 });
    vi.spyOn(appMutations, 'useAddApplicationNote').mockReturnValue({
      mutateAsync: mutateAsyncSpy,
      isPending: false,
    });

    const { result } = renderHook(() => useStageWorkflow(1, mockCandidate), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.setNewNoteContent('Exceptional system design communication.');
    });

    const preventDefault = vi.fn();
    await act(async () => {
      await result.current.handleAddNote({ preventDefault });
    });

    expect(preventDefault).toHaveBeenCalled();
    expect(mutateAsyncSpy).toHaveBeenCalledWith({
      applicationId: 101,
      content: 'Exceptional system design communication.',
      author: 'Recruiter',
    });
    expect(toast.success).toHaveBeenCalledWith('Note added');
    expect(result.current.newNoteContent).toBe('');
  });
});
