import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  CheckCircle2,
  AlertCircle,
  Sparkles,
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
  const [loading, setLoading] = useState(false);

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
      setLoading(true);
      fetchCandidateDetails(candidate.candidate_id)
        .then((data) => setCandidateProfile(data))
        .catch((err) => console.error(err))
        .finally(() => setLoading(false));
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
      className="fixed inset-0 m-auto bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-3xl p-0 text-slate-100 shadow-2xl backdrop:bg-slate-950/80 backdrop:backdrop-blur-md animate-in fade-in zoom-in-95 duration-200"
    >
      <div className="flex flex-col max-h-[85vh] overflow-hidden">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-800 flex items-start justify-between bg-slate-950">
          <div>
            <div className="flex items-center space-x-3">
              <h2 id="candidate-modal-title" className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                {candidate.candidate_name}
              </h2>
              {candidate.rank && (
                <span className="font-mono text-xs px-2.5 py-0.5 rounded-full bg-blue-600 text-white font-semibold shadow-[0_0_10px_rgba(37,99,235,0.4)]">
                  Rank #{candidate.rank}
                </span>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-4 mt-2 text-xs text-slate-400 font-mono">
              {candidate.candidate_email && (
                <span className="flex items-center space-x-1.5">
                  <Mail className="w-3.5 h-3.5 text-slate-500" />
                  <span>{candidate.candidate_email}</span>
                </span>
              )}
              {candidate.candidate_phone && (
                <span className="flex items-center space-x-1.5">
                  <Phone className="w-3.5 h-3.5 text-slate-500" />
                  <span>{candidate.candidate_phone}</span>
                </span>
              )}
              {candidate.applied_at && (
                <span className="flex items-center space-x-1.5">
                  <Calendar className="w-3.5 h-3.5 text-slate-500" />
                  <span>{new Date(candidate.applied_at).toLocaleDateString()}</span>
                </span>
              )}
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 sm:p-8 space-y-7 overflow-y-auto">
          
          {/* Score Summary Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-slate-950/90 border border-blue-500/40 rounded-xl p-4 text-center shadow-[0_0_15px_rgba(59,130,246,0.15)]">
              <span className="text-[10px] uppercase font-mono tracking-wider font-semibold text-blue-400">
                Final Match Score
              </span>
              <div className="text-3xl font-bold text-white mt-1">
                {finalScore.toFixed(1)}%
              </div>
              <div className="text-[10px] text-slate-400 mt-1 font-mono">
                Weighted Recommendation
              </div>
            </div>

            <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 text-center">
              <span className="text-[10px] uppercase font-mono tracking-wider font-semibold text-emerald-400">
                Required Skills Match
              </span>
              <div className="text-2xl font-bold text-emerald-400 mt-1">
                {keywordScore.toFixed(1)}%
              </div>
              <div className="text-[10px] text-slate-400 mt-1 font-mono">
                {candidate.matched_skills?.length || 0} skills verified
              </div>
            </div>

            <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 text-center">
              <span className="text-[10px] uppercase font-mono tracking-wider font-semibold text-blue-400">
                Experience Alignment
              </span>
              <div className="text-2xl font-bold text-blue-400 mt-1">
                {tfidfScore.toFixed(1)}%
              </div>
              <div className="text-[10px] text-slate-400 mt-1 font-mono">
                Contextual Alignment
              </div>
            </div>
          </div>

          {/* Diagnostic Note */}
          <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-5 space-y-3">
            <div className="flex items-center space-x-2 text-xs font-mono uppercase tracking-wider text-blue-400 font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Diagnostic Scoring Explanation</span>
            </div>
            <div className="p-4 bg-slate-900/80 rounded-lg border border-slate-800/80 text-xs text-slate-300 font-mono whitespace-pre-line leading-relaxed">
              {candidate.score_explanation || 'No evaluation notes available.'}
            </div>
          </div>

          {/* Skill Gap Analysis Section */}
          <div className="space-y-4">
            <h3 className="text-base font-bold text-white">
              Competency Breakdown
            </h3>
            
            {/* Matched Required Skills */}
            <div className="space-y-1.5">
              <div className="flex items-center space-x-1.5 text-xs font-semibold text-emerald-400 font-mono">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>MATCHED MANDATORY SKILLS ({candidate.matched_skills?.length || 0})</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {candidate.matched_skills && candidate.matched_skills.length > 0 ? (
                  candidate.matched_skills.map((skill, i) => (
                    <span
                      key={i}
                      className="px-2.5 py-1 rounded-lg text-xs font-medium bg-emerald-500/10 text-emerald-300 border border-emerald-500/20"
                    >
                      ✓ {skill}
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-slate-500">No mandatory skills identified</span>
                )}
              </div>
            </div>

            {/* Missing Required Skills */}
            <div className="space-y-1.5">
              <div className="flex items-center space-x-1.5 text-xs font-semibold text-rose-400 font-mono">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>MISSING MANDATORY SKILLS ({candidate.missing_skills?.length || 0})</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {candidate.missing_skills && candidate.missing_skills.length > 0 ? (
                  candidate.missing_skills.map((skill, i) => (
                    <span
                      key={i}
                      className="px-2.5 py-1 rounded-lg text-xs font-medium bg-rose-500/10 text-rose-300 border border-rose-500/20"
                    >
                      ✕ {skill}
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-emerald-400 font-medium">None. Candidate satisfies 100% of required competencies.</span>
                )}
              </div>
            </div>

            {/* Preferred Skills */}
            {candidate.preferred_matched_skills && candidate.preferred_matched_skills.length > 0 && (
              <div className="space-y-1.5">
                <div className="flex items-center space-x-1.5 text-xs font-semibold text-blue-400 font-mono">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>PREFERRED QUALIFICATIONS ({candidate.preferred_matched_skills.length})</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {candidate.preferred_matched_skills.map((skill, i) => (
                    <span
                      key={i}
                      className="px-2.5 py-1 rounded-lg text-xs font-medium bg-blue-500/10 text-blue-300 border border-blue-500/20"
                    >
                      + {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Original Resume Text Toggle */}
          <div className="pt-2 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setShowRawText(!showRawText)}
              className="w-full flex items-center justify-between px-4 py-2.5 bg-slate-950 hover:bg-slate-800/80 rounded-xl border border-slate-800 text-xs font-semibold text-slate-200 transition"
            >
              <div className="flex items-center space-x-2">
                <FileText className="w-4 h-4 text-slate-400" />
                <span>Original Document Text View</span>
              </div>
              {showRawText ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
            </button>

            {showRawText && (
              <div className="mt-3 p-4 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-300 font-mono whitespace-pre-wrap max-h-60 overflow-y-auto leading-relaxed">
                {candidateProfile?.raw_text || 'Loading document contents...'}
              </div>
            )}
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 active:scale-[0.98] text-white text-xs font-semibold rounded-xl transition shadow-xs"
          >
            Dismiss
          </button>
        </div>

      </div>
    </dialog>
  );
}
