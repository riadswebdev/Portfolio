import type { Metadata } from "next";
import ProjectClient from "./ProjectClient";

export const metadata: Metadata = {
  title: "Projects & Work",
  description:
    "Explore open source & portfolio projects of Md. Riad Shekh fetched dynamically from GitHub, complete with tech stacks, banner previews, and parsed README documentation.",
};

export default function ProjectPage() {
  return <ProjectClient />;
}