"use client";

import { useEffect, useRef, useState } from "react";

const skills = [
  { name: "HTML & CSS",    pct: 95, dot: "#22d3ee" },
  { name: "JavaScript",   pct: 88, dot: "#facc15" },
  { name: "React.js",     pct: 83, dot: "#38bdf8" },
  { name: "Next.js",      pct: 80, dot: "#a78bfa" },
  { name: "Tailwind CSS", pct: 92, dot: "#34d399" },
  { name: "Git & GitHub", pct: 85, dot: "#f472b6" },
];

const techIcons = [
  // Frontend
  { name: "HTML5", icon: "🌐" },
  { name: "CSS3", icon: "🎨" },
  { name: "JavaScript (ES6+)", icon: "💛" },
  { name: "TypeScript", icon: "🔷" },
  { name: "React.js", icon: "⚛️" },
  { name: "Next.js", icon: "▲" },

  // Backend
  { name: "Node.js", icon: "🟢" },
  { name: "Express.js", icon: "🚂" },
  { name: "MongoDB", icon: "🍃" },
  { name: "REST API", icon: "⚡" },
  { name: "Stripe", icon: "💳" },

  // AI Tools
  { name: "ChatGPT", icon: "🤖" },
  { name: "Claude", icon: "🧠" },
  { name: "Cursor AI", icon: "✨" },
  { name: "GitHub Copilot", icon: "🚀" },

  // Development Tools
  { name: "Git", icon: "📦" },
  { name: "GitHub", icon: "🐙" },
  { name: "VS Code", icon: "💻" },
  { name: "Postman", icon: "🚀" },

  // UI Libraries
  { name: "Tailwind CSS", icon: "🌊" },
  { name: "HeroUI", icon: "💎" },
  { name: "DaisyUI", icon: "🌼" },
  { name: "Framer Motion", icon: "🎭" },
  { name: "Font Awesome", icon: "🚩" },

  // Authentication
  { name: "Better Auth", icon: "🛡️" },
  { name: "Google Authentication", icon: "🔑" },

  // Deployment
  { name: "Vercel", icon: "▲" },
  { name: "Render", icon: "☁️" },
];

/* Circular SVG ring — radius 38, so circumference ≈ 238.76 */
const R = 38;
const C = 2 * Math.PI * R; // 238.76

function RingCard({
  skill,
  index,
}: {
  skill: (typeof skills)[0];
  index: number;
}) {
  const [progress, setProgress] = useState(0);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => setProgress(skill.pct), index * 120);
          obs.disconnect();
        }
      },
      { threshold: 0.3 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [skill.pct, index]);

  const dashOffset = C - (C * progress) / 100;

  return (
    <div
      ref={ref}
      className="flex flex-col items-center gap-4 p-6 rounded-2xl bg-transparent border border-white/5 hover:border-white/10 transition-all duration-300 hover:-translate-y-1"
    >
      {/* SVG ring */}
      <div className="relative w-[110px] h-[110px]">
        <svg
          width="110"
          height="110"
          viewBox="0 0 100 100"
          className="-rotate-90"
        >
          {/* Glow filter */}
          <defs>
            <filter id={`glow-${index}`} x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <linearGradient id={`grad-${index}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={skill.dot} stopOpacity="1" />
              <stop offset="100%" stopColor="#ffffff" stopOpacity="0.85" />
            </linearGradient>
          </defs>

          {/* Track */}
          <circle
            cx="50" cy="50" r={R}
            fill="none"
            stroke="rgba(255,255,255,0.06)"
            strokeWidth="7"
            strokeLinecap="round"
          />

          {/* Progress arc */}
          <circle
            cx="50" cy="50" r={R}
            fill="none"
            stroke={`url(#grad-${index})`}
            strokeWidth="7"
            strokeLinecap="round"
            strokeDasharray={C}
            strokeDashoffset={dashOffset}
            filter={`url(#glow-${index})`}
            style={{ transition: "stroke-dashoffset 1.2s cubic-bezier(0.34,1.56,0.64,1)" }}
          />
        </svg>

        {/* Percentage label — centered over SVG */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-xl font-black text-white tabular-nums">
            {progress}%
          </span>
        </div>
      </div>

      {/* Skill label */}
      <div className="flex items-center gap-2">
        <span
          className="w-2 h-2 rounded-full shrink-0"
          style={{ background: skill.dot, boxShadow: `0 0 6px ${skill.dot}` }}
        />
        <span className="text-sm font-medium text-zinc-300">{skill.name}</span>
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
      {/* Header */}
      <div className="text-center space-y-3">
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight">
          Technical Expertise
        </h2>
        <p className="text-zinc-400 text-base max-w-xl mx-auto">
          Core technologies I use daily to build fast, responsive, and beautiful web experiences.
        </p>
      </div>

      {/* Ring cards grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {skills.map((skill, i) => (
          <RingCard key={skill.name} skill={skill} index={i} />
        ))}
      </div>

      {/* Marquee Section */}
      <div className="relative w-full overflow-hidden py-6 border-y border-white/10 bg-zinc-950/40 backdrop-blur-md rounded-2xl flex">
        <div className="absolute inset-y-0 left-0 w-24 sm:w-32 bg-gradient-to-r from-[#09090b] via-[#09090b]/80 to-transparent z-10 pointer-events-none" />
        <div className="absolute inset-y-0 right-0 w-24 sm:w-32 bg-gradient-to-l from-[#09090b] via-[#09090b]/80 to-transparent z-10 pointer-events-none" />

        <div className="animate-marquee flex gap-6 items-center pr-6 shrink-0">
          {[...techIcons, ...techIcons].map((tech, i) => (
            <div
              key={i}
              className="flex items-center gap-3 bg-zinc-900/60 border border-white/10 px-5 py-2.5 rounded-full whitespace-nowrap cursor-pointer hover:scale-105 hover:border-blue-500/50 hover:bg-zinc-800/80 transition-all duration-300 shadow-lg shadow-black/40 group shrink-0"
            >
              <span className="text-lg">{tech.icon}</span>
              <span className="text-sm font-medium text-zinc-300 group-hover:text-white transition-colors">
                {tech.name}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
