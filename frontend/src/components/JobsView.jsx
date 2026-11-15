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
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-[#E6E1D7] pb-6">
        <div>
          <span className="text-xs uppercase font-mono tracking-wider text-[#C96442]">
            Directory
          </span>
          <h1 className="text-3xl font-serif font-bold text-[#191716] mt-1 tracking-tight">
            Job Openings
          </h1>
          <p className="text-xs text-[#79736B] mt-1 font-sans">
            Specify technical competencies, review application volume, and export screening results.
          </p>
        </div>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="inline-flex items-center space-x-2 px-5 py-2.5 bg-[#C96442] hover:bg-[#B55433] active:scale-[0.98] text-white rounded-full text-xs font-semibold tracking-wide transition-all shadow-xs self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Job Opening</span>
        </button>
      </div>

      {/* Filter / Search Bar */}
      <div className="relative max-w-md">
        <Search className="w-4 h-4 absolute left-3.5 top-3 text-[#79736B]" />
        <input
          type="text"
          placeholder="Filter jobs by title or required skill..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#E6E1D7] rounded-xl text-xs text-[#191716] placeholder-[#A8A29A] focus:outline-none focus:border-[#C96442] transition-colors shadow-xs"
        />
      </div>

      {/* Jobs Grid */}
      {loading ? (
        <div className="flex items-center justify-center min-h-[30vh]">
          <div className="w-8 h-8 border-2 border-[#191716] border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : filteredJobs.length === 0 ? (
        <div className="bg-[#F6F3ED] border border-[#E6E1D7] rounded-2xl p-12 text-center space-y-2">
          <Briefcase className="w-8 h-8 text-[#A8A29A] mx-auto" />
          <h3 className="text-base font-bold text-[#191716]">No Positions Found</h3>
          <p className="text-xs text-[#79736B] max-w-sm mx-auto">
            {searchQuery ? 'No job records match the search filter.' : 'Create an opening to begin candidate screening.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredJobs.map((job) => (
            <div
              key={job.job_id}
              className="bg-white border border-[#E6E1D7] hover:border-[#D5CEBE] rounded-2xl p-6 shadow-xs flex flex-col justify-between transition-all duration-300 hover:-translate-y-0.5 group space-y-6"
            >
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <h3 className="text-lg font-serif font-bold text-[#191716] group-hover:text-[#C96442] transition-colors">
                      {job.title}
                    </h3>
                    <div className="flex items-center space-x-1.5 text-xs text-[#79736B] font-mono">
                      <span className="font-semibold text-[#191716]">{job.applications_count || 0}</span>
                      <span>Candidates</span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDelete(job.job_id)}
                    disabled={deletingId === job.job_id}
                    title="Delete Position"
                    className="p-1.5 rounded-lg text-[#79736B] hover:text-[#B93826] hover:bg-[#FDF3F1] transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <p className="text-xs text-[#4A4641] line-clamp-3 leading-relaxed">
                  {job.description}
                </p>

                {/* Mandatory Skills */}
                <div className="space-y-1.5">
                  <span className="text-[10px] uppercase font-mono font-semibold text-[#276749]">
                    Required Competencies ({job.required_skills.length})
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {job.required_skills.map((skill, i) => (
                      <span
                        key={i}
                        className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#F0F6F2] text-[#276749] border border-[#C8E3D4]"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Preferred Skills */}
                {job.preferred_skills && job.preferred_skills.length > 0 && (
                  <div className="space-y-1.5">
                    <span className="text-[10px] uppercase font-mono font-semibold text-[#C96442]">
                      Preferred Qualifications ({job.preferred_skills.length})
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {job.preferred_skills.map((skill, i) => (
                        <span
                          key={i}
                          className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#FAF0EB] text-[#C96442] border border-[#F0D5CA]"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Actions Footer */}
              <div className="pt-4 border-t border-[#E6E1D7] flex items-center justify-between gap-2">
                <button
                  onClick={() => onSelectJobForRankings(job.job_id)}
                  className="flex-1 inline-flex items-center justify-center space-x-1.5 px-4 py-2 bg-[#191716] hover:bg-[#2B2927] active:scale-[0.98] text-[#FAF8F5] rounded-full text-xs font-semibold transition-all shadow-xs"
                >
                  <Award className="w-3.5 h-3.5" />
                  <span>Leaderboard</span>
                </button>
                <a
                  href={getExportCsvUrl(job.job_id)}
                  download
                  title="Export Rankings CSV"
                  className="p-2 bg-white hover:bg-[#F6F3ED] text-[#191716] border border-[#E6E1D7] rounded-full text-xs transition shadow-xs"
                >
                  <FileSpreadsheet className="w-4 h-4 text-[#79736B]" />
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
