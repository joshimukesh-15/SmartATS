import { useEffect } from 'react';

/**
 * Hook to provide keyboard navigation for candidates list and candidate detail dialogs.
 * Keys:
 * - ArrowDown / 'j' / 'J': select next candidate
 * - ArrowUp / 'k' / 'K': select previous candidate
 * - Escape: trigger onEscape / onClose / clear selection or dialog
 */
export function useCandidateKeyboard({
  candidatesCount,
  candidates,
  selectedIndex,
  setSelectedIndex,
  onSelectCandidate,
  onSelectPrev,
  onSelectNext,
  onEscape,
  onClose,
  onClearSelection,
  enabled = true,
} = {}) {
  useEffect(() => {
    if (!enabled) return;

    const count =
      typeof candidatesCount === 'number'
        ? candidatesCount
        : Array.isArray(candidates)
        ? candidates.length
        : 0;

    const handleKeyDown = (e) => {
      // Ignore if typing in text fields
      const tagName = e.target?.tagName ? e.target.tagName.toLowerCase() : '';
      if (
        ['input', 'textarea', 'select'].includes(tagName) ||
        Boolean(e.target?.isContentEditable)
      ) {
        return;
      }

      // Handle Escape first (close/clear selection or dialog)
      if (e.key === 'Escape') {
        if (onEscape) {
          e.preventDefault();
          onEscape(e);
          return;
        }
        if (onClose) {
          e.preventDefault();
          onClose(e);
          return;
        }
        if (onClearSelection) {
          e.preventDefault();
          onClearSelection(e);
          return;
        }
      }

      // Ignore navigation if modifiers (Ctrl, Cmd, Alt) are pressed
      if (e.ctrlKey || e.metaKey || e.altKey) return;

      // Next candidate (ArrowDown, 'j', 'J')
      if (e.key === 'ArrowDown' || e.key === 'j' || e.key === 'J') {
        if (onSelectNext) {
          e.preventDefault();
          onSelectNext();
          return;
        }
        if (setSelectedIndex) {
          e.preventDefault();
          setSelectedIndex((prev) => {
            if (count <= 0) return 0;
            return Math.min(prev + 1, count - 1);
          });
          return;
        }
        if (onSelectCandidate && Array.isArray(candidates) && candidates.length > 1) {
          e.preventDefault();
          const currIdx = typeof selectedIndex === 'number' ? selectedIndex : 0;
          const nextIdx = Math.min(currIdx + 1, candidates.length - 1);
          const nextCand = candidates[nextIdx];
          if (nextCand) {
            onSelectCandidate(nextCand.application_id ?? nextCand.id ?? nextCand.candidate_id);
          }
          return;
        }
      }

      // Previous candidate (ArrowUp, 'k', 'K')
      if (e.key === 'ArrowUp' || e.key === 'k' || e.key === 'K') {
        if (onSelectPrev) {
          e.preventDefault();
          onSelectPrev();
          return;
        }
        if (setSelectedIndex) {
          e.preventDefault();
          setSelectedIndex((prev) => {
            return Math.max(prev - 1, 0);
          });
          return;
        }
        if (onSelectCandidate && Array.isArray(candidates) && candidates.length > 1) {
          e.preventDefault();
          const currIdx = typeof selectedIndex === 'number' ? selectedIndex : 0;
          const prevIdx = Math.max(currIdx - 1, 0);
          const prevCand = candidates[prevIdx];
          if (prevCand) {
            onSelectCandidate(prevCand.application_id ?? prevCand.id ?? prevCand.candidate_id);
          }
          return;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    enabled,
    candidatesCount,
    candidates,
    selectedIndex,
    setSelectedIndex,
    onSelectCandidate,
    onSelectPrev,
    onSelectNext,
    onEscape,
    onClose,
    onClearSelection,
  ]);
}

export default useCandidateKeyboard;
