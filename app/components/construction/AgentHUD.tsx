"use client";

import React, { memo, useState } from "react";
import { AGENTS } from "./agentConfig";
import { AgentId } from "./types";

interface AgentHUDProps {
  currentPhaseName: string;
  scrollProgress: number;
  agentActions: Record<AgentId, string>;
  isEnabled: boolean;
  onToggleEnabled: () => void;
  isMobile?: boolean;
}

export const AgentHUD = memo(function AgentHUD({
  currentPhaseName,
  scrollProgress,
  agentActions,
  isEnabled,
  onToggleEnabled,
  isMobile = false,
}: AgentHUDProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const pct = Math.round(scrollProgress * 100);

  return (
    <div className="fixed bottom-6 left-6 z-50 select-none font-sans pointer-events-auto">
      {/* ── Expanded Telemetry Drawer ── */}
      {isExpanded && isEnabled && (
        <div className="mb-3 w-80 p-4 rounded-2xl bg-zinc-950/90 border border-zinc-800/80 shadow-2xl backdrop-blur-xl space-y-3 transition-all animate-in fade-in slide-in-from-bottom-2 duration-200">
          <div className="flex items-center justify-between border-b border-zinc-800/70 pb-2.5">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs font-bold text-white tracking-wide">
                AI Construction Telemetry
              </span>
            </div>
            <span className="text-[11px] font-mono text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">
              {pct}% Built
            </span>
          </div>

          <div className="text-[11px] font-mono text-zinc-400">
            Phase:{" "}
            <span className="text-zinc-200 font-semibold">
              {currentPhaseName}
            </span>
          </div>

          {/* Individual Agent Real-Time Task List */}
          <div className="space-y-2 pt-1">
            {(Object.keys(AGENTS) as AgentId[]).map((id) => {
              const agent = AGENTS[id];
              const action = agentActions[id] || "Standby";

              return (
                <div
                  key={id}
                  className="flex items-start gap-2 p-1.5 rounded-lg bg-zinc-900/50 border border-zinc-800/40 text-[11px]"
                >
                  <span className="text-xs shrink-0 mt-0.5">
                    {agent.avatarIcon}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-1">
                      <span
                        className="font-semibold text-xs leading-none"
                        style={{ color: agent.color }}
                      >
                        {agent.name}
                      </span>
                      <span className="text-[9px] font-mono text-zinc-500 uppercase">
                        {agent.initials}
                      </span>
                    </div>
                    <p className="text-[10px] text-zinc-300 font-mono mt-0.5 truncate">
                      {action}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Toggle Control */}
          <div className="pt-2 border-t border-zinc-800/70 flex items-center justify-between text-[11px]">
            <span className="text-zinc-400">Construction Animation</span>
            <button
              onClick={onToggleEnabled}
              className={`px-2.5 py-1 rounded-md font-mono text-[10px] font-semibold transition-colors cursor-pointer ${
                isEnabled
                  ? "bg-cyan-500/20 border border-cyan-500/40 text-cyan-400 hover:bg-cyan-500/30"
                  : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
              }`}
            >
              {isEnabled ? "Active ●" : "Paused ○"}
            </button>
          </div>
        </div>
      )}

      {/* ── Compact Floating Pill ── */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setIsExpanded((prev) => !prev)}
          className="group inline-flex items-center gap-2.5 px-3.5 py-2 rounded-full bg-zinc-950/80 hover:bg-zinc-900/90 border border-zinc-800/80 hover:border-cyan-500/40 shadow-xl backdrop-blur-xl transition-all duration-200 cursor-pointer text-xs"
          title="Click to view AI Agent Construction Status"
        >
          {/* Pulsing Swarm Indicator */}
          <div className="flex -space-x-1 items-center">
            {(Object.keys(AGENTS) as AgentId[]).map((id) => (
              <span
                key={id}
                className="w-2 h-2 rounded-full border border-zinc-950 transition-transform group-hover:scale-125"
                style={{ backgroundColor: AGENTS[id].color }}
              />
            ))}
          </div>

          <span className="font-mono text-zinc-300 text-xs font-medium">
            {isMobile ? "AI Build" : "AI Construction"}
          </span>

          <span className="font-mono text-[11px] text-cyan-400 bg-cyan-500/10 px-1.5 py-0.5 rounded border border-cyan-500/20">
            {pct}%
          </span>

          <svg
            className={`w-3.5 h-3.5 text-zinc-400 transition-transform duration-200 ${
              isExpanded ? "rotate-180" : ""
            }`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 15l7-7 7 7"
            />
          </svg>
        </button>
      </div>
    </div>
  );
});

