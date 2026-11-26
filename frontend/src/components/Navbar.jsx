import { useState, useEffect } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Briefcase,
  UploadCloud,
  BarChart3,
  Users,
  Globe,
  Menu,
  Search,
  LogOut,
} from 'lucide-react';
import { clearAuthToken } from '../api/client';
import { ThemeToggle } from './ui/ThemeToggle';
import { Drawer } from './ui/Drawer';
import { Kbd } from './ui/Kbd';

const NAV_GROUPS = [
  {
    title: 'Workspace',
    items: [
      { path: '/studio', label: 'Overview', icon: LayoutDashboard, exact: true },
      { path: '/studio/jobs', label: 'Jobs', icon: Briefcase },
      { path: '/studio/upload', label: 'Upload', icon: UploadCloud },
      { path: '/studio/candidates', label: 'Candidates', icon: Users },
      { path: '/studio/analytics', label: 'Analytics', icon: BarChart3 },
    ],
  },
];

export default function Navbar({ activeTab: _activeTab, setActiveTab: _setActiveTab }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    clearAuthToken();
    navigate('/login', { replace: true });
  };

  const isItemActive = (item) => {
    if (item.exact) {
      return location.pathname === '/studio' || location.pathname === '/studio/';
    }
    return location.pathname.startsWith(item.path);
  };

  const handleTriggerCommandPalette = () => {
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', ctrlKey: true, bubbles: true }));
  };

  return (
    <>
      {/* Mobile Top Bar */}
      <div className="md:hidden flex items-center justify-between px-5 py-3.5 bg-surface border-b border-line sticky top-0 z-30">
        <NavLink to="/studio" className="flex items-center gap-2">
          <span className="w-6 h-6 rounded-[6px] bg-gradient-to-br from-slate-navy to-obsidian-navy dark:from-ice-cyan dark:to-cadet-steel text-white dark:text-obsidian-navy font-semibold text-[14px] flex items-center justify-center shadow-xs ring-1 ring-inset ring-white/20">
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
            <Menu className="w-5 h-5" strokeWidth={1.75} />
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      <Drawer
        isOpen={mobileOpen}
        onClose={() => setMobileOpen(false)}
        title="SmartATS Studio"
        side="left"
      >
        <div className="flex flex-col justify-between h-full space-y-6">
          <div className="space-y-6">
            {NAV_GROUPS.map((group) => (
              <div key={group.title} className="space-y-1.5">
                <div className="px-3 text-[13px] font-semibold text-ink-subtle">
                  {group.title}
                </div>
                <nav className="space-y-1">
                  {group.items.map((item) => {
                    const Icon = item.icon;
                    const active = isItemActive(item);
                    return (
                      <NavLink
                        key={item.path}
                        to={item.path}
                        onClick={() => setMobileOpen(false)}
                        className={`group relative flex items-center gap-3 px-3.5 py-2.5 rounded-[8px] text-[14px] font-medium transition-colors ${
                          active
                            ? 'bg-surface-alt text-ink font-semibold'
                            : 'text-ink-muted hover:text-ink hover:bg-surface-alt/50'
                        }`}
                      >
                        {active && (
                          <span className="absolute left-0 top-2 bottom-2 w-[3px] rounded-r-full bg-primary" />
                        )}
                        <Icon className="w-4 h-4 shrink-0" strokeWidth={1.75} />
                        <span>{item.label}</span>
                      </NavLink>
                    );
                  })}
                </nav>
              </div>
            ))}
          </div>

          <div className="pt-6 border-t border-line space-y-3">
            <button
              type="button"
              onClick={() => {
                setMobileOpen(false);
                handleTriggerCommandPalette();
              }}
              className="w-full flex items-center justify-between px-3 py-2 rounded-[8px] border border-line bg-surface hover:bg-surface-alt text-[13px] text-ink-muted transition-colors cursor-pointer"
            >
              <span className="flex items-center gap-2">
                <Search className="w-4 h-4 text-ink-subtle" strokeWidth={1.75} />
                <span>Search</span>
              </span>
              <Kbd>Ctrl K</Kbd>
            </button>
            <NavLink
              to="/"
              onClick={() => setMobileOpen(false)}
              className="flex items-center gap-3 px-3 py-2 rounded-[8px] text-[13px] text-ink-muted hover:text-ink transition-colors font-medium"
            >
              <Globe className="w-4 h-4" strokeWidth={1.75} />
              <span>Public Website</span>
            </NavLink>
            <button
              type="button"
              onClick={() => {
                setMobileOpen(false);
                handleLogout();
              }}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-[8px] text-[13px] text-ink-muted hover:text-ink hover:bg-surface-alt transition-colors font-medium cursor-pointer text-left"
            >
              <LogOut className="w-4 h-4 text-ink-subtle" strokeWidth={1.75} />
              <span>Sign out</span>
            </button>
            <div className="pt-1">
              <ThemeToggle showLabel={true} className="w-full justify-start" />
            </div>
          </div>
        </div>
      </Drawer>

      {/* Desktop 232px Sidebar */}
      <aside className="hidden md:flex flex-col justify-between w-[232px] shrink-0 min-h-screen bg-surface border-r border-line p-3.5 sticky top-0 h-screen overflow-y-auto">
        <div className="space-y-6">
          {/* Logo / Brand Header */}
          <div className="px-2 pt-1 pb-1">
            <NavLink to="/studio" className="flex items-center gap-2.5">
              <span className="w-7 h-7 rounded-[8px] bg-gradient-to-br from-slate-navy to-obsidian-navy dark:from-ice-cyan dark:to-cadet-steel text-white dark:text-obsidian-navy font-semibold text-[15px] flex items-center justify-center select-none shadow-xs ring-1 ring-inset ring-white/20">
                S
              </span>
              <div className="flex flex-col">
                <span className="text-[17px] font-semibold text-ink leading-tight tracking-tight">
                  SmartATS
                </span>
                <span className="text-[13px] text-ink-subtle leading-tight">Recruiter Studio</span>
              </div>
            </NavLink>
          </div>

          {/* Grouped Navigation Links */}
          <div className="space-y-5">
            {NAV_GROUPS.map((group) => (
              <div key={group.title} className="space-y-1">
                <div className="px-3 pb-1 text-[13px] font-semibold text-ink-subtle">
                  {group.title}
                </div>
                <nav className="space-y-0.5">
                  {group.items.map((item) => {
                    const Icon = item.icon;
                    const active = isItemActive(item);
                    return (
                      <NavLink
                        key={item.path}
                        to={item.path}
                        className={`group relative flex items-center gap-2.5 px-3 py-2 rounded-[8px] text-[14px] transition-colors select-none ${
                          active
                            ? 'bg-surface-alt text-ink font-semibold'
                            : 'text-ink-muted hover:text-ink hover:bg-surface-alt/60'
                        }`}
                      >
                        {/* 3px Primary Marker for active item */}
                        {active && (
                          <span className="absolute left-0 top-1.5 bottom-1.5 w-[3px] rounded-r-full bg-primary" />
                        )}
                        <Icon className="w-4 h-4 shrink-0" strokeWidth={1.75} />
                        <span>{item.label}</span>
                      </NavLink>
                    );
                  })}
                </nav>
              </div>
            ))}
          </div>
        </div>

        {/* Footer: Search <Kbd>, Public Site & Theme Toggle */}
        <div className="pt-3 border-t border-line space-y-2">
          {/* Command search trigger with Ctrl K */}
          <button
            type="button"
            onClick={handleTriggerCommandPalette}
            className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-[8px] border border-line bg-surface hover:bg-surface-alt text-[13px] text-ink-muted hover:text-ink transition-colors cursor-pointer select-none"
            title="Open command palette (Ctrl+K)"
          >
            <span className="flex items-center gap-2">
              <Search className="w-4 h-4 text-ink-subtle" strokeWidth={1.75} />
              <span>Search</span>
            </span>
            <Kbd>Ctrl K</Kbd>
          </button>

          <NavLink
            to="/"
            className="flex items-center gap-2 px-2.5 py-1.5 rounded-[8px] text-[13px] text-ink-muted hover:text-ink hover:bg-surface-alt/60 transition-colors font-medium"
          >
            <Globe className="w-4 h-4" strokeWidth={1.75} />
            <span>Public Website</span>
          </NavLink>

          <button
            type="button"
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-[8px] text-[13px] text-ink-muted hover:text-ink hover:bg-surface-alt/60 transition-colors font-medium cursor-pointer text-left"
            title="Log out from SmartATS Studio"
          >
            <LogOut className="w-4 h-4 text-ink-subtle" strokeWidth={1.75} />
            <span>Sign out</span>
          </button>

          <div className="pt-1 px-1">
            <ThemeToggle showLabel={true} className="w-full justify-start" />
          </div>
        </div>
      </aside>
    </>
  );
}
