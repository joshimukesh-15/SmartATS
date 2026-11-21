import { useState, useCallback } from 'react';
import { useUpdateApplicationStage, useAddApplicationNote } from '../../../hooks';
import { toast } from '../../../components/ui';
import { cleanCandidateName } from '../../../lib/format';

/**
 * Hook to manage candidate hiring pipeline stage transitions,
 * transition note prompt dialogs, and recruiter notes.
 */
export function useStageWorkflow(jobIdOrOptions, maybeSelectedCandidate) {
  let activeJobId = jobIdOrOptions;
  let selectedCandidate = maybeSelectedCandidate;

  if (
    jobIdOrOptions &&
    typeof jobIdOrOptions === 'object' &&
    !('job_id' in jobIdOrOptions) &&
    ('activeJobId' in jobIdOrOptions || 'selectedCandidate' in jobIdOrOptions)
  ) {
    activeJobId = jobIdOrOptions.activeJobId;
    selectedCandidate = jobIdOrOptions.selectedCandidate ?? maybeSelectedCandidate;
  }

  const updateStageMutation = useUpdateApplicationStage(activeJobId);
  const addNoteMutation = useAddApplicationNote(activeJobId);

  const [newNoteContent, setNewNoteContent] = useState('');
  const [showTransitionPrompt, setShowTransitionPrompt] = useState(false);
  const [targetStage, setTargetStage] = useState('');
  const [transitionNote, setTransitionNote] = useState('');

  const currentCandidateStage = selectedCandidate?.review_stage || 'New';

  const handleStageButtonClick = useCallback(
    (newStage) => {
      if (!selectedCandidate || newStage === currentCandidateStage) return;
      setTargetStage(newStage);
      setTransitionNote('');
      setShowTransitionPrompt(true);
    },
    [selectedCandidate, currentCandidateStage]
  );

  const handleCancelTransition = useCallback(() => {
    setShowTransitionPrompt(false);
    setTargetStage('');
    setTransitionNote('');
  }, []);

  const handleConfirmStageUpdate = useCallback(async () => {
    if (!selectedCandidate || !targetStage) return;
    try {
      await updateStageMutation.mutateAsync({
        applicationId: selectedCandidate.application_id,
        stage: targetStage,
        note: transitionNote.trim() || undefined,
        changed_by: 'Recruiter',
      });
      toast.success(`Candidate moved to ${targetStage}`);
      setShowTransitionPrompt(false);
      setTransitionNote('');
      setTargetStage('');
    } catch (err) {
      toast.error(err?.message || 'Failed to update review stage');
    }
  }, [selectedCandidate, targetStage, transitionNote, updateStageMutation]);

  const handleQuickStageChange = useCallback(
    async (candidate, newStage) => {
      const target = candidate || selectedCandidate;
      if (!target || (target.review_stage || 'New') === newStage) return;
      try {
        await updateStageMutation.mutateAsync({
          applicationId: target.application_id,
          stage: newStage,
          changed_by: 'Recruiter',
        });
        const name = target.candidate_name
          ? cleanCandidateName(target.candidate_name)
          : 'Candidate';
        toast.success(`${name} moved to ${newStage}`);
      } catch (err) {
        toast.error(err?.message || 'Failed to update review stage');
      }
    },
    [selectedCandidate, updateStageMutation]
  );

  const handleAddNote = useCallback(
    async (e) => {
      if (e && typeof e.preventDefault === 'function') {
        e.preventDefault();
      }
      if (!selectedCandidate || !newNoteContent.trim()) return;

      try {
        await addNoteMutation.mutateAsync({
          applicationId: selectedCandidate.application_id,
          content: newNoteContent.trim(),
          author: 'Recruiter',
        });
        toast.success('Note added');
        setNewNoteContent('');
      } catch (err) {
        toast.error(err?.message || 'Failed to add note');
      }
    },
    [selectedCandidate, newNoteContent, addNoteMutation]
  );

  return {
    newNoteContent,
    setNewNoteContent,
    showTransitionPrompt,
    setShowTransitionPrompt,
    targetStage,
    setTargetStage,
    transitionNote,
    setTransitionNote,
    handleStageButtonClick,
    handleConfirmStageUpdate,
    handleCancelTransition,
    handleQuickStageChange,
    handleAddNote,
    isUpdatingStage: updateStageMutation.isPending,
    isAddingNote: addNoteMutation.isPending,
    updateStageMutation,
    addNoteMutation,
  };
}

export default useStageWorkflow;
