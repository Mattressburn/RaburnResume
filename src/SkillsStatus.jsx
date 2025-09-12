// src/SkillsTicker.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";

const VISIBLE_ROWS = 5;     // keep 5 visible
const SPEED_PX_PER_SEC = 12; // adjust smoothness/speed

export default function SkillsTicker({ skills = [], title = "SYSTEM STATUS" }) {
  // duplicate list for seamless loop
  const list = useMemo(() => [...skills, ...skills], [skills]);

  const wrapRef = useRef(null);
  const trackRef = useRef(null);
  const rowHRef = useRef(0);
  const yRef = useRef(0);
  const rafRef = useRef(0);

  const [paused, setPaused] = useState(false);

  // measure first row total height (including margin) and lock wrapper height = 8 rows
  useEffect(() => {
    if (!trackRef.current) return;
    const first = trackRef.current.querySelector("li");
    if (!first) return;

    const rect = first.getBoundingClientRect();
    const styles = getComputedStyle(first);
    const mb = parseFloat(styles.marginBottom || "0");
    const mt = parseFloat(styles.marginTop || "0");
    rowHRef.current = rect.height + mt + mb;

    if (wrapRef.current) {
      wrapRef.current.style.height = `${rowHRef.current * VISIBLE_ROWS}px`;
    }
  }, [skills.length]);

  // smooth ticker using rAF; recycle nodes to keep it seamless
  useEffect(() => {
    let last = performance.now();

    const tick = (now) => {
      const dt = (now - last) / 1000;
      last = now;

      if (!paused && trackRef.current && rowHRef.current) {
        const step = SPEED_PX_PER_SEC * dt;
        yRef.current -= step;

        // when a full row has scrolled out, move it to the end and reset offset
        if (-yRef.current >= rowHRef.current) {
          const first = trackRef.current.firstElementChild;
          if (first) trackRef.current.appendChild(first);
          yRef.current += rowHRef.current;
        }

        trackRef.current.style.transform = `translateY(${yRef.current}px)`;
      }
      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [paused, skills.length]);

  // reset translateY on list size change
  useEffect(() => {
    yRef.current = 0;
    if (trackRef.current) trackRef.current.style.transform = "translateY(0px)";
  }, [skills.length]);

  return (
    <div
      className="w-full rounded-xl border border-zinc-700/70 bg-zinc-900/70"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onTouchStart={() => setPaused(true)}
      onTouchEnd={() => setPaused(false)}
      role="region"
      aria-label={title}
    >
      {/* header */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-zinc-700/60">
        <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" aria-hidden />
        <span className="uppercase tracking-wider text-amber-400 font-semibold text-sm">
          {title}
        </span>
        <span className="ml-auto text-xs text-zinc-400">{paused ? "Paused" : "Auto"}</span>
      </div>

      {/* viewport locked to 8 rows */}
      <div ref={wrapRef} className="overflow-hidden px-4 py-3">
        <ul ref={trackRef} className="will-change-transform">
          {list.map((s, i) => (
            <SkillRow key={`${s.name}-${i}`} {...s} />
          ))}
        </ul>
      </div>
    </div>
  );
}

function SkillRow({ name, percent, learning = false }) {
  const pct = Math.max(0, Math.min(100, Number(percent) || 0));
  const barColor = learning ? "bg-yellow-500" : "bg-emerald-500";

  return (
    <li className="mb-3">
      <div className="flex items-center justify-between mb-1">
        <span className="text-sm text-zinc-200">{name}</span>
        <span className={`text-xs ${learning ? "text-yellow-400" : "text-emerald-400"}`}>
          {pct.toFixed(1)}%{learning ? " • learning" : ""}
        </span>
      </div>
      <div className="h-3 w-full rounded bg-zinc-800 overflow-hidden">
        <div
          className={`h-full ${barColor} transition-[width] duration-700`}
          style={{ width: `${pct}%` }}
          role="progressbar"
          aria-valuenow={pct}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`${name} proficiency`}
        />
      </div>
    </li>
  );
}
