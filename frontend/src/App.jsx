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
    <div className="min-h-screen bg-canvas text-ink flex flex-col md:flex-row font-sans selection:bg-wine selection:text-white">
      
      {/* Slim Left Sidebar (240px desktop, top bar on mobile) */}
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Studio View Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <main className="flex-1 w-full max-w-6xl mx-auto px-6 sm:px-8 lg:px-12 py-8 sm:py-10">
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
      </div>

    </div>
  );
}
