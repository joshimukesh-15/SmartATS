import { forwardRef } from 'react';

const VARIANTS = {
  primary: 'bg-primary text-on-primary hover:opacity-90 active:opacity-95 border border-primary',
  secondary: 'bg-surface hover:bg-surface-alt active:bg-surface border border-line text-ink',
  ghost:
    'bg-transparent hover:bg-surface-alt active:bg-surface text-ink-muted hover:text-ink border border-transparent',
  danger: 'bg-danger text-white hover:opacity-90 border border-danger',
};

const SIZES = {
  sm: 'w-7 h-7 p-1 text-[13px]',
  md: 'w-8 h-8 p-1.5 text-[14px]',
  lg: 'w-10 h-10 p-2 text-[15px]',
};

export const IconButton = forwardRef(function IconButton(
  {
    children,
    variant = 'ghost',
    size = 'md',
    className = '',
    'aria-label': ariaLabel,
    disabled = false,
    type = 'button',
    ...props
  },
  ref
) {
  const variantClass = VARIANTS[variant] || VARIANTS.ghost;
  const sizeClass = SIZES[size] || SIZES.md;

  return (
    <button
      ref={ref}
      type={type}
      aria-label={ariaLabel}
      disabled={disabled}
      className={`inline-flex items-center justify-center rounded-[10px] transition-all duration-150 active:scale-[0.98] cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2 ${variantClass} ${sizeClass} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
});
