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
    <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-8 border-b border-line">
      <div>
        <h1 className="text-[30px] font-semibold text-ink tracking-[-0.03em] leading-[1.15]">
          Leaderboard
        </h1>
        <p className="text-[15px] leading-[1.6] text-ink-muted mt-2">
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
          leftIcon={<SlidersHorizontal className="w-4 h-4" strokeWidth={1.75} />}
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
            <FileSpreadsheet className="w-4 h-4 text-ink-muted" strokeWidth={1.75} />
            <span>Export CSV</span>
          </a>
        )}
      </div>
    </div>
  );
}
