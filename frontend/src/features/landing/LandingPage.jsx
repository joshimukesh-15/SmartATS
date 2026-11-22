import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import FloatingNav from '../../components/landing/FloatingNav';
import HeroSection from '../../components/landing/HeroSection';
import EnterpriseLogos from '../../components/landing/EnterpriseLogos';
import ProofStrip from '../../components/landing/ProofStrip';
import ScoringFormulaSection from '../../components/landing/ScoringFormulaSection';
import EnterpriseComparison from '../../components/landing/EnterpriseComparison';
import EnterpriseSecurity from '../../components/landing/EnterpriseSecurity';
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
      {/* 1. Floating Enterprise Navigation */}
      <FloatingNav onEnterApp={handleLaunchApp} />

      {/* 2. Enterprise Hero Section with Live Interactive Ranking Demo */}
      <HeroSection onEnterApp={handleLaunchApp} />

      {/* 3. Global Enterprise Logo Marquee */}
      <EnterpriseLogos />

      {/* 4. Precision Proof & Benchmark Metrics */}
      <ProofStrip />

      {/* 5. Signature Explainable 4-Pillar Scoring Formula */}
      <div id="scoring">
        <ScoringFormulaSection />
      </div>

      {/* 6. Three-Way Enterprise Architecture Comparison */}
      <div id="comparison">
        <EnterpriseComparison />
      </div>

      {/* 7. Enterprise Security, Privacy & Bias-Audit Governance */}
      <div id="security">
        <EnterpriseSecurity />
      </div>

      {/* 8. Core Product Modules */}
      <div id="features">
        <FeaturesAlternating />
      </div>

      {/* 9. Three-Step Workflow */}
      <div id="workflow">
        <WorkflowSimple />
      </div>

      {/* 10. Enterprise FAQ */}
      <div id="faq">
        <FAQSection />
      </div>

      {/* 11. High-Impact Call to Action */}
      <CTASection onEnterApp={handleLaunchApp} />

      {/* 12. Enterprise Multi-Column Footer */}
      <FooterSection onEnterApp={handleLaunchApp} />
    </div>
  );
}
