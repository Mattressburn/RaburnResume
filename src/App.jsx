import React, { useState, useCallback } from "react";
import {
  Download,
  Eye,
  ExternalLink,
} from "lucide-react";
import resumePDF from "./assets/Matthew_Raburn_Resume.pdf";
import VinylDashboard from "./pages/VinylDashboard";
import { Routes, Route, Link } from "react-router-dom";
import { resumeData } from "./data/resumeData";
import Preview from './pages/Preview';
import Marquee from './components/Marquee';
import MicrocopyLabel from './components/MicrocopyLabel';
import BrutalistCard from './components/BrutalistCard';
import PillBadge from './components/PillBadge';
import RedactedBlock from './components/RedactedBlock';
import SectionHeader from './components/SectionHeader';
import BrutalistChip from './components/BrutalistChip';

/* ═══════════════ Redacted — morphs per era ═══════════════ */
const Redacted = ({ children, era }) => {
  if (era === "1982") return <span className="era-redacted-ascii">{"####"}</span>;
  if (era === "1995") return <span className="era-redacted-95">{children}</span>;
  if (era === "2005") return <span className="era-redacted-05">{children}<span className="era-redacted-05-overlay">Confidential</span></span>;
  if (era === "2026") return <span className="era-redacted-26">{children}</span>;
  return (
    <span className="redacted" title="HOVER TO DECLASSIFY">
      {children}
    </span>
  );
};

/* ═══════════════ Classified Stamp ═══════════════ */
const ClassifiedStamp = ({ children, className = "" }) => (
  <div
    className={`ink-stamp inline-block -rotate-2 select-none ${className}`}
    aria-hidden="true"
  >
    {children}
  </div>
);

/* ═══════════════ Folder Tab ═══════════════ */
const FolderTab = ({ job, isActive, onClick }) => {
  const startYear = job.period.split(" - ")[0].split("/")[1];
  const endPart = job.period.split(" - ")[1];
  const endYear = endPart === "Present" ? "Now" : endPart.split("/")[1];

  return (
    <button
      onClick={onClick}
      className={`folder-tab ${isActive ? "active" : ""}`}
      aria-label={`View details for ${job.company} position from ${startYear} to ${endYear}`}
    >
      {job.company} ({startYear}–{endYear})
    </button>
  );
};

/* ═══════════════ Job Details ═══════════════ */
const JobDetails = ({ job, isActive }) => (
  <div className={`transition-all duration-300 ${isActive ? "block page-enter" : "hidden"}`}>
    <div className="era-job-header border-l-4 border-[var(--era-accent)] pl-4 py-2 mb-4">
      <h3 className="era-text text-sm sm:text-base font-bold font-mono">
        {job.title} — <span className="era-text-accent">{job.company}</span>
      </h3>
      <p className="era-text-muted text-xs mt-0.5 font-mono">
        {job.period} | {job.location}
      </p>
    </div>
    <ul className="space-y-2.5 ml-2">
      {job.achievements.map((a, i) => (
        <li
          key={i}
          className="era-text text-xs sm:text-sm leading-relaxed pl-5 relative font-mono"
        >
          <span className="absolute left-0 top-0 era-text-accent font-bold text-xs" aria-hidden="true">
            {String(i + 1).padStart(2, "0")}.
          </span>
          {a}
        </li>
      ))}
    </ul>
  </div>
);

