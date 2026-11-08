"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import { usePathname } from "next/navigation";
import { AGENT_POOL, AgentProfile } from "./agentPool";
import { AgentCursor } from "./AgentCursor";
import { BorderTracingLayer, ActiveBorderTracing } from "./BorderTracingLayer";
import { RiadSignature, SIGNATURE_TARGET_OFFSETS } from "./RiadSignature";

interface ManagedNode {
  el: HTMLElement;
  type: "heading" | "text" | "card" | "button" | "image" | "input";
  initialTop: number;
  progress: number;
  borderRadius: number;
  isHexagon: boolean;
  assignedAgentIndex: number;
  isInitialViewport: boolean;
  isSettled: boolean;
}

interface ActiveCursorState {
  agent: AgentProfile;
  x: number;
  y: number;
  actionText: string;
  isClicking: boolean;
  isWorking: boolean;
  opacity?: number;
}

type SwarmPhase = "idle" | "flying" | "forming" | "locked" | "dispersing";

export default function ConstructionEngine() {
  const pathname = usePathname();
  const [activeCursors, setActiveCursors] = useState<ActiveCursorState[]>([]);
  const [activeBorders, setActiveBorders] = useState<ActiveBorderTracing[]>([]);
  const [overallBuiltPct, setOverallBuiltPct] = useState(0);
  const [activeAgentCount, setActiveAgentCount] = useState(0);

  // Idle signature state
  const [signatureVisible, setSignatureVisible] = useState(false);
  const [signatureProgress, setSignatureProgress] = useState(0);

  const [isMounted, setIsMounted] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  const nodesRef = useRef<ManagedNode[]>([]);
  const initialLoadDoneRef = useRef(false);
  const initialLoadStartTimeRef = useRef<number | null>(null);
  const lastScrollTimeRef = useRef(Date.now());
  const lastScrollPosRef = useRef(0);
  const isScrollingRef = useRef(false);
  const isViewportSettledRef = useRef(false);
  const scrollSettleTimeoutRef = useRef<number | null>(null);
  const signatureTimeoutRef = useRef<number | null>(null);
  const rafRef = useRef<number | null>(null);
  const isReducedMotionRef = useRef(false);

  // Drone swarm state refs
  const swarmPhaseRef = useRef<SwarmPhase>("idle");
  const swarmStartTimeRef = useRef<number | null>(null);
  const dispersalStartTimeRef = useRef<number | null>(null);

  // Measure element geometry and register all constructible nodes
  const registerElements = useCallback(() => {
    if (typeof document === "undefined") return;

    const selector = [
      "nav",
      "h1",
      "h2",
      "h3",
      "section p",
      "main p",
      "a[href*='/contact']",
      "a[href*='#projects']",
      "a[download]",
      "button[type='submit']",
      "form input",
      "form textarea",
      "[data-construction-target]",
      "[data-construct='true']",
      ".card",
      "[class*='rounded-2xl']",
      "[class*='rounded-3xl']",
      "[class*='rounded-xl']",
      "[class*='border-zinc']",
      "[style*='polygon']",
    ].join(", ");

    const raw = Array.from(document.querySelectorAll(selector)) as HTMLElement[];
    const vh = window.innerHeight;
    const scrollY = window.scrollY;

    const filtered = raw.filter((el) => {
      if (
        el.closest("#construction-hud") ||
        el.closest("#riad-signature-card") ||
        el.closest(".z-45") ||
        el.closest(".splash-screen") ||
        el.tagName.toLowerCase() === "svg" ||
        el.tagName.toLowerCase() === "path" ||
        (el.tagName.toLowerCase() === "a" && el.closest("nav")) ||
        (el.tagName.toLowerCase() === "button" && el.closest("nav"))
      ) {
        return false;
      }
      const rect = el.getBoundingClientRect();
      return rect.width > 24 && rect.height > 12;
    });

    const managed: ManagedNode[] = filtered.map((el, idx) => {
      const rect = el.getBoundingClientRect();
      const absTop = rect.top + scrollY;
      const tag = el.tagName.toLowerCase();
      const style = window.getComputedStyle(el);

      // Detect shape properties
      const isHex =
        style.clipPath.includes("polygon") ||
        (el.getAttribute("style") || "").includes("polygon") ||
        el.className.includes("hex");

      // Extract border radius
      let br = 0;
      const rawBr = style.borderRadius;
      if (rawBr) {
        const parsed = parseFloat(rawBr);
        if (!isNaN(parsed)) br = parsed;
      }

      let type: ManagedNode["type"] = "card";
      if (tag === "h1" || tag === "h2" || tag === "h3") {
        type = "heading";
      } else if (tag === "p" || tag === "span") {
        type = "text";
      } else if (tag === "button" || tag === "a") {
        type = "button";
      } else if (tag === "input" || tag === "textarea") {
        type = "input";
      } else if (tag === "img" || el.querySelector("img")) {
        type = "image";
      }

      el.setAttribute("data-construct-node", "true");
      el.setAttribute("data-construct-type", type);

      const inInitialViewport = rect.top < vh && rect.bottom > 0;
      const initialP = isReducedMotionRef.current ? 1 : 0;

      el.setAttribute(
        "data-construct-state",
        initialP >= 1 ? "constructed" : "unconstructed"
      );
      el.style.setProperty("--construct-p", String(initialP));

      return {
        el,
        type,
        initialTop: absTop,
        progress: initialP,
        borderRadius: br,
        isHexagon: isHex,
        assignedAgentIndex: idx % AGENT_POOL.length,
        isInitialViewport: inInitialViewport,
        isSettled: false,
      };
    });

    managed.sort((a, b) => a.initialTop - b.initialTop);
    nodesRef.current = managed;
  }, []);

  // Viewport settlement on scroll stop (debounce 650ms)
  const settleVisibleViewport = useCallback(() => {
    const vh = window.innerHeight;
    const managed = nodesRef.current;
    isViewportSettledRef.current = true;

    for (let i = 0; i < managed.length; i++) {
      const item = managed[i];
      const rect = item.el.getBoundingClientRect();

      // If visible or partially visible inside viewport
      if (rect.bottom > 0 && rect.top < vh) {
        item.progress = 1.0;
        item.isSettled = true;
        item.el.setAttribute("data-construct-state", "constructed");
        item.el.style.setProperty("--construct-p", "1");
      }
    }

    setActiveBorders([]);
  }, []);

  // Update construction progress, animated border tracing, and adaptive agent scheduling
  const updateConstruction = useCallback(() => {
    if (typeof window === "undefined" || isReducedMotionRef.current) return;

    const scrollY = window.scrollY;
    const vh = window.innerHeight;
    const vw = window.innerWidth;
    const viewportBottom = scrollY + vh;
    const now = performance.now();

    const managed = nodesRef.current;
    if (managed.length === 0) return;

    // Document bottom calculation & page scroll progress
    const docEl = document.documentElement;
    const body = document.body;
    const scrollHeight = Math.max(docEl.scrollHeight, body.scrollHeight);
    const clientHeight = window.innerHeight || docEl.clientHeight;
    const maxScroll = Math.max(scrollHeight - clientHeight, 0);
    const isAtBottom = maxScroll > 0 && scrollY >= maxScroll - 4;

    let computedPageProgress = 0;
    if (maxScroll <= 0 || isAtBottom) {
      computedPageProgress = 100;
    } else {
      computedPageProgress = Math.min(
        Math.max(Math.round((scrollY / maxScroll) * 100), 0),
        99
      );
    }

    // Check splash screen
    const splashActive = document.querySelector(".splash-screen:not(.splash-screen--hide)");
    let initialLoadProgress = 1;
    if (splashActive) {
      initialLoadStartTimeRef.current = null;
      initialLoadProgress = 0;
    } else if (!initialLoadDoneRef.current) {
      if (initialLoadStartTimeRef.current === null) {
        initialLoadStartTimeRef.current = now;
      }
      const elapsed = now - initialLoadStartTimeRef.current;
      const INITIAL_DURATION = 2400; // 2.4s viewport build
      initialLoadProgress = Math.min(Math.max(elapsed / INITIAL_DURATION, 0), 1);
      if (initialLoadProgress >= 1) {
        initialLoadDoneRef.current = true;
      }
    }

    // Update telemetry HUD
    if (!initialLoadDoneRef.current && scrollY === 0) {
      setOverallBuiltPct(Math.round(initialLoadProgress * 100));
    } else {
      setOverallBuiltPct(computedPageProgress);
    }

    // Identify active workload in visible viewport
    const activeTasks: {
      node: ManagedNode;
      rect: DOMRect;
      p: number;
    }[] = [];

    for (let i = 0; i < managed.length; i++) {
      const item = managed[i];
      const rect = item.el.getBoundingClientRect();
      const elTop = rect.top + scrollY;

      let p = 0;

      if (isAtBottom) {
        // At document bottom: every single component is 100% complete
        p = 1.0;
        item.isSettled = true;
      } else if (item.isInitialViewport && !initialLoadDoneRef.current) {
        // Initial viewport staggered top to bottom over 2.4s
        const rankOffset = Math.min(Math.max(item.initialTop / vh, 0), 0.85);
        p = Math.min(Math.max((initialLoadProgress - rankOffset * 0.4) / 0.6, 0), 1);
        if (initialLoadProgress >= 1) {
          p = 1.0;
          item.isSettled = true;
        }
      } else if (item.isInitialViewport && initialLoadDoneRef.current && scrollY < 20) {
        // Initial viewport elements STAY complete when user hasn't scrolled away
        p = 1.0;
      } else if (item.isSettled && rect.bottom > 0 && rect.top < vh && !isScrollingRef.current) {
        // Settled elements inside visible viewport remain 100% constructed
        p = 1.0;
      } else {
        // Scroll-driven calculation with bottom-edge completion guarantee
        const distFromBottom = viewportBottom - elTop;
        const entryThreshold = vh * 0.65;
        p = Math.min(Math.max(distFromBottom / entryThreshold, 0), 1);

        // Viewport bottom completion: if element's top is comfortably inside the viewport, complete it
        if (rect.top >= 0 && rect.top < vh - 40 && p > 0.8) {
          p = 1.0;
        }
      }

      item.progress = p;

      if (p >= 0.98) {
        item.el.setAttribute("data-construct-state", "constructed");
        item.el.style.setProperty("--construct-p", "1");
      } else if (p > 0.02) {
        item.el.setAttribute("data-construct-state", "constructing");
        item.el.style.setProperty("--construct-p", p.toFixed(3));

        // Only track in active tasks if visible in viewport
        if (rect.top >= -80 && rect.bottom <= vh + 80) {
          activeTasks.push({ node: item, rect, p });
        }
      } else {
        item.el.setAttribute("data-construct-state", "unconstructed");
        item.el.style.setProperty("--construct-p", "0");
      }
    }

    // ── ADAPTIVE AGENT QUOTA ──
    // Simple section: 1-2 agents
    // Normal section: 2-4 agents
    // Complex section: 4-6 agents max
    const workload = activeTasks.length;
    let agentQuota = 0;
    if (workload > 0) {
      if (workload <= 2) agentQuota = Math.min(2, workload);
      else if (workload <= 5) agentQuota = Math.min(4, workload);
      else agentQuota = Math.min(6, workload);
    }

    // ── DRONE SWARM MODE (ALL 24 AGENTS) ──
    if (swarmPhaseRef.current !== "idle" && swarmStartTimeRef.current !== null) {
      const swarmElapsed = now - swarmStartTimeRef.current;
      const cardRight = vw < 640 ? 16 : 48;
      const cardBottom = vw < 640 ? 16 : 32;
      const cardWidth = 290;
      const cardHeight = 64;
      const svgOriginX = Math.max(12, vw - cardRight - cardWidth + 20);
      const svgOriginY = Math.max(12, vh - cardBottom - cardHeight + 12);

      const swarmCursors: ActiveCursorState[] = [];

      for (let i = 0; i < AGENT_POOL.length; i++) {
        const agent = AGENT_POOL[i];
        const [targetRelX, targetRelY, anchorLabel] =
          SIGNATURE_TARGET_OFFSETS[i] || [10 + i * 5, 20, "Agent"];
        const targetX = svgOriginX + targetRelX;
        const targetY = svgOriginY + targetRelY;

        const startX = ((i * 143.7) % (vw - 140)) + 70;
        const startY = ((i * 97.3) % (vh - 140)) + 70;

        let curX = targetX;
        let curY = targetY;
        let actionLabel = anchorLabel;
        let isClicking = false;
        let isWorking = true;
        let opacity = 1;

        if (swarmPhaseRef.current === "dispersing" && dispersalStartTimeRef.current !== null) {
          const dispElapsed = now - dispersalStartTimeRef.current;
          const DISP_DURATION = 420;
          const d = Math.min(dispElapsed / DISP_DURATION, 1);
          const angle = (i / AGENT_POOL.length) * 2 * Math.PI;
          const scatterDist = d * 180;
          curX = targetX + Math.cos(angle) * scatterDist;
          curY = targetY + Math.sin(angle) * scatterDist;
          actionLabel = "Dispersing";
          // Fade out cursors beyond agentQuota
          opacity = i < agentQuota ? 1 : Math.max(0, 1 - d);

          if (d >= 1) {
            swarmPhaseRef.current = "idle";
            swarmStartTimeRef.current = null;
            dispersalStartTimeRef.current = null;
            setSignatureVisible(false);
            setSignatureProgress(0);
          }
        } else if (swarmElapsed < 1200) {
          // Phase 1: Swarm sweeping across the display in coordinated flight
          const u = swarmElapsed / 1200;
          const ease = u * u * (3 - 2 * u);
          const sweepWave = Math.sin(u * Math.PI) * 75 * Math.sin(i * 1.4 + u * 4);
          curX = startX + (targetX - startX) * ease + sweepWave * Math.cos(i);
          curY = startY + (targetY - startY) * ease + sweepWave * Math.sin(i);
          actionLabel = `Swarm ${i + 1}`;
          isClicking = false;
        } else if (swarmElapsed < 2400) {
          // Phase 2: Converging onto exact letter & star anchors, collaboratively drawing wordmark
          const v = (swarmElapsed - 1200) / 1200;
          const ease = v * v * (3 - 2 * v);
          const approach = 1 - ease;
          curX = targetX + Math.cos(i * 2 + v * 3) * approach * 25;
          curY = targetY + Math.sin(i * 2 + v * 3) * approach * 25;
          actionLabel = anchorLabel;
          isClicking = v > 0.4 && v < 0.9;
          setSignatureProgress(ease);
        } else {
          // Phase 3: Formation locked & hovering gently
          const hoverWave = Math.sin(now * 0.003 + i * 0.4) * 1.8;
          curX = targetX + Math.cos(now * 0.002 + i) * 1.2;
          curY = targetY + hoverWave;
          actionLabel = `${anchorLabel} ✓`;
          isClicking = (Math.floor(now / 800) + i) % 7 === 0;
          setSignatureProgress(1.0);
        }

        // Viewport clamping
        curX = Math.min(Math.max(12, curX), vw - 110);
        curY = Math.min(Math.max(12, curY), vh - 40);

        swarmCursors.push({
          agent,
          x: curX,
          y: curY,
          actionText: actionLabel,
          isClicking,
          isWorking,
          opacity,
        });
      }

      setActiveCursors(swarmCursors);
      setActiveAgentCount(24);
      setActiveBorders([]);
      return;
    }

    // ── STANDARD WORKLOAD-BASED SCHEDULING (1-6 AGENTS) ──
    setActiveAgentCount(agentQuota);

    // Pick at most `agentQuota` non-overlapping tasks with >= 70px distance
    const spacedTasks: typeof activeTasks = [];
    for (const task of activeTasks) {
      if (spacedTasks.length >= agentQuota) break;
      const tCenterX = task.rect.left + task.rect.width / 2;
      const tCenterY = task.rect.top + task.rect.height / 2;
      const tooClose = spacedTasks.some((chosen) => {
        const cCenterX = chosen.rect.left + chosen.rect.width / 2;
        const cCenterY = chosen.rect.top + chosen.rect.height / 2;
        return Math.hypot(tCenterX - cCenterX, tCenterY - cCenterY) < 70;
      });
      if (!tooClose) {
        spacedTasks.push(task);
      }
    }
    const assignedTasks = spacedTasks;

    const newActiveBorders: ActiveBorderTracing[] = [];
    const newActiveCursors: ActiveCursorState[] = [];

    for (let k = 0; k < assignedTasks.length; k++) {
      const task = assignedTasks[k];
      const { node, rect, p } = task;
      const agent = AGENT_POOL[node.assignedAgentIndex % AGENT_POOL.length];

      node.el.style.setProperty("--active-agent-color", agent.color);

      // Check if task needs border tracing (cards, panels, buttons, inputs, hexagons)
      const needsBorder =
        node.type === "card" ||
        node.type === "button" ||
        node.type === "input" ||
        node.isHexagon;

      let cursorX = rect.left + rect.width * p;
      let cursorY = rect.top + rect.height * 0.5;
      let actionLabel = "Typing";

      if (needsBorder) {
        // Register active border for SVG animated path stroke
        newActiveBorders.push({
          id: `b-${k}-${Math.round(rect.top)}`,
          left: rect.left,
          top: rect.top,
          width: rect.width,
          height: rect.height,
          borderRadius: node.borderRadius,
          isHexagon: node.isHexagon,
          progress: p,
          color: agent.color,
          glowColor: agent.glowColor,
        });

        // Compute perimeter cursor position
        const w = rect.width;
        const h = rect.height;

        if (node.isHexagon) {
          // Hexagon perimeter has 6 segments:
          // (w/2, 0) -> (w, h/4) -> (w, 3h/4) -> (w/2, h) -> (0, 3h/4) -> (0, h/4) -> (w/2, 0)
          const seg = p * 6;
          const segIdx = Math.floor(seg);
          const segT = seg - segIdx;
          const pts = [
            [w * 0.5, 0],
            [w, h * 0.25],
            [w, h * 0.75],
            [w * 0.5, h],
            [0, h * 0.75],
            [0, h * 0.25],
            [w * 0.5, 0],
          ];
          const startPt = pts[segIdx] || pts[0];
          const endPt = pts[Math.min(segIdx + 1, 6)] || pts[0];
          cursorX = rect.left + startPt[0] + (endPt[0] - startPt[0]) * segT;
          cursorY = rect.top + startPt[1] + (endPt[1] - startPt[1]) * segT;
        } else {
          // Rounded rectangle perimeter traversal (top -> right -> bottom -> left)
          const perim = 2 * (w + h);
          const dist = p * perim;
          if (dist <= w) {
            cursorX = rect.left + dist;
            cursorY = rect.top;
          } else if (dist <= w + h) {
            cursorX = rect.left + w;
            cursorY = rect.top + (dist - w);
          } else if (dist <= 2 * w + h) {
            cursorX = rect.left + w - (dist - (w + h));
            cursorY = rect.top + h;
          } else {
            cursorX = rect.left;
            cursorY = rect.top + h - (dist - (2 * w + h));
          }
        }

        actionLabel = p < 0.8 ? "Tracing Border" : "Assembling";
      } else {
        // Text/heading typing action
        actionLabel = "Typing Content";
      }

      // Clamping inside viewport bounds
      cursorX = Math.min(Math.max(16, cursorX), vw - 120);
      cursorY = Math.min(Math.max(16, cursorY), vh - 40);

      newActiveCursors.push({
        agent,
        x: cursorX,
        y: cursorY,
        actionText: `${actionLabel} (${Math.round(p * 100)}%)`,
        isClicking: p > 0.4 && p < 0.85,
        isWorking: p > 0.05 && p < 0.95,
      });
    }

    setActiveBorders(newActiveBorders);
    setActiveCursors(newActiveCursors);
  }, []);

  useEffect(() => {
    setIsMounted(true);

    const checkMotion = () => {
      const match = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      setReducedMotion(match);
      isReducedMotionRef.current = match;
    };
    checkMotion();

    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const motionHandler = (e: MediaQueryListEvent) => {
      setReducedMotion(e.matches);
      isReducedMotionRef.current = e.matches;
      if (e.matches) {
        nodesRef.current.forEach((item) => {
          item.el.setAttribute("data-construct-state", "constructed");
          item.el.style.setProperty("--construct-p", "1");
        });
        setActiveCursors([]);
        setActiveBorders([]);
        setSignatureVisible(false);
      }
    };

    if (typeof mediaQuery.addEventListener === "function") {
      mediaQuery.addEventListener("change", motionHandler);
    }

    // Reset on route transition
    initialLoadDoneRef.current = false;
    initialLoadStartTimeRef.current = null;
    swarmPhaseRef.current = "idle";
    swarmStartTimeRef.current = null;
    dispersalStartTimeRef.current = null;
    setSignatureVisible(false);
    setSignatureProgress(0);

    const timer = setTimeout(() => {
      registerElements();
      updateConstruction();
    }, 150);

    const onScroll = () => {
      lastScrollTimeRef.current = Date.now();
      isScrollingRef.current = true;

      // If we are currently in swarm mode, trigger radial dispersal
      if (
        swarmPhaseRef.current === "flying" ||
        swarmPhaseRef.current === "forming" ||
        swarmPhaseRef.current === "locked"
      ) {
        swarmPhaseRef.current = "dispersing";
        dispersalStartTimeRef.current = performance.now();
      }

      if (scrollSettleTimeoutRef.current !== null) {
        clearTimeout(scrollSettleTimeoutRef.current);
      }
      if (signatureTimeoutRef.current !== null) {
        clearTimeout(signatureTimeoutRef.current);
      }

      // Settle visible elements after 650ms inactivity
      scrollSettleTimeoutRef.current = window.setTimeout(() => {
        isScrollingRef.current = false;
        settleVisibleViewport();

        // After settled and idle for 1.4s: trigger full 24-agent drone swarm!
        signatureTimeoutRef.current = window.setTimeout(() => {
          if (!isScrollingRef.current && !isReducedMotionRef.current) {
            setSignatureVisible(true);
            swarmPhaseRef.current = "flying";
            swarmStartTimeRef.current = performance.now();
          }
        }, 1400);
      }, 650);

      if (rafRef.current !== null) return;
      rafRef.current = requestAnimationFrame(() => {
        rafRef.current = null;
        updateConstruction();
      });
    };

    let continuousLoopId: number;
    const loop = () => {
      updateConstruction();
      continuousLoopId = requestAnimationFrame(loop);
    };
    continuousLoopId = requestAnimationFrame(loop);

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", registerElements, { passive: true });

    return () => {
      clearTimeout(timer);
      cancelAnimationFrame(continuousLoopId);
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
      if (scrollSettleTimeoutRef.current !== null) clearTimeout(scrollSettleTimeoutRef.current);
      if (signatureTimeoutRef.current !== null) clearTimeout(signatureTimeoutRef.current);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", registerElements);
      if (typeof mediaQuery.removeEventListener === "function") {
        mediaQuery.removeEventListener("change", motionHandler);
      }
    };
  }, [pathname, registerElements, updateConstruction, settleVisibleViewport]);

  if (!isMounted || reducedMotion) return null;

  return (
    <>
      {/* ── Universal Animated Border Construction SVG Layer ── */}
      <BorderTracingLayer activeBorders={activeBorders} />

      {/* ── AI Agent Cursors (Adaptive 1-6 during work; All 24 in Swarm) ── */}
      <div className="fixed inset-0 pointer-events-none z-45 overflow-hidden" aria-hidden="true">
        {activeCursors.map((c, idx) => (
          <AgentCursor
            key={`${c.agent.id}-${idx}`}
            agent={c.agent}
            x={c.x}
            y={c.y}
            actionText={c.actionText}
            isClicking={c.isClicking}
            isVisible={true}
            isWorking={c.isWorking}
            opacity={c.opacity}
          />
        ))}
      </div>

      {/* ── Collaborative RIAD Signature on Idle ── */}
      <RiadSignature progress={signatureProgress} isVisible={signatureVisible} />

      {/* ── Clean, Compact Floating Telemetry Pill ── */}
      <div
        id="construction-hud"
        className="fixed bottom-6 left-6 z-50 select-none pointer-events-auto transition-opacity duration-300"
      >
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-950/85 border border-zinc-800/80 shadow-2xl backdrop-blur-xl text-[11px] font-mono text-zinc-300">
          <div className="flex -space-x-1 items-center">
            {AGENT_POOL.slice(0, 4).map((a) => (
              <span
                key={a.id}
                className="w-1.5 h-1.5 rounded-full border border-zinc-950"
                style={{ backgroundColor: a.color }}
              />
            ))}
          </div>
          <span className="font-semibold text-white">AI Build</span>
          <span className="text-cyan-400 bg-cyan-500/10 px-1.5 py-0.5 rounded border border-cyan-500/20 text-[10px] font-bold">
            {overallBuiltPct}%
          </span>
          {activeAgentCount > 0 && (
            <span
              className={`text-[10px] flex items-center gap-1 font-semibold ${
                activeAgentCount === 24 ? "text-cyan-400" : "text-emerald-400"
              }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  activeAgentCount === 24 ? "bg-cyan-400 animate-ping" : "bg-emerald-400 animate-ping"
                }`}
              />
              {activeAgentCount === 24 ? "24 Drone Swarm" : `${activeAgentCount} active`}
            </span>
          )}
        </div>
      </div>
    </>
  );
}
