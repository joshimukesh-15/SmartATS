const VARIANTS = {
  default: 'bg-surface-alt text-ink border border-line',
  matched: 'bg-champagne-soft text-ink border border-champagne/30',
  missing: 'bg-surface text-ink-muted border border-dashed border-line',
  primary: 'bg-primary text-on-primary border border-primary',
  outline: 'bg-transparent text-ink border border-line',
};

export function Tag({
  children,
  variant = 'default',
  className = '',
  leftIcon,
  onRemove,
  ...props
}) {
  const variantClass = VARIANTS[variant] || VARIANTS.default;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[6px] text-[13px] font-medium transition-colors select-none ${variantClass} ${className}`}
      {...props}
    >
      {leftIcon}
      <span>{children}</span>
      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          aria-label="Remove tag"
          className="ml-1 hover:text-ink focus-visible:outline-1 focus-visible:outline-primary rounded-xs"
        >
          ×
        </button>
      )}
    </span>
  );
}

export function Badge({ children, variant = 'default', className = '', ...props }) {
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-[6px] text-[13px] font-medium select-none ${
        VARIANTS[variant] || VARIANTS.default
      } ${className}`}
      {...props}
    >
      {children}
    </span>
  );
}
