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
} from 'lucide-react';
import { useJobs, useDeleteJob, useCreateJob } from '../../hooks';
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
  toast,
} from '../../components/ui';
import CreateJobDialog from './CreateJobDialog';
import JobQualityDialog from './JobQualityDialog';

export default function JobsPage() {
  const navigate = useNavigate();
  const { data: jobs = [], isLoading, isError, refetch } = useJobs();
  const deleteJobMutation = useDeleteJob();
  const createJobMutation = useCreateJob();

  const [search, setSearch] = useState('');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [inspectedJob, setInspectedJob] = useState(null);

  useEffect(() => {
    const handleOpenCreate = () => setIsCreateOpen(true);
    window.addEventListener('smartats:open-create-job', handleOpenCreate);
    return () => window.removeEventListener('smartats:open-create-job', handleOpenCreate);
  }, []);

  const handleDelete = (job) => {
    deleteJobMutation.mutate(job.job_id, {
      onSuccess: () => {
        toast.success(`Deleted opening "${job.title}"`, {
          action: {
            label: 'Undo',
            onClick: () => {
              createJobMutation.mutate({
                title: job.title,
                description: job.description,
                required_skills: job.required_skills,
                preferred_skills: job.preferred_skills,
              });
            },
          },
        });
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
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-8 border-b border-line">
        <div>
          <h1 className="text-[30px] font-semibold text-ink tracking-[-0.03em] leading-[1.15]">
            Job Openings
          </h1>
          <p className="text-[15px] leading-[1.6] text-ink-muted mt-2">
            Specify mandatory competencies, inspect job description quality, and track candidate pipeline volume.
          </p>
        </div>
        <Button
          variant="primary"
          size="sm"
          leftIcon={<Plus className="w-4 h-4" strokeWidth={1.75} />}
          onClick={() => setIsCreateOpen(true)}
        >
          New opening
        </Button>
      </div>

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
          action={<Button onClick={() => refetch()}>Try again</Button>}
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
        <div className="rounded-[14px] border border-line bg-surface overflow-hidden shadow-xs">
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
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => setInspectedJob(job)}
                            className="inline-flex items-center gap-1 px-2 py-1 rounded-[6px] text-[13px] font-medium border border-line bg-surface hover:bg-surface-alt transition-colors cursor-pointer"
                            title="Inspect job description quality"
                          >
                            <ShieldCheck className="w-3.5 h-3.5 text-champagne" strokeWidth={1.75} />
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
                            onClick={() => handleDelete(job)}
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
      )}

      {/* Modals */}
      <CreateJobDialog isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} />
      <JobQualityDialog job={inspectedJob} onClose={() => setInspectedJob(null)} />
    </div>
  );
}
