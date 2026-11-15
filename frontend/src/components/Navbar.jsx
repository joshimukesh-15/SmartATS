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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-[#FBF7F2]/95 backdrop-blur-md border-b border-[#E8DDD0]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Brand */}
          <div className="flex items-center space-x-3.5">
            <button
              onClick={() => handleTabClick('landing')}
              title="Return to Product Landing Page"
              className="flex items-center space-x-3 text-left focus:outline-none group"
            >
              <div className="w-8 h-8 rounded-lg bg-[#7B1E3A] flex items-center justify-center text-[#F7EDD8] transition-transform group-hover:scale-105 shadow-xs">
                <span className="font-serif font-bold text-sm tracking-tight">S</span>
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-base font-serif font-bold tracking-tight text-[#2A1015] group-hover:text-[#7B1E3A] transition-colors">
                    SmartATS
                  </span>
                  <span className="text-[10px] uppercase font-mono font-semibold tracking-wider px-2 py-0.5 rounded-full border border-[#E8DDD0] bg-[#F7EDD8] text-[#8A6420]">
                    Studio
                  </span>
                </div>
                <p className="text-[11px] text-[#6B5A55]">
                  Explainable Resume Matching
                </p>
              </div>
            </button>
          </div>

          {/* Desktop Navigation Items */}
          <div className="hidden lg:flex items-center space-x-2">
            <nav className="flex space-x-1" aria-label="Main Navigation">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => handleTabClick(tab.id)}
                    className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-full text-xs font-semibold tracking-wide transition-all active:scale-[0.98] ${
                      isActive
                        ? 'bg-[#F8ECEF] text-[#7B1E3A] border border-[#7B1E3A]/20 shadow-xs'
                        : 'text-[#6B5A55] hover:text-[#2A1015] hover:bg-[#F5EEE6]'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </nav>

            <div className="h-5 w-px bg-[#E8DDD0] mx-1"></div>

            <button
              onClick={() => handleTabClick('landing')}
              className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium border border-[#7B1E3A] bg-transparent hover:bg-[#F8ECEF] active:scale-[0.98] text-[#7B1E3A] transition-all shadow-xs"
            >
              <Globe className="w-3.5 h-3.5 text-[#B8893B]" />
              <span>Landing Page</span>
            </button>
          </div>

          {/* Mobile Hamburger Button */}
          <div className="flex items-center lg:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-[#2A1015] hover:bg-[#F5EEE6] transition-colors focus:outline-none"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-[#E8DDD0] bg-[#FBF7F2] px-4 pt-3 pb-4 space-y-1.5 shadow-md">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => handleTabClick(tab.id)}
                className={`w-full flex items-center space-x-3 px-4 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all ${
                  isActive
                    ? 'bg-[#F8ECEF] text-[#7B1E3A] border border-[#7B1E3A]/20'
                    : 'text-[#6B5A55] hover:text-[#2A1015] hover:bg-[#F5EEE6]'
                }`}
              >
                <Icon className="w-4 h-4 text-[#B8893B]" />
                <span>{tab.label}</span>
              </button>
            );
          })}

          <div className="pt-2 border-t border-[#E8DDD0]">
            <button
              onClick={() => handleTabClick('landing')}
              className="w-full flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-semibold border border-[#7B1E3A] text-[#7B1E3A] bg-transparent hover:bg-[#F8ECEF] transition-all"
            >
              <Globe className="w-4 h-4 text-[#B8893B]" />
              <span>View Product Landing Page</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
