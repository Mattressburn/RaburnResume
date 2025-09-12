import React, { useMemo, useState } from "react";
import Papa from "papaparse";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Legend,
  Cell,
} from "recharts";

/**
 * DiscogsCollectionPanel (JSX version)
 * - Drag-and-drop a Discogs collection CSV OR load via Netlify function (/.netlify/functions/discogs-collection?username=YOURNAME)
 * - Aggregates your collection into charts: by year, decade, format, label, country, and top artists
 * - Designed to drop into the existing retro dashboard (uses .retro-card, .retro-title, etc.)
 */
export default function DiscogsCollectionPanel() {
  const [items, setItems] = useState([]);
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Palette that works with your retro theme; falls back gracefully.
  const palette = [
    "#ffd166",
    "#06d6a0",
    "#118ab2",
    "#ef476f",
    "#8338ec",
    "#8ecae6",
    "#fb8500",
    "#a8dadc",
  ];

  async function handleFetchFromAPI() {
    if (!username) {
      setError("Enter your Discogs username first.");
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(
        `/.netlify/functions/discogs-collection?username=${encodeURIComponent(
          username
        )}`
      );
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      const norm = data.map(normalizeFromApi);
      setItems(norm);
    } catch (e) {
      setError(e.message || "Failed to load collection");
    } finally {
      setLoading(false);
    }
  }

  function handleCsvSelect(file) {
    setLoading(true);
    setError(null);
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        try {
          const rows = (results.data || []).filter(Boolean);
          const norm = rows.map(normalizeFromCsv).filter(Boolean);
          setItems(norm);
        } catch (e) {
          setError(e.message || "Failed to parse CSV");
        } finally {
          setLoading(false);
        }
      },
      error: (err) => {
        setError(err.message);
        setLoading(false);
      },
    });
  }

  const stats = useMemo(() => summarize(items), [items]);

  return (
    <div className="space-y-6">
      {/* Loader / errors */}
      {error && (
        <div className="retro-card p-3 border border-red-500/50 text-red-300">
          <div className="retro-title mb-1">Error</div>
          <p className="text-sm">{error}</p>
        </div>
      )}

      {/* Controls */}
      <div className="retro-card p-4">
        <div className="retro-title mb-2">Load your Discogs collection</div>
        <div className="grid md:grid-cols-2 gap-4">
          {/* CSV uploader */}
          <div className="border border-dashed border-zinc-600 rounded-2xl p-4">
            <div className="text-sm opacity-80 mb-2">Option A · CSV export</div>
            <p className="text-xs opacity-70 mb-3">
              In Discogs: Collection ➜ Export ➜ Collection CSV. Then drop it here.
            </p>
            <label className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 cursor-pointer select-none">
              <input
                type="file"
                accept=".csv,text/csv"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) handleCsvSelect(f);
                }}
              />
              <span className="text-sm">Choose CSV…</span>
            </label>
          </div>

          {/* API loader */}
          <div className="border border-dashed border-zinc-600 rounded-2xl p-4">
            <div className="text-sm opacity-80 mb-2">Option B · Live from Discogs API</div>
            <p className="text-xs opacity-70 mb-3">
              Requires a Netlify function with a Discogs token set (DISCOGS_TOKEN).
            </p>
            <div className="flex items-center gap-2">
              <input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Discogs username"
                className="retro-input flex-1"
              />
              <button
                onClick={handleFetchFromAPI}
                className="retro-btn"
                disabled={loading}
              >
                {loading ? "Loading…" : "Load"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Summary tiles */}
      {items.length > 0 && (
        <div className="grid md:grid-cols-3 gap-4">
          <SummaryTile title="Total records" value={numberFormat(stats.total)} />
          <SummaryTile title="Unique artists" value={numberFormat(stats.uniqueArtists)} />
          <SummaryTile
            title="Median • Average year"
            value={`${stats.medianYear ?? "—"} • ${stats.avgYear ?? "—"}`}
          />
        </div>
      )}

      {/* Charts */}
      {items.length > 0 && (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <ChartCard title="By year (count)">
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={toChart(stats.byYear)} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} interval={0} angle={-45} textAnchor="end" height={60} />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="value" />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="By decade">
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={toChart(stats.byDecade)}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="value" />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="Formats">
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie data={toChart(stats.byFormat)} dataKey="value" nameKey="name" outerRadius={100}>
                  {toChart(stats.byFormat).map((_, i) => (
                    <Cell key={i} fill={palette[i % palette.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="Top labels">
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={toChart(stats.topLabels)}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" interval={0} angle={-30} textAnchor="end" height={60} />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="value" />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="Countries">
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={toChart(stats.byCountry)}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" interval={0} angle={-30} textAnchor="end" height={60} />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="value" />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="Top artists">
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={toChart(stats.topArtists)}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" interval={0} angle={-30} textAnchor="end" height={60} />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="value" />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>
      )}
    </div>
  );
}

/* ========================= Helpers ========================= */

function numberFormat(n) {
  try { return n.toLocaleString(); } catch { return String(n); }
}

function normalizeFromApi(r) {
  const bi = (r && r.basic_information) || {};
  const year = toYear(bi.year);
  return {
    year,
    decade: year ? `${Math.floor(year / 10) * 10}s` : undefined,
    labels: (bi.labels || []).map((l) => clean(l.name)).filter(Boolean),
    formats: (bi.formats || [])
      .flatMap((f) => [f.name, ...(f.descriptions || [])])
      .map((s) => normalizeFormat(s))
      .filter(Boolean),
    country: undefined, // Discogs collection endpoint doesn't reliably include country
    artists: (bi.artists || []).map((a) => clean(a.name)).filter(Boolean),
    title: bi.title,
  };
}

function normalizeFromCsv(row) {
  // Discogs CSV headers can vary slightly; we try common variants.
  const artist = pick(row, ["Artist", "Artists", "artist"]);
  const title = pick(row, ["Title", "Release Title", "title"]);
  const label = pick(row, ["Label", "Labels", "label"]);
  const format = pick(row, ["Format", "Formats", "format"]);
  const released = pick(row, ["Released", "Year", "Released Year", "released"]);
  const country = pick(row, ["Country", "country"]);

  const year = toYear(released);
  const labels = splitMulti(label).map(clean).filter(Boolean);
  const formats = splitMulti(format).map(normalizeFormat).filter(Boolean);
  const artists = splitMulti(artist).map(clean).filter(Boolean);

  if (!artist && !title && !label) return null; // Likely header junk

  return {
    year,
    decade: year ? `${Math.floor(year / 10) * 10}s` : undefined,
    labels,
    formats,
    country: country ? String(country).trim() : undefined,
    artists,
    title: title ? String(title).trim() : undefined,
  };
}

function toYear(value) {
  if (value == null) return undefined;
  const s = String(value).trim();
  if (!s) return undefined;
  const m = s.match(/(\d{4})/);
  if (!m) return undefined;
  const y = parseInt(m[1], 10);
  if (y < 1900 || y > 2100) return undefined;
  return y;
}

function clean(s) {
  return s.replace(/\s+/g, " ").replace(/\s*\(.*?\)\s*/g, "").trim();
}

function pick(obj, keys) {
  for (const k of keys) {
    if (obj && obj[k] != null && obj[k] !== "") return obj[k];
  }
  return undefined;
}

function splitMulti(v) {
  if (!v) return [];
  const s = String(v);
  return s
    .split(/[,;]+/)
    .map((x) => x.trim())
    .filter(Boolean);
}

function normalizeFormat(s) {
  if (!s) return null;
  const t = String(s).toLowerCase().trim();
  if (/(^|\W)lp(\W|$)/.test(t)) return "LP";
  if (/(^|\W)12\"?(\W|$)/.test(t)) return "12\"";
  if (/(^|\W)7\"?(\W|$)/.test(t)) return "7\"";
  if (/(^|\W)10\"?(\W|$)/.test(t)) return "10\"";
  if (/cd/.test(t)) return "CD";
  if (/cassette|tape/.test(t)) return "Cassette";
  if (/file|digital/.test(t)) return "Digital";
  return s.toString();
}

function summarize(items) {
  const byYear = new Map();
  const byDecade = new Map();
  const byFormat = new Map();
  const byLabel = new Map();
  const byCountry = new Map();
  const byArtist = new Map();

  const years = [];
  const artistSet = new Set();

  for (const it of items) {
    if (it.year) {
      const y = String(it.year);
      byYear.set(y, 1 + (byYear.get(y) || 0));
      years.push(it.year);
    }
    if (it.decade) byDecade.set(it.decade, 1 + (byDecade.get(it.decade) || 0));
    for (const f of it.formats) byFormat.set(f, 1 + (byFormat.get(f) || 0));
    for (const l of it.labels) byLabel.set(l, 1 + (byLabel.get(l) || 0));
    if (it.country) byCountry.set(it.country, 1 + (byCountry.get(it.country) || 0));
    for (const a of it.artists) {
      const k = a.replace(/\s+\(.*?\)$/, "");
      byArtist.set(k, 1 + (byArtist.get(k) || 0));
      artistSet.add(k);
    }
  }

  years.sort((a, b) => a - b);
  const medianYear = years.length ? years[Math.floor(years.length / 2)] : undefined;
  const avgYear = years.length
    ? Math.round((years.reduce((s, n) => s + n, 0) / years.length) * 10) / 10
    : undefined;

  return {
    total: items.length,
    uniqueArtists: artistSet.size,
    medianYear,
    avgYear,
    byYear: sortMap(byYear, (a, b) => parseInt(a) - parseInt(b)),
    byDecade: sortMap(byDecade, (a, b) => parseInt(a) - parseInt(b)),
    byFormat: sortMap(byFormat),
    byCountry: topN(sortMap(byCountry), 15),
    topLabels: topN(sortMap(byLabel, (a, b) => byLabel.get(b) - byLabel.get(a)), 15),
    topArtists: topN(sortMap(byArtist, (a, b) => byArtist.get(b) - byArtist.get(a)), 15),
  };
}

function sortMap(map, cmp) {
  const arr = Array.from(map.entries());
  if (cmp) arr.sort((x, y) => cmp(x[0], y[0]));
  return new Map(arr);
}

function topN(map, n = 10) {
  const arr = Array.from(map.entries()).sort((a, b) => b[1] - a[1]);
  return new Map(arr.slice(0, n));
}

function toChart(map) {
  return Array.from(map.entries()).map(([name, value]) => ({ name, value }));
}

/* ========================= UI primitives ========================= */

function SummaryTile({ title, value }) {
  return (
    <div className="retro-card p-4">
      <div className="retro-title mb-1">{title}</div>
      <div className="text-2xl font-semibold tracking-tight">{value}</div>
    </div>
  );
}

function ChartCard({ title, children }) {
  return (
    <div className="retro-card p-4">
      <div className="retro-title mb-3">{title}</div>
      {children}
    </div>
  );
}
