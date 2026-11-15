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
      className="fixed inset-0 m-auto bg-[#FAF8F5] border border-[#D6CEBF] rounded-xl w-full max-w-3xl p-0 text-[#1A1915] shadow-2xl backdrop:bg-[#1A1915]/65 backdrop:backdrop-blur-xs animate-in fade-in zoom-in-95 duration-200"
    >
      <div className="flex flex-col max-h-[85vh] overflow-hidden">
        
        {/* Header */}
        <div className="p-6 border-b border-[#E5DFD5] flex items-start justify-between bg-white">
          <div>
            <div className="flex items-center space-x-3">
              <h2 id="candidate-modal-title" className="font-serif text-2xl sm:text-3xl font-bold text-[#1A1915]">
                {candidate.candidate_name}
              </h2>
              {candidate.rank && (
                <span className="font-mono text-xs px-2.5 py-0.5 rounded-full bg-[#1A1915] text-[#FAF8F5] font-semibold">
                  Rank #{candidate.rank}
                </span>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-4 mt-2 text-xs text-[#59554D] font-mono">
              {candidate.candidate_email && (
                <span className="flex items-center space-x-1.5">
                  <Mail className="w-3.5 h-3.5 text-[#8A8477]" />
                  <span>{candidate.candidate_email}</span>
                </span>
              )}
              {candidate.candidate_phone && (
                <span className="flex items-center space-x-1.5">
                  <Phone className="w-3.5 h-3.5 text-[#8A8477]" />
                  <span>{candidate.candidate_phone}</span>
                </span>
              )}
              {candidate.applied_at && (
                <span className="flex items-center space-x-1.5">
                  <Calendar className="w-3.5 h-3.5 text-[#8A8477]" />
                  <span>{new Date(candidate.applied_at).toLocaleDateString()}</span>
                </span>
              )}
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="p-1 rounded text-[#8A8477] hover:text-[#1A1915] transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 sm:p-8 space-y-7 overflow-y-auto">
          
          {/* Score Summary Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white border-2 border-[#1A1915] rounded-lg p-4 text-center">
              <span className="text-[10px] uppercase font-mono tracking-wider font-semibold text-[#8A8477]">
                Final Hybrid Score
              </span>
              <div className="font-serif text-3xl font-bold text-[#1A1915] mt-1">
                {finalScore.toFixed(1)}%
              </div>
              <div className="text-[10px] text-[#59554D] mt-1 font-mono">
                (0.60×KW + 0.40×TFIDF)
              </div>
            </div>

            <div className="bg-white border border-[#E5DFD5] rounded-lg p-4 text-center">
              <span className="text-[10px] uppercase font-mono tracking-wider font-semibold text-[#1E7E4E]">
                Keyword Match (60%)
              </span>
              <div className="font-serif text-2xl font-bold text-[#1A1915] mt-1">
                {keywordScore.toFixed(1)}%
              </div>
              <div className="text-[10px] text-[#8A8477] mt-1 font-mono">
                {candidate.matched_skills?.length || 0} skills matched
              </div>
            </div>

            <div className="bg-white border border-[#E5DFD5] rounded-lg p-4 text-center">
              <span className="text-[10px] uppercase font-mono tracking-wider font-semibold text-[#59554D]">
                TF-IDF Similarity (40%)
              </span>
              <div className="font-serif text-2xl font-bold text-[#1A1915] mt-1">
                {tfidfScore.toFixed(1)}%
              </div>
              <div className="text-[10px] text-[#8A8477] mt-1 font-mono">
                Lexical Cosine Alignment
              </div>
            </div>
          </div>

          {/* Explainable Memorandum Card */}
          <div className="bg-white border border-[#E5DFD5] rounded-lg p-5 space-y-3">
            <div className="flex items-center space-x-2 text-xs font-mono uppercase tracking-wider text-[#CC5A36] font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Diagnostic Scoring Explanation</span>
            </div>
            <div className="p-4 bg-[#FAF8F5] rounded border border-[#E5DFD5] text-xs text-[#1A1915] font-mono whitespace-pre-line leading-relaxed">
              {candidate.score_explanation || 'No evaluation notes available.'}
            </div>
          </div>

          {/* Skill Gap Analysis Section */}
          <div className="space-y-4">
            <h3 className="font-serif text-base font-bold text-[#1A1915]">
              Competency Breakdown
            </h3>
            
            {/* Matched Required Skills */}
            <div className="space-y-1.5">
              <div className="flex items-center space-x-1.5 text-xs font-semibold text-[#1E7E4E] font-mono">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>MATCHED MANDATORY SKILLS ({candidate.matched_skills?.length || 0})</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {candidate.matched_skills && candidate.matched_skills.length > 0 ? (
                  candidate.matched_skills.map((skill, i) => (
                    <span
                      key={i}
                      className="px-2.5 py-1 rounded text-xs font-medium bg-[#EFFBF4] text-[#1E7E4E] border border-[#C2ECD4]"
                    >
                      ✓ {skill}
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-[#8A8477] italic">No mandatory skills identified</span>
                )}
              </div>
            </div>

            {/* Missing Required Skills */}
            <div className="space-y-1.5">
              <div className="flex items-center space-x-1.5 text-xs font-semibold text-[#B9382C] font-mono">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>MISSING MANDATORY SKILLS ({candidate.missing_skills?.length || 0})</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {candidate.missing_skills && candidate.missing_skills.length > 0 ? (
                  candidate.missing_skills.map((skill, i) => (
                    <span
                      key={i}
                      className="px-2.5 py-1 rounded text-xs font-medium bg-[#FDF1F0] text-[#B9382C] border border-[#F5CBC8]"
                    >
                      ✕ {skill}
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-[#1E7E4E] font-medium">None. Candidate satisfies 100% of required competencies.</span>
                )}
              </div>
            </div>

            {/* Preferred Skills */}
            {candidate.preferred_matched_skills && candidate.preferred_matched_skills.length > 0 && (
              <div className="space-y-1.5">
                <div className="flex items-center space-x-1.5 text-xs font-semibold text-[#6D59A8] font-mono">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>PREFERRED QUALIFICATIONS ({candidate.preferred_matched_skills.length})</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {candidate.preferred_matched_skills.map((skill, i) => (
                    <span
                      key={i}
                      className="px-2.5 py-1 rounded text-xs font-medium bg-[#F6F3FB] text-[#6D59A8] border border-[#DDD6F3]"
                    >
                      + {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Original Resume Text Toggle */}
          <div className="pt-2 border-t border-[#E5DFD5]">
            <button
              type="button"
              onClick={() => setShowRawText(!showRawText)}
              className="w-full flex items-center justify-between px-4 py-2.5 bg-white hover:bg-[#F3EFEA] rounded border border-[#E5DFD5] text-xs font-semibold text-[#1A1915] transition"
            >
              <div className="flex items-center space-x-2">
                <FileText className="w-4 h-4 text-[#8A8477]" />
                <span>Original Document Text View</span>
              </div>
              {showRawText ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>

            {showRawText && (
              <div className="mt-3 p-4 bg-white border border-[#E5DFD5] rounded text-xs text-[#1A1915] font-mono whitespace-pre-wrap max-h-60 overflow-y-auto leading-relaxed">
                {candidateProfile?.raw_text || 'Loading document contents...'}
              </div>
            )}
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#E5DFD5] bg-white flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 bg-[#1A1915] hover:bg-[#2B2A27] text-white text-xs font-semibold rounded transition"
          >
            Dismiss
          </button>
        </div>

      </div>
    </dialog>
  );
}
