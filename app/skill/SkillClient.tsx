"use client";

import { useEffect, useRef, useState, ReactNode } from "react";
import { motion } from "framer-motion";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

/* ─── Skill Data ───────────────────────────────────────────── */
const categories = [
  {
    id: "frontend",
    label: "Frontend Development",
    desc: "Core UI & interactive web technologies",
    accent: "from-cyan-400 to-blue-500",
    accentText: "text-cyan-400",
    accentBg: "bg-cyan-500/10",
    border: "border-cyan-500/20 hover:border-cyan-500/50",
    glow: "rgba(34,211,238,0.12)",
    glowHover: "rgba(34,211,238,0.28)",
    headerGrad: "from-cyan-500/15 via-blue-500/8 to-transparent",
    badgeColor: "bg-cyan-500/20 text-cyan-300 border-cyan-500/35",
    skills: [
      { name: "React.js",          pct: 92, icon: "react" },
      { name: "Next.js",           pct: 90, icon: "next"  },
      { name: "TypeScript",        pct: 85, icon: "ts"    },
      { name: "JavaScript (ES6+)", pct: 95, icon: "js"    },
      { name: "HTML5",             pct: 98, icon: "html"  },
      { name: "CSS3",              pct: 95, icon: "css"   },
    ],
  },
  {
    id: "backend",
    label: "Backend & Database",
    desc: "Server architecture, APIs & authentication",
    accent: "from-violet-400 to-purple-600",
    accentText: "text-violet-400",
    accentBg: "bg-violet-500/10",
    border: "border-violet-500/20 hover:border-violet-500/50",
    glow: "rgba(167,139,250,0.12)",
    glowHover: "rgba(167,139,250,0.28)",
    headerGrad: "from-violet-500/15 via-purple-500/8 to-transparent",
    badgeColor: "bg-violet-500/20 text-violet-300 border-violet-500/35",
    skills: [
      { name: "Node.js",                  pct: 88, icon: "node"    },
      { name: "Express.js",               pct: 88, icon: "express" },
      { name: "MongoDB",                  pct: 85, icon: "mongo"   },
      { name: "REST API Design",          pct: 92, icon: "api"     },
      { name: "Stripe Payment",           pct: 82, icon: "stripe"  },
      { name: "Better Auth / Google Auth",pct: 90, icon: "auth"    },
    ],
  },
  {
    id: "ui_libraries",
    label: "UI Libraries & Styling",
    desc: "Design systems, styling tools & animation",
    accent: "from-pink-400 to-rose-500",
    accentText: "text-pink-400",
    accentBg: "bg-pink-500/10",
    border: "border-pink-500/20 hover:border-pink-500/50",
    glow: "rgba(244,114,182,0.12)",
    glowHover: "rgba(244,114,182,0.28)",
    headerGrad: "from-pink-500/15 via-rose-500/8 to-transparent",
    badgeColor: "bg-pink-500/20 text-pink-300 border-pink-500/35",
    skills: [
      { name: "Tailwind CSS",   pct: 96, icon: "tailwind"   },
      { name: "HeroUI",         pct: 90, icon: "heroui"     },
      { name: "DaisyUI",        pct: 88, icon: "daisy"      },
      { name: "Framer Motion",  pct: 82, icon: "motion"     },
      { name: "Font Awesome",   pct: 90, icon: "fontawesome"},
    ],
  },
  {
    id: "ai_tools",
    label: "AI Workflows & Dev Tools",
    desc: "AI-assisted coding, version control & deployment",
    accent: "from-emerald-400 to-teal-500",
    accentText: "text-emerald-400",
    accentBg: "bg-emerald-500/10",
    border: "border-emerald-500/20 hover:border-emerald-500/50",
    glow: "rgba(52,211,153,0.12)",
    glowHover: "rgba(52,211,153,0.28)",
    headerGrad: "from-emerald-500/15 via-teal-500/8 to-transparent",
    badgeColor: "bg-emerald-500/20 text-emerald-300 border-emerald-500/35",
    skills: [
      { name: "ChatGPT / Claude",           pct: 95, icon: "ai"     },
      { name: "Cursor AI / GitHub Copilot", pct: 92, icon: "cursor" },
      { name: "Git & GitHub",               pct: 92, icon: "git"    },
      { name: "VS Code & Postman",          pct: 95, icon: "vscode" },
      { name: "Vercel & Render",            pct: 90, icon: "vercel" },
    ],
  },
];

