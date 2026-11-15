import React, { useEffect, useRef, useState } from 'react';

/**
 * Shared Reveal & Section Wrapper
 * - Triggers viewport entry via IntersectionObserver (once: true)
 * - Applies 24px vertical translation + opacity transition
 * - Applies an optional stagger delay (default: 80ms * index)
 * - Automatically disables motion if prefers-reduced-motion is active
 */
export default function Reveal({
  children,
  className = '',
  delay = 0,
  staggerIndex = 0,
  as: Component = 'div',
  threshold = 0.15,
}) {
  const ref = useRef(null);
  const [isVisible, setIsVisible] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handleChange = (e) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handleChange);

    if (mediaQuery.matches) {
      setIsVisible(true);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          if (ref.current) observer.unobserve(ref.current);
        }
      },
      {
        threshold,
        rootMargin: '0px 0px -40px 0px',
      }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      observer.disconnect();
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, [threshold]);

  const totalDelay = prefersReducedMotion ? 0 : delay + staggerIndex * 80;

  return (
    <Component
      ref={ref}
      style={{
        transitionDuration: prefersReducedMotion ? '0ms' : '700ms',
        transitionDelay: `${totalDelay}ms`,
        transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
      }}
      className={`transition-all transform ${
        prefersReducedMotion || isVisible
          ? 'opacity-100 translate-y-0'
          : 'opacity-0 translate-y-6'
      } ${className}`}
    >
      {children}
    </Component>
  );
}
