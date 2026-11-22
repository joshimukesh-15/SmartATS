import { describe, it, expect } from 'vitest';
import { STAGES, STAGE_CONFIG, getStageConfig, normalizeStage, displayName, DEFAULT_WEIGHTS } from './constants';

describe('Candidate constants', () => {
  it('exports all 6 canonical stages in correct pipeline sequence', () => {
    expect(STAGES).toEqual([
      'New',
      'Reviewing',
      'Interviewing',
      'Offer',
      'Hired',
      'Rejected',
    ]);
  });

  it('provides normalizeStage that maps Interview to Interviewing and case-insensitively resolves stages', () => {
    expect(normalizeStage('Interview')).toBe('Interviewing');
    expect(normalizeStage('interviewing')).toBe('Interviewing');
    expect(normalizeStage('hired')).toBe('Hired');
    expect(normalizeStage('')).toBe('New');
    expect(normalizeStage(null)).toBe('New');
  });

  it('exports centralized DEFAULT_WEIGHTS', () => {
    expect(DEFAULT_WEIGHTS).toEqual({
      skills: 0.40,
      text: 0.20,
      experience: 0.25,
      education: 0.15,
    });
  });

  it('provides complete STAGE_CONFIG mapping for each stage', () => {
    STAGES.forEach((stage) => {
      const cfg = STAGE_CONFIG[stage];
      expect(cfg).toBeDefined();
      expect(cfg.label).toBe(stage);
      expect(cfg.badge).toBeDefined();
      expect(cfg.color).toBeDefined();
    });
  });

  it('aliases Interview to Interviewing for backward compatibility', () => {
    expect(STAGE_CONFIG.Interview).toBeDefined();
    expect(STAGE_CONFIG.Interview.label).toBe('Interviewing');
  });

  it('getStageConfig returns config or defaults safely to New', () => {
    expect(getStageConfig('Hired').label).toBe('Hired');
    expect(getStageConfig('UnknownStage').label).toBe('New');
  });

  it('displayName cleanly strips raw filenames, file extensions, and generic resume labels', () => {
    expect(displayName('Resume Updated Sarah Jenkins')).toBe('Sarah Jenkins');
    expect(displayName('resume_john_doe.pdf')).toBe('John Doe');
    expect(displayName('jane_doe_resume_updated.docx')).toBe('Jane Doe');
    expect(displayName('2024_curriculum_vitae_alex.pdf')).toBe('Alex');
    expect(displayName('Resume Updated')).toBe('Candidate');
    expect(displayName('')).toBe('Candidate');
    expect(displayName(null)).toBe('Candidate');
    expect(displayName('Sarah Jenkins')).toBe('Sarah Jenkins');
  });
});
