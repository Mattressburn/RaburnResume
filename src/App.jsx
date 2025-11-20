import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Download,
  Terminal,
  Activity,
  Network,
  FileText,
  Code,
  User,
  ExternalLink,
} from "lucide-react";
import resumePDF from "./assets/Matthew_Raburn_Resume.pdf";
import LogTicker from "./LogTicker";
import SkillsStatus from "./SkillsStatus";
import VinylDashboard from "./pages/VinylDashboard";
import { Routes, Route, Link } from "react-router-dom";
import { resumeData } from "./data/resumeData";

/* =============== Matrix background (canvas) =============== */
const MatrixBackground = ({ opacity = 0.18, fontSize = 16, charset = "01", fadeAlpha = 0.08 }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d", { alpha: true });

    const prefersReduced = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;
    if (prefersReduced) return;

    const DPR = Math.max(1, Math.min(2, window.devicePixelRatio || 1));

    const resize = () => {
      const w = window.innerWidth,
        h = window.innerHeight;
      canvas.width = Math.floor(w * DPR);
      canvas.height = Math.floor(h * DPR);
      canvas.style.width = w + "px";
      canvas.style.height = h + "px";
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
      ctx.font = `${fontSize}px ui-monospace, SFMono-Regular, Menlo, Consolas, monospace`;
    };

    resize();
    window.addEventListener("resize", resize);

    const cols = () => Math.ceil(canvas.width / DPR / fontSize);
    let drops = Array.from({ length: cols() }, () => Math.floor(Math.random() * 50));
    const accent =
      getComputedStyle(document.documentElement).getPropertyValue("--accent").trim() || "#39ff14";

    let raf = 0,
      running = true;
    const step = () => {
      if (!running) return;
      ctx.fillStyle = `rgba(0,0,0,${fadeAlpha})`;
      ctx.fillRect(0, 0, canvas.width / DPR, canvas.height / DPR);

      ctx.fillStyle = accent;
      for (let i = 0; i < drops.length; i++) {
        const ch = charset[Math.floor(Math.random() * charset.length)];
        const x = i * fontSize,
          y = drops[i] * fontSize;
        ctx.fillText(ch, x, y);
        const bottom = canvas.height / DPR;
        if (y > bottom && Math.random() > 0.975) drops[i] = 0;
        drops[i]++;
      }
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);

    const onVisibility = () => {
      if (document.hidden) {
        running = false;
        cancelAnimationFrame(raf);
      } else {
        running = true;
        raf = requestAnimationFrame(step);
      }
    };

    const onResize = () => {
      drops = Array.from({ length: cols() }, () => Math.floor(Math.random() * 50));
    };

    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("resize", onResize);

    return () => {
      running = false;
      cancelAnimationFrame(raf);
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("resize", resize);
      window.removeEventListener("resize", onResize);
    };
  }, [opacity, fontSize, charset, fadeAlpha]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-0 pointer-events-none"
      style={{ opacity }}
      aria-hidden="true"
    />
  );
};

/* =============== Presentational bits =============== */
const NetworkNode = ({ job, isActive, onClick }) => {
  const startYear = job.period.split(" - ")[0].split("/")[2];
  const endYear = job.period.split(" - ")[1].split("/")[2];

  return (
    <button
      onClick={onClick}
      className={`inline-block m-2 px-3 py-2 sm:px-4 sm:py-3 rounded-full border-2 transition-all duration-300 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-[--accent] focus:ring-offset-2 focus:ring-offset-gray-800 ${
        isActive
          ? "bg-yellow-500 border-yellow-500 text-black scale-110"
          : "bg-gray-800 border-[--accent] text-[--accent] hover:bg-[--accent] hover:text-black hover:scale-105"
      }`}
      aria-label={`View details for ${job.company} position from ${startYear} to ${endYear}`}
    >
      {job.company} ({startYear}-{endYear})
    </button>
  );
};

const JobDetails = ({ job, isActive }) => (
  <div className={`mt-4 transition-all duration-500 ${isActive ? "block" : "hidden"}`}>
    <div className="bg-gray-900/80 backdrop-blur-[2px] border-l-4 border-[--accent] p-4 rounded-r">
      <h3 className="text-yellow-500 text-lg font-bold mb-2">
        {job.title} - {job.company}
      </h3>
      <p className="text-gray-400 text-sm mb-3">
        {job.period} | {job.location}
      </p>
      <ul className="space-y-2">
        {job.achievements.map((achievement, i) => (
          <li key={i} className="text-green-300 text-sm leading-relaxed pl-4 relative">
            <span className="absolute left-0 text-yellow-500" aria-hidden="true">
              →
            </span>
            {achievement}
          </li>
        ))}
      </ul>
    </div>
  </div>
);

