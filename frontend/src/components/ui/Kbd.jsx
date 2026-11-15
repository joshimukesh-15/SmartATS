export function Kbd({ children, className = '', ...props }) {
  return (
    <kbd
      className={`inline-flex items-center justify-center px-1.5 py-0.5 text-[13px] font-medium leading-none rounded-[6px] border border-line bg-surface-alt text-ink-muted select-none ${className}`}
      {...props}
    >
      {children}
    </kbd>
  );
}

export default Kbd;
