"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const BackgroundVideo = dynamic(() => import("../components/BackgroundVideo"), {
  ssr: false,
  loading: () => null,
});

/* ═══════════════════════════════════════════════════════════════
   TYPES & DATA
═══════════════════════════════════════════════════════════════ */
interface Skill {
  name: string;
  icon: string;
  pct?: number;
}
interface Cat {
  id: string;
  label: string;
  short: string;
  desc: string;
  color: string;
  rgb: string;
  skills: Skill[];
}

const CATS: Cat[] = [
  {
    id: "frontend",
    label: "Frontend Development",
    short: "Frontend",
    desc: "Core UI & interactive web technologies",
    color: "#22d3ee",
    rgb: "34,211,238",
    skills: [
      { name: "React.js", icon: "react", pct: 92 },
      { name: "Next.js", icon: "next", pct: 90 },
      { name: "TypeScript", icon: "ts", pct: 85 },
      { name: "JavaScript", icon: "js", pct: 95 },
      { name: "HTML5", icon: "html", pct: 98 },
      { name: "CSS3", icon: "css", pct: 95 },
    ],
  },
  {
    id: "backend",
    label: "Backend & Database",
    short: "Backend",
    desc: "Server architecture, APIs & auth",
    color: "#a78bfa",
    rgb: "167,139,250",
    skills: [
      { name: "Node.js", icon: "node", pct: 88 },
      { name: "Express.js", icon: "express", pct: 88 },
      { name: "MongoDB", icon: "mongo", pct: 85 },
      { name: "REST API", icon: "api", pct: 92 },
      { name: "Stripe", icon: "stripe", pct: 82 },
      { name: "Auth Systems", icon: "auth", pct: 90 },
    ],
  },
  {
    id: "ui",
    label: "UI Libraries & Styling",
    short: "UI / CSS",
    desc: "Design systems, styling & animation",
    color: "#f472b6",
    rgb: "244,114,182",
    skills: [
      { name: "Tailwind CSS", icon: "tailwind", pct: 96 },
      { name: "HeroUI", icon: "heroui", pct: 90 },
      { name: "DaisyUI", icon: "daisy", pct: 88 },
      { name: "Framer Motion", icon: "motion", pct: 82 },
      { name: "Font Awesome", icon: "fontawesome", pct: 90 },
    ],
  },
  {
    id: "ai",
    label: "AI Workflow & Dev Tools",
    short: "AI Tools",
    desc: "AI-assisted coding & deployment",
    color: "#34d399",
    rgb: "52,211,153",
    skills: [
      { name: "ChatGPT/Claude", icon: "ai", pct: 95 },
      { name: "Cursor AI", icon: "cursor", pct: 92 },
      { name: "Git & GitHub", icon: "git", pct: 92 },
      { name: "VS Code", icon: "vscode", pct: 95 },
      { name: "Postman", icon: "api", pct: 88 },
      { name: "Vercel/Render", icon: "vercel", pct: 90 },
    ],
  },
];

/* ═══════════════════════════════════════════════════════════════
   GEOMETRY CONSTANTS
═══════════════════════════════════════════════════════════════ */
const C = 250;
const CTR_SZ = 152;
const SAT_SZ = 90;
const ORBIT = 174;
const CLUSTER_SZ = 500;
const HEX_CLIP =
  "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)";

const SAT_POS = Array.from({ length: 6 }, (_, i) => {
  const a = (i * 60 - 90) * (Math.PI / 180);
  const cx = C + ORBIT * Math.cos(a);
  const cy = C + ORBIT * Math.sin(a);
  return { cx, cy, l: cx - SAT_SZ / 2, t: cy - SAT_SZ / 2 };
});

/* ═══════════════════════════════════════════════════════════════
   HOOKS
═══════════════════════════════════════════════════════════════ */
function useWindowWidth() {
  const [w, setW] = useState(1440);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const h = () => setW(window.innerWidth);
    setW(window.innerWidth);
    window.addEventListener("resize", h);
    return () => window.removeEventListener("resize", h);
  }, []);

  return { width: w, mounted };
}

