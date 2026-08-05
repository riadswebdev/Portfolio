"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";

const navLinks = [
  {
    id: "home",
    label: "Home",
    href: "/",
    icon: (
      <svg className="w-4 h-4 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
  },
  {
    id: "about",
    label: "About",
    href: "/about",
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    ),
  },
  {
    id: "skills",
    label: "Skills",
    href: "/skill",
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
      </svg>
    ),
  },
  {
    id: "projects",
    label: "Projects",
    href: "/project",
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
      </svg>
    ),
  },
  {
    id: "education",
    label: "Education",
    href: "/#education",
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0112 20.055a11.952 11.952 0 01-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
      </svg>
    ),
  },
  {
    id: "contact",
    label: "Contact",
    href: "/contact",
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
  },
];

interface NavbarProps {
  activeSection?: string;
  onSectionChange?: (section: string) => void;
}

export default function Navbar({ activeSection, onSectionChange }: NavbarProps) {
  const [internalActive, setInternalActive] = useState("home");

  const active = activeSection ?? internalActive;
  const setActive = onSectionChange ?? setInternalActive;

  return (
    <>
      {/* Top Header Bar */}
      <header className="fixed top-4 left-0 right-0 z-50 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Logo (Top Left) */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="group-hover:scale-105 transition-transform drop-shadow-[0_0_8px_rgba(99,102,241,0.4)]">
              <Image
                src="/logo.png"
                alt="RS Portfolio Logo"
                width={120}
                height={120}
                className="rounded-xl w-28 sm:w-36 h-auto"
                priority
              />
            </div>
          </Link>

          {/* Desktop Floating Pill Navigation */}
          <nav className="hidden md:flex items-center gap-1 sm:gap-1.5 px-3 py-1.5 rounded-full border border-zinc-800/90 bg-zinc-950/70 backdrop-blur-md shadow-2xl shadow-black/80 text-xs sm:text-sm font-medium text-zinc-400">
            {navLinks.map((link) => (
              <Link
                key={link.id}
                href={link.href}
                onClick={(e) => {
                  setActive(link.id);
                  if (link.href === "/" && window.location.pathname === "/") {
                    e.preventDefault();
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }
                }}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-full transition-all cursor-pointer ${
                  active === link.id
                    ? "bg-blue-600/20 text-blue-400 border border-blue-500/30 font-semibold"
                    : "hover:text-zinc-200 hover:bg-zinc-800/60"
                }`}
              >
                {link.icon}
                <span>{link.label}</span>
              </Link>
            ))}
          </nav>

          {/* Hire Me Button (Top Right on both Mobile & Desktop) */}
          <div className="flex items-center gap-3">
            <Link
              href="/contact"
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold hover:bg-emerald-500/20 transition-all cursor-pointer shadow-lg shadow-emerald-500/10"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Hire RS
            </Link>
          </div>
        </div>
      </header>

      {/* Mobile Fixed Bottom Navigation Bar (Icons Only) */}
      <div className="md:hidden fixed bottom-4 left-4 right-4 z-50">
        <nav className="flex items-center justify-around px-3 py-2.5 rounded-full border bg-zinc-950/70 border-zinc-800/90 backdrop-blur shadow-2xl shadow-black/90">
          {navLinks.map((link) => {
            const isActive = active === link.id;
            return (
              <Link
                key={link.id}
                href={link.href}
                onClick={(e) => {
                  setActive(link.id);
                  if (link.href === "/" && window.location.pathname === "/") {
                    e.preventDefault();
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }
                }}
                aria-label={link.label}
                className={`p-2.5 rounded-full transition-all cursor-pointer relative flex items-center justify-center ${
                  isActive
                    ? "bg-blue-600/25 text-blue-400 border border-blue-500/40 shadow-lg shadow-blue-500/20 scale-110"
                    : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50"
                }`}
              >
                <div className="w-5 h-5 flex items-center justify-center">
                  {link.icon}
                </div>
              </Link>
            );
          })}
        </nav>
      </div>
    </>
  );
}
