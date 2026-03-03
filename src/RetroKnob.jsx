import React, { useCallback, useEffect, useMemo, useRef } from "react";

/* ─── Mechanical tick via Web Audio API ─── */
const AudioCtx = typeof window !== "undefined" && (window.AudioContext || window.webkitAudioContext);
let _audioCtx = null;
function getAudioCtx() {
  if (!_audioCtx && AudioCtx) _audioCtx = new AudioCtx();
  return _audioCtx;
}
function playTick() {
  const ctx = getAudioCtx();
  if (!ctx) return;
  // Resume context if suspended (autoplay policy)
  if (ctx.state === "suspended") ctx.resume();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = "square";
  osc.frequency.setValueAtTime(1800, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(600, ctx.currentTime + 0.03);
  gain.gain.setValueAtTime(0.08, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.06);
  osc.connect(gain).connect(ctx.destination);
  osc.start(ctx.currentTime);
  osc.stop(ctx.currentTime + 0.06);
}

/**
 * RetroKnob (pointer-events based)
 * props:
 *  - value (number)
 *  - min, max (number)
 *  - step (number, default 1)
 *  - onChange(nextNumber)
 *  - label (string)
 */
export default function RetroKnob({ value, min, max, step = 1, onChange, label }) {
  const el = useRef(null);
  const lastTickAngle = useRef(null);

  // guard: avoid NaN / bad ranges
  const [lo, hi] = useMemo(() => {
    const a = Number.isFinite(min) ? min : 0;
    const b = Number.isFinite(max) ? max : a + 1;
    return a <= b ? [a, b] : [b, a];
  }, [min, max]);

  const clamped = useMemo(() => Math.min(hi, Math.max(lo, value ?? lo)), [value, lo, hi]);

  // map value -> angle (-135..+135)
  const angle = useMemo(() => {
    const t = (clamped - lo) / Math.max(1e-9, hi - lo);
    return -135 + t * 270;
  }, [clamped, lo, hi]);

  // Fire mechanical tick every 15° of rotation
  useEffect(() => {
    el.current?.style.setProperty("--angle", `${angle}deg`);
    if (lastTickAngle.current === null) {
      lastTickAngle.current = angle;
      return;
    }
    if (Math.abs(angle - lastTickAngle.current) >= 15) {
      playTick();
      lastTickAngle.current = angle;
    }
  }, [angle]);

  const snap = (v) => {
    const s = Math.max(step || 1, 1);
    const n = Math.round(v / s) * s;
    return Math.min(hi, Math.max(lo, n));
  };

  const setFromDeg = (deg) => {
    // clamp to [-135..135]
    const d = Math.max(-135, Math.min(135, deg));
    const t = (d + 135) / 270; // 0..1
    const next = lo + t * (hi - lo);
    onChange?.(snap(next));
  };

  // Pointer events for drag
  const onPointerDown = (e) => {
    const target = el.current;
    if (!target) return;
    target.setPointerCapture?.(e.pointerId);

    const updateFromEvent = (ev) => {
      const r = target.getBoundingClientRect();
      const cx = r.left + r.width / 2;
      const cy = r.top + r.height / 2;
      const x = (ev.clientX ?? 0) - cx;
      const y = (ev.clientY ?? 0) - cy;
      // screen y+ downward, so use atan2(y, x)
      let deg = (Math.atan2(y, x) * 180) / Math.PI; // -180..180
      // make top the minimum (-135ish)
      deg = deg + 90;
      setFromDeg(deg);
    };

    updateFromEvent(e);

    const move = (ev) => {
      ev.preventDefault();
      updateFromEvent(ev);
    };
    const up = (ev) => {
      target.releasePointerCapture?.(ev.pointerId);
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      window.removeEventListener("pointercancel", up);
    };

    window.addEventListener("pointermove", move, { passive: false });
    window.addEventListener("pointerup", up);
    window.addEventListener("pointercancel", up);
  };

  // Keyboard + wheel for accessibility
  const stepSmall = step || 1;
  const stepBig = Math.max(stepSmall * 5, 5);

  const onKeyDown = (e) => {
    if (e.key === "ArrowLeft" || e.key === "ArrowDown") onChange?.(snap(clamped - stepSmall));
    if (e.key === "ArrowRight" || e.key === "ArrowUp") onChange?.(snap(clamped + stepSmall));
    if (e.key === "PageDown") onChange?.(snap(clamped - stepBig));
    if (e.key === "PageUp") onChange?.(snap(clamped + stepBig));
    if (e.key === "Home") onChange?.(lo);
    if (e.key === "End") onChange?.(hi);
  };

  const onWheel = (e) => {
    e.preventDefault();
    const dir = e.deltaY > 0 ? -1 : 1;
    onChange?.(snap(clamped + dir * stepSmall));
  };

  return (
    <div className="inline-flex flex-col items-center">
      <div
        ref={el}
        className="knob-dial"
        role="slider"
        aria-valuemin={lo}
        aria-valuemax={hi}
        aria-valuenow={clamped}
        aria-label={label || "Knob"}
        tabIndex={0}
        onPointerDown={onPointerDown}
        onKeyDown={onKeyDown}
        onWheel={onWheel}
      />
      {label && <div className="text-[10px] text-zinc-500 uppercase tracking-widest mt-1" style={{ fontFamily: "var(--font-pixel)", fontSize: '12px' }}>{label}</div>}
    </div>
  );
}
