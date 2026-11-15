import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Briefcase,
  UploadCloud,
  Award,
  UserCheck,
  GitCompare,
  BarChart3,
  Globe,
  Menu,
} from 'lucide-react';
import { ThemeToggle } from './ui/ThemeToggle';
import { Drawer } from './ui/Drawer';

const NAV_ITEMS = [
  { path: '/studio', label: 'Overview', icon: LayoutDashboard, exact: true },
  { path: '/studio/jobs', label: 'Job Openings', icon: Briefcase },
  { path: '/studio/upload', label: 'Upload Resumes', icon: UploadCloud },
  { path: '/studio/leaderboard', label: 'Leaderboard', icon: Award },
  { path: '/studio/review', label: 'Candidate Review', icon: UserCheck },
  { path: '/studio/compare', label: 'Compare', icon: GitCompare },
  { path: '/studio/analytics', label: 'Analytics', icon: BarChart3 },
];

export default function Navbar({ activeTab: _activeTab, setActiveTab: _setActiveTab }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  const isItemActive = (item) => {
    if (item.exact) {
      return location.pathname === '/studio' || location.pathname === '/studio/';
    }
    return location.pathname.startsWith(item.path);
  };

  return (
    <>
      {/* Mobile Top Bar */}
      <div className="md:hidden flex items-center justify-between px-5 py-3.5 bg-surface border-b border-line sticky top-0 z-30">
        <NavLink to="/studio" className="flex items-center gap-2">
          <span className="w-6 h-6 rounded-[6px] bg-primary text-on-primary font-semibold text-[14px] flex items-center justify-center">
            S
          </span>
          <span className="text-[17px] font-semibold text-ink tracking-tight">SmartATS</span>
          <span className="text-[13px] text-ink-subtle">Studio</span>
        </NavLink>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            aria-label="Open navigation menu"
            className="p-1.5 rounded-[8px] border border-line text-ink-muted hover:text-ink hover:bg-surface-alt transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Mobile Sheet Menu */}
      <Drawer
        isOpen={mobileOpen}
        onClose={() => setMobileOpen(false)}
        title="SmartATS Studio"
        side="left"
      >
        <div className="flex flex-col justify-between h-full space-y-6">
          <nav className="space-y-1">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const active = isItemActive(item);
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-[10px] text-[14px] font-medium transition-colors ${
                    active
                      ? 'bg-surface-alt text-ink font-semibold'
                      : 'text-ink-muted hover:text-ink hover:bg-surface-alt/50'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </nav>

          <div className="pt-6 border-t border-line space-y-3">
            <NavLink
              to="/"
              onClick={() => setMobileOpen(false)}
              className="flex items-center gap-3 px-3.5 py-2 rounded-[10px] text-[13px] text-ink-muted hover:text-ink transition-colors"
            >
              <Globe className="w-4 h-4" />
              <span>Website</span>
            </NavLink>
            <div className="pt-2">
              <ThemeToggle showLabel={true} className="w-full justify-start" />
            </div>
          </div>
        </div>
      </Drawer>

      {/* Desktop 232px Sidebar */}
      <aside className="hidden md:flex flex-col justify-between w-[232px] shrink-0 min-h-screen bg-surface border-r border-line p-4 sticky top-0 h-screen overflow-y-auto">
        <div className="space-y-6">
          {/* Logo / Brand Header */}
          <div className="px-2 pt-1 pb-2">
            <NavLink to="/studio" className="flex items-center gap-2.5">
              <span className="w-7 h-7 rounded-[8px] bg-primary text-on-primary font-semibold text-[15px] flex items-center justify-center select-none shadow-xs">
                S
              </span>
              <div className="flex flex-col">
                <span className="text-[17px] font-semibold text-ink leading-tight tracking-tight">
                  SmartATS
                </span>
                <span className="text-[12px] text-ink-subtle leading-tight">Recruiter Studio</span>
              </div>
            </NavLink>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const active = isItemActive(item);
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 px-3 py-2 rounded-[10px] text-[14px] transition-colors select-none ${
                    active
                      ? 'bg-surface-alt text-ink font-semibold'
                      : 'text-ink-muted hover:text-ink hover:bg-surface-alt/60'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Footer Navigation & Theme Toggle */}
        <div className="pt-4 border-t border-line space-y-1">
          <NavLink
            to="/"
            className="flex items-center gap-2.5 px-3 py-2 rounded-[10px] text-[13px] text-ink-muted hover:text-ink hover:bg-surface-alt/60 transition-colors"
          >
            <Globe className="w-4 h-4" />
            <span>Public Site</span>
          </NavLink>
          <div className="pt-1">
            <ThemeToggle showLabel={true} className="w-full justify-start" />
          </div>
        </div>
      </aside>
    </>
  );
}
