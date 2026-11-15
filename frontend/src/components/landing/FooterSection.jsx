import React from 'react';

export default function FooterSection({ onEnterApp }) {
  return (
    <footer className="bg-canvas border-t border-line pt-16 pb-0 overflow-hidden">
      <div className="max-w-[1200px] mx-auto px-6 sm:px-8 lg:px-12">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 pb-16 border-b border-line">
          <div>
            <span className="font-serif text-2xl text-ink font-normal">
              SmartATS
            </span>
            <p className="text-[13px] text-ink-muted font-sans mt-0.5">
              Explainable resume screening and matching.
            </p>
          </div>

          <nav className="flex flex-wrap items-center gap-8 text-[14px] text-ink-muted font-sans">
            <a href="#scoring" className="hover:text-ink transition-colors">Methodology</a>
            <a href="#evidence" className="hover:text-ink transition-colors">Evidence</a>
            <a href="#features" className="hover:text-ink transition-colors">Interface</a>
            <button
              onClick={onEnterApp}
              className="hover:text-ink transition-colors font-medium"
            >
              Studio
            </button>
          </nav>
        </div>
      </div>

      {/* Cropped Large Serif Wordmark at Bottom */}
      <div className="w-full overflow-hidden select-none pointer-events-none mt-8 -mb-[3vw] flex justify-center">
        <span
          style={{
            fontSize: '18vw',
            lineHeight: '0.8',
            letterSpacing: '-0.04em',
          }}
          className="font-serif text-ink opacity-[0.05] whitespace-nowrap text-center font-normal"
        >
          SmartATS
        </span>
      </div>
    </footer>
  );
}
