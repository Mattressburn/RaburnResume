// src/charts/theme.jsx — brutalist lime palette
import React from "react";

export const palette = {
  accent:  '#A3E635',
  fg:      '#FAFAFA',
  mutedFg: '#A1A1AA',
  muted:   '#3F3F46',
  bg:      '#09090B',
};

export const chartSeries = [
  palette.accent,
  palette.fg,
  palette.mutedFg,
];

export const axisStyle = {
  fontFamily: 'Departure Mono, JetBrains Mono, ui-monospace, monospace',
  fontSize: 11,
  letterSpacing: '0.1em',
  textTransform: 'uppercase',
  fill: palette.mutedFg,
};

export const gridStyle = {
  stroke: palette.muted,
  strokeWidth: 1,
};

export const tooltipStyle = {
  contentStyle: {
    background: palette.bg,
    border: `2px solid ${palette.accent}`,
    borderRadius: 0,
    fontFamily: 'Departure Mono, JetBrains Mono, ui-monospace, monospace',
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: '0.1em',
    color: palette.fg,
  },
  labelStyle: { color: palette.accent },
};

// ---------- Keepalive shims (consumed by VinylDashboard + DiscogsCollectionPanel) ----------

/** Round-robin over chartSeries by index. */
export const colorByIndex = (i) => chartSeries[i % chartSeries.length];

// Long-label tick: abbreviates + wraps multi-word Y-axis labels in horizontal bar charts.
const ABBREV = {
  Records: "Recs.", Recordings: "Recs.", Incorporated: "Inc.", Corporation: "Corp.",
  Company: "Co.", Limited: "Ltd.", International: "Intl.", Brothers: "Bros.",
};
const abbreviate = (s) =>
  String(s).replace(
    /\b(Records|Recordings|Incorporated|Corporation|Company|Limited|International|Brothers)\b/g,
    (m) => ABBREV[m] || m
  );

const wrapText = (s, maxChars = 22, maxLines = 3) => {
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
      <text
        dy="4"
        textAnchor="end"
        fill={palette.mutedFg}
        fontSize={small ? 10 : 11}
        fontFamily="Departure Mono, JetBrains Mono, ui-monospace, monospace"
        letterSpacing="0.05em"
      >
        {rows.map((t, i) => (
          <tspan key={i} x="0" dy={i === 0 ? 0 : 12}>{t}</tspan>
        ))}
      </text>
      <title>{payload.value}</title>
    </g>
  );
};
