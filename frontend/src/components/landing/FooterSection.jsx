import { Shield, Lock, FileCode, CheckCircle2 } from 'lucide-react';

export default function FooterSection({ onEnterApp }) {
  return (
    <footer className="border-t border-line bg-surface text-ink pt-16 pb-12">
      <div className="max-w-[1240px] mx-auto px-6 sm:px-8 lg:px-12">
        {/* Top 4-Column Grid */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 lg:gap-12 pb-14 border-b border-line">
          {/* Brand Info (2 cols) */}
          <div className="col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <span className="w-7 h-7 rounded-[8px] bg-primary text-on-primary font-bold text-[14px] flex items-center justify-center select-none shadow-xs">
                S
              </span>
              <span className="text-[18px] font-bold tracking-tight text-ink">SmartATS</span>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-champagne bg-champagne-soft/70 px-2 py-0.5 rounded-[4px] border border-champagne/30">
                Enterprise
              </span>
            </div>
            <p className="text-[14px] text-ink-muted leading-relaxed max-w-sm">
              The deterministic recruitment intelligence platform. Providing mathematically explainable, auditable candidate rankings for global enterprise hiring teams.
            </p>
            <div className="flex items-center gap-3 pt-2 text-[12px] text-ink-muted">
              <span className="inline-flex items-center gap-1.5 bg-surface-alt px-2.5 py-1 rounded-[6px] border border-line">
                <Shield className="w-3.5 h-3.5 text-champagne" />
                <span>EEOC Defensible</span>
              </span>
              <span className="inline-flex items-center gap-1.5 bg-surface-alt px-2.5 py-1 rounded-[6px] border border-line">
                <Lock className="w-3.5 h-3.5 text-emerald-600" />
                <span>Zero Model Training</span>
              </span>
            </div>
          </div>

          {/* Column 1: Platform */}
          <div className="space-y-3">
            <h4 className="text-[13px] font-semibold uppercase tracking-wider text-ink">Platform</h4>
            <ul className="space-y-2 text-[14px] text-ink-muted">
              <li>
                <button type="button" onClick={onEnterApp} className="hover:text-ink transition-colors cursor-pointer text-left">
                  Recruiter Studio
                </button>
              </li>
              <li><a href="#scoring" className="hover:text-ink transition-colors">4-Pillar Scoring</a></li>
              <li><a href="#features" className="hover:text-ink transition-colors">Candidate Comparison</a></li>
              <li><a href="#workflow" className="hover:text-ink transition-colors">Deduplication Engine</a></li>
            </ul>
          </div>

          {/* Column 2: Governance */}
          <div className="space-y-3">
            <h4 className="text-[13px] font-semibold uppercase tracking-wider text-ink">Governance</h4>
            <ul className="space-y-2 text-[14px] text-ink-muted">
              <li><a href="#security" className="hover:text-ink transition-colors">Enterprise Security</a></li>
              <li><a href="#comparison" className="hover:text-ink transition-colors">Bias-Audit Defensibility</a></li>
              <li><a href="#security" className="hover:text-ink transition-colors">Privacy Architecture</a></li>
              <li><a href="#security" className="hover:text-ink transition-colors">SOC2 / ISO 27001</a></li>
            </ul>
          </div>

          {/* Column 3: Resources */}
          <div className="space-y-3">
            <h4 className="text-[13px] font-semibold uppercase tracking-wider text-ink">Developers</h4>
            <ul className="space-y-2 text-[14px] text-ink-muted">
              <li>
                <a href="http://127.0.0.1:8000/docs" target="_blank" rel="noreferrer" className="hover:text-ink transition-colors">
                  OpenAPI Reference
                </a>
              </li>
              <li>
                <a href="https://github.com/joshimukesh-15/SmartATS" target="_blank" rel="noreferrer" className="hover:text-ink transition-colors">
                  GitHub Repository
                </a>
              </li>
              <li><a href="#faq" className="hover:text-ink transition-colors">Enterprise FAQ</a></li>
              <li>
                <span className="inline-flex items-center gap-1.5 text-emerald-600 font-medium text-[13px]">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Systems Operational</span>
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar: Copyright & Attribution */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-[13px] text-ink-muted">
          <div>
            &copy; {new Date().getFullYear()} SmartATS Enterprise. All rights reserved. Built with FastAPI and React 19.
          </div>
          <div className="flex items-center gap-6">
            <a href="https://github.com/joshimukesh-15/SmartATS" target="_blank" rel="noreferrer" className="hover:text-ink transition-colors">
              Source Code
            </a>
            <span>·</span>
            <span>Local & Sovereign Execution</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
