import { describe, it, expect } from 'vitest';
import { formatScore, getSkillCoverage, computeBreakdown, sortCandidates } from './score';
import {
  DEFAULT_WEIGHTS,
  DEFAULT_FORMULA_DESCRIPTION,
  WEIGHT_SKILLS,
  WEIGHT_TEXT,
  WEIGHT_EXPERIENCE,
  WEIGHT_EDUCATION,
} from './constants';

describe('score lib', () => {
  it('exports correct 4-pillar default weights and formula description constants', () => {
    expect(DEFAULT_WEIGHTS).toEqual({
      skills: 0.40,
      text: 0.20,
      experience: 0.25,
      education: 0.15,
    });
    expect(WEIGHT_SKILLS).toBe(0.40);
    expect(WEIGHT_TEXT).toBe(0.20);
    expect(WEIGHT_EXPERIENCE).toBe(0.25);
    expect(WEIGHT_EDUCATION).toBe(0.15);
    expect(DEFAULT_FORMULA_DESCRIPTION).toBe(
      'Final Score = (Skills % × 0.40) + (Semantic Text % × 0.20) + (Experience Fit % × 0.25) + (Education % × 0.15)'
    );
  });

  it('formats score with percentage and decimals', () => {
    expect(formatScore(85.42)).toBe('85.4%');
    expect(formatScore(0.8542)).toBe('85.4%');
    expect(formatScore(100)).toBe('100.0%');
    expect(formatScore(null)).toBe('0.0%');
  });

  it('computes skill coverage ratio and percentage correctly', () => {
    const matched = ['React', 'TypeScript'];
    const required = ['React', 'TypeScript', 'Node.js', 'PostgreSQL'];
    const coverage = getSkillCoverage(matched, required);

    expect(coverage.count).toBe(2);
    expect(coverage.total).toBe(4);
    expect(coverage.ratio).toBe(0.5);
    expect(coverage.percentage).toBe(50);
  });

  it('handles edge case of zero required skills', () => {
    const coverage = getSkillCoverage(['React'], []);
    expect(coverage.total).toBe(0);
    expect(coverage.percentage).toBe(100);
  });

  it('computes breakdown following default 4-pillar formula (40% skills, 20% text, 25% exp, 15% edu)', () => {
    const candidate = {
      keyword_score: 80, // 80 * 0.40 = 32 pts
      tfidf_score: 70, // 70 * 0.20 = 14 pts
      experience_score: 80, // 80 * 0.25 = 20 pts
      education_score: 100, // 100 * 0.15 = 15 pts
    };

    const breakdown = computeBreakdown(candidate);
    expect(breakdown.skillsCoveredPoints).toBeCloseTo(32);
    expect(breakdown.textMatchPoints).toBeCloseTo(14);
    expect(breakdown.experiencePoints).toBeCloseTo(20);
    expect(breakdown.educationPoints).toBeCloseTo(15);
    expect(breakdown.finalScore).toBeCloseTo(81);
    expect(breakdown.weightSkills).toBe(0.40);
    expect(breakdown.weightText).toBe(0.20);
    expect(breakdown.weightExperience).toBe(0.25);
    expect(breakdown.weightEducation).toBe(0.15);
    expect(breakdown.formulaSummary).toContain('Skills 80.0% × 0.40 (32.0 pts)');
    expect(breakdown.formulaSummary).toContain('Text 70.0% × 0.20 (14.0 pts)');
    expect(breakdown.formulaSummary).toContain('Exp 80.0% × 0.25 (20.0 pts)');
    expect(breakdown.formulaSummary).toContain('Edu 100.0% × 0.15 (15.0 pts)');
  });

  it('derives points, percentages, and weights directly when candidate.components exists', () => {
    const candidate = {
      components: {
        skills: { percentage: 90.0, weight: 0.40, points: 36.0 },
        text: { percentage: 85.0, weight: 0.20, points: 17.0 },
        experience: { percentage: 80.0, weight: 0.25, points: 20.0 },
        education: { percentage: 100.0, weight: 0.15, points: 15.0 },
      },
      weights: {
        skills: 0.40,
        text: 0.20,
        experience: 0.25,
        education: 0.15,
      },
      final_score: 88.0,
    };

    const breakdown = computeBreakdown(candidate);
    expect(breakdown.skillsCoveredPercent).toBe(90.0);
    expect(breakdown.skillsCoveredPoints).toBe(36.0);
    expect(breakdown.textMatchPercent).toBe(85.0);
    expect(breakdown.textMatchPoints).toBe(17.0);
    expect(breakdown.experiencePercent).toBe(80.0);
    expect(breakdown.experiencePoints).toBe(20.0);
    expect(breakdown.educationPercent).toBe(100.0);
    expect(breakdown.educationPoints).toBe(15.0);
    expect(breakdown.finalScore).toBe(88.0);
    expect(breakdown.components.skills.points).toBe(36.0);
  });

  it('supports custom weights passed via candidate.weights or score_breakdown', () => {
    const candidate = {
      keyword_score: 80,
      tfidf_score: 70,
      weights: {
        weight_skills: 0.60,
        weight_text: 0.40,
        weight_experience: 0.0,
        weight_education: 0.0,
      },
    };

    const breakdown = computeBreakdown(candidate);
    expect(breakdown.skillsCoveredPoints).toBeCloseTo(48);
    expect(breakdown.textMatchPoints).toBeCloseTo(28);
    expect(breakdown.finalScore).toBeCloseTo(76);
  });

  it('sorts candidates descending by score', () => {
    const candidates = [
      { name: 'Alice', final_score: 70 },
      { name: 'Bob', final_score: 95 },
      { name: 'Charlie', final_score: 82 },
    ];
    const sorted = sortCandidates(candidates, 'score', 'desc');
    expect(sorted.map((c) => c.name)).toEqual(['Bob', 'Charlie', 'Alice']);
  });
});
