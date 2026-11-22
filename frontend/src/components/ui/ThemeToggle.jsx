import { useState, useEffect } from 'react';
import { Sun, Moon } from 'lucide-react';
import { STORAGE_KEYS } from '../../lib/constants';

export function ThemeToggle({ className = '', showLabel = false }) {
  const [isDark, setIsDark] = useState(() => {
    if (typeof window === 'undefined') return false;
    return document.documentElement.classList.contains('dark');
  });

  useEffect(() => {
    const handleStorageChange = () => {
      setIsDark(document.documentElement.classList.contains('dark'));
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const toggleTheme = () => {
    const nextDark = !isDark;
    setIsDark(nextDark);
    if (nextDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem(STORAGE_KEYS.THEME, 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem(STORAGE_KEYS.THEME, 'light');
    }
  };

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      className={`inline-flex items-center gap-2 px-2.5 py-1.5 rounded-[10px] text-[13px] text-ink-muted hover:text-ink hover:bg-surface-alt transition-colors cursor-pointer select-none focus-visible:outline-2 focus-visible:outline-primary ${className}`}
    >
      {isDark ? <Sun className="w-4 h-4 text-amber-500" strokeWidth={1.75} /> : <Moon className="w-4 h-4" strokeWidth={1.75} />}
      {showLabel && <span>{isDark ? 'Light theme' : 'Dark theme'}</span>}
    </button>
  );
}
