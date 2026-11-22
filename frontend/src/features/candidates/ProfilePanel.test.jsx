import { screen, fireEvent } from '@testing-library/react';
import { renderWithQueryClient as render } from '../../test-utils/renderWithQueryClient';
import { describe, it, expect, vi } from 'vitest';
import ProfilePanel from './components/ProfilePanel';

describe('ProfilePanel component', () => {
  const mockCandidate = {
    application_id: 'app-unified-1',
    candidate_name: 'Resume Updated Sarah Jenkins',
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

  it('renders sticky header with avatar, clean sanitized display name, rank tag, stage tag, and action buttons', () => {
    const onToggleCompare = vi.fn();
    render(
      <ProfilePanel
        candidate={mockCandidate}
        breakdown={mockBreakdown}
        activeJob={mockJob}
        selectedIndex={0}
        compared={false}
        onToggleCompare={onToggleCompare}
        workflow={{}}
      />
    );

    // Verify sanitized clean display name (stripped "Resume Updated")
    expect(screen.getByRole('heading', { name: 'Sarah Jenkins' })).toBeInTheDocument();
    expect(screen.getByText('SJ')).toBeInTheDocument();
    expect(screen.getByText(/6 years, Senior/)).toBeInTheDocument();
    expect(screen.getByText(/sarah.jenkins@example.com/)).toBeInTheDocument();
    expect(screen.getByText('Rank #1')).toBeInTheDocument();
    expect(screen.getAllByText('Interviewing').length).toBeGreaterThan(0);

    // Verify action buttons
    expect(screen.getByRole('button', { name: /Preview/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Download/i })).toBeInTheDocument();
    const compareBtn = screen.getByRole('button', { name: /Add to compare/i });
    expect(compareBtn).toBeInTheDocument();

    fireEvent.click(compareBtn);
    expect(onToggleCompare).toHaveBeenCalled();
  });

  it('renders one ScoreCard with big final score, 4-segment bar, and breakdown table', () => {
    render(
      <ProfilePanel
        candidate={mockCandidate}
        breakdown={mockBreakdown}
        activeJob={mockJob}
        selectedIndex={0}
      />
    );

    expect(screen.getByText('Score breakdown')).toBeInTheDocument();
    expect(screen.getByText('88.0')).toBeInTheDocument();
    expect(screen.getByText('out of 100 points')).toBeInTheDocument();

    // Breakdown table parts and points
    expect(screen.getByText('Skills covered')).toBeInTheDocument();
    expect(screen.getByText('Text match')).toBeInTheDocument();
    expect(screen.getByText('Experience')).toBeInTheDocument();
    expect(screen.getByText('Education')).toBeInTheDocument();

    expect(screen.getByText('36.0')).toBeInTheDocument();
    expect(screen.getByText('17.0')).toBeInTheDocument();
  });

  it('renders PipelineStepper in a single row with 6 stages and opens inline note prompt on stage click', () => {
    const handleStageButtonClick = vi.fn();
    const handleConfirmStageUpdate = vi.fn();
    const handleCancelTransition = vi.fn();
    const setTransitionNote = vi.fn();

    const mockWorkflow = {
      handleStageButtonClick,
      handleConfirmStageUpdate,
      handleCancelTransition,
      showTransitionPrompt: false,
      targetStage: 'Offer',
      transitionNote: '',
      setTransitionNote,
      isUpdatingStage: false,
    };

    const { rerender } = render(
      <ProfilePanel
        candidate={mockCandidate}
        breakdown={mockBreakdown}
        activeJob={mockJob}
        selectedIndex={0}
        workflow={mockWorkflow}
      />
    );

    // Verify all 6 stages are present in single row
    expect(screen.getByRole('button', { name: 'New' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Reviewing' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Interviewing' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Offer' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Hired' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Reject' })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Offer' }));
    expect(handleStageButtonClick).toHaveBeenCalledWith('Offer');

    // Rerender with transition note prompt open
    rerender(
      <ProfilePanel
        candidate={mockCandidate}
        breakdown={mockBreakdown}
        activeJob={mockJob}
        selectedIndex={0}
        workflow={{
          ...mockWorkflow,
          showTransitionPrompt: true,
          targetStage: 'Offer',
          transitionNote: 'Ready for verbal offer',
        }}
      />
    );

    expect(screen.getByText('Move to Offer')).toBeInTheDocument();
    const noteInput = screen.getByLabelText('Transition note');
    expect(noteInput).toBeInTheDocument();

    const confirmBtn = screen.getByRole('button', { name: 'Confirm' });
    fireEvent.click(confirmBtn);
    expect(handleConfirmStageUpdate).toHaveBeenCalled();
  });

  it('derives strengths and gaps from breakdown and hides card when empty', () => {
    render(
      <ProfilePanel
        candidate={mockCandidate}
        breakdown={mockBreakdown}
        activeJob={mockJob}
        selectedIndex={0}
      />
    );

    // mockBreakdown has SkillsCovered 90% (>=80), TextMatch 85% (>=80), Exp 80% (>=80), Edu 100% (>=80) -> Strengths
    expect(screen.getByText('Strengths')).toBeInTheDocument();
    expect(screen.getByText(/Skills covered is a strong match at 90%/)).toBeInTheDocument();

    // Gaps card is hidden because none are < 40% and no gaps in candidate
    expect(screen.queryByText('Gaps to review')).not.toBeInTheDocument();
    expect(screen.queryByText('No gaps flagged.')).not.toBeInTheDocument();
  });

  it('allows switching between Evaluation, Skills, and Activity tabs using normal page scroll', () => {
    render(
      <ProfilePanel
        candidate={mockCandidate}
        breakdown={mockBreakdown}
        activeJob={mockJob}
        selectedIndex={0}
        workflow={{
          newNoteContent: '',
          setNewNoteContent: vi.fn(),
          handleAddNote: vi.fn(),
          isAddingNote: false,
        }}
      />
    );

    // Initial tab is Evaluation
    expect(screen.getByText('Score breakdown')).toBeInTheDocument();

    // Switch to Skills tab
    const skillsTab = screen.getByRole('tab', { name: 'Skills' });
    fireEvent.click(skillsTab);
    expect(screen.getByText('Required skills')).toBeInTheDocument();
    expect(screen.getAllByText('Found in resume').length).toBeGreaterThan(0);
    expect(screen.getByText('Missing')).toBeInTheDocument();

    // Switch to Activity tab
    const activityTab = screen.getByRole('tab', { name: 'Activity' });
    fireEvent.click(activityTab);
    expect(screen.getByText('Notes and activity')).toBeInTheDocument();
    expect(screen.getByText('Solid technical background in systems design.')).toBeInTheDocument();
  });
});
