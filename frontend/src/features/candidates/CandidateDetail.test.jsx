import { screen, fireEvent } from '@testing-library/react';
import { renderWithQueryClient as render } from '../../test-utils/renderWithQueryClient';
import { describe, it, expect, vi } from 'vitest';
import CandidateDetail from './CandidateDetail';

describe('CandidateDetail component', () => {
  const mockCandidate = {
    application_id: 'app-unified-1',
    candidate_name: 'Sarah Jenkins',
    candidate_email: 'sarah.jenkins@example.com',
    candidate_phone: '+1 555-0199',
    rank: 1,
    review_stage: 'Interviewing',
    experience_years: 6,
    seniority_level: 'Senior',
    education_level: "Master's",
    education_degree: 'M.S. Computer Science',
    matched_skills: ['Python', 'FastAPI'],
    missing_skills: ['Docker'],
    preferred_matched_skills: ['AWS'],
    notes: [
      {
        note_id: 1,
        content: 'Solid technical background in systems design.',
        author: 'Lead Interviewer',
        created_at: '2026-11-15T10:00:00Z',
      },
    ],
    status_history: [
      {
        history_id: 1,
        from_stage: 'Reviewing',
        to_stage: 'Interviewing',
        changed_by: 'Recruiter',
        created_at: '2026-11-16T10:00:00Z',
      },
    ],
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

  it('renders candidate header with avatar, rank badge, contact pills, and 96px animated score ring', () => {
    const { container } = render(
      <CandidateDetail
        candidate={mockCandidate}
        breakdown={mockBreakdown}
        activeJob={mockJob}
        safeSelectedIndex={0}
        selectedForCompare={[]}
        onToggleCompare={vi.fn()}
      />
    );

    // Verify candidate identity & header elements
    expect(screen.getAllByText('Sarah Jenkins').length).toBeGreaterThan(0);
    expect(screen.getByText('sarah.jenkins@example.com')).toBeInTheDocument();
    expect(screen.getByText('+1 555-0199')).toBeInTheDocument();
    expect(screen.getByText('Rank #1')).toBeInTheDocument();
    expect(screen.getByText('SJ')).toBeInTheDocument();
    expect(screen.getByText(/6 yrs exp/)).toBeInTheDocument();
    expect(screen.getByText(/M\.S\. Computer Science/)).toBeInTheDocument();

    // Verify 96px SVG score ring presence
    const svgRing = container.querySelector('svg[width="96"][height="96"]');
    expect(svgRing).toBeInTheDocument();

    // Recommendation pill
    expect(screen.getByText('Strong Match')).toBeInTheDocument();
  });

  it('renders multi-pillar point math lines and breakdown', () => {
    render(
      <CandidateDetail
        candidate={mockCandidate}
        breakdown={mockBreakdown}
        activeJob={mockJob}
      />
    );

    expect(screen.getByText('Multi-Pillar Point Breakdown')).toBeInTheDocument();
    expect(screen.getByTestId('point-math-lines')).toBeInTheDocument();
    expect(screen.getByTestId('math-line-skills')).toBeInTheDocument();
    expect(screen.getByTestId('math-line-text')).toBeInTheDocument();
    expect(screen.getByTestId('math-line-experience')).toBeInTheDocument();
    expect(screen.getByTestId('math-line-education')).toBeInTheDocument();
  });

  it('renders 2 point-math lines when 2-pillar dual-track breakdown is provided', () => {
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
      <CandidateDetail
        candidate={mockDualCandidate}
        breakdown={mockDualBreakdown}
        activeJob={mockJob}
      />
    );

    expect(screen.getByText('Dual-Track Point Breakdown')).toBeInTheDocument();
    expect(screen.getByTestId('math-line-skills')).toBeInTheDocument();
    expect(screen.getByTestId('math-line-text')).toBeInTheDocument();
    expect(screen.queryByTestId('math-line-experience')).toBeNull();
    expect(screen.queryByTestId('math-line-education')).toBeNull();
    expect(screen.getAllByText(/0\.60 × 90\.0% = 54\.0 pts/).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/0\.40 × 85\.0% = 34\.0 pts/).length).toBeGreaterThan(0);
  });

  it('embeds PipelineStageControl and handles stage transitions, prompts, and rejection', () => {
    const onStageButtonClick = vi.fn();
    const onConfirmStageUpdate = vi.fn();
    const setShowTransitionPrompt = vi.fn();

    const { rerender } = render(
      <CandidateDetail
        candidate={mockCandidate}
        breakdown={mockBreakdown}
        activeJob={mockJob}
        onStageButtonClick={onStageButtonClick}
        onConfirmStageUpdate={onConfirmStageUpdate}
        showTransitionPrompt={false}
        setShowTransitionPrompt={setShowTransitionPrompt}
      />
    );

    expect(screen.getByText('Recruitment Stage')).toBeInTheDocument();
    const offerButton = screen.getByRole('button', { name: /Advance to stage 4: Offer/i });
    expect(offerButton).toBeInTheDocument();

    fireEvent.click(offerButton);
    expect(onStageButtonClick).toHaveBeenCalledWith('Offer');

    // Click 'Mark Rejected'
    const rejectButton = screen.getByRole('button', { name: /Mark Rejected/i });
    fireEvent.click(rejectButton);
    expect(onStageButtonClick).toHaveBeenCalledWith('Rejected');

    // Rerender with transition prompt open
    rerender(
      <CandidateDetail
        candidate={mockCandidate}
        breakdown={mockBreakdown}
        activeJob={mockJob}
        onStageButtonClick={onStageButtonClick}
        onConfirmStageUpdate={onConfirmStageUpdate}
        showTransitionPrompt={true}
        setShowTransitionPrompt={setShowTransitionPrompt}
        targetStage="Offer"
        transitionNote="Ready for verbal offer"
        setTransitionNote={vi.fn()}
      />
    );

    expect(screen.getByText('Move candidate to:')).toBeInTheDocument();
    expect(screen.getAllByText('Offer').length).toBeGreaterThan(0);

    const confirmButton = screen.getByRole('button', { name: /Confirm Move/i });
    fireEvent.click(confirmButton);
    expect(onConfirmStageUpdate).toHaveBeenCalled();

    // Rerender with Rejected candidate and test Reopen
    rerender(
      <CandidateDetail
        candidate={{ ...mockCandidate, review_stage: 'Rejected' }}
        breakdown={mockBreakdown}
        activeJob={mockJob}
        onStageButtonClick={onStageButtonClick}
      />
    );

    const reopenButton = screen.getByRole('button', { name: /Reopen candidate/i });
    expect(reopenButton).toBeInTheDocument();
    fireEvent.click(reopenButton);
    expect(onStageButtonClick).toHaveBeenCalledWith('Reviewing');
  });

  it('allows switching between tabs (evaluation, skills, activity) and submitting notes', () => {
    const onAddNote = vi.fn();
    const setNewNoteContent = vi.fn();

    const { rerender } = render(
      <CandidateDetail
        candidate={mockCandidate}
        breakdown={mockBreakdown}
        activeJob={mockJob}
        onAddNote={onAddNote}
        newNoteContent=""
        setNewNoteContent={setNewNoteContent}
      />
    );

    // Initial tab is evaluation
    expect(screen.getByText('Profile Strengths')).toBeInTheDocument();

    // Switch to Skills tab
    const skillsTabButton = screen.getByRole('button', { name: /Required Skills/i });
    fireEvent.click(skillsTabButton);
    expect(screen.getByText('Required Skill Verification')).toBeInTheDocument();
    expect(screen.getAllByText('Found in resume').length).toBeGreaterThan(0);
    expect(screen.getByText('Missing')).toBeInTheDocument();

    // Switch to Notes & Activity tab
    const activityTabButton = screen.getByRole('button', { name: /Notes & Activity/i });
    fireEvent.click(activityTabButton);
    expect(screen.getByText('Add Recruiter Note')).toBeInTheDocument();
    expect(screen.getByText('Solid technical background in systems design.')).toBeInTheDocument();

    // Type into note textarea
    const textarea = screen.getByPlaceholderText(/Add recruiter interview feedback or screening note/i);
    fireEvent.change(textarea, { target: { value: 'Candidate showed great leadership in the system design loop.' } });
    expect(setNewNoteContent).toHaveBeenCalledWith('Candidate showed great leadership in the system design loop.');

    // Rerender with newNoteContent populated and click Add Note
    rerender(
      <CandidateDetail
        candidate={mockCandidate}
        breakdown={mockBreakdown}
        activeJob={mockJob}
        dossierTab="activity"
        onAddNote={onAddNote}
        newNoteContent="Candidate showed great leadership in the system design loop."
        setNewNoteContent={setNewNoteContent}
      />
    );

    const addNoteBtn = screen.getByRole('button', { name: /Add Note/i });
    expect(addNoteBtn).not.toBeDisabled();
    fireEvent.click(addNoteBtn);
    expect(onAddNote).toHaveBeenCalled();
  });

  it('renders weights tuner button when onOpenWeightsTuner callback is passed', () => {
    const onOpenWeightsTuner = vi.fn();
    render(
      <CandidateDetail
        candidate={mockCandidate}
        breakdown={mockBreakdown}
        activeJob={mockJob}
        onOpenWeightsTuner={onOpenWeightsTuner}
      />
    );

    const tuneButton = screen.getByRole('button', { name: /Tune Weights/i });
    expect(tuneButton).toBeInTheDocument();
    fireEvent.click(tuneButton);
    expect(onOpenWeightsTuner).toHaveBeenCalled();
  });
});
