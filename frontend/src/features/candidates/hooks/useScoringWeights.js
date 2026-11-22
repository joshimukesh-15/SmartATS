import { useState, useMemo } from 'react';
import { useUpdateJobWeights } from '../../../hooks/useJobQuality';
import { toast } from '../../../components/ui';
import { DEFAULT_WEIGHTS } from '../../../lib/constants';

const INITIAL_WEIGHT_VALUES = {
  weight_skills: DEFAULT_WEIGHTS.skills,
  weight_text: DEFAULT_WEIGHTS.text,
  weight_experience: DEFAULT_WEIGHTS.experience,
  weight_education: DEFAULT_WEIGHTS.education,
};

export function useScoringWeights(activeJob, activeJobId) {
  const [isWeightsOpen, setIsWeightsOpen] = useState(false);
  const [appliedWeights, setAppliedWeights] = useState(null);
  const [weightValues, setWeightValues] = useState(INITIAL_WEIGHT_VALUES);

  const [prevJobId, setPrevJobId] = useState(activeJobId);
  if (prevJobId !== activeJobId) {
    setPrevJobId(activeJobId);
    setAppliedWeights(null);
    if (activeJob?.custom_weights) {
      setWeightValues({
        weight_skills: activeJob.custom_weights.weight_skills ?? DEFAULT_WEIGHTS.skills,
        weight_text: activeJob.custom_weights.weight_text ?? DEFAULT_WEIGHTS.text,
        weight_experience: activeJob.custom_weights.weight_experience ?? DEFAULT_WEIGHTS.experience,
        weight_education: activeJob.custom_weights.weight_education ?? DEFAULT_WEIGHTS.education,
      });
    } else {
      setWeightValues(INITIAL_WEIGHT_VALUES);
    }
  }

  const updateWeightsMutation = useUpdateJobWeights(activeJobId);

  const totalWeight = Math.max(
    0.01,
    (Number(weightValues.weight_skills) || 0) +
      (Number(weightValues.weight_text) || 0) +
      (Number(weightValues.weight_experience) || 0) +
      (Number(weightValues.weight_education) || 0)
  );

  const normalizedWeights = useMemo(
    () => ({
      weight_skills: Math.round(((Number(weightValues.weight_skills) || 0) / totalWeight) * 100) / 100,
      weight_text: Math.round(((Number(weightValues.weight_text) || 0) / totalWeight) * 100) / 100,
      weight_experience:
        Math.round(((Number(weightValues.weight_experience) || 0) / totalWeight) * 100) / 100,
      weight_education:
        Math.round(((Number(weightValues.weight_education) || 0) / totalWeight) * 100) / 100,
    }),
    [weightValues, totalWeight]
  );

  const handleApplyWeights = () => {
    setAppliedWeights(normalizedWeights);
    setIsWeightsOpen(false);
    toast.success('Custom weights applied to rankings');
  };

  const handleSaveJobWeights = async () => {
    try {
      await updateWeightsMutation.mutateAsync(normalizedWeights);
      setAppliedWeights(normalizedWeights);
      setIsWeightsOpen(false);
      toast.success('Scoring weights saved as job default');
    } catch (err) {
      toast.error(err.message || 'Failed to save job weights');
    }
  };

  const handleResetWeights = () => {
    setAppliedWeights(null);
    setWeightValues(INITIAL_WEIGHT_VALUES);
    setIsWeightsOpen(false);
    toast.info('Reverted to balanced scoring defaults');
  };

  return {
    isWeightsOpen,
    setIsWeightsOpen,
    appliedWeights,
    weightValues,
    setWeightValues,
    normalizedWeights,
    handleApplyWeights,
    handleSaveJobWeights,
    handleResetWeights,
    isSavingWeights: updateWeightsMutation.isPending,
  };
}

export default useScoringWeights;
