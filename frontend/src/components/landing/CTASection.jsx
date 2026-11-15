import React, { useState } from 'react';
import MagneticButton from './MagneticButton';
import Reveal from './Reveal';

export default function CTASection({ onEnterApp }) {
  const [spotlight, setSpotlight] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setSpotlight({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  return (
    <section className="relative pt-20 pb-28 md:pt-28 md:pb-36 bg-[#FBF7F2] overflow-hidden">
      
      {/* Arch Topper Element with Ellipse Clip-Path */}
      <div
        aria-hidden="true"
        className="w-full h-16 sm:h-24 bg-[#2A1015] arch mx-auto max-w-[1240px] mb-[-1px]"
      />

      <div className="max-w-[1200px] mx-auto px-6 sm:px-8 lg:px-12">
        <div
          onMouseMove={handleMouseMove}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          className="relative rounded-3xl bg-gradient-to-br from-[#2A1015] via-[#38101E] to-[#2A1015] p-10 sm:p-16 lg:p-20 text-center shadow-[0_24px_64px_rgba(42,16,21,0.25)] border border-[#B8893B]/30 overflow-hidden"
        >
          {/* Subtle Grain Texture Overlay */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 opacity-[0.035] bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px] z-0"
          />

          {/* Cursor-following Spotlight */}
          {isHovered && (
            <div
              aria-hidden="true"
              style={{
                background: `radial-gradient(500px circle at ${spotlight.x}px ${spotlight.y}px, rgba(184, 137, 59, 0.22), transparent 75%)`,
              }}
              className="pointer-events-none absolute inset-0 z-0 transition-opacity duration-200"
            />
          )}

          <div className="relative z-10 max-w-3xl mx-auto space-y-6">
            <Reveal staggerIndex={0}>
              <span className="text-xs uppercase font-mono tracking-[0.16em] text-[#B8893B] font-semibold">
                Autonomous Precision
              </span>
            </Reveal>

            <Reveal staggerIndex={1}>
              <h2 className="text-3xl sm:text-5xl lg:text-6xl font-serif font-bold text-[#FBF7F2] tracking-tight leading-[1.08]">
                Elevate your talent team with auditable screening intelligence.
              </h2>
            </Reveal>

            <Reveal staggerIndex={2}>
              <p className="text-base sm:text-lg text-[#E8DDD0]/80 font-sans max-w-xl mx-auto leading-relaxed">
                Join forward-thinking enterprise recruiters utilizing deterministic keyword extraction and vector L2 normalization.
              </p>
            </Reveal>

            <Reveal staggerIndex={3}>
              <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
                <MagneticButton
                  variant="gold"
                  onClick={onEnterApp}
                  className="px-8 py-4 text-xs font-bold"
                >
                  Launch Live Studio Now
                </MagneticButton>
              </div>
            </Reveal>

            <Reveal staggerIndex={4}>
              <div className="pt-6 flex items-center justify-center space-x-6 text-xs font-mono text-[#F7EDD8]/70">
                <span>Free On-Premises Evaluation</span>
                <span>•</span>
                <span>Zero Cloud Dependency</span>
                <span>•</span>
                <span>Instant Ingestion</span>
              </div>
            </Reveal>
          </div>

        </div>
      </div>
    </section>
  );
}
