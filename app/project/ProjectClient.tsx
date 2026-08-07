"use client";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import GithubProjects from "../components/GithubProjects";
import FrameScrollAnimation from "../components/FrameScrollAnimation";

export default function ProjectClient() {
  return (
    <div className="min-h-screen text-zinc-100 pt-16 font-sans selection:bg-blue-500/30 selection:text-blue-400 flex flex-col justify-between">
      {/* Scroll-driven frame animation — fixed full-screen canvas background */}
      <FrameScrollAnimation
        backgroundMode
        totalFrames={116}
        folderPath="/projectScrollAnimation"
        filePrefix="ezgif-frame-"
        fileExtension="png"
      />

      <Navbar activeSection="projects" />

      <main className="relative z-10 pt-32 pb-24 px-4 sm:px-6 max-w-7xl mx-auto space-y-12">
        {/* Top Hero Banner */}
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <div className="inline-block px-4 py-1.5 rounded-full border border-cyan-500/30 text-xs font-semibold text-cyan-400 tracking-wider uppercase backdrop-blur-md shadow-lg shadow-cyan-500/10" style={{ background: "rgba(4, 6, 12, 0.65)" }}>
            Portfolio &amp; Codebases
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight">
            Featured <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">Projects</span>
          </h1>
          <p className="text-zinc-300 text-sm sm:text-base font-light leading-relaxed">
            Real-world full-stack web applications, open-source repositories, and technical case studies.
          </p>
        </div>

        <GithubProjects username="riadswebdev" />
      </main>

      <Footer />
    </div>
  );
}
