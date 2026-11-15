import { useEffect, useRef, useState } from 'react';

/**
 * Editorial Reveal Component
 * - 8px rise + opacity fade
 * - Automatically disables when prefers-reduced-motion is active
 */
export default function Reveal({ children, className = '', delay = 0, as: Component = 'div' }) {
  const ref = useRef(null);
  const [inView, setInView] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  });

  useEffect(() => {
    if (inView) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          if (ref.current) observer.unobserve(ref.current);
        }
      },
      { threshold: 0.1 }
    );

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [inView]);

  return (
    <Component
      ref={ref}
      style={{
        transitionDelay: `${delay}ms`,
      }}
      className={`fade-rise ${inView ? 'in-view' : ''} ${className}`}
    >
      {children}
    </Component>
  );
}
