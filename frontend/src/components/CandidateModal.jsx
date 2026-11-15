import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Check,
  Mail,
  Phone,
  Calendar,
  FileText,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { fetchCandidateDetails } from '../api';

export default function CandidateModal({ candidate, onClose }) {
  const dialogRef = useRef(null);
  const [candidateProfile, setCandidateProfile] = useState(null);
  const [showRawText, setShowRawText] = useState(false);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (dialog && !dialog.open) {
      dialog.showModal();
    }
    return () => {
      if (dialog && dialog.open) {
        dialog.close();
      }
    };
  }, []);

  useEffect(() => {
    if (candidate && candidate.candidate_id) {
      fetchCandidateDetails(candidate.candidate_id)
        .then((data) => setCandidateProfile(data))
        .catch((err) => console.error(err));
    }
  }, [candidate]);

  const handleBackdropClick = (e) => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    const rect = dialog.getBoundingClientRect();
    const isInDialog =
      e.clientX >= rect.left &&
      e.clientX <= rect.right &&
      e.clientY >= rect.top &&
      e.clientY <= rect.bottom;
    if (!isInDialog) {
      onClose();
    }
  };

  if (!candidate) return null;

  const finalScore = candidate.final_score || 0;
  const keywordScore = candidate.keyword_score || 0;
  const tfidfScore = candidate.tfidf_score || 0;

  return (
    <dialog
      ref={dialogRef}
      onCancel={onClose}
      onClick={handleBackdropClick}
      aria-labelledby="candidate-modal-title"
      className="fixed inset-0 m-auto bg-surface border border-line rounded-[16px] w-full max-w-3xl p-0 text-ink shadow-[0_1px_2px_rgba(42,16,21,0.04),0_24px_64px_rgba(42,16,21,0.12)] backdrop:bg-ink/40 backdrop:backdrop-blur-xs animate-in fade-in zoom-in-95 duration-200"
    >
      <div className="flex flex-col max-h-[85vh] overflow-hidden">
        
        {/* Header */}
        <div className="p-6 border-b border-line flex items-start justify-between bg-surface-alt">
          <div>
            <div className="flex items-center space-x-3">
              <h2 id="candidate-modal-title" className="text-2xl sm:text-3xl font-serif text-ink font-normal tracking-tight">
                {candidate.candidate_name}
              </h2>
              {candidate.rank && (
                <span className="font-mono text-[13px] px-2.5 py-0.5 rounded-[6px] bg-wine-soft text-wine font-medium">
                  Rank #{candidate.rank}
                </span>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-4 mt-2 text-[13px] text-ink-muted font-mono">
              {candidate.candidate_email && (
                <span className="flex items-center space-x-1.5">
                  <Mail className="w-3.5 h-3.5 text-ink-muted" />
                  <span>{candidate.candidate_email}</span>
                </span>
              )}
              {candidate.candidate_phone && (
                <span className="flex items-center space-x-1.5">
                  <Phone className="w-3.5 h-3.5 text-ink-muted" />
                  <span>{candidate.candidate_phone}</span>
                </span>
              )}
              {candidate.applied_at && (
                <span className="flex items-center space-x-1.5">
                  <Calendar className="w-3.5 h-3.5 text-ink-muted" />
                  <span>{new Date(candidate.applied_at).toLocaleDateString()}</span>
                </span>
              )}
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="p-1.5 rounded-[8px] text-ink-muted hover:text-ink hover:bg-surface transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 sm:p-8 space-y-7 overflow-y-auto">
          
          {/* Score Summary Metrics: Quiet Tonal Layering */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-[12px] bg-surface-alt text-center space-y-1">
              <span className="text-[13px] font-mono text-ink-muted uppercase block">
                Composite Score
              </span>
              <div className="text-3xl font-mono font-semibold text-ink">
                {finalScore.toFixed(1)}%
              </div>
              <div className="text-[13px] text-ink-muted font-sans">
                60% Skills + 40% Vector
              </div>
            </div>

            <div className="p-4 rounded-[12px] bg-surface-alt text-center space-y-1">
              <span className="text-[13px] font-mono text-ink-muted uppercase block">
                Required Skill Coverage
              </span>
              <div className="text-3xl font-mono font-semibold text-wine">
                {keywordScore.toFixed(1)}%
              </div>
              <div className="text-[13px] text-ink-muted font-sans">
                {candidate.matched_skills?.length || 0} skills verified
              </div>
            </div>

            <div className="p-4 rounded-[12px] bg-surface-alt text-center space-y-1">
              <span className="text-[13px] font-mono text-ink-muted uppercase block">
                Contextual Similarity
              </span>
              <div className="text-3xl font-mono font-semibold text-ink">
                {tfidfScore.toFixed(1)}%
              </div>
              <div className="text-[13px] text-ink-muted font-sans">
                TF-IDF Cosine Depth
              </div>
            </div>
          </div>

          {/* Diagnostic Note */}
          <div className="quiet-card bg-surface p-5 space-y-2">
            <span className="text-[13px] font-mono uppercase text-ink-muted font-medium block">
              Diagnostic Scoring Explanation
            </span>
            <div className="p-3 bg-surface-alt rounded-[8px] text-[14px] text-ink font-mono whitespace-pre-line leading-relaxed">
              {candidate.score_explanation || 'No evaluation notes available.'}
            </div>
          </div>

          {/* Skill Gap Analysis Section */}
          <div className="space-y-4">
            <h3 className="text-xl font-serif text-ink font-normal">
              Competency Breakdown
            </h3>
            
            {/* Matched Required Skills */}
            <div className="space-y-2">
              <div className="text-[13px] font-mono uppercase text-ink-muted flex items-center justify-between">
                <span>Matched Mandatory Skills ({candidate.matched_skills?.length || 0})</span>
                <span className="text-wine font-medium">Verified</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {candidate.matched_skills && candidate.matched_skills.length > 0 ? (
                  candidate.matched_skills.map((skill, i) => (
                    <span
                      key={i}
                      className="px-2.5 py-1 rounded-[6px] text-[13px] bg-surface-alt text-ink font-sans flex items-center space-x-1"
                    >
                      <Check className="w-3.5 h-3.5 text-wine" />
                      <span>{skill}</span>
                    </span>
                  ))
                ) : (
                  <span className="text-[13px] text-ink-muted font-sans">No mandatory skills identified</span>
                )}
              </div>
            </div>

            {/* Missing Required Skills */}
            <div className="space-y-2 pt-2 border-t border-line">
              <div className="text-[13px] font-mono uppercase text-ink-muted flex items-center justify-between">
                <span>Missing Mandatory Skills ({candidate.missing_skills?.length || 0})</span>
                <span className="text-ink-muted">Requirement Gaps</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {candidate.missing_skills && candidate.missing_skills.length > 0 ? (
                  candidate.missing_skills.map((skill, i) => (
                    <span
                      key={i}
                      className="px-2.5 py-1 rounded-[6px] text-[13px] bg-canvas border border-dashed border-line text-ink-muted font-sans"
                    >
                      ✕ {skill}
                    </span>
                  ))
                ) : (
                  <span className="text-[13px] text-wine font-medium font-sans">None. Candidate satisfies 100% of required competencies.</span>
                )}
              </div>
            </div>

            {/* Preferred Skills */}
            {candidate.preferred_matched_skills && candidate.preferred_matched_skills.length > 0 && (
              <div className="space-y-2 pt-2 border-t border-line">
                <div className="text-[13px] font-mono uppercase text-ink-muted">
                  Preferred Qualifications ({candidate.preferred_matched_skills.length})
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {candidate.preferred_matched_skills.map((skill, i) => (
                    <span
                      key={i}
                      className="px-2.5 py-1 rounded-[6px] text-[13px] bg-surface-alt text-ink font-sans"
                    >
                      + {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Original Resume Text Toggle */}
          <div className="pt-2 border-t border-line">
            <button
              type="button"
              onClick={() => setShowRawText(!showRawText)}
              className="w-full flex items-center justify-between px-4 py-2.5 bg-surface-alt hover:bg-canvas rounded-[8px] text-[14px] font-sans text-ink transition-colors"
            >
              <div className="flex items-center space-x-2">
                <FileText className="w-4 h-4 text-ink-muted" />
                <span>Original Document Text View</span>
              </div>
              {showRawText ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>

            {showRawText && (
              <div className="mt-3 p-4 bg-canvas border border-line rounded-[8px] text-[13px] text-ink font-mono whitespace-pre-wrap max-h-60 overflow-y-auto leading-relaxed">
                {candidateProfile?.raw_text || 'Loading document contents...'}
              </div>
            )}
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-line bg-surface-alt flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2 bg-wine hover:bg-wine-hover text-white text-[14px] font-medium rounded-[8px] transition-colors shadow-xs"
          >
            Dismiss
          </button>
        </div>

      </div>
    </dialog>
  );
}
