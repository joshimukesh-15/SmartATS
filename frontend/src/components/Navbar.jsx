import React from 'react';
import {
  LayoutDashboard,
  Briefcase,
  UploadCloud,
  Award,
  GitCompare,
  BarChart3,
  Globe,
  Sparkles,
} from 'lucide-react';

export default function Navbar({ activeTab, setActiveTab }) {
  const tabs = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'jobs', label: 'Job Openings', icon: Briefcase },
    { id: 'upload', label: 'Upload Resumes', icon: UploadCloud },
    { id: 'rankings', label: 'Leaderboard', icon: Award },
    { id: 'compare', label: 'Compare', icon: GitCompare },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#E2E8F0]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Brand */}
          <div className="flex items-center space-x-3.5">
            <button
              onClick={() => setActiveTab('landing')}
              title="Return to Product Landing Page"
              className="flex items-center space-x-3 text-left focus:outline-none group"
            >
              <div className="w-8 h-8 rounded-lg bg-[#059669] flex items-center justify-center text-white transition-transform group-hover:scale-105 shadow-xs">
                <span className="font-bold text-sm tracking-tight">S</span>
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-base font-bold tracking-tight text-[#0F172A] group-hover:text-[#059669] transition-colors">
                    SmartATS
                  </span>
                  <span className="text-[10px] uppercase font-mono font-semibold tracking-wider px-2 py-0.5 rounded-full border border-[#E2E8F0] bg-[#F1F5F9] text-[#475569]">
                    Studio
                  </span>
                </div>
                <p className="text-[11px] text-[#64748B]">
                  Explainable Resume Matching
                </p>
              </div>
            </button>
          </div>

          {/* Navigation Items */}
          <div className="flex items-center space-x-2">
            <nav className="flex space-x-1 sm:space-x-1.5" aria-label="Main Navigation">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center space-x-2 px-3 py-1.5 rounded-full text-xs font-semibold tracking-wide transition-all active:scale-[0.98] ${
                      isActive
                        ? 'bg-[#0F172A] text-white shadow-xs'
                        : 'text-[#475569] hover:text-[#0F172A] hover:bg-[#F1F5F9]'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span className="hidden md:inline">{tab.label}</span>
                  </button>
                );
              })}
            </nav>

            <div className="h-5 w-px bg-[#E2E8F0] mx-1 hidden sm:block"></div>

            <button
              onClick={() => setActiveTab('landing')}
              className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium border border-[#E2E8F0] bg-white hover:bg-[#F8FAFC] active:scale-[0.98] text-[#475569] hover:text-[#0F172A] transition-all shadow-xs focus:outline-none focus:ring-2 focus:ring-[#CBD5E1]"
            >
              <Globe className="w-3.5 h-3.5 text-[#64748B]" />
              <span className="hidden sm:inline">Landing Page</span>
            </button>
          </div>

        </div>
      </div>
    </header>
  );
}
