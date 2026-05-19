// src/pages/VinylDashboard.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell,
} from "recharts";
import DiscogsCollectionPanel from "../components/DiscogsCollectionPanel";
import Marquee from "../components/Marquee";
import MicrocopyLabel from "../components/MicrocopyLabel";

// Shared chart theme
import { palette, axisStyle, colorByIndex, tooltipStyle, LeftTick } from "../charts/theme";

// Utility: fetch JSON from public
async function loadData(url = "/fan500.json") {
  const r = await fetch(url, { cache: "no-cache" });
  if (!r.ok) throw new Error("Failed to load fan500.json");
  return r.json();
}

// Helpers

// --- Manual duration overrides (module scope) ---
const MANUAL_DURATIONS = {
  "The Who|||5:15": 300,
  "ZZ Top|||Waiting for the Bus/Jesus Just Left Chicago": 383,
  "Pink Floyd|||Speak to Me/Breathe/On the Run": 461,
  "Pink Floyd|||Brain Damage/Eclipse": 358,
  "The Beatles|||Sgt. Pepper's Lonely Hearts Club Band / With a Little Help from My Friends": 286,
  "Led Zeppelin|||Heartbreaker / Living Loving Maid (She's Just a Woman)": 415,
  "Pink Floyd|||Shine On You Crazy Diamond (Parts I–V)": 813,
  "Pink Floyd|||Shine On You Crazy Diamond (Parts I-V)": 813, // hyphen variant
};

const toSecs = (v) => {
  if (v == null) return null;
  if (typeof v === "number" && Number.isFinite(v)) return v;
  if (typeof v === "string") {
    const [mStr, sStr] = v.split(":");
    const m = parseInt(mStr, 10);
    const s = parseInt(sStr ?? "0", 10);
    if (Number.isFinite(m)) return m * 60 + (Number.isFinite(s) ? s : 0);
  }
  return null;
};

const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

function useURLState(defaults) {
  const [params, setParams] = useSearchParams();
  const state = useMemo(() => {
    const o = { ...defaults };
    o.ymin = parseInt(params.get("ymin") ?? String(defaults.ymin), 10);
    o.ymax = parseInt(params.get("ymax") ?? String(defaults.ymax), 10);
    o.dmax = parseInt(params.get("dmax") ?? String(defaults.dmax), 10);
    o.art = params.get("art") ? params.get("art").split("|").filter(Boolean) : [];
    o.lab = params.get("lab") ? params.get("lab").split("|").filter(Boolean) : [];
    return o;
  }, [params, defaults]);

  const setState = (patch) => {
    const next = { ...state, ...patch };
    const p = new URLSearchParams();
    p.set("ymin", String(next.ymin));
    p.set("ymax", String(next.ymax));
    p.set("dmax", String(next.dmax));
    if (next.art?.length) p.set("art", next.art.join("|"));
    if (next.lab?.length) p.set("lab", next.lab.join("|"));
    setParams(p, { replace: true });
  };

  return [state, setState];
}


