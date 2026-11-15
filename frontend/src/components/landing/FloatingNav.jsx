import { useState, useEffect } from 'react';
import { Button } from '../ui/Button';

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
          ? 'bg-canvas/80 backdrop-blur-md border-b border-line shadow-xs'
          : 'bg-transparent border-b border-transparent'
      }`}
    >
      <div
        className={`max-w-[1200px] mx-auto px-6 sm:px-8 lg:px-12 flex items-center justify-between transition-all duration-300 ease-in-out ${
          scrolled ? 'h-[60px]' : 'h-[72px]'
        }`}
      >
        {/* Wordmark Logo Left */}
        <div className="flex items-center gap-2.5 select-none">
          <span className="w-7 h-7 rounded-[8px] bg-primary text-on-primary font-semibold text-[14px] flex items-center justify-center shadow-xs">
            S
          </span>
          <span className="text-[18px] font-semibold text-ink tracking-tight">SmartATS</span>
        </div>

        {/* 3 Links */}
        <nav className="hidden md:flex items-center gap-8 text-[14px] font-medium text-ink-muted">
          <a href="#scoring" className="hover:text-ink transition-colors">
            Scoring
          </a>
          <a href="#features" className="hover:text-ink transition-colors">
            Features
          </a>
          <a href="#workflow" className="hover:text-ink transition-colors">
            Workflow
          </a>
        </nav>

        {/* Action Button */}
        <div className="flex items-center gap-3">
          <Button variant="primary" size="sm" onClick={onEnterApp}>
            Open the studio
          </Button>
        </div>
      </div>
    </header>
  );
}
