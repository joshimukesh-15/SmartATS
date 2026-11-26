import { Eye, Download, GitCompare } from 'lucide-react';
import { Button, StatusBadge } from '../../../components/ui';
import { downloadResumeFile, previewResumeFile } from '../../../api/applications';
import { displayName } from '../constants';

function getInitials(name = '') {
  if (!name) return 'C';
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return 'C';
  return parts.slice(0, 2).map((part) => part[0]).join('').toUpperCase();
}

export default function ProfileHeader({
  candidate,
  name,
  rank,
  currentStage,
  experienceText,
  emailText,
  compared,
  onToggleCompare,
}) {
  const cleanName = displayName(name || candidate?.candidate_name);
  const initials = getInitials(cleanName);

  return (
    <div className="sticky top-0 z-10 flex flex-wrap items-center gap-3.5 border-b border-line bg-canvas/95 py-3 backdrop-blur-md">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-line bg-surface-alt text-[15px] font-semibold text-ink">
        {initials}
      </div>
      <div className="min-w-0">
        <h2 className="truncate text-[22px] font-semibold tracking-[-0.02em] text-ink">{cleanName}</h2>
        <div className="truncate text-[13px] text-ink-muted">
          {experienceText} · {emailText}
        </div>
      </div>
      <span
        className={`rounded-[8px] px-2.5 py-0.5 text-[13px] font-semibold ${
          Number(rank) === 1
            ? 'rank-1-pill'
            : 'border border-line bg-surface-alt text-ink'
        }`}
      >
        Rank #{rank}
      </span>
      <StatusBadge status={currentStage} size="sm" />
      <div className="ml-auto flex items-center gap-2">
        {candidate.application_id && (
          <>
            <Button
              variant="secondary"
              size="sm"
              leftIcon={<Eye className="h-3.5 w-3.5" />}
              onClick={() => previewResumeFile(candidate.application_id)}
            >
              Preview
            </Button>
            <Button
              variant="secondary"
              size="sm"
              leftIcon={<Download className="h-3.5 w-3.5" />}
              onClick={() => downloadResumeFile(candidate.application_id, `${cleanName}_Resume.pdf`)}
            >
              Download
            </Button>
          </>
        )}
        <Button
          variant={compared ? 'primary' : 'secondary'}
          size="sm"
          leftIcon={<GitCompare className="h-3.5 w-3.5" />}
          onClick={onToggleCompare}
        >
          {compared ? 'Remove comparison' : 'Add to compare'}
        </Button>
      </div>
    </div>
  );
}
