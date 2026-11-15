import { formatScore } from '../../lib/score';

export function ScoreValue({ score, size = 'md', showPercent = true, className = '' }) {
  const SIZES = {
    sm: 'text-[14px] font-medium',
    md: 'text-[16px] font-semibold',
    lg: 'text-[24px] font-semibold',
    xl: 'text-[32px] sm:text-[36px] font-semibold',
  };

  const formatted = formatScore(score, 1);
  const display = showPercent ? formatted : formatted.replace('%', '');

  return (
    <span
      className={`font-sans tabular-nums text-ink tracking-tight ${
        SIZES[size] || SIZES.md
      } ${className}`}
    >
      {display}
    </span>
  );
}
