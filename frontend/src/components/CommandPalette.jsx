import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Command } from 'cmdk';
import {
  LayoutDashboard,
  Briefcase,
  UploadCloud,
  Award,
  Kanban,
  GitCompare,
  BarChart3,
  Globe,
  Sun,
  Keyboard,
  Plus,
} from 'lucide-react';
import { STORAGE_KEYS } from '../lib/constants';

export function CommandPalette({ isOpen, onOpenChange, onCreateJobOpen }) {
  const [open, setOpen] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const navigate = useNavigate();

  const isControlled = isOpen !== undefined;
  const isPaletteOpen = isControlled ? isOpen : open;
  const setPaletteOpen = isControlled ? onOpenChange : setOpen;

  useEffect(() => {
    const handleKeyDown = (e) => {
      // Toggle Command Palette on Cmd+K or Ctrl+K
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setPaletteOpen((prev) => !prev);
      }
      // Toggle Shortcuts Sheet on ? (when not focusing an input)
      if (e.key === '?' && !['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName)) {
        e.preventDefault();
        setShowShortcuts((prev) => !prev);
      }
      if (e.key === 'Escape') {
        setShowShortcuts(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setPaletteOpen]);

  const runCommand = (command) => {
    setPaletteOpen(false);
    command();
  };

  const toggleTheme = () => {
    const isDark = document.documentElement.classList.contains('dark');
    if (isDark) {
      document.documentElement.classList.remove('dark');
      localStorage.setItem(STORAGE_KEYS.THEME, 'light');
    } else {
      document.documentElement.classList.add('dark');
      localStorage.setItem(STORAGE_KEYS.THEME, 'dark');
    }
  };

  return (
    <>
      {isPaletteOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4">
          <div
            className="fixed inset-0 bg-ink/40 backdrop-blur-xs animate-fadeIn"
            onClick={() => setPaletteOpen(false)}
          />
          <div className="relative w-full max-w-xl bg-surface border border-line rounded-[14px] shadow-2xl overflow-hidden text-ink z-10 animate-in fade-in zoom-in-95 duration-150">
            <Command className="w-full">
              <div className="flex items-center px-4 border-b border-line">
                <Command.Input
                  placeholder="Type a command or search screens..."
                  className="w-full h-12 bg-transparent text-[14px] text-ink placeholder:text-ink-subtle focus:outline-none"
                  autoFocus
                />
                <kbd className="px-1.5 py-0.5 text-[13px] rounded-[4px] border border-line bg-surface-alt text-ink-muted">
                  ESC
                </kbd>
              </div>

              <Command.List className="max-h-80 overflow-y-auto p-2 text-[14px]">
                <Command.Empty className="py-6 text-center text-[13px] text-ink-muted">
                  No matching results found.
                </Command.Empty>

                <Command.Group
                  heading="Navigation"
                  className="px-2 py-1.5 text-[13px] font-medium text-ink-subtle"
                >
                  <Command.Item
                    onSelect={() => runCommand(() => navigate('/studio'))}
                    className="flex items-center gap-3 px-3 py-2 rounded-[8px] cursor-pointer hover:bg-surface-alt text-ink select-none font-medium"
                  >
                    <LayoutDashboard className="w-4 h-4 text-ink-muted" strokeWidth={1.75} />
                    <span>Overview</span>
                  </Command.Item>
                  <Command.Item
                    onSelect={() => runCommand(() => navigate('/studio/jobs'))}
                    className="flex items-center gap-3 px-3 py-2 rounded-[8px] cursor-pointer hover:bg-surface-alt text-ink select-none font-medium"
                  >
                    <Briefcase className="w-4 h-4 text-ink-muted" strokeWidth={1.75} />
                    <span>Job Openings</span>
                  </Command.Item>
                  <Command.Item
                    onSelect={() => runCommand(() => navigate('/studio/upload'))}
                    className="flex items-center gap-3 px-3 py-2 rounded-[8px] cursor-pointer hover:bg-surface-alt text-ink select-none font-medium"
                  >
                    <UploadCloud className="w-4 h-4 text-ink-muted" strokeWidth={1.75} />
                    <span>Upload Resumes</span>
                  </Command.Item>
                  <Command.Item
                    onSelect={() => runCommand(() => navigate('/studio/leaderboard'))}
                    className="flex items-center gap-3 px-3 py-2 rounded-[8px] cursor-pointer hover:bg-surface-alt text-ink select-none font-medium"
                  >
                    <Award className="w-4 h-4 text-ink-muted" strokeWidth={1.75} />
                    <span>Leaderboard</span>
                  </Command.Item>
                  <Command.Item
                    onSelect={() => runCommand(() => navigate('/studio/review'))}
                    className="flex items-center gap-3 px-3 py-2 rounded-[8px] cursor-pointer hover:bg-surface-alt text-ink select-none font-medium"
                  >
                    <Kanban className="w-4 h-4 text-ink-muted" strokeWidth={1.75} />
                    <span>Pipeline</span>
                  </Command.Item>
                  <Command.Item
                    onSelect={() => runCommand(() => navigate('/studio/compare'))}
                    className="flex items-center gap-3 px-3 py-2 rounded-[8px] cursor-pointer hover:bg-surface-alt text-ink select-none font-medium"
                  >
                    <GitCompare className="w-4 h-4 text-ink-muted" strokeWidth={1.75} />
                    <span>Compare Candidates</span>
                  </Command.Item>
                  <Command.Item
                    onSelect={() => runCommand(() => navigate('/studio/analytics'))}
                    className="flex items-center gap-3 px-3 py-2 rounded-[8px] cursor-pointer hover:bg-surface-alt text-ink select-none font-medium"
                  >
                    <BarChart3 className="w-4 h-4 text-ink-muted" strokeWidth={1.75} />
                    <span>Analytics</span>
                  </Command.Item>
                  <Command.Item
                    onSelect={() => runCommand(() => navigate('/'))}
                    className="flex items-center gap-3 px-3 py-2 rounded-[8px] cursor-pointer hover:bg-surface-alt text-ink select-none font-medium"
                  >
                    <Globe className="w-4 h-4 text-ink-muted" strokeWidth={1.75} />
                    <span>Landing Page</span>
                  </Command.Item>
                </Command.Group>

                <Command.Group
                  heading="Quick Actions"
                  className="px-2 py-1.5 text-[13px] font-medium text-ink-subtle mt-2"
                >
                  <Command.Item
                    onSelect={() =>
                      runCommand(() => {
                        navigate('/studio/jobs');
                        if (onCreateJobOpen) onCreateJobOpen();
                      })
                    }
                    className="flex items-center gap-3 px-3 py-2 rounded-[8px] cursor-pointer hover:bg-surface-alt text-ink select-none font-medium"
                  >
                    <Plus className="w-4 h-4 text-ink-muted" strokeWidth={1.75} />
                    <span>Create new job opening</span>
                  </Command.Item>
                  <Command.Item
                    onSelect={() => runCommand(() => navigate('/studio/upload'))}
                    className="flex items-center gap-3 px-3 py-2 rounded-[8px] cursor-pointer hover:bg-surface-alt text-ink select-none font-medium"
                  >
                    <UploadCloud className="w-4 h-4 text-ink-muted" strokeWidth={1.75} />
                    <span>Upload resumes</span>
                  </Command.Item>
                  <Command.Item
                    onSelect={() => runCommand(toggleTheme)}
                    className="flex items-center gap-3 px-3 py-2 rounded-[8px] cursor-pointer hover:bg-surface-alt text-ink select-none font-medium"
                  >
                    <Sun className="w-4 h-4 text-ink-muted" strokeWidth={1.75} />
                    <span>Toggle light / dark theme</span>
                  </Command.Item>
                  <Command.Item
                    onSelect={() => runCommand(() => setShowShortcuts(true))}
                    className="flex items-center gap-3 px-3 py-2 rounded-[8px] cursor-pointer hover:bg-surface-alt text-ink select-none font-medium"
                  >
                    <Keyboard className="w-4 h-4 text-ink-muted" strokeWidth={1.75} />
                    <span>Keyboard shortcuts</span>
                    <kbd className="ml-auto text-[13px] px-1.5 py-0.5 rounded-[4px] border border-line bg-surface-alt text-ink-muted">
                      ?
                    </kbd>
                  </Command.Item>
                </Command.Group>
              </Command.List>
            </Command>
          </div>
        </div>
      )}

      {/* Shortcuts Cheat Sheet Modal */}
      {showShortcuts && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-ink/40 backdrop-blur-xs"
            onClick={() => setShowShortcuts(false)}
          />
          <div className="relative w-full max-w-md bg-surface border border-line rounded-[14px] shadow-2xl p-6 text-ink z-10 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-line">
              <div className="flex items-center gap-2">
                <Keyboard className="w-4 h-4 text-ink-muted" />
                <h3 className="text-[16px] font-semibold text-ink">Keyboard Shortcuts</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowShortcuts(false)}
                className="text-[13px] text-ink-muted hover:text-ink cursor-pointer"
              >
                Close
              </button>
            </div>
            <div className="space-y-2.5 text-[13px]">
              <div className="flex items-center justify-between py-1">
                <span className="text-ink-muted">Open command palette</span>
                <kbd className="px-2 py-0.5 rounded-[4px] border border-line bg-surface-alt font-medium">
                  Ctrl + K / ⌘K
                </kbd>
              </div>
              <div className="flex items-center justify-between py-1">
                <span className="text-ink-muted">Toggle shortcut cheat sheet</span>
                <kbd className="px-2 py-0.5 rounded-[4px] border border-line bg-surface-alt font-medium">
                  ?
                </kbd>
              </div>
              <div className="flex items-center justify-between py-1">
                <span className="text-ink-muted">Navigate leaderboard selection</span>
                <kbd className="px-2 py-0.5 rounded-[4px] border border-line bg-surface-alt font-medium">
                  ↑ / ↓
                </kbd>
              </div>
              <div className="flex items-center justify-between py-1">
                <span className="text-ink-muted">Dismiss dialog / modal</span>
                <kbd className="px-2 py-0.5 rounded-[4px] border border-line bg-surface-alt font-medium">
                  ESC
                </kbd>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
