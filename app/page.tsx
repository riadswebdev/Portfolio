"use client";

import { useState } from "react";
import Image from "next/image";
import FrameScrollAnimation from "./components/FrameScrollAnimation";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import SkillsOverview from "./components/SkillsOverview";

import GithubProjects from "./components/GithubProjects";

export default function Home() {
  const [activeTab, setActiveTab] = useState("all");
  const [activeSection, setActiveSection] = useState("home");

  const projects = [
    {
      title: "Interactive Spatial Engine",
      category: "webgl",
      description: "Real-time 3D web experience with canvas sequence rendering & smooth physics acceleration.",
      tags: ["Canvas API", "TypeScript", "Next.js", "Tailwind"],
      stats: "60 FPS Render Loop",
    },
    {
      title: "Nova Portfolio System",
      category: "frontend",
      description: "Ultra-fast portfolio template optimized for dark aesthetics, dynamic typography & micro-interactions.",
      tags: ["Next.js 16", "React 19", "HeroUI"],
      stats: "100 Lighthouse Score",
    },
    {
      title: "Aura UI Component Lab",
      category: "design",
      description: "Comprehensive design system with glassmorphic cards, custom spring animations & responsive layouts.",
      tags: ["Design System", "CSS Modules", "Figma"],
      stats: "24+ Components",
    },
    {
      title: "Nexus Data Dashboard",
      category: "frontend",
      description: "Real-time analytics platform with live data streams, interactive charts, and gesture controls.",
      tags: ["React", "D3.js", "WebSockets"],
      stats: "< 50ms Latency",
    },
  ];

  const filteredProjects = activeTab === "all" ? projects : projects.filter(p => p.category === activeTab);

  return (
    <div className="min-h-screen text-zinc-100 font-sans selection:bg-blue-500/30 selection:text-blue-400">
      {/* Navigation Bar */}
      <Navbar activeSection={activeSection} onSectionChange={setActiveSection} />

      {/* Canvas frame animation — fixed background, driven by page scroll */}
      <FrameScrollAnimation backgroundMode />

      {/* Hero / Banner Section (Text Only) */}
      <section className="relative pt-36 pb-20 md:pt-48 md:pb-32 px-6 max-w-7xl mx-auto overflow-hidden">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-tr from-blue-600/15 via-indigo-600/10 to-purple-600/10 rounded-full blur-3xl pointer-events-none -z-10" />

        <div className="max-w-3xl space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-xs font-mono text-blue-400">
            <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
            Frontend Developer • Full-Stack Enthusiast
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white leading-[1.1]">
            Hi, I&apos;m <br />
            <span className="bg-gradient-to-r from-blue-400 via-indigo-300 to-purple-400 bg-clip-text text-transparent">
              Md. Riad Shekh
            </span>
          </h1>

          <p className="text-lg sm:text-xl text-zinc-300 font-light leading-relaxed max-w-2xl">
            Frontend Developer passionate about building modern, responsive, and user-friendly web applications using <span className="text-white font-medium">React.js, Next.js, TypeScript</span> and <span className="text-white font-medium">MongoDB</span>. Experienced with AI-driven workflows &amp; modern stack architectures.
          </p>

          <div className="pt-2 flex flex-wrap gap-4 items-center">
            <a
              href="/contact"
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-semibold shadow-lg shadow-cyan-500/20 transition-all flex items-center gap-2"
            >
              Get In Touch
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </a>
            <a
              href="#projects"
              className="px-6 py-3 rounded-xl bg-zinc-900/60 border border-zinc-800 hover:border-zinc-700 text-zinc-300 hover:text-white font-medium transition-colors"
            >
              Explore Projects
            </a>
          </div>

          {/* Resume Quick Stats */}
          <div className="pt-12 grid grid-cols-3 gap-6 border-t border-zinc-800/60 max-w-2xl">
            <div>
              <p className="text-2xl sm:text-3xl font-bold text-white">React &amp; Next</p>
              <p className="text-xs text-zinc-400 font-mono tracking-wide mt-1">Core Tech Stack</p>
            </div>
            <div>
              <p className="text-2xl sm:text-3xl font-bold text-white">Full-Stack</p>
              <p className="text-xs text-zinc-400 font-mono tracking-wide mt-1">MERN &amp; Next App Router</p>
            </div>
            <div>
              <p className="text-2xl sm:text-3xl font-bold text-white">AI Workflows</p>
              <p className="text-xs text-zinc-400 font-mono tracking-wide mt-1">Cursor &amp; Copilot</p>
            </div>
          </div>
        </div>
      </section>




      {/* Skills & Capability Section */}
      <section id="skills" className="py-28 px-6 max-w-7xl mx-auto border-t border-zinc-900">
        <div className="text-center max-w-2xl mx-auto space-y-4 mb-16">
          <span className="text-xs font-mono uppercase tracking-widest text-blue-400">Capabilities</span>
          <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">Technical Stack & Expertise</h2>
          <p className="text-zinc-400 text-sm">
            Building complex, responsive applications with a focus on modern web standards and smooth interactions.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              title: "Frontend Engineering",
              desc: "Next.js, React 19, TypeScript, SPA & Server Side Rendering architectures.",
              icon: "💻",
            },
            {
              title: "Motion & Canvas",
              desc: "Frame sequences, HTML5 Canvas API, smooth scroll physics, RequestAnimationFrame loops.",
              icon: "✨",
            },
            {
              title: "Styling & UI",
              desc: "Tailwind CSS v4, HeroUI, CSS Modules, dark mode design systems & micro-interactions.",
              icon: "🎨",
            },
            {
              title: "Performance",
              desc: "Lighthouse optimization, image preloading, asset caching, bundle splitting.",
              icon: "⚡",
            },
          ].map((item, i) => (
            <div key={i} className="p-6 rounded-2xl bg-transparent border border-zinc-800/60 hover:border-zinc-700 transition-colors">
              <div className="text-3xl mb-4">{item.icon}</div>
              <h3 className="text-lg font-semibold text-white mb-2">{item.title}</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Skills Overview with Progress Bars */}
      <SkillsOverview />

      {/* Dynamic GitHub Portfolio Projects Section — preview of latest 6 */}
      <GithubProjects username="riadswebdev" maxItems={6} showSearch={false} />

      {/* Education Section */}
      <section id="education" className="py-28 px-6 max-w-7xl mx-auto border-t border-zinc-900">
        <div className="space-y-4 mb-16 text-center max-w-2xl mx-auto">
          <span className="text-xs font-mono uppercase tracking-widest text-blue-400">Academic & Background</span>
          <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">Education & Learning</h2>
          <p className="text-zinc-400 text-sm">
            Strong technical foundation in Computer Science, Interactive Media, and Software Engineering.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <div className="p-8 rounded-3xl bg-transparent border border-zinc-800/80 space-y-4 hover:border-zinc-700 transition-colors">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-blue-400">2020 — 2024</span>
              <span className="px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 text-xs">Degree</span>
            </div>
            <h3 className="text-xl font-bold text-white">B.Sc. in Computer Science & Engineering</h3>
            <p className="text-zinc-400 text-sm font-light leading-relaxed">
              Specialized in Software Engineering, Web Graphics Rendering, Data Structures & Algorithms, and Human-Computer Interaction.
            </p>
          </div>

          <div className="p-8 rounded-3xl bg-transparent border border-zinc-800/80 space-y-4 hover:border-zinc-700 transition-colors">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-indigo-400">2024 — Present</span>
              <span className="px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-xs">Specialization</span>
            </div>
            <h3 className="text-xl font-bold text-white">Advanced WebGL & Motion Engineering</h3>
            <p className="text-zinc-400 text-sm font-light leading-relaxed">
              Specialized training in hardware-accelerated canvas animation loops, 3D graphics rendering, and micro-interaction design systems.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-28 px-6 max-w-7xl mx-auto border-t border-zinc-900">
        <div className="relative rounded-3xl border border-zinc-800 p-8 sm:p-16 overflow-hidden">
          {/* Background Video from Cloudinary (Muted) */}
          <div className="absolute inset-0 w-full h-full pointer-events-none -z-10 overflow-hidden">
            <iframe
              src="https://player.cloudinary.com/embed/?cloud_name=djgg1xzaj&public_id=Use_Image_as_the_primary_ide_3__processed_cw6jxk&autoplay=true&loop=true&muted=true&controls=false"
              className="absolute top-1/2 left-1/2 w-[100%] h-[100%] min-w-[177.77vh] min-h-[56.25vw] -translate-x-1/2 -translate-y-1/2 object-cover border-0 scale-125"
              allow="autoplay; fullscreen"
            />
            {/* Dark overlay for readability */}
            <div className="absolute inset-0 bg-black/75 backdrop-blur-[2px]" />
          </div>

          <div className="max-w-2xl space-y-6 relative z-10">
            <span className="text-xs font-mono uppercase tracking-widest text-blue-400">Get in Touch</span>
            <h2 className="text-3xl sm:text-5xl font-bold text-white tracking-tight">
              Let&apos;s build something extraordinary together.
            </h2>
            <p className="text-zinc-300 text-base font-light leading-relaxed">
              Have a project in mind or interested in collaboration? Reach out and let&apos;s discuss.
            </p>

            <div className="pt-4 flex flex-wrap gap-4">
              <a
                href="/contact"
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-semibold shadow-lg shadow-cyan-500/20 transition-all flex items-center gap-2"
              >
                Send Message
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </a>
              <a
                href="https://github.com"
                target="_blank"
                rel="noreferrer"
                className="px-6 py-3 rounded-xl bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-700/60 text-zinc-200 font-medium transition-colors"
              >
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
