"use client";

import React, { memo } from "react";
import { AgentProfile } from "./agentPool";

export type CursorShape = "arrow";

interface AgentCursorProps {
  agent: AgentProfile;
  x: number;
  y: number;
  actionText?: string;
  isClicking?: boolean;
  isVisible?: boolean;
  isWorking?: boolean;
  showLabel?: boolean;
  roleLabel?: string;
  cursorSize?: number;
  opacity?: number;
  cursorShape?: CursorShape;
}

export const AgentCursor = memo(function AgentCursor({
  agent,
  x,
  y,
  actionText = "",
  isClicking = false,
  isVisible = true,
  isWorking = true,
  showLabel = false,
  roleLabel,
  cursorSize = 14,
  opacity,
  cursorShape = "arrow",
}: AgentCursorProps) {
  if (!isVisible && opacity === undefined) return null;

  const currentOpacity = opacity !== undefined ? opacity : isVisible ? 1 : 0;
  if (currentOpacity <= 0) return null;

  void actionText;
  void isWorking;
  void showLabel;
  void roleLabel;
  void cursorShape;

  return (
    <div
      className="fixed top-0 left-0 pointer-events-none z-45 transition-[opacity,transform] duration-300 ease-out will-change-transform select-none"
      style={{
        transform: `translate3d(${Math.round(x)}px, ${Math.round(y)}px, 0)`,
        width: cursorSize,
        height: cursorSize,
        opacity: currentOpacity,
      }}
      aria-hidden="true"
    >
      <div
        className="relative transition-transform duration-100 ease-out origin-top-left"
        style={{
          transform: isClicking ? "scale(0.85) rotate(-3deg)" : "scale(1)",
        }}
      >
        <svg width={cursorSize} height={cursorSize} viewBox="0 0 24 24" fill="none">
          <path
            d="M3 2L19.5 13.5L12 15L9 22L3 2Z"
            fill={agent.color}
            stroke="#ffffff"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
          <path d="M5 5L15 12L10.5 13L8.5 18L5 5Z" fill="rgba(255,255,255,0.3)" />
        </svg>
      </div>
    </div>
  );
});
