import React from "react";
import resumePDF from "./assets/Matthew_Raburn_Resume.pdf";
import VinylDashboard from "./pages/VinylDashboard";
import { Routes, Route } from "react-router-dom";
import { resumeData } from "./data/resumeData";
import Marquee from './components/Marquee';
import MicrocopyLabel from './components/MicrocopyLabel';
import BrutalistCard from './components/BrutalistCard';
import PillBadge from './components/PillBadge';
import RedactedBlock from './components/RedactedBlock';
import SectionHeader from './components/SectionHeader';
import BrutalistChip from './components/BrutalistChip';

/* ═══════════════ Resume Home Page ═══════════════ */
function ResumeHome() {
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

        <section>
          <SectionHeader number="03" label="TESTIMONIALS" id="testimonials" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {resumeData.fieldReports.map((report, i) => (
              <BrutalistCard key={i} className="w-full block">
                <blockquote className="display text-lg leading-tight mb-4">
                  "{report.quote}"
                </blockquote>
                <cite className="micro not-italic block">— {report.author}</cite>
              </BrutalistCard>
            ))}
          </div>
        </section>

        <section>
          <SectionHeader number="04" label="TRIVIA" id="trivia" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {resumeData.anomalousCapabilities.map((cap, i) => (
              <BrutalistCard key={i} className="w-full block">
                <PillBadge>FACT {String(i + 1).padStart(2, '0')}</PillBadge>
                <p className="font-mono text-sm leading-relaxed mt-3 mb-0">{cap}</p>
              </BrutalistCard>
            ))}
          </div>
        </section>

        <section>
          <SectionHeader number="05" label="TARGET ROLES" id="target-roles" />
          <ol className="font-mono text-base space-y-2 list-none p-0">
            {resumeData.targetRoles.map((role, i) => (
              <li key={i}>
                <span className="text-muted-fg mr-3">[{String(i + 1).padStart(2, '0')}]</span>
                {role}
              </li>
            ))}
          </ol>
        </section>

        <section>
          <SectionHeader number="06" label="INTERESTS" id="interests" />
          <ul className="space-y-3 list-none p-0">
            {resumeData.civilianCover.map((item, i) => (
              <li key={i} className="flex flex-wrap items-center gap-3 font-mono text-sm">
                <span className="text-fg font-bold uppercase">{item.name}</span>
                <span className="text-muted-fg">{item.category}</span>
                <span className="text-accent">·</span>
                <span className="text-accent uppercase tracking-widest">{item.status}</span>
              </li>
            ))}
          </ul>
        </section>

        <footer className="mt-16 pt-6 border-t-3 border-fg">
          <div className="flex flex-wrap justify-between items-baseline gap-4 font-mono text-xs uppercase tracking-widest">
            <span>© 2026 RABURN, M.</span>
            <div className="flex gap-4">
              <a href={`mailto:${resumeData.personal.contact.email}`}>{resumeData.personal.contact.email}</a>
              <a href={`https://${resumeData.personal.contact.linkedin}`} target="_blank" rel="noopener noreferrer">LINKEDIN</a>
              <a href={resumePDF} download="Matthew_Raburn_Resume.pdf">DOWNLOAD .PDF</a>
            </div>
          </div>
        </footer>
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
    </Routes>
  );
}
