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
  { name: "HTML5",                icon: "🌐" },
  { name: "CSS3",                 icon: "🎨" },
  { name: "JavaScript (ES6+)",    icon: "💛" },
  { name: "TypeScript",           icon: "🔷" },
  { name: "React.js",             icon: "⚛️" },
  { name: "Next.js",              icon: "▲"  },
  { name: "Node.js",              icon: "🟢" },
  { name: "Express.js",           icon: "🚂" },
  { name: "MongoDB",              icon: "🍃" },
  { name: "REST API",             icon: "⚡" },
  { name: "Stripe",               icon: "💳" },
  { name: "ChatGPT",              icon: "🤖" },
  { name: "Claude",               icon: "🧠" },
  { name: "Cursor AI",            icon: "✨" },
  { name: "GitHub Copilot",       icon: "🚀" },
  { name: "Git",                  icon: "📦" },
  { name: "GitHub",               icon: "🐙" },
  { name: "VS Code",              icon: "💻" },
  { name: "Postman",              icon: "🚀" },
  { name: "Tailwind CSS",         icon: "🌊" },
  { name: "HeroUI",               icon: "💎" },
  { name: "DaisyUI",              icon: "🌼" },
  { name: "Framer Motion",        icon: "🎭" },
  { name: "Font Awesome",         icon: "🚩" },
  { name: "Better Auth",          icon: "🛡️" },
  { name: "Google Authentication",icon: "🔑" },
  { name: "Vercel",               icon: "▲"  },
  { name: "Render",               icon: "☁️" },
];

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
  const [progress, setProgress] = useState(0);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    let timer: NodeJS.Timeout;
    let animFrame: number;

    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          timer = setTimeout(() => {
            const duration = 1200;
            const start = performance.now();
            const animate = (now: number) => {
              const elapsed = now - start;
              const ratio = Math.min(elapsed / duration, 1);
              const easeOut = 1 - Math.pow(1 - ratio, 3);
              setProgress(Math.round(easeOut * skill.pct));
              if (ratio < 1) animFrame = requestAnimationFrame(animate);
            };
            animFrame = requestAnimationFrame(animate);
          }, index * 100);
        } else {
          clearTimeout(timer);
          cancelAnimationFrame(animFrame);
          setProgress(0);
        }
      },
      { threshold: 0.2 }
    );

    obs.observe(el);
    return () => {
      obs.disconnect();
      clearTimeout(timer);
      cancelAnimationFrame(animFrame);
    };
  }, [skill.pct, index]);

  const dashOffset = C - (C * progress) / 100;

  return (
    <div
      ref={ref}
      className="group flex flex-col items-center gap-4 p-5 rounded-2xl bg-white/[0.02] border border-white/[0.05] hover:border-white/[0.12] hover:bg-white/[0.04] transition-all duration-300 hover:-translate-y-1"
    >
      {/* SVG ring */}
      <div className="relative w-[110px] h-[110px]">
        <svg width="110" height="110" viewBox="0 0 100 100" className="-rotate-90">
          <defs>
            <filter id={`glow-${index}`} x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="2.5" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <linearGradient id={`grad-${index}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={skill.dot} stopOpacity="1" />
              <stop offset="100%" stopColor="#ffffff" stopOpacity="0.7" />
            </linearGradient>
          </defs>

          {/* Track */}
          <circle cx="50" cy="50" r={R} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="7" strokeLinecap="round" />

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

        {/* Center label */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-xl font-black text-white tabular-nums">{progress}%</span>
        </div>
      </div>

      {/* Skill name */}
      <div className="flex items-center gap-2">
        <span
          className="w-2 h-2 rounded-full shrink-0 transition-all duration-300 group-hover:scale-125"
          style={{ background: skill.dot, boxShadow: `0 0 8px ${skill.dot}80` }}
        />
        <span className="text-sm font-medium text-zinc-300 group-hover:text-white transition-colors">{skill.name}</span>
      </div>
    </div>
  );
}

export default function SkillsOverview() {
  return (
    <section id="skills-overview" className="py-24 px-6 max-w-6xl mx-auto space-y-16">
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
      <div className="relative w-full overflow-hidden py-5 border-y border-white/[0.06] bg-zinc-950/50 backdrop-blur-md rounded-2xl">
        {/* Fade masks */}
        <div className="absolute inset-y-0 left-0 w-20 sm:w-32 bg-gradient-to-r from-[#09090b] to-transparent z-10 pointer-events-none" />
        <div className="absolute inset-y-0 right-0 w-20 sm:w-32 bg-gradient-to-l from-[#09090b] to-transparent z-10 pointer-events-none" />

        <div className="animate-marquee flex gap-5 items-center pr-5 shrink-0">
          {[...techIcons, ...techIcons].map((tech, i) => (
            <div
              key={i}
              className="flex items-center gap-2.5 bg-zinc-900/60 border border-white/[0.08] px-4 py-2 rounded-full whitespace-nowrap cursor-pointer hover:scale-105 hover:border-blue-500/40 hover:bg-zinc-800/70 transition-all duration-300 shadow-md shadow-black/30 group shrink-0"
            >
              <span className="text-base">{tech.icon}</span>
              <span className="text-xs font-medium text-zinc-400 group-hover:text-white transition-colors">
                {tech.name}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
