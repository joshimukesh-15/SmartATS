/**
 * Two-segment score bar:
 * - Primary bar = skills covered points (coverage% * 0.6)
 * - Champagne bar = text match points (match% * 0.4)
 * Strict rules: No red/green/amber tiers.
 */
export function ScoreBar({
  skillsPoints = 0,
  textMatchPoints = 0,
  finalScore = 0,
  height = 'h-1.5',
  className = '',
  showLabel = false,
}) {
  const skillsWidth = Math.min(Math.max(skillsPoints, 0), 60);
  const textWidth = Math.min(Math.max(textMatchPoints, 0), 40);
  const total = finalScore || skillsPoints + textMatchPoints;

  return (
    <div className={`w-full space-y-1 ${className}`}>
      <div
        className={`w-full ${height} rounded-full bg-surface-alt overflow-hidden flex`}
        role="progressbar"
        aria-valuenow={Math.round(total)}
        aria-valuemin="0"
        aria-valuemax="100"
      >
        {/* Skills Covered Segment (Primary / Graphite-Ink) */}
        <div
          style={{ width: `${skillsWidth}%` }}
          className="bg-primary h-full transition-all duration-500 ease-out"
          title={`Skills covered: ${skillsWidth.toFixed(1)} pts`}
        />
        {/* Text Match Segment (Champagne) */}
        <div
          style={{ width: `${textWidth}%` }}
          className="bg-champagne h-full transition-all duration-500 ease-out"
          title={`Text match: ${textWidth.toFixed(1)} pts`}
        />
      </div>
      {showLabel && (
        <div className="flex items-center justify-between text-[13px] text-ink-muted tabular-nums">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-primary" />
            Skills: {skillsPoints.toFixed(1)}
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-champagne" />
            Text: {textMatchPoints.toFixed(1)}
          </span>
          <span className="font-semibold text-ink">{total.toFixed(1)}%</span>
        </div>
      )}
    </div>
  );
}
