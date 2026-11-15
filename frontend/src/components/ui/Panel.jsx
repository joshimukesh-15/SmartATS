export function Panel({
  children,
  className = '',
  subtle = false,
  as: Component = 'div',
  ...props
}) {
  return (
    <Component
      className={`rounded-[14px] border border-line ${
        subtle ? 'bg-surface-alt' : 'bg-surface'
      } ${className}`}
      {...props}
    >
      {children}
    </Component>
  );
}
