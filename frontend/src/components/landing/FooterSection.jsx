export default function FooterSection({ onEnterApp }) {
  return (
    <footer className="py-12 border-t border-line bg-surface text-ink">
      <div className="max-w-[1200px] mx-auto px-6 sm:px-8 lg:px-12 flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-2.5">
          <span className="w-6 h-6 rounded-[6px] bg-primary text-on-primary font-semibold text-[13px] flex items-center justify-center select-none">
            S
          </span>
          <span className="text-[16px] font-semibold tracking-tight text-ink">SmartATS</span>
          <span className="text-[13px] text-ink-muted ml-2">Explainable resume screening</span>
        </div>

        <div className="flex items-center gap-6 text-[13px] text-ink-muted">
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
        </div>
      </div>
    </footer>
  );
}
