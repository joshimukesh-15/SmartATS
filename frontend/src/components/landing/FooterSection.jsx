export default function FooterSection({ onEnterApp }) {
  return (
    <footer className="py-10 border-t border-line bg-surface text-ink">
      <div className="max-w-[1200px] mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
        {/* Logo */}
        <div className="flex items-center gap-2.5">
          <span className="w-6 h-6 rounded-[6px] bg-primary text-on-primary font-semibold text-[13px] flex items-center justify-center select-none">
            S
          </span>
          <span className="text-[16px] font-semibold tracking-tight text-ink">SmartATS</span>
        </div>

        {/* Links */}
        <nav aria-label="Footer navigation" className="flex flex-wrap items-center justify-center gap-6 text-[13px] text-ink-muted">
          <button
            type="button"
            onClick={onEnterApp}
            className="hover:text-ink transition-colors cursor-pointer"
          >
            Studio
          </button>
          <a href="#scoring" className="hover:text-ink transition-colors">
            Scoring
          </a>
          <a href="#features" className="hover:text-ink transition-colors">
            Features
          </a>
          <a href="#workflow" className="hover:text-ink transition-colors">
            Workflow
          </a>
          <a href="#faq" className="hover:text-ink transition-colors">
            FAQ
          </a>
          <a
            href="https://github.com/joshimukesh-15/SmartATS"
            target="_blank"
            rel="noreferrer"
            className="hover:text-ink transition-colors"
          >
            GitHub
          </a>
        </nav>

        {/* Muted tech stack attribution */}
        <div className="text-[13px] text-ink-muted">
          Built with FastAPI and React
        </div>
      </div>
    </footer>
  );
}
