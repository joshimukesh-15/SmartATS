import { useState } from 'react';
import { useUpdateApplicationStage, useAddApplicationNote } from '../../../hooks';
import { toast } from '../../../components/ui';
import { cleanCandidateName } from '../../../lib/format';

export function useApplicationWorkflow(activeJobId, selectedCandidate) {
  const updateStageMutation = useUpdateApplicationStage(activeJobId);
  const addNoteMutation = useAddApplicationNote(activeJobId);

  const [newNoteContent, setNewNoteContent] = useState('');
  const [showTransitionPrompt, setShowTransitionPrompt] = useState(false);
  const [targetStage, setTargetStage] = useState('');
  const [transitionNote, setTransitionNote] = useState('');

  const currentCandidateStage = selectedCandidate?.review_stage || 'New';

  const handleStageButtonClick = (newStage) => {
    if (!selectedCandidate || newStage === currentCandidateStage) return;
    setTargetStage(newStage);
    setShowTransitionPrompt(true);
  };

  const handleConfirmStageUpdate = async () => {
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
      toast.error(err.message || 'Failed to update review stage');
    }
  };

  const handleQuickStageChange = async (candidate, newStage) => {
    if (!candidate || (candidate.review_stage || 'New') === newStage) return;
    try {
      await updateStageMutation.mutateAsync({
        applicationId: candidate.application_id,
        stage: newStage,
        changed_by: 'Recruiter',
      });
      toast.success(`${cleanCandidateName(candidate.candidate_name)} moved to ${newStage}`);
    } catch (err) {
      toast.error(err.message || 'Failed to update review stage');
    }
  };

  const handleAddNote = async (e) => {
    e.preventDefault();
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
      toast.error(err.message || 'Failed to add note');
    }
  };

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
    handleQuickStageChange,
    handleAddNote,
    isUpdatingStage: updateStageMutation.isPending,
    isAddingNote: addNoteMutation.isPending,
  };
}

export default useApplicationWorkflow;
