"use client";

import dynamic from "next/dynamic";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const GithubProjects = dynamic(() => import("../components/GithubProjects"), {
  ssr: false,
  loading: () => null,
});

export default function ProjectClient() {
  return (
    <div className="min-h-screen text-zinc-100 pt-16 font-sans selection:bg-blue-500/30 selection:text-blue-400 flex flex-col justify-between">
      <Navbar activeSection="projects" />

      <main data-construction-target="projects-page" className="pt-24 pb-16">
        <div data-construction-target="github-project-gallery"><GithubProjects username="riadswebdev" /></div>
      </main>

      <Footer />
    </div>
  );
}
