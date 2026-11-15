import { RotateCcw } from 'lucide-react';
import { Dialog, Button } from '../../components/ui';

export default function WeightsTunerDialog({
  isOpen,
  onClose,
  weightValues,
  setWeightValues,
  normalizedWeights,
  onResetWeights,
  onSaveJobWeights,
  onApplyWeights,
  isSavingWeights = false,
}) {
  if (!isOpen) return null;

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title="Recruiter Scoring Weights & Tuner"
      description="Adjust multi-pillar scoring weights dynamically. Re-ranks candidates instantly using transparent, auditable math."
    >
      <div className="space-y-6 pt-2">
        {/* Presets */}
        <div className="space-y-2">
          <label className="text-[13px] font-semibold text-ink">Weight Presets</label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() =>
                setWeightValues({
                  weight_skills: 0.40,
                  weight_text: 0.20,
                  weight_experience: 0.25,
                  weight_education: 0.15,
                })
              }
              className="p-2.5 rounded-[8px] border border-line bg-surface hover:bg-surface-alt text-left text-[13px] transition-colors cursor-pointer"
            >
              <div className="font-semibold text-ink">Balanced</div>
              <div className="text-ink-muted text-[13px] tabular-nums mt-0.5">
                40 / 20 / 25 / 15
              </div>
            </button>
            <button
              type="button"
              onClick={() =>
                setWeightValues({
                  weight_skills: 0.60,
                  weight_text: 0.15,
                  weight_experience: 0.15,
                  weight_education: 0.10,
                })
              }
              className="p-2.5 rounded-[8px] border border-line bg-surface hover:bg-surface-alt text-left text-[13px] transition-colors cursor-pointer"
            >
              <div className="font-semibold text-ink">Skills-First</div>
              <div className="text-ink-muted text-[13px] tabular-nums mt-0.5">
                60 / 15 / 15 / 10
              </div>
            </button>
            <button
              type="button"
              onClick={() =>
                setWeightValues({
                  weight_skills: 0.25,
                  weight_text: 0.15,
                  weight_experience: 0.45,
                  weight_education: 0.15,
                })
              }
              className="p-2.5 rounded-[8px] border border-line bg-surface hover:bg-surface-alt text-left text-[13px] transition-colors cursor-pointer"
            >
              <div className="font-semibold text-ink">Seniority-First</div>
              <div className="text-ink-muted text-[13px] tabular-nums mt-0.5">
                25 / 15 / 45 / 15
              </div>
            </button>
          </div>
        </div>

        {/* Sliders */}
        <div className="space-y-4 p-4 rounded-[12px] bg-surface-alt/50 border border-line">
          {/* 1. Skills */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-[13px]">
              <span className="font-medium text-ink flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-primary" />
                Required Skills Coverage
              </span>
              <span className="font-semibold tabular-nums text-ink">
                {(normalizedWeights.weight_skills * 100).toFixed(0)}%
              </span>
            </div>
            <input
              type="range"
              min="0.05"
              max="1"
              step="0.05"
              value={weightValues.weight_skills}
              onChange={(e) =>
                setWeightValues((prev) => ({
                  ...prev,
                  weight_skills: parseFloat(e.target.value),
                }))
              }
              className="w-full accent-primary cursor-pointer"
            />
          </div>

          {/* 2. Text Match */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-[13px]">
              <span className="font-medium text-ink flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-champagne" />
                Text Semantic Similarity
              </span>
              <span className="font-semibold tabular-nums text-ink">
                {(normalizedWeights.weight_text * 100).toFixed(0)}%
              </span>
            </div>
            <input
              type="range"
              min="0.05"
              max="1"
              step="0.05"
              value={weightValues.weight_text}
              onChange={(e) =>
                setWeightValues((prev) => ({
                  ...prev,
                  weight_text: parseFloat(e.target.value),
                }))
              }
              className="w-full accent-primary cursor-pointer"
            />
          </div>

          {/* 3. Experience */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-[13px]">
              <span className="font-medium text-ink flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-ink-muted" />
                Experience & Seniority Fit
              </span>
              <span className="font-semibold tabular-nums text-ink">
                {(normalizedWeights.weight_experience * 100).toFixed(0)}%
              </span>
            </div>
            <input
              type="range"
              min="0.05"
              max="1"
              step="0.05"
              value={weightValues.weight_experience}
              onChange={(e) =>
                setWeightValues((prev) => ({
                  ...prev,
                  weight_experience: parseFloat(e.target.value),
                }))
              }
              className="w-full accent-primary cursor-pointer"
            />
          </div>

          {/* 4. Education */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-[13px]">
              <span className="font-medium text-ink flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-champagne/40 border border-champagne" />
                Education Level
              </span>
              <span className="font-semibold tabular-nums text-ink">
                {(normalizedWeights.weight_education * 100).toFixed(0)}%
              </span>
            </div>
            <input
              type="range"
              min="0.05"
              max="1"
              step="0.05"
              value={weightValues.weight_education}
              onChange={(e) =>
                setWeightValues((prev) => ({
                  ...prev,
                  weight_education: parseFloat(e.target.value),
                }))
              }
              className="w-full accent-primary cursor-pointer"
            />
          </div>
        </div>

        {/* Dialog Footer Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
          <Button
            variant="secondary"
            size="sm"
            leftIcon={<RotateCcw className="w-4 h-4" strokeWidth={1.75} />}
            onClick={onResetWeights}
          >
            Reset defaults
          </Button>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <Button
              variant="secondary"
              size="sm"
              loading={isSavingWeights}
              onClick={onSaveJobWeights}
            >
              Save as job default
            </Button>
            <Button variant="primary" size="sm" onClick={onApplyWeights}>
              Apply to rankings
            </Button>
          </div>
        </div>
      </div>
    </Dialog>
  );
}
