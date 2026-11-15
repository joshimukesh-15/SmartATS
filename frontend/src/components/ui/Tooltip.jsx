import { useState } from 'react';

export function Tooltip({ children, content, side = 'top' }) {
  const [visible, setVisible] = useState(false);

  if (!content) return children;

  const positions = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-1.5',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-1.5',
    left: 'right-full top-1/2 -translate-y-1/2 mr-1.5',
    right: 'left-full top-1/2 -translate-y-1/2 ml-1.5',
  };

  return (
    <div
      className="relative inline-flex"
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
      onFocus={() => setVisible(true)}
      onBlur={() => setVisible(false)}
    >
      {children}
      {visible && (
        <div
          role="tooltip"
          className={`absolute ${positions[side]} z-50 px-2 py-1 text-[13px] font-normal text-on-primary bg-primary rounded-[6px] shadow-md pointer-events-none whitespace-nowrap animate-fadeIn`}
        >
          {content}
        </div>
      )}
    </div>
  );
}
