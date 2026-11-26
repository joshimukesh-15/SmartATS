import { forwardRef } from 'react';

const VARIANTS = {
  primary:
    'bg-gradient-to-b from-amber-gold to-amber-deep text-white border border-amber-deep shadow-[0_2px_10px_rgba(217,119,6,0.28),inset_0_1px_0_rgba(244,214,176,0.45)] hover:from-primary-hover hover:to-amber-deep hover:shadow-[0_6px_20px_rgba(217,119,6,0.38)] active:opacity-95',
  secondary:
    'bg-surface hover:bg-silk-cream/45 dark:hover:bg-surface-alt active:bg-surface border border-line hover:border-amber-gold/50 text-ink shadow-xs',
  ghost: 'bg-transparent hover:bg-silk-cream/35 dark:hover:bg-surface-alt active:bg-surface text-ink border border-transparent',
  danger: 'bg-danger text-white hover:opacity-90 active:opacity-95 border border-danger shadow-xs',
  outline:
    'bg-transparent hover:bg-silk-cream/35 dark:hover:bg-surface-alt active:bg-surface border border-line hover:border-amber-gold/50 text-ink',
};

const SIZES = {
  sm: 'px-3 py-1.5 text-[13px] h-8 gap-1.5',
  md: 'px-4 py-2 text-[14px] h-9 gap-2',
  lg: 'px-5 py-2.5 text-[15px] h-10 gap-2.5',
};

export const Button = forwardRef(function Button(
  {
    children,
    variant = 'primary',
    size = 'md',
    className = '',
    disabled = false,
    loading = false,
    leftIcon,
    rightIcon,
    type = 'button',
    ...props
  },
  ref
) {
  const variantClass = VARIANTS[variant] || VARIANTS.primary;
  const sizeClass = SIZES[size] || SIZES.md;

  return (
    <button
      ref={ref}
      type={type}
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center font-medium rounded-[10px] transition-all duration-150 active:scale-[0.98] select-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2 ${variantClass} ${sizeClass} ${className}`}
      {...props}
    >
      {loading ? (
        <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : (
        leftIcon
      )}
      <span>{children}</span>
      {!loading && rightIcon}
    </button>
  );
});
