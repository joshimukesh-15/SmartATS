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
      
      // Calculate viewport progress through section
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
      statusColor: "text-[#1E7E4E] bg-[#EFFBF4] border-[#C2ECD4]",
      matchedSkills: ["Python", "FastAPI", "PostgreSQL", "Docker", "AWS"],
      missingSkills: [],
      preferredSkills: ["Redis", "Kubernetes", "CI/CD", "Git"],
      summary: "Matches every required backend competency with deep demonstrated experience across cloud infrastructure and distributed systems.",
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
      statusColor: "text-[#CC5A36] bg-[#FCF4F0] border-[#F2D6CC]",
      matchedSkills: ["Python", "PostgreSQL", "Docker", "AWS"],
      missingSkills: ["FastAPI"],
      preferredSkills: ["Git", "CI/CD"],
      summary: "Matches 4 out of 5 required technical skills with substantial full stack experience. Only FastAPI needs verification.",
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
      statusColor: "text-[#857F74] bg-[#F3EFEA] border-[#E5DFD5]",
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
    <div className="bg-[#FAF8F5] text-[#141413] min-h-screen font-sans selection:bg-[#CC5A36] selection:text-white">
      
      {/* Floating Navigation Bar */}
      <div className="sticky top-4 z-50 max-w-5xl mx-auto px-4">
        <header className="bg-white/95 backdrop-blur border border-[#E5DFD5] rounded-full px-5 py-2.5 flex items-center justify-between shadow-xs">
          <div className="flex items-center space-x-2.5">
            <div className="w-7 h-7 rounded-full bg-[#141413] flex items-center justify-center text-[#FAF8F5]">
              <span className="font-serif font-bold text-sm">S</span>
            </div>
            <span className="font-serif text-lg font-bold tracking-tight text-[#141413]">
              SmartATS
            </span>
          </div>

          <nav className="hidden md:flex items-center space-x-6 text-xs font-semibold text-[#524E46]">
            <a href="#benefits" className="hover:text-[#141413] transition focus:outline-none focus:text-[#141413]">Benefits</a>
            <a href="#how-it-works" className="hover:text-[#141413] transition focus:outline-none focus:text-[#141413]">How It Works</a>
            <a href="#benchmark" className="hover:text-[#141413] transition focus:outline-none focus:text-[#141413]">Benchmarks</a>
            <a href="#faq" className="hover:text-[#141413] transition focus:outline-none focus:text-[#141413]">FAQ</a>
          </nav>

          <button
            onClick={onLaunchApp}
            className="px-4 py-2 bg-[#141413] hover:bg-[#2B2A27] active:scale-[0.98] text-white rounded-full text-xs font-semibold tracking-wide transition shadow-xs flex items-center space-x-1.5 focus:outline-none focus:ring-2 focus:ring-[#CC5A36]"
          >
            <span>Launch Studio</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </header>
      </div>

      {/* Hero Section */}
      <section className="pt-20 pb-16 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto text-center">
        
        {/* Category Indicator */}
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full border border-[#D4CCC0] bg-white text-[11px] font-mono text-[#524E46] mb-6">
          <span className="w-1.5 h-1.5 rounded-full bg-[#CC5A36]"></span>
          <span>Transparent Resume Screening</span>
        </div>

        {/* Headline (B5: Capped at 680px, gradient text) */}
        <div className="max-w-[680px] mx-auto">
          <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-normal tracking-tight hero-gradient-text leading-[1.08] [text-wrap:balance]">
            Screen hundreds of resumes in minutes without guesswork
          </h1>
        </div>

        {/* Subheadline (B5: Capped at 680px) */}
        <div className="max-w-[680px] mx-auto mt-6">
          <p className="text-base sm:text-lg text-[#524E46] leading-relaxed [text-wrap:pretty]">
            SmartATS automatically identifies qualified engineers, highlights missing skills, and organizes candidates with clear, transparent reasoning.
          </p>
        </div>

        {/* Primary CTA */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={onLaunchApp}
            className="w-full sm:w-auto px-6 py-3 bg-[#CC5A36] hover:bg-[#B84F2E] active:scale-[0.98] text-white rounded-md text-sm font-semibold tracking-wide transition shadow-xs flex items-center justify-center space-x-2 focus:outline-none focus:ring-2 focus:ring-[#CC5A36]"
          >
            <span>Launch Recruiter Studio</span>
            <ArrowRight className="w-4 h-4" />
          </button>
          <a
            href="#how-it-works"
            className="w-full sm:w-auto px-5 py-3 bg-white hover:bg-[#F3EFEA] text-[#141413] border border-[#D4CCC0] rounded-md text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-[#141413]"
          >
            Explore How It Works
          </a>
        </div>

        {/* Proof Line */}
        <div className="mt-5 text-xs text-[#857F74]">
          Tested across multiple engineering roles with 100% extraction accuracy and zero duplicates
        </div>

        {/* Interactive Candidate Evaluation Preview */}
        <div className="mt-14 max-w-4xl mx-auto bg-white border border-[#E5DFD5] rounded-xl p-6 sm:p-8 shadow-xs text-left">
          
          {/* Header with Candidate Switcher */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 border-b border-[#F3EFEA] gap-4">
            <div>
              <div className="text-[11px] uppercase font-mono tracking-wider text-[#857F74]">
                Target Role: Senior Backend Engineer
              </div>
              <div className="flex items-center space-x-3 mt-1">
                <h3 className="font-serif text-2xl font-bold text-[#141413]">
                  {currentCand.name}
                </h3>
                <span className="text-xs text-[#524E46] font-medium">
                  {currentCand.title}
                </span>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${currentCand.statusColor}`}>
                  {currentCand.status}
                </span>
              </div>
            </div>

            {/* Candidate Selector Switcher */}
            <div className="flex bg-[#FAF8F5] border border-[#E5DFD5] p-1 rounded-md">
              {demoCandidates.map((cand, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedDemoCandidate(idx)}
                  className={`px-3 py-1.5 rounded text-xs font-medium transition ${
                    selectedDemoCandidate === idx
                      ? 'bg-[#141413] text-white shadow-xs'
                      : 'text-[#524E46] hover:text-[#141413]'
                  }`}
                >
                  Candidate {idx + 1}
                </button>
              ))}
            </div>
          </div>

          {/* Clean Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 my-6">
            <div className="p-4 bg-[#FAF8F5] rounded-lg border border-[#E5DFD5]">
              <span className="text-[#857F74] text-xs font-medium block">Required Skills</span>
              <span className="font-serif text-3xl font-bold text-[#1E7E4E] block mt-1">
                {currentCand.skillsMatched} of {currentCand.skillsTotal}
              </span>
              <span className="text-xs text-[#524E46] mt-1 block">
                Mandatory qualifications met
              </span>
            </div>

            <div className="p-4 bg-[#FAF8F5] rounded-lg border border-[#E5DFD5]">
              <span className="text-[#857F74] text-xs font-medium block">Experience Match</span>
              <span className="font-serif text-2xl font-bold text-[#141413] block mt-1.5">
                {currentCand.relevanceBadge}
              </span>
              <span className="text-xs text-[#524E46] mt-1 block">
                Relevant engineering context
              </span>
            </div>

            <div className="p-4 bg-white border-2 border-[#141413] rounded-lg">
              <span className="text-[#857F74] text-xs font-medium block">Overall Match</span>
              <span className="font-serif text-3xl font-bold text-[#141413] block mt-1">
                {currentCand.overallScore}%
              </span>
              <span className="text-xs text-[#CC5A36] font-semibold mt-1 block">
                Rank #{currentCand.rank} Recommendation
              </span>
            </div>
          </div>

          {/* Competency Gap Analysis */}
          <div className="space-y-3.5 text-xs border-t border-[#F3EFEA] pt-5">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
              <span className="text-xs font-semibold text-[#1E7E4E] min-w-[150px]">
                Matched Required Skills:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {currentCand.matchedSkills.map((s, i) => (
                  <span key={i} className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-md bg-[#EFFBF4] text-[#1E7E4E] border border-[#C2ECD4] font-medium text-xs">
                    <Check className="w-3 h-3" />
                    <span>{s}</span>
                  </span>
                ))}
              </div>
            </div>

            {currentCand.missingSkills.length > 0 && (
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 pt-1">
                <span className="text-xs font-semibold text-[#B9382C] min-w-[150px]">
                  Missing Required Skills:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {currentCand.missingSkills.map((s, i) => (
                    <span key={i} className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-md bg-[#FDF1F0] text-[#B9382C] border border-[#F5CBC8] font-medium text-xs">
                      <X className="w-3 h-3" />
                      <span>{s}</span>
                    </span>
                  ))}
                </div>
              </div>
            )}

            {currentCand.preferredSkills.length > 0 && (
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 pt-1">
                <span className="text-xs font-semibold text-[#6D59A8] min-w-[150px]">
                  Bonus Qualifications:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {currentCand.preferredSkills.map((s, i) => (
                    <span key={i} className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-md bg-[#F6F3FB] text-[#6D59A8] border border-[#DDD6F3] font-medium text-xs">
                      <Plus className="w-3 h-3" />
                      <span>{s}</span>
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-4 p-3.5 bg-[#FAF8F5] rounded-lg border border-[#E5DFD5] text-xs text-[#524E46] leading-relaxed">
              <strong className="text-[#141413] font-semibold">Recruiter Summary: </strong>
              {currentCand.summary}
            </div>
          </div>

        </div>

      </section>

      {/* Mandatory B11 Tagline Reveal Section */}
      <section ref={taglineRef} className="py-24 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto text-center border-t border-b border-[#E5DFD5] my-10">
        <span className="text-[11px] uppercase font-mono tracking-wider text-[#857F74] block mb-4">
          Core Operating Principle
        </span>
        <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-normal leading-snug tracking-tight">
          {tagWords.map((word, index) => {
            const isRevealed = index < revealedWords;
            return (
              <span
                key={index}
                className={`transition-colors duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                  isRevealed ? 'text-[#141413]' : 'text-[#D4CCC0]'
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
          <span className="text-[11px] uppercase font-mono tracking-wider text-[#857F74]">
            Why Traditional Screening Fails
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#141413] [text-wrap:balance]">
            From black box guesswork to clear candidate evidence
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Legacy ATS */}
          <div className="bg-white border border-[#E5DFD5] rounded-xl p-7 space-y-4">
            <div className="flex items-center space-x-2 text-[#B9382C] text-xs font-semibold uppercase tracking-wider">
              <AlertCircle className="w-4 h-4" />
              <span>Traditional Keyword Filters & Black Box AI</span>
            </div>
            <ul className="space-y-3 text-xs text-[#524E46] leading-relaxed">
              <li className="flex items-start space-x-2">
                <span className="text-[#B9382C] font-bold">✕</span>
                <span>Discards strong engineers due to minor wording differences.</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-[#B9382C] font-bold">✕</span>
                <span>Generates mysterious match percentages with zero explanation.</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-[#B9382C] font-bold">✕</span>
                <span>Recruiters waste hours reviewing identical duplicate submissions.</span>
              </li>
            </ul>
          </div>

          {/* SmartATS Approach */}
          <div className="bg-white border-2 border-[#141413] rounded-xl p-7 space-y-4">
            <div className="flex items-center space-x-2 text-[#1E7E4E] text-xs font-semibold uppercase tracking-wider">
              <CheckCircle2 className="w-4 h-4" />
              <span>The SmartATS Explainable Standard</span>
            </div>
            <ul className="space-y-3 text-xs text-[#141413] leading-relaxed">
              <li className="flex items-start space-x-2">
                <span className="text-[#1E7E4E] font-bold">✓</span>
                <span>Recognizes skills and common aliases accurately across formats.</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-[#1E7E4E] font-bold">✓</span>
                <span>Provides clear reasoning and skill breakdowns for every profile.</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-[#1E7E4E] font-bold">✓</span>
                <span>Instantly flags duplicate resumes and highlights bonus qualifications.</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section id="benefits" className="py-20 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto border-t border-[#E5DFD5] space-y-12">
        <div className="text-center max-w-xl mx-auto space-y-2">
          <span className="text-[11px] uppercase font-mono tracking-wider text-[#857F74]">
            Core Benefits
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#141413] [text-wrap:balance]">
            Built for recruitment clarity and speed
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white border border-[#E5DFD5] rounded-xl p-6 space-y-3 shadow-xs">
            <span className="text-xs text-[#CC5A36] font-semibold tracking-wider block">01 / DEDUPLICATION</span>
            <h3 className="font-serif text-lg font-bold text-[#141413]">Zero duplicate reviews</h3>
            <p className="text-xs text-[#524E46] leading-relaxed [text-wrap:pretty]">
              Cryptographic file verification catches identical submissions instantly, saving hours of redundant screening.
            </p>
          </div>

          <div className="bg-white border border-[#E5DFD5] rounded-xl p-6 space-y-3 shadow-xs">
            <span className="text-xs text-[#CC5A36] font-semibold tracking-wider block">02 / EXPLAINABILITY</span>
            <h3 className="font-serif text-lg font-bold text-[#141413]">Transparent reasoning</h3>
            <p className="text-xs text-[#524E46] leading-relaxed [text-wrap:pretty]">
              Every profile shows which requirements matched and which are missing, creating complete confidence for hiring managers.
            </p>
          </div>

          <div className="bg-white border border-[#E5DFD5] rounded-xl p-6 space-y-3 shadow-xs">
            <span className="text-xs text-[#CC5A36] font-semibold tracking-wider block">03 / SKILL GAPS</span>
            <h3 className="font-serif text-lg font-bold text-[#141413]">Clear gap analysis</h3>
            <p className="text-xs text-[#524E46] leading-relaxed [text-wrap:pretty]">
              Quickly see missing essentials and bonus qualifications so your team can focus technical interviews on the right areas.
            </p>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto border-t border-[#E5DFD5] space-y-12">
        <div className="text-center max-w-xl mx-auto space-y-2">
          <span className="text-[11px] uppercase font-mono tracking-wider text-[#857F74]">
            Screening Workflow
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#141413] [text-wrap:balance]">
            Three steps from resume batch to qualified shortlist
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="space-y-3">
            <span className="font-serif text-4xl text-[#141413] font-light">1.</span>
            <h3 className="font-serif text-lg font-bold text-[#141413]">Upload candidate resumes</h3>
            <p className="text-xs text-[#524E46] leading-relaxed [text-wrap:pretty]">
              Drop PDF and Word documents into the system. Text is extracted cleanly, with automatic character recognition for scanned pages.
            </p>
          </div>

          <div className="space-y-3">
            <span className="font-serif text-4xl text-[#141413] font-light">2.</span>
            <h3 className="font-serif text-lg font-bold text-[#141413]">Analyze qualifications</h3>
            <p className="text-xs text-[#524E46] leading-relaxed [text-wrap:pretty]">
              SmartATS identifies candidate contact details, verifies required skills, and evaluates experience relevance against your opening.
            </p>
          </div>

          <div className="space-y-3">
            <span className="font-serif text-4xl text-[#141413] font-light">3.</span>
            <h3 className="font-serif text-lg font-bold text-[#141413]">Compare and shortlist</h3>
            <p className="text-xs text-[#524E46] leading-relaxed [text-wrap:pretty]">
              Review the ranked leaderboard, compare top candidates side-by-side on a skills matrix, and export shortlists to CSV.
            </p>
          </div>
        </div>
      </section>

      {/* Benchmark & Verification Proof */}
      <section id="benchmark" className="py-20 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto border-t border-[#E5DFD5] space-y-8">
        <div className="text-center max-w-xl mx-auto space-y-2">
          <span className="text-[11px] uppercase font-mono tracking-wider text-[#857F74]">
            Verified Performance
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#141413] [text-wrap:balance]">
            Fast, reliable, and audited
          </h2>
          <p className="text-xs text-[#524E46] [text-wrap:pretty]">
            Tested against standard candidate datasets with verified benchmarks.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white border border-[#E5DFD5] rounded-xl p-5 text-center shadow-xs">
            <span className="font-serif text-3xl font-bold text-[#141413] block">100%</span>
            <span className="text-xs text-[#857F74] mt-1 block">Contact Extraction</span>
          </div>
          <div className="bg-white border border-[#E5DFD5] rounded-xl p-5 text-center shadow-xs">
            <span className="font-serif text-3xl font-bold text-[#141413] block">99%</span>
            <span className="text-xs text-[#857F74] mt-1 block">Skill Recognition</span>
          </div>
          <div className="bg-white border border-[#E5DFD5] rounded-xl p-5 text-center shadow-xs">
            <span className="font-serif text-3xl font-bold text-[#141413] block">3.8ms</span>
            <span className="text-xs text-[#857F74] mt-1 block">Speed per Resume</span>
          </div>
          <div className="bg-white border border-[#E5DFD5] rounded-xl p-5 text-center shadow-xs">
            <span className="font-serif text-3xl font-bold text-[#141413] block">0</span>
            <span className="text-xs text-[#857F74] mt-1 block">Duplicate Errors</span>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-20 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto border-t border-[#E5DFD5] space-y-10">
        <div className="text-center space-y-2">
          <span className="text-[11px] uppercase font-mono tracking-wider text-[#857F74]">
            Frequently Asked Questions
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#141413] [text-wrap:balance]">
            Everything you need to know
          </h2>
        </div>

        <div className="divide-y divide-[#E5DFD5] border-t border-b border-[#E5DFD5]">
          {faqs.map((faq, idx) => (
            <div key={idx} className="py-4">
              <button
                type="button"
                onClick={() => toggleFaq(idx)}
                className="w-full flex items-center justify-between text-left font-serif text-base font-bold text-[#141413] hover:text-[#CC5A36] transition py-1 focus:outline-none focus:text-[#CC5A36]"
              >
                <span>{faq.q}</span>
                <ChevronDown className={`w-4 h-4 text-[#857F74] transition-transform duration-300 ${openFaq === idx ? 'rotate-180' : ''}`} />
              </button>
              {openFaq === idx && (
                <div className="mt-2 text-xs text-[#524E46] leading-relaxed font-sans pr-6 [text-wrap:pretty]">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Risk Reversal & Final CTA */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto text-center space-y-6">
        <div className="bg-[#141413] text-[#FAF8F5] border border-[#2B2A27] rounded-xl p-10 sm:p-12 space-y-6 shadow-sm">
          <h2 className="font-serif text-3xl sm:text-4xl font-normal text-[#FAF8F5] [text-wrap:balance]">
            Experience clear, transparent candidate screening today
          </h2>
          <p className="text-xs text-[#B8B2A7] max-w-lg mx-auto font-sans leading-relaxed [text-wrap:pretty]">
            Zero cloud subscriptions. Private local document processing with Python, FastAPI, and React. Your candidate data stays entirely on your own machine.
          </p>
          <div className="pt-2">
            <button
              onClick={onLaunchApp}
              className="px-6 py-3 bg-[#CC5A36] hover:bg-[#B84F2E] active:scale-[0.98] text-white rounded-md text-sm font-semibold tracking-wide transition shadow-xs focus:outline-none focus:ring-2 focus:ring-[#CC5A36]"
            >
              Launch Recruiter Studio
            </button>
          </div>
        </div>
      </section>

      {/* Editorial Footer */}
      <footer className="border-t border-[#E5DFD5] py-8 text-center text-xs text-[#857F74] bg-[#FAF8F5]">
        <div className="max-w-5xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2 font-serif text-sm text-[#141413]">
            <span className="font-bold">SmartATS</span>
            <span className="text-[#857F74] text-xs font-sans">&mdash; Explainable Resume Screening Platform</span>
          </div>
          <div className="flex items-center space-x-4 text-xs text-[#857F74]">
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
