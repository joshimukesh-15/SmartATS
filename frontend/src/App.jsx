import React, { useState } from 'react';
import Navbar from './components/Navbar';
import OverviewView from './components/OverviewView';
import JobsView from './components/JobsView';
import UploadView from './components/UploadView';
import RankingsView from './components/RankingsView';
import CompareView from './components/CompareView';
import AnalyticsView from './components/AnalyticsView';
import CandidateModal from './components/CandidateModal';
import LandingPageView from './components/LandingPageView';

export default function App() {
  const [activeTab, setActiveTab] = useState('landing');
  const [selectedJobId, setSelectedJobId] = useState(null);
  const [modalCandidate, setModalCandidate] = useState(null);
  const [compareData, setCompareData] = useState({ jobId: null, appIds: [] });

  const handleSelectJobForRankings = (jobId) => {
    setSelectedJobId(jobId);
    setActiveTab('rankings');
  };

  const handleCompareCandidates = (jobId, appIds) => {
    setCompareData({ jobId, appIds });
    setActiveTab('compare');
  };

  if (activeTab === 'landing') {
    return <LandingPageView onLaunchApp={() => setActiveTab('overview')} />;
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#0F172A] flex flex-col font-sans selection:bg-[#0F172A] selection:text-white">
      
      {/* Navigation */}
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        {activeTab === 'overview' && (
          <OverviewView
            setActiveTab={setActiveTab}
            onSelectJobForRankings={handleSelectJobForRankings}
            onViewCandidate={(c) => setModalCandidate(c)}
          />
        )}

        {activeTab === 'jobs' && (
          <JobsView
            setActiveTab={setActiveTab}
            onSelectJobForRankings={handleSelectJobForRankings}
          />
        )}

        {activeTab === 'upload' && (
          <UploadView
            selectedJobId={selectedJobId}
            onSelectJobForRankings={handleSelectJobForRankings}
          />
        )}

        {activeTab === 'rankings' && (
          <RankingsView
            selectedJobId={selectedJobId}
            onViewCandidate={(c) => setModalCandidate(c)}
            onCompareCandidates={handleCompareCandidates}
          />
        )}

        {activeTab === 'compare' && (
          <CompareView
            jobId={compareData.jobId || selectedJobId}
            preselectedAppIds={compareData.appIds}
            setActiveTab={setActiveTab}
          />
        )}

        {activeTab === 'analytics' && (
          <AnalyticsView selectedJobId={selectedJobId} />
        )}
      </main>

      {/* Explainable Candidate Modal */}
      {modalCandidate && (
        <CandidateModal
          candidate={modalCandidate}
          onClose={() => setModalCandidate(null)}
        />
      )}

      {/* Footer */}
      <footer className="border-t border-[#E2E8F0] py-8 text-center text-xs text-[#64748B] bg-white">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center space-x-2 text-sm text-[#0F172A]">
            <span className="font-bold">SmartATS</span>
            <span className="text-[#64748B] text-xs">&mdash; Enterprise Candidate Screening Platform</span>
          </div>
          <div className="flex items-center space-x-3 font-mono text-[11px] text-[#64748B]">
            <span>Deterministic Scoring</span>
            <span>&bull;</span>
            <span>Local SHA-256 Deduplication</span>
            <span>&bull;</span>
            <span>Zero Hallucinations</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
