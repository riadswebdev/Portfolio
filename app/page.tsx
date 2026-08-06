"use client";

import { useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import FrameScrollAnimation from "./components/FrameScrollAnimation";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import SkillsOverview from "./components/SkillsOverview";
import GithubProjects from "./components/GithubProjects";

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

export default function Home() {
  const [activeSection, setActiveSection] = useState("home");

  return (
    <div className="min-h-screen text-zinc-100 font-sans selection:bg-blue-500/30 selection:text-blue-400">
      {/* Navigation Bar */}
      <Navbar activeSection={activeSection} onSectionChange={setActiveSection} />

      {/* Canvas frame animation — fixed background, driven by page scroll */}
      <FrameScrollAnimation backgroundMode />

      {/* ── Hero Section ─────────────────────────────────────────────────── */}
      <section className="relative pt-36 pb-24 md:pt-48 md:pb-36 px-6 max-w-7xl mx-auto overflow-hidden">
        {/* Ambient glow orb */}
        <div className="absolute top-1/3 left-1/4 w-[700px] h-[700px] bg-gradient-to-tr from-blue-600/10 via-indigo-600/8 to-purple-600/8 rounded-full blur-3xl pointer-events-none -z-10" />
        <div className="absolute top-1/2 right-0 w-[400px] h-[400px] bg-gradient-to-bl from-cyan-600/8 to-transparent rounded-full blur-3xl pointer-events-none -z-10" />

        <div className="grid lg:grid-cols-12 gap-12 items-center">
          {/* Left Column — Text & CTAs */}
          <motion.div
            className="lg:col-span-7 space-y-8"
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
          >
            {/* Status badge */}
            <motion.div variants={fadeInUp} className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-blue-500/8 border border-blue-500/20 text-xs font-mono text-blue-400 backdrop-blur-sm">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-sm shadow-emerald-400/50" />
              <span>Available for Opportunities</span>
              <span className="text-blue-500/50">•</span>
              <span>Full Stack Developer</span>
            </motion.div>

            {/* Headline */}
            <motion.div variants={fadeInUp} className="space-y-3">
              <p className="text-white text-sm sm:text-base font-mono tracking-wider uppercase">
                Hi, I&apos;m
              </p>
              <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white leading-[1.08]">
                Md. Riad{" "}
                <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-400 bg-clip-text text-transparent">
                  Shekh
                </span>
              </h1>
            </motion.div>

            {/* Sub-headline */}
            <motion.p variants={fadeInUp} className="text-base sm:text-lg text-white font-light leading-relaxed max-w-2xl">
              Building modern, responsive web applications with{" "}
              <span className="text-zinc-200 font-medium">React.js, Next.js &amp; TypeScript</span>.
              Full-stack experience with{" "}
              <span className="text-zinc-200 font-medium">Node.js, MongoDB &amp; REST APIs</span>.
              Experienced with AI-driven development workflows.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div variants={fadeInUp} className="flex flex-wrap gap-3 items-center pt-2">
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
            </motion.div>

            {/* Quick Stats */}
            <motion.div variants={fadeInUp} className="pt-8 grid grid-cols-3 gap-6 border-t border-zinc-800/50 max-w-xl">
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
            </motion.div>
          </motion.div>

          {/* Right Column — Engaging Interactive Visual Element */}
          <motion.div
            className="lg:col-span-5 relative flex justify-center"
            initial={{ opacity: 0, scale: 0.9, x: 30 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
          >
            {/* Outer Glow Ring */}
            <div className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-cyan-500/20 via-blue-600/30 to-indigo-500/20 blur-xl opacity-70 animate-pulse pointer-events-none" />

            <div
              className="relative w-full max-w-md p-6 sm:p-7 rounded-3xl border border-zinc-700/60 backdrop-blur-2xl shadow-2xl space-y-6 overflow-hidden group"
              style={{ background: "rgba(6, 10, 18, 0.65)" }}
            >
              {/* Top Bar Tech Pill */}
              <div className="flex items-center justify-between border-b border-zinc-800/80 pb-4">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-red-500/80" />
                  <span className="w-3 h-3 rounded-full bg-yellow-500/80" />
                  <span className="w-3 h-3 rounded-full bg-emerald-500/80" />
                </div>
                <span className="text-[11px] font-mono text-cyan-400 bg-cyan-500/10 px-3 py-1 rounded-full border border-cyan-500/20">
                  Full Stack Engineer
                </span>
              </div>

              {/* Developer Profile Header */}
              <div className="flex items-center gap-4">
                <div className="relative w-16 h-16 rounded-full overflow-hidden border-2 border-cyan-400/40 shrink-0 shadow-lg shadow-cyan-500/20">
                  <Image
                    src="/riad.png"
                    alt="Md. Riad Shekh"
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white tracking-tight">Md. Riad Shekh</h3>
                  <p className="text-xs text-zinc-400 font-mono">Web Application Architect</p>
                  <div className="flex items-center gap-2 mt-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                    <span className="text-[11px] text-emerald-400 font-medium">Active Codebase Session</span>
                  </div>
                </div>
              </div>

              {/* Code Feature Snippet Box */}
              <div className="p-4 rounded-xl bg-zinc-950/80 border border-zinc-800 font-mono text-xs space-y-2 text-zinc-300">
                <div className="flex justify-between text-zinc-500 text-[10px]">
                  <span>Developer.ts</span>
                  <span className="text-cyan-400">99.9% Clean Code</span>
                </div>
                <p><span className="text-purple-400">const</span> <span className="text-blue-400">developer</span> = &#123;</p>
                <p className="pl-4"><span className="text-zinc-400">name:</span> <span className="text-emerald-300">&quot;Md. Riad Shekh&quot;</span>,</p>
                <p className="pl-4"><span className="text-zinc-400">specialty:</span> <span className="text-emerald-300">&quot;Full Stack & UI/UX&quot;</span>,</p>
                <p className="pl-4"><span className="text-zinc-400">technologies:</span> [<span className="text-cyan-300">&quot;Next.js&quot;</span>, <span className="text-cyan-300">&quot;React&quot;</span>, <span className="text-cyan-300">&quot;Node&quot;</span>],</p>
                <p className="pl-4"><span className="text-zinc-400">status:</span> <span className="text-yellow-300">&quot;Ready for Hire&quot;</span></p>
                <p>&#125;;</p>
              </div>

              {/* Interactive Quick Badges */}
              <div className="grid grid-cols-2 gap-3 pt-1">
                <div className="p-3 rounded-xl bg-zinc-900/60 border border-zinc-800 flex items-center gap-3">
                  <span className="text-lg">🚀</span>
                  <div>
                    <p className="text-xs font-bold text-white">Fast Delivery</p>
                    <p className="text-[10px] text-zinc-400">Optimized Performance</p>
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-zinc-900/60 border border-zinc-800 flex items-center gap-3">
                  <span className="text-lg">🛡️</span>
                  <div>
                    <p className="text-xs font-bold text-white">Clean Architecture</p>
                    <p className="text-[10px] text-zinc-400">Maintainable Code</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Key Milestones & Stats Highlights Section ────────────────────── */}
      <section className="py-16 px-6 max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-4 p-6 sm:p-8 rounded-3xl border border-zinc-800/80 bg-zinc-950/50 backdrop-blur-md"
        >
          {[
            { metric: "100%", label: "Responsive Design", desc: "Mobile to 4K Displays" },
            { metric: "22+", label: "Tech Stack Tools", desc: "React, Next.js, Node, MongoDB" },
            { metric: "Full Stack", label: "End-to-End Solutions", desc: "Frontend UI to REST APIs" },
            { metric: "AI-Powered", label: "Modern Workflow", desc: "Rapid & Reliable Building" },
          ].map((item, index) => (
            <div key={index} className="p-4 rounded-2xl bg-zinc-900/40 border border-zinc-800/60 text-center space-y-1 hover:border-cyan-500/30 transition-colors">
              <p className="text-2xl sm:text-3xl font-black bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                {item.metric}
              </p>
              <p className="text-xs sm:text-sm font-bold text-white">{item.label}</p>
              <p className="text-[11px] text-zinc-400">{item.desc}</p>
            </div>
          ))}
        </motion.div>
      </section>

      {/* ── Capabilities Section ──────────────────────────────────────────── */}
      <section id="skills" className="py-28 px-6 max-w-7xl mx-auto border-t border-zinc-900/60">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-2xl mx-auto space-y-4 mb-16"
        >
          <span className="inline-block text-xs font-mono uppercase tracking-[0.2em] text-blue-400 bg-blue-500/8 px-3 py-1 rounded-full border border-blue-500/15">
            Capabilities
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
            Technical Stack &amp; Expertise
          </h2>
          <p className="text-white text-sm leading-relaxed">
            Building complex, responsive applications with a focus on modern web standards and smooth interactions.
          </p>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          variants={staggerContainer}
          className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5"
        >
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
            <motion.div
              key={i}
              variants={fadeInUp}
              className={`relative p-6 rounded-2xl bg-gradient-to-br ${item.accent} border border-zinc-800/60 ${item.border} hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group backdrop-blur-sm overflow-hidden`}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
              <div className="text-3xl mb-5">{item.icon}</div>
              <h3 className="text-base font-semibold text-white mb-2 tracking-tight">{item.title}</h3>
              <p className="text-xs text-white leading-relaxed">{item.desc}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Marquee Skills Banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-16"
        >
          <SkillsOverview />
        </motion.div>
      </section>

      {/* ── Featured Projects Section ────────────────────────────────────────── */}
      <section id="projects" className="py-28 px-6 max-w-7xl mx-auto border-t border-zinc-900/60">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-2xl mx-auto space-y-4 mb-16"
        >
          <span className="inline-block text-xs font-mono uppercase tracking-[0.2em] text-blue-400 bg-blue-500/8 px-3 py-1 rounded-full border border-blue-500/15">
            Portfolio
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
            Featured Projects &amp; Open Source
          </h2>
          <p className="text-white text-sm leading-relaxed">
            A selection of full-stack web applications fetched directly live from GitHub.
          </p>
        </motion.div>

        <GithubProjects username="riadswebdev" maxItems={6} />
      </section>

      {/* ── Workflow / Engineering Approach ──────────────────────────────── */}
      <section className="py-28 px-6 max-w-7xl mx-auto border-t border-zinc-900/60">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5 }}
          className="grid lg:grid-cols-12 gap-12 items-center"
        >
          <div className="lg:col-span-5 space-y-6">
            <span className="inline-block text-xs font-mono uppercase tracking-[0.2em] text-cyan-400 bg-cyan-500/8 px-3 py-1 rounded-full border border-cyan-500/15">
              Engineering Approach
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight leading-tight">
              AI-Driven Development Workflow
            </h2>
            <p className="text-white text-sm leading-relaxed">
              I combine traditional computer science fundamentals with modern AI tooling (Cursor, Claude 3.7, ChatGPT) to build software significantly faster without sacrificing code quality.
            </p>
            <div className="pt-2 flex flex-wrap gap-2">
              {["Cursor AI", "Prompt Engineering", "Copilot", "Context Indexing", "Spec-First Dev"].map((tag) => (
                <span key={tag} className="px-3 py-1 rounded-lg bg-zinc-900 border border-zinc-800 text-xs font-mono text-zinc-300">
                  {tag}
                </span>
              ))}
            </div>
          </div>

          <div className="lg:col-span-7 grid sm:grid-cols-2 gap-4">
            {[
              {
                step: "01",
                title: "Architect & Spec",
                desc: "Defining clear component boundaries, TypeScript interfaces, and API contracts before coding.",
              },
              {
                step: "02",
                title: "AI-Augmented Build",
                desc: "Using LLM reasoning for rapid boilerplate, complex algorithms, and boilerplate-heavy tasks.",
              },
              {
                step: "03",
                title: "Human Verification",
                desc: "Strict code review, testing, edge case handling, and performance audit for robust output.",
              },
              {
                step: "04",
                title: "Ship & Iterate",
                desc: "CI/CD deployment to Vercel/Render, measuring real user feedback and fast iteration.",
              },
            ].map((card, idx) => (
              <motion.div
                key={card.step}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.1 }}
                className="p-6 rounded-2xl bg-zinc-950/60 border border-zinc-800/80 space-y-3 backdrop-blur-sm"
              >
                <span className="text-2xl font-mono font-bold text-blue-400">{card.step}</span>
                <h3 className="text-sm font-bold text-white tracking-tight">{card.title}</h3>
                <p className="text-xs text-white leading-relaxed">{card.desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* ── Contact CTA Section ───────────────────────────────────────────── */}
      <section id="contact" className="py-28 px-6 max-w-7xl mx-auto border-t border-zinc-900/60">
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.5 }}
          className="relative rounded-3xl border border-zinc-800/80 p-10 sm:p-20 overflow-hidden shadow-2xl"
        >
          {/* Background Video */}
          <div className="absolute inset-0 w-full h-full pointer-events-none -z-10 overflow-hidden">
            <video
              src="https://res.cloudinary.com/djgg1xzaj/video/upload/Use_Image_as_the_primary_ide_3__processed_cw6jxk.mp4"
              autoPlay
              loop
              muted
              playsInline
              disablePictureInPicture
              className="absolute top-1/2 left-1/2 w-full h-full min-w-[177.77vh] min-h-[56.25vw] -translate-x-1/2 -translate-y-1/2 object-cover scale-125"
            />
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
            <p className="text-white text-sm sm:text-base leading-relaxed font-light">
              Open to full-time roles, contract work, or technical collaboration. Have a project in mind or want to talk tech?
            </p>
            <div className="pt-2 flex flex-wrap gap-4 items-center">
              <a
                href="/contact"
                className="px-8 py-4 rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-semibold shadow-xl shadow-cyan-500/25 transition-all duration-300 hover:-translate-y-0.5 flex items-center gap-2 text-sm"
              >
                Start a Conversation
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
        </motion.div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
}
