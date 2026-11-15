export function Skeleton({ className = '', ...props }) {
  return <div className={`animate-pulse rounded-[8px] bg-surface-alt ${className}`} {...props} />;
}