/* ═══════════════ Coffee Stain — morphs per era ═══════════════ */
const CoffeeStain = ({ era }) => {
  if (era === "1982") {
    return (
      <pre className="absolute top-[-20px] left-[-30px] text-[var(--era-text)] opacity-30 text-[10px] leading-none pointer-events-none z-30 select-none font-mono" aria-hidden="true">
{`  oOOOo
 O     O
 O     O
  oOOOo`}
      </pre>
    );
  }
  if (era === "1995") {
    return (
      <div
        className="absolute top-[-20px] left-[-40px] w-20 h-20 rounded-full pointer-events-none z-30"
        style={{ background: '#8B5A2B', opacity: 0.18 }}
        aria-hidden="true"
      />
    );
  }
  if (era === "2005") {
    return (
      <div
        className="absolute top-[-30px] left-[-50px] w-24 h-24 rounded-full pointer-events-none z-30"
        style={{
          background: 'radial-gradient(circle, rgba(139,90,43,0.25) 0%, transparent 70%)',
          boxShadow: '4px 6px 12px rgba(139,90,43,0.3)',
          filter: 'blur(1px)',
        }}
        aria-hidden="true"
      />
    );
  }
  if (era === "2026") {
    return (
      <div
        className="absolute top-[-25px] left-[-45px] w-20 h-20 rounded-full pointer-events-none z-30"
        style={{
          background: 'radial-gradient(circle, rgba(180,140,80,0.15) 0%, transparent 70%)',
          filter: 'blur(12px)',
          boxShadow: '0 0 30px rgba(180,140,80,0.15)',
        }}
        aria-hidden="true"
      />
    );
  }
  /* Default dossier — full SVG coffee ring */
  return (
    <div className="absolute top-[-40px] left-[-70px] md:left-[-120px] pointer-events-none z-30" style={{ mixBlendMode: 'multiply' }} aria-hidden="true">
      <svg width="350" height="350" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <filter id="coffee-warp" x="-20%" y="-20%" width="140%" height="140%">
            <feTurbulence type="turbulence" baseFrequency="0.04" numOctaves="4" seed="3" result="turbulence" />
            <feDisplacementMap in="SourceGraphic" in2="turbulence" scale="12" xChannelSelector="R" yChannelSelector="G" />
          </filter>
          <radialGradient id="coffee-ring-grad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#4b3621" stopOpacity="0.10" />
            <stop offset="55%" stopColor="#4b3621" stopOpacity="0.05" />
            <stop offset="75%" stopColor="#3a2715" stopOpacity="0.35" />
            <stop offset="90%" stopColor="#2c1e12" stopOpacity="0.60" />
            <stop offset="100%" stopColor="#2c1e12" stopOpacity="0.10" />
          </radialGradient>
        </defs>
        <g filter="url(#coffee-warp)" opacity="0.72" transform="rotate(-12, 100, 100)">
          <path d="M 38 100 C 35 60, 55 28, 95 25 C 130 22, 165 50, 168 90 C 172 135, 145 172, 105 178 C 62 183, 30 155, 32 118 Z" fill="url(#coffee-ring-grad)" />
          <path d="M 40 102 C 37 58, 58 30, 96 27 C 132 24, 163 52, 166 92 C 170 133, 143 170, 107 176 C 64 181, 32 153, 34 116 Z" fill="none" stroke="#2c1e12" strokeWidth="2.5" opacity="0.45" />
          <path d="M 50 100 C 48 68, 64 42, 96 40 C 126 38, 152 58, 154 90 C 157 126, 136 156, 106 160 C 72 164, 46 142, 48 114 Z" fill="none" stroke="#4b3621" strokeWidth="1.2" opacity="0.25" />
        </g>
        <circle cx="170" cy="40" r="3" fill="#3e2723" opacity="0.35" filter="url(#coffee-warp)" />
        <circle cx="178" cy="48" r="1.5" fill="#2c1e12" opacity="0.45" />
        <circle cx="35" cy="175" r="4" fill="#4b3621" opacity="0.25" filter="url(#coffee-warp)" />
      </svg>
    </div>
  );
};

/* ═══════════════ Desk Clutter (dossier era only) ═══════════════ */
const DeskClutter = () => (
  <div className="absolute inset-0 pointer-events-none z-30 overflow-visible" aria-hidden="true">
    {/* CAC Card */}
    <div className="absolute top-12 right-[-20px] md:right-[-60px] rotate-[18deg] w-48 h-72 bg-[#f8f9fa] rounded-xl border border-slate-300 shadow-2xl flex flex-col items-center pt-0 overflow-hidden drop-shadow-2xl">
      <div className="w-full h-10 bg-gradient-to-r from-blue-800 to-blue-900 flex items-center justify-between px-2 shadow-md">
        <div className="w-6 h-6 rounded-full border-2 border-white flex items-center justify-center bg-blue-900">
          <span className="text-[5px] text-white font-bold">DoD</span>
        </div>
        <span className="text-[7px] text-white font-bold tracking-widest">UNITED STATES DEPT OF INFRASTRUCTURE</span>
      </div>
      <div className="mt-4 w-full px-4 flex justify-between items-start">
        <div className="w-14 h-18 bg-slate-200 border-2 border-white flex items-end justify-center relative overflow-hidden shadow-sm">
          <div className="w-8 h-8 bg-slate-400 rounded-full absolute top-2"></div>
          <div className="w-12 h-12 bg-slate-400 rounded-t-full absolute bottom-[-6px]"></div>
        </div>
        <div className="mt-1 w-12 h-10 bg-yellow-200 border border-yellow-500 rounded-md grid grid-cols-3 grid-rows-3 gap-[1px] p-[1px] shadow-sm">
          <div className="bg-yellow-400"></div><div className="bg-yellow-400"></div><div className="bg-yellow-400"></div>
          <div className="bg-yellow-400"></div><div className="bg-yellow-500"></div><div className="bg-yellow-400"></div>
          <div className="bg-yellow-400"></div><div className="bg-yellow-400"></div><div className="bg-yellow-400"></div>
        </div>
      </div>
      <div className="text-[8px] font-sans font-bold text-slate-800 mt-2 w-full px-4 leading-tight">GENEVA CONVENTIONS IDENTIFICATION CARD</div>
      <div className="text-[11px] font-sans font-extrabold text-slate-900 mt-1 w-full px-4 leading-tight">RABURN, MATTHEW</div>
      <div className="text-[9px] font-sans font-bold text-red-600 mt-1 w-full px-4 leading-tight">CLEARANCE: TS/SCI</div>
      <div className="w-full px-4 mt-3 flex justify-between text-[8px] font-sans text-slate-700 font-semibold">
        <div><span className="block text-[6px] text-slate-500">Rank / Pay Grade</span>E7 / GST</div>
        <div><span className="block text-[6px] text-slate-500">Issue Date</span>2023OCT01</div>
        <div><span className="block text-[6px] text-slate-500">Expiration Date</span>2026OCT01</div>
      </div>
      <div className="w-full h-10 mt-auto opacity-85" style={{ backgroundImage: 'repeating-linear-gradient(90deg, #1e293b 0px, #1e293b 2px, transparent 2px, transparent 4px, #1e293b 4px, #1e293b 5px, transparent 5px, transparent 9px)' }}></div>
    </div>
  </div>
);

