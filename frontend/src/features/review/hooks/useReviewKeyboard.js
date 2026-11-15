import { useEffect } from 'react';

export function useReviewKeyboard({
  filteredCandidates = [],
  effectiveCandidateId,
  onSelectCandidate,
}) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (['input', 'textarea'].includes(e.target.tagName.toLowerCase())) return;
      if (filteredCandidates.length <= 1) return;

      const idx = filteredCandidates.findIndex(
        (c) => c.application_id === effectiveCandidateId
      );
      if (idx === -1) return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        const nextIdx = (idx + 1) % filteredCandidates.length;
        onSelectCandidate(filteredCandidates[nextIdx].application_id);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        const prevIdx =
          (idx - 1 + filteredCandidates.length) % filteredCandidates.length;
        onSelectCandidate(filteredCandidates[prevIdx].application_id);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [filteredCandidates, effectiveCandidateId, onSelectCandidate]);
}

export default useReviewKeyboard;
