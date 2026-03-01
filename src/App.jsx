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

/* =============== Resume Home Page =============== */
function ResumeHome() {
  const [activeJob, setActiveJob] = useState("johnson-controls");

  return (
    <div className="min-h-screen bg-stone-900 font-mono overflow-x-hidden">
      {/* Dark desk background with subtle grain */}

      {/* ── Desk surface wrapper ── */}
      <div className="flex justify-center px-2 sm:px-6 lg:px-8 py-6 sm:py-10">

        {/* ══ Manilla Folder ══ */}
        <div className="w-full max-w-5xl bg-[#E6D5AA] desk-shadow rounded-sm relative">

          {/* Decorative coffee stain */}
          <div className="coffee-stain" style={{ bottom: '-20px', right: '60px', opacity: 0.5 }} />

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

              {/* Paperclip decoration */}
              <div className="paperclip hidden sm:block" />

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
                    <div className="polaroid w-[130px] h-[150px] sm:w-[150px] sm:h-[170px] flex-shrink-0 flex flex-col items-center justify-center bg-stone-100 mx-auto sm:mx-0">
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
