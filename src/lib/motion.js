import { useReducedMotion } from 'framer-motion';

export const ease = [0.2, 0.8, 0.2, 1];

export function useReducedMotionPref() {
  const fm = useReducedMotion();
  const mq =
    typeof window !== 'undefined' &&
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  return Boolean(fm) || mq;
}
