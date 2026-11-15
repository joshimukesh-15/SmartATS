import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus,
  Trash2,
  ArrowUpRight,
  Search,
  Briefcase,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import {
  useJobs,
  useDeleteJob,
  useCreateJob,
  useJobQuality,
  useCheckJobQuality,
} from '../../hooks';
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
  const checkQualityMutation = useCheckJobQuality();

  const [search, setSearch] = useState('');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [draftQuality, setDraftQuality] = useState(null);

  // Quality check modal for existing job
  const [inspectedJob, setInspectedJob] = useState(null);
  const { data: inspectedQuality, isLoading: inspectedQualityLoading } = useJobQuality(
    inspectedJob?.job_id
  );

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

  const handleRunDraftQualityCheck = async () => {
    if (!formData.title.trim() && !formData.description.trim()) {
      toast.error('Enter a title or description to analyze quality');
      return;
    }

    const reqSkills = formData.required_skills
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    const prefSkills = formData.preferred_skills
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    try {
      const res = await checkQualityMutation.mutateAsync({
        title: formData.title.trim() || 'Role Title',
        description: formData.description.trim() || '',
        required_skills: reqSkills,
        preferred_skills: prefSkills,
      });
      setDraftQuality(res);
      toast.success(`Quality score: ${res.overall_score}/100 (${res.grade})`);
    } catch (err) {
      toast.error(err.message || 'Quality check failed');
    }
  };

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
          setDraftQuality(null);
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
            Specify mandatory competencies, inspect job description quality, and track candidate pipeline volume.
          </p>
        </div>
        <Button
          variant="primary"
          size="sm"
          leftIcon={<Plus className="w-3.5 h-3.5" />}
          onClick={() => {
            setDraftQuality(null);
            setIsCreateOpen(true);
          }}
        >
          New opening
        </Button>
      </div>

      {/* Filter / Search Bar */}
      <div className="flex items-center gap-4 max-w-sm">
        <Input
          placeholder="Filter openings or skills..."
          leftIcon={<Search className="w-4 h-4 text-ink-muted" />}
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
          icon={<Briefcase className="w-5 h-5 text-ink-muted" />}
          title={search ? 'No matching job openings' : 'No job openings created yet'}
          description={
            search
              ? 'Try modifying your search criteria.'
              : 'Create your first job opening to start matching candidate resumes.'
          }
          action={
            !search && (
              <Button
                onClick={() => {
                  setDraftQuality(null);
                  setIsCreateOpen(true);
                }}
              >
                Create job opening
              </Button>
            )
          }
        />
      ) : (
        <div className="rounded-[14px] border border-line bg-surface overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[30%]">Position Title</TableHead>
                <TableHead className="w-[35%]">Required Skills</TableHead>
                <TableHead className="w-[12%] text-center">JD Health</TableHead>
                <TableHead className="w-[8%] text-center">Applicants</TableHead>
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
                  {/* JD Health Check Pill */}
                  <TableCell className="text-center">
                    <button
                      type="button"
                      onClick={() => setInspectedJob(job)}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[6px] text-[13px] font-medium border border-line bg-surface hover:bg-surface-alt transition-colors cursor-pointer"
                      title="Inspect job description quality"
                    >
                      <ShieldCheck className="w-3.5 h-3.5 text-champagne" />
                      <span>Check JD</span>
                    </button>
                  </TableCell>
                  <TableCell className="text-center tabular-nums font-semibold text-ink text-[13px]">
                    {job.application_count ?? job.applications_count ?? 0}
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

      {/* Create Job Opening Modal Dialog with Live Quality Check */}
      <Dialog
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Create job opening"
        description="Define required competencies and test job description quality for salary transparency and restrictive gates."
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
            <div className="flex items-center justify-between">
              <label className="text-[13px] font-medium text-ink">Job Description</label>
              <button
                type="button"
                onClick={handleRunDraftQualityCheck}
                disabled={checkQualityMutation.isPending}
                className="text-[13px] text-primary font-medium hover:underline inline-flex items-center gap-1 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-champagne" />
                <span>Run Quality Check</span>
              </button>
            </div>
            <textarea
              rows={4}
              placeholder="Include responsibilities, workplace policy (Remote/Hybrid), and salary transparency (e.g. $130,000 - $160,000)..."
              className="w-full rounded-[10px] border border-line bg-surface p-3 text-[14px] text-ink placeholder:text-ink-subtle focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2 resize-none"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          {/* Live Draft Quality Feedback */}
          {draftQuality && (
            <div className="p-3.5 rounded-[10px] bg-surface-alt/60 border border-line space-y-2 text-[13px] animate-fadeIn">
              <div className="flex items-center justify-between font-medium">
                <span className="text-ink">Description Quality:</span>
                <span
                  className={`px-2 py-0.5 rounded-[6px] font-semibold ${
                    draftQuality.overall_score >= 80
                      ? 'bg-champagne-soft text-ink border border-champagne/40'
                      : 'bg-surface text-ink border border-line'
                  }`}
                >
                  {draftQuality.overall_score}/100 · {draftQuality.grade}
                </span>
              </div>
              <p className="text-ink-muted leading-relaxed">{draftQuality.summary}</p>

              {draftQuality.issues?.length > 0 && (
                <div className="space-y-1.5 pt-1 border-t border-line">
                  {draftQuality.issues.slice(0, 3).map((issue, idx) => (
                    <div key={idx} className="flex items-start gap-1.5 text-ink">
                      <AlertTriangle className="w-3.5 h-3.5 text-champagne mt-0.5 shrink-0" />
                      <div>
                        <span className="font-semibold">{issue.title}:</span>{' '}
                        <span className="text-ink-muted">{issue.suggestion}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

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
            <p className="text-[13px] text-ink-muted">
              Used for multi-pillar competency matching. Keep to 4–6 core skills for optimal candidate reach.
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

      {/* Inspect Existing Job Quality Dialog */}
      {inspectedJob && (
        <Dialog
          isOpen={Boolean(inspectedJob)}
          onClose={() => setInspectedJob(null)}
          title={`Job Quality Analysis: ${inspectedJob.title}`}
          description="Detailed breakdown of salary transparency, workplace clarity, and restrictive wording barriers."
        >
          {inspectedQualityLoading ? (
            <div className="space-y-3 py-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-32 w-full" />
            </div>
          ) : inspectedQuality ? (
            <div className="space-y-5 py-1 text-[13px]">
              {/* Score Header */}
              <div className="p-4 rounded-[12px] bg-surface-alt/60 border border-line flex items-center justify-between">
                <div>
                  <div className="text-[13px] text-ink-muted font-medium">JD Quality Score</div>
                  <div className="text-[28px] font-semibold text-ink tabular-nums leading-tight">
                    {inspectedQuality.overall_score}/100
                  </div>
                  <div className="text-[13px] text-ink-muted mt-0.5">{inspectedQuality.summary}</div>
                </div>
                <div
                  className={`px-3 py-1.5 rounded-[8px] font-semibold text-[13px] border ${
                    inspectedQuality.overall_score >= 80
                      ? 'bg-champagne-soft text-ink border-champagne/40'
                      : 'bg-surface text-ink border-line'
                  }`}
                >
                  {inspectedQuality.grade}
                </div>
              </div>

              {/* Compliance & Transparency Checklist */}
              <div className="space-y-2">
                <div className="font-semibold text-ink">Transparency Checklist</div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <div className="p-3 rounded-[8px] bg-surface border border-line flex items-center justify-between">
                    <span>Salary Disclosed</span>
                    {inspectedQuality.has_salary ? (
                      <CheckCircle2 className="w-4 h-4 text-champagne" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 text-ink-subtle" />
                    )}
                  </div>
                  <div className="p-3 rounded-[8px] bg-surface border border-line flex items-center justify-between">
                    <span>Location Policy</span>
                    {inspectedQuality.has_location ? (
                      <CheckCircle2 className="w-4 h-4 text-champagne" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 text-ink-subtle" />
                    )}
                  </div>
                  <div className="p-3 rounded-[8px] bg-surface border border-line flex items-center justify-between">
                    <span>Employment Type</span>
                    {inspectedQuality.has_employment_type ? (
                      <CheckCircle2 className="w-4 h-4 text-champagne" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 text-ink-subtle" />
                    )}
                  </div>
                </div>
              </div>

              {/* Issues & Recommendations */}
              <div className="space-y-2.5">
                <div className="font-semibold text-ink">
                  Identified Areas for Improvement ({inspectedQuality.issues?.length || 0})
                </div>
                {inspectedQuality.issues?.length === 0 ? (
                  <div className="p-4 rounded-[8px] bg-surface border border-line text-center text-ink-muted">
                    No critical issues or restrictive barriers detected. Outstanding job posting!
                  </div>
                ) : (
                  <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
                    {inspectedQuality.issues.map((issue, idx) => (
                      <div
                        key={idx}
                        className="p-3.5 rounded-[10px] bg-surface border border-line space-y-1 text-[13px]"
                      >
                        <div className="flex items-center justify-between font-semibold text-ink">
                          <span className="flex items-center gap-1.5">
                            <AlertTriangle className="w-3.5 h-3.5 text-champagne" />
                            {issue.title}
                          </span>
                          <span className="text-[13px] font-normal uppercase text-ink-muted text-opacity-80">
                            {issue.category.replace('_', ' ')}
                          </span>
                        </div>
                        <p className="text-ink-muted leading-relaxed">{issue.message}</p>
                        <div className="pt-1 text-ink font-medium">
                          <span className="text-primary font-semibold">Recommendation:</span>{' '}
                          {issue.suggestion}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="pt-2 flex justify-end">
                <Button variant="secondary" size="sm" onClick={() => setInspectedJob(null)}>
                  Close
                </Button>
              </div>
            </div>
          ) : null}
        </Dialog>
      )}
    </div>
  );
}
