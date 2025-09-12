import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";

/**
 * JumpingCat
 * A tiny black cat that hops between target elements and "climbs" up them.
 *
 * Usage:
 *   1) Mark any elements you want the cat to visit with the attribute: data-cat-target
 *      e.g. <section data-cat-target>...</section>
 *   2) Mount <JumpingCat /> once near the root of your app.
 *
 * Props:
 *   targetSelector: string (default: '[data-cat-target]')
 *   hopIntervalMs: number time at each perch before next hop (default: 2800)
 *   speed: number base speed multiplier for jumps/climbs (default: 1)
 *   size: number pixel width of the cat (default: 42)
 *   zIndex: number stacking context (default: 9999)
 *   debug: boolean render target markers (default: false)
 */
export default function JumpingCat({
  targetSelector = "[data-cat-target]",
  hopIntervalMs = 2800,
  speed = 1,
  size = 42,
  zIndex = 9999,
  debug = false,
}) {
  const portalRoot = useMemo(() => {
    let root = document.getElementById("jumping-cat-root");
    if (!root) {
      root = document.createElement("div");
      root.id = "jumping-cat-root";
      document.body.appendChild(root);
    }
    return root;
  }, []);

  const targetsRef = useRef([]);
  const [idx, setIdx] = useState(0);
  const [paused, setPaused] = useState(false);
  const [ready, setReady] = useState(false);

  // Current viewport-pos of the cat
  const [pos, setPos] = useState({ x: 100, y: 100 });
  const [faceLeft, setFaceLeft] = useState(false);
  const [phase, setPhase] = useState(/** 'perch' | 'jump' | 'climb' */ "perch");
  const catRef = useRef(null);

  // Helper: convert document coords to viewport coords
  const toViewport = (docX, docY) => ({ x: docX - window.scrollX, y: docY - window.scrollY });

  // Measure all targets (document coordinates)
  const measureTargets = () => {
    const nodes = Array.from(document.querySelectorAll(targetSelector)).filter(
      (n) => n.offsetWidth && n.offsetHeight
    );
    const items = nodes.map((el) => {
      const r = el.getBoundingClientRect();
      const doc = { left: r.left + window.scrollX, top: r.top + window.scrollY, width: r.width, height: r.height };
      const centerBottom = { x: doc.left + doc.width / 2, y: doc.top + doc.height - 8 };
      const leftEdge = { x: doc.left + 10, y: doc.top + doc.height - 8 };
      const topPerch = { x: doc.left + doc.width / 2, y: doc.top - 4 };
      return { el, rectDoc: doc, centerBottom, leftEdge, topPerch };
    });
    targetsRef.current = items;
    return items;
  };

  // Initial target capture & on resize/scroll we re-measure
  useLayoutEffect(() => {
    const items = measureTargets();
    setReady(items.length > 0);
    if (items.length) {
      const first = items[0];
      const vp = toViewport(first.centerBottom.x, first.centerBottom.y);
      setPos({ x: vp.x, y: vp.y });
    }
    const ro = new ResizeObserver(() => measureTargets());
    items.forEach((t) => ro.observe(t.el));
    const onScroll = () => measureTargets();
    const onResize = () => measureTargets();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      ro.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [targetSelector]);

  // Hop timer
  useEffect(() => {
    if (!ready || paused || targetsRef.current.length === 0) return;
    let cancelled = false;

    const go = async () => {
      const items = targetsRef.current;
      const nextIdx = (idx + 1) % items.length;
      const current = items[idx];
      const next = items[nextIdx];

      // Decide face direction
      setFaceLeft(next.centerBottom.x < current.centerBottom.x);

      // 1) JUMP to base (center-bottom) of next target with an arc
      setPhase("jump");
      await animateArcTo(next.centerBottom, 750 / speed);

      // 2) If cat is below the top of the element by > 24px, climb up to top edge
      if (next.topPerch.y + 24 < next.centerBottom.y) {
        setPhase("climb");
        await animateClimb(next);
      }

      // Perch briefly
      setPhase("perch");
      setIdx(nextIdx);
    };

    // start then set a dwell timeout
    const id = setTimeout(() => {
      if (!cancelled) go();
    }, hopIntervalMs);

    return () => {
      cancelled = true;
      clearTimeout(id);
    };
  }, [idx, ready, paused, hopIntervalMs, speed]);

  // === Animations ===
  const animateArcTo = (docPoint, duration) =>
    new Promise((resolve) => {
      const start = performance.now();
      const from = pos; // viewport coords
      const destVp = toViewport(docPoint.x, docPoint.y);
      const dx = destVp.x - from.x;
      const dy = destVp.y - from.y;
      const peak = -Math.max(60, Math.min(160, Math.hypot(dx, dy) * 0.25));

      const step = (t) => {
        const p = Math.min(1, (t - start) / duration);
        // easeInOutCubic
        const e = p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2;
        // Parametric arc using a simple parabola along progress
        const x = from.x + dx * e;
        const y = from.y + dy * e + peak * Math.sin(Math.PI * e);
        setPos({ x, y });
        if (p < 1) requestAnimationFrame(step);
        else resolve();
      };
      requestAnimationFrame(step);
    });

  const animateClimb = (target) =>
    new Promise((resolve) => {
      const destVp = toViewport(target.topPerch.x, target.topPerch.y);
      const start = performance.now();
      const from = { ...pos };
      const duration = Math.max(400, Math.min(1400, (from.y - destVp.y) * 4)) / speed;

      const step = (t) => {
        const p = Math.min(1, (t - start) / duration);
        // easeOutCubic
        const e = 1 - Math.pow(1 - p, 3);
        const xWobble = Math.sin(e * Math.PI * 6) * 2; // pawing side-to-side
        const x = from.x + (destVp.x - from.x) * 0.25 + xWobble; // drift towards edge
        const y = from.y + (destVp.y - from.y) * e;
        setPos({ x, y });
        if (p < 1) requestAnimationFrame(step);
        else resolve();
      };
      requestAnimationFrame(step);
    });

  const handleToggle = () => setPaused((p) => !p);

// --- Pixel-art cat (16x16). Replace your existing CatSVG with this ---
const CatSVG = ({ facingLeft }) => {
  // 16x16 grid; '1' = body, 'w' = eye
  const grid = [
    "....11..11......",
    "...11111111.....",
    "..1111111111....",
    "..11w11..11w11..",
    "..1111111111....",
    "....1111........",
    "..111111111111..",
    ".11111111111111.",
    ".11111111111111.",
    "..........11111.",
    ".........11111..",
    "........11111...",
    "..111.......111.",
    "..111.......111.",
    "................",
    "................",
  ];

  const colors = {
    "1": "#0b0b0b",   // body (near-black)
    "w": "#f8fafc",   // eye whites
  };

  const px = 1; // each grid cell is 1x1 in the SVG viewBox

  return (
    <svg
      viewBox={`0 0 ${grid[0].length} ${grid.length}`}
      width={size}
      height={size}
      xmlns="http://www.w3.org/2000/svg"
      style={{
        transform: `scaleX(${facingLeft ? -1 : 1})`,
        imageRendering: "pixelated",
        shapeRendering: "crispEdges",
      }}
      aria-hidden="true"
    >
      {/* soft halo so it reads on dark bg */}
      <defs>
        <filter id="halo" x="-50%" y="-50%" width="200%" height="200%">
          <feDropShadow dx="0" dy="0" stdDeviation="0.6" floodColor="#ffffff" floodOpacity="0.18" />
        </filter>
      </defs>
      <g filter="url(#halo)">
        {grid.map((row, y) =>
          row.split("").map((ch, x) =>
            ch === "." ? null : (
              <rect key={`${x}-${y}`} x={x * px} y={y * px} width={px} height={px} fill={colors[ch]} />
            )
          )
        )}
      </g>
    </svg>
  );
};


  const Cat = (
    <div
      style={{ position: "fixed", left: 0, top: 0, width: 0, height: 0, pointerEvents: "none", zIndex }}
      aria-hidden
    >
      <motion.div
        ref={catRef}
        initial={false}
        animate={{ x: pos.x, y: pos.y, rotate: phase === "jump" ? (faceLeft ? -8 : 8) : 0 }}
        transition={{ type: "spring", stiffness: 220, damping: 24, mass: 0.6 }}
        style={{ position: "absolute", willChange: "transform" }}
      >
        <motion.div
          onPointerDown={handleToggle}
          style={{ cursor: "pointer", pointerEvents: "auto", boxShadow: "0 0 4px rgba(255,255,255,.15), 0 0 6px rgba(57,255,20,.10)" }}
          animate={{
            y: phase === "perch" ? [0, -2, 0] : 0,
            rotate: phase === "climb" ? [0, -2, 2, -2, 0] : 0,
            scale: paused ? 0.9 : 1,
            filter: paused ? "grayscale(0.2) brightness(0.95)" : "none",
          }}
          transition={{
            y: phase === "perch" ? { repeat: Infinity, repeatType: "mirror", duration: 1.2 } : { duration: 0.2 },
            rotate: phase === "climb" ? { repeat: Infinity, duration: 0.6 } : { duration: 0.2 },
          }}
          title={paused ? "Cat paused. Click to resume." : "Meow! Click to pause me."}
        >
          <CatSVG facingLeft={faceLeft} />
        </motion.div>
      </motion.div>

      {/* Optional target markers for debugging */}
      <AnimatePresence>
        {debug && targetsRef.current.map((t, i) => {
          const vpB = toViewport(t.centerBottom.x, t.centerBottom.y);
          const vpT = toViewport(t.topPerch.x, t.topPerch.y);
          return (
            <>
              <motion.div
                key={`b-${i}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.5 }}
                exit={{ opacity: 0 }}
                style={{ position: "fixed", left: vpB.x - 4, top: vpB.y - 4, width: 8, height: 8, borderRadius: 9999, background: "#22d3ee" }}
              />
              <motion.div
                key={`t-${i}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.5 }}
                exit={{ opacity: 0 }}
                style={{ position: "fixed", left: vpT.x - 4, top: vpT.y - 4, width: 8, height: 8, borderRadius: 9999, background: "#a78bfa" }}
              />
            </>
          );
        })}
      </AnimatePresence>
    </div>
  );

  if (!portalRoot) return null;
  return createPortal(Cat, portalRoot);
}
