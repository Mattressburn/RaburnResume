import React, { useState } from "react";
import {
  Download,
  Eye,
  ExternalLink,
} from "lucide-react";
import resumePDF from "./assets/Matthew_Raburn_Resume.pdf";
import VinylDashboard from "./pages/VinylDashboard";
import { Routes, Route, Link } from "react-router-dom";
import { resumeData } from "./data/resumeData";

/* =============== Redacted Span Helper =============== */
const Redacted = ({ children }) => (
  <span className="redacted" title="HOVER TO DECLASSIFY">
    {children}
  </span>
);

/* =============== Classified Stamp (red ink) =============== */
const ClassifiedStamp = ({ children, className = "" }) => (
  <div
    className={`ink-stamp inline-block -rotate-2 select-none ${className}`}
    aria-hidden="true"
  >
    {children}
  </div>
);

/* =============== Section Header (typewriter) =============== */
const SectionHeader = ({ children }) => (
  <h2 className="section-header">{children}</h2>
);

/* =============== Experience Tab (manilla folder tab) =============== */
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

/* =============== Job Details =============== */
const JobDetails = ({ job, isActive }) => (
  <div className={`transition-all duration-300 ${isActive ? "block page-enter" : "hidden"}`}>
    <div className="border-l-4 border-[#c4b078] pl-4 py-2 mb-4">
      <h3 className="text-slate-800 text-sm sm:text-base font-bold font-mono">
        {job.title} — <span className="text-red-800">{job.company}</span>
      </h3>
      <p className="text-slate-500 text-xs mt-0.5 font-mono">
        {job.period} | {job.location}
      </p>
    </div>
    <ul className="space-y-2.5 ml-2">
      {job.achievements.map((a, i) => (
        <li
          key={i}
          className="text-slate-700 text-xs sm:text-sm leading-relaxed pl-5 relative font-mono"
        >
          <span className="absolute left-0 top-0 text-red-700/50 font-bold text-xs" aria-hidden="true">
            {String(i + 1).padStart(2, "0")}.
          </span>
          {a}
        </li>
      ))}
    </ul>
  </div>
);

