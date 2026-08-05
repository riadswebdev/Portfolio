"use client";

import { useState } from "react";
import FrameScrollAnimation from "./components/FrameScrollAnimation";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import SkillsOverview from "./components/SkillsOverview";
import GithubProjects from "./components/GithubProjects";

export default function Home() {
  const [activeSection, setActiveSection] = useState("home");

  return (
    <div className="min-h-screen text-zinc-100 font-sans selection:bg-blue-500/30 selection:text-blue-400">
      {/* Navigation Bar */}
      <Navbar activeSection={activeSection} onSectionChange={setActiveSection} />

      {/* Canvas frame animation — fixed background, driven by page scroll */}
      <FrameScrollAnimation backgroundMode />

      {/* ── Hero Section ─────────────────────────────────────────────────── */}
      <section className="relative pt-36 pb-24 md:pt-52 md:pb-40 px-6 max-w-7xl mx-auto overflow-hidden">
        {/* Ambient glow orb */}
        <div className="absolute top-1/3 left-1/4 w-[700px] h-[700px] bg-gradient-to-tr from-blue-600/10 via-indigo-600/8 to-purple-600/8 rounded-full blur-3xl pointer-events-none -z-10" />
        <div className="absolute top-1/2 right-0 w-[400px] h-[400px] bg-gradient-to-bl from-cyan-600/8 to-transparent rounded-full blur-3xl pointer-events-none -z-10" />

        <div className="max-w-3xl space-y-8">
          {/* Status badge */}
          <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-blue-500/8 border border-blue-500/20 text-xs font-mono text-blue-400 backdrop-blur-sm">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-sm shadow-emerald-400/50" />
            <span>Available for Opportunities</span>
            <span className="text-blue-500/50">•</span>
            <span>Frontend Developer</span>
          </div>

          {/* Headline */}
          <div className="space-y-3">
            <p className="text-white text-sm sm:text-base font-mono tracking-wider uppercase">
              Hi, I&apos;m
            </p>
            <h1 className="text-5xl sm:text-7xl lg:text-8xl font-extrabold tracking-tight text-white leading-[1.05]">
              Md. Riad{" "}
              <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-400 bg-clip-text text-transparent">
                Shekh
              </span>
            </h1>
          </div>

          {/* Sub-headline */}
          <p className="text-base sm:text-lg text-white font-light leading-relaxed max-w-2xl">
            Building modern, responsive web applications with{" "}
            <span className="text-zinc-200 font-medium">React.js, Next.js &amp; TypeScript</span>.
            Full-stack experience with{" "}
            <span className="text-zinc-200 font-medium">Node.js, MongoDB &amp; REST APIs</span>.
            Experienced with AI-driven development workflows.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-wrap gap-3 items-center pt-2">
            <a
              href="/contact"
              className="px-7 py-3.5 rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-semibold shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 transition-all duration-300 hover:-translate-y-0.5 flex items-center gap-2 text-sm"
            >
              Get In Touch
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </a>
            <a
              href="#projects"
              className="px-7 py-3.5 rounded-2xl bg-zinc-900/70 border border-zinc-800 hover:border-zinc-600 text-zinc-300 hover:text-white font-medium transition-all duration-300 hover:-translate-y-0.5 text-sm backdrop-blur-sm"
            >
              Explore Projects
            </a>
            <a
              href="/Md%20Riad%20Shekh%20Final%20Resume.pdf"
              target="_blank"
              download="Md Riad Shekh Final Resume.pdf"
              rel="noreferrer"
              className="px-7 py-3.5 rounded-2xl bg-zinc-900/70 hover:bg-zinc-800/80 border border-zinc-800 hover:border-cyan-500/40 text-zinc-300 hover:text-white font-medium transition-all duration-300 hover:-translate-y-0.5 flex items-center gap-2 group text-sm backdrop-blur-sm"
            >
              <svg className="w-4 h-4 text-cyan-400 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Download Resume
            </a>
          </div>

          {/* Quick Stats */}
          <div className="pt-10 grid grid-cols-3 gap-8 border-t border-zinc-800/50 max-w-xl">
            {[
              { label: "Core Stack",       value: "React & Next.js" },
              { label: "Architecture",     value: "Full-Stack" },
              { label: "AI Tools",         value: "Cursor & GPT" },
            ].map((stat) => (
              <div key={stat.label}>
                <p className="text-xl sm:text-2xl font-bold text-white tracking-tight">{stat.value}</p>
                <p className="text-xs text-zinc-500 font-mono tracking-wide mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Capabilities Section ──────────────────────────────────────────── */}
      <section id="skills" className="py-28 px-6 max-w-7xl mx-auto border-t border-zinc-900/60">
        <div className="text-center max-w-2xl mx-auto space-y-4 mb-16">
          <span className="inline-block text-xs font-mono uppercase tracking-[0.2em] text-blue-400 bg-blue-500/8 px-3 py-1 rounded-full border border-blue-500/15">
            Capabilities
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
            Technical Stack &amp; Expertise
          </h2>
          <p className="text-white text-sm leading-relaxed">
            Building complex, responsive applications with a focus on modern web standards and smooth interactions.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {[
            {
              title: "Frontend Engineering",
              desc: "Next.js, React 19, TypeScript, SPA & Server Side Rendering architectures.",
              icon: "💻",
              accent: "from-blue-500/10 to-cyan-500/5",
              border: "hover:border-blue-500/30",
            },
            {
              title: "Motion & Canvas",
              desc: "Frame sequences, HTML5 Canvas API, smooth scroll physics, RequestAnimationFrame loops.",
              icon: "✨",
              accent: "from-purple-500/10 to-indigo-500/5",
              border: "hover:border-purple-500/30",
            },
            {
              title: "Styling & UI",
              desc: "Tailwind CSS v4, HeroUI, CSS Modules, dark mode design systems & micro-interactions.",
              icon: "🎨",
              accent: "from-pink-500/10 to-rose-500/5",
              border: "hover:border-pink-500/30",
            },
            {
              title: "Backend & APIs",
              desc: "Node.js, Express.js, MongoDB, REST API design, authentication & Stripe integration.",
              icon: "⚡",
              accent: "from-emerald-500/10 to-teal-500/5",
              border: "hover:border-emerald-500/30",
            },
          ].map((item, i) => (
            <div
              key={i}
              className={`relative p-6 rounded-2xl bg-gradient-to-br ${item.accent} border border-zinc-800/60 ${item.border} hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group backdrop-blur-sm overflow-hidden`}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
              <div className="text-3xl mb-5">{item.icon}</div>
              <h3 className="text-base font-semibold text-white mb-2 tracking-tight">{item.title}</h3>
              <p className="text-xs text-white leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Skills Overview with Ring Charts ─────────────────────────────── */}
      <SkillsOverview />

      {/* ── GitHub Projects Section ───────────────────────────────────────── */}
      <GithubProjects username="riadswebdev" maxItems={6} showSearch={false} />

      {/* ── Training Section ─────────────────────────────────────────────── */}
      <section id="training" className="py-28 px-6 max-w-7xl mx-auto border-t border-zinc-900/60">
        <div className="space-y-4 mb-16 text-center max-w-2xl mx-auto">
          <span className="inline-block text-xs font-mono uppercase tracking-[0.2em] text-blue-400 bg-blue-500/8 px-3 py-1 rounded-full border border-blue-500/15">
            Professional Development
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">Training</h2>
          <p className="text-white text-sm leading-relaxed">
            Hands-on intensive web development training and practical full-stack application building.
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="relative p-8 sm:p-12 rounded-3xl bg-gradient-to-br from-zinc-950/60 to-blue-950/20 border border-zinc-800/70 hover:border-blue-500/30 transition-all duration-500 shadow-2xl shadow-black/50 overflow-hidden group">
            {/* Decorative glow */}
            <div className="absolute top-0 right-0 w-72 h-72 bg-blue-500/5 rounded-full blur-3xl group-hover:bg-blue-500/10 transition-all duration-700 pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-cyan-500/4 rounded-full blur-3xl pointer-events-none" />

            {/* Header row */}
            <div className="relative flex flex-col sm:flex-row sm:items-start justify-between gap-5 pb-7 mb-7 border-b border-zinc-800/50">
              <div className="space-y-1">
                <span className="text-xs font-mono text-blue-400 uppercase tracking-[0.15em]">
                  Frontend Web Development Learner
                </span>
                <h3 className="text-2xl sm:text-3xl font-bold text-white">Programming Hero</h3>
              </div>
              <div className="flex items-center gap-2.5 shrink-0">
                <span className="px-3.5 py-1.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 text-xs font-mono">
                  2025 – Present
                </span>
                <span className="px-3.5 py-1.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-mono flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Active
                </span>
              </div>
            </div>

            {/* Bullet points */}
            <ul className="relative grid sm:grid-cols-2 gap-4">
              {[
                "Developed multiple full-stack web applications using React.js, Next.js, Node.js, Express.js, TypeScript, and MongoDB.",
                "Implemented authentication systems, REST APIs, and database integration.",
                "Built responsive and user-friendly interfaces using Tailwind CSS and HeroUI.",
                "Used Git and GitHub for version control and project management.",
                "Deployed projects using Vercel and Render.",
              ].map((bullet, idx) => (
                <li key={idx} className="flex items-start gap-3 group/item">
                  <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-blue-400 shrink-0 group-hover/item:bg-cyan-400 transition-colors" />
                  <span className="text-zinc-200 text-sm leading-relaxed font-light">{bullet}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ── Contact CTA Section ───────────────────────────────────────────── */}
      <section id="contact" className="py-28 px-6 max-w-7xl mx-auto border-t border-zinc-900/60">
        <div className="relative rounded-3xl border border-zinc-800/80 p-10 sm:p-20 overflow-hidden shadow-2xl">
          {/* Background Video from Cloudinary (Muted) */}
          <div className="absolute inset-0 w-full h-full pointer-events-none -z-10 overflow-hidden">
            <iframe
              src="https://player.cloudinary.com/embed/?cloud_name=djgg1xzaj&public_id=Use_Image_as_the_primary_ide_3__processed_cw6jxk&autoplay=true&loop=true&muted=true&controls=false"
              className="absolute top-1/2 left-1/2 w-[100%] h-[100%] min-w-[177.77vh] min-h-[56.25vw] -translate-x-1/2 -translate-y-1/2 object-cover border-0 scale-125"
              allow="autoplay; fullscreen"
            />
            <div className="absolute inset-0 bg-black/80 backdrop-blur-[1px]" />
          </div>

          {/* Decorative gradient border glow */}
          <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-blue-600/5 via-transparent to-cyan-600/5 pointer-events-none" />

          <div className="max-w-2xl space-y-7 relative z-10">
            <div className="space-y-1">
              <span className="text-xs font-mono uppercase tracking-[0.2em] text-blue-400">
                Get in Touch
              </span>
              <h2 className="text-4xl sm:text-5xl font-bold text-white tracking-tight leading-tight">
                Let&apos;s build something{" "}
                <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                  extraordinary
                </span>{" "}
                together.
              </h2>
            </div>
            <p className="text-zinc-300 text-base font-light leading-relaxed">
              Have a project in mind or interested in collaboration? Reach out and let&apos;s discuss what we can build.
            </p>

            <div className="flex flex-wrap gap-3 pt-2">
              <a
                href="/contact"
                className="px-7 py-3.5 rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-semibold shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 transition-all duration-300 hover:-translate-y-0.5 flex items-center gap-2 text-sm"
              >
                Send Message
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </a>
              <a
                href="https://github.com/riadswebdev"
                target="_blank"
                rel="noreferrer"
                className="px-7 py-3.5 rounded-2xl bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-700/60 hover:border-zinc-500/60 text-zinc-200 hover:text-white font-medium transition-all duration-300 hover:-translate-y-0.5 flex items-center gap-2 text-sm"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                </svg>
                GitHub Profile
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
}