/* ═══════════════════════════════════════════════════════════════
   SVG TECH ICONS
═══════════════════════════════════════════════════════════════ */
function TechIcon({ id, cls = "w-6 h-6" }: { id: string; cls?: string }) {
  const icons: Record<string, React.ReactNode> = {
    js: (
      <svg
        viewBox="0 0 24 24"
        fill="currentColor"
        className={`${cls} text-yellow-400`}
      >
        <path d="M0 0h24v24H0V0zm22.034 18.276c-.175-1.095-.888-2.015-3.003-2.873-.736-.345-1.554-.585-1.797-1.14-.091-.33-.105-.51-.046-.705.15-.646.915-.84 1.515-.66.39.12.75.42.976.9 1.034-.676 1.034-.676 1.755-1.125-.27-.42-.404-.601-.586-.78-.63-.705-1.469-1.065-2.834-1.034l-.705.089c-.676.165-1.32.525-1.71 1.005-1.14 1.291-.811 3.541.569 4.471 1.365 1.02 3.361 1.244 3.616 2.205.24 1.17-.87 1.545-1.966 1.41-.811-.18-1.26-.586-1.755-1.336l-1.83 1.051c.21.48.45.689.81 1.109 1.74 1.756 6.09 1.666 6.871-1.004.029-.09.24-.705.074-1.65l.046.067zm-8.983-7.245h-2.248c0 1.938-.009 3.864-.009 5.805 0 1.232.063 2.363-.138 2.711-.33.689-1.18.601-1.566.48-.396-.196-.597-.466-.83-.855-.063-.105-.11-.196-.127-.196l-1.825 1.125c.305.63.75 1.172 1.324 1.517.855.51 2.004.675 3.207.405.783-.226 1.458-.691 1.811-1.411.51-.93.402-2.07.397-3.346.012-2.054 0-4.109 0-6.179l.004-.056z" />
      </svg>
    ),
    react: (
      <svg
        viewBox="0 0 24 24"
        fill="currentColor"
        className={`${cls} text-cyan-400`}
      >
        <path d="M14.23 12.004a2.236 2.236 0 0 1-2.235 2.236 2.236 2.236 0 0 1-2.236-2.236 2.236 2.236 0 0 1 2.235-2.236 2.236 2.236 0 0 1 2.236 2.236zm2.648-10.69c-1.346 0-3.107.96-4.888 2.622-1.78-1.653-3.542-2.602-4.887-2.602-.41 0-.783.093-1.106.278-1.375.793-1.683 3.264-.973 6.365C1.98 8.917 0 10.42 0 12.004c0 1.59 1.99 3.097 5.043 4.03-.704 3.113-.39 5.588.988 6.38.32.187.69.275 1.102.275 1.345 0 3.107-.96 4.888-2.624 1.78 1.654 3.542 2.603 4.887 2.603.41 0 .783-.09 1.106-.275 1.374-.792 1.683-3.263.973-6.365C22.02 15.096 24 13.59 24 12.004c0-1.59-1.99-3.097-5.043-4.032.704-3.11.39-5.587-.988-6.38-.318-.184-.688-.277-1.092-.278z" />
      </svg>
    ),
    next: (
      <svg
        viewBox="0 0 24 24"
        fill="currentColor"
        className={`${cls} text-white`}
      >
        <path d="M11.572 0c-.176 0-.31.001-.358.007a19.76 19.76 0 0 1-.364.033C7.443.346 4.25 2.185 2.228 5.012a11.875 11.875 0 0 0-2.119 5.243c-.096.659-.108.854-.108 1.747s.012 1.089.108 1.748c.652 4.506 3.86 8.292 8.209 9.695.779.25 1.6.422 2.534.525.363.04 1.935.04 2.299 0 1.611-.178 2.977-.577 4.323-1.264.207-.106.247-.134.219-.158-.02-.013-.9-1.193-1.955-2.62l-1.919-2.592-2.404-3.558a338.739 338.739 0 0 0-2.422-3.556c-.009-.002-.018 1.579-.023 3.51-.007 3.38-.01 3.515-.052 3.595a.426.426 0 0 1-.206.214c-.075.037-.14.044-.495.044H7.81l-.108-.068a.438.438 0 0 1-.157-.171l-.05-.106.006-4.703.007-4.705.072-.092a.645.645 0 0 1 .174-.143c.096-.047.134-.051.54-.051.478 0 .558.018.682.154.035.038 1.337 1.999 2.895 4.361a10760.433 10760.433 0 0 0 4.735 7.17l1.9 2.879.096-.063a12.317 12.317 0 0 0 2.466-2.163 11.944 11.944 0 0 0 2.824-6.134c.096-.66.108-.854.108-1.748 0-.893-.012-1.088-.108-1.747-.652-4.506-3.859-8.292-8.208-9.695a12.597 12.597 0 0 0-2.499-.523A33.119 33.119 0 0 0 11.573 0z" />
      </svg>
    ),
    ts: (
      <svg
        viewBox="0 0 24 24"
        fill="currentColor"
        className={`${cls} text-blue-400`}
      >
        <path d="M1.125 0C.502 0 0 .502 0 1.125v21.75C0 23.498.502 24 1.125 24h21.75c.623 0 1.125-.502 1.125-1.125V1.125C24 .502 23.498 0 22.875 0zm17.363 9.75c.612 0 1.154.037 1.627.111a6.38 6.38 0 0 1 1.306.34v2.458a3.95 3.95 0 0 0-.643-.361 5.093 5.093 0 0 0-.717-.26 5.453 5.453 0 0 0-1.426-.2c-.3 0-.573.028-.819.086a2.1 2.1 0 0 0-.623.242c-.17.104-.3.229-.393.374a.888.888 0 0 0-.14.49c0 .196.053.373.156.529.104.156.252.304.443.444s.423.276.696.41c.273.135.582.274.926.416.47.197.892.407 1.266.628.374.222.695.473.963.753.268.279.472.598.614.957.142.359.214.776.214 1.253 0 .657-.125 1.21-.373 1.656a3.033 3.033 0 0 1-1.012 1.085 4.38 4.38 0 0 1-1.487.596c-.566.12-1.163.18-1.79.18a9.916 9.916 0 0 1-1.84-.164 5.544 5.544 0 0 1-1.512-.493v-2.63a5.033 5.033 0 0 0 3.237 1.2c.333 0 .624-.03.872-.09.249-.06.456-.144.623-.25.166-.108.29-.234.373-.38a1.023 1.023 0 0 0-.074-1.089 2.12 2.12 0 0 0-.537-.5 5.597 5.597 0 0 0-.807-.444 27.72 27.72 0 0 0-1.007-.436c-.918-.383-1.602-.852-2.053-1.405-.45-.553-.676-1.222-.676-2.005 0-.614.123-1.141.369-1.582.246-.441.58-.804 1.004-1.089a4.494 4.494 0 0 1 1.47-.629 7.536 7.536 0 0 1 1.77-.201zm-15.113.188h9.563v2.166H9.506v9.646H6.789v-9.646H3.375z" />
      </svg>
    ),
    html: (
      <svg
        viewBox="0 0 24 24"
        fill="currentColor"
        className={`${cls} text-orange-400`}
      >
        <path d="M1.5 0h21l-1.91 21.563L11.977 24l-8.564-2.438L1.5 0zm7.031 9.75l-.232-2.718 10.059.003.23-2.622L5.412 4.41l.698 8.01h9.126l-.326 3.426-2.91.804-2.955-.81-.188-2.11H6.248l.33 4.171L12 19.351l5.379-1.443.744-8.157H8.531z" />
      </svg>
    ),
    css: (
      <svg
        viewBox="0 0 24 24"
        fill="currentColor"
        className={`${cls} text-blue-500`}
      >
        <path d="M1.5 0h21l-1.91 21.563L11.977 24l-8.565-2.438L1.5 0zm17.09 4.413L5.41 4.41l.213 2.622 10.125.002-.255 2.716h-6.64l.24 2.573h6.182l-.366 3.523-2.91.804-2.956-.81-.188-2.11h-2.61l.29 3.855L12 19.288l5.373-1.53L18.59 4.414v-.001z" />
      </svg>
    ),
    node: (
      <svg
        viewBox="0 0 24 24"
        fill="currentColor"
        className={`${cls} text-green-400`}
      >
        <path d="M11.998,24c-0.321,0-0.641-0.084-0.922-0.247l-2.936-1.737c-0.438-0.245-0.224-0.332-0.08-0.383c0.585-0.203,0.703-0.25,1.328-0.604c0.065-0.037,0.151-0.023,0.218,0.017l2.256,1.339c0.082,0.045,0.197,0.045,0.272,0l8.795-5.076c0.082-0.047,0.134-0.141,0.134-0.238V6.921c0-0.099-0.053-0.192-0.137-0.242l-8.791-5.072c-0.081-0.047-0.189-0.047-0.271,0L3.075,6.68C2.99,6.729,2.936,6.825,2.936,6.921v10.15c0,0.097,0.054,0.189,0.139,0.235l2.409,1.392c1.307,0.654,2.108-0.116,2.108-0.89V7.787c0-0.142,0.114-0.253,0.256-0.253h1.115c0.139,0,0.255,0.112,0.255,0.253v10.021c0,1.745-0.95,2.745-2.604,2.745c-0.508,0-0.909,0-2.026-0.551L1.677,18.683c-0.57-0.329-0.922-0.945-0.922-1.604V6.921c0-0.659,0.353-1.275,0.922-1.603l8.795-5.082c0.557-0.315,1.296-0.315,1.848,0l8.794,5.082c0.57,0.329,0.924,0.944,0.924,1.603v10.158c0,0.659-0.354,1.275-0.924,1.604l-8.794,5.078C12.643,23.916,12.324,24,11.998,24z" />
      </svg>
    ),
    express: (
      <svg
        viewBox="0 0 24 24"
        fill="currentColor"
        className={`${cls} text-zinc-300`}
      >
        <path d="M24 18.588a1.529 1.529 0 0 1-1.895-.72l-3.45-4.771-.5-.667-4.003 5.444a1.466 1.466 0 0 1-1.802.708l5.158-6.92-4.798-6.251a1.595 1.595 0 0 1 1.9.666l3.576 4.83 3.596-4.81a1.435 1.435 0 0 1 1.788-.668L21.708 7.9l-2.522 3.283a.666.666 0 0 0 0 .994l4.804 6.412z" />
      </svg>
    ),
    mongo: (
      <svg
        viewBox="0 0 24 24"
        fill="currentColor"
        className={`${cls} text-green-500`}
      >
        <path d="M17.193 9.555c-1.264-5.58-4.252-7.414-4.573-8.115-.28-.394-.53-.954-.735-1.44-.036.495-.055.685-.523 1.184-.723.566-4.438 3.682-4.74 10.02-.282 5.912 4.27 9.435 4.888 9.884l.07.05A73.49 73.49 0 0 1 11.91 24h.481c.114-1.032.284-2.056.51-3.07.417-.296.604-.463.85-.693a11.342 11.342 0 0 0 3.639-8.464c.01-.814-.164-1.666-.197-2.218z" />
      </svg>
    ),
    api: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        className={`${cls} text-emerald-400`}
        strokeWidth={2}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M8.25 3v1.5M4.5 8.25H3m18 0h-1.5M4.5 12H3m18 0h-1.5m-15 3.75H3m18 0h-1.5M8.25 19.5V21M12 3v1.5m0 15V21m3.75-18v1.5m0 15V21m-9-1.5h10.5a2.25 2.25 0 0 0 2.25-2.25V6.75a2.25 2.25 0 0 0-2.25-2.25H6.75A2.25 2.25 0 0 0 4.5 6.75v10.5a2.25 2.25 0 0 0 2.25 2.25z"
        />
      </svg>
    ),
    stripe: (
      <svg
        viewBox="0 0 24 24"
        fill="currentColor"
        className={`${cls} text-indigo-400`}
      >
        <path d="M13.976 9.15c-2.172-.806-3.356-1.426-3.356-2.409 0-.831.683-1.305 1.901-1.305 2.227 0 4.515.858 6.09 1.631l.89-5.494C17.76.66 15.12 0 12.186 0 6.643 0 2.76 2.89 2.76 7.64c0 6.467 8.789 6.837 8.789 10.36 0 1.055-.916 1.48-2.217 1.48-2.585 0-5.59-1.127-7.46-2.193l-.963 5.76C3.003 24.168 6.136 25 9.479 25c5.845 0 9.873-2.775 9.873-7.79 0-6.938-8.914-7.23-8.914-10.426z" />
      </svg>
    ),
    auth: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        className={`${cls} text-blue-400`}
        strokeWidth={2}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z"
        />
      </svg>
    ),
    tailwind: (
      <svg
        viewBox="0 0 24 24"
        fill="currentColor"
        className={`${cls} text-sky-400`}
      >
        <path d="M12.001,4.8c-3.2,0-5.2,1.6-6,4.8c1.2-1.6,2.6-2.2,4.2-1.8c0.913,0.228,1.565,0.89,2.288,1.624 C13.666,10.618,15.027,12,18.001,12c3.2,0,5.2-1.6,6-4.8c-1.2,1.6-2.6,2.2-4.2,1.8c-0.913-0.228-1.565-0.89-2.288-1.624 C16.337,6.182,14.976,4.8,12.001,4.8z M6.001,12c-3.2,0-5.2,1.6-6,4.8c1.2-1.6,2.6-2.2,4.2-1.8c0.913,0.228,1.565,0.89,2.288,1.624 c1.177,1.194,2.538,2.576,5.512,2.576c3.2,0,5.2-1.6,6-4.8c-1.2,1.6-2.6,2.2-4.2,1.8c-0.913-0.228-1.565-0.89-2.288-1.624 C10.337,13.382,8.976,12,6.001,12z" />
      </svg>
    ),
    heroui: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        className={`${cls} text-purple-400`}
        strokeWidth={2}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 21a9 9 0 100-18 9 9 0 000 18z"
        />
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v8m-4-4h8" />
      </svg>
    ),
    daisy: (
      <svg
        viewBox="0 0 24 24"
        fill="currentColor"
        className={`${cls} text-yellow-300`}
      >
        <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm0 18a8 8 0 1 1 8-8 8 8 0 0 1-8 8z" />
      </svg>
    ),
    motion: (
      <svg
        viewBox="0 0 24 24"
        fill="currentColor"
        className={`${cls} text-pink-500`}
      >
        <path d="M4 0h16v8H4zM4 8h8v8H4zM4 16h16v8H4z" />
      </svg>
    ),
    fontawesome: (
      <svg
        viewBox="0 0 24 24"
        fill="currentColor"
        className={`${cls} text-blue-400`}
      >
        <path d="M23.004 15.545a1.27 1.27 0 0 1-.958 1.22l-8.608 2.519a2.535 2.535 0 0 1-1.428 0l-8.608-2.52a1.27 1.27 0 0 1-.958-1.218V8.455c0-.547.348-1.036.87-1.22l8.607-3.044a2.534 2.534 0 0 1 1.688 0l8.608 3.044a1.27 1.27 0 0 1 .87 1.22v7.09z" />
      </svg>
    ),
    ai: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        className={`${cls} text-cyan-300`}
        strokeWidth={2}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456z"
        />
      </svg>
    ),
    cursor: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        className={`${cls} text-teal-300`}
        strokeWidth={2}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M15.042 21.672L13.684 16.6m0 0l-2.51 2.225.569-9.47 6.987 6.474-3.327.171z"
        />
      </svg>
    ),
    git: (
      <svg
        viewBox="0 0 24 24"
        fill="currentColor"
        className={`${cls} text-orange-500`}
      >
        <path d="M23.546 10.93L13.067.452a1.55 1.55 0 0 0-2.188 0L8.708 2.627l2.76 2.76a1.838 1.838 0 0 1 2.327 2.341l2.658 2.66a1.838 1.838 0 0 1 1.9 3.039 1.837 1.837 0 0 1-2.6-2.596l-2.48-2.48v6.511a1.838 1.838 0 0 1 .48 3.59 1.838 1.838 0 0 1-2.29-1.769 1.837 1.837 0 0 1 1-1.656V9.801a1.837 1.837 0 0 1-1-1.656 1.838 1.838 0 0 1 .404-1.17L7.024 4.215.452 10.79a1.55 1.55 0 0 0 0 2.187l10.48 10.478a1.55 1.55 0 0 0 2.186 0l10.428-10.427a1.55 1.55 0 0 0 0-2.188" />
      </svg>
    ),
    vscode: (
      <svg
        viewBox="0 0 24 24"
        fill="currentColor"
        className={`${cls} text-blue-400`}
      >
        <path d="M23.15 2.587L18.21.21a1.494 1.494 0 0 0-1.705.29l-9.46 8.63-4.12-3.128a.999.999 0 0 0-1.276.057L.327 7.261A1 1 0 0 0 .326 8.74L3.899 12 .326 15.26a1 1 0 0 0 .001 1.479L1.65 17.94a.999.999 0 0 0 1.276.057l4.12-3.128 9.46 8.63a1.492 1.492 0 0 0 1.704.29l4.942-2.377A1.5 1.5 0 0 0 24 20.06V3.939a1.5 1.5 0 0 0-.85-1.352zm-5.146 14.861L10.826 12l7.178-5.448v10.896z" />
      </svg>
    ),
    vercel: (
      <svg
        viewBox="0 0 24 24"
        fill="currentColor"
        className={`${cls} text-white`}
      >
        <path d="M24 22.525H0l12-21.05 12 21.05z" />
      </svg>
    ),
  };
  return (
    <>
      {icons[id] ?? (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          className={`${cls} text-zinc-300`}
          strokeWidth={2}
        >
          <circle cx="12" cy="12" r="9" />
          <path d="M12 8v4l3 3" />
        </svg>
      )}
    </>
  );
}

