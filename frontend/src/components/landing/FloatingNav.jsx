import React, { useState, useEffect } from 'react';
import { Sparkles, Menu, X, ArrowRight } from 'lucide-react';

export default function FloatingNav({ onEnterApp }) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 40);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { label: 'Capabilities', href: '#benefits' },
    { label: 'Architecture', href: '#workflow' },
    { label: 'Performance', href: '#stats' },
    { label: 'Platform Studio', href: '#showcase' },
    { label: 'FAQ', href: '#faq' },
  ];

  return (
    <>
      {/* Floating Pill Nav Bar */}
      <header
        className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] max-w-4xl transition-all duration-300 ease-out ${
          scrolled
            ? 'py-2 px-4 sm:px-6 bg-white/90 backdrop-blur-md border border-[#B8893B]/30 shadow-[0_12px_32px_rgba(42,16,21,0.08)] rounded-full'
            : 'py-3.5 px-5 sm:px-7 bg-white/70 backdrop-blur-sm border border-[#E8DDD0] rounded-full'
        }`}
      >
        <div className="flex items-center justify-between">
          
          {/* Brand Emblem */}
          <a href="#" className="flex items-center space-x-2.5 group">
            <div className="w-8 h-8 rounded-full bg-[#7B1E3A] flex items-center justify-center text-[#F7EDD8] font-serif font-bold text-sm shadow-xs transition-transform duration-200 group-hover:scale-105">
              S
            </div>
            <div className="flex flex-col">
              <span className="font-serif font-bold text-base text-[#2A1015] tracking-tight leading-none">
                SmartATS
              </span>
              <span className="text-[9px] uppercase font-mono tracking-[0.14em] text-[#B8893B] font-semibold mt-0.5">
                Editorial AI
              </span>
            </div>
          </a>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center space-x-7 text-xs font-medium text-[#6B5A55]">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="hover:text-[#7B1E3A] transition-colors relative py-1 hover:font-semibold"
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* Desktop Launch Studio Button */}
          <div className="hidden md:flex items-center space-x-3">
            <button
              onClick={onEnterApp}
              className="inline-flex items-center space-x-1.5 px-4 py-2 bg-[#7B1E3A] hover:bg-[#5E1229] text-white rounded-full text-xs font-semibold tracking-wide transition-all shadow-xs active:scale-[0.98]"
            >
              <span>Launch Studio</span>
              <ArrowRight className="w-3.5 h-3.5 text-[#F7EDD8]" />
            </button>
          </div>

          {/* Mobile Hamburger Toggle */}
          <button
            onClick={() => setMobileOpen(true)}
            aria-label="Open mobile menu"
            className="md:hidden p-1.5 rounded-full text-[#6B5A55] hover:text-[#7B1E3A] hover:bg-[#F8ECEF] transition"
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Full-Screen Mobile Drawer with Staggered Link Reveal */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 bg-[#FBF7F2] flex flex-col justify-between p-8 animate-in fade-in duration-200">
          <div className="flex items-center justify-between border-b border-[#E8DDD0] pb-6">
            <div className="flex items-center space-x-2.5">
              <div className="w-9 h-9 rounded-full bg-[#7B1E3A] flex items-center justify-center text-[#F7EDD8] font-serif font-bold text-base">
                S
              </div>
              <span className="font-serif font-bold text-xl text-[#2A1015]">
                SmartATS
              </span>
            </div>
            <button
              onClick={() => setMobileOpen(false)}
              aria-label="Close mobile menu"
              className="p-2 rounded-full border border-[#B8893B]/40 text-[#7B1E3A] hover:bg-[#F8ECEF] transition"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <nav className="flex flex-col space-y-6 my-auto">
            {navLinks.map((link, idx) => (
              <a
                key={link.label}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                style={{
                  animationDelay: `${idx * 80}ms`,
                }}
                className="font-serif text-3xl font-bold text-[#2A1015] hover:text-[#7B1E3A] transition-colors animate-in slide-in-from-bottom-3 duration-300 fill-mode-both"
              >
                {link.label}
              </a>
            ))}
          </nav>

          <div className="border-t border-[#E8DDD0] pt-6 space-y-3">
            <button
              onClick={() => {
                setMobileOpen(false);
                onEnterApp();
              }}
              className="w-full py-4 bg-[#7B1E3A] text-white rounded-full text-sm font-semibold tracking-wide flex items-center justify-center space-x-2 shadow-md"
            >
              <span>Enter Screening Studio</span>
              <ArrowRight className="w-4 h-4 text-[#F7EDD8]" />
            </button>
            <p className="text-center text-xs text-[#6B5A55] font-mono">
              Explainable Recruiter Screening & Matching
            </p>
          </div>
        </div>
      )}
    </>
  );
}
