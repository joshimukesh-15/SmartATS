import { useNavigate } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { Panel } from '../../components/ui';

export default function PipelineFunnel({ pipelineStages, defaultJobId }) {
  const navigate = useNavigate();

  return (
    <Panel className="p-5 sm:p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-[17px] font-semibold text-ink leading-[1.35]">Applicant Review Pipeline</h2>
          <p className="text-[13px] leading-[1.5] text-ink-muted mt-0.5">
            Candidate status distribution across workflow stages.
          </p>
        </div>
        {defaultJobId && (
          <button
            type="button"
            onClick={() => navigate(`/studio/candidates?job=${defaultJobId}`)}
            className="text-[13px] text-ink-muted hover:text-ink flex items-center gap-1 cursor-pointer font-medium"
          >
            <span>View Candidates</span>
            <ChevronRight className="w-4 h-4" strokeWidth={1.75} />
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 pt-1">
        {pipelineStages.map((item, idx) => (
          <div
            key={item.stage}
            onClick={() =>
              navigate(
                defaultJobId
                  ? `/studio/candidates?job=${defaultJobId}&stage=${item.stage}`
                  : `/studio/candidates?stage=${item.stage}`
              )
            }
            className={`p-4 rounded-[10px] bg-surface-alt/40 border border-line border-l-4 ${item.borderTone} hover:bg-surface-alt transition-colors cursor-pointer space-y-1.5`}
          >
            <div className="flex items-center justify-between text-[13px] font-medium">
              <span className="font-semibold text-ink">{item.stage}</span>
              <span className="text-[13px] text-ink-muted opacity-60 tabular-nums">0{idx + 1}</span>
            </div>
            <div className="text-[26px] font-semibold text-ink tabular-nums leading-none">
              {item.count}
            </div>
            <div className="text-[13px] leading-[1.5] text-ink-muted truncate">{item.desc}</div>
          </div>
        ))}
      </div>
    </Panel>
  );
}
