import React, { useState } from 'react';
import { Menu, X } from 'lucide-react';

export default function FloatingNav({ onEnterApp }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      <header className="fixed top-6 left-1/2 -translate-x-1/2 z-40 w-[calc(100%-2.5rem)] max-w-4xl bg-surface/90 backdrop-blur-md border border-line rounded-[12px] px-6 py-3.5 shadow-[0_1px_2px_rgba(42,16,21,0.04),0_8px_24px_rgba(42,16,21,0.04)] transition-all">
        <div className="flex items-center justify-between">
          
          {/* Wordmark */}
          <a href="#" className="flex items-center space-x-2.5">
            <span className="font-serif text-2xl tracking-tight text-ink font-normal">
              SmartATS
            </span>
          </a>

          {/* 3 Calm Desktop Links */}
          <nav className="hidden md:flex items-center space-x-8 text-[14px] text-ink-muted">
            <a href="#scoring" className="hover:text-ink transition-colors">
              Methodology
            </a>
            <a href="#evidence" className="hover:text-ink transition-colors">
              Evidence
            </a>
            <a href="#features" className="hover:text-ink transition-colors">
              Interface
            </a>
          </nav>

          {/* One Wine Button */}
          <div className="hidden md:flex items-center">
            <button
              onClick={onEnterApp}
              className="px-5 py-2 bg-wine hover:bg-wine-hover text-white rounded-[8px] text-[14px] font-medium transition-colors shadow-xs"
            >
              Open the studio
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle navigation menu"
            className="md:hidden p-1.5 text-ink-muted hover:text-ink transition"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-30 bg-canvas/98 backdrop-blur-lg flex flex-col justify-between p-8 pt-28 md:hidden">
          <nav className="flex flex-col space-y-6">
            <a
              href="#scoring"
              onClick={() => setMobileOpen(false)}
              className="font-serif text-3xl text-ink hover:text-wine transition-colors"
            >
              Methodology
            </a>
            <a
              href="#evidence"
              onClick={() => setMobileOpen(false)}
              className="font-serif text-3xl text-ink hover:text-wine transition-colors"
            >
              Evidence
            </a>
            <a
              href="#features"
              onClick={() => setMobileOpen(false)}
              className="font-serif text-3xl text-ink hover:text-wine transition-colors"
            >
              Interface
            </a>
          </nav>

          <div className="pt-6 border-t border-line space-y-4">
            <button
              onClick={() => {
                setMobileOpen(false);
                onEnterApp();
              }}
              className="w-full py-3.5 bg-wine hover:bg-wine-hover text-white rounded-[8px] text-[15px] font-medium transition-colors shadow-xs"
            >
              Open the studio
            </button>
            <p className="text-[13px] text-ink-muted font-sans text-center">
              Explainable resume screening and matching.
            </p>
          </div>
        </div>
      )}
    </>
  );
}