/* ─── Inline SVG Icons ───────────────────────────────────── */
function Icon({ id }: { id: string }) {
  const cls = "w-5 h-5";
  const icons: Record<string, ReactNode> = {
    js: (
      <svg viewBox="0 0 24 24" fill="currentColor" className={`${cls} text-yellow-400`}>
        <path d="M0 0h24v24H0V0zm22.034 18.276c-.175-1.095-.888-2.015-3.003-2.873-.736-.345-1.554-.585-1.797-1.14-.091-.33-.105-.51-.046-.705.15-.646.915-.84 1.515-.66.39.12.75.42.976.9 1.034-.676 1.034-.676 1.755-1.125-.27-.42-.404-.601-.586-.78-.63-.705-1.469-1.065-2.834-1.034l-.705.089c-.676.165-1.32.525-1.71 1.005-1.14 1.291-.811 3.541.569 4.471 1.365 1.02 3.361 1.244 3.616 2.205.24 1.17-.87 1.545-1.966 1.41-.811-.18-1.26-.586-1.755-1.336l-1.83 1.051c.21.48.45.689.81 1.109 1.74 1.756 6.09 1.666 6.871-1.004.029-.09.24-.705.074-1.65l.046.067zm-8.983-7.245h-2.248c0 1.938-.009 3.864-.009 5.805 0 1.232.063 2.363-.138 2.711-.33.689-1.18.601-1.566.48-.396-.196-.597-.466-.83-.855-.063-.105-.11-.196-.127-.196l-1.825 1.125c.305.63.75 1.172 1.324 1.517.855.51 2.004.675 3.207.405.783-.226 1.458-.691 1.811-1.411.51-.93.402-2.07.397-3.346.012-2.054 0-4.109 0-6.179l.004-.056z"/>
      </svg>
    ),
    react: (
      <svg viewBox="0 0 24 24" fill="currentColor" className={`${cls} text-cyan-400`}>
        <path d="M14.23 12.004a2.236 2.236 0 0 1-2.235 2.236 2.236 2.236 0 0 1-2.236-2.236 2.236 2.236 0 0 1 2.235-2.236 2.236 2.236 0 0 1 2.236 2.236zm2.648-10.69c-1.346 0-3.107.96-4.888 2.622-1.78-1.653-3.542-2.602-4.887-2.602-.41 0-.783.093-1.106.278-1.375.793-1.683 3.264-.973 6.365C1.98 8.917 0 10.42 0 12.004c0 1.59 1.99 3.097 5.043 4.03-.704 3.113-.39 5.588.988 6.38.32.187.69.275 1.102.275 1.345 0 3.107-.96 4.888-2.624 1.78 1.654 3.542 2.603 4.887 2.603.41 0 .783-.09 1.106-.275 1.374-.792 1.683-3.263.973-6.365C22.02 15.096 24 13.59 24 12.004c0-1.59-1.99-3.097-5.043-4.032.704-3.11.39-5.587-.988-6.38-.318-.184-.688-.277-1.092-.278z"/>
      </svg>
    ),
    next: (
      <svg viewBox="0 0 24 24" fill="currentColor" className={`${cls} text-white`}>
        <path d="M11.572 0c-.176 0-.31.001-.358.007a19.76 19.76 0 0 1-.364.033C7.443.346 4.25 2.185 2.228 5.012a11.875 11.875 0 0 0-2.119 5.243c-.096.659-.108.854-.108 1.747s.012 1.089.108 1.748c.652 4.506 3.86 8.292 8.209 9.695.779.25 1.6.422 2.534.525.363.04 1.935.04 2.299 0 1.611-.178 2.977-.577 4.323-1.264.207-.106.247-.134.219-.158-.02-.013-.9-1.193-1.955-2.62l-1.919-2.592-2.404-3.558a338.739 338.739 0 0 0-2.422-3.556c-.009-.002-.018 1.579-.023 3.51-.007 3.38-.01 3.515-.052 3.595a.426.426 0 0 1-.206.214c-.075.037-.14.044-.495.044H7.81l-.108-.068a.438.438 0 0 1-.157-.171l-.05-.106.006-4.703.007-4.705.072-.092a.645.645 0 0 1 .174-.143c.096-.047.134-.051.54-.051.478 0 .558.018.682.154.035.038 1.337 1.999 2.895 4.361a10760.433 10760.433 0 0 0 4.735 7.17l1.9 2.879.096-.063a12.317 12.317 0 0 0 2.466-2.163 11.944 11.944 0 0 0 2.824-6.134c.096-.66.108-.854.108-1.748 0-.893-.012-1.088-.108-1.747-.652-4.506-3.859-8.292-8.208-9.695a12.597 12.597 0 0 0-2.499-.523A33.119 33.119 0 0 0 11.573 0z"/>
      </svg>
    ),
    tailwind: (
      <svg viewBox="0 0 24 24" fill="currentColor" className={`${cls} text-sky-400`}>
        <path d="M12.001,4.8c-3.2,0-5.2,1.6-6,4.8c1.2-1.6,2.6-2.2,4.2-1.8c0.913,0.228,1.565,0.89,2.288,1.624 C13.666,10.618,15.027,12,18.001,12c3.2,0,5.2-1.6,6-4.8c-1.2,1.6-2.6,2.2-4.2,1.8c-0.913-0.228-1.565-0.89-2.288-1.624 C16.337,6.182,14.976,4.8,12.001,4.8z M6.001,12c-3.2,0-5.2,1.6-6,4.8c1.2-1.6,2.6-2.2,4.2-1.8c0.913,0.228,1.565,0.89,2.288,1.624 c1.177,1.194,2.538,2.576,5.512,2.576c3.2,0,5.2-1.6,6-4.8c-1.2,1.6-2.6,2.2-4.2,1.8c-0.913-0.228-1.565-0.89-2.288-1.624 C10.337,13.382,8.976,12,6.001,12z"/>
      </svg>
    ),
    css: (
      <svg viewBox="0 0 24 24" fill="currentColor" className={`${cls} text-blue-500`}>
        <path d="M1.5 0h21l-1.91 21.563L11.977 24l-8.565-2.438L1.5 0zm17.09 4.413L5.41 4.41l.213 2.622 10.125.002-.255 2.716h-6.64l.24 2.573h6.182l-.366 3.523-2.91.804-2.956-.81-.188-2.11h-2.61l.29 3.855L12 19.288l5.373-1.53L18.59 4.414v-.001z"/>
      </svg>
    ),
    html: (
      <svg viewBox="0 0 24 24" fill="currentColor" className={`${cls} text-orange-500`}>
        <path d="M1.5 0h21l-1.91 21.563L11.977 24l-8.564-2.438L1.5 0zm7.031 9.75l-.232-2.718 10.059.003.23-2.622L5.412 4.41l.698 8.01h9.126l-.326 3.426-2.91.804-2.955-.81-.188-2.11H6.248l.33 4.171L12 19.351l5.379-1.443.744-8.157H8.531z"/>
      </svg>
    ),
    mongo: (
      <svg viewBox="0 0 24 24" fill="currentColor" className={`${cls} text-green-500`}>
        <path d="M17.193 9.555c-1.264-5.58-4.252-7.414-4.573-8.115-.28-.394-.53-.954-.735-1.44-.036.495-.055.685-.523 1.184-.723.566-4.438 3.682-4.74 10.02-.282 5.912 4.27 9.435 4.888 9.884l.07.05A73.49 73.49 0 0 1 11.91 24h.481c.114-1.032.284-2.056.51-3.07.417-.296.604-.463.85-.693a11.342 11.342 0 0 0 3.639-8.464c.01-.814-.164-1.666-.197-2.218zm-5.336 8.195s0-8.291.275-8.29.213 0 .49 10.695.49 10.695-.381-.045-.765-1.76-.765-2.405z"/>
      </svg>
    ),
    auth: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className={`${cls} text-blue-400`} strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z"/>
      </svg>
    ),
    node: (
      <svg viewBox="0 0 24 24" fill="currentColor" className={`${cls} text-green-400`}>
        <path d="M11.998,24c-0.321,0-0.641-0.084-0.922-0.247l-2.936-1.737c-0.438-0.245-0.224-0.332-0.08-0.383c0.585-0.203,0.703-0.25,1.328-0.604c0.065-0.037,0.151-0.023,0.218,0.017l2.256,1.339c0.082,0.045,0.197,0.045,0.272,0l8.795-5.076c0.082-0.047,0.134-0.141,0.134-0.238V6.921c0-0.099-0.053-0.192-0.137-0.242l-8.791-5.072c-0.081-0.047-0.189-0.047-0.271,0L3.075,6.68C2.99,6.729,2.936,6.825,2.936,6.921v10.15c0,0.097,0.054,0.189,0.139,0.235l2.409,1.392c1.307,0.654,2.108-0.116,2.108-0.89V7.787c0-0.142,0.114-0.253,0.256-0.253h1.115c0.139,0,0.255,0.112,0.255,0.253v10.021c0,1.745-0.95,2.745-2.604,2.745c-0.508,0-0.909,0-2.026-0.551L1.677,18.683c-0.57-0.329-0.922-0.945-0.922-1.604V6.921c0-0.659,0.353-1.275,0.922-1.603l8.795-5.082c0.557-0.315,1.296-0.315,1.848,0l8.794,5.082c0.57,0.329,0.924,0.944,0.924,1.603v10.158c0,0.659-0.354,1.275-0.924,1.604l-8.794,5.078C12.643,23.916,12.324,24,11.998,24z"/>
      </svg>
    ),
    express: (
      <svg viewBox="0 0 24 24" fill="currentColor" className={`${cls} text-zinc-300`}>
        <path d="M24 18.588a1.529 1.529 0 0 1-1.895-.72l-3.45-4.771-.5-.667-4.003 5.444a1.466 1.466 0 0 1-1.802.708l5.158-6.92-4.798-6.251a1.595 1.595 0 0 1 1.9.666l3.576 4.83 3.596-4.81a1.435 1.435 0 0 1 1.788-.668L21.708 7.9l-2.522 3.283a.666.666 0 0 0 0 .994l4.804 6.412z"/>
      </svg>
    ),
    git: (
      <svg viewBox="0 0 24 24" fill="currentColor" className={`${cls} text-orange-500`}>
        <path d="M23.546 10.93L13.067.452a1.55 1.55 0 0 0-2.188 0L8.708 2.627l2.76 2.76a1.838 1.838 0 0 1 2.327 2.341l2.658 2.66a1.838 1.838 0 0 1 1.9 3.039 1.837 1.837 0 0 1-2.6-2.596l-2.48-2.48v6.511a1.838 1.838 0 0 1 .48 3.59 1.838 1.838 0 0 1-2.29-1.769 1.837 1.837 0 0 1 1-1.656V9.801a1.837 1.837 0 0 1-1-1.656 1.838 1.838 0 0 1 .404-1.17L7.024 4.215.452 10.79a1.55 1.55 0 0 0 0 2.187l10.48 10.478a1.55 1.55 0 0 0 2.186 0l10.428-10.427a1.55 1.55 0 0 0 0-2.188"/>
      </svg>
    ),
    vscode: (
      <svg viewBox="0 0 24 24" fill="currentColor" className={`${cls} text-blue-400`}>
        <path d="M23.15 2.587L18.21.21a1.494 1.494 0 0 0-1.705.29l-9.46 8.63-4.12-3.128a.999.999 0 0 0-1.276.057L.327 7.261A1 1 0 0 0 .326 8.74L3.899 12 .326 15.26a1 1 0 0 0 .001 1.479L1.65 17.94a.999.999 0 0 0 1.276.057l4.12-3.128 9.46 8.63a1.492 1.492 0 0 0 1.704.29l4.942-2.377A1.5 1.5 0 0 0 24 20.06V3.939a1.5 1.5 0 0 0-.85-1.352zm-5.146 14.861L10.826 12l7.178-5.448v10.896z"/>
      </svg>
    ),
    vercel: (
      <svg viewBox="0 0 24 24" fill="currentColor" className={`${cls} text-white`}>
        <path d="M24 22.525H0l12-21.05 12 21.05z"/>
      </svg>
    ),
    ts: (
      <svg viewBox="0 0 24 24" fill="currentColor" className={`${cls} text-blue-400`}>
        <path d="M1.125 0C.502 0 0 .502 0 1.125v21.75C0 23.498.502 24 1.125 24h21.75c.623 0 1.125-.502 1.125-1.125V1.125C24 .502 23.498 0 22.875 0zm17.363 9.75c.612 0 1.154.037 1.627.111a6.38 6.38 0 0 1 1.306.34v2.458a3.95 3.95 0 0 0-.643-.361 5.093 5.093 0 0 0-.717-.26 5.453 5.453 0 0 0-1.426-.2c-.3 0-.573.028-.819.086a2.1 2.1 0 0 0-.623.242c-.17.104-.3.229-.393.374a.888.888 0 0 0-.14.49c0 .196.053.373.156.529.104.156.252.304.443.444s.423.276.696.41c.273.135.582.274.926.416.47.197.892.407 1.266.628.374.222.695.473.963.753.268.279.472.598.614.957.142.359.214.776.214 1.253 0 .657-.125 1.21-.373 1.656a3.033 3.033 0 0 1-1.012 1.085 4.38 4.38 0 0 1-1.487.596c-.566.12-1.163.18-1.79.18a9.916 9.916 0 0 1-1.84-.164 5.544 5.544 0 0 1-1.512-.493v-2.63a5.033 5.033 0 0 0 3.237 1.2c.333 0 .624-.03.872-.09.249-.06.456-.144.623-.25.166-.108.29-.234.373-.38a1.023 1.023 0 0 0-.074-1.089 2.12 2.12 0 0 0-.537-.5 5.597 5.597 0 0 0-.807-.444 27.72 27.72 0 0 0-1.007-.436c-.918-.383-1.602-.852-2.053-1.405-.45-.553-.676-1.222-.676-2.005 0-.614.123-1.141.369-1.582.246-.441.58-.804 1.004-1.089a4.494 4.494 0 0 1 1.47-.629 7.536 7.536 0 0 1 1.77-.201zm-15.113.188h9.563v2.166H9.506v9.646H6.789v-9.646H3.375z"/>
      </svg>
    ),
    api: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className={`${cls} text-emerald-400`} strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 3v1.5M4.5 8.25H3m18 0h-1.5M4.5 12H3m18 0h-1.5m-15 3.75H3m18 0h-1.5M8.25 19.5V21M12 3v1.5m0 15V21m3.75-18v1.5m0 15V21m-9-1.5h10.5a2.25 2.25 0 0 0 2.25-2.25V6.75a2.25 2.25 0 0 0-2.25-2.25H6.75A2.25 2.25 0 0 0 4.5 6.75v10.5a2.25 2.25 0 0 0 2.25 2.25z"/>
      </svg>
    ),
    stripe: (
      <svg viewBox="0 0 24 24" fill="currentColor" className={`${cls} text-indigo-400`}>
        <path d="M13.976 9.15c-2.172-.806-3.356-1.426-3.356-2.409 0-.831.683-1.305 1.901-1.305 2.227 0 4.515.858 6.09 1.631l.89-5.494C17.76.66 15.12 0 12.186 0 6.643 0 2.76 2.89 2.76 7.64c0 6.467 8.789 6.837 8.789 10.36 0 1.055-.916 1.48-2.217 1.48-2.585 0-5.59-1.127-7.46-2.193l-.963 5.76C3.003 24.168 6.136 25 9.479 25c5.845 0 9.873-2.775 9.873-7.79 0-6.938-8.914-7.23-8.914-10.426l.006-.002c0-.46.337-.81.988-.81.656 0 1.674.208 2.544.578l.001 2.6z"/>
      </svg>
    ),
    heroui: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className={`${cls} text-purple-400`} strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9 9 0 100-18 9 9 0 000 18z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v8m-4-4h8" />
      </svg>
    ),
    daisy: (
      <svg viewBox="0 0 24 24" fill="currentColor" className={`${cls} text-yellow-300`}>
        <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm0 18a8 8 0 1 1 8-8 8 8 0 0 1-8 8z"/>
      </svg>
    ),
    motion: (
      <svg viewBox="0 0 24 24" fill="currentColor" className={`${cls} text-pink-500`}>
        <path d="M4 0h16v8H4zM4 8h8v8H4zM4 16h16v8H4z"/>
      </svg>
    ),
    fontawesome: (
      <svg viewBox="0 0 24 24" fill="currentColor" className={`${cls} text-blue-400`}>
        <path d="M23.004 15.545a1.27 1.27 0 0 1-.958 1.22l-8.608 2.519a2.535 2.535 0 0 1-1.428 0l-8.608-2.52a1.27 1.27 0 0 1-.958-1.218V8.455c0-.547.348-1.036.87-1.22l8.607-3.044a2.534 2.534 0 0 1 1.688 0l8.608 3.044a1.27 1.27 0 0 1 .87 1.22v7.09z"/>
      </svg>
    ),
    ai: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className={`${cls} text-cyan-300`} strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456z"/>
      </svg>
    ),
    cursor: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className={`${cls} text-teal-300`} strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.042 21.672L13.684 16.6m0 0l-2.51 2.225.569-9.47 6.987 6.474-3.327.171z" />
      </svg>
    ),
  };
  return icons[id] ?? (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className={`${cls} text-zinc-400`} strokeWidth={2}>
      <circle cx="12" cy="12" r="9"/><path d="M12 8v4l3 3"/>
    </svg>
  );
}

