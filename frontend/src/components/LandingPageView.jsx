import React, { useEffect } from 'react';
import FloatingNav from './landing/FloatingNav';
import HeroSection from './landing/HeroSection';
import SkillsMarquee from './landing/SkillsMarquee';
import BentoBenefits from './landing/BentoBenefits';
import WorkflowSticky from './landing/WorkflowSticky';
import StatsBand from './landing/StatsBand';
import ProductShowcase from './landing/ProductShowcase';
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
    <div className="relative min-h-screen bg-[#FBF7F2] text-[#2A1015] overflow-x-hidden selection:bg-[#7B1E3A] selection:text-white">
      
      {/* 1. Floating Nav */}
      <FloatingNav onEnterApp={onLaunchApp} />

      {/* 2. Hero Section (Two-Column + 3D Tilted Mockup + Parallax Floating Chips + Slanted Bottom) */}
      <HeroSection onEnterApp={onLaunchApp} />

      {/* 3. Skills Marquee (Infinite Horizontal Scroll with Edge Mask Fades) */}
      <SkillsMarquee />

      {/* 4. Core Benefits as Bento Grid (2x2 Cut-Corner + Cursor Spotlight + 1x1 + 1x1 + 2x1 Wide) */}
      <BentoBenefits />

      {/* 5. Workflow (Sticky-Scroll with Vertical Progress Line + 3 Tall Panels + Watermark Numerals) */}
      <WorkflowSticky />

      {/* 6. Stats Band (Full-Width Dark Band with Diagonal Clip-Path + Count-Up + Gold Dividers) */}
      <StatsBand />

      {/* 7. Product Showcase (Large Browser Mockup with Inset Clip-Path Reveal on Scroll) */}
      <ProductShowcase onEnterApp={onLaunchApp} />

      {/* 8. FAQ (Two Columns: Sticky Left + Smooth Animated Accordion with Rotating Plus Right) */}
      <FAQSection />

      {/* 9. CTA Block (Arched Top Ellipse + Subtle Grain + Cursor Spotlight + Big Serif + Gold Button) */}
      <CTASection onEnterApp={onLaunchApp} />

      {/* 10. Footer (Minimal Links Row + Oversized 18vw Cropped Serif Wordmark at 8% Opacity) */}
      <FooterSection onEnterApp={onLaunchApp} />

    </div>
  );
}
