export function PillarExplanationCards({ weights, activeTerm, setActiveTerm }) {
  return (
    <div className="space-y-3 pt-1">
      <div
        onMouseEnter={() => setActiveTerm('skills')}
        onMouseLeave={() => setActiveTerm(null)}
        className={`p-3.5 rounded-[10px] border transition-all duration-200 cursor-pointer space-y-1 ${
          activeTerm === 'skills'
            ? 'border-primary bg-surface shadow-sm ring-1 ring-primary'
            : 'border-line bg-surface hover:border-ink-subtle'
        }`}
      >
        <div className="flex items-center justify-between text-[14px] font-semibold text-ink">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-[2px] bg-primary" />
            <span>Required skills</span>
          </div>
          <span className="tabular-nums text-ink-muted font-medium">{Math.round(weights.skills * 100)}% weight</span>
        </div>
        <p className="text-[13px] text-ink-muted leading-relaxed">
          Deterministic verification of required competencies extracted directly from candidate
          work history and quantified achievements.
        </p>
      </div>

      <div
        onMouseEnter={() => setActiveTerm('text')}
        onMouseLeave={() => setActiveTerm(null)}
        className={`p-3.5 rounded-[10px] border transition-all duration-200 cursor-pointer space-y-1 ${
          activeTerm === 'text'
            ? 'border-champagne bg-surface shadow-sm ring-1 ring-champagne'
            : 'border-line bg-surface hover:border-ink-subtle'
        }`}
      >
        <div className="flex items-center justify-between text-[14px] font-semibold text-ink">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-[2px] bg-champagne" />
            <span>Semantic text alignment</span>
          </div>
          <span className="tabular-nums text-ink-muted font-medium">{Math.round(weights.text * 100)}% weight</span>
        </div>
        <p className="text-[13px] text-ink-muted leading-relaxed">
          TF-IDF vector cosine similarity evaluating lexical and semantic vocabulary alignment between resume
          context and role responsibilities.
        </p>
      </div>

      <div
        onMouseEnter={() => setActiveTerm('experience')}
        onMouseLeave={() => setActiveTerm(null)}
        className={`p-3.5 rounded-[10px] border transition-all duration-200 cursor-pointer space-y-1 ${
          activeTerm === 'experience'
            ? 'border-slate-steel bg-surface shadow-sm ring-1 ring-slate-steel'
            : 'border-line bg-surface hover:border-ink-subtle'
        }`}
      >
        <div className="flex items-center justify-between text-[14px] font-semibold text-ink">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-[2px] bg-slate-steel" />
            <span>Experience fit</span>
          </div>
          <span className="tabular-nums text-ink-muted font-medium">{Math.round(weights.experience * 100)}% weight</span>
        </div>
        <p className="text-[13px] text-ink-muted leading-relaxed">
          Seniority scoring comparing verified total years in relevant software engineering roles against job tier requirements.
        </p>
      </div>

      <div
        onMouseEnter={() => setActiveTerm('education')}
        onMouseLeave={() => setActiveTerm(null)}
        className={`p-3.5 rounded-[10px] border transition-all duration-200 cursor-pointer space-y-1 ${
          activeTerm === 'education'
            ? 'border-amber-gold/50 bg-surface shadow-sm ring-1 ring-amber-gold/40'
            : 'border-line bg-surface hover:border-ink-subtle'
        }`}
      >
        <div className="flex items-center justify-between text-[14px] font-semibold text-ink">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-[2px] bg-silk-cream border border-amber-gold/30 dark:bg-silk-cream/60" />
            <span>Education &amp; credentials</span>
          </div>
          <span className="tabular-nums text-ink-muted font-medium">{Math.round(weights.education * 100)}% weight</span>
        </div>
        <p className="text-[13px] text-ink-muted leading-relaxed">
          Evaluates degree levels (B.S., M.S., Ph.D.) and academic or professional certifications matching the target discipline.
        </p>
      </div>
    </div>
  );
}
