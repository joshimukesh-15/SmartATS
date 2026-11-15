import React, { useEffect, useRef, useState } from 'react';

/**
 * Quiet Editorial Reveal Component
 * - 12px rise + opacity fade (600-800ms ease-out-expo)
 * - Automatically disables when prefers-reduced-motion is active
 */
export default function Reveal({
  children,
  className = '',
  delay = 0,
  as: Component = 'div',
}) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (mq.matches) {
      setInView(true);
      return;
    }

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
  }, []);

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