const HEX_CLIP_VAL = HEX_CLIP;

function HexShell({
  sz,
  rgb,
  hovered,
  large = false,
  children,
}: {
  sz: number;
  rgb: string;
  hovered: boolean;
  large?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div style={{ width: sz, height: sz, position: "relative", flexShrink: 0 }}>
      <div
        style={{
          position: "absolute",
          inset: "14%",
          borderRadius: "50%",
          background: `rgba(${rgb}, ${
            hovered ?
              large ? 0.65
              : 0.52
            : large ? 0.22
            : 0.13
          })`,
          filter: `blur(${large ? 22 : 14}px)`,
          transition: "background 0.35s",
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          clipPath: HEX_CLIP_VAL,
          background: `rgba(${rgb}, ${hovered ? 0.4 : 0.2})`,
          transition: "background 0.35s",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: large ? 3.5 : 2.5,
            clipPath: HEX_CLIP_VAL,
            background: "rgba(5, 8, 22, 0.93)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}

function Ring({
  pct,
  color,
  r = 10,
}: {
  pct: number;
  color: string;
  r?: number;
}) {
  const circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;
  const sz = (r + 5) * 2;
  return (
    <svg width={sz} height={sz} viewBox={`0 0 ${sz} ${sz}`}>
      <circle
        cx={sz / 2}
        cy={sz / 2}
        r={r}
        fill="none"
        stroke="rgba(255,255,255,0.07)"
        strokeWidth="2"
      />
      <circle
        cx={sz / 2}
        cy={sz / 2}
        r={r}
        fill="none"
        stroke={color}
        strokeWidth="2.5"
        strokeDasharray={`${dash} ${circ}`}
        strokeLinecap="round"
        transform={`rotate(-90 ${sz / 2} ${sz / 2})`}
        style={{ filter: `drop-shadow(0 0 3px ${color}cc)` }}
      />
      <text
        x="50%"
        y="50%"
        textAnchor="middle"
        dominantBaseline="central"
        fill="rgba(255,255,255,0.9)"
        fontSize="7"
        fontFamily="monospace"
        fontWeight="bold"
      >
        {pct}
      </text>
    </svg>
  );
}

function ConnectorLines({
  cat,
  count,
  inView,
}: {
  cat: Cat;
  count: number;
  inView: boolean;
}) {
  return (
    <svg
      width={CLUSTER_SZ}
      height={CLUSTER_SZ}
      style={{
        position: "absolute",
        inset: 0,
        zIndex: 1,
        pointerEvents: "none",
      }}
    >
      <circle
        cx={C}
        cy={C}
        r={ORBIT}
        fill="none"
        stroke={cat.color}
        strokeWidth="0.5"
        strokeOpacity="0.07"
        strokeDasharray="3 9"
      />
      <motion.circle
        cx={C}
        cy={C}
        r={CTR_SZ / 2 + 8}
        fill="none"
        stroke={cat.color}
        strokeWidth="0.8"
        animate={{ r: [CTR_SZ / 2 + 8, CTR_SZ / 2 + 30], opacity: [0.14, 0] }}
        transition={{ duration: 3.0, repeat: Infinity, ease: "easeOut" }}
      />
      {Array.from({ length: Math.min(count, 6) }, (_, i) => {
        const p = SAT_POS[i];
        return (
          <motion.path
            key={i}
            d={`M ${C} ${C} L ${p.cx} ${p.cy}`}
            stroke={cat.color}
            strokeWidth="1"
            fill="none"
            strokeLinecap="round"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={
              inView ?
                { pathLength: 1, opacity: [0, 0.3, 0.18, 0.3] }
              : { pathLength: 0, opacity: 0 }
            }
            transition={{
              pathLength: {
                duration: 0.65,
                delay: 0.3 + i * 0.11,
                ease: "easeOut",
              },
              opacity: {
                duration: 3.5,
                delay: 0.3 + i * 0.11,
                repeat: Infinity,
                ease: "easeInOut",
                times: [0, 0.12, 0.5, 1],
              },
            }}
          />
        );
      })}
    </svg>
  );
}

function CenterHex({ cat, inView }: { cat: Cat; inView: boolean }) {
  const [hov, setHov] = useState(false);
  return (
    <motion.div
      className="absolute"
      style={{ left: C - CTR_SZ / 2, top: C - CTR_SZ / 2, zIndex: 10 }}
      initial={{ opacity: 0, scale: 0.08 }}
      animate={inView ? { opacity: 1, scale: 1 } : {}}
      transition={{
        duration: 0.75,
        type: "spring",
        stiffness: 110,
        damping: 16,
      }}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
    >
      <motion.div
        animate={{ y: [0, -9, 0] }}
        transition={{ duration: 3.6, repeat: Infinity, ease: "easeInOut" }}
      >
        <HexShell sz={CTR_SZ} rgb={cat.rgb} hovered={hov} large>
          <div style={{ textAlign: "center", padding: "0 10px" }}>
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                marginBottom: 7,
              }}
            >
              <div
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: "50%",
                  background: `rgba(${cat.rgb}, 0.12)`,
                  border: `1px solid rgba(${cat.rgb}, 0.3)`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <motion.div
                  animate={{ scale: [1, 1.5, 1], opacity: [1, 0.45, 1] }}
                  transition={{
                    duration: 2.2,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  style={{
                    width: 11,
                    height: 11,
                    borderRadius: "50%",
                    background: cat.color,
                    boxShadow: `0 0 12px ${cat.color}`,
                  }}
                />
              </div>
            </div>
            <p
              style={{
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                color: cat.color,
                lineHeight: 1.2,
              }}
            >
              {cat.short}
            </p>
            <p
              style={{
                fontSize: 8,
                color: "rgba(255,255,255,0.35)",
                marginTop: 4,
                lineHeight: 1.45,
              }}
            >
              {cat.desc}
            </p>
          </div>
        </HexShell>
      </motion.div>
    </motion.div>
  );
}

function SatNode({
  skill,
  cat,
  posIdx,
  delay,
  inView,
}: {
  skill: Skill;
  cat: Cat;
  posIdx: number;
  delay: number;
  inView: boolean;
}) {
  const [hov, setHov] = useState(false);
  const pos = SAT_POS[posIdx % 6];
  return (
    <motion.div
      className="absolute flex flex-col items-center"
      style={{ left: pos.l - 5, top: pos.t, zIndex: 5, width: SAT_SZ + 10 }}
      initial={{ opacity: 0, scale: 0.12 }}
      animate={inView ? { opacity: 1, scale: 1 } : {}}
      transition={{
        duration: 0.5,
        delay,
        type: "spring",
        stiffness: 180,
        damping: 15,
      }}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
    >
      <motion.div
        animate={hov ? { y: -7, scale: 1.12 } : { y: 0, scale: 1 }}
        transition={{ duration: 0.22, ease: "easeOut" }}
        style={{ position: "relative" }}
      >
        <HexShell sz={SAT_SZ} rgb={cat.rgb} hovered={hov}>
          <motion.div
            animate={hov ? { rotate: 14 } : { rotate: 0 }}
            transition={{ duration: 0.22 }}
          >
            <TechIcon id={skill.icon} cls="w-6 h-6" />
          </motion.div>
        </HexShell>
        {skill.pct && (
          <div
            style={{ position: "absolute", bottom: 0, right: 0, zIndex: 15 }}
          >
            <Ring pct={skill.pct} color={cat.color} r={10} />
          </div>
        )}
      </motion.div>
      <div style={{ marginTop: 5, textAlign: "center", width: SAT_SZ + 10 }}>
        <span
          style={{
            fontSize: 9,
            fontFamily: "monospace",
            display: "block",
            lineHeight: 1.3,
            color: hov ? cat.color : "rgba(255,255,255,0.5)",
            transition: "color 0.2s",
          }}
        >
          {skill.name}
        </span>
      </div>
    </motion.div>
  );
}

function MobileHexNode({
  skill,
  cat,
  index,
}: {
  skill: Skill;
  cat: Cat;
  index: number;
}) {
  const [hov, setHov] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true });
  const SZ = 74;
  return (
    <motion.div
      ref={ref}
      className="flex flex-col items-center gap-1.5 cursor-default"
      initial={{ opacity: 0, scale: 0.35 }}
      animate={inView ? { opacity: 1, scale: 1 } : {}}
      transition={{ duration: 0.4, delay: index * 0.065, type: "spring" }}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      onTouchStart={() => setHov(true)}
      onTouchEnd={() => setHov(false)}
    >
      <motion.div
        animate={hov ? { y: -5, scale: 1.1 } : { y: 0, scale: 1 }}
        transition={{ duration: 0.2 }}
        style={{ position: "relative" }}
      >
        <HexShell sz={SZ} rgb={cat.rgb} hovered={hov}>
          <motion.div
            animate={hov ? { rotate: 14 } : { rotate: 0 }}
            transition={{ duration: 0.2 }}
          >
            <TechIcon id={skill.icon} cls="w-5 h-5" />
          </motion.div>
        </HexShell>
        {skill.pct && (
          <div
            style={{ position: "absolute", bottom: 0, right: 0, zIndex: 12 }}
          >
            <Ring pct={skill.pct} color={cat.color} r={9} />
          </div>
        )}
      </motion.div>
      <div style={{ textAlign: "center" }}>
        <span
          className="text-[9px] font-mono block leading-tight max-w-[78px]"
          style={{
            color: hov ? cat.color : "rgba(255,255,255,0.5)",
            transition: "color 0.2s",
          }}
        >
          {skill.name}
        </span>
        {skill.pct && (
          <motion.span
            animate={{ opacity: hov ? 1 : 0 }}
            style={{
              fontSize: 8,
              fontFamily: "monospace",
              fontWeight: 700,
              color: cat.color,
            }}
          >
            {skill.pct}%
          </motion.span>
        )}
      </div>
    </motion.div>
  );
}

function ClusterPanel({ cat, index }: { cat: Cat; index: number }) {
  const outerRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const inView = useInView(outerRef, { once: true, margin: "-60px" });
  const { width: winW, mounted } = useWindowWidth();
  const isDesktop = mounted ? winW >= 1024 : true;
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const update = () => {
      if (innerRef.current)
        setScale(Math.min(1, innerRef.current.clientWidth / CLUSTER_SZ));
    };
    update();
    const ro = new ResizeObserver(update);
    if (innerRef.current) ro.observe(innerRef.current);
    return () => ro.disconnect();
  }, [isDesktop]);

  return (
    <motion.div
      ref={outerRef}
      initial={{ opacity: 0, y: 38 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.65, delay: index * 0.13 }}
      className="relative rounded-3xl overflow-hidden"
      style={{
        background: "rgba(5, 8, 22, 0.2)",
        border: `1px solid rgba(${cat.rgb}, 0.3)`,
        boxShadow: `0 0 70px rgba(${cat.rgb}, 0.05), 0 1px 0 rgba(255,255,255,0.04) inset`,
        backdropFilter: "blur(10px)",
        WebkitBackdropFilter: "blur(22px)",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: -70,
          right: -70,
          width: 220,
          height: 220,
          borderRadius: "50%",
          pointerEvents: "none",
          background: `radial-gradient(circle, rgba(${cat.rgb}, 0.11) 0%, transparent 70%)`,
        }}
      />
      <div className="flex items-center gap-4 px-6 pt-6 pb-4">
        <div
          style={{
            width: 38,
            height: 38,
            borderRadius: 11,
            flexShrink: 0,
            background: `rgba(${cat.rgb}, 0.1)`,
            border: `1px solid rgba(${cat.rgb}, 0.22)`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <motion.div
            animate={{ scale: [1, 1.35, 1], opacity: [1, 0.55, 1] }}
            transition={{
              duration: 2.4,
              repeat: Infinity,
              ease: "easeInOut",
              delay: index * 0.4,
            }}
            style={{
              width: 11,
              height: 11,
              borderRadius: "50%",
              background: cat.color,
              boxShadow: `0 0 10px ${cat.color}`,
            }}
          />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-bold text-white tracking-tight truncate">
            {cat.label}
          </h3>
          <p
            className="text-[11px] mt-0.5 truncate"
            style={{ color: "rgba(255,255,255,0.36)" }}
          >
            {cat.desc}
          </p>
        </div>
        <span
          className="text-[10px] font-mono font-bold px-2.5 py-1 rounded-full shrink-0"
          style={{
            background: `rgba(${cat.rgb}, 0.1)`,
            border: `1px solid rgba(${cat.rgb}, 0.22)`,
            color: cat.color,
          }}
        >
          {cat.skills.length} skills
        </span>
      </div>
      <div
        style={{
          height: 1,
          margin: "0 24px",
          background: `linear-gradient(90deg, transparent, rgba(${cat.rgb}, 0.22), transparent)`,
        }}
      />
      {isDesktop ?
        <div
          ref={innerRef}
          style={{ overflow: "hidden", height: CLUSTER_SZ * scale }}
        >
          <div
            style={{
              position: "relative",
              width: CLUSTER_SZ,
              height: CLUSTER_SZ,
              margin: "0 auto",
              transform: `scale(${scale})`,
              transformOrigin: "top center",
            }}
          >
            <ConnectorLines
              cat={cat}
              count={cat.skills.length}
              inView={inView}
            />
            <CenterHex cat={cat} inView={inView} />
            {cat.skills.map((sk, i) => (
              <SatNode
                key={sk.name}
                skill={sk}
                cat={cat}
                posIdx={i}
                delay={0.35 + i * 0.1}
                inView={inView}
              />
            ))}
          </div>
        </div>
      : <div className="flex flex-wrap justify-center gap-5 px-6 py-8">
          {cat.skills.map((sk, i) => (
            <MobileHexNode key={sk.name} skill={sk} cat={cat} index={i} />
          ))}
        </div>
      }
    </motion.div>
  );
}

function StatsBanner() {
  const STATS = [
    {
      label: "Technologies",
      value: "22+",
      color: "#22d3ee",
      rgb: "34,211,238",
    },
    {
      label: "Frontend Stack",
      value: "6",
      color: "#a78bfa",
      rgb: "167,139,250",
    },
    {
      label: "Backend Stack",
      value: "6",
      color: "#f472b6",
      rgb: "244,114,182",
    },
    {
      label: "AI & Dev Tools",
      value: "5",
      color: "#34d399",
      rgb: "52,211,153",
    },
  ];
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 22 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5 }}
      className="grid grid-cols-2 sm:grid-cols-4 gap-3"
    >
      {STATS.map((s, i) => (
        <motion.div
          key={s.label}
          initial={{ opacity: 0, scale: 0.82 }}
          animate={inView ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 0.45, delay: i * 0.08 }}
          className="relative flex flex-col items-center justify-center py-6 px-3 rounded-2xl overflow-hidden"
          style={{
            background: `rgba(${s.rgb}, 0.1)`,
            border: `1px solid rgba(${s.rgb}, 0.3)`,
            backdropFilter: "blur(10px)",
          }}
        >
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: `radial-gradient(ellipse at 50% 0%, rgba(${s.rgb}, 0.13) 0%, transparent 65%)`,
              pointerEvents: "none",
            }}
          />
          <motion.p
            className="text-3xl font-black tabular-nums relative"
            style={{ color: s.color, textShadow: `0 0 20px ${s.color}60` }}
            animate={{
              textShadow: [
                `0 0 16px ${s.color}40`,
                `0 0 30px ${s.color}90`,
                `0 0 16px ${s.color}40`,
              ],
            }}
            transition={{ duration: 2.8, repeat: Infinity, delay: i * 0.35 }}
          >
            {s.value}
          </motion.p>
          <p
            className="text-[11px] font-mono mt-1.5 text-center relative"
            style={{ color: "rgba(255,255,255,0.42)" }}
          >
            {s.label}
          </p>
        </motion.div>
      ))}
    </motion.div>
  );
}

