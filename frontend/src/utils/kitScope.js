import { useLayoutEffect } from 'react';

export function syncKitStylesForPath(pathname = '/') {
  if (typeof document === 'undefined') return;
  const isLanding = pathname === '/' || pathname === '/index.html';
  document.querySelectorAll('link[data-kit-style]').forEach((link) => {
    link.disabled = !isLanding;
  });
  const html = document.documentElement;
  if (isLanding) {
    html.setAttribute('data-type', 'software');
    html.setAttribute('data-radius', 'soft');
    html.setAttribute('data-buttons', 'pill');
    html.setAttribute('data-ground', 'sage');
    html.setAttribute('data-motion', '');
  } else {
    html.classList.remove('m-enter', 'm-enter-done', 'mo-js', 'mo-safe');
  }
}

export function useKitStylesheetScope(isLanding) {
  useLayoutEffect(() => {
    syncKitStylesForPath(isLanding ? '/' : '/studio');
  }, [isLanding]);
}
