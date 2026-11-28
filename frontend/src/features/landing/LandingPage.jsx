import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { FloatingNav } from '../../components/landing/FloatingNav';
import { HeroSection } from '../../components/landing/HeroSection';
import { AppFrameSection } from '../../components/landing/AppFrameSection';
import { FeaturesGridSection } from '../../components/landing/FeaturesGridSection';
import { ArchitectureSection } from '../../components/landing/ArchitectureSection';
import { ComparisonBandSection } from '../../components/landing/ComparisonBandSection';
import { StatementMomentSection } from '../../components/landing/StatementMomentSection';
import { EvaluationMomentSection } from '../../components/landing/EvaluationMomentSection';
import { FAQSection } from '../../components/landing/FAQSection';
import { FooterSection } from '../../components/landing/FooterSection';
import { useKitStylesheetScope } from '../../utils/kitScope';

let kitBootedOnce = false;

function loadPublicAssetModule(subpath) {
  const url = `${window.location.origin}/assets/${subpath}`;
  return import(/* @vite-ignore */ url);
}

export default function LandingPage() {
  useKitStylesheetScope(true);
  const navigate = useNavigate();
  const mainRef = useRef(null);

  const handleEnterApp = () => {
    navigate('/studio');
  };

  useEffect(() => {
    if (import.meta.env.MODE === 'test') {
      document.documentElement.dataset.ready = '1';
      return undefined;
    }

    let active = true;
    const mountedMoments = [];

    async function bootKit() {
      try {
        const wasBooted = kitBootedOnce;
        kitBootedOnce = true;

        const [sysMod, layoutMod, dgMod, momentsMod] = await Promise.all([
          loadPublicAssetModule('system.js'),
          loadPublicAssetModule('layout/layout.js'),
          loadPublicAssetModule('diagrams/diagram.js'),
          loadPublicAssetModule('moments/moments.js'),
        ]);
        if (!active) return;

        // First import auto-invokes init() inside system.js & layout.js; only re-run on SPA return mounts
        if (wasBooted) {
          if (sysMod?.default?.init) sysMod.default.init();
          if (layoutMod?.default?.init) layoutMod.default.init();
        }
        if (dgMod?.default?.auto && mainRef.current) {
          dgMod.default.auto(mainRef.current);
        }
        if (momentsMod?.mountAll && mainRef.current) {
          const list = await momentsMod.mountAll(mainRef.current);
          if (Array.isArray(list)) mountedMoments.push(...list);
        }
      } catch {
        document.documentElement.dataset.ready = '1';
      }
    }

    bootKit();

    return () => {
      active = false;
      mountedMoments.forEach((el) => {
        try {
          el?.__moment?.destroy?.();
        } catch {
          // ignore cleanup error on unmount
        }
      });
    };
  }, []);

  const canPortal = typeof document !== 'undefined' && Boolean(document.body);

  return (
    <>
      <FloatingNav onEnterApp={handleEnterApp} />

      <main id="top" ref={mainRef}>
        <HeroSection onEnterApp={handleEnterApp} />
        <AppFrameSection />
        <FeaturesGridSection />
        <ArchitectureSection />
        <ComparisonBandSection />
        <StatementMomentSection />
        <EvaluationMomentSection />
        <FAQSection />
      </main>

      <FooterSection onEnterApp={handleEnterApp} />

      {canPortal &&
        createPortal(
          <nav className="actionbar" aria-label="Quick actions">
            <button type="button" className="btn btn--primary" onClick={handleEnterApp}>
              Open the studio
            </button>
          </nav>,
          document.body
        )}
    </>
  );
}
