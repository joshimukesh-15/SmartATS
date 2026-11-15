import { useEffect } from 'react';

export function useLeaderboardKeyboard({ candidatesCount, setSelectedIndex }) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName)) return;

      if (e.ctrlKey || e.metaKey) return;

      if (e.key === 'ArrowDown' || e.key === 'j' || e.key === 'J') {
        e.preventDefault();
        setSelectedIndex((prev) => Math.min(prev + 1, candidatesCount - 1));
      } else if (e.key === 'ArrowUp' || e.key === 'k' || e.key === 'K') {
        e.preventDefault();
        setSelectedIndex((prev) => Math.max(prev - 1, 0));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [candidatesCount, setSelectedIndex]);
}

export default useLeaderboardKeyboard;
