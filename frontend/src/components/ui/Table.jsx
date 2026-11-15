export function Table({ children, className = '', ...props }) {
  return (
    <div className="w-full overflow-x-auto">
      <table
        className={`w-full text-left text-[14px] text-ink border-collapse ${className}`}
        {...props}
      >
        {children}
      </table>
    </div>
  );
}

export function TableHeader({ children, className = '', ...props }) {
  return (
    <thead
      className={`border-b border-line bg-surface-alt/50 text-[13px] font-medium text-ink-muted ${className}`}
      {...props}
    >
      {children}
    </thead>
  );
}

export function TableBody({ children, className = '', ...props }) {
  return (
    <tbody className={`divide-y divide-line ${className}`} {...props}>
      {children}
    </tbody>
  );
}

export function TableRow({ children, className = '', active = false, ...props }) {
  return (
    <tr
      className={`transition-colors hover:bg-surface-alt/60 ${
        active ? 'bg-surface-alt' : ''
      } ${className}`}
      {...props}
    >
      {children}
    </tr>
  );
}

export function TableHead({ children, className = '', ...props }) {
  return (
    <th
      className={`px-4 py-3 font-medium text-ink-muted text-[13px] select-none ${className}`}
      {...props}
    >
      {children}
    </th>
  );
}

export function TableCell({ children, className = '', ...props }) {
  return (
    <td className={`px-4 py-3.5 align-middle ${className}`} {...props}>
      {children}
    </td>
  );
}
