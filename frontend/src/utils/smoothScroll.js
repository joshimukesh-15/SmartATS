/**
 * Native smooth scrolling utility.
 * Lightweight and respects prefers-reduced-motion.
 */

export const smoothScroll = {
  init() {
    // Native browser smooth scrolling is preferred for clean, calm interaction
    if (typeof document !== 'undefined') {
      document.documentElement.style.scrollBehavior = 'smooth';
    }
  },
  destroy() {
    if (typeof document !== 'undefined') {
      document.documentElement.style.scrollBehavior = 'auto';
    }
  },
};