export default function VinylDashboard() {
  const [data, setData] = useState([]);
  const [dataReady, setDataReady] = useState(false);

  useEffect(() => {
    loadData()
      .then((rows) => {
        const cleaned = rows.map((r) => {
          const labels = Array.isArray(r.labels) ? r.labels : r.labels ? [r.labels] : [];
          const key = `${r.artist || ""}|||${r.title || ""}`;
          const manual = MANUAL_DURATIONS[key];;

          // prefer manual, else original secs
          const secs = manual != null ? toSecs(manual) : r.secs ?? null;

          return {
            ...r,
            artist: r.artist || "",
            title: r.title || "",
            year: r.year ?? null,
            labels,
            secs,
            mins: secs != null ? Math.round(secs / 6) / 10 : null,
          };
        });

        setData(cleaned);
        setDataReady(true);
      })
      .catch((e) => console.error(e));
  }, []);

  const yearDomain = useMemo(() => {
    const ys = data.map((d) => d.year).filter((y) => y != null);
    return [Math.min(...ys, 1960), Math.max(...ys, 1985)];
  }, [data]);

  const defaults = useMemo(
    () => ({
      ymin: yearDomain[0] || 1960,
      ymax: yearDomain[1] || 1985,
      dmax: 31,
      art: [],
      lab: [],
    }),
    [yearDomain]
  );

  const [qs, setQS] = useURLState(defaults);

  const labelCounts = useMemo(() => {
    const m = new Map();
    data.forEach((d) => (d.labels || []).forEach((l) => m.set(l, (m.get(l) || 0) + 1)));
    return Array.from(m.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);
  }, [data]);

  const normalizeArtist = (s) => {
    if (!s) return "";
    let t = String(s).trim();
    const m = t.match(/^(.*),\s*(The|A|An)$/i);
    if (m) t = `${m[2]} ${m[1]}`;
    return t.replace(/\s+/g, " ").trim().toLowerCase();
  };

  const artistCounts = useMemo(() => {
    const map = new Map();
    for (const row of data) {
      const norm = normalizeArtist(row.artist);
      if (!norm) continue;
      const current = map.get(norm) || { name: row.artist || norm, count: 0 };
      current.count += 1;
      if ((row.artist || "").length > current.name.length) current.name = row.artist;
      map.set(norm, current);
    }
    return [...map.entries()]
      .map(([norm, v]) => ({ norm, name: v.name, count: v.count }))
      .sort((a, b) => b.count - a.count);
  }, [data]);

  const isArtistActive = (norm, selected) =>
    (selected || []).some((a) => normalizeArtist(a) === norm);

  const toggleArtist = (norm, display, selected) => {
    if (isArtistActive(norm, selected)) {
      return selected.filter((a) => normalizeArtist(a) !== norm);
    }
    return [...selected, display];
  };

  const filtered = useMemo(() => {
    const ymin = qs.ymin,
      ymax = qs.ymax,
      dmax = qs.dmax;
    const artSel = new Set((qs.art || []).map(normalizeArtist));
    const labSel = new Set(qs.lab || []);
    return data.filter((d) => {
      if (d.year != null && (d.year < ymin || d.year > ymax)) return false;
      if (d.secs != null) {
        const m = d.secs / 60;
        if (m > dmax) return false;
      }
      if (artSel.size && !artSel.has(normalizeArtist(d.artist))) return false;
      if (labSel.size) {
        const labs = new Set(d.labels || []);
        let ok = false;
        labSel.forEach((l) => {
          if (labs.has(l)) ok = true;
        });
        if (!ok) return false;
      }
      return true;
    });
  }, [data, qs]);

  const yearBuckets = useMemo(() => {
    const m = new Map();
    filtered.forEach((d) => {
      if (d.year != null) m.set(d.year, (m.get(d.year) || 0) + 1);
    });
    return Array.from(m.entries())
      .sort((a, b) => a[0] - b[0])
      .map(([y, c]) => ({ year: y, count: c }));
  }, [filtered]);

  const topArtists = useMemo(() => {
    const map = new Map();
    for (const d of filtered) {
      const norm = normalizeArtist(d.artist);
      if (!norm) continue;
      const cur = map.get(norm) || { name: d.artist || norm, count: 0 };
      cur.count += 1;
      if ((d.artist || "").length > cur.name.length) cur.name = d.artist;
      map.set(norm, cur);
    }
    return [...map.values()].sort((a, b) => b.count - a.count).slice(0, 10);
  }, [filtered]);

  const longest = useMemo(() => {
    return filtered
      .filter((d) => d.secs != null)
      .slice()
      .sort((a, b) => b.secs - a.secs)
      .slice(0, 10);
  }, [filtered]);

  const onYearBarClick = (entry) => {
    if (!entry || !entry.activeLabel) return;
    const y = parseInt(entry.activeLabel, 10);
    if (qs.ymin === y && qs.ymax === y) {
      setQS({ ymin: defaults.ymin, ymax: defaults.ymax });
    } else {
      setQS({ ymin: y, ymax: y });
    }
  };

  const yearsMin = defaults.ymin,
    yearsMax = defaults.ymax;

  // Helpers for Labels
  const isLabelActive = (name, labels = []) => labels?.some((l) => l === name);
  const toggleLabel = (name, labels = []) => {
    if (!labels) return [name];
    if (labels.includes(name)) return labels.filter((l) => l !== name);
    return [...labels, name];
  };

  if (!dataReady) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <MicrocopyLabel>CONNECTING…</MicrocopyLabel>
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-bg text-fg font-mono">
      <Marquee text="DASHBOARD · RECON · DASHBOARD · RECON" />
      <main className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-12 py-8 space-y-6">
        <div className="flex justify-between items-baseline mb-8">
          <MicrocopyLabel as="div">VINYL RECON · {data.length} RECORDS</MicrocopyLabel>
          <div className="flex items-center gap-4">
            <MicrocopyLabel as="a" href="/">← BACK</MicrocopyLabel>
            <MicrocopyLabel as="a" href="/fan500.json">↓ JSON</MicrocopyLabel>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Year range */}
          <div className="border-3 border-fg bg-bg p-4">
            <MicrocopyLabel as="div" className="text-accent mb-3">Year range</MicrocopyLabel>
            <div className="flex items-center justify-around flex-wrap gap-4">
              {/* Start Year Control */}
              <div className="flex flex-col items-center">
                <div className="text-2xl font-bold text-fg tabular-nums mb-2">{qs.ymin}</div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setQS({ ymin: clamp(qs.ymin - 1, defaults.ymin, qs.ymax) })}
                    className="w-8 h-8 border-3 border-muted-fg text-muted-fg hover:border-accent hover:text-accent transition-colors text-sm font-bold font-mono"
                  >
                    -
                  </button>
                  <button
                    onClick={() => setQS({ ymin: clamp(qs.ymin + 1, defaults.ymin, qs.ymax) })}
                    className="w-8 h-8 border-3 border-muted-fg text-muted-fg hover:border-accent hover:text-accent transition-colors text-sm font-bold font-mono"
                  >
                    +
                  </button>
                </div>
                <MicrocopyLabel as="div" className="text-muted-fg mt-1">Start</MicrocopyLabel>
              </div>
              <span className="text-muted-fg font-mono self-end pb-5">→</span>

              {/* End Year Control */}
              <div className="flex flex-col items-center">
                <div className="text-2xl font-bold text-fg tabular-nums mb-2">{qs.ymax}</div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setQS({ ymax: clamp(qs.ymax - 1, qs.ymin, defaults.ymax) })}
                    className="w-8 h-8 border-3 border-muted-fg text-muted-fg hover:border-accent hover:text-accent transition-colors text-sm font-bold font-mono"
                  >
                    -
                  </button>
                  <button
                    onClick={() => setQS({ ymax: clamp(qs.ymax + 1, qs.ymin, defaults.ymax) })}
                    className="w-8 h-8 border-3 border-muted-fg text-muted-fg hover:border-accent hover:text-accent transition-colors text-sm font-bold font-mono"
                  >
                    +
                  </button>
                </div>
                <MicrocopyLabel as="div" className="text-muted-fg mt-1">End</MicrocopyLabel>
              </div>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {[
                { label: "The 60s", range: [1960, 1969] },
                { label: "Early 70s", range: [1970, 1974] },
                { label: "Late 70s", range: [1975, 1979] },
                { label: "Full range", range: [yearsMin, yearsMax] },
              ].map(({ label, range: [a, b] }) => {
                const active = qs.ymin === a && qs.ymax === b;
                return (
                  <button
                    key={label}
                    className={`border-3 px-2 py-1 text-xs font-mono uppercase tracking-wider transition-colors ${
                      active
                        ? "border-accent text-accent bg-accent/10"
                        : "border-muted text-muted-fg hover:border-accent hover:text-accent"
                    }`}
                    onClick={() => setQS({ ymin: a, ymax: b })}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Duration */}
          <div className="border-3 border-fg bg-bg p-4">
            <div className="flex items-center justify-between mb-2">
              <MicrocopyLabel as="div" className="text-accent">Max duration (min)</MicrocopyLabel>
              <MicrocopyLabel as="span" className="text-fg border-3 border-muted px-2 py-1">
                ≤ {qs.dmax} min
              </MicrocopyLabel>
            </div>
            <input
              type="range"
              min={0}
              max={31}
              value={qs.dmax}
              onChange={(e) => setQS({ dmax: parseInt(e.target.value, 10) })}
              className="vinyl-range w-full"
            />
            <div className="mt-2 flex justify-between">
              <MicrocopyLabel className="text-muted-fg">Single</MicrocopyLabel>
              <MicrocopyLabel className="text-muted-fg">Album-cut</MicrocopyLabel>
              <MicrocopyLabel className="text-muted-fg">Epic</MicrocopyLabel>
            </div>
          </div>

          {/* LABELS + ARTISTS ROW */}
          <div className="grid grid gap-4 md:col-span-2 grid-cols-1 md:grid-cols-[280px_minmax(0,1fr)]">
            {/* Labels */}
            <div className="border-3 border-fg bg-bg p-4">
              <MicrocopyLabel as="div" className="text-accent mb-2">Labels</MicrocopyLabel>
              <div className="h-48 overflow-y-auto space-y-1 pr-1">
                {labelCounts.map(({ name, count }) => {
                  const active = isLabelActive(name, qs.lab);
                  return (
                    <label key={name} className="flex items-center gap-2 text-xs text-muted-fg hover:text-fg cursor-pointer font-mono">
                      <input
                        type="checkbox"
                        checked={active}
                        onChange={() => setQS({ lab: toggleLabel(name, qs.lab) })}
                        className="accent-accent"
                      />
                      <span className="truncate">{name}</span>
                      <span className="text-muted">({count})</span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Artists */}
            <div className="border-3 border-fg bg-bg p-4">
              <MicrocopyLabel as="div" className="text-accent mb-2">Artists</MicrocopyLabel>

              {/* Top pills */}
              <div className="flex flex-wrap gap-2 mb-2">
                {artistCounts.slice(0, 10).map(({ norm, name }) => {
                  const active = isArtistActive(norm, qs.art);
                  return (
                    <button
                      key={norm}
                      onClick={() => setQS({ art: toggleArtist(norm, name, qs.art) })}
                      className={`border-3 px-2 py-1 text-xs font-mono uppercase tracking-wider transition-colors ${
                        active
                          ? "border-accent text-accent bg-accent/10"
                          : "border-muted text-muted-fg hover:border-accent hover:text-accent"
                      }`}
                      aria-pressed={active}
                    >
                      {name}
                    </button>
                  );
                })}
              </div>

              {/* Scrollable checkbox list */}
              <div className="h-28 overflow-y-auto space-y-1 pr-1">
                {artistCounts.slice(10).map(({ norm, name, count }) => {
                  const active = isArtistActive(norm, qs.art);
                  return (
                    <label key={norm} className="flex items-center gap-2 text-xs text-muted-fg hover:text-fg cursor-pointer font-mono">
                      <input
                        type="checkbox"
                        checked={active}
                        onChange={() => setQS({ art: toggleArtist(norm, name, qs.art) })}
                        className="accent-accent"
                      />
                      <span className="truncate">{name}</span>
                      <span className="text-muted">({count})</span>
                    </label>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="border-3 border-fg bg-bg p-4">
            <MicrocopyLabel as="div" className="text-muted-fg mb-1">Tracks</MicrocopyLabel>
            <div className="text-2xl font-bold text-fg tabular-nums">{filtered.length}</div>
          </div>
          <div className="border-3 border-fg bg-bg p-4">
            <MicrocopyLabel as="div" className="text-muted-fg mb-1">Artists</MicrocopyLabel>
            <div className="text-2xl font-bold text-fg tabular-nums">
              {new Set(filtered.map((d) => normalizeArtist(d.artist))).size}
            </div>
          </div>
          <div className="border-3 border-fg bg-bg p-4">
            <MicrocopyLabel as="div" className="text-muted-fg mb-1">Total playtime</MicrocopyLabel>
            <div className="text-2xl font-bold text-fg tabular-nums">
              {(() => {
                const s = filtered.reduce((a, b) => a + (b.secs || 0), 0);
                const h = Math.floor(s / 3600),
                  m = Math.floor((s % 3600) / 60);
                return `${h}h ${m}m`;
              })()}
            </div>
          </div>
          <div className="border-3 border-fg bg-bg p-4">
            <MicrocopyLabel as="div" className="text-muted-fg mb-1">Avg length</MicrocopyLabel>
            <div className="text-2xl font-bold text-fg tabular-nums">
              {(() => {
                const arr = filtered.filter((d) => d.secs != null).map((d) => d.secs);
                if (!arr.length) return "-";
                const ave = Math.round(arr.reduce((a, b) => a + b, 0) / arr.length);
                const mm = Math.floor(ave / 60),
                  ss = String(ave % 60).padStart(2, "0");
                return `${mm}:${ss}`;
              })()}
            </div>
          </div>
        </div>

        {/* Discogs collection panel */}
        <section id="discogs" className="space-y-6">
          <DiscogsCollectionPanel />
        </section>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Songs by Year */}
          <div className="border-3 border-fg bg-bg p-4 lg:col-span-2">
            <MicrocopyLabel as="div" className="text-accent mb-2">Songs by Year (click bar to filter)</MicrocopyLabel>
            <button
              className="border-3 border-muted text-muted-fg hover:border-accent hover:text-accent px-3 py-1 text-xs font-mono uppercase tracking-wider transition-colors mb-2"
              onClick={() => setQS({ ymin: defaults.ymin, ymax: defaults.ymax })}
              disabled={qs.ymin === defaults.ymin && qs.ymax === defaults.ymax}
              title="Clear year filter"
            >
              Clear
            </button>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={yearBuckets} onClick={onYearBarClick}>
                  <CartesianGrid strokeDasharray="3 3" stroke={palette.muted} />
                  <XAxis
                    dataKey="year"
                    stroke={palette.mutedFg}
                    tick={axisStyle}
                    axisLine={{ stroke: palette.muted }}
                    tickLine={{ stroke: palette.muted }}
                  />
                  <YAxis
                    stroke={palette.mutedFg}
                    tick={axisStyle}
                    axisLine={{ stroke: palette.muted }}
                    tickLine={{ stroke: palette.muted }}
                  />
                  <Tooltip cursor={{ fill: "#ffffff10" }} {...tooltipStyle} />
                  <Bar dataKey="count">
                    {yearBuckets.map((_, idx) => (
                      <Cell key={`cell-${idx}`} fill={colorByIndex(idx)} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Top Artists (filtered) */}
          <div className="border-3 border-fg bg-bg p-4">
            <MicrocopyLabel as="div" className="text-accent mb-2">Top Artists (filtered)</MicrocopyLabel>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={topArtists}
                  layout="vertical"
                  margin={{ left: 28, right: 12, top: 8, bottom: 8 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke={palette.muted} />
                  <XAxis
                    type="number"
                    stroke={palette.mutedFg}
                    axisLine={{ stroke: palette.muted }}
                    tickLine={{ stroke: palette.muted }}
                    tick={axisStyle}
                  />
                  <YAxis
                    dataKey="name"
                    type="category"
                    width={220}
                    interval={0}
                    tickLine={false}
                    axisLine={false}
                    tick={<LeftTick maxChars={20} lines={2} shift={22} />}
                  />
                  <Tooltip
                    cursor={{ fill: "#00000008" }}
                    {...tooltipStyle}
                    formatter={(v, k) => (k === "count" ? [v, "Tracks"] : [v, k])}
                    labelFormatter={(label) => label}
                  />
                  <Bar dataKey="count" barSize={14}>
                    {topArtists.map((_, idx) => (
                      <Cell key={`cell-${idx}`} fill={colorByIndex(idx)} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Longest tracks */}
        <div className="border-3 border-fg bg-bg p-4">
          <MicrocopyLabel as="div" className="text-accent mb-3">Top 10 Longest Tracks (filtered)</MicrocopyLabel>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {longest.map((d, i) => (
              <div
                key={d.n ?? `${d.artist}|${d.title}|${d.year}|${i}`}
                className="border-3 border-muted bg-bg flex gap-3 p-3"
              >
                <img
                  src={d.cover || "https://placehold.co/80x80?text=No+Art"}
                  alt="cover"
                  className="w-16 h-16 object-cover"
                  loading="lazy"
                />
                <div className="min-w-0">
                  <div className="text-sm font-mono font-medium truncate text-fg">{d.title}</div>
                  <div className="text-xs text-muted-fg truncate font-mono">
                    {d.artist} · {d.album || "—"} · {d.year || "—"}
                  </div>
                  <MicrocopyLabel as="div" className="text-accent mt-1">
                    {(() => {
                      if (d.secs == null) return "—";
                      const mm = Math.floor(d.secs / 60),
                        ss = String(d.secs % 60).padStart(2, "0");
                      return `${mm}:${ss}`;
                    })()}
                  </MicrocopyLabel>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Tracks table */}
        <div className="border-3 border-fg bg-bg p-4">
          <MicrocopyLabel as="div" className="text-accent mb-3">Tracks ({filtered.length})</MicrocopyLabel>

          <div className="overflow-x-auto">
            <table className="min-w-full text-sm font-mono">
              <thead>
                <tr className="border-b-3 border-fg text-accent text-left">
                  <th className="py-2 pr-3">#</th>
                  <th className="py-2 pr-3">Cover</th>
                  <th className="py-2 pr-3">Title</th>
                  <th className="py-2 pr-3">Artist</th>
                  <th className="py-2 pr-3">Album</th>
                  <th className="py-2 pr-3">Year</th>
                  <th className="py-2 pr-3 max-w-[240px]">Label(s)</th>
                  <th className="py-2 pr-3">Len</th>
                  <th className="py-2 pr-3">Links</th>
                </tr>
              </thead>

              <tbody>
                {filtered.map((d, i) => (
                  <tr key={i} className="border-b border-muted hover:bg-muted/30">
                    <td className="py-2 pr-3 text-muted-fg">{d.n ?? ""}</td>
                    <td className="py-2 pr-3">
                      <img
                        src={d.cover || "https://placehold.co/48x48?text=—"}
                        alt="cover"
                        className="w-12 h-12 object-cover"
                        loading="lazy"
                      />
                    </td>
                    <td className="py-2 pr-3 text-fg">{d.title}</td>
                    <td className="py-2 pr-3 text-fg">{d.artist}</td>
                    <td className="py-2 pr-3 text-muted-fg">{d.album || "—"}</td>
                    <td className="py-2 pr-3 text-muted-fg">{d.year || "—"}</td>
                    <td className="py-2 pr-3 max-w-[240px] truncate text-muted-fg">{(d.labels || []).join(", ")}</td>
                    <td className="py-2 pr-3 text-muted-fg">
                      {(() => {
                        if (d.secs == null) return "—";
                        const mm = Math.floor(d.secs / 60);
                        const ss = String(d.secs % 60).padStart(2, "0");
                        return `${mm}:${ss}`;
                      })()}
                    </td>
                    <td className="py-2 pr-3 space-x-2">
                      {d.discogs_release && (
                        <a
                          href={d.discogs_release}
                          target="_blank"
                          rel="noreferrer"
                          className="text-accent hover:underline text-xs"
                        >
                          Discogs
                        </a>
                      )}
                      {d.spotify && (
                        <a
                          href={d.spotify}
                          target="_blank"
                          rel="noreferrer"
                          className="text-accent hover:underline text-xs"
                        >
                          Spotify
                        </a>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
