import { useState, Suspense } from 'react';
import { Outlet, useLocation, useNavigate, Link } from 'react-router-dom';
import { Search, Plus, UploadCloud } from 'lucide-react';
import Navbar from '../components/Navbar';
import { CommandPalette } from '../components/CommandPalette';
import { Button } from '../components/ui/Button';
import { ErrorBoundary } from './ErrorBoundary';
import { RouteSkeleton } from './RouteSkeleton';

const ROUTE_TITLES = {
  '/studio': 'Overview',
  '/studio/': 'Overview',
  '/studio/jobs': 'Job Openings',
  '/studio/upload': 'Upload Resumes',
  '/studio/leaderboard': 'Leaderboard',
  '/studio/compare': 'Compare Candidates',
  '/studio/analytics': 'Analytics',
};

export default function StudioLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);

  // Derive breadcrumb title
  const currentPath = location.pathname.replace(/\/$/, '');
  let pageTitle = ROUTE_TITLES[currentPath];
  if (!pageTitle) {
    if (currentPath.startsWith('/studio/leaderboard')) pageTitle = 'Leaderboard';
    else if (currentPath.startsWith('/studio/compare')) pageTitle = 'Compare';
    else if (currentPath.startsWith('/studio/analytics')) pageTitle = 'Analytics';
    else pageTitle = 'Studio';
  }

  return (
    <div className="min-h-screen bg-canvas text-ink flex flex-col md:flex-row font-sans selection:bg-primary selection:text-on-primary">
      {/* 232px Sidebar */}
      <Navbar />

      {/* Main Studio View Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Bar with Breadcrumb, Search (Ctrl+K), and Page Action */}
        <header className="h-14 border-b border-line bg-surface/70 backdrop-blur-xs px-6 sm:px-8 flex items-center justify-between sticky top-0 z-20">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-[13px] text-ink-muted">
            <Link to="/studio" className="hover:text-ink transition-colors">
              Studio
            </Link>
            <span className="text-ink-subtle">/</span>
            <span className="text-ink font-medium">{pageTitle}</span>
          </div>

          {/* Right Actions: Command Palette Button & Quick Action */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setCommandPaletteOpen(true)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-[8px] border border-line bg-surface hover:bg-surface-alt text-[13px] text-ink-muted hover:text-ink transition-colors cursor-pointer select-none"
            >
              <Search className="w-3.5 h-3.5 text-ink-subtle" />
              <span className="hidden sm:inline">Search or command...</span>
              <kbd className="hidden sm:inline px-1.5 py-0.5 text-[11px] rounded-[4px] border border-line bg-surface-alt font-medium text-ink-muted">
                ⌘K
              </kbd>
            </button>

            {location.pathname.includes('/studio/jobs') ? (
              <Button
                variant="primary"
                size="sm"
                leftIcon={<Plus className="w-3.5 h-3.5" />}
                onClick={() => {
                  window.dispatchEvent(new CustomEvent('smartats:open-create-job'));
                }}
              >
                New opening
              </Button>
            ) : (
              <Button
                variant="secondary"
                size="sm"
                leftIcon={<UploadCloud className="w-3.5 h-3.5" />}
                onClick={() => navigate('/studio/upload')}
              >
                Upload
              </Button>
            )}
          </div>
        </header>

        {/* Content Outlet */}
        <main className="flex-1 w-full max-w-6xl mx-auto px-6 sm:px-8 lg:px-12 py-8">
          <ErrorBoundary>
            <Suspense fallback={<RouteSkeleton />}>
              <Outlet />
            </Suspense>
          </ErrorBoundary>
        </main>
      </div>

      {/* Command Palette */}
      <CommandPalette isOpen={commandPaletteOpen} onOpenChange={setCommandPaletteOpen} />
    </div>
  );
}
