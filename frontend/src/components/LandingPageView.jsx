import { useEffect } from 'react';
import FloatingNav from './landing/FloatingNav';
import HeroSection from './landing/HeroSection';
import ProofStrip from './landing/ProofStrip';
import ScoringFormulaSection from './landing/ScoringFormulaSection';
import FeaturesAlternating from './landing/FeaturesAlternating';
import WorkflowSimple from './landing/WorkflowSimple';
import FAQSection from './landing/FAQSection';
import CTASection from './landing/CTASection';
import FooterSection from './landing/FooterSection';
import { smoothScroll } from '../utils/smoothScroll';

export default function LandingPageView({ onLaunchApp }) {
  useEffect(() => {
    smoothScroll.init();
    return () => {
      smoothScroll.destroy();
    };
  }, []);

  return (
    <div className="relative min-h-screen bg-canvas text-ink overflow-x-hidden selection:bg-primary selection:text-on-primary">
      {/* 1. Floating Nav */}
      <FloatingNav onEnterApp={onLaunchApp} />

      {/* 2. Hero Section */}
      <HeroSection onEnterApp={onLaunchApp} />

      {/* 3. Proof Strip */}
      <ProofStrip />

      {/* 4. Signature Section: How Scoring Works */}
      <ScoringFormulaSection />

      {/* 5. Features: 3 Alternating Image + Text Rows */}
      <FeaturesAlternating />

      {/* 6. Workflow: 3 Numbered Steps with Connecting Rule */}
      <WorkflowSimple />

      {/* 7. FAQ: Two Columns with Hairline Dividers */}
      <FAQSection />

      {/* 8. CTA + Minimal Footer */}
      <CTASection onEnterApp={onLaunchApp} />
      <FooterSection onEnterApp={onLaunchApp} />
    </div>
  );
}
