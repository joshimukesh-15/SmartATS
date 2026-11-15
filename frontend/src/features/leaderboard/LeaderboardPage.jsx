import { useState, useEffect, useMemo, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FileSpreadsheet, GitCompare, Search, Check, Minus, Mail, Phone } from 'lucide-react';
import { useJobs, useRankings } from '../../hooks';
import {
  Select,
  Input,
  Button,
  ScoreBar,
  ScoreValue,
  Panel,
  EmptyState,
  Skeleton,
  Dialog,
  toast,
} from '../../components/ui';
import { cleanCandidateName } from '../../lib/format';
import { computeBreakdown, sortCandidates } from '../../lib/score';
import { getExportCsvUrl } from '../../api';

export default function LeaderboardPage() {
  const { jobId: routeJobId } = useParams();
  const navigate = useNavigate();

  const { data: jobs = [], isLoading: jobsLoading } = useJobs();

  // Active Job ID
  const activeJobId = routeJobId || (jobs.length > 0 ? String(jobs[0].job_id) : '');
  const activeJob = jobs.find((j) => String(j.job_id) === String(activeJobId));

  const { data: rankingsData, isLoading: rankingsLoading } = useRankings(activeJobId);

  // Search & Sorting state
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('score');
  const [sortOrder, setSortOrder] = useState('desc');

  // Selected candidate for Master-Detail right panel
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Multi-candidate comparison selection
  const [selectedForCompare, setSelectedForCompare] = useState([]);

  // Mobile modal state
  const [mobileDetailOpen, setMobileDetailOpen] = useState(false);

  const tableContainerRef = useRef(null);

  // Candidates list derived from query
  const rawCandidates = useMemo(() => {
    return rankingsData?.rankings || [];
  }, [rankingsData]);

  // Filtered and sorted candidates
  const candidates = useMemo(() => {
    let list = rawCandidates;
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (c) =>
          c.candidate_name?.toLowerCase().includes(q) ||
          c.candidate_email?.toLowerCase().includes(q) ||
          c.matched_skills?.some((s) => s.toLowerCase().includes(q))
      );
    }
    return sortCandidates(list, sortBy, sortOrder);
  }, [rawCandidates, search, sortBy, sortOrder]);

  // Keep selected index within bounds
  useEffect(() => {
    if (selectedIndex >= candidates.length) {
      setSelectedIndex(Math.max(0, candidates.length - 1));
    }
  }, [candidates.length, selectedIndex]);

  // Keyboard navigation for Master-Detail (Up/Down arrow keys)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName)) return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => Math.min(prev + 1, candidates.length - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => Math.max(prev - 1, 0));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [candidates.length]);

  const selectedCandidate = candidates[selectedIndex] || null;
  const selectedBreakdown = selectedCandidate
    ? computeBreakdown(selectedCandidate, activeJob)
    : null;

  const handleJobChange = (newJobId) => {
    navigate(`/studio/leaderboard/${newJobId}`);
    setSelectedForCompare([]);
    setSelectedIndex(0);
  };

  const handleToggleCompare = (appId) => {
    if (selectedForCompare.includes(appId)) {
      setSelectedForCompare((prev) => prev.filter((id) => id !== appId));
    } else {
      if (selectedForCompare.length >= 5) {
        toast.error('Maximum of 5 candidates can be compared simultaneously.');
        return;
      }
      setSelectedForCompare((prev) => [...prev, appId]);
    }
  };

  const handleInitiateCompare = () => {
    if (selectedForCompare.length < 2) {
      toast.error('Select at least 2 candidates to compare');
      return;
    }
    const params = new URLSearchParams();
    params.set('apps', selectedForCompare.join(','));
    navigate(`/studio/compare/${activeJobId}?${params.toString()}`);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Top Header & Job Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 border-b border-line">
        <div>
          <h1 className="text-[28px] sm:text-[32px] font-semibold text-ink tracking-tight">
            Leaderboard
          </h1>
          <p className="text-[14px] text-ink-muted mt-1">
            Explainable candidate rankings with dual-track scoring breakdown and side-by-side
            diagnostics.
          </p>
        </div>

        {/* Job Selector + Export */}
        <div className="flex items-center gap-3">
          {jobs.length > 0 && (
            <div className="w-56">
              <Select value={activeJobId} onChange={(e) => handleJobChange(e.target.value)}>
                {jobs.map((job) => (
                  <option key={job.job_id} value={job.job_id}>
                    {job.title}
                  </option>
                ))}
              </Select>
            </div>
          )}

          {activeJobId && (
            <a
              href={getExportCsvUrl(activeJobId)}
              download
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-[10px] border border-line bg-surface hover:bg-surface-alt text-[13px] font-medium text-ink transition-colors cursor-pointer select-none"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-ink-muted" />
              <span>Export CSV</span>
            </a>
          )}
        </div>
      </div>

      {/* Filter / Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="max-w-xs w-full">
          <Input
            placeholder="Search candidates or skills..."
            leftIcon={<Search className="w-4 h-4" />}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-2 text-[13px] text-ink-muted">
          <span>Sort by:</span>
          <button
            type="button"
            onClick={() => {
              if (sortBy === 'score') {
                setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc');
              } else {
                setSortBy('score');
                setSortOrder('desc');
              }
            }}
            className={`px-2.5 py-1 rounded-[6px] border border-line cursor-pointer ${
              sortBy === 'score' ? 'bg-surface-alt text-ink font-semibold' : 'bg-surface'
            }`}
          >
            Score {sortBy === 'score' && (sortOrder === 'desc' ? '↓' : '↑')}
          </button>
          <button
            type="button"
            onClick={() => {
              if (sortBy === 'name') {
                setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc');
              } else {
                setSortBy('name');
                setSortOrder('asc');
              }
            }}
            className={`px-2.5 py-1 rounded-[6px] border border-line cursor-pointer ${
              sortBy === 'name' ? 'bg-surface-alt text-ink font-semibold' : 'bg-surface'
            }`}
          >
            Name {sortBy === 'name' && (sortOrder === 'desc' ? '↓' : '↑')}
          </button>
        </div>
      </div>

      {/* Master-Detail Layout */}
      {jobsLoading || rankingsLoading ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7 space-y-3">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
          </div>
          <div className="hidden lg:block lg:col-span-5">
            <Skeleton className="h-96 w-full rounded-[14px]" />
          </div>
        </div>
      ) : candidates.length === 0 ? (
        <EmptyState
          title={search ? 'No candidates match your search' : 'No candidates evaluated'}
          description={
            search
              ? 'Try modifying your search keywords.'
              : 'Upload resumes for this job opening to populate the leaderboard.'
          }
          action={
            !search && <Button onClick={() => navigate('/studio/upload')}>Upload resumes</Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* LEFT: Candidate Table (lg:col-span-7) */}
          <div
            ref={tableContainerRef}
            className="lg:col-span-7 rounded-[14px] border border-line bg-surface overflow-hidden focus:outline-none"
            tabIndex={0}
          >
            <div className="overflow-x-auto">
              <table className="w-full text-left text-[14px] text-ink border-collapse">
                <thead className="border-b border-line bg-surface-alt/40 text-[13px] font-medium text-ink-muted">
                  <tr>
                    <th className="w-10 px-3 py-3 text-center">
                      <span className="sr-only">Select</span>
                    </th>
                    <th className="w-14 px-3 py-3 text-center font-medium">Rank</th>
                    <th className="px-4 py-3 font-medium">Candidate</th>
                    <th className="w-24 px-3 py-3 text-right font-medium hidden sm:table-cell">
                      Skills
                    </th>
                    <th className="w-24 px-3 py-3 text-right font-medium hidden sm:table-cell">
                      Text
                    </th>
                    <th className="w-32 px-4 py-3 text-right font-medium">Final Score</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {candidates.map((candidate, idx) => {
                    const isSelected = selectedIndex === idx;
                    const isCompared = selectedForCompare.includes(candidate.application_id);
                    const breakdown = computeBreakdown(candidate, activeJob);

                    return (
                      <tr
                        key={candidate.application_id || idx}
                        onClick={() => {
                          setSelectedIndex(idx);
                          // On mobile, also open detail modal
                          if (window.innerWidth < 1024) {
                            setMobileDetailOpen(true);
                          }
                        }}
                        className={`transition-colors cursor-pointer select-none ${
                          isSelected ? 'bg-surface-alt font-medium' : 'hover:bg-surface-alt/50'
                        }`}
                      >
                        {/* Checkbox for compare */}
                        <td
                          className="px-3 py-3 text-center"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleToggleCompare(candidate.application_id);
                          }}
                        >
                          <input
                            type="checkbox"
                            checked={isCompared}
                            onChange={() => {}}
                            className="rounded-[4px] border-line accent-primary cursor-pointer"
                          />
                        </td>

                        {/* Rank */}
                        <td className="px-3 py-3 text-center">
                          <span
                            className={`inline-flex items-center justify-center w-6 h-6 rounded-[6px] text-[13px] font-semibold ${
                              idx === 0 ? 'bg-primary text-on-primary' : 'bg-surface-alt text-ink'
                            }`}
                          >
                            {candidate.rank || idx + 1}
                          </span>
                        </td>

                        {/* Candidate Name & Email */}
                        <td className="px-4 py-3 min-w-[160px]">
                          <div className="font-semibold text-ink text-[14px]">
                            {cleanCandidateName(candidate.candidate_name)}
                          </div>
                          <div className="text-[12px] text-ink-muted truncate">
                            {candidate.candidate_email || '—'}
                          </div>
                        </td>

                        {/* Skills Covered % */}
                        <td className="px-3 py-3 text-right tabular-nums text-ink-muted hidden sm:table-cell">
                          {breakdown.skillsCoveredPercent.toFixed(1)}%
                        </td>

                        {/* Text Match % */}
                        <td className="px-3 py-3 text-right tabular-nums text-ink-muted hidden sm:table-cell">
                          {breakdown.textMatchPercent.toFixed(1)}%
                        </td>

                        {/* Final Score with Slim Bar */}
                        <td className="px-4 py-3 text-right">
                          <div className="space-y-1">
                            <ScoreValue score={breakdown.finalScore} size="sm" />
                            <ScoreBar
                              skillsPoints={breakdown.skillsCoveredPoints}
                              textMatchPoints={breakdown.textMatchPoints}
                              finalScore={breakdown.finalScore}
                              height="h-1"
                            />
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* RIGHT: Sticky Detail Panel (lg:col-span-5) */}
          <div className="hidden lg:block lg:col-span-5 sticky top-20" aria-live="polite">
            {selectedCandidate && selectedBreakdown ? (
              <Panel className="p-6 space-y-6">
                {/* Header */}
                <div className="flex items-start justify-between gap-4 pb-4 border-b border-line">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-[6px] bg-primary text-on-primary text-[13px] font-semibold flex items-center justify-center shrink-0">
                        {selectedCandidate.rank || selectedIndex + 1}
                      </span>
                      <h2 className="text-[20px] font-semibold text-ink leading-tight">
                        {cleanCandidateName(selectedCandidate.candidate_name)}
                      </h2>
                    </div>
                    <div className="space-y-1 mt-2 text-[13px] text-ink-muted">
                      {selectedCandidate.candidate_email && (
                        <div className="flex items-center gap-2">
                          <Mail className="w-3.5 h-3.5 text-ink-subtle" />
                          <span>{selectedCandidate.candidate_email}</span>
                        </div>
                      )}
                      {selectedCandidate.candidate_phone && (
                        <div className="flex items-center gap-2">
                          <Phone className="w-3.5 h-3.5 text-ink-subtle" />
                          <span>{selectedCandidate.candidate_phone}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Large Score */}
                  <div className="text-right">
                    <div className="text-[12px] font-medium text-ink-muted">Final score</div>
                    <ScoreValue score={selectedBreakdown.finalScore} size="xl" />
                  </div>
                </div>

                {/* Two-Segment Score Bar & Math Line */}
                <div className="space-y-2 p-4 rounded-[10px] bg-surface-alt/50 border border-line">
                  <div className="text-[13px] font-medium text-ink flex items-center justify-between">
                    <span>Scoring Breakdown</span>
                    <span className="tabular-nums font-semibold">
                      {selectedBreakdown.finalScore.toFixed(1)}%
                    </span>
                  </div>
                  <ScoreBar
                    skillsPoints={selectedBreakdown.skillsCoveredPoints}
                    textMatchPoints={selectedBreakdown.textMatchPoints}
                    finalScore={selectedBreakdown.finalScore}
                    height="h-2"
                  />
                  <div className="pt-2 text-[13px] text-ink-muted space-y-1 tabular-nums">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-primary" />
                        Skills covered {selectedBreakdown.skillsCoveredPercent.toFixed(1)}% × 0.6
                      </span>
                      <span className="font-medium text-ink">
                        {selectedBreakdown.skillsCoveredPoints.toFixed(1)} pts
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-champagne" />
                        Text match {selectedBreakdown.textMatchPercent.toFixed(1)}% × 0.4
                      </span>
                      <span className="font-medium text-ink">
                        {selectedBreakdown.textMatchPoints.toFixed(1)} pts
                      </span>
                    </div>
                  </div>
                </div>

                {/* Required Skills Diagnostic */}
                <div className="space-y-3">
                  <h3 className="text-[14px] font-semibold text-ink">Required skills status</h3>
                  <div className="space-y-2">
                    {activeJob?.required_skills?.map((skill, sIdx) => {
                      const isFound = selectedCandidate.matched_skills?.some(
                        (m) => m.toLowerCase().trim() === skill.toLowerCase().trim()
                      );

                      return (
                        <div
                          key={sIdx}
                          className="flex items-center justify-between text-[13px] py-1 border-b border-line/50 last:border-b-0"
                        >
                          <span className="font-medium text-ink">{skill}</span>
                          {isFound ? (
                            <span className="inline-flex items-center gap-1 text-[12px] font-medium text-ink bg-champagne-soft px-2 py-0.5 rounded-[4px]">
                              <Check className="w-3 h-3 text-champagne" />
                              Found in resume
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[12px] text-ink-muted bg-surface-alt px-2 py-0.5 rounded-[4px] border border-dashed border-line">
                              <Minus className="w-3 h-3 text-ink-subtle" />
                              Missing
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Score explanation note */}
                {selectedCandidate.score_explanation && (
                  <div className="space-y-1.5 pt-2 border-t border-line">
                    <div className="text-[13px] font-semibold text-ink">Explain score</div>
                    <p className="text-[13px] text-ink-muted leading-relaxed whitespace-pre-line">
                      {selectedCandidate.score_explanation}
                    </p>
                  </div>
                )}

                {/* Actions */}
                <div className="pt-4 border-t border-line flex items-center justify-between gap-3">
                  <Button
                    variant={
                      selectedForCompare.includes(selectedCandidate.application_id)
                        ? 'secondary'
                        : 'primary'
                    }
                    size="sm"
                    leftIcon={<GitCompare className="w-3.5 h-3.5" />}
                    onClick={() => handleToggleCompare(selectedCandidate.application_id)}
                  >
                    {selectedForCompare.includes(selectedCandidate.application_id)
                      ? 'Remove from compare'
                      : 'Add to compare'}
                  </Button>
                </div>
              </Panel>
            ) : null}
          </div>
        </div>
      )}

      {/* Floating Multi-Select Action Bar (shown when 2+ candidates are checked) */}
      {selectedForCompare.length >= 2 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-primary text-on-primary px-5 py-3 rounded-[12px] shadow-2xl flex items-center gap-4 border border-line animate-in fade-in slide-in-from-bottom-4 duration-200">
          <div className="text-[13px] font-medium">
            {selectedForCompare.length} candidates selected
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleInitiateCompare}
              className="px-3 py-1.5 rounded-[8px] bg-champagne text-ink text-[13px] font-semibold hover:opacity-90 transition-opacity cursor-pointer"
            >
              Compare
            </button>
            <button
              type="button"
              onClick={() => setSelectedForCompare([])}
              className="px-2 py-1.5 text-[13px] text-on-primary/80 hover:text-on-primary cursor-pointer"
            >
              Clear
            </button>
          </div>
        </div>
      )}

      {/* Mobile Detail Modal Fallback */}
      {mobileDetailOpen && selectedCandidate && selectedBreakdown && (
        <Dialog
          isOpen={mobileDetailOpen}
          onClose={() => setMobileDetailOpen(false)}
          title={cleanCandidateName(selectedCandidate.candidate_name)}
          description={selectedCandidate.candidate_email}
        >
          <div className="space-y-4">
            <div className="p-4 rounded-[10px] bg-surface-alt space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[13px] text-ink-muted">Final score</span>
                <ScoreValue score={selectedBreakdown.finalScore} size="lg" />
              </div>
              <ScoreBar
                skillsPoints={selectedBreakdown.skillsCoveredPoints}
                textMatchPoints={selectedBreakdown.textMatchPoints}
                finalScore={selectedBreakdown.finalScore}
                height="h-2"
              />
              <div className="text-[12px] text-ink-muted space-y-0.5 pt-1">
                <div>
                  Skills: {selectedBreakdown.skillsCoveredPercent.toFixed(1)}% × 0.6 ={' '}
                  {selectedBreakdown.skillsCoveredPoints.toFixed(1)} pts
                </div>
                <div>
                  Text match: {selectedBreakdown.textMatchPercent.toFixed(1)}% × 0.4 ={' '}
                  {selectedBreakdown.textMatchPoints.toFixed(1)} pts
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="text-[13px] font-semibold text-ink">Skills coverage</div>
              <div className="space-y-1.5">
                {activeJob?.required_skills?.map((skill, sIdx) => {
                  const isFound = selectedCandidate.matched_skills?.some(
                    (m) => m.toLowerCase().trim() === skill.toLowerCase().trim()
                  );
                  return (
                    <div
                      key={sIdx}
                      className="flex items-center justify-between text-[13px] py-1 border-b border-line"
                    >
                      <span>{skill}</span>
                      {isFound ? (
                        <span className="text-[12px] text-ink bg-champagne-soft px-2 py-0.5 rounded-[4px]">
                          Found
                        </span>
                      ) : (
                        <span className="text-[12px] text-ink-muted">Missing</span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <Button variant="secondary" size="sm" onClick={() => setMobileDetailOpen(false)}>
                Close
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  handleToggleCompare(selectedCandidate.application_id);
                  setMobileDetailOpen(false);
                }}
              >
                {selectedForCompare.includes(selectedCandidate.application_id)
                  ? 'Remove from compare'
                  : 'Add to compare'}
              </Button>
            </div>
          </div>
        </Dialog>
      )}
    </div>
  );
}
