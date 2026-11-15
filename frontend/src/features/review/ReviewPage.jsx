import { useState, useMemo, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Briefcase } from 'lucide-react';
import {
  useJobs,
  useRankings,
  useUpdateApplicationStage,
  useAddApplicationNote,
} from '../../hooks';
import { computeBreakdown } from '../../lib/score';
import { Panel } from '../../components/ui/Panel';
import { Button } from '../../components/ui/Button';
import { EmptyState } from '../../components/ui/EmptyState';
import { Skeleton } from '../../components/ui/Skeleton';

import { useReviewKeyboard } from './hooks/useReviewKeyboard';
import ReviewHeader from './ReviewHeader';
import CandidateRoster from './CandidateRoster';
import CandidateReviewDossier from './CandidateReviewDossier';

export default function ReviewPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const urlJobId = searchParams.get('jobId');
  const urlCandidateId = searchParams.get('candidateId');

  // Job selection
  const { data: jobsList = [], isLoading: jobsLoading } = useJobs();
  const activeJobId = urlJobId ? Number(urlJobId) : jobsList[0]?.job_id || null;

  const handleSelectJob = (id) => {
    setSearchParams((prev) => {
      const p = new URLSearchParams(prev);
      p.set('jobId', id);
      p.delete('candidateId');
      return p;
    });
  };

  // Candidates for active job
  const {
    data: rankingsData,
    isLoading: rankingsLoading,
    error: rankingsError,
    refetch,
  } = useRankings(activeJobId);

  const rawCandidates = useMemo(
    () => rankingsData?.rankings || [],
    [rankingsData?.rankings]
  );

  // Active candidate selection
  const [selectedCandidateId, setSelectedCandidateId] = useState(urlCandidateId || null);
  const [searchQuery, setSearchQuery] = useState('');
  const [stageFilter, setStageFilter] = useState('ALL');
  const [dossierTab, setDossierTab] = useState('scoring');
  const [newNote, setNewNote] = useState('');

  // Active Job details
  const activeJob = useMemo(
    () => jobsList.find((j) => j.job_id === activeJobId),
    [jobsList, activeJobId]
  );

  // Filter candidates
  const filteredCandidates = useMemo(() => {
    let list = [...rawCandidates];
    if (stageFilter !== 'ALL') {
      list = list.filter((c) => (c.review_stage || 'New') === stageFilter);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (c) =>
          c.candidate_name?.toLowerCase().includes(q) ||
          c.candidate_email?.toLowerCase().includes(q)
      );
    }
    return list;
  }, [rawCandidates, stageFilter, searchQuery]);

  // Sync candidate selection to URL
  const handleSelectCandidate = useCallback(
    (appId) => {
      setSelectedCandidateId(appId);
      setSearchParams((prev) => {
        const p = new URLSearchParams(prev);
        p.set('candidateId', appId);
        return p;
      });
    },
    [setSearchParams]
  );

  // Derive active candidate
  const effectiveCandidateId = useMemo(() => {
    if (
      selectedCandidateId &&
      filteredCandidates.some((c) => c.application_id === selectedCandidateId)
    ) {
      return selectedCandidateId;
    }
    return filteredCandidates[0]?.application_id || null;
  }, [selectedCandidateId, filteredCandidates]);

  const selectedCandidate = useMemo(
    () => rawCandidates.find((c) => c.application_id === effectiveCandidateId),
    [rawCandidates, effectiveCandidateId]
  );

  const selectedBreakdown = useMemo(() => {
    if (!selectedCandidate) return null;
    return computeBreakdown(selectedCandidate, activeJob);
  }, [selectedCandidate, activeJob]);

  // Stage mutation
  const stageMutation = useUpdateApplicationStage(activeJobId);
  const noteMutation = useAddApplicationNote(activeJobId);

  const handleStageChange = async (targetStage, noteText = '') => {
    if (!selectedCandidate) return;
    try {
      await stageMutation.mutateAsync({
        applicationId: selectedCandidate.application_id,
        stage: targetStage,
        note: noteText || `Stage moved to ${targetStage} in Candidate Review`,
        changed_by: 'Recruiter',
      });
    } catch (err) {
      console.error('Failed to update stage:', err);
    }
  };

  const handleAddNote = async (e) => {
    e.preventDefault();
    if (!newNote.trim() || !selectedCandidate) return;
    try {
      await noteMutation.mutateAsync({
        applicationId: selectedCandidate.application_id,
        content: newNote.trim(),
        author: 'Recruiter',
      });
      setNewNote('');
    } catch (err) {
      console.error('Failed to add note:', err);
    }
  };

  const handleCompareCandidate = (appId) => {
    navigate(`/studio/compare?jobId=${activeJobId}&app1=${appId}`);
  };

  // Keyboard navigation hook
  useReviewKeyboard({
    filteredCandidates,
    effectiveCandidateId,
    onSelectCandidate: handleSelectCandidate,
  });

  return (
    <div className="space-y-6">
      {/* Top Header & Job Switcher */}
      <ReviewHeader
        jobsList={jobsList}
        activeJobId={activeJobId}
        onSelectJob={handleSelectJob}
      />

      {/* Main 2-Column Review Layout */}
      {jobsLoading || rankingsLoading ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-4 space-y-3">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
          </div>
          <div className="lg:col-span-8 space-y-4">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-48 w-full" />
          </div>
        </div>
      ) : rankingsError ? (
        <Panel className="p-8 text-center space-y-4">
          <p className="text-danger text-[14px]">Failed to load candidates for review.</p>
          <Button variant="secondary" onClick={() => refetch()}>
            Retry
          </Button>
        </Panel>
      ) : rawCandidates.length === 0 ? (
        <EmptyState
          icon={Briefcase}
          title="No candidates yet"
          description="Upload resumes for this job opening to begin evaluating applicants."
          actionLabel="Upload Resumes"
          onAction={() =>
            navigate(activeJobId ? `/studio/upload?jobId=${activeJobId}` : '/studio/upload')
          }
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* LEFT: Candidate Roster & Quick Filters (lg:col-span-4) */}
          <CandidateRoster
            rawCandidates={rawCandidates}
            filteredCandidates={filteredCandidates}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            stageFilter={stageFilter}
            setStageFilter={setStageFilter}
            selectedCandidateId={effectiveCandidateId}
            onSelectCandidate={handleSelectCandidate}
            activeJob={activeJob}
          />

          {/* RIGHT: Full Candidate Review Dossier (lg:col-span-8) */}
          <div className="lg:col-span-8 space-y-6">
            <CandidateReviewDossier
              candidate={selectedCandidate}
              breakdown={selectedBreakdown}
              activeJob={activeJob}
              activeJobId={activeJobId}
              dossierTab={dossierTab}
              setDossierTab={setDossierTab}
              onStageChange={handleStageChange}
              isStageUpdating={stageMutation.isPending}
              newNote={newNote}
              setNewNote={setNewNote}
              onAddNote={handleAddNote}
              isAddingNote={noteMutation.isPending}
              onCompareCandidate={handleCompareCandidate}
            />
          </div>
        </div>
      )}
    </div>
  );
}
