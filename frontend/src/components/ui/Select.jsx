import { forwardRef } from 'react';
import { ChevronDown } from 'lucide-react';

export const Select = forwardRef(function Select(
  { children, className = '', error, disabled = false, ...props },
  ref
) {
  return (
    <div className="relative w-full">
      <select
        ref={ref}
        disabled={disabled}
        className={`w-full h-9 appearance-none pl-3 pr-8 rounded-[10px] border bg-surface text-ink text-[14px] transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2 disabled:opacity-50 disabled:cursor-not-allowed ${
          error
            ? 'border-danger focus-visible:outline-danger'
            : 'border-line hover:border-ink-subtle'
        } ${className}`}
        {...props}
      >
        {children}
      </select>
      <div className="absolute inset-y-0 right-0 pr-2.5 flex items-center pointer-events-none text-ink-muted">
        <ChevronDown className="w-4 h-4" />
      </div>
    </div>
  );
});
