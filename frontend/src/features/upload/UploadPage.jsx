import { useState, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useJobs, useUploadResumes } from '../../hooks';
import { Select, Button, Panel, toast } from '../../components/ui';
import UploadFileRow from './UploadFileRow';
import DropZone from './DropZone';
import UploadStepHeader from './UploadStepHeader';

export default function UploadPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { data: jobs = [], isLoading: jobsLoading } = useJobs();
  const [selectedJobId, setSelectedJobId] = useState('');
  const [fileList, setFileList] = useState([]);
  const [processing, setProcessing] = useState(false);
  const [fileStatuses, setFileStatuses] = useState({});

  const requestedJobId = searchParams.get('jobId');

  // Respect job-specific links. A stale id falls back to the first opening.
  const currentJobId = jobs.some((job) => String(job.job_id) === selectedJobId)
    ? selectedJobId
    : jobs.some((job) => String(job.job_id) === requestedJobId)
      ? requestedJobId
      : jobs.length > 0
        ? String(jobs[0].job_id)
        : '';
  const uploadMutation = useUploadResumes(currentJobId);

  // Derive active step in 3-step workflow
  const activeStep = useMemo(() => {
    const hasResults = Object.values(fileStatuses).some(
      (s) => s.status && s.status !== 'uploading' && s.status !== 'parsing'
    );
    if (hasResults) return 3;
    if (fileList.length > 0 || processing) return 2;
    return 1;
  }, [fileStatuses, fileList.length, processing]);

  const handleFilesAdded = (incomingFiles) => {
    const files = Array.from(incomingFiles);
    if (files.length === 0) return;
    setFileList((prev) => [...prev, ...files]);
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

    // Initial status: Uploading with in-flight progress bars
    const initialStatuses = {};
    fileList.forEach((f, idx) => {
      const key = `${f.name}-${idx}`;
      const uploadingObj = { status: 'uploading', text: 'Uploading file...' };
      initialStatuses[key] = uploadingObj;
      initialStatuses[f.name] = uploadingObj;
    });
    setFileStatuses(initialStatuses);

    // Dynamic progress stage feedback
    const timer = setTimeout(() => {
      setFileStatuses((prev) => {
        const next = { ...prev };
        Object.keys(next).forEach((key) => {
          if (next[key]?.status === 'uploading') {
            next[key] = { status: 'parsing', text: 'Validating and screening resume...' };
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
        let _rejectedCount = 0;
        let _errorCount = 0;

        fileList.forEach((file, idx) => {
          const key = `${file.name}-${idx}`;
          const resultItem =
            results.find((r, rIdx) => r.filename === file.name && rIdx === idx) ||
            results.find((r) => r.filename === file.name) ||
            results[idx];

          if (!resultItem) {
            const statusObj = { status: 'error', text: 'No response received from server' };
            nextStatuses[key] = statusObj;
            nextStatuses[file.name] = statusObj;
            _errorCount++;
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
              candidateName: resultItem.candidate_name,
            };
          } else if (status === 'DUPLICATE') {
            duplicateCount++;
            statusObj = {
              status: 'duplicate',
              text: message || 'Duplicate resume detected for this job (skipped)',
              candidateName: resultItem.candidate_name,
            };
          } else if (status === 'REJECTED') {
            _rejectedCount++;
            statusObj = { status: 'rejected', text: message || 'File rejected by server' };
          } else {
            _errorCount++;
            statusObj = { status: 'error', text: message || 'Upload failed' };
          }

          nextStatuses[key] = statusObj;
          nextStatuses[file.name] = statusObj;
        });

        setFileStatuses(nextStatuses);

        if (acceptedCount === fileList.length) {
          toast.success(`All ${acceptedCount} resumes uploaded and queued for screening`);
        } else if (acceptedCount > 0) {
          toast.info(`Processed batch: ${acceptedCount} queued, ${duplicateCount} duplicate(s)`);
        } else {
          toast.error('Upload unsuccessful: check file status messages below');
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
      <div className="pb-8 border-b border-line">
        <h1 className="text-[30px] font-semibold text-ink tracking-[-0.03em] leading-[1.15]">
          Upload Resumes
        </h1>
        <p className="text-[15px] leading-[1.6] text-ink-muted mt-2">
          Ingest applicant documents in PDF or DOCX format for background parsing, screening, and
          duplicate prevention.
        </p>
      </div>

      {/* 3-Step Header with Active Step Indicator */}
      <UploadStepHeader activeStep={activeStep} />

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
      <DropZone onFilesAdded={handleFilesAdded} />

      {/* 3. Staged Files List with Progress Bars & Status Badges */}
      {fileList.length > 0 && (
        <Panel className="p-5 sm:p-6 space-y-4 shadow-xs">
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
                <UploadFileRow
                  key={fileKey}
                  file={file}
                  index={idx}
                  statusInfo={statusInfo}
                  processing={processing}
                  onRemove={handleRemoveFile}
                />
              );
            })}
          </div>

          {/* Action to view results once queued */}
          {activeStep === 3 && (
            <div className="pt-4 border-t border-line flex justify-end">
              <Button
                variant="primary"
                rightIcon={<ArrowRight className="w-4 h-4" strokeWidth={1.75} />}
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