/* =============== Desk Clutter (positioned relative to folder) =============== */
const DeskClutter = () => {
  return (
    <div className="absolute inset-0 pointer-events-none z-30 overflow-visible" aria-hidden="true">
      
      {/* 1. Ultra-Realistic Coffee Stain (Top Left) */}
      <div className="absolute top-[-40px] left-[-70px] md:left-[-120px] opacity-70 mix-blend-multiply transform -rotate-12">
        <svg width="350" height="350" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <filter id="stain-blur" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="0.8" />
            </filter>
            <filter id="stain-blur-heavy" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="1.5" />
            </filter>
          </defs>
          <path d="M 12 50 C 12 25, 30 8, 55 12 C 78 15, 90 35, 88 58 C 85 82, 60 95, 35 88 C 15 82, 12 70, 12 50 Z" fill="#4e342e" fillOpacity="0.06" filter="url(#stain-blur-heavy)" />
          <path d="M 15 50 C 15 28, 32 12, 53 15 C 75 18, 85 36, 84 55 C 82 76, 58 88, 38 82 C 20 77, 15 65, 15 50 Z" stroke="#271612" strokeWidth="1.2" fill="none" opacity="0.8" filter="url(#stain-blur)" />
          <path d="M 18 52 C 18 32, 34 16, 52 18 C 72 20, 80 37, 79 53 C 78 72, 57 82, 40 78 C 24 74, 18 64, 18 52 Z" stroke="#4e342e" strokeWidth="0.8" fill="none" opacity="0.6" filter="url(#stain-blur)" />
          <circle cx="85" cy="20" r="1.5" fill="#3e2723" opacity="0.7" filter="url(#stain-blur)" />
          <circle cx="90" cy="25" r="0.8" fill="#271612" opacity="0.8" />
          <circle cx="20" cy="85" r="2.5" fill="#4e342e" opacity="0.5" filter="url(#stain-blur)" />
          <circle cx="25" cy="88" r="1" fill="#271612" opacity="0.7" />
        </svg>
      </div>

      {/* 2. Discarded CAC Card (Top Right) - Larger & Detailed */}
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
        <div className="text-[8px] font-sans font-bold text-slate-800 mt-2 w-full px-4 leading-tight">
          GENEVA CONVENTIONS IDENTIFICATION CARD
        </div>
        <div className="text-[11px] font-sans font-extrabold text-slate-900 mt-1 w-full px-4 leading-tight">
          RABURN, MATTHEW
        </div>
         <div className="text-[9px] font-sans font-bold text-red-600 mt-1 w-full px-4 leading-tight">
          CLEARANCE: TS/SCI
        </div>
        <div className="w-full px-4 mt-3 flex justify-between text-[8px] font-sans text-slate-700 font-semibold">
            <div>
                <span className="block text-[6px] text-slate-500">Rank / Pay Grade</span>
                E7 / GST
            </div>
            <div>
                <span className="block text-[6px] text-slate-500">Issue Date</span>
                2023OCT01
            </div>
            <div>
                <span className="block text-[6px] text-slate-500">Expiration Date</span>
                2026OCT01
            </div>
        </div>
        <div className="w-full h-10 mt-auto opacity-85" style={{ backgroundImage: 'repeating-linear-gradient(90deg, #1e293b 0px, #1e293b 2px, transparent 2px, transparent 4px, #1e293b 4px, #1e293b 5px, transparent 5px, transparent 9px)' }}></div>
      </div>

      {/* 3. Authentic Vector Flipper Zero (Middle Left) */}
      <div className="absolute top-[35%] left-[-20px] md:left-[-70px] -rotate-[15deg] pointer-events-none z-20 drop-shadow-2xl">
        <svg width="140" height="320" viewBox="0 0 140 320" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M 30 10 L 110 10 C 118 10 125 15 130 25 L 135 45 L 135 240 C 135 250 130 260 120 270 L 80 310 C 75 315 65 315 60 310 L 15 260 C 8 250 5 240 5 230 L 5 45 C 5 35 10 25 18 18 L 30 10 Z" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="2" />
          <rect x="50" y="5" width="40" height="6" rx="2" fill="#0f172a" />
          <g fill="#eab308">
            <rect x="54" y="5" width="2" height="6" />
            <rect x="62" y="5" width="2" height="6" />
            <rect x="70" y="5" width="2" height="6" />
            <rect x="78" y="5" width="2" height="6" />
          </g>
          <circle cx="70" cy="85" r="32" fill="#f97316" />
          <circle cx="70" cy="85" r="12" fill="#ea580c" />
          <path d="M 70 60 L 66 66 L 74 66 Z" fill="#fff" opacity="0.6" />
          <path d="M 70 110 L 66 104 L 74 104 Z" fill="#fff" opacity="0.6" />
          <path d="M 45 85 L 51 81 L 51 89 Z" fill="#fff" opacity="0.6" />
          <path d="M 95 85 L 89 81 L 89 89 Z" fill="#fff" opacity="0.6" />
          <circle cx="115" cy="125" r="8" fill="#f97316" />
          <path d="M 116 122 L 113 125 L 116 128" fill="none" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.8"/>
          <rect x="25" y="145" width="90" height="65" rx="4" fill="#1e293b" />
          <rect x="30" y="150" width="80" height="55" rx="2" fill="#f97316" />
          <text x="70" y="170" fontFamily="monospace" fontSize="11" fill="#0f172a" textAnchor="middle" fontWeight="bold">Sub-GHz</text>
          <text x="70" y="185" fontFamily="monospace" fontSize="10" fill="#0f172a" textAnchor="middle">READing...</text>
          <rect x="35" y="195" width="70" height="5" fill="#0f172a" opacity="0.3" />
          <rect x="35" y="195" width="45" height="5" fill="#0f172a" />
          <text x="70" y="240" fontFamily="sans-serif" fontSize="14" fill="#f97316" textAnchor="middle" fontStyle="italic" fontWeight="900" letterSpacing="1">FLIPPER</text>
          <circle cx="115" cy="140" r="2" fill="#0f172a" opacity="0.8" />
          <circle cx="60" cy="275" r="4" fill="#94a3b8" />
          <circle cx="60" cy="275" r="2.5" fill="#64748b" />
          <circle cx="75" cy="285" r="4" fill="#94a3b8" />
          <circle cx="75" cy="285" r="2.5" fill="#64748b" />
        </svg>
      </div>

      {/* 4. DDR4 RAM Stick 2x Scale (Middle Right) */}
      <div className="absolute top-[45%] right-[-70px] md:right-[-160px] rotate-[75deg] drop-shadow-2xl">
        <div className="w-96 h-24 bg-[#133c22] border-2 border-[#0a2012] rounded-sm relative flex flex-col justify-between overflow-hidden shadow-2xl">
          <div className="flex justify-evenly px-4 pt-2">
            {[...Array(8)].map((_,i) => (
              <div key={i} className="w-8 h-12 bg-[#111] rounded-sm shadow-black shadow-md border border-zinc-800">
                <div className="w-2 h-2 bg-zinc-800 rounded-full m-1"></div>
              </div>
            ))}
          </div>
          <div className="absolute top-3 left-[30%] w-32 h-10 bg-white border border-slate-300 flex flex-col items-center justify-center z-10 opacity-90">
             <div className="w-28 h-4 border-b border-black mb-1" style={{ backgroundImage: 'repeating-linear-gradient(90deg, #000 0px, #000 2px, transparent 2px, transparent 3px, #000 3px, #000 4px, transparent 4px, transparent 6px)' }}></div>
             <span className="text-[8px] font-mono font-bold">16GB DDR4-3200 ECC</span>
          </div>
          <div className="w-full h-3 bg-yellow-600 flex justify-evenly relative border-t border-yellow-700">
             {[...Array(60)].map((_,i) => <div key={i} className="w-[2px] h-full bg-yellow-400 opacity-80"></div>)}
             <div className="absolute bottom-0 left-[42%] w-3 h-4 bg-[#1a2b22] rounded-t-md"></div>
          </div>
        </div>
      </div>

      {/* 5. Hardware Graveyard 2x Scale (Bottom Right) */}
      <div className="absolute bottom-12 right-[-20px] md:right-[-120px] rotate-6 drop-shadow-2xl">
        <div className="w-64 h-64 bg-zinc-800 rounded-md border-b-4 border-r-4 border-zinc-900 shadow-2xl relative flex justify-center">
          <div className="w-40 h-20 bg-gradient-to-b from-zinc-300 to-zinc-400 absolute top-0 left-8 flex justify-end pr-4 pt-2 rounded-b-sm border-x border-b border-zinc-500">
            <div className="w-8 h-12 bg-zinc-900 shadow-inner rounded-sm relative overflow-hidden">
               <div className="absolute top-2 w-full h-[1px] bg-zinc-700"></div>
            </div>
          </div>
          <div className="w-48 h-36 bg-[#fdfbf7] absolute bottom-6 flex flex-col items-center pt-4 border-2 border-zinc-300 shadow-inner rounded-sm">
            <div className="w-full border-b-2 border-blue-200 mt-2"></div>
            <div className="w-full border-b-2 border-blue-200 mt-6"></div>
            <div className="w-full border-b-2 border-blue-200 mt-6"></div>
            <span className="text-sm font-mono text-red-600 font-bold transform -rotate-2 relative z-10 mt-[-40px]">DO NOT RUN.ps1</span>
          </div>
          <div className="absolute bottom-4 right-4 w-4 h-4 bg-transparent border-t-4 border-l-4 border-zinc-900"></div>
        </div>
        <div className="absolute top-[-20px] left-[-40px] -rotate-45 drop-shadow-2xl z-20">
          <div className="w-10 h-12 bg-gradient-to-b from-zinc-300 to-zinc-400 border-2 border-zinc-500 mx-auto flex justify-evenly pt-2 rounded-t-sm">
            <div className="w-2 h-3 bg-zinc-800 opacity-80"></div>
            <div className="w-2 h-3 bg-zinc-800 opacity-80"></div>
          </div>
          <div className="w-16 h-24 bg-black rounded-b-lg border-2 border-zinc-800 flex items-end justify-center pb-3 shadow-inner">
            <span className="text-[10px] text-zinc-500 font-mono font-bold tracking-widest">128GB</span>
          </div>
        </div>
      </div>

    </div>
  );
};

