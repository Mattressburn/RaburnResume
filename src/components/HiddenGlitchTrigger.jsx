import React, { useState, useEffect, useRef, useCallback } from "react";

/**
 * HiddenGlitchTrigger — Project Chronos Era Cycler
 * ─────────────────────────────────────────────────
 * Nearly-invisible 64×64 button fixed at top-4 right-4, z-[100].
 * Every 8 s it spikes opacity to 0.4 + skewX(20deg) for ~500 ms.
 * Click cycles: 0→1→2→3→4→0…
 */

const ERA_LABELS = ["1982", "1995", "2005", "2026", "FILE"];

export default function HiddenGlitchTrigger({ onCycleEra, currentEra }) {
  const [glitching, setGlitching] = useState(false);
  const timerRef = useRef(null);

  const scheduleGlitch = useCallback(() => {
    timerRef.current = setTimeout(() => {
      setGlitching(true);
      setTimeout(() => {
        setGlitching(false);
        scheduleGlitch();
      }, 500);
    }, 8000);
  }, []);

  useEffect(() => {
    scheduleGlitch();
    return () => clearTimeout(timerRef.current);
  }, [scheduleGlitch]);

  return (
    <button
      className={`glitch-trigger ${glitching ? "glitching" : ""}`}
      onClick={onCycleEra}
      data-text={ERA_LABELS[currentEra]}
      aria-label="Cycle temporal era"
      type="button"
    >
      ▸ {ERA_LABELS[currentEra]}
    </button>
  );
}
