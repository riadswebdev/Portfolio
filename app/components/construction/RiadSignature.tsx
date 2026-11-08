"use client";

import React, { memo } from "react";

export const SIGNATURE_TARGET_OFFSETS: [number, number, string][] = [
  // Letter R (6 agents)
  [10, 32, "Base R"],
  [10, 20, "Stem R"],
  [10, 8, "Top R"],
  [24, 8, "Loop R"],
  [34, 18, "Curve R"],
  [34, 32, "Leg R"],
  // Letter I (4 agents)
  [44, 8, "Top I"],
  [50, 14, "Shaft I"],
  [50, 26, "Column I"],
  [56, 32, "Base I"],
  // Letter A (6 agents)
  [64, 32, "Foot A"],
  [70, 20, "Ascent A"],
  [76, 8, "Apex A"],
  [82, 20, "Descent A"],
  [88, 32, "Base A"],
  [76, 24, "Cross A"],
  // Letter D (4 agents)
  [96, 8, "Top D"],
  [96, 32, "Base D"],
  [124, 20, "Arc D"],
  [108, 32, "Curve D"],
  // Star ✨ (4 agents)
  [138, 8, "Star ↑"],
  [148, 18, "Star →"],
  [138, 28, "Star ↓"],
  [128, 18, "Star ←"],
];

interface RiadSignatureProps {
  progress: number; // 0 to 1
  isVisible: boolean;
}

export const RiadSignature = memo(function RiadSignature({
  progress,
  isVisible,
}: RiadSignatureProps) {
  if (!isVisible && progress === 0) return null;

  const normalizedProgress = Math.min(Math.max(progress, 0), 1);
  // SVG pathLength normalizes each glyph, so the same progress value reveals
  // the complete actual path instead of relying on guessed pixel lengths.
  const letterOffset = 1 - normalizedProgress;
  const starProgress = Math.min(Math.max((normalizedProgress - 0.72) / 0.28, 0), 1);
  const starOffset = 1 - starProgress;

  return (
    <div
      id="riad-signature-card"
      className={`fixed bottom-6 right-6 sm:bottom-8 sm:right-12 z-44 pointer-events-none transition-all duration-500 select-none max-sm:scale-90 origin-bottom-right ${
        isVisible ? "opacity-100 scale-100" : "opacity-0 scale-95"
      }`}
      aria-hidden="true"
    >
      <div className="relative px-5 py-3 rounded-2xl bg-zinc-950/85 border border-cyan-500/35 backdrop-blur-xl shadow-[0_0_35px_rgba(6,182,212,0.25)] flex items-center gap-3">
        {/* Collaborative Signature SVG Wordmark */}
        <svg
          width="160"
          height="40"
          viewBox="0 0 160 40"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="overflow-visible"
        >
          <defs>
            <linearGradient id="riad-grad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#06b6d4" />
              <stop offset="35%" stopColor="#3b82f6" />
              <stop offset="70%" stopColor="#a855f7" />
              <stop offset="100%" stopColor="#ec4899" />
            </linearGradient>
            <filter id="sig-glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="2" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Letter R */}
          <path
            d="M 10 32 V 8 H 24 C 30 8 34 12 34 18 C 34 24 30 27 24 27 H 10 M 22 27 L 34 32"
            stroke="url(#riad-grad)"
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            pathLength={1}
            strokeDasharray="1"
            strokeDashoffset={letterOffset}
            filter="url(#sig-glow)"
          />

          {/* Letter I */}
          <path
            d="M 44 8 H 56 M 50 8 V 32 M 44 32 H 56"
            stroke="url(#riad-grad)"
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            pathLength={1}
            strokeDasharray="1"
            strokeDashoffset={letterOffset}
            filter="url(#sig-glow)"
          />

          {/* Letter A */}
          <path
            d="M 64 32 L 76 8 L 88 32 M 68 24 H 84"
            stroke="url(#riad-grad)"
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            pathLength={1}
            strokeDasharray="1"
            strokeDashoffset={letterOffset}
            filter="url(#sig-glow)"
          />

          {/* Letter D */}
          <path
            d="M 96 32 V 8 H 108 C 118 8 124 13 124 20 C 124 27 118 32 108 32 Z"
            stroke="url(#riad-grad)"
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            pathLength={1}
            strokeDasharray="1"
            strokeDashoffset={letterOffset}
            filter="url(#sig-glow)"
          />

          {/* Star accent is traced after the letter formation begins. */}
          <path
            d="M 138 8 L 140.5 15.5 L 148 18 L 140.5 20.5 L 138 28 L 135.5 20.5 L 128 18 L 135.5 15.5 Z"
            fill="none"
            stroke="#38bdf8"
            strokeWidth="2"
            strokeLinejoin="round"
            pathLength={1}
            strokeDasharray="1"
            strokeDashoffset={starOffset}
            className="animate-pulse"
          />
        </svg>

        {/* Small label */}
        <div className="flex flex-col">
          <span className="text-[10px] font-mono uppercase tracking-wider text-cyan-400 font-bold">
            24 Agents Swarm
          </span>
          <span className="text-[9px] font-mono text-zinc-400">
            {progress >= 0.95 ? "24 Synchronized ✓" : "Coordinated Flight"}
          </span>
        </div>
      </div>
    </div>
  );
});

