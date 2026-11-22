import { ShieldCheck, AlertTriangle } from 'lucide-react';
import { Dialog, Button, Skeleton } from '../../components/ui';
import { useJobQuality } from '../../hooks';

export default function JobQualityDialog({ job, onClose }) {
  const { data: inspectedQuality, isLoading: inspectedQualityLoading } = useJobQuality(
    job?.job_id
  );

  if (!job) return null;

  return (
    <Dialog
      isOpen={!!job}
      onClose={onClose}
      title={`JD Quality: ${job.title}`}
      description="Inspect rubric grading for bias, restrictive filters, and clarity benchmarks."
    >
      <div className="space-y-4 pt-1">
        {inspectedQualityLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-20 w-full" />
          </div>
        ) : inspectedQuality ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-[10px] bg-surface-alt border border-line">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-primary" strokeWidth={1.75} />
                <span className="font-semibold text-ink text-[15px]">
                  Quality Grade: {inspectedQuality.grade}
                </span>
              </div>
              <span className="text-[20px] font-bold text-ink tabular-nums">
                {inspectedQuality.overall_score}/100
              </span>
            </div>

            {inspectedQuality.suggestions?.length > 0 && (
              <div className="space-y-2">
                <div className="text-[13px] font-semibold text-ink">Actionable Suggestions</div>
                <div className="space-y-1.5">
                  {inspectedQuality.suggestions.map((sug, sIdx) => (
                    <div
                      key={sIdx}
                      className="p-3 rounded-[8px] bg-surface border border-line flex items-start gap-2 text-[13px] text-ink-muted"
                    >
                      <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" strokeWidth={1.75} />
                      <span>{sug}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="text-[13px] text-ink-muted py-4 text-center">
            No quality audit available for this job opening.
          </div>
        )}

        <div className="flex justify-end pt-3 border-t border-line">
          <Button variant="secondary" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </Dialog>
  );
}
