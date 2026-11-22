import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus,
  Trash2,
  ArrowUpRight,
  Search,
  Briefcase,
  ShieldCheck,
  UploadCloud,
  AlertTriangle,
} from 'lucide-react';
import { useJobs, useDeleteJob } from '../../hooks';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  Button,
  IconButton,
  Input,
  Tag,
  EmptyState,
  Skeleton,
  Dialog,
  toast,
  StudioPageHeader,
} from '../../components/ui';
import CreateJobDialog from './CreateJobDialog';
import JobQualityDialog from './JobQualityDialog';

export default function JobsPage() {
  const navigate = useNavigate();
  const { data: jobs = [], isLoading, isError, refetch } = useJobs();
  const deleteJobMutation = useDeleteJob();

  const [search, setSearch] = useState('');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [inspectedJob, setInspectedJob] = useState(null);
  const [jobToDelete, setJobToDelete] = useState(null);

  useEffect(() => {
    const handleOpenCreate = () => setIsCreateOpen(true);
    window.addEventListener('smartats:open-create-job', handleOpenCreate);
    return () => window.removeEventListener('smartats:open-create-job', handleOpenCreate);
  }, []);

  const handleDelete = () => {
    if (!jobToDelete) return;
    deleteJobMutation.mutate(jobToDelete.job_id, {
      onSuccess: () => {
        toast.success(`Deleted opening "${jobToDelete.title}"`);
        setJobToDelete(null);
      },
      onError: (err) => {
        toast.error(`Failed to delete opening: ${err.message}`);
      },
    });
  };

  const filteredJobs = jobs.filter(
    (job) =>
      job.title.toLowerCase().includes(search.toLowerCase()) ||
      job.required_skills?.some((s) => s.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <StudioPageHeader
        breadcrumb="Openings"
        title="Job Openings"
        description="Specify mandatory competencies, inspect job description quality, and track candidate pipeline volume."
        actions={
          <Button
            variant="primary"
            size="sm"
            leftIcon={<Plus className="w-4 h-4" strokeWidth={1.75} />}
            onClick={() => setIsCreateOpen(true)}
          >
            New opening
          </Button>
        }
      />

      {/* Filter / Search Bar */}
      <div className="flex items-center gap-4 max-w-sm">
        <Input
          placeholder="Filter openings or skills..."
          leftIcon={<Search className="w-4 h-4 text-ink-muted" strokeWidth={1.75} />}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-12 w-full rounded-[10px]" />
          <Skeleton className="h-14 w-full rounded-[10px]" />
          <Skeleton className="h-14 w-full rounded-[10px]" />
        </div>
      ) : isError ? (
        <EmptyState
          title="Could not load openings"
          description="A network error occurred while retrieving job openings."
          action={<Button onClick={() => refetch()}>Retry</Button>}
        />
      ) : filteredJobs.length === 0 ? (
        <EmptyState
          icon={<Briefcase className="w-5 h-5 text-ink-muted" strokeWidth={1.75} />}
          title={search ? 'No matching job openings' : 'No job openings created yet'}
          description={
            search
              ? 'Try modifying your search criteria.'
              : 'Create your first job opening to start matching candidate resumes.'
          }
          action={!search && <Button onClick={() => setIsCreateOpen(true)}>Create job opening</Button>}
        />
      ) : (
        <>
          {/* Mobile Stacked Card Rows (< 768px) */}
          <div className="md:hidden space-y-3">
            {filteredJobs.map((job) => {
              const appCount = job.application_count ?? job.applications_count ?? 0;
              const formattedDate = job.created_at
                ? new Date(job.created_at).toLocaleDateString(undefined, {
                    month: 'short',
                    day: 'numeric',
                  })
                : 'Recently';

              return (
                <div
                  key={job.job_id}
                  className="p-4 rounded-[14px] border border-line bg-surface space-y-3 shadow-xs"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <h3 className="font-semibold text-ink text-[15px]">{job.title}</h3>
                      <p className="text-[13px] text-ink-muted line-clamp-2 mt-0.5">
                        {job.description || 'No description provided'}
                      </p>
                    </div>
                    <span className="shrink-0 text-[13px] font-semibold text-ink tabular-nums bg-surface-alt px-2 py-0.5 rounded-[8px] border border-line">
                      {appCount} {appCount === 1 ? 'applicant' : 'applicants'}
                    </span>
                  </div>

                  {job.required_skills?.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {job.required_skills.map((skill, sIdx) => (
                        <Tag key={sIdx} variant="default">
                          {skill}
                        </Tag>
                      ))}
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-2 border-t border-line text-[13px] text-ink-muted">
                    <span>Updated {formattedDate}</span>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => setInspectedJob(job)}
                        className="px-2.5 py-1 min-h-[36px] rounded-[8px] text-[13px] font-medium border border-line bg-surface hover:bg-surface-alt transition-colors"
                        title="Inspect JD"
                      >
                        JD
                      </button>
                      <IconButton
                        variant="ghost"
                        size="sm"
                        aria-label="Upload resumes"
                        onClick={() => navigate(`/studio/upload?jobId=${job.job_id}`)}
                      >
                        <UploadCloud className="w-4 h-4 text-ink-muted" strokeWidth={1.75} />
                      </IconButton>
                      <IconButton
                        variant="ghost"
                        size="sm"
                        aria-label={`Delete ${job.title} opening`}
                        onClick={() => setJobToDelete(job)}
                      >
                        <Trash2 className="w-4 h-4 text-ink-muted hover:text-danger" strokeWidth={1.75} />
                      </IconButton>
                      <Button
                        variant="secondary"
                        size="sm"
                        rightIcon={<ArrowUpRight className="w-4 h-4" strokeWidth={1.75} />}
                        onClick={() => navigate(`/studio/leaderboard/${job.job_id}`)}
                      >
                        Open
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Desktop Table View (>= 768px) */}
          <div className="hidden md:block rounded-[14px] border border-line bg-surface overflow-hidden shadow-xs">
            <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[28%]">Position Title</TableHead>
                <TableHead className="w-[32%]">Required Skills</TableHead>
                <TableHead className="w-[10%] text-center">Applicants</TableHead>
                <TableHead className="w-[12%] text-center">Last Updated</TableHead>
                <TableHead className="w-[18%] text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredJobs.map((job) => {
                const appCount = job.application_count ?? job.applications_count ?? 0;
                const formattedDate = job.created_at
                  ? new Date(job.created_at).toLocaleDateString(undefined, {
                      month: 'short',
                      day: 'numeric',
                    })
                  : 'Recently';

                return (
                  <TableRow key={job.job_id} className="group hover:bg-surface-alt/40 transition-colors">
                    <TableCell>
                      <div className="font-semibold text-ink text-[15px]">{job.title}</div>
                      <div className="text-[13px] text-ink-muted truncate max-w-xs mt-0.5">
                        {job.description || 'No description provided'}
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="flex flex-wrap gap-1.5">
                        {job.required_skills?.map((skill, sIdx) => (
                          <Tag key={sIdx} variant="default">
                            {skill}
                          </Tag>
                        ))}
                      </div>
                    </TableCell>

                    <TableCell className="text-center tabular-nums font-semibold text-ink text-[13px]">
                      {appCount}
                    </TableCell>

                    <TableCell className="text-center tabular-nums text-ink-muted text-[13px]">
                      {formattedDate}
                    </TableCell>

                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        {/* Hover row action shortcuts */}
                        <div className="opacity-100 sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100 transition-opacity flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => setInspectedJob(job)}
                            className="inline-flex items-center gap-1 px-2 py-1 rounded-[8px] text-[13px] font-medium border border-line bg-surface hover:bg-surface-alt transition-colors cursor-pointer"
                            title="Inspect job description quality"
                          >
                            <ShieldCheck className="w-3.5 h-3.5 text-primary" strokeWidth={1.75} />
                            <span>JD</span>
                          </button>
                          <IconButton
                            variant="ghost"
                            size="sm"
                            aria-label="Upload resumes"
                            title="Upload resumes for this job"
                            onClick={() => navigate(`/studio/upload?jobId=${job.job_id}`)}
                          >
                            <UploadCloud className="w-4 h-4 text-ink-muted hover:text-ink" strokeWidth={1.75} />
                          </IconButton>
                          <IconButton
                            variant="ghost"
                            size="sm"
                            aria-label="Delete opening"
                            title="Delete opening"
                            onClick={() => setJobToDelete(job)}
                          >
                            <Trash2 className="w-4 h-4 text-ink-muted hover:text-danger" strokeWidth={1.75} />
                          </IconButton>
                        </div>

                        {/* Primary open leaderboard action */}
                        <Button
                          variant="secondary"
                          size="sm"
                          rightIcon={<ArrowUpRight className="w-4 h-4" strokeWidth={1.75} />}
                          onClick={() => navigate(`/studio/leaderboard/${job.job_id}`)}
                        >
                          Open leaderboard
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
        </>
      )}

      {/* Modals */}
      <CreateJobDialog isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} />
      <JobQualityDialog job={inspectedJob} onClose={() => setInspectedJob(null)} />
      <Dialog
        isOpen={Boolean(jobToDelete)}
        onClose={() => !deleteJobMutation.isPending && setJobToDelete(null)}
        title="Delete job opening?"
        description="This action permanently removes the opening and its applications."
        maxWidth="max-w-lg"
      >
        {jobToDelete && (
          <div className="space-y-5">
            <div className="flex gap-3 rounded-[12px] border border-danger/20 bg-danger/5 p-4">
              <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-danger" aria-hidden="true" />
              <div>
                <p className="text-[14px] font-semibold text-ink">{jobToDelete.title}</p>
                <p className="mt-1 text-[13px] leading-5 text-ink-muted">
                  {jobToDelete.application_count ?? jobToDelete.applications_count ?? 0} candidate
                  application(s) and their saved resumes will be removed. This cannot be undone.
                </p>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="secondary"
                onClick={() => setJobToDelete(null)}
                disabled={deleteJobMutation.isPending}
              >
                Keep opening
              </Button>
              <Button variant="danger" onClick={handleDelete} loading={deleteJobMutation.isPending}>
                Delete opening
              </Button>
            </div>
          </div>
        )}
      </Dialog>
    </div>
  );
}
