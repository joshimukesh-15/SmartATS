import { useState, useEffect } from 'react';
import { Button } from '../ui/Button';
import { ThemeToggle } from '../ui/ThemeToggle';

export default function FloatingNav({ onEnterApp }) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 inset-x-0 z-40 transition-all duration-300 ease-in-out ${
        scrolled
          ? 'bg-canvas/80 backdrop-blur-xl border-b border-line shadow-xs'
          : 'bg-transparent border-b border-transparent'
      }`}
    >
      <div
        className={`max-w-[1240px] mx-auto px-6 sm:px-8 lg:px-12 flex items-center justify-between transition-all duration-300 ease-in-out ${
          scrolled ? 'h-[62px]' : 'h-[76px]'
        }`}
      >
        {/* Wordmark Logo Left */}
        <div className="flex items-center gap-3 select-none">
          <span className="w-7 h-7 rounded-[8px] bg-gradient-to-br from-slate-navy to-obsidian-navy dark:from-ice-cyan dark:to-cadet-steel text-white dark:text-obsidian-navy font-bold text-[14px] flex items-center justify-center shadow-xs ring-1 ring-inset ring-white/20">
            S
          </span>
          <span className="text-[18px] font-bold text-ink tracking-tight">SmartATS</span>
          <span className="hidden sm:inline-flex items-center text-[13px] font-medium text-ink-muted bg-surface-alt px-2 py-0.5 rounded-[8px] border border-line">
            Enterprise
          </span>
        </div>

        {/* Enterprise Nav Links */}
        <nav className="hidden lg:flex items-center gap-8 text-[14px] font-medium text-ink-muted">
          <a href="#scoring" className="hover:text-ink transition-colors">
            Scoring Math
          </a>
          <a href="#comparison" className="hover:text-ink transition-colors">
            Architecture
          </a>
          <a href="#security" className="hover:text-ink transition-colors">
            Security & Compliance
          </a>
          <a href="#features" className="hover:text-ink transition-colors">
            Features
          </a>
          <a href="#workflow" className="hover:text-ink transition-colors">
            Workflow
          </a>
        </nav>

        {/* Right Actions: Theme Toggle + Open Studio */}
        <div className="flex items-center gap-3">
          <ThemeToggle className="border border-line bg-surface" />
          <Button variant="primary" size="sm" onClick={onEnterApp}>
            Open the studio
          </Button>
        </div>
      </div>
    </header>
  );
}
