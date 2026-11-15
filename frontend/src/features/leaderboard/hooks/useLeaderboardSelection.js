import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from '../../../components/ui';

export function useLeaderboardSelection({ candidatesCount = 0, activeJobId = '' } = {}) {
  const navigate = useNavigate();
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [selectedForCompare, setSelectedForCompare] = useState([]);

  const safeSelectedIndex = Math.min(selectedIndex, Math.max(0, candidatesCount - 1));

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
    navigate(`/studio/compare/${activeJobId}?${params.toString()}`);
  }, [selectedForCompare, activeJobId, navigate]);

  const clearCompare = useCallback(() => {
    setSelectedForCompare([]);
  }, []);

  return {
    selectedIndex,
    setSelectedIndex,
    safeSelectedIndex,
    selectedForCompare,
    setSelectedForCompare,
    handleToggleCompare,
    handleInitiateCompare,
    clearCompare,
  };
}

export default useLeaderboardSelection;
