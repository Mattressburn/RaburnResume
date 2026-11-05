import { useReducedMotion } from 'framer-motion';

export const ease = [0.2, 0.8, 0.2, 1];

export function useReducedMotionPref() {
  const fm = useReducedMotion();
  // matchMedia is read live: framer caches its answer once per page load, which goes stale in tests.
  if (typeof window !== 'undefined' && typeof window.matchMedia === 'function') {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }
  return Boolean(fm);
}

export const heroTimings = { status: 0, headline: 0.1, lede: 0.45, metrics: 0.6, diagram: 0.4, actions: 0.9 };
