/**
 * Multi-segment score bar:
 * - Primary bar = skills covered points
 * - Champagne bar = text match points
 * - Ink-muted bar = experience & seniority points
 * - Champagne/40 bar = education points
 * Strict rules: No red/green/amber tiers.
 */
export function ScoreBar({
  skillsPoints = 0,
  textMatchPoints = 0,
  experiencePoints = 0,
  educationPoints = 0,
  finalScore = 0,
  hasMultiPillar,
  height = 'h-1.5',
  className = '',
  showLabel = false,
}) {
  const isMulti = hasMultiPillar !== undefined
    ? Boolean(hasMultiPillar)
    : (experiencePoints > 0 || educationPoints > 0);

  const skillsWidth = Math.max(0, skillsPoints);
  const textWidth = Math.max(0, textMatchPoints);
  const expWidth = Math.max(0, experiencePoints);
  const eduWidth = Math.max(0, educationPoints);
  const total = finalScore || (skillsPoints + textMatchPoints + experiencePoints + educationPoints);

  return (
    <div className={`w-full space-y-1 ${className}`}>
      <div
        className={`w-full ${height} rounded-[4px] bg-surface-alt overflow-hidden flex`}
        role="progressbar"
        aria-valuenow={Math.round(total)}
        aria-valuemin="0"
        aria-valuemax="100"
      >
        {/* Skills Covered Segment (Primary / Ink) */}
        <div
          data-testid="score-bar-skills"
          style={{ width: `${skillsWidth}%` }}
          className="bg-primary h-full transition-all duration-500 ease-out"
          title={`Skills: ${skillsWidth.toFixed(1)} pts`}
        />
        {/* Text Match Segment (Champagne) */}
        <div
          data-testid="score-bar-text"
          style={{ width: `${textWidth}%` }}
          className="bg-champagne h-full transition-all duration-500 ease-out"
          title={`Text: ${textWidth.toFixed(1)} pts`}
        />
        {/* Experience & Education Segments (rendered when multi-pillar or experience/education points > 0) */}
        {isMulti && (
          <>
            <div
              data-testid="score-bar-experience"
              style={{ width: `${expWidth}%` }}
              className="bg-slate-steel h-full transition-all duration-500 ease-out"
              title={`Experience: ${expWidth.toFixed(1)} pts`}
            />
            <div
              data-testid="score-bar-education"
              style={{ width: `${eduWidth}%` }}
              className="bg-silk-cream dark:bg-silk-cream/55 h-full transition-all duration-500 ease-out"
              title={`Education: ${eduWidth.toFixed(1)} pts`}
            />
          </>
        )}
      </div>
      {showLabel && (
        <div className="flex items-center justify-between text-[13px] text-ink-muted tabular-nums flex-wrap gap-x-2">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-[2px] bg-primary" />
            Skills: {skillsPoints.toFixed(1)}
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-[2px] bg-champagne" />
            Text: {textMatchPoints.toFixed(1)}
          </span>
          {isMulti && (
            <>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-[2px] bg-slate-steel" />
                Exp: {experiencePoints.toFixed(1)}
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-[2px] bg-silk-cream border border-amber-gold/30 dark:bg-silk-cream/55" />
                Edu: {educationPoints.toFixed(1)}
              </span>
            </>
          )}
          <span className="font-semibold text-ink ml-auto">{total.toFixed(1)}%</span>
        </div>
      )}
    </div>
  );
}
