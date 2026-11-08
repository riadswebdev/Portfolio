"use client";

import React, { memo } from "react";
import { AGENT_POOL } from "./agentPool";
import {
  getSignatureStrokeLength,
  SIGNATURE_STROKES,
} from "./signaturePaths";

interface RiadSignatureProps {
  progress: number;
  isVisible: boolean;
  left: number;
  top: number;
  width: number;
  opacity?: number;
}

export const RiadSignature = memo(function RiadSignature({
  progress,
  isVisible,
  left,
  top,
  width,
  opacity = 1,
}: RiadSignatureProps) {
  if (!isVisible || progress <= 0) return null;

  const normalizedProgress = Math.min(Math.max(progress, 0), 1);
  const height = (width * 90) / 320;

  return (
    <svg
      className="fixed pointer-events-none z-44 overflow-visible"
      style={{
        left,
        top,
        width,
        height,
        opacity,
        overflow: "visible",
      }}
      width={width}
      height={height}
      viewBox="0 0 320 90"
      preserveAspectRatio="xMinYMin meet"
      aria-hidden="true"
    >
      <defs>
        <filter id="riad-agent-trail-glow" x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur stdDeviation="1.6" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {SIGNATURE_STROKES.map((stroke, index) => {
        const length = getSignatureStrokeLength(index);
        const points = stroke.points.map((point) => point.x + "," + point.y).join(" ");
        const agent = AGENT_POOL[index];

        return (
          <polyline
            key={stroke.label}
            points={points}
            fill="none"
            stroke={agent ? agent.color : "#22d3ee"}
            strokeWidth="2.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray={length}
            strokeDashoffset={(1 - normalizedProgress) * length}
            filter="url(#riad-agent-trail-glow)"
          />
        );
      })}
    </svg>
  );
});
