// Shared Recharts theme for the classified dossier dashboard
import React from "react";

export const RC = {
  paper: "#18181b",
  line: "#3f3f46",
  ink: "#d4d4d8",
  grid: "#27272a",
};

// Tactical muted palette: ambers, reds, slate blues, olive greens, purples
const BASE_PALETTE = [
  "#f59e0b", "#ef4444", "#3b82f6", "#10b981", "#8b5cf6",
  "#64748b", "#d97706", "#b91c1c",
];
// 0,5,1,6,2,7… => maximizes separation between neighbors
const SPREAD = (() => {
  const p = BASE_PALETTE, half = Math.ceil(p.length / 2), out = [];
  for (let i = 0; i < half; i++) {
    out.push(p[i]);
    if (p[i + half]) out.push(p[i + half]);
  }
  return out;
})();
export const colorByIndex = (i) => SPREAD[i % SPREAD.length];

export const tooltipStyle = {
  background: RC.paper,
  border: `1px solid ${RC.line}`,
  color: RC.ink,
};

// ---------- Long-label tick (wrap + abbreviate + left gutter) ----------
const ABBREV = {
  Records: "Recs.", Recordings: "Recs.", Incorporated: "Inc.", Corporation: "Corp.",
  Company: "Co.", Limited: "Ltd.", International: "Intl.", Brothers: "Bros.",
};
const abbreviate = (s) =>
  String(s).replace(
    /\b(Records|Recordings|Incorporated|Corporation|Company|Limited|International|Brothers)\b/g,
    (m) => ABBREV[m] || m
  );

export const wrapText = (s, maxChars = 22, maxLines = 3) => {
  const words = String(s).split(" ");
  const lines = [];
  let line = "";
  for (const w of words) {
    const test = line ? line + " " + w : w;
    if (test.length > maxChars) {
      lines.push(line);
      line = w;
      if (lines.length === maxLines - 1) break;
    } else line = test;
  }
  if (line) lines.push(line);
  const joined = lines.join(" ");
  if (joined.length < String(s).length) lines[lines.length - 1] += "…";
  return lines;
};

export const LeftTick = ({ x, y, payload, maxChars = 22, lines = 3, shift = 26 }) => {
  const text = abbreviate(payload.value);
  const rows = wrapText(text, maxChars, lines);
  const small = rows.some((r) => r.length > maxChars);
  return (
    <g transform={`translate(${x - shift},${y})`}>
      <text dy="4" textAnchor="end" fill={RC.ink} fontSize={small ? 11 : 12}>
        {rows.map((t, i) => (
          <tspan key={i} x="0" dy={i === 0 ? 0 : 12}>{t}</tspan>
        ))}
      </text>
      <title>{payload.value}</title>
    </g>
  );
};