/* ─── Skill Row with Animated Progress Bar ────────────────── */
function SkillRow({
  skill,
  accent,
  index,
  isLast,
}: {
  skill: { name: string; pct: number; icon: string };
  accent: string;
  index: number;
  isLast: boolean;
}) {
  const [currentPct, setCurrentPct] = useState(0);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    let timer: NodeJS.Timeout;
    let animFrame: number;

    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          timer = setTimeout(() => {
            const duration = 1100;
            const start = performance.now();
            const animate = (now: number) => {
              const elapsed = now - start;
              const ratio = Math.min(elapsed / duration, 1);
              const easeOut = 1 - Math.pow(1 - ratio, 3);
              setCurrentPct(Math.round(easeOut * skill.pct));
              if (ratio < 1) animFrame = requestAnimationFrame(animate);
            };
            animFrame = requestAnimationFrame(animate);
          }, index * 60);
        } else {
          clearTimeout(timer);
          cancelAnimationFrame(animFrame);
          setCurrentPct(0);
        }
      },
      { threshold: 0.2 }
    );

    obs.observe(el);
    return () => {
      obs.disconnect();
      clearTimeout(timer);
      cancelAnimationFrame(animFrame);
    };
  }, [skill.pct, index]);

  return (
    <div ref={ref} className={`py-3.5 ${!isLast ? "border-b border-white/[0.05]" : ""} group/row`}>
      <div className="flex items-center justify-between mb-2.5">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/5 group-hover/row:border-white/10 flex items-center justify-center shrink-0 transition-colors duration-200">
            <Icon id={skill.icon} />
          </div>
          <span className="text-sm font-medium text-zinc-300 group-hover/row:text-white transition-colors duration-200">
            {skill.name}
          </span>
        </div>
        <span className="text-xs font-bold text-zinc-400 tabular-nums group-hover/row:text-zinc-200 transition-colors">
          {currentPct}%
        </span>
      </div>
      {/* Progress track */}
      <div className="h-[3px] rounded-full bg-white/[0.06] overflow-hidden">
        <div
          className={`h-full rounded-full bg-gradient-to-r ${accent} shadow-sm`}
          style={{
            width: `${currentPct}%`,
            transition: "width 0.05s linear",
            boxShadow: currentPct > 0 ? `0 0 8px rgba(255,255,255,0.15)` : "none",
          }}
        />
      </div>
    </div>
  );
}

