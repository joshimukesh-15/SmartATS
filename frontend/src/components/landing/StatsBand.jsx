import React, { useState, useEffect, useRef } from 'react';

export default function StatsBand() {
  const bandRef = useRef(null);
  const [inView, setInView] = useState(false);
  const [counts, setCounts] = useState([0, 0, 0, 0]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.25 }
    );

    if (bandRef.current) {
      observer.observe(bandRef.current);
    }

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!inView) return;

    const targets = [99.4, 12, 0.0, 100];
    const duration = 1500;
    const start = performance.now();

    const frame = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      // ease-out expo
      const easeProgress = 1 - Math.pow(2, -10 * progress);

      setCounts([
        (99.4 * easeProgress).toFixed(1),
        Math.floor(12 * easeProgress),
        '0.00',
        Math.floor(100 * easeProgress),
      ]);

      if (progress < 1) {
        requestAnimationFrame(frame);
      } else {
        setCounts(['99.4', '12', '0.00', '100']);
      }
    };

    requestAnimationFrame(frame);
  }, [inView]);

  const stats = [
    {
      value: `${counts[0]}%`,
      label: 'Precision Parsing Rate',
      subtext: 'PyMuPDF + OCR text integrity',
    },
    {
      value: `${counts[1]}x`,
      label: 'Recruiting Velocity',
      subtext: 'Faster candidate shortlisting',
    },
    {
      value: `${counts[2]}%`,
      label: 'Hallucination Margin',
      subtext: 'Deterministic NLP scoring',
    },
    {
      value: `${counts[3]}%`,
      label: 'Audit Trail Clarity',
      subtext: 'Explainable component metrics',
    },
  ];

  return (
    <section
      ref={bandRef}
      className="relative my-[-2%] py-24 sm:py-32 bg-gradient-to-r from-[#2A1015] via-[#3D1422] to-[#2A1015] band text-white z-10 overflow-hidden"
    >
      <div className="max-w-[1200px] mx-auto px-6 sm:px-8 lg:px-12">
        <div className="text-center mb-12">
          <span className="text-xs uppercase font-mono tracking-[0.16em] text-[#B8893B] font-semibold">
            Empirical Platform Benchmarks
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-0">
          {stats.map((stat, idx) => (
            <div
              key={idx}
              className="lg:px-8 lg:border-r border-[#B8893B]/20 last:border-r-0 flex flex-col justify-center items-center text-center space-y-2"
            >
              <div className="font-serif font-bold text-4xl sm:text-5xl lg:text-6xl text-[#F7EDD8] tracking-tight">
                {stat.value}
              </div>
              <div className="w-10 h-0.5 bg-[#B8893B] my-2" />
              <div className="text-sm font-sans font-semibold text-[#FBF7F2]">
                {stat.label}
              </div>
              <div className="text-xs font-mono text-[#E8DDD0]/70">
                {stat.subtext}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
