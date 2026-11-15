import { FileSpreadsheet, SlidersHorizontal } from 'lucide-react';
import { Select, Button } from '../../components/ui';
import { getExportCsvUrl } from '../../api';

export default function LeaderboardHeader({
  jobs = [],
  activeJobId,
  activeJob,
  onJobChange,
  appliedWeights,
  onOpenWeights,
}) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 border-b border-line">
      <div>
        <h1 className="text-[28px] sm:text-[32px] font-semibold text-ink tracking-tight">
          Leaderboard
        </h1>
        <p className="text-[14px] text-ink-muted mt-1">
          Explainable candidate rankings with multi-pillar scoring, configurable weights, and pipeline review.
        </p>
      </div>

      {/* Job Selector + Weights Tuner + Export */}
      <div className="flex items-center gap-3 flex-wrap sm:flex-nowrap">
        {jobs.length > 0 && (
          <div className="w-56">
            <Select value={activeJobId} onChange={(e) => onJobChange(e.target.value)}>
              {jobs.map((job) => (
                <option key={job.job_id} value={job.job_id}>
                  {job.title}
                </option>
              ))}
            </Select>
          </div>
        )}

        <Button
          variant="secondary"
          size="sm"
          leftIcon={<SlidersHorizontal className="w-3.5 h-3.5" />}
          onClick={onOpenWeights}
          className="relative"
        >
          <span>Weights</span>
          {(appliedWeights || activeJob?.custom_weights) && (
            <span className="w-1.5 h-1.5 rounded-full bg-champagne ml-0.5" title="Custom weights active" />
          )}
        </Button>

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
  );
}
