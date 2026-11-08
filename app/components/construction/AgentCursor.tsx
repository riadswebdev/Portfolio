"use client";

import React, { memo } from "react";
import { AgentProfile } from "./agentPool";

interface AgentCursorProps {
  agent: AgentProfile;
  x: number;
  y: number;
  actionText?: string;
  isClicking?: boolean;
  isVisible?: boolean;
  isWorking?: boolean;
  opacity?: number;
}

export const AgentCursor = memo(function AgentCursor({
  agent,
  x,
  y,
  actionText = "",
  isClicking = false,
  isVisible = true,
  isWorking = true,
  opacity,
}: AgentCursorProps) {
  if (!isVisible && opacity === undefined) return null;

  // Derive short role code: UI, DEV, MOTION, QA, LAYOUT, TYPE, A11Y, COPY
  let shortRole = "DEV";
  if (agent.category === "ui-design") shortRole = "UI";
  else if (agent.category === "frontend") shortRole = "DEV";
  else if (agent.category === "layout") shortRole = "LAYOUT";
  else if (agent.category === "typography") shortRole = "TYPE";
  else if (agent.category === "motion") shortRole = "MOTION";
  else if (agent.category === "content") shortRole = "COPY";
  else if (agent.category === "a11y-perf") shortRole = "A11Y";
  else if (agent.category === "qa-review") shortRole = "QA";

  // Collision & boundary detection
  const isNearRightEdge = typeof window !== "undefined" && x > window.innerWidth - 130;
  const isNearBottomEdge = typeof window !== "undefined" && y > window.innerHeight - 50;

  const currentOpacity = opacity !== undefined ? opacity : isVisible ? 1 : 0;
  if (currentOpacity <= 0) return null;

  return (
    <div
      className="fixed top-0 left-0 pointer-events-none z-45 transition-transform duration-75 ease-out will-change-transform select-none"
      style={{
        transform: `translate3d(${Math.round(x)}px, ${Math.round(y)}px, 0)`,
        opacity: currentOpacity,
      }}
      aria-hidden="true"
    >
      {/* Click ripple animation */}
      {isClicking && (
        <div
          className="absolute -top-3 -left-3 w-6 h-6 rounded-full pointer-events-none animate-ping"
          style={{
            backgroundColor: agent.glowColor,
            animationDuration: "0.7s",
          }}
        />
      )}

      {/* SVG Designer Cursor Pointer */}
      <div
        className="relative transition-transform duration-100 ease-out origin-top-left"
        style={{
          transform: isClicking ? "scale(0.85) rotate(-3deg)" : "scale(1)",
          filter: `drop-shadow(0 2px 6px ${agent.glowColor})`,
        }}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <path
            d="M3 2L19.5 13.5L12 15L9 22L3 2Z"
            fill={agent.color}
            stroke="#ffffff"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
          <path d="M5 5L15 12L10.5 13L8.5 18L5 5Z" fill="rgba(255, 255, 255, 0.3)" />
        </svg>

        {isClicking && (
          <span
            className="absolute top-0 left-0 w-2 h-2 rounded-full"
            style={{
              backgroundColor: "#ffffff",
              boxShadow: `0 0 6px 2px ${agent.color}`,
            }}
          />
        )}
      </div>

      {/* Ultra-compact, non-cluttering role tag */}
      <div
        className={`absolute flex items-center gap-1 transition-opacity duration-200 ${
          isNearRightEdge ? "-left-14" : "left-4"
        } ${isNearBottomEdge ? "-top-5" : "top-3"}`}
      >
        {/* Short Role Pill: UI, DEV, MOTION, QA etc */}
        <div
          className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded backdrop-blur-md border text-[9px] font-mono font-bold text-white shadow-md leading-none"
          style={{
            backgroundColor: agent.badgeBg,
            borderColor: agent.borderColor,
            boxShadow: `0 2px 8px -1px ${agent.glowColor}`,
          }}
        >
          <span>{agent.avatarIcon}</span>
          <span style={{ color: agent.color }}>{shortRole}</span>
        </div>

        {/* Action text: only rendered while actively working, short & compact */}
        {isWorking && actionText && (
          <div
            className="px-1.5 py-0.5 rounded bg-zinc-950/90 border border-zinc-800 text-[9px] font-mono text-zinc-300 shadow leading-none whitespace-nowrap"
            style={{ borderLeftColor: agent.color, borderLeftWidth: "2px" }}
          >
            {actionText}
          </div>
        )}
      </div>
    </div>
  );
});
