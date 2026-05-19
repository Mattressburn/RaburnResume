import React, { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Download,
  Eye,
  ExternalLink,
} from "lucide-react";
import resumePDF from "./assets/Matthew_Raburn_Resume.pdf";
import VinylDashboard from "./pages/VinylDashboard";
import { Routes, Route, Link } from "react-router-dom";
import { resumeData } from "./data/resumeData";
import HiddenGlitchTrigger from "./components/HiddenGlitchTrigger";
import Preview from './pages/Preview';

/* ═══════════════ ERA DEFINITIONS ═══════════════ */
const ERA_KEYS = ["1982", "1995", "2005", "2026", "dossier"];

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

/* ═══════════════ Section Header ═══════════════ */
const SectionHeader = ({ children }) => (
  <h2 className="section-header">{children}</h2>
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

/* ═══════════════ CRT Glitch Transition ═══════════════ */
const glitchTransition = {
  initial: { opacity: 1, scale: 1, x: 0, filter: "brightness(1)" },
  exit: {
    opacity: [1, 0.7, 1, 0.5, 0],
    scale: [1, 1.03, 1.01, 1.03, 1],
    x: [0, -4, 6, -2, 0],
    filter: [
      "brightness(1)",
      "brightness(1.8) contrast(1.5)",
      "brightness(0.6)",
      "brightness(2)",
      "brightness(1)",
    ],
    transition: { duration: 0.4, ease: "easeInOut" },
  },
  enter: {
    opacity: [0, 0.5, 1, 0.8, 1],
    scale: [1.03, 1.01, 1.03, 1, 1],
    x: [6, -3, 2, 0, 0],
    filter: [
      "brightness(2)",
      "brightness(0.6)",
      "brightness(1.5)",
      "brightness(1)",
      "brightness(1)",
    ],
    transition: { duration: 0.4, ease: "easeInOut" },
  },
};

/* ═══════════════ Resume Home Page ═══════════════ */
function ResumeHome() {
  const [activeJob, setActiveJob] = useState("johnson-controls");
  const [currentEra, setCurrentEra] = useState(4); // start at dossier (era 4)
  const [transitionKey, setTransitionKey] = useState(0);

  const era = ERA_KEYS[currentEra];

  const handleCycleEra = useCallback(() => {
    setCurrentEra((prev) => (prev + 1) % 5);
    setTransitionKey((k) => k + 1);
  }, []);

  return (
    <div className="min-h-screen relative era-body" data-era={era}>

      {/* Glitch trigger — z-[100], top-right */}
      <HiddenGlitchTrigger onCycleEra={handleCycleEra} currentEra={currentEra} />

      {/* Noise overlay for CRT glitch */}
      <div className="era-noise-overlay" aria-hidden="true" />

      {/* Main container with framer-motion glitch transition */}
      <AnimatePresence mode="wait">
        <motion.div
          key={transitionKey}
          initial={glitchTransition.enter}
          animate={{ opacity: 1, scale: 1, x: 0, filter: "brightness(1)", transition: { duration: 0.4 } }}
          exit={glitchTransition.exit}
          className="era-page-wrapper"
        >
          <div className="flex justify-center px-2 sm:px-6 lg:px-8 py-6 sm:py-10 relative z-[2]">
            <div className="w-full max-w-5xl mx-auto relative">

              <CoffeeStain era={era} />
              {era === "dossier" && <DeskClutter />}

              {/* ══ Main Card ══ */}
              <div className="era-card desk-shadow rounded-sm relative">
                <div className="p-3 sm:p-5 lg:p-8">

                  {/* Top classification bar */}
                  <div className="flex justify-between items-start mb-4">
                    <div className="era-text-muted text-[10px] sm:text-xs font-mono tracking-wider">
                      {era === "1982" ? "> FILE No. " : "DOSSIER FILE No. "}
                      <Redacted era={era}>MR-4782</Redacted>
                    </div>
                    <ClassifiedStamp className="text-xs sm:text-sm">
                      {era === "1982" ? "** TOP SECRET **" : "TOP SECRET // EYES ONLY"}
                    </ClassifiedStamp>
                  </div>

                  {/* ══ The Paper / Content Area ══ */}
                  <div className="era-paper border rounded-sm relative paper-texture page-enter">

                    {/* Watermark stamp */}
                    <div
                      className="dossier-stamp absolute top-1/3 left-1/2 era-text-accent font-mono text-5xl sm:text-7xl lg:text-8xl font-black border-4 border-current px-4 sm:px-6 py-1 sm:py-2 pointer-events-none select-none whitespace-nowrap"
                      aria-hidden="true"
                    >
                      {era === "1982" ? "CLASSIFIED" : era === "1995" ? "CLASSIFIED" : "CLASSIFIED"}
                    </div>

                    <div className="relative z-[2] p-4 sm:p-8 lg:p-12">

                      {/* ── HEADER ── */}
                      <header className="mb-8 pb-6 border-b-2 border-dashed border-[var(--era-accent)]">
                        <div className="flex flex-col sm:flex-row gap-6 items-start">

                          {/* Photo */}
                          <div className="era-photo w-[130px] h-[150px] sm:w-[150px] sm:h-[170px] flex-shrink-0 flex flex-col items-center justify-center mx-auto sm:mx-0 relative">
                            {era === "dossier" && (
                              <div className="absolute top-[-15px] left-4 rotate-[15deg] drop-shadow-md pointer-events-none z-30">
                                <svg width="24" height="60" viewBox="0 0 24 60" xmlns="http://www.w3.org/2000/svg">
                                  <path d="M 12 2 L 12 48 Q 12 56 6 56 Q 0 56 0 48 L 0 12 Q 0 6 4 6 Q 8 6 8 12 L 8 44 Q 8 48 10 48 Q 12 48 12 44 L 12 10 Q 12 0 18 0 Q 24 0 24 10 L 24 50" fill="none" stroke="#cbd5e1" strokeWidth="2" strokeLinecap="round" />
                                  <path d="M 11 3 L 11 47" fill="none" stroke="#f8fafc" strokeWidth="0.5" opacity="0.8" />
                                </svg>
                              </div>
                            )}
                            <div className="era-photo-inner w-[110px] h-[110px] sm:w-[130px] sm:h-[130px] flex items-center justify-center">
                              <span className="era-text-muted font-mono text-[10px] sm:text-xs text-center font-bold tracking-wider leading-tight px-2">
                                {era === "1982" ? "[ PHOTO N/A ]" : "[ HEADSHOT\nREDACTED ]"}
                              </span>
                            </div>
                            <span className="era-text-muted text-[9px] mt-1.5 font-mono tracking-wider">SUBJ. RABURN, M.</span>
                          </div>

                          {/* Name + info */}
                          <div className="flex-1 text-center sm:text-left">
                            <p className="era-text-muted text-[10px] sm:text-xs mb-1 tracking-widest font-mono">
                              CLEARANCE: <span className="era-text-accent font-bold">BLACK</span>
                            </p>
                            <h1 className="text-2xl sm:text-3xl md:text-4xl era-text font-black mb-1 tracking-tight font-mono">
                              {resumeData.personal.name}
                            </h1>
                            <p className="era-text-muted text-xs sm:text-sm mb-4 tracking-wider font-mono">
                              {resumeData.personal.title}
                            </p>

                            {/* Contact row */}
                            <div className="flex flex-wrap justify-center sm:justify-start gap-2 mb-4">
                              <a
                                href={`mailto:${resumeData.personal.contact.email}`}
                                className="era-btn inline-flex items-center gap-1.5 px-3 py-1.5 text-[11px] sm:text-xs font-mono"
                                aria-label={`Send email to ${resumeData.personal.contact.email}`}
                              >
                                {era === "1982" ? "[EMAIL]" : "📧"} {resumeData.personal.contact.email}
                              </a>
                              <a
                                href={`https://${resumeData.personal.contact.linkedin}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="era-btn inline-flex items-center gap-1.5 px-3 py-1.5 text-[11px] sm:text-xs font-mono"
                                aria-label="Open LinkedIn profile in new window"
                              >
                                {era === "1982" ? "[LINK]" : "🔗"} LinkedIn
                                <ExternalLink className="w-3 h-3" aria-hidden="true" />
                              </a>
                              <span className="era-btn inline-flex items-center px-3 py-1.5 text-[11px] sm:text-xs font-mono">
                                {era === "1982" ? "[LOC]" : "📍"} {resumeData.personal.contact.location}
                              </span>
                            </div>

                            {/* Actions */}
                            <div className="flex flex-wrap justify-center sm:justify-start gap-3">
                              <a
                                href={resumePDF}
                                download="Matthew_Raburn_Resume.pdf"
                                className="era-btn-primary inline-flex items-center gap-2 px-4 py-2 font-bold text-[11px] sm:text-xs tracking-wider font-mono"
                                aria-label="Download PDF version of resume"
                              >
                                <Download className="w-3.5 h-3.5" aria-hidden="true" />
                                {era === "1982" ? "DOWNLOAD .TXT" : "DOWNLOAD DOSSIER (PDF)"}
                              </a>
                              <Link
                                to="/dashboard"
                                className="era-btn inline-flex items-center gap-2 px-3 py-2 text-[11px] sm:text-xs font-mono"
                              >
                                <Eye className="w-3.5 h-3.5" aria-hidden="true" />
                                VINYL RECON DASHBOARD
                              </Link>
                            </div>
                          </div>
                        </div>
                      </header>

                      {/* ── SUBJECT BRIEFING ── */}
                      <section className="mb-8">
                        <SectionHeader>SUBJECT BRIEFING</SectionHeader>
                        <div className="era-inset-panel p-4">
                          <p className="era-text text-xs sm:text-sm leading-relaxed italic font-mono">
                            "<Redacted era={era}>Subject</Redacted> {resumeData.personal.summary}"
                          </p>
                        </div>
                      </section>

                      {/* ── OPERATIONAL TRADECRAFT ── */}
                      <section className="mb-8">
                        <SectionHeader>OPERATIONAL TRADECRAFT (CLEARED FOR RELEASE)</SectionHeader>
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
                          {resumeData.operationalTradecraft.map((skill, i) => (
                            <div
                              key={i}
                              className="era-skill-chip px-3 py-2 text-[11px] sm:text-xs font-mono"
                            >
                              <span className="era-text-accent mr-1">▪</span>
                              {skill}
                            </div>
                          ))}
                        </div>
                      </section>

                      {/* ── MISSION HISTORY ── */}
                      <section className="mb-8">
                        <SectionHeader>MISSION HISTORY</SectionHeader>
                        <div className="flex flex-wrap items-end gap-0.5 -mb-px relative z-[4]" role="tablist" aria-label="Mission history timeline">
                          {resumeData.experience.map((job) => (
                            <FolderTab
                              key={job.id}
                              job={job}
                              isActive={activeJob === job.id}
                              onClick={() => setActiveJob(job.id)}
                            />
                          ))}
                        </div>
                        <div className="era-tab-panel rounded-b-sm p-4 sm:p-6 relative z-[3]">
                          {resumeData.experience.map((job) => (
                            <div key={job.id} role="tabpanel" aria-labelledby={`tab-${job.id}`}>
                              <JobDetails job={job} isActive={activeJob === job.id} />
                            </div>
                          ))}
                        </div>
                      </section>

                      {/* ── ANOMALOUS CAPABILITIES ── */}
                      <section className="mb-8">
                        <div className="flex items-center gap-4 mb-4">
                          <SectionHeader>ANOMALOUS CAPABILITIES</SectionHeader>
                          <ClassifiedStamp className="text-[9px] sm:text-[10px] -mt-2">
                            UNVERIFIED
                          </ClassifiedStamp>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {resumeData.anomalousCapabilities.map((cap, i) => (
                            <div
                              key={i}
                              className="era-inset-panel p-3 era-text text-xs sm:text-sm leading-relaxed font-mono relative"
                            >
                              <span className="absolute top-2 left-3 era-text-accent text-sm font-black" aria-hidden="true">
                                {String(i + 1).padStart(2, "0")}
                              </span>
                              <span className="pl-8 block">{cap}</span>
                            </div>
                          ))}
                        </div>
                      </section>

                      {/* ── FIELD REPORTS ── */}
                      <section className="mb-8">
                        <SectionHeader>FIELD REPORTS // DEBRIEFING TRANSCRIPTS</SectionHeader>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {resumeData.fieldReports.map((report, i) => (
                            <div
                              key={i}
                              className="era-inset-panel p-4 relative"
                            >
                              <div className="absolute top-2 right-3 era-text-accent text-[10px] font-bold tracking-wider font-mono opacity-40">
                                EXHIBIT {String.fromCharCode(65 + i)}
                              </div>
                              <blockquote className="era-text text-xs sm:text-sm leading-relaxed italic mb-3 font-mono">
                                "{report.quote}"
                              </blockquote>
                              <cite className="era-text-accent text-[11px] not-italic block border-t border-current pt-2 tracking-wider font-mono opacity-70">
                                — {report.author}
                              </cite>
                            </div>
                          ))}
                        </div>
                      </section>

                      {/* ── Two-column bottom ── */}
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                        <section>
                          <SectionHeader>TARGET DEPLOYMENTS</SectionHeader>
                          <div className="era-inset-panel p-4">
                            <p className="era-text-accent mb-3 text-[10px] font-mono tracking-wider font-bold opacity-60">
                              ▸ Subject is cleared for deployment in the following configurations:
                            </p>
                            <div className="space-y-1.5 text-xs sm:text-sm font-mono">
                              {resumeData.targetRoles.map((role, i) => (
                                <div key={i} className="era-text">
                                  <span className="era-text-muted mr-2">[{String(i + 1).padStart(2, "0")}]</span>
                                  {role}
                                </div>
                              ))}
                            </div>
                          </div>
                        </section>

                        <section>
                          <SectionHeader>SURVEILLANCE NOTES: CIVILIAN COVER</SectionHeader>
                          <div className="era-inset-panel p-4">
                            <p className="era-text-accent mb-3 text-[10px] font-mono tracking-wider font-bold opacity-60">
                              ▸ Background activities detected:
                            </p>
                            <div className="space-y-2 text-xs sm:text-sm font-mono">
                              {resumeData.civilianCover.map((item, i) => (
                                <div key={i} className="flex flex-col sm:flex-row sm:items-center gap-0.5 sm:gap-2 era-text">
                                  <span className="font-bold">{item.name}</span>
                                  <span className="era-text-muted text-[11px]">{item.category}</span>
                                  <span className="hidden sm:inline era-text-muted opacity-40">—</span>
                                  <span className="era-text-accent text-[11px] tracking-wider opacity-70">{item.status}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </section>
                      </div>

                    </div>
                    {/* end inner padding */}
                  </div>
                  {/* end paper */}

                  {/* Footer */}
                  <div className="era-text-muted text-[9px] sm:text-[10px] tracking-widest text-center pt-4 pb-1 font-mono">
                    DOCUMENT CLASSIFICATION: <span className="era-text-accent font-bold">TOP SECRET</span> // DISTRIBUTION: <Redacted era={era}>EYES ONLY</Redacted> // REF: DR-{new Date().getFullYear()}-RABURN
                  </div>
                </div>
                {/* end card padding */}
              </div>
              {/* end era-card */}
            </div>
            {/* end max-w wrapper */}
          </div>
        </motion.div>
      </AnimatePresence>
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
