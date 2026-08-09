"use client";

import { useEffect, useRef, useState } from "react";

// Inline SVG icons for the six core technologies
function ReactIcon() {
  return (
    <svg
      width="36"
      height="36"
      viewBox="0 0 841.9 595.3"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <g fill="#61DAFB">
        <path d="M666.3 296.5c0 49.2-39.8 89-89 89s-89-39.8-89-89 39.8-89 89-89 89 39.8 89 89z" />
        <g opacity="0.85">
          <path d="M520.5 78.1c77 28 140.6 73 179.6 118.4 42.8 50.8 56.1 102.6 43.6 144.9-12.5 42.3-49.2 74.6-99.9 95.6-50.7 20.9-116.9 31.6-190.8 32.1-73.9.5-141.5-9.5-192.7-29.8-48-18.8-82.5-45.8-96.9-78.3-15.5-34.8-6.2-76.3 26.1-120.8C226.3 220 289 175 365.6 147c77-28 141.3-33.5 154.9-68.9 8.4-21.3 5.6-41.9-7.2-62.3z" />
        </g>
      </g>
    </svg>
  );
}

function NextIcon() {
  return (
    <svg width="36" height="36" viewBox="0 0 24 24" aria-hidden>
      <path
        d="M3 3v18h18V3H3zm5.5 4.5H13v2.2L9.8 16H13v2H7.5V7.5zM16.5 7.5H20v9h-3.5v-9z"
        fill="#ffffff"
      />
    </svg>
  );
}

function TSIcon() {
  return (
    <svg width="36" height="36" viewBox="0 0 256 256" aria-hidden>
      <rect width="256" height="256" rx="28" fill="#3178C6" />
      <path d="M76 92v72h28v-40h16v40h28V92h-28v28h-16V92H76z" fill="#fff" />
    </svg>
  );
}

function JSIcon() {
  return (
    <svg width="36" height="36" viewBox="0 0 128 128" aria-hidden>
      <rect width="128" height="128" rx="24" fill="#F7DF1E" />
      <path
        d="M52 88s2.8 5.1 9.8 5.1c7 0 9.6-3.5 9.6-8.5V57h16v30.9c0 16.6-9.7 24.1-25.1 24.1-13.5 0-21-7-25-15l14.7-8.9zM30 56h16v41.9c0 11.2 6.6 17.6 17.6 17.6 10.6 0 17.4-5.4 17.4-17.6V56h16v40.9C97 108.6 84.4 120 62 120 39.6 120 28 108.6 28 96V56z"
        fill="#000"
      />
    </svg>
  );
}

function TailwindIcon() {
  return (
    <svg width="36" height="36" viewBox="0 0 48 48" aria-hidden>
      <path
        d="M24 36c-6.6 0-11.8-4.6-14.2-9 4-2 6.9-2.3 9.4-2.3 4.3 0 7.4 1.9 10.8 5.1 3.9 3.6 8.7 5.9 14 5.9-5.8 3.5-10.9 3.3-20 0z"
        fill="#06B6D4"
      />
      <path
        d="M24 28c-6.6 0-11.8-4.6-14.2-9 4-2 6.9-2.3 9.4-2.3 4.3 0 7.4 1.9 10.8 5.1 3.9 3.6 8.7 5.9 14 5.9-5.8 3.5-10.9 3.3-20 0z"
        fill="#7C3AED"
        opacity="0.2"
      />
    </svg>
  );
}

function FramerIcon() {
  return (
    <svg width="36" height="36" viewBox="0 0 24 24" aria-hidden>
      <path
        d="M12 2c3 0 5 2 5 5 0 4-5 6-5 11 0-5-5-7-5-11 0-3 2-5 5-5z"
        fill="#0055FF"
      />
    </svg>
  );
}

const skills = [
  { name: "React.js", pct: 92, dot: "#61DAFB" },
  { name: "Next.js", pct: 90, dot: "#000000" },
  { name: "TypeScript", pct: 92, dot: "#3178C6" },
  { name: "JavaScript (ES6+)", pct: 88, dot: "#F7DF1E" },
  { name: "Tailwind CSS", pct: 90, dot: "#38BDF8" },
  { name: "Framer Motion", pct: 86, dot: "#0055FF" },
];

const techIcons = skills.map((s) => ({ name: s.name }));

/* Circular SVG ring — radius 38 */
const R = 38;
const C = 2 * Math.PI * R;

