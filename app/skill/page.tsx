import type { Metadata } from "next";
import SkillClient from "./SkillClient";


export const metadata: Metadata = {
  title: "Skills & Technologies",
  description:
    "Technical stack & proficiencies of Md. Riad Shekh — React.js, Next.js, TypeScript, Node.js, Express.js, MongoDB, Tailwind CSS, AI workflows, and developer tools.",
};

export default function SkillPage() {
  return <SkillClient />;
}
