export function Skeleton({ className = '', ...props }) {
  return (
    <div
      className={`relative overflow-hidden rounded-[8px] bg-surface-alt before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_1.6s_infinite] before:bg-gradient-to-r before:from-transparent before:via-ink/5 dark:before:via-white/5 before:to-transparent ${className}`}
      {...props}
    />
  );
}
