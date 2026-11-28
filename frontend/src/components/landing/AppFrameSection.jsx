import { useState, useMemo } from 'react';

const CANDIDATES = [
  {
    id: 'hm-01',
    name: 'Hannah Meyer',
    role: 'Staff Backend Engineer',
    skills: ['Python', 'FastAPI', 'PostgreSQL', 'Docker', 'SQL', 'React'],
    experiencePct: 100,
    educationPct: 100,
    textPct: 86,
    years: '7 yrs Python · MSc CS',
    evidence: 'Built high-throughput FastAPI ingestion pipelines backed by PostgreSQL partitioning.',
  },
  {
    id: 'dc-02',
    name: 'David Chen',
    role: 'Full-Stack Developer',
    skills: ['Python', 'React', 'Docker', 'SQL'],
    experiencePct: 85,
    educationPct: 85,
    textPct: 79,
    years: '5 yrs Python · BEng SE',
    evidence: 'Led React frontend migration and containerized Python scoring services in Docker.',
  },
  {
    id: 'tn-03',
    name: 'Tomasz Nowak',
    role: 'Platform Engineer',
    skills: ['PostgreSQL', 'Docker', 'SQL', 'FastAPI'],
    experiencePct: 80,
    educationPct: 85,
    textPct: 72,
    years: '4 yrs SQL · BSc CS',
    evidence: 'Operated multi-region PostgreSQL clusters and internal FastAPI job queues.',
  },
];

const AVAILABLE_SKILLS = ['Python', 'FastAPI', 'PostgreSQL', 'React', 'Docker', 'SQL'];

