import React from 'react';

export default function FooterSection({ onEnterApp }) {
  return (
    <footer className="relative bg-[#FBF7F2] border-t border-[#E8DDD0] pt-16 pb-0 overflow-hidden">
      <div className="max-w-[1200px] mx-auto px-6 sm:px-8 lg:px-12 space-y-12">
        
        {/* Top Minimal Links Row */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-12 border-b border-[#E8DDD0]">
          
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-full bg-[#7B1E3A] flex items-center justify-center text-[#F7EDD8] font-serif font-bold text-sm shadow-xs">
              S
            </div>
            <div>
              <span className="font-serif font-bold text-base text-[#2A1015]">
                SmartATS
              </span>
              <span className="text-[10px] uppercase font-mono tracking-widest text-[#B8893B] block">
                Deterministic Screening Architecture
              </span>
            </div>
          </div>

          <nav className="flex flex-wrap items-center justify-center gap-6 sm:gap-8 text-xs font-mono text-[#6B5A55]">
            <a href="#benefits" className="hover:text-[#7B1E3A] transition">Capabilities</a>
            <a href="#workflow" className="hover:text-[#7B1E3A] transition">Workflow</a>
            <a href="#stats" className="hover:text-[#7B1E3A] transition">Benchmarks</a>
            <a href="#showcase" className="hover:text-[#7B1E3A] transition">Interface</a>
            <a href="#faq" className="hover:text-[#7B1E3A] transition">Documentation</a>
            <button
              onClick={onEnterApp}
              className="hover:text-[#7B1E3A] font-semibold transition"
            >
              Screening Studio
            </button>
          </nav>

          <div className="text-xs font-mono text-[#6B5A55]">
            © {new Date().getFullYear()} SmartATS Systems.
          </div>
        </div>

      </div>

      {/* Oversized Cropped "SmartATS" Serif Wordmark at 18vw */}
      <div className="relative w-full overflow-hidden select-none pointer-events-none mt-4 -mb-[3vw] flex justify-center">
        <span
          style={{
            fontSize: '18vw',
            lineHeight: '0.82',
            letterSpacing: '-0.04em',
          }}
          className="font-serif font-bold text-[#2A1015] opacity-[0.08] whitespace-nowrap text-center"
        >
          SmartATS
        </span>
      </div>
    </footer>
  );
}
