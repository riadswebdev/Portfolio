"use client";

import React, { memo } from "react";

export interface TargetRect {
  top: number;
  left: number;
  width: number;
  height: number;
  name: string;
}

interface ConstructionGuidesProps {
  targetRect: TargetRect | null;
  approvalBadge?: string;
  isCelebrating?: boolean;
  color?: string;
}

export const ConstructionGuides = memo(function ConstructionGuides({
  targetRect,
  approvalBadge,
  isCelebrating = false,
  color = "#06b6d4",
}: ConstructionGuidesProps) {
  if (!targetRect || targetRect.width === 0 || targetRect.height === 0) {
    return null;
  }

  const { top, left, width, height, name } = targetRect;

  return (
    <div
      className="fixed inset-0 pointer-events-none z-40 transition-opacity duration-300"
      aria-hidden="true"
    >
      {/* ── Active Construction Bounding Box ── */}
      <div
        className="fixed transition-all duration-150 ease-out border border-dashed rounded-xl"
        style={{
          top: `${Math.round(top)}px`,
          left: `${Math.round(left)}px`,
          width: `${Math.round(width)}px`,
          height: `${Math.round(height)}px`,
          borderColor: `${color}66`,
          boxShadow: `0 0 20px -4px ${color}22, inset 0 0 20px -8px ${color}11`,
        }}
      >
        {/* 4 Corner Anchor Handles */}
        <div
          className="absolute -top-1.5 -left-1.5 w-3 h-3 border-t-2 border-l-2"
          style={{ borderColor: color }}
        />
        <div
          className="absolute -top-1.5 -right-1.5 w-3 h-3 border-t-2 border-r-2"
          style={{ borderColor: color }}
        />
        <div
          className="absolute -bottom-1.5 -left-1.5 w-3 h-3 border-b-2 border-l-2"
          style={{ borderColor: color }}
        />
        <div
          className="absolute -bottom-1.5 -right-1.5 w-3 h-3 border-b-2 border-r-2"
          style={{ borderColor: color }}
        />

        {/* Live Blueprint Dimension Badge */}
        <div
          className="absolute -top-6 left-2 px-2 py-0.5 rounded text-[10px] font-mono backdrop-blur-md bg-zinc-950/90 border border-zinc-800 text-zinc-300 flex items-center gap-1.5 shadow-md"
          style={{ borderLeftColor: color, borderLeftWidth: "2px" }}
        >
          <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: color }} />
          <span className="font-semibold text-white">{name}</span>
          <span className="text-zinc-500">•</span>
          <span className="text-cyan-400 font-mono">
            {Math.round(width)} × {Math.round(height)} px
          </span>
        </div>

        {/* Creative Director QA Approval Stamp */}
        {approvalBadge && (
          <div className="absolute -bottom-3.5 right-3 animate-fade-in">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-linear-to-r from-emerald-500/20 to-teal-500/20 border border-emerald-500/40 text-emerald-400 text-xs font-mono font-bold shadow-lg shadow-emerald-500/10 backdrop-blur-md">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>{approvalBadge}</span>
            </div>
          </div>
        )}

        {/* Celebratory Final Wave Ring for Launch */}
        {isCelebrating && (
          <div className="absolute -inset-4 rounded-2xl border-2 border-cyan-400/40 animate-pulse pointer-events-none">
            <div className="absolute inset-0 bg-radial from-cyan-500/10 via-purple-500/5 to-transparent blur-md" />
          </div>
        )}
      </div>
    </div>
  );
});

