import { forwardRef } from 'react';

export const Input = forwardRef(function Input(
  { className = '', leftIcon, rightIcon, error, disabled = false, ...props },
  ref
) {
  return (
    <div className="relative w-full">
      {leftIcon && (
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-ink-muted">
          {leftIcon}
        </div>
      )}
      <input
        ref={ref}
        disabled={disabled}
        className={`w-full h-9 rounded-[10px] border bg-surface text-ink text-[14px] placeholder:text-ink-subtle transition-colors focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2 disabled:opacity-50 disabled:cursor-not-allowed ${
          leftIcon ? 'pl-9' : 'pl-3'
        } ${rightIcon ? 'pr-9' : 'pr-3'} ${
          error
            ? 'border-danger focus-visible:outline-danger'
            : 'border-line hover:border-ink-subtle'
        } ${className}`}
        {...props}
      />
      {rightIcon && (
        <div className="absolute inset-y-0 right-0 pr-3 flex items-center text-ink-muted">
          {rightIcon}
        </div>
      )}
    </div>
  );
});
