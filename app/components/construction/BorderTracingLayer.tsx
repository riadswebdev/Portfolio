"use client";

import React, { memo } from "react";
import { getElementPerimeter } from "./geometry";

export interface ActiveBorderTracing {
  id: string;
  left: number;
  top: number;
  width: number;
  height: number;
  borderRadius: number;
  isHexagon: boolean;
  progress: number; // 0 to 1
  color: string;
  glowColor: string;
}

interface BorderTracingLayerProps {
  activeBorders: ActiveBorderTracing[];
}

export function getElementPathD(
  w: number,
  h: number,
  r: number,
  isHexagon: boolean
): string {
  if (isHexagon) {
    return `M ${w * 0.5} 0 L ${w} ${h * 0.25} L ${w} ${h * 0.75} L ${w * 0.5} ${h} L 0 ${h * 0.75} L 0 ${h * 0.25} Z`;
  }

  const radius = Math.min(r, Math.min(w, h) / 2);
  if (radius <= 0) {
    return `M 0 0 H ${w} V ${h} H 0 Z`;
  }

  return `M ${radius} 0 H ${w - radius} A ${radius} ${radius} 0 0 1 ${w} ${radius} V ${h - radius} A ${radius} ${radius} 0 0 1 ${w - radius} ${h} H ${radius} A ${radius} ${radius} 0 0 1 0 ${h - radius} V ${radius} A ${radius} ${radius} 0 0 1 ${radius} 0 Z`;
}

export const BorderTracingLayer = memo(function BorderTracingLayer({
  activeBorders,
}: BorderTracingLayerProps) {
  if (activeBorders.length === 0) return null;

  return (
    <svg
      className="fixed inset-0 w-full h-full pointer-events-none z-43 overflow-visible"
      aria-hidden="true"
    >
      <defs>
        {activeBorders.map((b) => (
          <filter key={`glow-${b.id}`} id={`glow-${b.id}`} x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        ))}
      </defs>

      {activeBorders.map((b) => {
        const pathD = getElementPathD(b.width, b.height, b.borderRadius, b.isHexagon);

        const perimeter = getElementPerimeter(
          b.width,
          b.height,
          b.borderRadius,
          b.isHexagon,
        );
        const progress = Math.min(Math.max(b.progress, 0), 1);
        const offset = (1 - progress) * perimeter;
        const isComplete = progress >= 0.999;

        return (
          <g
            key={b.id}
            transform={`translate(${b.left}, ${b.top})`}
            style={{
              opacity: isComplete ? 0 : 1,
              transition: "opacity 200ms ease-out",
            }}
          >
            {/* Background Blueprint Trace (faint dashed path) */}
            <path
              d={pathD}
              fill="none"
              stroke="rgba(255, 255, 255, 0.08)"
              strokeWidth="1.5"
              strokeDasharray="4 4"
            />

            {/* Glowing Active Border Stroke Drawn by Agent */}
            <path
              d={pathD}
              fill="none"
              stroke={b.color}
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeDasharray={perimeter}
              strokeDashoffset={offset}
              filter={`url(#glow-${b.id})`}
            />
          </g>
        );
      })}
    </svg>
  );
});

