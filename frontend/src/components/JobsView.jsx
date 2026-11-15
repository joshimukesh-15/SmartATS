import React, { useState, useEffect } from 'react';
import {
  Briefcase,
  Plus,
  Trash2,
  Users,
  Award,
  FileSpreadsheet,
  Search,
} from 'lucide-react';
import { fetchJobs, deleteJob, getExportCsvUrl } from '../api';
import CreateJobModal from './CreateJobModal';

export default function JobsView({ onSelectJobForRankings, setActiveTab }) {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const loadJobs = async () => {
    setLoading(true);
    try {
      const data = await fetchJobs();
      setJobs(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadJobs();
  }, []);

  const handleDelete = async (jobId) => {
    if (window.confirm('Delete this job opening and its associated candidate match data?')) {
      setDeletingId(jobId);
      try {
        await deleteJob(jobId);
        setJobs(jobs.filter((j) => j.job_id !== jobId));
      } catch (err) {
        alert('Failed to delete job: ' + err.message);
      } finally {
        setDeletingId(null);
      }
    }
  };

  const filteredJobs = jobs.filter((j) =>
    j.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    j.required_skills.some((s) => s.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-[#E8DDD0] pb-6">
        <div>
          <span className="eyebrow-label block">
            Position Directory
          </span>
          <h1 className="font-serif text-3xl font-bold text-[#2A1015] mt-1 tracking-tight">
            Job Openings
          </h1>
          <p className="text-xs text-[#6B5A55] mt-1 font-sans">
            Specify technical competencies, review application volume, and export screening results.
          </p>
        </div>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="inline-flex items-center space-x-2 px-5 py-2.5 bg-[#7B1E3A] hover:bg-[#5E1229] active:scale-[0.98] text-white rounded-full text-xs font-semibold tracking-wide transition-all shadow-xs self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5 text-white" />
          <span>New Job Opening</span>
        </button>
      </div>

      {/* Filter / Search Bar */}
      <div className="relative max-w-md">
        <Search className="w-4 h-4 absolute left-3.5 top-3 text-[#6B5A55]" />
        <input
          type="text"
          placeholder="Filter jobs by title or required skill..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#E8DDD0] rounded-xl text-xs text-[#2A1015] placeholder-[#6B5A55]/60 focus:outline-none focus:border-[#7B1E3A] transition-colors shadow-[0_1px_2px_rgba(42,16,21,0.05)]"
        />
      </div>

      {/* Jobs Grid (Hover lift on cards, outlined wine Leaderboard button) */}
      {loading ? (
        <div className="flex items-center justify-center min-h-[30vh]">
          <div className="w-8 h-8 border-2 border-[#7B1E3A] border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : filteredJobs.length === 0 ? (
        <div className="bg-white border border-[#E8DDD0] rounded-2xl p-12 text-center space-y-2">
          <Briefcase className="w-8 h-8 text-[#B8893B] mx-auto opacity-70" />
          <h3 className="font-serif text-base font-bold text-[#2A1015]">No Positions Found</h3>
          <p className="text-xs text-[#6B5A55] max-w-sm mx-auto font-sans">
            {searchQuery ? 'No job records match the search filter.' : 'Create an opening to begin candidate screening.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredJobs.map((job) => (
            <div
              key={job.job_id}
              className="bg-white border border-[#E8DDD0] hover:border-[#B8893B] rounded-2xl p-6 shadow-[0_1px_2px_rgba(42,16,21,0.05)] hover:shadow-[0_8px_24px_rgba(123,30,58,0.12)] hover:-translate-y-1 flex flex-col justify-between transition-all duration-200 group space-y-6 relative overflow-hidden before:absolute before:top-0 before:left-0 before:right-0 before:h-[2px] before:bg-transparent hover:before:bg-[#B8893B]"
            >
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <h3 className="font-serif text-lg font-bold text-[#2A1015] group-hover:text-[#7B1E3A] transition-colors">
                      {job.title}
                    </h3>
                    <div className="flex items-center space-x-1.5 text-xs text-[#6B5A55] font-mono">
                      <span className="font-bold text-[#2A1015]">{job.applications_count || 0}</span>
                      <span>Candidates</span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDelete(job.job_id)}
                    disabled={deletingId === job.job_id}
                    title="Delete Position"
                    className="p-1.5 rounded-lg text-[#6B5A55] hover:text-[#7B1E3A] hover:bg-[#F8ECEF] transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <p className="text-xs text-[#6B5A55] line-clamp-3 leading-relaxed">
                  {job.description}
                </p>

                {/* Mandatory Skills */}
                <div className="space-y-1.5">
                  <span className="text-[10px] uppercase font-mono font-semibold text-[#8A6420]">
                    Required Competencies ({job.required_skills.length})
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {job.required_skills.map((skill, i) => (
                      <span
                        key={i}
                        className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#F7EDD8] text-[#8A6420] border border-[#B8893B]/30"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Preferred Skills */}
                {job.preferred_skills && job.preferred_skills.length > 0 && (
                  <div className="space-y-1.5">
                    <span className="text-[10px] uppercase font-mono font-semibold text-[#7B1E3A]">
                      Preferred Qualifications ({job.preferred_skills.length})
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {job.preferred_skills.map((skill, i) => (
                        <span
                          key={i}
                          className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#F8ECEF] text-[#7B1E3A] border border-[#7B1E3A]/20"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Actions Footer: Outlined wine Leaderboard button, NOT black */}
              <div className="pt-4 border-t border-[#E8DDD0] flex items-center justify-between gap-2">
                <button
                  onClick={() => onSelectJobForRankings(job.job_id)}
                  className="flex-1 inline-flex items-center justify-center space-x-1.5 px-4 py-2 bg-transparent hover:bg-[#F8ECEF] active:scale-[0.98] text-[#7B1E3A] border border-[#7B1E3A] rounded-full text-xs font-semibold transition-all shadow-xs"
                >
                  <Award className="w-3.5 h-3.5 text-[#B8893B]" />
                  <span>Leaderboard</span>
                </button>
                <a
                  href={getExportCsvUrl(job.job_id)}
                  download
                  title="Export Rankings CSV"
                  className="p-2 bg-white hover:bg-[#F5EEE6] text-[#2A1015] border border-[#E8DDD0] rounded-full text-xs transition shadow-xs"
                >
                  <FileSpreadsheet className="w-4 h-4 text-[#6B5A55]" />
                </a>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Job Dialog Modal */}
      <CreateJobModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onJobCreated={(newJob) => setJobs([newJob, ...jobs])}
      />

    </div>
  );
}