function RingCard({
  skill,
  index,
}: {
  skill: (typeof skills)[0];
  index: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (media.matches) {
      setIsVisible(true);
      return;
    }

    const obs = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      { threshold: 0.2 },
    );

    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const progress = isVisible ? (skill.pct ?? 0) : 0;
  const dashOffset = C - (C * progress) / 100;

  return (
    <div
      ref={ref}
      className="group flex flex-col items-center gap-4 p-5 rounded-2xl bg-white/2 border border-white/5 hover:border-white/12 hover:bg-white/4 transition-all duration-300 hover:-translate-y-1"
    >
      {/* SVG ring */}
      <div className="relative w-27.5 h-27.5">
        <svg
          width="110"
          height="110"
          viewBox="0 0 100 100"
          className="-rotate-90"
        >
          <defs>
            <filter
              id={`glow-${index}`}
              x="-50%"
              y="-50%"
              width="200%"
              height="200%"
            >
              <feGaussianBlur stdDeviation="2.5" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <linearGradient
              id={`grad-${index}`}
              x1="0%"
              y1="0%"
              x2="100%"
              y2="100%"
            >
              <stop offset="0%" stopColor={skill.dot} stopOpacity="1" />
              <stop offset="100%" stopColor="#ffffff" stopOpacity="0.7" />
            </linearGradient>
          </defs>

          {/* Track */}
          <circle
            cx="50"
            cy="50"
            r={R}
            fill="none"
            stroke="rgba(255,255,255,0.05)"
            strokeWidth="7"
            strokeLinecap="round"
          />

          {/* Progress arc */}
          <circle
            cx="50"
            cy="50"
            r={R}
            fill="none"
            stroke={`url(#grad-${index})`}
            strokeWidth="7"
            strokeLinecap="round"
            strokeDasharray={C}
            strokeDashoffset={dashOffset}
            filter={`url(#glow-${index})`}
            style={{
              transition:
                "stroke-dashoffset 1.2s cubic-bezier(0.34,1.56,0.64,1)",
            }}
          />
        </svg>

        {/* Center label with logo + percent */}
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-1">
          <div
            className="rounded-full p-1"
            style={{ boxShadow: `0 6px 18px ${skill.dot}40` }}
          >
            {(skill as any).icon}
          </div>
          <span className="text-sm font-semibold text-white tabular-nums">
            {progress}%
          </span>
        </div>
      </div>

      {/* Skill name */}
      <div className="flex items-center gap-2">
        <span
          className="w-2 h-2 rounded-full shrink-0 transition-all duration-300 group-hover:scale-125"
          style={{ background: skill.dot, boxShadow: `0 0 8px ${skill.dot}80` }}
        />
        <span className="text-sm font-medium text-zinc-300 group-hover:text-white transition-colors">
          {skill.name}
        </span>
      </div>
    </div>
  );
}

export default function SkillsOverview() {
  return (
    <section
      id="skills-overview"
      className="py-24 px-6 max-w-6xl mx-auto space-y-16"
    >
      {/* Section Header */}
      <div className="text-center space-y-4">
        <span className="inline-block text-xs font-mono uppercase tracking-[0.2em] text-blue-400 bg-blue-500/8 px-3 py-1 rounded-full border border-blue-500/15">
          Proficiency
        </span>
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight">
          Technical Expertise
        </h2>
        <p className="text-zinc-100 text-sm sm:text-base max-w-xl mx-auto leading-relaxed">
          Technologies and tools I use to build scalable web applications.
        </p>
      </div>

      {/* Ring Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {skills.map((skill, i) => (
          <RingCard key={skill.name} skill={skill} index={i} />
        ))}
      </div>

      {/* Tech Marquee */}
      <div className="relative w-full overflow-hidden py-5 border-y border-white/6 bg-zinc-950/50 backdrop-blur-md rounded-2xl">
        {/* Fade masks */}
        <div className="absolute inset-y-0 left-0 w-20 sm:w-32 bg-linear-to-r from-[#09090b] to-transparent z-10 pointer-events-none" />
        <div className="absolute inset-y-0 right-0 w-20 sm:w-32 bg-linear-to-l from-[#09090b] to-transparent z-10 pointer-events-none" />

        <div className="animate-marquee flex gap-5 items-center pr-5 shrink-0">
          {[...techIcons, ...techIcons].map((tech, i) => {
            return (
              <div
                key={i}
                className="flex items-center gap-2.5 bg-zinc-900/60 border border-white/8 px-4 py-2 rounded-full whitespace-nowrap cursor-pointer hover:scale-105 hover:border-blue-500/40 hover:bg-zinc-800/70 transition-all duration-300 shadow-md shadow-black/30 group shrink-0"
              >
                <span className="text-xs font-medium text-zinc-100 group-hover:text-white transition-colors">
                  {tech.name}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
