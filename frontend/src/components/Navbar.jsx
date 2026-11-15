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
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Brand */}
          <div className="flex items-center space-x-3.5">
            <button
              onClick={() => setActiveTab('landing')}
              title="Return to Product Landing Page"
              className="flex items-center space-x-3 text-left focus:outline-none group"
            >
              <div className="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center text-white transition-transform group-hover:scale-105">
                <span className="font-bold text-sm tracking-tight">S</span>
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-base font-bold tracking-tight text-slate-900 group-hover:text-slate-700 transition-colors">
                    SmartATS
                  </span>
                  <span className="text-[10px] uppercase font-mono font-semibold tracking-wider px-2 py-0.5 rounded-full border border-slate-200 bg-slate-100 text-slate-700">
                    Studio
                  </span>
                </div>
                <p className="text-[11px] text-slate-500">
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
                        ? 'bg-slate-900 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span className="hidden md:inline">{tab.label}</span>
                  </button>
                );
              })}
            </nav>

            <div className="h-5 w-px bg-slate-200 mx-1 hidden sm:block"></div>

            <button
              onClick={() => setActiveTab('landing')}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-xs font-medium border border-slate-200 bg-white hover:bg-slate-50 active:scale-[0.98] text-slate-700 hover:text-slate-900 transition-all shadow-xs focus:outline-none focus:ring-2 focus:ring-slate-400"
            >
              <Globe className="w-3.5 h-3.5 text-slate-500" />
              <span className="hidden sm:inline">Landing Page</span>
            </button>
          </div>

        </div>
      </div>
    </header>
  );
}