/* ─── Category Card ──────────────────────────────────────── */
function CategoryCard({ cat }: { cat: typeof categories[0] }) {
  return (
    <div
      className={`group relative rounded-2xl border ${cat.border} backdrop-blur-md overflow-hidden flex flex-col transition-all duration-400 hover:-translate-y-1 hover:shadow-2xl`}
      style={{
        background: "rgba(4, 6, 12, 0.52)",
        boxShadow: `0 0 30px ${cat.glow}`,
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLElement).style.boxShadow = `0 0 55px ${cat.glowHover}, 0 24px 64px rgba(0,0,0,0.5)`;
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.boxShadow = `0 0 30px ${cat.glow}`;
      }}
    >
      {/* Gradient header band */}
      <div className={`px-6 pt-6 pb-5 bg-gradient-to-br ${cat.headerGrad}`}>
        <span className={`inline-block text-[10px] font-bold tracking-[0.22em] uppercase px-2.5 py-1 rounded-full border ${cat.badgeColor} mb-3`}>
          {cat.label}
        </span>
        <p className="text-xs text-zinc-300 font-light leading-relaxed">{cat.desc}</p>
      </div>

      {/* Skill rows */}
      <div className="px-6 pb-6 flex-1">
        {cat.skills.map((skill, i) => (
          <SkillRow
            key={skill.name}
            skill={skill}
            accent={cat.accent}
            index={i}
            isLast={i === cat.skills.length - 1}
          />
        ))}
      </div>

      {/* Subtle corner glow on hover */}
      <div className="absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
        style={{ background: cat.glow.replace("0.12", "0.30") }} />
    </div>
  );
}

