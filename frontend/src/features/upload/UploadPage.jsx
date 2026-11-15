import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { UploadCloud, FileText, AlertCircle, ArrowRight, Clock, X } from 'lucide-react';
import { useJobs, useUploadResumes } from '../../hooks';
import { Select, Button, Panel, toast } from '../../components/ui';

export default function UploadPage() {
  const navigate = useNavigate();
  const { data: jobs = [], isLoading: jobsLoading } = useJobs();
  const [selectedJobId, setSelectedJobId] = useState('');
  const [fileList, setFileList] = useState([]);
  const [processing, setProcessing] = useState(false);
  const [fileStatuses, setFileStatuses] = useState({});
  const fileInputRef = useRef(null);

  // Set default job once loaded
  const currentJobId = selectedJobId || (jobs.length > 0 ? String(jobs[0].job_id) : '');

  const uploadMutation = useUploadResumes(currentJobId);

  const handleFilesAdded = (incomingFiles) => {
    const files = Array.from(incomingFiles);
    if (files.length === 0) return;
    setFileList((prev) => [...prev, ...files]);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files?.length) {
      handleFilesAdded(e.dataTransfer.files);
    }
  };

  const handleRemoveFile = (indexToRemove) => {
    const fileToRemove = fileList[indexToRemove];
    setFileList((prev) => prev.filter((_, idx) => idx !== indexToRemove));
    if (fileToRemove) {
      setFileStatuses((prev) => {
        const next = { ...prev };
        delete next[fileToRemove.name];
        delete next[`${fileToRemove.name}-${indexToRemove}`];
        return next;
      });
    }
  };

  const handleUploadSubmit = async () => {
    if (!currentJobId) {
      toast.error('Please select a job opening before uploading');
      return;
    }
    if (fileList.length === 0) {
      toast.error('Please add at least one resume file');
      return;
    }

    setProcessing(true);

    // Initial status: Uploading
    const initialStatuses = {};
    fileList.forEach((f, idx) => {
      const key = `${f.name}-${idx}`;
      const uploadingObj = { status: 'uploading', text: 'Uploading document...' };
      initialStatuses[key] = uploadingObj;
      initialStatuses[f.name] = uploadingObj;
    });
    setFileStatuses(initialStatuses);

    // Provide responsive feedback while in flight
    const timer = setTimeout(() => {
      setFileStatuses((prev) => {
        const next = { ...prev };
        Object.keys(next).forEach((key) => {
          if (next[key]?.status === 'uploading') {
            next[key] = { status: 'parsing', text: 'Screening and validating file...' };
          }
        });
        return next;
      });
    }, 600);

    uploadMutation.mutate(fileList, {
      onSuccess: (response) => {
        clearTimeout(timer);
        setProcessing(false);
        const results = Array.isArray(response) ? response : [];
        const nextStatuses = {};

        let acceptedCount = 0;
        let duplicateCount = 0;
        let rejectedCount = 0;
        let errorCount = 0;

        fileList.forEach((file, idx) => {
          const key = `${file.name}-${idx}`;

          // Match each response to its uploaded file (by filename/index)
          const resultItem =
            results.find((r, rIdx) => r.filename === file.name && rIdx === idx) ||
            results.find((r) => r.filename === file.name) ||
            results[idx];

          if (!resultItem) {
            const statusObj = {
              status: 'error',
              text: 'No response received from server',
            };
            nextStatuses[key] = statusObj;
            nextStatuses[file.name] = statusObj;
            errorCount++;
            return;
          }

          const status = (resultItem.status || '').toUpperCase();
          const message = resultItem.message || '';

          let statusObj;
          if (status === 'ACCEPTED') {
            acceptedCount++;
            statusObj = {
              status: 'queued',
              text: message || 'Queued for background screening & scoring',
              applicationId: resultItem.application_id,
              candidateId: resultItem.candidate_id,
              candidateName: resultItem.candidate_name,
            };
          } else if (status === 'DUPLICATE') {
            duplicateCount++;
            statusObj = {
              status: 'duplicate',
              text: message || 'Duplicate resume detected for this job (skipped)',
              applicationId: resultItem.application_id,
              candidateId: resultItem.candidate_id,
              candidateName: resultItem.candidate_name,
            };
          } else if (status === 'REJECTED') {
            rejectedCount++;
            statusObj = {
              status: 'rejected',
              text: message || 'File rejected by server',
            };
          } else if (status === 'ERROR') {
            errorCount++;
            statusObj = {
              status: 'error',
              text: message || 'Upload failed',
            };
          } else {
            statusObj = {
              status: status.toLowerCase(),
              text: message || status,
            };
          }

          nextStatuses[key] = statusObj;
          nextStatuses[file.name] = statusObj;
        });

        setFileStatuses(nextStatuses);

        // Feedback toast supporting partial upload success
        if (acceptedCount === fileList.length) {
          toast.success(
            acceptedCount === 1
              ? 'Resume uploaded successfully and queued for screening'
              : `All ${acceptedCount} resumes uploaded and queued for screening`
          );
        } else if (acceptedCount > 0) {
          const parts = [`${acceptedCount} queued`];
          if (duplicateCount > 0) parts.push(`${duplicateCount} duplicate(s)`);
          if (rejectedCount > 0) parts.push(`${rejectedCount} rejected`);
          if (errorCount > 0) parts.push(`${errorCount} failed`);
          toast.info(`Partial upload complete: ${parts.join(', ')}`);
        } else {
          const reasons = [];
          if (duplicateCount > 0) reasons.push(`${duplicateCount} duplicate(s)`);
          if (rejectedCount > 0) reasons.push(`${rejectedCount} rejected`);
          if (errorCount > 0) reasons.push(`${errorCount} failed`);
          toast.error(`Upload unsuccessful: ${reasons.join(', ') || 'No resumes processed'}`);
        }
      },
      onError: (err) => {
        clearTimeout(timer);
        setProcessing(false);
        toast.error(`Upload error: ${err.message || 'Failed to upload resumes'}`);
        setFileStatuses((prev) => {
          const next = { ...prev };
          Object.keys(next).forEach((key) => {
            next[key] = { status: 'error', text: `Failed: ${err.message || 'Server error'}` };
          });
          return next;
        });
      },
    });
  };

  return (
    <div className="space-y-8 animate-fadeIn max-w-4xl">
      {/* Header */}
      <div className="pb-6 border-b border-line">
        <h1 className="text-[28px] sm:text-[32px] font-semibold text-ink tracking-tight">
          Upload Resumes
        </h1>
        <p className="text-[14px] text-ink-muted mt-1">
          Ingest applicant documents in PDF or DOCX format for background parsing, screening, and
          duplicate prevention.
        </p>
      </div>

      {/* 1. Job Selector */}
      <div className="space-y-2">
        <label className="text-[13px] font-medium text-ink">Select Target Job Opening</label>
        {jobsLoading ? (
          <div className="h-9 w-64 bg-surface-alt animate-pulse rounded-[10px]" />
        ) : jobs.length === 0 ? (
          <div className="flex items-center gap-3">
            <span className="text-[13px] text-ink-muted">No active openings.</span>
            <Button size="sm" onClick={() => navigate('/studio/jobs')}>
              Create opening first
            </Button>
          </div>
        ) : (
          <div className="max-w-md">
            <Select value={currentJobId} onChange={(e) => setSelectedJobId(e.target.value)}>
              {jobs.map((job) => (
                <option key={job.job_id} value={job.job_id}>
                  {job.title} ({job.required_skills?.join(', ') || 'No required skills'})
                </option>
              ))}
            </Select>
          </div>
        )}
      </div>

      {/* 2. Drag and Drop Zone */}
      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className="rounded-[14px] border-2 border-dashed border-line bg-surface hover:bg-surface-alt/40 p-10 text-center transition-colors cursor-pointer space-y-3"
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".pdf,.docx"
          className="hidden"
          onChange={(e) => {
            if (e.target.files) handleFilesAdded(e.target.files);
          }}
        />
        <div className="w-12 h-12 rounded-[10px] bg-surface-alt border border-line flex items-center justify-center mx-auto text-ink-muted">
          <UploadCloud className="w-6 h-6" />
        </div>
        <div className="space-y-1">
          <div className="text-[15px] font-medium text-ink">
            Drag and drop candidate files here, or click to browse
          </div>
          <p className="text-[13px] text-ink-muted">Supports PDF and DOCX files up to 15MB each.</p>
        </div>
      </div>

      {/* 3. Staged Files List & Statuses */}
      {fileList.length > 0 && (
        <Panel className="p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-line">
            <div className="text-[15px] font-semibold text-ink">
              Staged Files ({fileList.length})
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                disabled={processing}
                onClick={() => {
                  setFileList([]);
                  setFileStatuses({});
                }}
              >
                Clear all
              </Button>
              <Button
                variant="primary"
                size="sm"
                loading={processing}
                onClick={handleUploadSubmit}
              >
                Upload & Process
              </Button>
            </div>
          </div>

          <div className="divide-y divide-line">
            {fileList.map((file, idx) => {
              const fileKey = `${file.name}-${idx}`;
              const statusInfo = fileStatuses[fileKey] || fileStatuses[file.name];
              return (
                <div
                  key={fileKey}
                  className="py-3 flex items-center justify-between gap-4 first:pt-0 last:pb-0"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <FileText className="w-4 h-4 text-ink-muted shrink-0" />
                    <div className="min-w-0">
                      <div className="text-[14px] font-medium text-ink truncate">{file.name}</div>
                      <div className="text-[13px] text-ink-subtle">
                        {(file.size / 1024).toFixed(0)} KB
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <div className="text-[13px] text-right">
                      {!statusInfo ? (
                        <span className="text-ink-muted">Ready to upload</span>
                      ) : statusInfo.status === 'queued' || statusInfo.status === 'accepted' ? (
                        <span className="inline-flex items-center gap-1.5 text-primary font-medium">
                          <Clock className="w-4 h-4 text-primary shrink-0" />
                          <span>{statusInfo.text}</span>
                        </span>
                      ) : statusInfo.status === 'duplicate' ? (
                        <span className="inline-flex items-center gap-1.5 text-ink-muted">
                          <AlertCircle className="w-4 h-4 text-ink-subtle shrink-0" />
                          <span>{statusInfo.text}</span>
                        </span>
                      ) : statusInfo.status === 'rejected' ? (
                        <span className="inline-flex items-center gap-1.5 text-danger font-medium">
                          <AlertCircle className="w-4 h-4 shrink-0" />
                          <span>{statusInfo.text}</span>
                        </span>
                      ) : statusInfo.status === 'error' ? (
                        <span className="inline-flex items-center gap-1.5 text-danger font-medium">
                          <AlertCircle className="w-4 h-4 shrink-0" />
                          <span>{statusInfo.text}</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-2 text-ink-muted">
                          <span className="w-3.5 h-3.5 border-2 border-primary border-t-transparent rounded-full animate-spin shrink-0" />
                          <span>{statusInfo.text}</span>
                        </span>
                      )}
                    </div>

                    {!processing && !statusInfo && (
                      <button
                        type="button"
                        onClick={() => handleRemoveFile(idx)}
                        aria-label={`Remove ${file.name}`}
                        className="p-1 text-ink-muted hover:text-ink transition-colors rounded"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Action to view results */}
          {Object.values(fileStatuses).some(
            (s) => s.status === 'queued' || s.status === 'accepted'
          ) && (
            <div className="pt-4 border-t border-line flex justify-end">
              <Button
                variant="primary"
                rightIcon={<ArrowRight className="w-4 h-4" />}
                onClick={() => navigate(`/studio/leaderboard/${currentJobId}`)}
              >
                Open updated leaderboard
              </Button>
            </div>
          )}
        </Panel>
      )}
    </div>
  );
}
