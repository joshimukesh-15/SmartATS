import { CheckCircle2 } from 'lucide-react';

const UPLOAD_STEPS = [
  { id: 1, title: 'Choose job opening' },
  { id: 2, title: 'Add resume files' },
  { id: 3, title: 'Review screening results' },
];

export default function UploadStepHeader({ activeStep }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3 p-1.5 rounded-[12px] bg-surface border border-line shadow-xs select-none">
      {UPLOAD_STEPS.map((step) => {
        const isActive = activeStep === step.id;
        const isComplete = activeStep > step.id;

        return (
          <div
            key={step.id}
            className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-[8px] transition-colors ${
              isActive
                ? 'bg-surface-alt text-ink font-semibold border border-line'
                : isComplete
                  ? 'text-ink-muted bg-surface'
                  : 'text-ink-subtle bg-surface'
            }`}
          >
            <span
              className={`w-6 h-6 rounded-[6px] text-[13px] font-semibold flex items-center justify-center tabular-nums shrink-0 ${
                isActive
                  ? 'bg-primary text-on-primary'
                  : isComplete
                    ? 'bg-primary/10 text-primary'
                    : 'bg-surface-alt text-ink-subtle'
              }`}
            >
              {isComplete ? (
                <CheckCircle2 className="w-3.5 h-3.5 text-primary" strokeWidth={1.75} />
              ) : (
                `0${step.id}`
              )}
            </span>
            <span className="text-[13px] truncate">{step.title}</span>
          </div>
        );
      })}
    </div>
  );
}
