import { useState, useMemo, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { toast } from '../../../components/ui';

const EMPTY_ARRAY = [];
const EMPTY_OBJECT = {};

/**
 * Hook to manage candidate selection synchronized with URL query parameter `?candidate=`.
 * Resolves candidate object and index, defaulting safely if none in URL or if candidate not in list.
 */
export function useCandidateSelection(candidatesArg = EMPTY_ARRAY, optionsArg = EMPTY_OBJECT) {
  // Normalize arguments without allocating new references on every render
  const candidates = Array.isArray(candidatesArg)
    ? candidatesArg
    : candidatesArg && Array.isArray(candidatesArg.candidates)
    ? candidatesArg.candidates
    : EMPTY_ARRAY;

  const options =
    candidatesArg && !Array.isArray(candidatesArg) && typeof candidatesArg === 'object'
      ? candidatesArg
      : optionsArg || EMPTY_OBJECT;

  const {
    paramName = 'candidate',
    defaultToFirst = true,
    activeJobId = null,
    initialId = null,
    onSelect,
  } = options;

  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  // Local state for candidate comparison
  const [selectedForCompare, setSelectedForCompare] = useState([]);

  // Read URL query parameter
  const urlCandidateId =
    searchParams.get(paramName) || searchParams.get('candidateId') || initialId;

  // Resolve candidate, index, and effective ID
  const { selectedIndex, selectedCandidate, effectiveCandidateId } = useMemo(() => {
    if (!candidates || candidates.length === 0) {
      return {
        selectedIndex: -1,
        selectedCandidate: null,
        effectiveCandidateId: null,
      };
    }

    if (urlCandidateId !== null && urlCandidateId !== undefined && urlCandidateId !== '') {
      const idx = candidates.findIndex((c) => {
        const id = c.application_id ?? c.id ?? c.candidate_id;
        return String(id) === String(urlCandidateId);
      });

      if (idx !== -1) {
        return {
          selectedIndex: idx,
          selectedCandidate: candidates[idx],
          effectiveCandidateId:
            candidates[idx].application_id ??
            candidates[idx].id ??
            candidates[idx].candidate_id,
        };
      }
    }

    if (defaultToFirst && candidates.length > 0) {
      return {
        selectedIndex: 0,
        selectedCandidate: candidates[0],
        effectiveCandidateId:
          candidates[0].application_id ??
          candidates[0].id ??
          candidates[0].candidate_id,
      };
    }

    return {
      selectedIndex: -1,
      selectedCandidate: null,
      effectiveCandidateId: null,
    };
  }, [candidates, urlCandidateId, defaultToFirst]);

  // Safe selected index (guaranteed bounded between 0 and candidates.length - 1 if candidates exist)
  const safeSelectedIndex =
    candidates.length > 0
      ? Math.max(0, Math.min(selectedIndex >= 0 ? selectedIndex : 0, candidates.length - 1))
      : 0;

  // Set candidate ID and sync to URL query parameter
  const setSelectedCandidateId = useCallback(
    (appId) => {
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          if (appId !== null && appId !== undefined && appId !== '') {
            next.set(paramName, String(appId));
          } else {
            next.delete(paramName);
            next.delete('candidateId');
          }
          return next;
        },
        { replace: true }
      );

      if (onSelect) {
        onSelect(appId);
      }
    },
    [paramName, setSearchParams, onSelect]
  );

  // Set selected by index
  const setSelectedIndex = useCallback(
    (indexOrFn) => {
      if (!candidates || candidates.length === 0) return;
      const targetIdx =
        typeof indexOrFn === 'function' ? indexOrFn(safeSelectedIndex) : indexOrFn;
      const boundedIdx = Math.max(0, Math.min(targetIdx, candidates.length - 1));
      const cand = candidates[boundedIdx];
      if (cand) {
        const id = cand.application_id ?? cand.id ?? cand.candidate_id;
        setSelectedCandidateId(id);
      }
    },
    [candidates, safeSelectedIndex, setSelectedCandidateId]
  );

  // Candidate compare handlers
  const handleToggleCompare = useCallback((appId) => {
    setSelectedForCompare((prev) => {
      if (prev.includes(appId)) {
        return prev.filter((id) => id !== appId);
      }
      if (prev.length >= 5) {
        toast.error('Maximum of 5 candidates can be compared simultaneously.');
        return prev;
      }
      return [...prev, appId];
    });
  }, []);

  const handleInitiateCompare = useCallback(() => {
    if (selectedForCompare.length < 2) {
      toast.error('Select at least 2 candidates to compare');
      return;
    }
    const params = new URLSearchParams();
    params.set('apps', selectedForCompare.join(','));
    const jobId = activeJobId || '';
    navigate(`/studio/compare/${jobId}?${params.toString()}`);
  }, [selectedForCompare, activeJobId, navigate]);

  const clearCompare = useCallback(() => {
    setSelectedForCompare([]);
  }, []);

  return {
    selectedCandidateId: effectiveCandidateId,
    effectiveCandidateId,
    setSelectedCandidateId,
    handleSelectCandidate: setSelectedCandidateId,
    selectedCandidate,
    selectedIndex,
    safeSelectedIndex,
    setSelectedIndex,
    selectedForCompare,
    setSelectedForCompare,
    handleToggleCompare,
    handleInitiateCompare,
    clearCompare,
  };
}

export default useCandidateSelection;
