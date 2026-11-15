/**
 * Lenis-style smooth virtual scroll engine
 * Implements smooth linear interpolation (lerp) via requestAnimationFrame
 * Automatically disables if prefers-reduced-motion is active.
 */

class SmoothScrollEngine {
  constructor() {
    this.target = window.scrollY;
    this.current = window.scrollY;
    this.ease = 0.085; // smooth friction
    this.isRunning = false;
    this.rafId = null;
    this.isReducedMotion = false;
  }

  init() {
    if (typeof window === 'undefined') return;

    // Check prefers-reduced-motion
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    this.isReducedMotion = mediaQuery.matches;
    mediaQuery.addEventListener('change', (e) => {
      this.isReducedMotion = e.matches;
    });

    if (this.isReducedMotion) return;

    // Intercept wheel for smooth interpolation
    window.addEventListener(
      'wheel',
      (e) => {
        if (this.isReducedMotion) return;
        // Don't intercept if modifier keys pressed or in nested scrollable elements
        if (e.ctrlKey || e.metaKey || e.altKey) return;
        
        let node = e.target;
        while (node && node !== document.body) {
          if (node.classList && (node.classList.contains('table-wrapper') || node.classList.contains('overflow-y-auto'))) {
            return; // let child scroll natively
          }
          node = node.parentElement;
        }

        e.preventDefault();
        const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
        this.target = Math.min(Math.max(this.target + e.deltaY * 1.15, 0), maxScroll);

        if (!this.isRunning) {
          this.isRunning = true;
          this.tick();
        }
      },
      { passive: false }
    );

    // Sync on native programmatic scroll or touch
    window.addEventListener('scroll', () => {
      if (!this.isRunning) {
        this.current = window.scrollY;
        this.target = window.scrollY;
      }
    }, { passive: true });
  }

  tick() {
    if (this.isReducedMotion) {
      this.isRunning = false;
      return;
    }

    const diff = this.target - this.current;
    if (Math.abs(diff) < 0.5) {
      this.current = this.target;
      window.scrollTo(0, this.current);
      this.isRunning = false;
      return;
    }

    this.current += diff * this.ease;
    window.scrollTo(0, this.current);
    this.rafId = requestAnimationFrame(() => this.tick());
  }

  destroy() {
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
    }
    this.isRunning = false;
  }
}

export const smoothScroll = new SmoothScrollEngine();
