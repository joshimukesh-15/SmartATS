import { FileText, Clock, AlertCircle, X, CheckCircle2 } from 'lucide-react';
import { Badge } from '../../components/ui';

export default function UploadFileRow({
  file,
  index,
  statusInfo,
  processing,
  onRemove,
}) {
  const isQueued = statusInfo?.status === 'queued' || statusInfo?.status === 'accepted';
  const isDuplicate = statusInfo?.status === 'duplicate';
  const isRejected = statusInfo?.status === 'rejected';
  const isError = statusInfo?.status === 'error';
  const isUploading = statusInfo?.status === 'uploading' || statusInfo?.status === 'parsing';

  return (
    <div className="py-3.5 space-y-2 first:pt-0 last:pb-0">
      <div className="flex items-center justify-between gap-4">
        {/* Left: Icon & File Meta */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-8 h-8 rounded-[6px] bg-surface-alt border border-line flex items-center justify-center shrink-0">
            <FileText className="w-4 h-4 text-ink-muted" strokeWidth={1.75} />
          </div>
          <div className="min-w-0">
            <div className="text-[14px] font-medium text-ink truncate">{file.name}</div>
            <div className="text-[13px] text-ink-subtle tabular-nums">
              {(file.size / 1024).toFixed(0)} KB
              {statusInfo?.candidateName && (
                <span className="text-ink-muted font-medium ml-1.5">
                  · {statusInfo.candidateName}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Right: Badges & Remove Button */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="text-[13px] text-right">
            {!statusInfo ? (
              <span className="text-ink-subtle">Ready to upload</span>
            ) : isQueued ? (
              <Badge variant="primary" className="gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" strokeWidth={1.75} />
                <span>Queued</span>
              </Badge>
            ) : isDuplicate ? (
              <Badge variant="default" className="gap-1 border-line">
                <Clock className="w-3.5 h-3.5 text-ink-muted" strokeWidth={1.75} />
                <span>Duplicate</span>
              </Badge>
            ) : isRejected ? (
              <Badge variant="outline" className="gap-1 border-danger text-danger">
                <AlertCircle className="w-3.5 h-3.5" strokeWidth={1.75} />
                <span>Rejected</span>
              </Badge>
            ) : isError ? (
              <Badge variant="outline" className="gap-1 border-danger text-danger">
                <AlertCircle className="w-3.5 h-3.5" strokeWidth={1.75} />
                <span>Error</span>
              </Badge>
            ) : (
              <span className="inline-flex items-center gap-2 text-ink-muted font-medium">
                <span className="w-3.5 h-3.5 border-2 border-primary border-t-transparent rounded-full animate-spin shrink-0" />
                <span>{statusInfo.text}</span>
              </span>
            )}
          </div>

          {!processing && !statusInfo && (
            <button
              type="button"
              onClick={() => onRemove(index)}
              aria-label={`Remove ${file.name}`}
              className="p-1 text-ink-muted hover:text-ink transition-colors rounded-[6px] hover:bg-surface-alt cursor-pointer"
            >
              <X className="w-4 h-4" strokeWidth={1.75} />
            </button>
          )}
        </div>
      </div>

      {/* Progress Bar (during upload & parsing) */}
      {isUploading && (
        <div className="h-1.5 w-full bg-surface-alt rounded-[4px] overflow-hidden">
          <div className="h-full bg-primary rounded-[4px] animate-pulse w-full transition-all duration-300" />
        </div>
      )}

      {/* Explanatory Message below file if processed */}
      {statusInfo?.text && !isUploading && (
        <div className="text-[13px] text-ink-muted leading-tight pl-11">
          {statusInfo.text}
        </div>
      )}
    </div>
  );
}
