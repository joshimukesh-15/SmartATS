import { useState } from 'react';
import { Sparkles, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { Dialog, Input, Button, toast } from '../../components/ui';
import { useCreateJob, useCheckJobQuality } from '../../hooks';

export default function CreateJobDialog({ isOpen, onClose }) {
  const createJobMutation = useCreateJob();
  const checkQualityMutation = useCheckJobQuality();

  const [draftQuality, setDraftQuality] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    required_skills: '',
    preferred_skills: '',
  });

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

  const handleCreateSubmit = (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      toast.error('Position title is required');
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

    createJobMutation.mutate(
      {
        title: formData.title.trim(),
        description: formData.description.trim(),
        required_skills: reqSkills,
        preferred_skills: prefSkills,
      },
      {
        onSuccess: (newJob) => {
          toast.success(`Job opening "${newJob.title}" created successfully`);
          onClose();
          setFormData({
            title: '',
            description: '',
            required_skills: '',
            preferred_skills: '',
          });
          setDraftQuality(null);
        },
        onError: (err) => {
          toast.error(`Failed to create job: ${err.message}`);
        },
      }
    );
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title="Create job opening"
      description="Define required competencies and test job description quality for salary transparency and restrictive gates."
    >
      <form onSubmit={handleCreateSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <label className="text-[13px] font-medium text-ink">Position Title *</label>
          <Input
            placeholder="e.g. Senior Backend Engineer"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            required
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-[13px] font-medium text-ink">Job Description</label>
          <textarea
            rows={4}
            className="w-full rounded-[10px] border border-line bg-surface p-3 text-[14px] text-ink placeholder:text-ink-subtle focus-visible:outline-2 focus-visible:outline-primary"
            placeholder="Outline core responsibilities, qualifications, and stack requirements..."
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-[13px] font-medium text-ink">
            Required Skills (comma separated)
          </label>
          <Input
            placeholder="Python, FastAPI, PostgreSQL, Docker"
            value={formData.required_skills}
            onChange={(e) => setFormData({ ...formData, required_skills: e.target.value })}
          />
          <p className="text-[13px] text-ink-subtle">
            These skills carry 60% of the candidate composite match score.
          </p>
        </div>

        <div className="space-y-1.5">
          <label className="text-[13px] font-medium text-ink">
            Preferred Skills (comma separated)
          </label>
          <Input
            placeholder="Redis, Kubernetes, AWS, GraphQL"
            value={formData.preferred_skills}
            onChange={(e) => setFormData({ ...formData, preferred_skills: e.target.value })}
          />
        </div>

        {/* Live Draft JD Quality Check Card */}
        <div className="pt-2">
          {draftQuality ? (
            <div className="p-3.5 rounded-[10px] bg-surface-alt/60 border border-line space-y-2">
              <div className="flex items-center justify-between text-[13px]">
                <div className="flex items-center gap-1.5 font-semibold text-ink">
                  <CheckCircle2 className="w-4 h-4 text-primary" strokeWidth={1.75} />
                  <span>JD Quality Grade: {draftQuality.grade}</span>
                </div>
                <span className="font-semibold text-ink tabular-nums">
                  {draftQuality.overall_score}/100
                </span>
              </div>
              {draftQuality.suggestions?.length > 0 && (
                <div className="text-[13px] text-ink-muted space-y-1">
                  {draftQuality.suggestions.slice(0, 2).map((s, idx) => (
                    <div key={idx} className="flex items-start gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" strokeWidth={1.75} />
                      <span>{s}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <Button
              type="button"
              variant="outline"
              size="sm"
              leftIcon={<Sparkles className="w-4 h-4 text-primary" strokeWidth={1.75} />}
              loading={checkQualityMutation.isPending}
              onClick={handleRunDraftQualityCheck}
            >
              Analyze draft JD quality
            </Button>
          )}
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-line">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" loading={createJobMutation.isPending}>
            Create opening
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