/* ═══════════════ Resume Home Page ═══════════════ */
function ResumeHome() {
  const [activeJob, setActiveJob] = useState("johnson-controls");

  return (
    <div className="min-h-screen">
      <Marquee text="AVAILABLE · RABURN · AVAILABLE · RABURN" />
      <main className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-12 py-8">
        <div className="flex justify-between items-baseline mb-8">
          <MicrocopyLabel as="div">LAST UPDATED: 2026-05-18</MicrocopyLabel>
          <MicrocopyLabel as="a" href="#experience">MENU</MicrocopyLabel>
        </div>

        <h1 className="display display-name mb-6">
          MATTHEW<br />RABURN
        </h1>

        <p className="display display-tagline mb-12">
          I FIX HIGH-MAINTENANCE SYSTEMS. ALL OF THEM.
        </p>

        <div className="flex flex-wrap items-start justify-between gap-8 mb-12">
          <a href="#trivia" className="no-underline">
            <BrutalistCard interactive>
              <MicrocopyLabel as="div" className="mb-2">04  TRIVIA</MicrocopyLabel>
              <PillBadge>UNPREDICTABLE</PillBadge>
            </BrutalistCard>
          </a>

          <MicrocopyLabel as="div">
            CLIENTS: <RedactedBlock width="3em" /> <RedactedBlock width="4em" />
          </MicrocopyLabel>
        </div>

        <MicrocopyLabel as="div" className="mt-12">LOCATION: CYBERSPACE</MicrocopyLabel>

        <section>
          <SectionHeader number="01" label="EXPERIENCE" id="experience" />
          <div className="space-y-6">
            {resumeData.experience.map((job) => (
              <BrutalistCard key={job.id} className="w-full block">
                <div className="flex flex-wrap items-baseline justify-between gap-2 mb-2">
                  <h3 className="display text-2xl">{job.company}</h3>
                  <MicrocopyLabel>{job.period} · {job.location}</MicrocopyLabel>
                </div>
                <MicrocopyLabel as="div" className="mb-3">{job.title}</MicrocopyLabel>
                <ul className="space-y-2 list-none p-0 m-0">
                  {job.achievements.map((a, i) => (
                    <li key={i} className="font-mono text-sm leading-relaxed text-fg">
                      <span className="text-accent mr-2">▸</span>{a}
                    </li>
                  ))}
                </ul>
              </BrutalistCard>
            ))}
          </div>
        </section>

        <section>
          <SectionHeader number="02" label="SKILLS" id="skills" />
          <div className="flex flex-wrap gap-2">
            {resumeData.operationalTradecraft.map((s, i) => (
              <BrutalistChip key={i}>{s}</BrutalistChip>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}

/* ═══════════════ App (Router) ═══════════════ */
export default function App() {
  return (
    <Routes>
      <Route path="/" element={<ResumeHome />} />
      <Route path="/dashboard" element={<VinylDashboard />} />
      <Route path="/preview" element={<Preview />} />
    </Routes>
  );
}
