import { describe, it, expect } from 'vitest';
import { formatScore, getSkillCoverage, computeBreakdown, sortCandidates } from './score';

describe('score lib', () => {
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

  it('computes breakdown following dual-track formula (0.6 x skills + 0.4 x text match)', () => {
    const candidate = {
      keyword_score: 80, // 80 * 0.6 = 48 pts
      tfidf_score: 70, // 70 * 0.4 = 28 pts
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
