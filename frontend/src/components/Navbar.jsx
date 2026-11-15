import React, { useState } from 'react';
import {
  LayoutDashboard,
  Briefcase,
  UploadCloud,
  Award,
  GitCompare,
  BarChart3,
  Globe,
  Menu,
  X,
} from 'lucide-react';

export default function Navbar({ activeTab, setActiveTab }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const tabs = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'jobs', label: 'Job Openings', icon: Briefcase },
    { id: 'upload', label: 'Upload Resumes', icon: UploadCloud },
    { id: 'rankings', label: 'Leaderboard', icon: Award },
    { id: 'compare', label: 'Compare', icon: GitCompare },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  ];

  const handleTabClick = (id) => {
    setActiveTab(id);
    setMobileOpen(false);
  };

  return (
    <>
      {/* Mobile Top Bar */}
      <div className="md:hidden flex items-center justify-between px-6 py-4 bg-surface border-b border-line sticky top-0 z-30">
        <button
          onClick={() => handleTabClick('landing')}
          className="flex items-center space-x-2 text-left"
        >
          <span className="font-serif text-2xl text-ink font-normal">SmartATS</span>
          <span className="text-[13px] font-mono text-ink-muted">Studio</span>
        </button>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle navigation"
          className="p-1.5 text-ink-muted hover:text-ink"
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-x-0 top-[65px] z-30 bg-surface border-b border-line p-6 space-y-2 shadow-lg">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => handleTabClick(tab.id)}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-[8px] text-[15px] font-sans transition-colors ${
                  isActive
                    ? 'bg-wine-soft text-wine font-medium'
                    : 'text-ink-muted hover:text-ink hover:bg-surface-alt'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
          <div className="pt-3 border-t border-line">
            <button
              onClick={() => handleTabClick('landing')}
              className="w-full flex items-center space-x-3 px-4 py-2 text-[14px] text-ink-muted hover:text-ink"
            >
              <Globe className="w-4 h-4" />
              <span>Back to Landing Page</span>
            </button>
          </div>
        </div>
      )}

      {/* Desktop Slim Left Sidebar (240px) */}
      <aside className="hidden md:flex flex-col justify-between w-60 min-h-screen bg-surface border-r border-line p-6 sticky top-0 z-20 flex-shrink-0">
        <div className="space-y-8">
          
          {/* Brand Wordmark Header */}
          <button
            onClick={() => handleTabClick('landing')}
            className="flex flex-col text-left group"
          >
            <span className="font-serif text-2xl text-ink font-normal tracking-tight group-hover:text-wine transition-colors">
              SmartATS
            </span>
            <span className="text-[13px] font-sans text-ink-muted mt-0.5">
              Screening Studio
            </span>
          </button>

          {/* Navigation Links */}
          <nav className="space-y-1.5" aria-label="Studio Navigation">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => handleTabClick(tab.id)}
                  className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-[8px] text-[14px] font-sans transition-colors ${
                    isActive
                      ? 'bg-wine-soft text-wine font-medium'
                      : 'text-ink-muted hover:text-ink hover:bg-surface-alt'
                  }`}
                >
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>

        </div>

        {/* Footer / System Status Area */}
        <div className="pt-6 border-t border-line space-y-3">
          <button
            onClick={() => handleTabClick('landing')}
            className="w-full flex items-center space-x-2 text-[13px] font-sans text-ink-muted hover:text-ink transition-colors"
          >
            <Globe className="w-4 h-4" />
            <span>Product Landing Page</span>
          </button>

          <div className="text-[13px] font-mono text-ink-muted/80 flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-gold" />
            <span>Deterministic Engine</span>
          </div>
        </div>
      </aside>
    </>
  );
}
