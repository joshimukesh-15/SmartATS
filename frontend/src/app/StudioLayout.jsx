import { useState, useEffect, Suspense } from 'react';
import { Outlet, useLocation, useNavigate, Link } from 'react-router-dom';
import { Search, Plus, UploadCloud, GitCompare } from 'lucide-react';
import Navbar from '../components/Navbar';
import { CommandPalette } from '../components/CommandPalette';
import { Button } from '../components/ui/Button';
import { Kbd } from '../components/ui/Kbd';
import { ErrorBoundary } from './ErrorBoundary';
import { RouteSkeleton } from './RouteSkeleton';

const ROUTE_TITLES = {
  '/studio': 'Overview',
  '/studio/': 'Overview',
  '/studio/jobs': 'Jobs',
  '/studio/upload': 'Upload',
  '/studio/candidates': 'Candidates',
  '/studio/leaderboard': 'Leaderboard',
  '/studio/review': 'Pipeline',
  '/studio/compare': 'Compare',
  '/studio/analytics': 'Analytics',
};

export default function StudioLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);

  // Listen for unauthorized 401 events and redirect to login
  useEffect(() => {
    const handleUnauthorized = () => {
      navigate('/login', { state: { from: location }, replace: true });
    };
    window.addEventListener('smartats:unauthorized', handleUnauthorized);
    return () => {
      window.removeEventListener('smartats:unauthorized', handleUnauthorized);
    };
  }, [navigate, location]);

  // Derive breadcrumb title
  const currentPath = location.pathname.replace(/\/$/, '');
  const isLeaderboardPage = currentPath.startsWith('/studio/leaderboard');
  const isCandidateWorkspace = currentPath.startsWith('/studio/candidates');
  const isRecruitingWorkspace = isLeaderboardPage || isCandidateWorkspace;
  let pageTitle = ROUTE_TITLES[currentPath];
  if (!pageTitle) {
    if (currentPath.startsWith('/studio/jobs')) pageTitle = 'Jobs';
    else if (currentPath.startsWith('/studio/upload')) pageTitle = 'Upload';
    else if (currentPath.startsWith('/studio/candidates')) pageTitle = 'Candidates';
    else if (currentPath.startsWith('/studio/leaderboard')) pageTitle = 'Leaderboard';
    else if (currentPath.startsWith('/studio/review')) pageTitle = 'Pipeline';
    else if (currentPath.startsWith('/studio/compare')) pageTitle = 'Compare';
    else if (currentPath.startsWith('/studio/analytics')) pageTitle = 'Analytics';
    else pageTitle = 'Studio';
  }

  // Derive contextual primary page action
  const renderPrimaryAction = () => {
    if (location.pathname.includes('/studio/jobs')) {
      return (
        <Button
          variant="primary"
          size="sm"
          leftIcon={<Plus className="w-4 h-4" strokeWidth={1.75} />}
          onClick={() => {
            window.dispatchEvent(new CustomEvent('smartats:open-create-job'));
          }}
        >
          New opening
        </Button>
      );
    }
    if (location.pathname.includes('/studio/upload')) {
      return (
        <Button
          variant="primary"
          size="sm"
          leftIcon={<UploadCloud className="w-4 h-4" strokeWidth={1.75} />}
          onClick={() => navigate('/studio/upload')}
        >
          Upload resumes
        </Button>
      );
    }
    if (location.pathname.includes('/studio/leaderboard') || location.pathname.includes('/studio/candidates')) {
      return (
        <Button
          variant="secondary"
          size="sm"
          leftIcon={<GitCompare className="w-4 h-4" strokeWidth={1.75} />}
          onClick={() => navigate('/studio/compare')}
        >
          Compare finalists
        </Button>
      );
    }
    // Default action (Overview, etc.)
    return (
      <Button
        variant="primary"
        size="sm"
        leftIcon={<UploadCloud className="w-4 h-4" strokeWidth={1.75} />}
        onClick={() => navigate('/studio/upload')}
      >
        Upload
      </Button>
    );
  };

  return (
    <div className="min-h-screen bg-canvas text-ink flex flex-col md:flex-row font-sans selection:bg-primary selection:text-on-primary">
      {/* 232px Sidebar */}
      <Navbar />

      {/* Main Studio View Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Bar with Breadcrumb, Search Input with <Kbd>, and Primary Action */}
        <header className="h-14 border-b border-line bg-surface/80 backdrop-blur-xl px-6 sm:px-8 flex items-center justify-between sticky top-0 z-20">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-[13px] text-ink-muted select-none">
            <Link to="/studio" className="hover:text-ink transition-colors font-medium">
              Studio
            </Link>
            <span className="text-ink-subtle">/</span>
            <span className="text-ink font-semibold">{pageTitle}</span>
          </div>

          {/* Right Actions: Search with <Kbd> & Primary Page Action */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setCommandPaletteOpen(true)}
              className="flex items-center gap-2.5 px-3 py-1.5 rounded-[8px] border border-line bg-surface hover:bg-surface-alt text-[13px] text-ink-muted hover:text-ink transition-colors cursor-pointer select-none"
              title="Search screens and actions (Ctrl+K)"
            >
              <Search className="w-4 h-4 text-ink-subtle" strokeWidth={1.75} />
              <span className="hidden sm:inline">Search...</span>
              <Kbd className="hidden sm:inline">Ctrl K</Kbd>
            </button>

            {renderPrimaryAction()}
          </div>
        </header>

        {/* Content Outlet */}
        <main
          className={`flex-1 w-full mx-auto px-6 sm:px-8 lg:px-12 ${
            isRecruitingWorkspace ? 'max-w-none py-6 xl:px-8' : 'max-w-6xl py-8'
          }`}
        >
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
