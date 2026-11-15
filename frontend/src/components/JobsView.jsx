import { useState, useEffect } from 'react';
import { Plus, Trash2, FileSpreadsheet, Search } from 'lucide-react';
import { fetchJobs, deleteJob, getExportCsvUrl } from '../api';
import CreateJobModal from './CreateJobModal';

export default function JobsView({ onSelectJobForRankings, _setActiveTab }) {
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

  const filteredJobs = jobs.filter(
    (j) =>
      j.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      j.required_skills.some((s) => s.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Page Header: Serif H1 (36-40px) + One Muted Sentence + Action Right */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 border-b border-line">
        <div>
          <h1 className="font-serif text-[36px] sm:text-[40px] font-normal text-ink tracking-tight leading-none">
            Job Openings
          </h1>
          <p className="text-[15px] text-ink-muted mt-2 font-sans">
            Specify required competencies, review application volume, and export screening results.
          </p>
        </div>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="inline-flex items-center space-x-2 px-4 py-2 bg-wine hover:bg-wine-hover text-white rounded-[8px] text-[14px] font-medium transition-colors shadow-xs self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New Job Opening</span>
        </button>
      </div>

      {/* Filter / Search Bar */}
      <div className="relative max-w-md">
        <Search className="w-4 h-4 absolute left-3.5 top-3 text-ink-muted" />
        <input
          type="text"
          placeholder="Filter jobs by title or required skill..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-surface border border-line rounded-[8px] text-[14px] text-ink placeholder:text-ink-subtle focus:outline-none focus:ring-2 focus:ring-gold transition-colors shadow-xs"
        />
      </div>

      {/* Jobs Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="quiet-card h-64 bg-surface animate-pulse" />
          ))}
        </div>
      ) : filteredJobs.length === 0 ? (
        <div className="quiet-card bg-surface p-12 text-center space-y-3">
          <h3 className="font-serif text-2xl text-ink font-normal">No Positions Found</h3>
          <p className="text-[14px] text-ink-muted max-w-sm mx-auto font-sans">
            {searchQuery
              ? 'No job records match the search filter.'
              : 'Create an opening to begin candidate screening.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredJobs.map((job) => (
            <div
              key={job.job_id}
              className="quiet-card-interactive p-6 flex flex-col justify-between space-y-6"
            >
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <h2 className="font-serif text-2xl text-ink font-normal">{job.title}</h2>
                    <div className="flex items-center space-x-1.5 text-[13px] text-ink-muted font-mono">
                      <span className="font-semibold text-ink">{job.applications_count || 0}</span>
                      <span>evaluated candidates</span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleDelete(job.job_id)}
                    disabled={deletingId === job.job_id}
                    title="Delete position"
                    className="p-1.5 text-ink-muted hover:text-wine rounded-[6px] transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <p className="text-[14px] text-ink-muted line-clamp-2 leading-[1.6] font-sans">
                  {job.description}
                </p>

                {/* Required Skills */}
                <div className="space-y-2 pt-2 border-t border-line">
                  <span className="text-[13px] font-mono text-ink-muted uppercase block">
                    Required Skills ({job.required_skills?.length || 0})
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {job.required_skills?.map((skill, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-0.5 rounded-[6px] bg-surface-alt text-ink text-[13px] font-sans"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-line flex items-center justify-between gap-3">
                <button
                  onClick={() => onSelectJobForRankings(job.job_id)}
                  className="flex-1 py-2 px-3 text-center border border-line text-ink hover:text-wine hover:border-wine rounded-[8px] text-[14px] font-medium transition-colors"
                >
                  Leaderboard
                </button>

                <a
                  href={getExportCsvUrl(job.job_id)}
                  download
                  title="Export candidates as CSV"
                  className="p-2 border border-line rounded-[8px] text-ink-muted hover:text-ink hover:bg-surface-alt transition-colors"
                >
                  <FileSpreadsheet className="w-4 h-4" />
                </a>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {isCreateModalOpen && (
        <CreateJobModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onJobCreated={() => {
            loadJobs();
            setIsCreateModalOpen(false);
          }}
        />
      )}
    </div>
  );
}
