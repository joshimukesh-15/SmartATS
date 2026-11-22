import { Link } from 'react-router-dom';

export function StudioPageHeader({
  breadcrumb,
  title,
  description,
  actions,
  className = '',
}) {
  return (
    <div className={`mb-8 border-b border-line pb-8 ${className}`}>
      {breadcrumb && (
        <nav aria-label="Breadcrumb" className="mb-2 flex items-center gap-1.5 text-[13px] text-ink-muted">
          <Link to="/studio" className="transition-colors hover:text-ink">
            Studio
          </Link>
          <span className="text-ink-subtle">/</span>
          <span className="font-medium text-ink">{breadcrumb}</span>
        </nav>
      )}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <h1 className="text-[30px] font-semibold tracking-[-0.03em] leading-[1.15] text-ink">
            {title}
          </h1>
          {description && (
            <p className="mt-2 text-[15px] leading-[1.6] text-ink-muted">
              {description}
            </p>
          )}
        </div>
        {actions && <div className="flex flex-wrap items-center gap-3">{actions}</div>}
      </div>
    </div>
  );
}
export default StudioPageHeader;
