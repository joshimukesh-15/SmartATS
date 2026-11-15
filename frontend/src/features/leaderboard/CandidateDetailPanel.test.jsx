import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import CandidateDetailPanel from './CandidateDetailPanel';

describe('CandidateDetailPanel component', () => {
  const mockCandidate = {
    application_id: 'app-test-1',
    candidate_name: 'Sarah Jenkins',
    candidate_email: 'sarah.jenkins@example.com',
    rank: 1,
    review_stage: 'Interview',
    experience_years: 6,
    seniority_level: 'Senior',
    education_level: "Master's",
    matched_skills: ['Python', 'FastAPI'],
    missing_skills: ['Docker'],
    notes: [
      {
        note_id: 1,
        content: 'Solid technical background in systems design.',
        author: 'Lead Interviewer',
        created_at: '2026-11-15T10:00:00Z',
      },
    ],
    status_history: [],
  };

  const mockBreakdown = {
    finalScore: 92.5,
    skillsCoveredPercent: 90.0,
    skillsCoveredPoints: 54.0,
    textMatchPercent: 85.0,
    textMatchPoints: 34.0,
    experiencePoints: 3.0,
    educationPoints: 1.5,
    experiencePercent: 100.0,
    educationPercent: 100.0,
    weightSkills: 0.6,
    weightText: 0.4,
    weightExperience: 0.0,
    weightEducation: 0.0,
  };

  const mockJob = {
    job_id: 1,
    title: 'Lead Systems Engineer',
    required_skills: ['Python', 'FastAPI', 'Docker'],
  };

  it('renders candidate header, avatar, rank badge and 96px animated score ring', async () => {
    const { container } = render(
      <CandidateDetailPanel
        candidate={mockCandidate}
        breakdown={mockBreakdown}
        activeJob={mockJob}
        safeSelectedIndex={0}
        selectedForCompare={[]}
        onToggleCompare={vi.fn()}
        onStageButtonClick={vi.fn()}
        onConfirmStageUpdate={vi.fn()}
        showTransitionPrompt={false}
        setShowTransitionPrompt={vi.fn()}
        targetStage={null}
        setTargetStage={vi.fn()}
        transitionNote=""
        setTransitionNote={vi.fn()}
        isUpdatingStage={false}
        onAddNote={vi.fn()}
        newNoteContent=""
        setNewNoteContent={vi.fn()}
        isAddingNote={false}
        dossierTab="scoring"
        setDossierTab={vi.fn()}
        showAuditTrail={false}
        setShowAuditTrail={vi.fn()}
      />
    );

    // Verify candidate identity
    expect(screen.getAllByText('Sarah Jenkins').length).toBeGreaterThan(0);
    expect(screen.getAllByText('sarah.jenkins@example.com').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Rank #1').length).toBeGreaterThan(0);

    // Verify Avatar initials
    expect(screen.getByText('SJ')).toBeInTheDocument();

    // Verify 96px SVG score ring presence
    const svgRing = container.querySelector('svg[width="96"][height="96"]');
    expect(svgRing).toBeInTheDocument();
  });

  it('renders dual point-math lines showing exact formula weighting', () => {
    render(
      <CandidateDetailPanel
        candidate={mockCandidate}
        breakdown={mockBreakdown}
        activeJob={mockJob}
        safeSelectedIndex={0}
        selectedForCompare={[]}
        onToggleCompare={vi.fn()}
        onStageButtonClick={vi.fn()}
        onConfirmStageUpdate={vi.fn()}
        showTransitionPrompt={false}
        setShowTransitionPrompt={vi.fn()}
        targetStage={null}
        setTargetStage={vi.fn()}
        transitionNote=""
        setTransitionNote={vi.fn()}
        isUpdatingStage={false}
        onAddNote={vi.fn()}
        newNoteContent=""
        setNewNoteContent={vi.fn()}
        isAddingNote={false}
        dossierTab="scoring"
        setDossierTab={vi.fn()}
        showAuditTrail={false}
        setShowAuditTrail={vi.fn()}
      />
    );

    // Verify dual-track point breakdown text
    expect(screen.getByText('Dual-Track Point Breakdown')).toBeInTheDocument();
    expect(screen.getByText(/92\.5 pts/)).toBeInTheDocument();

    // Verify two point-math lines: 0.60 x 90.0% = 54.0 pts and 0.40 x 85.0% = 34.0 pts
    expect(screen.getByText(/0\.60 × 90\.0% = 54\.0 pts/)).toBeInTheDocument();
    expect(screen.getByText(/0\.40 × 85\.0% = 34\.0 pts/)).toBeInTheDocument();
  });

  it('renders required skills with Found and Missing indicators', () => {
    render(
      <CandidateDetailPanel
        candidate={mockCandidate}
        breakdown={mockBreakdown}
        activeJob={mockJob}
        safeSelectedIndex={0}
        selectedForCompare={[]}
        onToggleCompare={vi.fn()}
        onStageButtonClick={vi.fn()}
        onConfirmStageUpdate={vi.fn()}
        showTransitionPrompt={false}
        setShowTransitionPrompt={vi.fn()}
        targetStage={null}
        setTargetStage={vi.fn()}
        transitionNote=""
        setTransitionNote={vi.fn()}
        isUpdatingStage={false}
        onAddNote={vi.fn()}
        newNoteContent=""
        setNewNoteContent={vi.fn()}
        isAddingNote={false}
        dossierTab="skills"
        setDossierTab={vi.fn()}
        showAuditTrail={false}
        setShowAuditTrail={vi.fn()}
      />
    );

    expect(screen.getAllByText('Python').length).toBeGreaterThan(0);
    expect(screen.getAllByText('FastAPI').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Docker').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Found in resume').length).toBe(2);
    expect(screen.getByText('Missing')).toBeInTheDocument();
  });
});