/* =============== Resume Home Page =============== */
function ResumeHome() {
  const [activeJob, setActiveJob] = useState("johnson-controls");

  return (
    <div
      className="min-h-screen bg-[#1a2b22] font-mono overflow-hidden relative"
      style={{ backgroundImage: 'linear-gradient(#23382c 1px, transparent 1px), linear-gradient(90deg, #23382c 1px, transparent 1px)', backgroundSize: '20px 20px' }}
    >
      {/* Dark green cutting mat background */}

      {/* ── Desk surface wrapper ── */}
      <div className="flex justify-center px-2 sm:px-6 lg:px-8 py-6 sm:py-10 relative z-[2]">

        {/* ── Relative confinement wrapper for clutter + folder ── */}
        <div className="w-full max-w-5xl mx-auto relative">
          <DeskClutter />

          {/* ══ Manilla Folder ══ */}
          <div className="bg-[#E6D5AA] desk-shadow rounded-sm relative">

          {/* Folder padding wrapper */}
          <div className="p-3 sm:p-5 lg:p-8">

            {/* ══ Top Secret Stamp (overlapping folder) ══ */}
            <div className="flex justify-between items-start mb-4">
              <div className="text-[10px] sm:text-xs text-stone-500 font-mono tracking-wider">
                DOSSIER FILE No. <Redacted>MR-4782</Redacted>
              </div>
              <ClassifiedStamp className="text-xs sm:text-sm">
                TOP SECRET // EYES ONLY
              </ClassifiedStamp>
            </div>

            {/* ══ The Paper ══ */}
            <div className="bg-[#FDFBF7] border border-stone-300 rounded-sm relative paper-texture page-enter">



              {/* Large watermark stamp */}
              <div
                className="dossier-stamp absolute top-1/3 left-1/2 text-red-700 font-mono text-5xl sm:text-7xl lg:text-8xl font-black border-4 border-red-700 px-4 sm:px-6 py-1 sm:py-2 pointer-events-none select-none whitespace-nowrap"
                aria-hidden="true"
              >
                CLASSIFIED
              </div>

              {/* Paper inner padding */}
              <div className="relative z-[2] p-4 sm:p-8 lg:p-12">

                {/* ── HEADER ── */}
                <header className="mb-8 pb-6 border-b-2 border-dashed border-[#c4b078]">
                  <div className="flex flex-col sm:flex-row gap-6 items-start">

                    {/* Dossier Photo (Polaroid) */}
                    <div className="polaroid w-[130px] h-[150px] sm:w-[150px] sm:h-[170px] flex-shrink-0 flex flex-col items-center justify-center bg-stone-100 mx-auto sm:mx-0 relative">

                      {/* Paperclip (Inline SVG) — binds photo to the paper */}
                      <div className="absolute top-[-15px] left-4 rotate-[15deg] drop-shadow-md pointer-events-none z-30">
                        <svg width="24" height="60" viewBox="0 0 24 60" xmlns="http://www.w3.org/2000/svg">
                          <path d="M 12 2 L 12 48 Q 12 56 6 56 Q 0 56 0 48 L 0 12 Q 0 6 4 6 Q 8 6 8 12 L 8 44 Q 8 48 10 48 Q 12 48 12 44 L 12 10 Q 12 0 18 0 Q 24 0 24 10 L 24 50" fill="none" stroke="#cbd5e1" strokeWidth="2" strokeLinecap="round" />
                          {/* Metallic highlight */}
                          <path d="M 11 3 L 11 47" fill="none" stroke="#f8fafc" strokeWidth="0.5" opacity="0.8" />
                        </svg>
                      </div>

                      <div className="w-[110px] h-[110px] sm:w-[130px] sm:h-[130px] bg-stone-800 flex items-center justify-center">
                        <span className="text-stone-400 font-mono text-[10px] sm:text-xs text-center font-bold tracking-wider leading-tight px-2">
                          [ HEADSHOT<br/>REDACTED ]
                        </span>
                      </div>
                      <span className="text-[9px] text-stone-400 mt-1.5 font-mono tracking-wider">SUBJ. RABURN, M.</span>
                    </div>

                    {/* Name + Info Block */}
                    <div className="flex-1 text-center sm:text-left">
                      <p className="text-stone-400 text-[10px] sm:text-xs mb-1 tracking-widest font-mono">
                        CLEARANCE: <span className="text-red-700 font-bold">BLACK</span>
                      </p>
                      <h1 className="text-2xl sm:text-3xl md:text-4xl text-slate-800 font-black mb-1 tracking-tight font-mono">
                        {resumeData.personal.name}
                      </h1>
                      <p className="text-slate-500 text-xs sm:text-sm mb-4 tracking-wider font-mono">
                        {resumeData.personal.title}
                      </p>

                      {/* Contact row */}
                      <div className="flex flex-wrap justify-center sm:justify-start gap-2 mb-4">
                        <a
                          href={`mailto:${resumeData.personal.contact.email}`}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#FDFBF7] border border-stone-300 text-slate-600 hover:border-red-700 hover:text-red-800 transition text-[11px] sm:text-xs font-mono"
                          aria-label={`Send email to ${resumeData.personal.contact.email}`}
                        >
                          📧 {resumeData.personal.contact.email}
                        </a>
                        <a
                          href={`https://${resumeData.personal.contact.linkedin}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#FDFBF7] border border-stone-300 text-slate-600 hover:border-red-700 hover:text-red-800 transition text-[11px] sm:text-xs font-mono"
                          aria-label="Open LinkedIn profile in new window"
                        >
                          🔗 LinkedIn
                          <ExternalLink className="w-3 h-3" aria-hidden="true" />
                        </a>
                        <span className="inline-flex items-center px-3 py-1.5 bg-[#FDFBF7] border border-stone-300 text-slate-600 text-[11px] sm:text-xs font-mono">
                          📍 {resumeData.personal.contact.location}
                        </span>
                      </div>

                      {/* Actions */}
                      <div className="flex flex-wrap justify-center sm:justify-start gap-3">
                        <a
                          href={resumePDF}
                          download="Matthew_Raburn_Resume.pdf"
                          className="inline-flex items-center gap-2 bg-red-800 text-white px-4 py-2 font-bold transition-all hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-600 text-[11px] sm:text-xs tracking-wider font-mono"
                          aria-label="Download PDF version of resume"
                        >
                          <Download className="w-3.5 h-3.5" aria-hidden="true" />
                          DOWNLOAD DOSSIER (PDF)
                        </a>
                        <Link
                          to="/dashboard"
                          className="inline-flex items-center gap-2 px-3 py-2 border border-stone-400 text-slate-500 hover:text-red-800 hover:border-red-700 transition text-[11px] sm:text-xs font-mono"
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
                  <div className="bg-amber-50/50 border border-stone-200 p-4">
                    <p className="text-slate-700 text-xs sm:text-sm leading-relaxed italic font-mono">
                      "<Redacted>Subject</Redacted> {resumeData.personal.summary}"
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
                        className="bg-amber-50/50 border border-stone-200 px-3 py-2 text-[11px] sm:text-xs text-slate-700 font-mono hover:border-red-700/40 hover:bg-red-50/30 transition-colors"
                      >
                        <span className="text-red-700/50 mr-1">▪</span>
                        {skill}
                      </div>
                    ))}
                  </div>
                </section>

                {/* ── MISSION HISTORY (Tabbed Experience) ── */}
                <section className="mb-8">
                  <SectionHeader>MISSION HISTORY</SectionHeader>

                  {/* Folder tabs row */}
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

                  {/* Tab panel (paper sheet inside folder) */}
                  <div className="bg-[#FDFBF7] border border-[#c4b078] rounded-b-sm p-4 sm:p-6 relative z-[3]">
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
                        className="bg-amber-50/40 border border-stone-200 p-3 text-slate-700 text-xs sm:text-sm leading-relaxed font-mono relative"
                      >
                        <span className="absolute top-2 left-3 text-red-700/30 text-sm font-black" aria-hidden="true">
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
                        className="bg-amber-50/40 border border-stone-200 p-4 relative"
                      >
                        <div className="absolute top-2 right-3 text-red-700/25 text-[10px] font-bold tracking-wider font-mono">
                          EXHIBIT {String.fromCharCode(65 + i)}
                        </div>
                        <blockquote className="text-slate-700 text-xs sm:text-sm leading-relaxed italic mb-3 font-mono">
                          "{report.quote}"
                        </blockquote>
                        <cite className="text-red-800/70 text-[11px] not-italic block border-t border-stone-200 pt-2 tracking-wider font-mono">
                          — {report.author}
                        </cite>
                      </div>
                    ))}
                  </div>
                </section>

                {/* ── Two-column bottom row ── */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">

                  {/* TARGET DEPLOYMENTS */}
                  <section>
                    <SectionHeader>TARGET DEPLOYMENTS</SectionHeader>
                    <div className="bg-amber-50/40 border border-stone-200 p-4">
                      <p className="text-red-700/60 mb-3 text-[10px] font-mono tracking-wider font-bold">
                        ▸ Subject is cleared for deployment in the following configurations:
                      </p>
                      <div className="space-y-1.5 text-xs sm:text-sm font-mono">
                        {resumeData.targetRoles.map((role, i) => (
                          <div key={i} className="text-slate-700">
                            <span className="text-stone-400 mr-2">[{String(i + 1).padStart(2, "0")}]</span>
                            {role}
                          </div>
                        ))}
                      </div>
                    </div>
                  </section>

                  {/* CIVILIAN COVER */}
                  <section>
                    <SectionHeader>SURVEILLANCE NOTES: CIVILIAN COVER</SectionHeader>
                    <div className="bg-amber-50/40 border border-stone-200 p-4">
                      <p className="text-red-700/60 mb-3 text-[10px] font-mono tracking-wider font-bold">
                        ▸ Background activities detected:
                      </p>
                      <div className="space-y-2 text-xs sm:text-sm font-mono">
                        {resumeData.civilianCover.map((item, i) => (
                          <div key={i} className="flex flex-col sm:flex-row sm:items-center gap-0.5 sm:gap-2 text-slate-700">
                            <span className="font-bold">{item.name}</span>
                            <span className="text-stone-400 text-[11px]">{item.category}</span>
                            <span className="hidden sm:inline text-stone-300">—</span>
                            <span className="text-red-800/70 text-[11px] tracking-wider">{item.status}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </section>

                </div>

              </div>
              {/* end paper inner padding */}
            </div>
            {/* end paper */}

            {/* ── Footer line on folder ── */}
            <div className="text-stone-500 text-[9px] sm:text-[10px] tracking-widest text-center pt-4 pb-1 font-mono">
              DOCUMENT CLASSIFICATION: <span className="text-red-700 font-bold">TOP SECRET</span> // DISTRIBUTION: <Redacted>EYES ONLY</Redacted> // REF: DR-{new Date().getFullYear()}-RABURN
            </div>
          </div>
          {/* end folder padding */}
          </div>
          {/* end manilla folder */}
        </div>
        {/* end confinement wrapper */}
      </div>
      {/* end desk surface */}
    </div>
  );
}

/* =============== App (Router) =============== */
export default function App() {
  return (
    <Routes>
      <Route path="/" element={<ResumeHome />} />
      <Route path="/dashboard" element={<VinylDashboard />} />
    </Routes>
  );
}
