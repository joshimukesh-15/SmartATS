import { describe, it, expect } from 'vitest';
import { STAGES, STAGE_CONFIG, getStageConfig } from './constants';

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
});
