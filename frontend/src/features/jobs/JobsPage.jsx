import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Trash2, ArrowUpRight, Search, Briefcase } from 'lucide-react';
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
  Dialog,
  EmptyState,
  Skeleton,
  toast,
} from '../../components/ui';

export default function JobsPage() {
  const navigate = useNavigate();
  const { data: jobs = [], isLoading, isError, refetch } = useJobs();
  const deleteJobMutation = useDeleteJob();
  const createJobMutation = useCreateJob();

  const [search, setSearch] = useState('');
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    required_skills: '',
    preferred_skills: '',
  });

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

  const handleCreateSubmit = (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      toast.error('Please enter a role title');
      return;
    }

    const requiredSkillsList = formData.required_skills
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    const preferredSkillsList = formData.preferred_skills
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    createJobMutation.mutate(
      {
        title: formData.title.trim(),
        description: formData.description.trim() || 'Role requirements description.',
        required_skills: requiredSkillsList,
        preferred_skills: preferredSkillsList,
      },
      {
        onSuccess: () => {
          toast.success(`Created job opening "${formData.title}"`);
          setIsCreateOpen(false);
          setFormData({
            title: '',
            description: '',
            required_skills: '',
            preferred_skills: '',
          });
        },
        onError: (err) => {
          toast.error(`Failed to create job: ${err.message}`);
        },
      }
    );
  };

  const filteredJobs = jobs.filter(
    (job) =>
      job.title.toLowerCase().includes(search.toLowerCase()) ||
      job.required_skills?.some((s) => s.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 border-b border-line">
        <div>
          <h1 className="text-[28px] sm:text-[32px] font-semibold text-ink tracking-tight">
            Job Openings
          </h1>
          <p className="text-[14px] text-ink-muted mt-1">
            Specify mandatory competencies, track application volume, and open leaderboards.
          </p>
        </div>
        <Button
          variant="primary"
          size="sm"
          leftIcon={<Plus className="w-3.5 h-3.5" />}
          onClick={() => setIsCreateOpen(true)}
        >
          New opening
        </Button>
      </div>

      {/* Filter / Search Bar */}
      <div className="flex items-center gap-4 max-w-sm">
        <Input
          placeholder="Filter openings or skills..."
          leftIcon={<Search className="w-4 h-4" />}
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
          icon={<Briefcase className="w-5 h-5" />}
          title={search ? 'No matching job openings' : 'No job openings created yet'}
          description={
            search
              ? 'Try modifying your search criteria.'
              : 'Create your first job opening to start matching candidate resumes.'
          }
          action={
            !search && <Button onClick={() => setIsCreateOpen(true)}>Create job opening</Button>
          }
        />
      ) : (
        <div className="rounded-[14px] border border-line bg-surface overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[30%]">Position Title</TableHead>
                <TableHead className="w-[45%]">Required Skills</TableHead>
                <TableHead className="w-[10%] text-center">Applicants</TableHead>
                <TableHead className="w-[15%] text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredJobs.map((job) => (
                <TableRow key={job.job_id}>
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
                  <TableCell className="text-center tabular-nums font-semibold text-ink">
                    {job.application_count ?? '—'}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="secondary"
                        size="sm"
                        rightIcon={<ArrowUpRight className="w-3.5 h-3.5" />}
                        onClick={() => navigate(`/studio/leaderboard/${job.job_id}`)}
                      >
                        Open leaderboard
                      </Button>
                      <IconButton
                        variant="ghost"
                        size="sm"
                        aria-label="Delete opening"
                        onClick={() => handleDelete(job)}
                      >
                        <Trash2 className="w-3.5 h-3.5 text-ink-muted hover:text-danger" />
                      </IconButton>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Create Job Opening Modal Dialog */}
      <Dialog
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Create job opening"
        description="Define required and optional competencies for dual-track resume matching."
      >
        <form onSubmit={handleCreateSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-[13px] font-medium text-ink">
              Position Title <span className="text-danger">*</span>
            </label>
            <Input
              required
              placeholder="e.g. Senior Backend Engineer"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[13px] font-medium text-ink">Job Description</label>
            <textarea
              rows={3}
              placeholder="Summary of responsibilities and technical expectations..."
              className="w-full rounded-[10px] border border-line bg-surface p-3 text-[14px] text-ink placeholder:text-ink-subtle focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2 resize-none"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[13px] font-medium text-ink">
              Required Skills (comma-separated) <span className="text-danger">*</span>
            </label>
            <Input
              required
              placeholder="e.g. Python, FastAPI, PostgreSQL, Docker"
              value={formData.required_skills}
              onChange={(e) => setFormData({ ...formData, required_skills: e.target.value })}
            />
            <p className="text-[12px] text-ink-muted">
              Used for deterministic 60% keyword coverage verification.
            </p>
          </div>

          <div className="space-y-1.5">
            <label className="text-[13px] font-medium text-ink">
              Preferred Skills (comma-separated)
            </label>
            <Input
              placeholder="e.g. Kubernetes, AWS, Redis"
              value={formData.preferred_skills}
              onChange={(e) => setFormData({ ...formData, preferred_skills: e.target.value })}
            />
          </div>

          <div className="pt-4 flex items-center justify-end gap-3 border-t border-line">
            <Button variant="secondary" onClick={() => setIsCreateOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" loading={createJobMutation.isPending}>
              Create opening
            </Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
}
