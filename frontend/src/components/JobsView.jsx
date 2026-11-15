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
      
      {/* Editorial Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-[#E5DFD5] pb-6">
        <div>
          <span className="text-[11px] uppercase font-mono tracking-wider text-[#8A8477]">
            Directory
          </span>
          <h1 className="font-serif text-3xl font-bold text-[#1A1915] mt-1">
            Job Openings
          </h1>
          <p className="text-xs text-[#59554D] mt-1 font-sans">
            Specify technical competencies, review application volume, and export screening results.
          </p>
        </div>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="inline-flex items-center space-x-2 px-4 py-2.5 bg-[#1A1915] hover:bg-[#2B2A27] text-white rounded-md text-xs font-semibold tracking-wide transition shadow-xs self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Job Opening</span>
        </button>
      </div>

      {/* Filter / Search Bar */}
      <div className="relative max-w-md">
        <Search className="w-4 h-4 absolute left-3.5 top-3 text-[#8A8477]" />
        <input
          type="text"
          placeholder="Filter jobs by title or required skill..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2 bg-white border border-[#E5DFD5] rounded-md text-xs text-[#1A1915] placeholder-[#8A8477] focus:outline-none focus:border-[#1A1915] transition"
        />
      </div>

      {/* Jobs Grid */}
      {loading ? (
        <div className="flex items-center justify-center min-h-[30vh]">
          <div className="w-7 h-7 border-2 border-[#1A1915] border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : filteredJobs.length === 0 ? (
        <div className="bg-white border border-[#E5DFD5] rounded-xl p-12 text-center space-y-2">
          <Briefcase className="w-8 h-8 text-[#8A8477] mx-auto" />
          <h3 className="font-serif text-base font-bold text-[#1A1915]">No Positions Found</h3>
          <p className="text-xs text-[#8A8477] max-w-sm mx-auto">
            {searchQuery ? 'No job records match the search filter.' : 'Create an opening to begin candidate screening.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredJobs.map((job) => (
            <div
              key={job.job_id}
              className="bg-white border border-[#E5DFD5] hover:border-[#D6CEBF] rounded-xl p-6 shadow-xs flex flex-col justify-between transition group space-y-6"
            >
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <h3 className="font-serif text-lg font-bold text-[#1A1915] group-hover:text-[#CC5A36] transition">
                      {job.title}
                    </h3>
                    <div className="flex items-center space-x-1.5 text-xs text-[#8A8477] font-mono">
                      <span className="font-semibold text-[#1A1915]">{job.applications_count || 0}</span>
                      <span>Candidates</span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDelete(job.job_id)}
                    disabled={deletingId === job.job_id}
                    title="Delete Position"
                    className="p-1 rounded text-[#8A8477] hover:text-[#B9382C] transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <p className="text-xs text-[#59554D] line-clamp-3 leading-relaxed">
                  {job.description}
                </p>

                {/* Mandatory Skills */}
                <div className="space-y-1.5">
                  <span className="text-[10px] uppercase font-mono font-semibold text-[#1E7E4E]">
                    Required Competencies ({job.required_skills.length})
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {job.required_skills.map((skill, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 rounded text-[11px] font-sans font-medium bg-[#FAF8F5] text-[#1A1915] border border-[#E5DFD5]"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Preferred Skills */}
                {job.preferred_skills && job.preferred_skills.length > 0 && (
                  <div className="space-y-1.5">
                    <span className="text-[10px] uppercase font-mono font-semibold text-[#6D59A8]">
                      Preferred Qualifications ({job.preferred_skills.length})
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {job.preferred_skills.map((skill, i) => (
                        <span
                          key={i}
                          className="px-2 py-0.5 rounded text-[11px] font-sans font-medium bg-[#FAF8F5] text-[#59554D] border border-[#E5DFD5]"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Actions Footer */}
              <div className="pt-4 border-t border-[#F3EFEA] flex items-center justify-between gap-2">
                <button
                  onClick={() => onSelectJobForRankings(job.job_id)}
                  className="flex-1 inline-flex items-center justify-center space-x-1.5 px-3 py-2 bg-[#1A1915] hover:bg-[#2B2A27] text-white rounded text-xs font-semibold transition"
                >
                  <Award className="w-3.5 h-3.5" />
                  <span>Leaderboard</span>
                </button>
                <a
                  href={getExportCsvUrl(job.job_id)}
                  download
                  title="Export Rankings CSV"
                  className="p-2 bg-[#FAF8F5] hover:bg-[#F3EFEA] text-[#1A1915] border border-[#E5DFD5] rounded text-xs transition"
                >
                  <FileSpreadsheet className="w-4 h-4 text-[#1E7E4E]" />
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
