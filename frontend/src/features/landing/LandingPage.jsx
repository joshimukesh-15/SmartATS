import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import FloatingNav from '../../components/landing/FloatingNav';
import HeroSection from '../../components/landing/HeroSection';
import ProofStrip from '../../components/landing/ProofStrip';
import ScoringFormulaSection from '../../components/landing/ScoringFormulaSection';
import FeaturesAlternating from '../../components/landing/FeaturesAlternating';
import WorkflowSimple from '../../components/landing/WorkflowSimple';
import FAQSection from '../../components/landing/FAQSection';
import CTASection from '../../components/landing/CTASection';
import FooterSection from '../../components/landing/FooterSection';
import { smoothScroll } from '../../utils/smoothScroll';

export default function LandingPage() {
  const navigate = useNavigate();

  useEffect(() => {
    smoothScroll.init();
    return () => {
      smoothScroll.destroy();
    };
  }, []);

  const handleLaunchApp = () => {
    navigate('/studio');
  };

  return (
    <div className="relative min-h-screen bg-canvas text-ink overflow-x-hidden selection:bg-primary selection:text-on-primary">
      {/* 1. Floating Nav */}
      <FloatingNav onEnterApp={handleLaunchApp} />

      {/* 2. Hero Section */}
      <HeroSection onEnterApp={handleLaunchApp} />

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
      <CTASection onEnterApp={handleLaunchApp} />
      <FooterSection onEnterApp={handleLaunchApp} />
    </div>
  );
}
