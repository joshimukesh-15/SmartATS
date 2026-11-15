import React, { useRef, useState, useEffect } from 'react';
import { ArrowRight } from 'lucide-react';

/**
 * MagneticButton:
 * - Subtle cursor attraction within max 8px offset
 * - Arrow icon slides to the right on hover
 * - Smooth spring-like transition back to (0,0) on pointer leave
 * - Respects prefers-reduced-motion
 */
export default function MagneticButton({
  children,
  onClick,
  variant = 'primary', // 'primary' (wine) | 'secondary' (outlined wine) | 'gold' (gold fill)
  className = '',
  showArrow = true,
  disabled = false,
  type = 'button',
}) {
  const buttonRef = useRef(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mq.matches);
    const handler = (e) => setPrefersReducedMotion(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  const handleMouseMove = (e) => {
    if (prefersReducedMotion || disabled) return;
    const rect = buttonRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    // Maximum offset 8px in each direction
    const distanceX = Math.max(-8, Math.min(8, (e.clientX - centerX) * 0.18));
    const distanceY = Math.max(-8, Math.min(8, (e.clientY - centerY) * 0.18));
    setPosition({ x: distanceX, y: distanceY });
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setPosition({ x: 0, y: 0 });
  };

  // Variants styling strictly conforming to tokens:
  // Primary = wine (#7B1E3A), white text
  // Secondary = outlined wine
  // Gold = gold accent (#B8893B) with dark text (for dark CTA block)
  let variantStyles = 'bg-[#7B1E3A] hover:bg-[#5E1229] text-white shadow-xs';
  if (variant === 'secondary') {
    variantStyles = 'bg-white hover:bg-[#F8ECEF] text-[#7B1E3A] border border-[#7B1E3A]/40 shadow-xs';
  } else if (variant === 'gold') {
    variantStyles = 'bg-[#B8893B] hover:bg-[#9A7230] text-[#2A1015] font-semibold shadow-md';
  }

  return (
    <button
      ref={buttonRef}
      type={type}
      disabled={disabled}
      onClick={onClick}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{
        transform: prefersReducedMotion ? 'none' : `translate(${position.x}px, ${position.y}px)`,
        transition: isHovered
          ? 'transform 100ms ease-out, background-color 150ms ease, box-shadow 150ms ease'
          : 'transform 350ms cubic-bezier(0.16, 1, 0.3, 1), background-color 150ms ease, box-shadow 150ms ease',
      }}
      className={`group relative inline-flex items-center justify-center space-x-2 px-6 py-3.5 rounded-full text-xs font-semibold tracking-wide transition-all active:scale-[0.98] ${variantStyles} ${className}`}
    >
      <span>{children}</span>
      {showArrow && (
        <ArrowRight
          className={`w-3.5 h-3.5 transition-transform duration-200 ease-out ${
            prefersReducedMotion ? '' : 'group-hover:translate-x-1'
          }`}
        />
      )}
    </button>
  );
}