export default function SkillClient() {
  return (
    <div className="relative min-h-screen font-sans flex flex-col selection:bg-cyan-500/20 selection:text-cyan-300">
      <div
        className="fixed inset-0 -z-20 overflow-hidden"
        style={{ filter: "brightness(0.70) saturate(1.05)" }}
      >
        <BackgroundVideo
          src="https://res.cloudinary.com/djgg1xzaj/video/upload/v1785932605/Scene___Skills_Section_Prof_f3gxh1.mp4"
          poster="/riad.png"
        />
      </div>
      <Navbar activeSection="skills" />
      <main className="relative z-10 pt-32 pb-28 px-6 max-w-6xl mx-auto w-full flex-1 space-y-16">
        <motion.div
          initial={{ opacity: 0, y: 26 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-2xl mx-auto space-y-5"
        >
          <motion.span
            initial={{ opacity: 0, scale: 0.72 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.15, duration: 0.4 }}
            className="inline-block text-[10px] font-bold tracking-[0.26em] uppercase px-4 py-1.5 rounded-full"
            style={{
              color: "#22d3ee",
              background: "rgba(34,211,238,0.08)",
              border: "1px solid rgba(34,211,238,0.2)",
            }}
          >
            Technical Proficiency
          </motion.span>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.1] text-white">
            Skills &amp;{" "}
            <span
              className="bg-clip-text text-transparent"
              style={{
                backgroundImage:
                  "linear-gradient(135deg, #60a5fa 0%, #a78bfa 100%)",
              }}
            >
              Technologies
            </span>
          </h1>
          <p
            className="text-sm sm:text-base font-light leading-relaxed max-w-xl mx-auto"
            style={{ color: "rgba(255,255,255,5)" }}
          >
            Technologies and tools from active projects and full-stack
            engineering experience — visualised as an interactive developer
            skill map.
          </p>
        </motion.div>
        <StatsBanner />
        <div className="grid lg:grid-cols-2 gap-6">
          {CATS.map((cat, i) => (
            <ClusterPanel key={cat.id} cat={cat} index={i} />
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
}
