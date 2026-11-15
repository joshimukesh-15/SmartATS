import { useState, useEffect } from 'react';
import { Button } from '../ui/Button';

export default function FloatingNav({ onEnterApp }) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 inset-x-0 z-40 transition-colors duration-200 ${
        scrolled
          ? 'bg-surface/85 backdrop-blur-md border-b border-line shadow-xs'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-[1200px] mx-auto px-6 sm:px-8 lg:px-12 h-16 flex items-center justify-between">
        {/* Wordmark Logo */}
        <div className="flex items-center gap-2.5">
          <span className="w-7 h-7 rounded-[8px] bg-primary text-on-primary font-semibold text-[14px] flex items-center justify-center select-none shadow-xs">
            S
          </span>
          <span className="text-[18px] font-semibold text-ink tracking-tight">SmartATS</span>
        </div>

        {/* 3 Navigation Links */}
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
          <a href="#faq" className="hover:text-ink transition-colors">
            FAQ
          </a>
        </nav>

        {/* Action Button */}
        <Button variant="primary" size="sm" onClick={onEnterApp}>
          Open the studio
        </Button>
      </div>
    </header>
  );
}
