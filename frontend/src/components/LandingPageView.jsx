import React, { useState, useEffect, useRef } from 'react';
import {
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  FileText,
  ShieldCheck,
  ChevronDown,
  Sparkles,
  GitCompare,
  FileSpreadsheet,
  Award,
  Layers,
  Database,
  ArrowUpRight,
  Users,
  Search,
  Check,
  X,
  Plus,
  Zap,
} from 'lucide-react';

export default function LandingPageView({ onLaunchApp }) {
  const [openFaq, setOpenFaq] = useState(null);
  const [selectedDemoCandidate, setSelectedDemoCandidate] = useState(0);

  // Mandatory B11: Tagline Reveal Animation on Scroll
  const taglineRef = useRef(null);
  const [revealedWords, setRevealedWords] = useState(0);

  const taglineSentence = "Every candidate recommendation is backed by clear evidence, not unexplainable guesswork.";
  const tagWords = taglineSentence.split(' ');

  useEffect(() => {
    const handleScroll = () => {
      if (!taglineRef.current) return;
      const rect = taglineRef.current.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      
      const progress = Math.max(0, Math.min(1, (windowHeight - rect.top) / (windowHeight * 0.65)));
      const count = Math.floor(progress * (tagWords.length + 1));
      setRevealedWords(count);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, [tagWords.length]);

  const toggleFaq = (idx) => {
    setOpenFaq(openFaq === idx ? null : idx);
  };

  const demoCandidates = [
    {
      name: "Sarah Jenkins",
      title: "Senior Backend Engineer",
      rank: 1,
      overallScore: 89,
      skillsMatched: 5,
      skillsTotal: 5,
      relevanceBadge: "High Alignment",
      status: "Top Match",
      statusColor: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30",
      matchedSkills: ["Python", "FastAPI", "PostgreSQL", "Docker", "AWS"],
      missingSkills: [],
      preferredSkills: ["Redis", "Kubernetes", "CI/CD", "Git"],
      summary: "Matches 100% of required backend competencies with deep demonstrated experience across cloud infrastructure and distributed systems.",
    },
    {
      name: "Alex Rivera",
      title: "Full Stack Engineer",
      rank: 2,
      overallScore: 74,
      skillsMatched: 4,
      skillsTotal: 5,
      relevanceBadge: "Good Alignment",
      status: "Strong Match",
      statusColor: "text-blue-400 bg-blue-500/10 border-blue-500/30",
      matchedSkills: ["Python", "PostgreSQL", "Docker", "AWS"],
      missingSkills: ["FastAPI"],
      preferredSkills: ["Git", "CI/CD"],
      summary: "Matches 4 of 5 required technical skills with substantial full stack experience. Only FastAPI needs technical validation.",
    },
    {
      name: "Marcus Brody",
      title: "Frontend UI Specialist",
      rank: 3,
      overallScore: 38,
      skillsMatched: 2,
      skillsTotal: 5,
      relevanceBadge: "Role Mismatch",
      status: "Low Match",
      statusColor: "text-slate-400 bg-slate-800 border-slate-700",
      matchedSkills: ["Docker", "Git"],
      missingSkills: ["Python", "FastAPI", "PostgreSQL"],
      preferredSkills: [],
      summary: "Strong frontend background, but missing critical backend foundations required for this engineering opening.",
    },
  ];

  const currentCand = demoCandidates[selectedDemoCandidate];

  const faqs = [
    {
      q: "How does SmartATS avoid hiring mistakes and bias?",
      a: "SmartATS does not rely on opaque generative AI to make hiring decisions. Instead, it evaluates applicants against verified required skills and contextual experience, providing recruiters with transparent evidence for every decision."
    },
    {
      q: "Does SmartATS automatically reject applicants?",
      a: "No. SmartATS is designed as a recruiter assistance tool. It ranks candidates and highlights strengths and skill gaps, while leaving all hiring and rejection choices with your talent team."
    },
    {
      q: "How does duplicate resume detection work?",
      a: "When a resume is uploaded, the system generates a secure cryptographic fingerprint of the file. If an identical file is submitted to the same opening, SmartATS alerts you immediately to avoid reviewing it twice."
    },
    {
      q: "Can candidates manipulate rankings with keyword stuffing?",
      a: "No. The system analyzes full document context and sentence structure alongside individual skill tags. A random list of pasted buzzwords without matching context will not produce a competitive ranking."
    },
    {
      q: "What happens with scanned or image based resumes?",
      a: "SmartATS reads standard digital PDFs and Word documents directly. When a scanned or image based document is detected, an automatic optical character recognition fallback reads the text seamlessly."
    },
    {
      q: "How are optional or preferred skills handled?",
      a: "Preferred skills are tracked separately as bonus qualifications. Candidates are rewarded when they have them, but they are never penalized if an optional skill is missing."
    },
    {
      q: "Can candidate rankings be exported to spreadsheets?",
      a: "Yes. Every candidate leaderboard can be exported in one click to a standard CSV file with full contact info, match scores, and skill gap summaries."
    },
    {
      q: "Is applicant data uploaded to third party cloud servers?",
      a: "No. All resume parsing and matching runs locally on your own infrastructure. Your candidate records and hiring data stay completely private and secure."
    }
  ];

  return (
    <div className="bg-[#0B0F19] text-slate-100 min-h-screen font-sans selection:bg-blue-600 selection:text-white relative overflow-hidden">
      
      {/* Ambient Radial Top Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-to-b from-blue-600/15 via-indigo-600/10 to-transparent blur-3xl pointer-events-none -z-10"></div>

      {/* Floating Navigation Bar */}
      <div className="sticky top-4 z-50 max-w-5xl mx-auto px-4">
        <header className="bg-slate-900/80 backdrop-blur-xl border border-slate-800/80 rounded-full px-5 py-2.5 flex items-center justify-between shadow-2xl transition-all duration-300">
          <div className="flex items-center space-x-2.5">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-[0_0_12px_rgba(37,99,235,0.4)]">
              <span className="font-bold text-xs tracking-tight">S</span>
            </div>
            <span className="text-base font-bold tracking-tight text-white">
              SmartATS
            </span>
          </div>

          <nav className="hidden md:flex items-center space-x-6 text-xs font-medium text-slate-400">
            <a href="#benefits" className="hover:text-white transition focus:outline-none focus:text-white">Benefits</a>
            <a href="#how-it-works" className="hover:text-white transition focus:outline-none focus:text-white">How It Works</a>
            <a href="#benchmark" className="hover:text-white transition focus:outline-none focus:text-white">Benchmarks</a>
            <a href="#faq" className="hover:text-white transition focus:outline-none focus:text-white">FAQ</a>
          </nav>

          <button
            onClick={onLaunchApp}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 active:scale-[0.98] text-white rounded-full text-xs font-semibold tracking-wide transition-all shadow-[0_0_15px_rgba(37,99,235,0.35)] flex items-center space-x-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <span>Launch Studio</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </header>
      </div>

      {/* Hero Section */}
      <section data-enter className="pt-24 pb-20 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto text-center relative">
        
        {/* Category Indicator */}
        <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full border border-blue-500/30 bg-blue-500/10 text-xs font-mono text-blue-400 mb-8 shadow-xs">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse"></span>
          <span>Transparent Resume Screening System</span>
        </div>

        {/* Headline */}
        <div className="max-w-[720px] mx-auto">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight hero-gradient-text leading-[1.08] [text-wrap:balance]">
            Screen hundreds of resumes in minutes without guesswork
          </h1>
        </div>

        {/* Subheadline */}
        <div className="max-w-[660px] mx-auto mt-6">
          <p className="text-base sm:text-lg text-slate-400 leading-relaxed [text-wrap:pretty]">
            SmartATS automatically identifies qualified engineers, highlights missing skills, and organizes candidates with clear, transparent reasoning.
          </p>
        </div>

        {/* Primary CTA */}
        <div className="mt-9 flex flex-col sm:flex-row items-center justify-center gap-3.5">
          <button
            onClick={onLaunchApp}
            className="w-full sm:w-auto px-6 py-3.5 bg-blue-600 hover:bg-blue-500 active:scale-[0.98] text-white rounded-xl text-sm font-semibold tracking-wide transition-all shadow-[0_0_20px_rgba(37,99,235,0.4)] flex items-center justify-center space-x-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <span>Launch Recruiter Studio</span>
            <ArrowRight className="w-4 h-4" />
          </button>
          <a
            href="#how-it-works"
            className="w-full sm:w-auto px-5 py-3.5 bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 rounded-xl text-sm font-semibold transition active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-slate-700"
          >
            Explore How It Works
          </a>
        </div>

        {/* Proof Line */}
        <div className="mt-6 text-xs text-slate-500 font-mono">
          Tested across multiple technical roles with 100% extraction accuracy and zero duplicates
        </div>

        {/* Desktop Application Frame (Linear / Figma style) */}
        <div className="mt-14 max-w-4xl mx-auto bg-slate-900/90 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden text-left transition-all duration-300 hover:border-slate-700">
          
          {/* App Window Chrome Header */}
          <div className="bg-slate-950/80 border-b border-slate-800 px-4 py-3 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="flex space-x-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-700"></span>
                <span className="w-2.5 h-2.5 rounded-full bg-slate-700"></span>
                <span className="w-2.5 h-2.5 rounded-full bg-slate-700"></span>
              </div>
              <span className="text-[11px] font-mono text-slate-400 pl-2 hidden sm:inline">
                smartats://pipeline/senior-backend-engineer
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-400 font-semibold">
                Live Ingestion Ready
              </span>
            </div>
          </div>

          <div className="p-6 sm:p-8">
            {/* Header with Candidate Switcher */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 border-b border-slate-800 gap-4">
              <div>
                <div className="text-[11px] uppercase font-mono tracking-wider text-slate-400">
                  Target Opening: Senior Backend Engineer
                </div>
                <div className="flex items-center space-x-3 mt-1.5">
                  <h3 className="text-2xl font-bold text-white tracking-tight">
                    {currentCand.name}
                  </h3>
                  <span className="text-xs text-slate-400 font-medium">
                    {currentCand.title}
                  </span>
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${currentCand.statusColor}`}>
                    {currentCand.status}
                  </span>
                </div>
              </div>

              {/* Candidate Switcher Tabs */}
              <div className="flex bg-slate-950 border border-slate-800 p-1 rounded-xl">
                {demoCandidates.map((cand, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedDemoCandidate(idx)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all active:scale-[0.98] ${
                      selectedDemoCandidate === idx
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Candidate {idx + 1}
                  </button>
                ))}
              </div>
            </div>

            {/* Clean Metric Cards with Hover Lift */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 my-6">
              <div className="p-4 bg-slate-950/60 rounded-xl border border-slate-800 transition-all duration-300 hover:border-slate-700 hover:-translate-y-0.5">
                <span className="text-slate-400 text-xs font-medium block">Required Skills</span>
                <span className="text-3xl font-bold text-emerald-400 block mt-1">
                  {currentCand.skillsMatched} of {currentCand.skillsTotal}
                </span>
                <span className="text-xs text-slate-400 mt-1 block">
                  Mandatory qualifications met
                </span>
              </div>

              <div className="p-4 bg-slate-950/60 rounded-xl border border-slate-800 transition-all duration-300 hover:border-slate-700 hover:-translate-y-0.5">
                <span className="text-slate-400 text-xs font-medium block">Experience Match</span>
                <span className="text-2xl font-bold text-blue-400 block mt-1.5">
                  {currentCand.relevanceBadge}
                </span>
                <span className="text-xs text-slate-400 mt-1 block">
                  Relevant technical context
                </span>
              </div>

              <div className="p-4 bg-slate-950/90 border border-blue-500/40 rounded-xl transition-all duration-300 hover:-translate-y-0.5 shadow-[0_0_20px_rgba(59,130,246,0.15)]">
                <span className="text-slate-400 text-xs font-medium block">Overall Match</span>
                <span className="text-3xl font-bold text-white block mt-1">
                  {currentCand.overallScore}%
                </span>
                <span className="text-xs text-blue-400 font-semibold mt-1 block">
                  Rank #{currentCand.rank} Recommendation
                </span>
              </div>
            </div>

            {/* Competency Gap Analysis */}
            <div className="space-y-3.5 text-xs border-t border-slate-800 pt-5">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                <span className="text-xs font-semibold text-emerald-400 min-w-[150px]">
                  Matched Required Skills:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {currentCand.matchedSkills.map((s, i) => (
                    <span key={i} className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 font-medium text-xs">
                      <Check className="w-3 h-3 text-emerald-400" />
                      <span>{s}</span>
                    </span>
                  ))}
                </div>
              </div>

              {currentCand.missingSkills.length > 0 && (
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 pt-1">
                  <span className="text-xs font-semibold text-rose-400 min-w-[150px]">
                    Missing Required Skills:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {currentCand.missingSkills.map((s, i) => (
                      <span key={i} className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-rose-500/10 text-rose-300 border border-rose-500/20 font-medium text-xs">
                        <X className="w-3 h-3 text-rose-400" />
                        <span>{s}</span>
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {currentCand.preferredSkills.length > 0 && (
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 pt-1">
                  <span className="text-xs font-semibold text-blue-400 min-w-[150px]">
                    Bonus Qualifications:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {currentCand.preferredSkills.map((s, i) => (
                      <span key={i} className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-blue-500/10 text-blue-300 border border-blue-500/20 font-medium text-xs">
                        <Plus className="w-3 h-3 text-blue-400" />
                        <span>{s}</span>
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="mt-4 p-4 bg-slate-950/70 rounded-xl border border-slate-800 text-xs text-slate-300 leading-relaxed">
                <strong className="text-white font-semibold">Recruiter Summary: </strong>
                {currentCand.summary}
              </div>
            </div>
          </div>

        </div>

      </section>

      {/* Mandatory B11 Tagline Reveal Section */}
      <section ref={taglineRef} className="py-24 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto text-center border-t border-b border-slate-800 my-10">
        <span className="text-xs uppercase font-mono tracking-wider text-blue-400 block mb-4">
          Core Operating Principle
        </span>
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold leading-snug tracking-tight">
          {tagWords.map((word, index) => {
            const isRevealed = index < revealedWords;
            return (
              <span
                key={index}
                className={`transition-colors duration-400 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                  isRevealed ? 'text-white' : 'text-slate-700'
                }`}
              >
                {word}{' '}
              </span>
            );
          })}
        </h2>
      </section>

      {/* Problem to Solution Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto space-y-12">
        <div className="text-center max-w-xl mx-auto space-y-2">
          <span className="text-xs uppercase font-mono tracking-wider text-slate-400">
            Why Traditional Screening Fails
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight [text-wrap:balance]">
            From black box guesswork to clear candidate evidence
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Legacy ATS */}
          <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-7 space-y-4 hover:border-slate-700 transition-all duration-300">
            <div className="flex items-center space-x-2 text-rose-400 text-xs font-semibold uppercase tracking-wider">
              <AlertCircle className="w-4 h-4" />
              <span>Traditional Keyword Filters & Black Box AI</span>
            </div>
            <ul className="space-y-3 text-xs text-slate-400 leading-relaxed">
              <li className="flex items-start space-x-2">
                <span className="text-rose-400 font-bold">✕</span>
                <span>Discards strong engineers due to minor wording differences.</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-rose-400 font-bold">✕</span>
                <span>Generates mysterious match percentages with zero explanation.</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-rose-400 font-bold">✕</span>
                <span>Recruiters waste hours reviewing identical duplicate submissions.</span>
              </li>
            </ul>
          </div>

          {/* SmartATS Approach */}
          <div className="bg-slate-900/80 border border-blue-500/40 rounded-2xl p-7 space-y-4 shadow-[0_0_30px_rgba(59,130,246,0.1)] hover:border-blue-500/60 transition-all duration-300">
            <div className="flex items-center space-x-2 text-emerald-400 text-xs font-semibold uppercase tracking-wider">
              <CheckCircle2 className="w-4 h-4" />
              <span>The SmartATS Explainable Standard</span>
            </div>
            <ul className="space-y-3 text-xs text-slate-200 leading-relaxed">
              <li className="flex items-start space-x-2">
                <span className="text-emerald-400 font-bold">✓</span>
                <span>Recognizes skills and common aliases accurately across formats.</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-emerald-400 font-bold">✓</span>
                <span>Provides clear reasoning and skill breakdowns for every profile.</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-emerald-400 font-bold">✓</span>
                <span>Instantly flags duplicate resumes and highlights bonus qualifications.</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section id="benefits" className="py-20 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto border-t border-slate-800 space-y-12">
        <div className="text-center max-w-xl mx-auto space-y-2">
          <span className="text-xs uppercase font-mono tracking-wider text-blue-400">
            Core Benefits
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight [text-wrap:balance]">
            Built for recruitment clarity and speed
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 space-y-3 shadow-lg hover:border-blue-500/40 hover:-translate-y-0.5 transition-all duration-300">
            <span className="text-xs text-blue-400 font-mono font-semibold tracking-wider block">01 / DEDUPLICATION</span>
            <h3 className="text-lg font-bold text-white">Zero duplicate reviews</h3>
            <p className="text-xs text-slate-400 leading-relaxed [text-wrap:pretty]">
              Cryptographic file verification catches identical submissions instantly, saving hours of redundant screening.
            </p>
          </div>

          <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 space-y-3 shadow-lg hover:border-blue-500/40 hover:-translate-y-0.5 transition-all duration-300">
            <span className="text-xs text-blue-400 font-mono font-semibold tracking-wider block">02 / EXPLAINABILITY</span>
            <h3 className="text-lg font-bold text-white">Transparent reasoning</h3>
            <p className="text-xs text-slate-400 leading-relaxed [text-wrap:pretty]">
              Every profile shows which requirements matched and which are missing, creating complete confidence for hiring managers.
            </p>
          </div>

          <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 space-y-3 shadow-lg hover:border-blue-500/40 hover:-translate-y-0.5 transition-all duration-300">
            <span className="text-xs text-blue-400 font-mono font-semibold tracking-wider block">03 / SKILL GAPS</span>
            <h3 className="text-lg font-bold text-white">Clear gap analysis</h3>
            <p className="text-xs text-slate-400 leading-relaxed [text-wrap:pretty]">
              Quickly see missing essentials and bonus qualifications so your team can focus technical interviews on the right areas.
            </p>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto border-t border-slate-800 space-y-12">
        <div className="text-center max-w-xl mx-auto space-y-2">
          <span className="text-xs uppercase font-mono tracking-wider text-slate-400">
            Screening Workflow
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight [text-wrap:balance]">
            Three steps from resume batch to qualified shortlist
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-slate-900/30 border border-slate-800 rounded-2xl p-6 space-y-3">
            <span className="text-3xl font-extrabold text-blue-500 font-mono">01</span>
            <h3 className="text-lg font-bold text-white">Upload candidate resumes</h3>
            <p className="text-xs text-slate-400 leading-relaxed [text-wrap:pretty]">
              Drop PDF and Word documents into the system. Text is extracted cleanly, with automatic character recognition for scanned pages.
            </p>
          </div>

          <div className="bg-slate-900/30 border border-slate-800 rounded-2xl p-6 space-y-3">
            <span className="text-3xl font-extrabold text-blue-500 font-mono">02</span>
            <h3 className="text-lg font-bold text-white">Analyze qualifications</h3>
            <p className="text-xs text-slate-400 leading-relaxed [text-wrap:pretty]">
              SmartATS identifies candidate contact details, verifies required skills, and evaluates experience relevance against your opening.
            </p>
          </div>

          <div className="bg-slate-900/30 border border-slate-800 rounded-2xl p-6 space-y-3">
            <span className="text-3xl font-extrabold text-blue-500 font-mono">03</span>
            <h3 className="text-lg font-bold text-white">Compare and shortlist</h3>
            <p className="text-xs text-slate-400 leading-relaxed [text-wrap:pretty]">
              Review the ranked leaderboard, compare top candidates side-by-side on a skills matrix, and export shortlists to CSV.
            </p>
          </div>
        </div>
      </section>

      {/* Benchmark & Verification Proof */}
      <section id="benchmark" className="py-20 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto border-t border-slate-800 space-y-8">
        <div className="text-center max-w-xl mx-auto space-y-2">
          <span className="text-xs uppercase font-mono tracking-wider text-blue-400">
            Verified Performance
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight [text-wrap:balance]">
            Fast, reliable, and audited
          </h2>
          <p className="text-xs text-slate-400 [text-wrap:pretty]">
            Tested against standard candidate datasets with verified benchmarks.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 text-center shadow-lg hover:border-slate-700 transition-all duration-300">
            <span className="text-3xl font-bold text-white block">100%</span>
            <span className="text-xs text-slate-400 mt-1 block">Contact Extraction</span>
          </div>
          <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 text-center shadow-lg hover:border-slate-700 transition-all duration-300">
            <span className="text-3xl font-bold text-white block">99%</span>
            <span className="text-xs text-slate-400 mt-1 block">Skill Recognition</span>
          </div>
          <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 text-center shadow-lg hover:border-slate-700 transition-all duration-300">
            <span className="text-3xl font-bold text-white block">3.8ms</span>
            <span className="text-xs text-slate-400 mt-1 block">Speed per Resume</span>
          </div>
          <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 text-center shadow-lg hover:border-slate-700 transition-all duration-300">
            <span className="text-3xl font-bold text-white block">0</span>
            <span className="text-xs text-slate-400 mt-1 block">Duplicate Errors</span>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-20 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto border-t border-slate-800 space-y-10">
        <div className="text-center space-y-2">
          <span className="text-xs uppercase font-mono tracking-wider text-slate-400">
            Frequently Asked Questions
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight [text-wrap:balance]">
            Everything you need to know
          </h2>
        </div>

        <div className="divide-y divide-slate-800 border-t border-b border-slate-800">
          {faqs.map((faq, idx) => (
            <div key={idx} className="py-4">
              <button
                type="button"
                onClick={() => toggleFaq(idx)}
                className="w-full flex items-center justify-between text-left text-base font-semibold text-slate-200 hover:text-blue-400 transition py-1 focus:outline-none focus:text-blue-400"
              >
                <span>{faq.q}</span>
                <ChevronDown className={`w-4 h-4 text-slate-500 transition-transform duration-300 ${openFaq === idx ? 'rotate-180 text-blue-400' : ''}`} />
              </button>
              {openFaq === idx && (
                <div className="mt-2 text-xs text-slate-400 leading-relaxed pr-6 [text-wrap:pretty]">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Risk Reversal & Final CTA */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto text-center space-y-6">
        <div className="bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800 rounded-3xl p-10 sm:p-14 space-y-6 shadow-2xl relative overflow-hidden">
          <div className="absolute inset-0 bg-radial-gradient from-blue-600/10 to-transparent pointer-events-none"></div>
          <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight [text-wrap:balance]">
            Experience clear, transparent candidate screening today
          </h2>
          <p className="text-sm text-slate-400 max-w-lg mx-auto leading-relaxed [text-wrap:pretty]">
            Zero cloud subscriptions. Private local document processing with Python, FastAPI, and React. Your candidate data stays entirely on your own machine.
          </p>
          <div className="pt-2">
            <button
              onClick={onLaunchApp}
              className="px-7 py-3.5 bg-blue-600 hover:bg-blue-500 active:scale-[0.98] text-white rounded-xl text-sm font-semibold tracking-wide transition-all shadow-[0_0_25px_rgba(37,99,235,0.4)] focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Launch Recruiter Studio
            </button>
          </div>
        </div>
      </section>

      {/* Editorial Footer */}
      <footer className="border-t border-slate-800/80 py-8 text-center text-xs text-slate-500 bg-[#0B0F19]">
        <div className="max-w-5xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2 text-sm text-slate-300">
            <span className="font-bold">SmartATS</span>
            <span className="text-slate-500 text-xs">&mdash; Explainable Resume Screening Platform</span>
          </div>
          <div className="flex items-center space-x-4 text-xs text-slate-500">
            <span>Deterministic Matching</span>
            <span>&bull;</span>
            <span>Local & Private</span>
            <span>&bull;</span>
            <span>MIT License</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
