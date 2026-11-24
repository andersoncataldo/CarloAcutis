import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const MAX_SCROLL_ATTEMPTS = 25;
const ATTEMPT_INTERVAL_MS = 60;

export default function ScrollToTop() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (!hash) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    const id = hash.replace('#', '');
    let attempts = 0;
    let timerId: number | null = null;
    let cancelled = false;

    const tryScroll = () => {
      if (cancelled) return;
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
        return;
      }
      attempts += 1;
      if (attempts < MAX_SCROLL_ATTEMPTS) {
        timerId = window.setTimeout(tryScroll, ATTEMPT_INTERVAL_MS);
      }
    };

    // Aguarda a transição de saída do AnimatePresence (220ms) e eventual lazy chunk.
    timerId = window.setTimeout(tryScroll, 240);

    return () => {
      cancelled = true;
      if (timerId !== null) window.clearTimeout(timerId);
    };
  }, [pathname, hash]);

  return null;
}
