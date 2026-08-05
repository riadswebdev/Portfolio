"use client";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import GithubProjects from "../components/GithubProjects";

export default function ProjectClient() {
  return (
    <div className="min-h-screen text-zinc-100 font-sans selection:bg-blue-500/30 selection:text-blue-400 flex flex-col justify-between">
      <Navbar activeSection="projects" />

      <main className="pt-24 pb-16">
        <GithubProjects username="riadswebdev" />
      </main>

      <Footer />
    </div>
  );
}
