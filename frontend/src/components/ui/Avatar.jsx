import { useState } from 'react';

function getInitials(name = '') {
  if (!name || typeof name !== 'string') return '?';
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function getDeterministicTint(name = '') {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = (hash << 5) - hash + name.charCodeAt(i);
    hash |= 0;
  }
  const paletteTints = [
    'bg-surface-alt text-obsidian-navy border-line dark:bg-slate-navy dark:text-ink dark:border-cadet-steel/50',
    'bg-ice-blue/12 text-obsidian-navy border-ice-blue/30 dark:bg-slate-navy/90 dark:text-ice-blue dark:border-ice-blue/35',
    'bg-silk-cream/40 text-obsidian-navy border-amber-gold/30 dark:bg-silk-cream/14 dark:text-silk-cream dark:border-amber-gold/35',
  ];
  return paletteTints[Math.abs(hash) % paletteTints.length];
}

export function Avatar({
  name = '',
  src,
  alt,
  size = 'md',
  tint,
  className = '',
  ...props
}) {
  const [imgError, setImgError] = useState(false);

  const sizeClasses = {
    sm: 'w-6 h-6 text-[13px]',
    md: 'w-8 h-8 text-[13px]', // 32px circle
    lg: 'w-10 h-10 text-[15px]',
  }[size] || 'w-8 h-8 text-[13px]';

  const tintClass =
    tint === 'ink'
      ? 'bg-surface-alt text-ink border-line'
      : getDeterministicTint(name);

  const initials = getInitials(name);

  return (
    <div
      className={`rounded-full shrink-0 flex items-center justify-center font-medium select-none border overflow-hidden ${sizeClasses} ${tintClass} ${className}`}
      title={name || alt}
      {...props}
    >
      {src && !imgError ? (
        <img
          src={src}
          alt={alt || name || 'Avatar'}
          onError={() => setImgError(true)}
          className="w-full h-full object-cover"
        />
      ) : (
        <span>{initials}</span>
      )}
    </div>
  );
}

export default Avatar;
