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
    finalScore: 88.0,
    skillsCoveredPercent: 90.0,
    skillsCoveredPoints: 36.0,
    textMatchPercent: 85.0,
    textMatchPoints: 17.0,
    experiencePoints: 20.0,
    educationPoints: 15.0,
    experiencePercent: 80.0,
    educationPercent: 100.0,
    weightSkills: 0.40,
    weightText: 0.20,
    weightExperience: 0.25,
    weightEducation: 0.15,
    hasMultiPillar: true,
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

  it('renders 4 point-math lines when experience/education exist (or hasMultiPillar)', () => {
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

    // Verify multi-pillar point breakdown text
    expect(screen.getByText('Multi-Pillar Point Breakdown')).toBeInTheDocument();
    expect(screen.getByText(/88\.0 pts/)).toBeInTheDocument();

    // Verify four point-math lines: Skills, Text, Experience, Education
    expect(screen.getByTestId('math-line-skills')).toBeInTheDocument();
    expect(screen.getByTestId('math-line-text')).toBeInTheDocument();
    expect(screen.getByTestId('math-line-experience')).toBeInTheDocument();
    expect(screen.getByTestId('math-line-education')).toBeInTheDocument();
    expect(screen.getByText(/0\.40 × 90\.0% = 36\.0 pts/)).toBeInTheDocument();
    expect(screen.getByText(/0\.20 × 85\.0% = 17\.0 pts/)).toBeInTheDocument();
    expect(screen.getByText(/0\.25 × 80\.0% = 20\.0 pts/)).toBeInTheDocument();
    expect(screen.getByText(/0\.15 × 100\.0% = 15\.0 pts/)).toBeInTheDocument();
  });

  it('renders 2 point-math lines when 2-pillar and experience/education do not exist', () => {
    const mockDualBreakdown = {
      finalScore: 88.0,
      skillsCoveredPercent: 90.0,
      skillsCoveredPoints: 54.0,
      textMatchPercent: 85.0,
      textMatchPoints: 34.0,
      experiencePoints: 0.0,
      educationPoints: 0.0,
      experiencePercent: 0.0,
      educationPercent: 0.0,
      weightSkills: 0.60,
      weightText: 0.40,
      weightExperience: 0.0,
      weightEducation: 0.0,
      hasMultiPillar: false,
    };

    const mockDualCandidate = {
      ...mockCandidate,
      experience_score: undefined,
      education_score: undefined,
      components: undefined,
    };

    render(
      <CandidateDetailPanel
        candidate={mockDualCandidate}
        breakdown={mockDualBreakdown}
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
    expect(screen.getByTestId('math-line-skills')).toBeInTheDocument();
    expect(screen.getByTestId('math-line-text')).toBeInTheDocument();
    expect(screen.queryByTestId('math-line-experience')).toBeNull();
    expect(screen.queryByTestId('math-line-education')).toBeNull();
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
