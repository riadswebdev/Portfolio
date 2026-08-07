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

      <main className="pt-24 pb-16">
        <GithubProjects username="riadswebdev" />
      </main>

      <Footer />
    </div>
  );
}
