import type { Metadata } from "next";
import AboutClient from "./AboutClient";

export const metadata: Metadata = {
  title: "About Me",
  description:
    "Learn more about Md. Riad Shekh — Full Stack Web Developer. Discover background, engineering philosophy, and expertise.",
};

export default function AboutPage() {
  return <AboutClient />;
}