const Panel = ({ icon: Icon, title, children, className = "", ...rest }) => (
  <div
    {...rest}
    className={`bg-gradient-to-br from-gray-800/70 to-gray-900/70 backdrop-blur-[2px] border border-gray-600 rounded-lg p-4 sm:p-6 shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-[rgba(57,255,20,0.2)] hover:shadow-xl ${className}`}
  >
    <div className="flex items-center gap-2 mb-4 pb-2 border-b border-gray-600">
      <div className="w-3 h-3 bg-[--accent] rounded-full animate-pulse" aria-hidden="true" />
      <Icon className="w-5 h-5 text-yellow-500" aria-hidden="true" />
      <h2 className="text-yellow-500 font-bold text-base sm:text-lg">{title}</h2>
    </div>
    {children}
  </div>
);


/* =============== Custom Hooks =============== */
const useHackerMode = () => {
  const [hackerMode, setHackerMode] = useState(false);

  // Konami code detection
  useEffect(() => {
    const seq = [
      "ArrowUp",
      "ArrowUp",
      "ArrowDown",
      "ArrowDown",
      "ArrowLeft",
      "ArrowRight",
      "ArrowLeft",
      "ArrowRight",
      "b",
      "a",
    ];
    let i = 0;
    const onKey = (e) => {
      const key = e.key.toLowerCase();
      const expected = seq[i].toLowerCase();
      if (key === expected) {
        i++;
        if (i === seq.length) {
          setHackerMode((v) => !v);
          i = 0;
        }
      } else {
        i = key === seq[0].toLowerCase() ? 1 : 0;
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // URL and localStorage persistence
  useEffect(() => {
    const q = new URLSearchParams(window.location.search);
    if (q.get("hack") === "1" || window.location.hash.includes("hack")) {
      setHackerMode(true);
    } else {
      const saved = localStorage.getItem("hackerMode");
      if (saved) setHackerMode(saved === "1");
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("hackerMode", hackerMode ? "1" : "0");
  }, [hackerMode]);

  // Update CSS accent color
  useEffect(() => {
    document.documentElement.style.setProperty("--accent", hackerMode ? "#00e5ff" : "#39ff14");
  }, [hackerMode]);

  return [hackerMode, setHackerMode];
};

/* =============== Resume Home Page =============== */
function ResumeHome() {
  const [activeJob, setActiveJob] = useState("pall");
  const [hackerMode, setHackerMode] = useHackerMode();

  // Mobile gesture handling
  const tapRef = useRef({ count: 0, last: 0, pressTimer: null });

  const toggleHacker = useCallback(() => setHackerMode((v) => !v), [setHackerMode]);

  const onHeaderTouchStart = useCallback(() => {
    const now = Date.now();
    const gap = now - tapRef.current.last;
    tapRef.current.count = gap < 400 ? tapRef.current.count + 1 : 1;
    tapRef.current.last = now;

    if (tapRef.current.count >= 3) {
      toggleHacker();
      tapRef.current.count = 0;
    }

    clearTimeout(tapRef.current.pressTimer);
    tapRef.current.pressTimer = setTimeout(() => toggleHacker(), 1200);
  }, [toggleHacker]);

  const onHeaderTouchEnd = useCallback(() => {
    clearTimeout(tapRef.current.pressTimer);
  }, []);

  return (
    <div className="min-h-screen relative bg-black text-green-400 font-mono overflow-x-hidden">
      <MatrixBackground
        opacity={hackerMode ? 0.28 : 0.18}
        fontSize={hackerMode ? 14 : 16}
        charset={hackerMode ? "アカサタナハマヤラワ0123456789" : "01"}
        fadeAlpha={hackerMode ? 0.04 : 0.08}
      />

      {hackerMode && (
        <div className="fixed top-2 right-2 z-20 text-xs bg-[--accent] text-black px-2 py-1 rounded">
          Hacker Mode ON
        </div>
      )}

      {/* CONTENT */}
      <div className="relative z-10">
        {/* Header */}
        <header
          className="bg-gradient-to-r from-gray-800/70 to-gray-700/70 backdrop-blur-[2px] border-b-2 border-[--accent] p-4 sm:p-8 text-center"
          onTouchStart={onHeaderTouchStart}
          onTouchEnd={onHeaderTouchEnd}
        >
          <div className="text-yellow-500 text-base sm:text-xl mb-2">admin@resume:~$ whoami</div>
          <h1 className="text-2xl sm:text-3xl md:text-5xl text-[--accent] font-bold mb-2">
            {resumeData.personal.name}
          </h1>
          <p className="text-gray-400 text-sm sm:text-lg mb-4">{resumeData.personal.title}</p>

          <div className="flex flex-wrap justify-center gap-2 sm:gap-4 mb-4">
            <a
              href={`mailto:${resumeData.personal.contact.email}`}
              className="inline-flex items-center gap-2 px-3 py-2 border border-[--accent] rounded text-green-300 hover:bg-[--accent] hover:text-black transition"
              aria-label={`Send email to ${resumeData.personal.contact.email}`}
            >
              📧 {resumeData.personal.contact.email}
            </a>
            <a
              href={`https://${resumeData.personal.contact.linkedin}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-3 py-2 border border-[--accent] rounded text-green-300 hover:bg-[--accent] hover:text-black transition"
              aria-label="Open LinkedIn profile in new window"
            >
              🔗 LinkedIn
              <ExternalLink className="w-3 h-3" aria-hidden="true" />
            </a>
            <span className="px-3 py-2 border border-[--accent] rounded text-green-300">
              📍 {resumeData.personal.contact.location}
            </span>
          </div>

          {/* PDF download */}
          <a
            href={resumePDF}
            download="Matthew_Raburn_Resume.pdf"
            className="inline-flex items-center gap-2 bg-[--accent] text-black px-4 py-2 rounded font-bold transition-transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-[--accent] focus:ring-offset-2 focus:ring-offset-gray-800"
            aria-label="Download PDF version of resume"
          >
            <Download className="w-4 h-4" aria-hidden="true" />
            Download PDF Resume
          </a>

          {/* Dashboard link */}
          <p className="mt-4">
            <Link to="/dashboard" className="inline-flex items-center gap-2 px-3 py-2 border rounded">
              <span className="record-icon" style={{ '--size': '18px' }} aria-hidden />
              <span>Open Vinyl Dashboard</span>
            </Link>

          </p>
        </header>

        {/* Dashboard */}
        <main className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-8 p-4 sm:p-8 max-w-7xl mx-auto">
          <Panel icon={Activity} title="SYSTEM STATUS">
            <SkillsStatus skills={resumeData.skills} />
          </Panel>

          <Panel icon={Terminal} title="TERMINAL INTERFACE">
            <div className="bg-black/70 border border-gray-600 rounded p-3 sm:p-4 max-h-72 overflow-y-auto text-xs sm:text-sm">
              <div className="mb-2">
                <span className="text-yellow-500">matthew@resume:~$</span>
                <span className="text-green-300 ml-2">cat summary.txt</span>
              </div>
              <div className="text-gray-300 mb-4 leading-relaxed text-xs sm:text-sm">
                {resumeData.personal.summary}
              </div>
              <div className="mb-2">
                <span className="text-yellow-500">matthew@resume:~$</span>
                <span className="text-green-300 ml-2">ls -la skills/</span>
              </div>
              <div className="text-gray-300 space-y-1 text-xs">
                {resumeData.skills.map((skill, index) => (
                  <div key={index}>drwxr-xr-x {skill.name.replace(" ", "_")}</div>
                ))}
              </div>
              <div className="mt-4 text-yellow-500">
                matthew@resume:~$ <span className="opacity-70">_</span>
              </div>
            </div>
          </Panel>

          <Panel icon={Network} title="NETWORK TOPOLOGY" className="lg:col-span-2">
            <div className="mb-4" role="tablist" aria-label="Job experience timeline">
              {resumeData.experience.map((job) => (
                <NetworkNode
                  key={job.id}
                  job={job}
                  isActive={activeJob === job.id}
                  onClick={() => setActiveJob(job.id)}
                />
              ))}
            </div>
            {resumeData.experience.map((job) => (
              <div key={job.id} role="tabpanel" aria-labelledby={`tab-${job.id}`}>
                <JobDetails job={job} isActive={activeJob === job.id} />
              </div>
            ))}
          </Panel>

          <Panel icon={FileText} title="SYSTEM LOGS">
            <div className="bg-black/70 border border-gray-600 rounded p-3 max-h-64 overflow-y-auto text-xs sm:text-sm">
              <LogTicker intervalMs={3000} />
            </div>
          </Panel>

          <Panel icon={Code} title="TARGET DEPLOYMENTS">
            <div className="bg-gray-900/70 p-4 rounded">
              <div className="text-yellow-500 mb-3 text-sm sm:text-base">
                ▸ Available for the following system configurations:
              </div>
              <div className="space-y-2 text-sm">
                {resumeData.targetRoles.map((role, index) => (
                  <div key={index} className="text-green-300">
                    • {role}
                  </div>
                ))}
              </div>
            </div>
          </Panel>

          <Panel icon={User} title="BACKGROUND PROCESSES" className="lg:col-span-2">
            <div className="bg-gray-900/70 p-4 rounded">
              <div className="text-yellow-500 mb-3 text-sm sm:text-base">▸ Running in background:</div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                {resumeData.interests.map((interest, index) => (
                  <div key={index} className="text-green-300">
                    <span aria-hidden="true">{interest.icon}</span> {interest.name}.exe - Status:{" "}
                    {interest.status}
                  </div>
                ))}
              </div>
            </div>
          </Panel>
        </main>
      </div>
    </div>
  );
}

/* =============== App (Router) =============== */
export default function App() {
  // If your index.js already wraps <App/> in <BrowserRouter>, remove the <BrowserRouter> here
  return (
      <Routes>
        <Route path="/" element={<ResumeHome />} />
        <Route path="/dashboard" element={<VinylDashboard />} />
      </Routes>
  );
}