/* ─── Summary Stats Bar ──────────────────────────────────── */
function StatsBanner() {
  const stats = [
    { label: "Technologies",  value: "22+", color: "text-cyan-400"    },
    { label: "Frontend Stack",value: "6",   color: "text-violet-400"  },
    { label: "Backend Stack", value: "6",   color: "text-pink-400"    },
    { label: "AI & Dev Tools",value: "5",   color: "text-emerald-400" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="grid grid-cols-2 sm:grid-cols-4 gap-4"
    >
      {stats.map((s) => (
        <div
          key={s.label}
          className="flex flex-col items-center justify-center py-5 px-4 rounded-2xl border border-white/[0.10] hover:border-white/[0.20] backdrop-blur-md transition-all duration-300 hover:-translate-y-0.5"
          style={{ background: "rgba(4, 6, 12, 0.50)" }}
        >
          <p className={`text-3xl font-black ${s.color} tracking-tight`}>{s.value}</p>
          <p className="text-[11px] text-zinc-100 font-mono mt-1 tracking-wide">{s.label}</p>
        </div>
      ))}
    </motion.div>
  );
}

/* ─── Client View ────────────────────────────────────────── */
export default function SkillClient() {
  return (
    <div className="relative min-h-screen font-sans selection:bg-cyan-500/30 selection:text-cyan-400 flex flex-col justify-between overflow-hidden">
      {/* Background Video — brightness filter matches the cinematic grading of Contact & Project pages */}
      <div
        className="fixed inset-0 w-full h-full pointer-events-none -z-20 overflow-hidden"
        style={{ filter: "brightness(0.70) saturate(1.05)" }}
      >
        <video
          src="https://res.cloudinary.com/djgg1xzaj/video/upload/v1785932605/Scene___Skills_Section_Prof_f3gxh1.mp4"
          autoPlay
          loop
          muted
          playsInline
          disablePictureInPicture
          className="absolute top-1/2 left-1/2 w-[100vw] h-[100vh] min-w-[177.77vh] min-h-[56.25vw] -translate-x-1/2 -translate-y-1/2 object-cover"
        />
      </div>

      <Navbar activeSection="skills" />

      <main className="relative z-10 pt-32 pb-28 px-6 max-w-5xl mx-auto w-full space-y-14">
        {/* ── Hero Header ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-2xl mx-auto space-y-5"
        >
          <span className="inline-block text-[10px] font-bold tracking-[0.25em] uppercase text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 px-3.5 py-1.5 rounded-full">
            Technical Proficiency
          </span>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight text-white">
            Skills &amp;{" "}
            <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-pink-400 bg-clip-text text-transparent">
              Technologies
            </span>
          </h1>
          <p className="text-zinc-200 text-sm sm:text-base font-light leading-relaxed max-w-xl mx-auto">
            Technologies and development tools derived from my active projects and full-stack engineering experience.
          </p>
        </motion.div>

        {/* ── Stats Banner ── */}
        <StatsBanner />

        {/* ── 2 × 2 Skill Grid ── */}
        <div className="grid md:grid-cols-2 gap-5">
          {categories.map((cat, i) => (
            <motion.div
              key={cat.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
            >
              <CategoryCard cat={cat} />
            </motion.div>
          ))}
        </div>
      </main>

      <Footer />
    </div>
  );
}

