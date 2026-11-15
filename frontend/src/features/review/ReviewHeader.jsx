import { Link } from 'react-router-dom';
import { ArrowRight, ChevronDown } from 'lucide-react';

export default function ReviewHeader({
  jobsList = [],
  activeJobId,
  onSelectJob,
}) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-8 border-b border-line">
      <div>
        <h1 className="text-[30px] font-semibold text-ink tracking-[-0.03em] leading-[1.15]">
          Candidate Review
        </h1>
        <p className="text-[15px] leading-[1.6] text-ink-muted mt-2">
          Auditable candidate evaluation, multi-factor scoring breakdown, and stage pipeline.
        </p>
      </div>

      {/* Job selector & quick actions */}
      <div className="flex items-center gap-3">
        <div className="relative">
          <select
            value={activeJobId || ''}
            onChange={(e) => onSelectJob(Number(e.target.value))}
            className="appearance-none pl-3 pr-8 py-2 rounded-[10px] border border-line bg-surface text-ink text-[13px] font-medium hover:border-primary transition-colors cursor-pointer select-none focus:outline-hidden focus:ring-2 focus:ring-primary"
          >
            {jobsList.map((job) => (
              <option key={job.job_id} value={job.job_id}>
                {job.title}
              </option>
            ))}
          </select>
          <ChevronDown
            className="w-4 h-4 text-ink-muted pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2"
            strokeWidth={1.75}
          />
        </div>

        <Link
          to={activeJobId ? `/studio/leaderboard?jobId=${activeJobId}` : '/studio/leaderboard'}
          className="px-3.5 py-2 rounded-[10px] border border-line bg-surface hover:bg-surface-alt text-[13px] font-medium text-ink transition-colors flex items-center gap-1.5"
        >
          <span>View Rankings</span>
          <ArrowRight className="w-4 h-4 text-ink-subtle" strokeWidth={1.75} />
        </Link>
      </div>
    </div>
  );
}