export function AppFrameSection() {
  const [requiredSkills, setRequiredSkills] = useState(['Python', 'FastAPI', 'PostgreSQL', 'Docker']);
  const [selectedId, setSelectedId] = useState('hm-01');

  const toggleSkill = (skill) => {
    setRequiredSkills((prev) => {
      if (prev.includes(skill)) {
        return prev.length > 1 ? prev.filter((s) => s !== skill) : prev;
      }
      return [...prev, skill];
    });
  };

  const ranked = useMemo(() => {
    return CANDIDATES.map((candidate) => {
      const matched = requiredSkills.filter((s) => candidate.skills.includes(s));
      const missing = requiredSkills.filter((s) => !candidate.skills.includes(s));
      const skillCoveragePct = (matched.length / requiredSkills.length) * 100;

      const skillsPts = skillCoveragePct * 0.4;
      const textPts = candidate.textPct * 0.2;
      const expPts = candidate.experiencePct * 0.25;
      const eduPts = candidate.educationPct * 0.15;
      const total = Math.round(skillsPts + textPts + expPts + eduPts);

      return {
        ...candidate,
        matched,
        missing,
        skillCoveragePct,
        skillsPts,
        textPts,
        expPts,
        eduPts,
        total,
      };
    }).sort((a, b) => b.total - a.total);
  }, [requiredSkills]);

  const active = ranked.find((c) => c.id === selectedId) || ranked[0];

  return (
    <section className="section" id="workspace" style={{ '--hm': 2 }} aria-labelledby="workspace-h">
      <div className="wrap">
        <div className="section-head">
          <h2 id="workspace-h">Open weights drive every resume rank</h2>
          <p className="measure">
            Toggle required job skills to watch four weighted pillars update match scores on screen.
          </p>
        </div>

        <div className="frame fill" style={{ padding: 0, display: 'block' }}>
          <div className="smartats-frame-app ui ui-win">
            {/* Window Titlebar */}
            <div className="ui-win__bar" style={{ background: 'var(--surface)' }}>
              <span className="ui-dots" aria-hidden="true">
                <i />
                <i />
                <i />
              </span>
              <span className="ui-win__crumb">
                <span>SmartATS</span>
                <i>/</i>
                <b>Senior Backend Engineer</b>
              </span>
              <span className="ui-spacer" />
              <span className="mono smartats-win-meta" style={{ fontSize: '13px', color: 'var(--u-muted)' }}>
                40% Skills · 25% Exp · 20% Text · 15% Edu
              </span>
            </div>

            {/* Interactive Skill Requirements Filter */}
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                alignItems: 'center',
                gap: '8px',
                padding: '12px 16px',
                borderBottom: '1px solid var(--line)',
                background: 'var(--p-bg)',
              }}
            >
              <span style={{ fontSize: '13px', fontWeight: 500, color: 'var(--u-muted)', marginRight: '4px' }}>
                Required skills:
              </span>
              {AVAILABLE_SKILLS.map((skill) => {
                const activeSkill = requiredSkills.includes(skill);
                return (
                  <button
                    key={skill}
                    type="button"
                    onClick={() => toggleSkill(skill)}
                    aria-pressed={activeSkill}
                    style={{
                      height: '30px',
                      padding: '0 12px',
                      borderRadius: '999px',
                      border: `1px solid ${activeSkill ? 'var(--accent)' : 'var(--line)'}`,
                      background: activeSkill ? 'var(--accent)' : 'var(--surface)',
                      color: activeSkill ? 'var(--accent-ink)' : 'var(--ink)',
                      fontSize: '13px',
                      fontWeight: 500,
                      cursor: 'pointer',
                    }}
                  >
                    {skill}
                  </button>
                );
              })}
            </div>

            {/* Split Workspace Body */}
            <div className="smartats-workspace-grid">
              {/* Ranked Shortlist */}
              <div className="smartats-workspace-list">
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '32px minmax(0, 1fr) 60px 56px',
                    gap: '10px',
                    padding: '0 8px 8px',
                    fontSize: '13px',
                    color: 'var(--u-muted)',
                    borderBottom: '1px solid var(--line)',
                  }}
                >
                  <span>Rank</span>
                  <span>Candidate</span>
                  <span>Skills</span>
                  <span style={{ textAlign: 'right' }}>Score</span>
                </div>

                <ul style={{ display: 'grid', margin: 0, padding: 0, listStyle: 'none' }}>
                  {ranked.map((item, idx) => {
                    const isSelected = item.id === active.id;
                    return (
                      <li key={item.id} style={{ borderBottom: '1px solid var(--line)' }}>
                        <button
                          type="button"
                          onClick={() => setSelectedId(item.id)}
                          style={{
                            width: '100%',
                            display: 'grid',
                            gridTemplateColumns: '32px minmax(0, 1fr) 60px 56px',
                            gap: '10px',
                            alignItems: 'center',
                            padding: '12px 8px',
                            border: 0,
                            background: isSelected ? 'color-mix(in oklab, var(--accent) 8%, transparent)' : 'transparent',
                            textAlign: 'left',
                            cursor: 'pointer',
                          }}
                        >
                          <span className="mono" style={{ fontSize: '13px', color: idx === 0 ? 'var(--accent)' : 'var(--u-muted)' }}>
                            #{idx + 1}
                          </span>
                          <span style={{ minWidth: 0 }}>
                            <strong style={{ display: 'block', fontSize: '15px', fontWeight: 500, color: 'var(--ink)' }}>
                              {item.name}
                            </strong>
                            <span style={{ display: 'block', fontSize: '13px', color: 'var(--u-muted)' }}>
                              {item.years}
                            </span>
                          </span>
                          <span className="mono" style={{ fontSize: '13px', color: 'var(--ink)' }}>
                            {item.matched.length}/{requiredSkills.length}
                          </span>
                          <span className="mono" style={{ fontSize: '15px', fontWeight: 600, textAlign: 'right', color: 'var(--ink)' }}>
                            {item.total}%
                          </span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>

              {/* Deterministic Math Inspector */}
              <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: '12px' }}>
                  <div>
                    <h3 style={{ fontSize: '18px', fontWeight: 600 }}>{active.name}</h3>
                    <p style={{ fontSize: '14px', color: 'var(--u-muted)' }}>{active.role}</p>
                  </div>
                  <span className="mono" style={{ fontSize: '20px', fontWeight: 600, color: 'var(--accent)' }}>
                    {active.total}%
                  </span>
                </div>

                {/* Single Stacked Bar */}
                <div
                  style={{
                    height: '8px',
                    borderRadius: '4px',
                    background: 'var(--p-bg)',
                    display: 'flex',
                    overflow: 'hidden',
                    gap: '1px',
                  }}
                >
                  <span style={{ width: `${active.skillsPts}%`, background: 'var(--accent)' }} />
                  <span style={{ width: `${active.expPts}%`, background: 'color-mix(in oklab, var(--ink) 80%, transparent)' }} />
                  <span style={{ width: `${active.textPts}%`, background: 'color-mix(in oklab, var(--ink) 45%, transparent)' }} />
                  <span style={{ width: `${active.eduPts}%`, background: 'color-mix(in oklab, var(--ink) 18%, transparent)' }} />
                </div>

                <dl
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr auto',
                    gap: '6px 12px',
                    margin: 0,
                    fontSize: '14px',
                  }}
                >
                  <dt style={{ color: 'var(--u-muted)' }}>Skills coverage (40%)</dt>
                  <dd className="mono" style={{ margin: 0 }}>{active.skillsPts.toFixed(1)} pts</dd>
                  <dt style={{ color: 'var(--u-muted)' }}>Experience tenure (25%)</dt>
                  <dd className="mono" style={{ margin: 0 }}>{active.expPts.toFixed(1)} pts</dd>
                  <dt style={{ color: 'var(--u-muted)' }}>TF-IDF lexical match (20%)</dt>
                  <dd className="mono" style={{ margin: 0 }}>{active.textPts.toFixed(1)} pts</dd>
                  <dt style={{ color: 'var(--u-muted)' }}>Education tier (15%)</dt>
                  <dd className="mono" style={{ margin: 0 }}>{active.eduPts.toFixed(1)} pts</dd>
                </dl>

                <p style={{ fontSize: '14px', lineHeight: 1.5, color: 'var(--ink)' }}>
                  {active.evidence}
                </p>

                {active.missing.length > 0 && (
                  <p className="mono" style={{ fontSize: '13px', color: 'var(--u-muted)' }}>
                    Missing: {active.missing.join(', ')}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
