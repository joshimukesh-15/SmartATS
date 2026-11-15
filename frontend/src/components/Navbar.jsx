import React from 'react';
import {
  LayoutDashboard,
  Briefcase,
  UploadCloud,
  Award,
  GitCompare,
  BarChart3,
  Globe,
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
    <header className="sticky top-0 z-40 bg-[#FAF8F5]/95 backdrop-blur border-b border-[#E5DFD5]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18">
          
          {/* Brand */}
          <div className="flex items-center space-x-3.5">
            <button
              onClick={() => setActiveTab('landing')}
              title="Return to Product Landing Page"
              className="flex items-center space-x-3 text-left focus:outline-none"
            >
              <div className="w-9 h-9 rounded-md bg-[#1A1915] flex items-center justify-center text-[#FAF8F5] shadow-xs">
                <span className="font-serif italic text-lg font-bold">S</span>
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-serif text-xl font-bold tracking-tight text-[#1A1915]">
                    SmartATS
                  </span>
                  <span className="text-[10px] uppercase font-mono font-medium tracking-wider px-2 py-0.5 rounded border border-[#D6CEBF] bg-[#F3EFEA] text-[#59554D]">
                    Studio
                  </span>
                </div>
                <p className="text-[11px] font-sans text-[#8A8477]">
                  Deterministic Screening System
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
                    className={`flex items-center space-x-2 px-3 py-1.5 rounded-md text-xs font-semibold tracking-wide transition-all ${
                      isActive
                        ? 'bg-[#1A1915] text-[#FAF8F5] shadow-xs'
                        : 'text-[#59554D] hover:text-[#1A1915] hover:bg-[#F3EFEA]'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span className="hidden md:inline">{tab.label}</span>
                  </button>
                );
              })}
            </nav>

            <div className="h-5 w-px bg-[#E5DFD5] mx-1 hidden sm:block"></div>

            <button
              onClick={() => setActiveTab('landing')}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded text-xs font-semibold border border-[#D6CEBF] bg-white hover:bg-[#F3EFEA] text-[#1A1915] transition shadow-2xs"
            >
              <Globe className="w-3.5 h-3.5 text-[#CC5A36]" />
              <span className="hidden sm:inline">Landing Page</span>
            </button>
          </div>

        </div>
      </div>
    </header>
  );
}
