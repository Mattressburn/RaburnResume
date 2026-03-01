import { useEffect, useMemo, useRef, useState } from "react";

const ALL_MESSAGES = [
  { level: "INFO", text: "Monitoring system performance... All systems nominal" },
  { level: "INFO", text: "PowerShell script execution completed successfully" },
  { level: "INFO", text: "License server health check: PASSED" },
  { level: "INFO", text: "AI automation routine: Processing workload optimization" },
  { level: "INFO", text: "Network connectivity verified across all nodes" },
  { level: "INFO", text: "Documentation update: SOPs synchronized" },
  { level: "WARN", text: "Mobile Devices must triple tap for Konami Code" },
  { level: "INFO", text: "Backup verification: All data integrity checks passed" },
  { level: "INFO", text: "Konami Code: READY" },
  { level: "INFO", text: "Security audit scan completed: No anomalies detected" },
  { level: "INFO", text: "Patch baseline applied: All endpoints up to date" },
  { level: "INFO", text: "VPN tunnel secured. Productivity restored." },
  { level: "WARN", text: "Diet Mt Dew consumption levels: CRITICAL" },
  { level: "WARN", text: "Cat on keyboard: Input stream compromised" },
  { level: "INFO", text: "Mechanical keyboard detected: +10 sysadmin charisma" },
  { level: "INFO", text: "Vinyl record spinning: Dev environment stabilized" },
  { level: "INFO", text: "Hint: ↑ ↑ ↓ ↓ ← → ← → B A" },
  { level: "INFO", text: "Operator tip: Some codes are classics for a reason" },
  { level: "ERROR", text: "Disk quota exceeded: Clean up required!" },
];

/* helpers */
const levelColor = { INFO: "text-cyan-400", WARN: "text-amber-400", ERROR: "text-red-400" };
const ts = () => new Date().toISOString().slice(0, 19).replace("T", " ");
const uid = () => `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

function pickRandomMessage(prevText) {
  if (ALL_MESSAGES.length === 1) return ALL_MESSAGES[0];
  let msg;
  do {
    msg = ALL_MESSAGES[Math.floor(Math.random() * ALL_MESSAGES.length)];
  } while (msg.text === prevText);
  return msg;
}

export default function LogTicker({
  intervalMs = 3500,   // time between *new* lines
  typeSpeed = 25,      // ms per character
  height = 220,        // ticker body height
  showCursor = true,   // blinking cursor while typing
}) {
  const containerRef = useRef(null);
  const rowRef = useRef(null);

  // avoid stale closures
  const visibleRowsRef = useRef(8);
  const lastTextRef = useRef(null);

  const [visibleRows, setVisibleRows] = useState(8);
  const [logs, setLogs] = useState([]);
  const [typingId, setTypingId] = useState(null); // which row is currently typing

  useEffect(() => { visibleRowsRef.current = visibleRows; }, [visibleRows]);

  /* measure how many rows fit (container height / line-height) */
  useEffect(() => {
    const el = containerRef.current;
    const rowEl = rowRef.current;
    if (!el || !rowEl) return;

    const compute = () => {
      const containerH = el.clientHeight || 0;
      const styles = getComputedStyle(rowEl);
      let lh = parseFloat(styles.lineHeight);
      if (!Number.isFinite(lh) || lh <= 0) {
        const rect = rowEl.getBoundingClientRect();
        lh = rect.height || 20;
      }
      setVisibleRows(Math.max(1, Math.floor(containerH / lh)));
    };

    compute();
    const ro = new ResizeObserver(compute);
    ro.observe(el);
    window.addEventListener("resize", compute);
    return () => { ro.disconnect(); window.removeEventListener("resize", compute); };
  }, []);

  /* seed a first line immediately */
  useEffect(() => {
    if (logs.length === 0) {
      const first = { id: uid(), ts: ts(), ...pickRandomMessage(null), typed: "" };
      lastTextRef.current = first.text;
      setTypingId(first.id);
      setLogs([first]);
    }
  }, [logs.length]);

  /* add new lines on a stable timer (recursive setTimeout) */
  useEffect(() => {
    let cancelled = false;

    const loop = () => {
      if (cancelled) return;
      const next = { id: uid(), ts: ts(), ...pickRandomMessage(lastTextRef.current), typed: "" };
      lastTextRef.current = next.text;
      setTypingId(next.id);
      setLogs((prev) => [...prev, next].slice(-visibleRowsRef.current));
      setTimeout(loop, intervalMs);
    };

    const start = setTimeout(loop, intervalMs);
    return () => { cancelled = true; clearTimeout(start); };
  }, [intervalMs]);

  /* typewriter for the current line — depends ONLY on typingId & typeSpeed */
  useEffect(() => {
    if (!typingId) return;
    let timer = setInterval(() => {
      setLogs((prev) => {
        const idx = prev.findIndex((l) => l.id === typingId);
        if (idx === -1) return prev; // row might have scrolled out
        const item = prev[idx];
        const nextLen = Math.min(item.text.length, (item.typed?.length || 0) + 1);
        const copy = [...prev];
        copy[idx] = { ...item, typed: item.text.slice(0, nextLen) };
        if (nextLen === item.text.length) {
          clearInterval(timer);
          timer = null;
        }
        return copy;
      });
    }, typeSpeed);

    return () => { if (timer) clearInterval(timer); };
  }, [typingId, typeSpeed]);

  const templateRow = useMemo(
    () => ({ ts: "0000-00-00 00:00:00", level: "INFO", text: "Measuring…" }),
    []
  );

  return (
    <div
      ref={containerRef}
      className="font-mono text-xs sm:text-sm"
      style={{
        height: typeof height === "number" ? `${height}px` : height,
        overflow: "hidden",
        lineHeight: "20px",
        display: "grid",
        alignContent: "end",
        gap: "6px",
      }}
    >
      {/* Blink cursor keyframes */}
      {showCursor && (
        <style>{`
          @keyframes blink { 0%, 49% { opacity: 1 } 50%, 100% { opacity: 0 } }
          .cursor { display:inline-block; width: 0.5ch; animation: blink 1s step-end infinite; }
        `}</style>
      )}

      {/* hidden template row for measurement */}
      <div ref={rowRef} className="invisible absolute pointer-events-none">
        [INFO] {templateRow.ts} — {templateRow.text}
      </div>

      {logs.map((log) => {
        const isTyping = log.id === typingId && (log.typed || "").length < log.text.length;
        return (
          <div key={log.id} className="whitespace-pre-wrap break-words text-gray-200">
            <span className={levelColor[log.level] || "text-green-400"}>[{log.level}]</span>{" "}
            <span className="text-gray-500">{log.ts}</span>{" "}
            <span className="text-gray-400">—</span>{" "}
            <span className="text-gray-200">
              {isTyping ? log.typed : log.text}
              {isTyping && showCursor && <span className="cursor">_</span>}
            </span>
          </div>
        );
      })}
    </div>
  );
}