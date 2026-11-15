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
      className="fixed inset-0 m-auto bg-white border border-[#E8DDD0] rounded-2xl w-full max-w-3xl p-0 text-[#2A1015] shadow-2xl backdrop:bg-[#2A1015]/50 backdrop:backdrop-blur-xs animate-in fade-in zoom-in-95 duration-200"
    >
      <div className="flex flex-col max-h-[85vh] overflow-hidden">
        
        {/* Header */}
        <div className="p-6 border-b border-[#E8DDD0] flex items-start justify-between bg-[#F5EEE6]">
          <div>
            <div className="flex items-center space-x-3">
              <h2 id="candidate-modal-title" className="text-2xl sm:text-3xl font-serif font-bold text-[#2A1015] tracking-tight">
                {candidate.candidate_name}
              </h2>
              {candidate.rank && (
                <span className="font-mono text-xs px-2.5 py-0.5 rounded-full bg-[#F7EDD8] text-[#8A6420] border border-[#B8893B]/30 font-semibold shadow-xs">
                  Rank #{candidate.rank}
                </span>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-4 mt-2 text-xs text-[#6B5A55] font-mono">
              {candidate.candidate_email && (
                <span className="flex items-center space-x-1.5">
                  <Mail className="w-3.5 h-3.5 text-[#B8893B]" />
                  <span>{candidate.candidate_email}</span>
                </span>
              )}
              {candidate.candidate_phone && (
                <span className="flex items-center space-x-1.5">
                  <Phone className="w-3.5 h-3.5 text-[#B8893B]" />
                  <span>{candidate.candidate_phone}</span>
                </span>
              )}
              {candidate.applied_at && (
                <span className="flex items-center space-x-1.5">
                  <Calendar className="w-3.5 h-3.5 text-[#6B5A55]" />
                  <span>{new Date(candidate.applied_at).toLocaleDateString()}</span>
                </span>
              )}
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="p-1.5 rounded-lg text-[#6B5A55] hover:text-[#7B1E3A] hover:bg-[#F8ECEF] transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 sm:p-8 space-y-7 overflow-y-auto">
          
          {/* Score Summary Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className={`rounded-xl p-4 text-center shadow-xs border ${
              finalScore >= 80
                ? 'bg-[#7B1E3A] text-white border-[#7B1E3A]'
                : finalScore >= 60
                ? 'bg-[#F7EDD8] text-[#8A6420] border-[#B8893B]/30'
                : 'bg-[#EFE7E1] text-[#6B5A55] border-[#E8DDD0]'
            }`}>
              <span className={`text-[10px] uppercase font-mono tracking-[0.12em] font-semibold ${
                finalScore >= 80 ? 'text-[#F7EDD8]' : 'text-[#6B5A55]'
              }`}>
                Final Match Score
              </span>
              <div className="text-3xl font-serif font-bold mt-1">
                {finalScore.toFixed(1)}%
              </div>
              <div className={`text-[10px] mt-1 font-mono ${
                finalScore >= 80 ? 'text-white/80' : 'text-[#6B5A55]'
              }`}>
                Weighted Recommendation
              </div>
            </div>

            <div className="bg-[#F7EDD8] border border-[#B8893B]/30 rounded-xl p-4 text-center">
              <span className="text-[10px] uppercase font-mono tracking-[0.12em] font-semibold text-[#8A6420]">
                Required Skills Match
              </span>
              <div className="text-2xl font-serif font-bold text-[#8A6420] mt-1">
                {keywordScore.toFixed(1)}%
              </div>
              <div className="text-[10px] text-[#8A6420]/80 mt-1 font-mono">
                {candidate.matched_skills?.length || 0} skills verified
              </div>
            </div>

            <div className="bg-[#F5EEE6] border border-[#E8DDD0] rounded-xl p-4 text-center">
              <span className="text-[10px] uppercase font-mono tracking-[0.12em] font-semibold text-[#6B5A55]">
                Experience Alignment
              </span>
              <div className="text-2xl font-serif font-bold text-[#2A1015] mt-1">
                {tfidfScore.toFixed(1)}%
              </div>
              <div className="text-[10px] text-[#6B5A55] mt-1 font-mono">
                Contextual Vector Alignment
              </div>
            </div>
          </div>

          {/* Diagnostic Note */}
          <div className="bg-[#FBF7F2] border border-[#E8DDD0] rounded-xl p-5 space-y-3">
            <div className="flex items-center space-x-2 text-xs font-mono uppercase tracking-[0.12em] text-[#B8893B] font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-[#B8893B]" />
              <span>Diagnostic Scoring Explanation</span>
            </div>
            <div className="p-4 bg-white rounded-lg border border-[#E8DDD0] text-xs text-[#2A1015] font-mono whitespace-pre-line leading-relaxed shadow-xs">
              {candidate.score_explanation || 'No evaluation notes available.'}
            </div>
          </div>

          {/* Skill Gap Analysis Section */}
          <div className="space-y-4">
            <h3 className="text-base font-serif font-bold text-[#2A1015]">
              Competency Breakdown
            </h3>
            
            {/* Matched Required Skills */}
            <div className="space-y-1.5">
              <div className="flex items-center space-x-1.5 text-xs font-semibold text-[#8A6420] font-mono tracking-wider">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#B8893B]" />
                <span>MATCHED MANDATORY SKILLS ({candidate.matched_skills?.length || 0})</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {candidate.matched_skills && candidate.matched_skills.length > 0 ? (
                  candidate.matched_skills.map((skill, i) => (
                    <span
                      key={i}
                      className="px-2.5 py-1 rounded-full text-xs font-medium bg-[#F7EDD8] text-[#8A6420] border border-[#B8893B]/30"
                    >
                      ✓ {skill}
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-[#6B5A55]">No mandatory skills identified</span>
                )}
              </div>
            </div>

            {/* Missing Required Skills */}
            <div className="space-y-1.5">
              <div className="flex items-center space-x-1.5 text-xs font-semibold text-[#6B5A55] font-mono tracking-wider">
                <AlertCircle className="w-3.5 h-3.5 text-[#6B5A55]" />
                <span>MISSING MANDATORY SKILLS ({candidate.missing_skills?.length || 0})</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {candidate.missing_skills && candidate.missing_skills.length > 0 ? (
                  candidate.missing_skills.map((skill, i) => (
                    <span
                      key={i}
                      className="px-2.5 py-1 rounded-full text-xs font-medium bg-[#EFE7E1] text-[#6B5A55] border border-dashed border-[#6B5A55]/40"
                    >
                      ✕ {skill}
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-[#8A6420] font-medium">None. Candidate satisfies 100% of required competencies.</span>
                )}
              </div>
            </div>

            {/* Preferred Skills */}
            {candidate.preferred_matched_skills && candidate.preferred_matched_skills.length > 0 && (
              <div className="space-y-1.5">
                <div className="flex items-center space-x-1.5 text-xs font-semibold text-[#7B1E3A] font-mono tracking-wider">
                  <Sparkles className="w-3.5 h-3.5 text-[#7B1E3A]" />
                  <span>PREFERRED QUALIFICATIONS ({candidate.preferred_matched_skills.length})</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {candidate.preferred_matched_skills.map((skill, i) => (
                    <span
                      key={i}
                      className="px-2.5 py-1 rounded-full text-xs font-medium bg-[#F8ECEF] text-[#7B1E3A] border border-[#7B1E3A]/20"
                    >
                      + {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Original Resume Text Toggle */}
          <div className="pt-2 border-t border-[#E8DDD0]">
            <button
              type="button"
              onClick={() => setShowRawText(!showRawText)}
              className="w-full flex items-center justify-between px-4 py-2.5 bg-[#F5EEE6] hover:bg-[#F8ECEF] rounded-xl border border-[#E8DDD0] text-xs font-semibold text-[#2A1015] transition"
            >
              <div className="flex items-center space-x-2">
                <FileText className="w-4 h-4 text-[#B8893B]" />
                <span>Original Document Text View</span>
              </div>
              {showRawText ? <ChevronUp className="w-4 h-4 text-[#7B1E3A]" /> : <ChevronDown className="w-4 h-4 text-[#6B5A55]" />}
            </button>

            {showRawText && (
              <div className="mt-3 p-4 bg-white border border-[#E8DDD0] rounded-xl text-xs text-[#2A1015] font-mono whitespace-pre-wrap max-h-60 overflow-y-auto leading-relaxed shadow-inner">
                {candidateProfile?.raw_text || 'Loading document contents...'}
              </div>
            )}
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#E8DDD0] bg-[#F5EEE6] flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 bg-[#7B1E3A] hover:bg-[#5E1229] active:scale-[0.98] text-white text-xs font-semibold rounded-full transition shadow-xs"
          >
            Dismiss
          </button>
        </div>

      </div>
    </dialog>
  );
}
