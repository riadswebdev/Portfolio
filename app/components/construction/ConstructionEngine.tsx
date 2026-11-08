"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { AGENT_POOL, AgentProfile } from "./agentPool";
import { AgentCursor } from "./AgentCursor";
import { BorderTracingLayer, ActiveBorderTracing } from "./BorderTracingLayer";
import { RiadSignature } from "./RiadSignature";
import {
  getPointOnElementPerimeter,
  getDocumentScrollMetrics,
} from "./geometry";
import {
  type BuildStage,
  CREW_COUNT,
  getCrewAgent,
  getStageAction,
  getWorkflowSnapshot,
  easeInOutCubic,
  isWithinConstructionViewport,
  MAX_ACTIVE_CREWS,
  type WorkflowState,
} from "./workflow";
import {
  getSignatureStrokePoint,
} from "./signaturePaths";

type NodeType = "heading" | "text" | "card" | "button" | "image" | "input";
type SwarmPhase = "idle" | "flying" | "tracing" | "holding" | "dispersing";

interface ManagedNode {
  id: string;
  el: HTMLElement;
  type: NodeType;
  sectionId: string;
  sectionLabel: string;
  label: string;
  borderRadius: number;
  isHexagon: boolean;
  stage: WorkflowState;
  elapsedMs: number;
  progress: number;
  crewIndex: number | null;
  lastTickAt: number | null;
}

interface ActiveCursorState {
  agent: AgentProfile;
  x: number;
  y: number;
  actionText: string;
  isClicking: boolean;
  isWorking: boolean;
  showLabel: boolean;
  roleLabel?: string;
  cursorSize?: number;
  opacity?: number;
}

interface SelectionOverlay {
  id: string;
  left: number;
  top: number;
  width: number;
  height: number;
  color: string;
  label: string;
  stage: "mark" | "qa";
  progress: number;
}

interface ConstructionParcel {
  id: string;
  left: number;
  top: number;
  width: number;
  height: number;
  label: string;
  color: string;
  progress: number;
}

interface ConstructionPaintGrid {
  id: string;
  left: number;
  top: number;
  width: number;
  height: number;
  columns: number;
  rows: number;
  progress: number;
  color: string;
}

interface ActivityEntry {
  id: number;
  text: string;
  color: string;
}

interface PipelineStats {
  working: number;
  queued: number;
  done: number;
}

const isActiveStage = (stage: WorkflowState): stage is BuildStage =>
  stage === "mark" || stage === "make" || stage === "paint" || stage === "qa";

const CARD_SELECTOR =
  ".card, [class*='rounded-2xl'], [class*='rounded-3xl'], [class*='rounded-xl']";

const CONSTRUCTION_SELECTOR = [
  "main h1",
  "main h2",
  "main h3",
  "main p",
  "main a[href]",
  "main button",
  "main img",
  "main form input",
  "main form textarea",
  "main [data-construct='true']",
  "main .card",
  "main [class*='rounded-2xl']",
  "main [class*='rounded-3xl']",
  "main [class*='rounded-xl']",
  "main [style*='polygon']",
  "footer h1",
  "footer h2",
  "footer p",
  "footer a[href]",
  "footer button",
  "footer [class*='rounded-2xl']",
].join(", ");

const STAGE_COLORS: Record<BuildStage, string> = {
  mark: "#38bdf8",
  make: "#a78bfa",
  paint: "#f59e0b",
  qa: "#34d399",
};

const stageLabel = (stage: BuildStage): string => stage.toUpperCase();

const getElementLabel = (el: HTMLElement, fallback: string): string => {
  const text = (el.innerText || el.getAttribute("aria-label") || "").replace(/\s+/g, " ").trim();
  if (text) return text.slice(0, 32);
  if (el.tagName.toLowerCase() === "img") return el.getAttribute("alt") || "Image asset";
  return fallback;
};

const isCardCandidate = (el: HTMLElement): boolean =>
  el.matches(CARD_SELECTOR);

const clamp = (value: number, min: number, max: number): number =>
  Math.min(Math.max(value, min), max);

export default function ConstructionEngine() {
  const pathname = usePathname();

  const [activeCursors, setActiveCursors] = useState<ActiveCursorState[]>([]);
  const [activeBorders, setActiveBorders] = useState<ActiveBorderTracing[]>([]);
  const [selectionOverlays, setSelectionOverlays] = useState<SelectionOverlay[]>([]);
  const [constructionParcels, setConstructionParcels] = useState<ConstructionParcel[]>([]);
  const [constructionPaintGrids, setConstructionPaintGrids] = useState<ConstructionPaintGrid[]>([]);
  const [pageProgress, setPageProgress] = useState(0);
  const [pipelineStats, setPipelineStats] = useState<PipelineStats>({
    working: 0,
    queued: 0,
    done: 0,
  });
  const [activityLog, setActivityLog] = useState<ActivityEntry[]>([]);
  const [signatureVisible, setSignatureVisible] = useState(false);
  const [signatureProgress, setSignatureProgress] = useState(0);
  const [signatureOpacity, setSignatureOpacity] = useState(1);
  const [signaturePosition, setSignaturePosition] = useState({
    left: 0,
    top: 0,
    width: 320,
  });
  const [isMounted, setIsMounted] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  const nodesRef = useRef<ManagedNode[]>([]);
  const nextCrewIndexRef = useRef(0);
  const logSequenceRef = useRef(0);
  const activityLogRef = useRef<ActivityEntry[]>([]);
  const isReducedMotionRef = useRef(false);
  const isScrollingRef = useRef(false);
  const hasVisibleWorkRef = useRef(false);
  const signatureHasPlayedRef = useRef(false);
  const signatureTimeoutRef = useRef<number | null>(null);
  const scrollSettleTimeoutRef = useRef<number | null>(null);
  const rafRef = useRef<number | null>(null);
  const scheduleAnimationRef = useRef<() => void>(() => undefined);

  const swarmPhaseRef = useRef<SwarmPhase>("idle");
  const swarmStartTimeRef = useRef<number | null>(null);
  const dispersalStartTimeRef = useRef<number | null>(null);
  const swarmPositionsRef = useRef<Array<{ x: number; y: number }>>([]);
  const swarmDispersalOriginsRef = useRef<Array<{ x: number; y: number }>>([]);

  const registerElements = useCallback(() => {
    if (typeof document === "undefined") return;

    const previousNodes = new Map(nodesRef.current.map((node) => [node.el, node]));
    const candidates = Array.from(
      document.querySelectorAll(CONSTRUCTION_SELECTOR),
    ) as HTMLElement[];
    const candidateSet = new Set(candidates);

    const filtered = candidates.filter((el) => {
      if (
        el.closest("#construction-hud") ||
        el.closest("#agent-activity-log") ||
        el.closest("#riad-signature-card") ||
        el.closest("[data-construction-ignore]") ||
        el.closest(".splash-screen") ||
        el.closest("nav") ||
        el.tagName.toLowerCase() === "svg" ||
        el.tagName.toLowerCase() === "path" ||
        el.hasAttribute("data-construction-target")
      ) {
        return false;
      }

      // Prefer the containing card/panel as one locked block. Its nested
      // heading, paragraph, icon and image are revealed as part of that block.
      let ancestor = el.parentElement;
      while (ancestor && !["MAIN", "FOOTER"].includes(ancestor.tagName)) {
        if (
          candidateSet.has(ancestor) &&
          isCardCandidate(ancestor as HTMLElement)
        ) {
          return false;
        }
        ancestor = ancestor.parentElement;
      }

      const rect = el.getBoundingClientRect();
      return rect.width > 24 && rect.height > 12;
    });

    const managed: ManagedNode[] = filtered.map((el, index) => {
      const rect = el.getBoundingClientRect();
      const tag = el.tagName.toLowerCase();
      const style = window.getComputedStyle(el);
      const className = typeof el.className === "string" ? el.className : "";

      const isHexagon =
        style.clipPath.includes("polygon") ||
        (el.getAttribute("style") || "").includes("polygon") ||
        className.includes("hex");

      const borderRadiusValue = parseFloat(style.borderRadius || "0");
      const borderRadius = Number.isNaN(borderRadiusValue) ? 0 : borderRadiusValue;

      let type: NodeType = "card";
      if (tag === "h1" || tag === "h2" || tag === "h3") type = "heading";
      else if (tag === "p" || tag === "span") type = "text";
      else if (tag === "button" || tag === "a") type = "button";
      else if (tag === "input" || tag === "textarea") type = "input";
      else if (tag === "img") type = "image";

      const explicitGroup = el.closest("[data-construction-target], section") as HTMLElement | null;
      const main = el.closest("main") as HTMLElement | null;
      const footer = el.closest("footer") as HTMLElement | null;
      let regionRoot = explicitGroup || main || footer || el.parentElement;
      if (!explicitGroup && main) {
        let branch = el;
        while (branch.parentElement && branch.parentElement !== main) {
          branch = branch.parentElement;
        }
        regionRoot = branch;
      }

      const regionTitle =
        explicitGroup?.getAttribute("data-construction-target") ||
        explicitGroup?.id ||
        regionRoot?.querySelector("h1, h2, h3")?.textContent?.trim() ||
        (footer ? "Footer" : "Page section");

      if (regionRoot && !regionRoot.hasAttribute("data-agent-region-id")) {
        regionRoot.setAttribute("data-agent-region-id", "region-" + index + "-" + tag);
      }
      const sectionId = regionRoot?.getAttribute("data-agent-region-id") || "region-" + index;

      let id = el.getAttribute("data-construct-id");
      if (!id) {
        id = pathname.replace(/[^a-z0-9]+/gi, "-") + "-" + index + "-" + tag;
        el.setAttribute("data-construct-id", id);
      }

      const previous = previousNodes.get(el);
      const initialStage: WorkflowState = isReducedMotionRef.current
        ? "done"
        : "idle";
      const stage = previous?.stage ?? initialStage;
      const progress = previous?.progress ?? (initialStage === "done" ? 1 : 0);
      const elapsedMs = previous?.elapsedMs ?? 0;
      const crewIndex = previous?.crewIndex ?? null;

      el.setAttribute("data-construct-node", "true");
      el.setAttribute("data-construct-type", type);
      const displayState =
        stage === "done"
          ? "constructed"
          : stage === "idle"
            ? "unconstructed"
            : stage;
      el.setAttribute("data-construct-state", displayState);
      el.style.setProperty("--construct-p", String(progress));
      el.style.setProperty("--construct-stage-p", "0");

      return {
        id,
        el,
        type,
        sectionId,
        sectionLabel: regionTitle || "Page section",
        label: getElementLabel(el, type),
        borderRadius,
        isHexagon,
        stage,
        elapsedMs,
        progress,
        crewIndex,
        lastTickAt: null,
      };
    });

    managed.sort(
      (a, b) =>
        a.el.getBoundingClientRect().top - b.el.getBoundingClientRect().top,
    );
    nodesRef.current = managed;
  }, [pathname]);

  const updateConstruction = useCallback((now = performance.now()): boolean => {
    if (typeof window === "undefined") return false;

    const scrollingElement = document.scrollingElement ?? document.documentElement;
    const scrollTop = Math.max(scrollingElement.scrollTop, window.scrollY);
    const metrics = getDocumentScrollMetrics(
      scrollTop,
      scrollingElement.scrollHeight,
      scrollingElement.clientHeight || window.innerHeight,
      2,
    );
    setPageProgress((current) => current === metrics.progress ? current : metrics.progress);

    const viewportHeight = window.innerHeight;
    const viewportWidth = window.innerWidth;
    const splashActive = Boolean(
      document.querySelector(".splash-screen:not(.splash-screen--hide)"),
    );

    // The drone animation has priority over normal construction until it
    // disperses. On scroll resume, the cursors leave the letters smoothly.
    if (swarmPhaseRef.current !== "idle") {
      const phase = swarmPhaseRef.current;
      const originWidth = Math.min(360, Math.max(220, viewportWidth - 32));
      const scale = originWidth / 320;
      const originHeight = (originWidth * 90) / 320;
      const originX = Math.max(16, viewportWidth - originWidth - 24);
      const originY = Math.max(72, viewportHeight - originHeight - 92);

      if (phase === "dispersing" && dispersalStartTimeRef.current !== null) {
        const dispersalProgress = Math.min(
          (now - dispersalStartTimeRef.current) / 620,
          1,
        );
        const cursors = AGENT_POOL.map((agent, index) => {
          const point = getSignatureStrokePoint(index, 1);
          const origin = swarmDispersalOriginsRef.current[index] ||
            swarmPositionsRef.current[index] || {
              x: originX + point.x * scale,
              y: originY + point.y * scale,
            };
          const angle = (index / AGENT_POOL.length) * Math.PI * 2 + 0.25;
          const distance = 180 * easeInOutCubic(dispersalProgress);
          return {
            agent,
            x: origin.x + Math.cos(angle) * distance,
            y: origin.y + Math.sin(angle) * distance,
            actionText: "DISPERSING",
            isClicking: false,
            isWorking: false,
            showLabel: false,
            cursorSize: 11,
            opacity: 1 - dispersalProgress,
          };
        });

        setActiveCursors(cursors);
        setSignatureProgress(1 - dispersalProgress);
        setSignatureOpacity(1 - dispersalProgress);
        setActiveBorders([]);
        setSelectionOverlays([]);
        setConstructionParcels([]);
        setConstructionPaintGrids([]);

        if (dispersalProgress >= 1) {
          swarmPhaseRef.current = "idle";
          swarmStartTimeRef.current = null;
          dispersalStartTimeRef.current = null;
          swarmPositionsRef.current = [];
          swarmDispersalOriginsRef.current = [];
          setSignatureVisible(false);
          setSignatureProgress(0);
          setSignatureOpacity(1);
          setActiveCursors([]);
          // Continue into the normal workflow in this same frame.
        } else {
          return true;
        }
      } else if (phase === "flying" || phase === "tracing" || phase === "holding") {
        const elapsed = Math.max(0, now - (swarmStartTimeRef.current || now));
        const flightDuration = 1150;
        const traceDuration = 2850;
        let drawProgress = 0;
        if (elapsed < flightDuration) {
          swarmPhaseRef.current = "flying";
        } else if (elapsed < flightDuration + traceDuration) {
          swarmPhaseRef.current = "tracing";
          drawProgress = easeInOutCubic(
            (elapsed - flightDuration) / traceDuration,
          );
        } else {
          swarmPhaseRef.current = "holding";
          drawProgress = 1;
        }

        const cursors = AGENT_POOL.map((agent, index) => {
          const target = getSignatureStrokePoint(index, drawProgress);
          const targetX = originX + target.x * scale;
          const targetY = originY + target.y * scale;
          let x = targetX;
          let y = targetY;

          if (swarmPhaseRef.current === "flying") {
            const startX = ((index * 137.7) % Math.max(120, viewportWidth - 40)) + 20;
            const startY = ((index * 83.9) % Math.max(120, viewportHeight - 110)) + 30;
            const startPoint = getSignatureStrokePoint(index, 0);
            const destinationX = originX + startPoint.x * scale;
            const destinationY = originY + startPoint.y * scale;
            const flightProgress = easeInOutCubic(elapsed / flightDuration);
            x = startX + (destinationX - startX) * flightProgress;
            y = startY + (destinationY - startY) * flightProgress;
          }

          if (swarmPhaseRef.current === "holding") {
            x += Math.sin(index * 1.7) * 1.1;
            y += Math.cos(index * 1.3) * 1.1;
          }

          swarmPositionsRef.current[index] = { x, y };
          return {
            agent,
            x,
            y,
            actionText: "DRAWING RIAD",
            isClicking: swarmPhaseRef.current === "tracing",
            isWorking: false,
            showLabel: false,
            cursorSize: 11,
            opacity: 1,
          };
        });

        setActiveCursors(cursors);
        setSignaturePosition({
          left: originX,
          top: originY,
          width: originWidth,
        });
        setSignatureProgress(drawProgress);
        setSignatureOpacity(1);
        setSignatureVisible(true);
        setActiveBorders([]);
        setSelectionOverlays([]);
        setConstructionParcels([]);
        setConstructionPaintGrids([]);

        // Once the formation is complete it can remain static. No idle RAF loop.
        return swarmPhaseRef.current !== "holding";
      }
    }

    if (isReducedMotionRef.current || splashActive) {
      setActiveCursors([]);
      setActiveBorders([]);
      setSelectionOverlays([]);
      setConstructionParcels([]);
      setConstructionPaintGrids([]);
      return false;
    }

    const nodeRects = new Map<ManagedNode, DOMRect>();
    for (const node of nodesRef.current) {
      const rect = node.el.getBoundingClientRect();
      nodeRects.set(node, rect);
      const visible = isWithinConstructionViewport(rect, viewportHeight);

      if (visible && node.stage === "idle") {
        node.stage = "queued";
        node.el.setAttribute("data-construct-state", "queued");
        node.el.setAttribute("data-construct-stage", "queued");
      }

      if (!visible && isActiveStage(node.stage)) {
        // Work pauses outside the viewport, then resumes from the same stage
        // and elapsed time when the visitor returns to this section.
        node.lastTickAt = null;
      }
    }

    let activeVisibleCount = nodesRef.current.filter((node) => {
      const rect = nodeRects.get(node);
      return rect && isWithinConstructionViewport(rect, viewportHeight) && isActiveStage(node.stage);
    }).length;

    const visibleQueue = nodesRef.current
      .filter((node) => {
        const rect = nodeRects.get(node);
        return rect && node.stage === "queued" && isWithinConstructionViewport(rect, viewportHeight);
      })
      .sort((a, b) => {
        const aRect = nodeRects.get(a);
        const bRect = nodeRects.get(b);
        return (aRect?.top || 0) - (bRect?.top || 0);
      });

    for (const node of visibleQueue) {
      if (activeVisibleCount >= MAX_ACTIVE_CREWS) break;
      node.stage = "mark";
      node.elapsedMs = 0;
      node.lastTickAt = now;
      node.crewIndex = nextCrewIndexRef.current % CREW_COUNT;
      nextCrewIndexRef.current += 1;
      activeVisibleCount += 1;
      node.el.setAttribute("data-construct-state", "mark");
      node.el.setAttribute("data-construct-stage", "mark");
      node.el.setAttribute("data-construct-lock", "locked");
      node.el.setAttribute("data-construct-owner", "Crew " + (node.crewIndex + 1));
      node.el.style.setProperty("--active-agent-color", STAGE_COLORS.mark);
      activityLogRef.current = [
        {
          id: logSequenceRef.current++,
          text: "MARK locked " + node.label,
          color: STAGE_COLORS.mark,
        },
        ...activityLogRef.current,
      ].slice(0, 4);
      setActivityLog(activityLogRef.current);
    }

    const activeCursorsNext: ActiveCursorState[] = [];
    const activeBordersNext: ActiveBorderTracing[] = [];
    const selectionOverlaysNext: SelectionOverlay[] = [];
    const parcelsNext: ConstructionParcel[] = [];
    const paintGridsNext: ConstructionPaintGrid[] = [];
    const logEntries: ActivityEntry[] = [];

    for (const node of nodesRef.current) {
      if (!isActiveStage(node.stage)) continue;

      const rect = nodeRects.get(node);
      if (!rect || !isWithinConstructionViewport(rect, viewportHeight)) continue;
      if (node.lastTickAt === null) node.lastTickAt = now;

      const delta = clamp(now - node.lastTickAt, 0, 80);
      node.elapsedMs += delta;
      node.lastTickAt = now;

      const snapshot = getWorkflowSnapshot(node.elapsedMs);
      if (snapshot.complete) {
        node.stage = "done";
        node.progress = 1;
        node.lastTickAt = null;
        node.el.setAttribute("data-construct-state", "constructed");
        node.el.setAttribute("data-construct-stage", "done");
        node.el.style.setProperty("--construct-p", "1");
        node.el.style.setProperty("--construct-stage-p", "1");
        node.el.removeAttribute("data-construct-lock");
        node.el.removeAttribute("data-construct-owner");
        logEntries.push({
          id: logSequenceRef.current++,
          text: "QA approved " + node.label,
          color: STAGE_COLORS.qa,
        });
        continue;
      }

      const previousStage = node.stage;
      node.stage = snapshot.stage;
      node.progress = snapshot.overallProgress;
      node.el.setAttribute("data-construct-state", snapshot.stage);
      node.el.setAttribute("data-construct-stage", snapshot.stage);
      node.el.style.setProperty("--construct-p", snapshot.overallProgress.toFixed(3));
      node.el.style.setProperty("--construct-stage-p", snapshot.stageProgress.toFixed(3));

      if (previousStage !== snapshot.stage) {
        const agent = node.crewIndex === null
          ? undefined
          : getCrewAgent(AGENT_POOL, node.crewIndex, snapshot.stage);
        logEntries.push({
          id: logSequenceRef.current++,
          text: stageLabel(snapshot.stage) + " " + (agent?.name || "Agent") + " · " + node.label,
          color: STAGE_COLORS[snapshot.stage],
        });
      }

      if (node.crewIndex === null) continue;
      const agent = getCrewAgent(AGENT_POOL, node.crewIndex, snapshot.stage);
      if (!agent) continue;

      const stageProgress = easeInOutCubic(snapshot.stageProgress);
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      let cursorX = centerX;
      let cursorY = centerY;
      const borderPoint = getPointOnElementPerimeter(
        rect.width,
        rect.height,
        node.borderRadius,
        node.isHexagon,
        stageProgress,
      );

      if (snapshot.stage === "mark") {
        cursorX = rect.left + borderPoint.x;
        cursorY = rect.top + borderPoint.y;
        selectionOverlaysNext.push({
          id: node.id,
          left: rect.left,
          top: rect.top,
          width: rect.width,
          height: rect.height,
          color: STAGE_COLORS.mark,
          label: "LOCKED · CREW " + (node.crewIndex + 1),
          stage: "mark",
          progress: stageProgress,
        });
      } else if (snapshot.stage === "make") {
        const sourceX = node.crewIndex % 2 === 0 ? -150 : viewportWidth + 150;
        const sourceY = clamp(
          centerY + ((node.crewIndex % 3) - 1) * 72,
          24,
          viewportHeight - 24,
        );
        const ghostWidth = clamp(rect.width * 0.72, 112, 330);
        const ghostHeight = clamp(rect.height * 0.55, 54, 112);
        const destinationLeft = centerX - ghostWidth / 2;
        const destinationTop = centerY - ghostHeight / 2;
        const ghostLeft = sourceX + (destinationLeft - sourceX) * stageProgress;
        const ghostTop = sourceY + (destinationTop - sourceY) * stageProgress;

        cursorX = ghostLeft + ghostWidth * 0.88;
        cursorY = ghostTop + ghostHeight * 0.28;
        parcelsNext.push({
          id: node.id,
          left: ghostLeft,
          top: ghostTop,
          width: ghostWidth,
          height: ghostHeight,
          label: node.label,
          color: agent.color,
          progress: stageProgress,
        });
      } else if (snapshot.stage === "paint") {
        cursorX = rect.left + borderPoint.x;
        cursorY = rect.top + borderPoint.y;
        paintGridsNext.push({
          id: node.id,
          left: rect.left,
          top: rect.top,
          width: rect.width,
          height: rect.height,
          columns: 7,
          rows: 5,
          progress: stageProgress,
          color: agent.color,
        });
        activeBordersNext.push({
          id: node.id,
          left: rect.left,
          top: rect.top,
          width: rect.width,
          height: rect.height,
          borderRadius: node.borderRadius,
          isHexagon: node.isHexagon,
          progress: stageProgress,
          color: agent.color,
          glowColor: agent.glowColor,
        });
      } else {
        const reversePoint = getPointOnElementPerimeter(
          rect.width,
          rect.height,
          node.borderRadius,
          node.isHexagon,
          1 - stageProgress,
        );
        cursorX = rect.left + reversePoint.x;
        cursorY = rect.top + reversePoint.y;
        selectionOverlaysNext.push({
          id: node.id,
          left: rect.left,
          top: rect.top,
          width: rect.width,
          height: rect.height,
          color: STAGE_COLORS.qa,
          label: "QA REVIEW · CREW " + (node.crewIndex + 1),
          stage: "qa",
          progress: stageProgress,
        });
      }

      activeCursorsNext.push({
        agent,
        x: clamp(cursorX, 4, viewportWidth - 18),
        y: clamp(cursorY, 4, viewportHeight - 18),
        actionText: getStageAction(snapshot.stage),
        isClicking: snapshot.stage === "mark" || snapshot.stage === "qa",
        isWorking: true,
        showLabel: true,
        roleLabel: stageLabel(snapshot.stage),
        cursorSize: 14,
      });
    }

    if (logEntries.length > 0) {
      activityLogRef.current = [...logEntries.reverse(), ...activityLogRef.current].slice(0, 4);
      setActivityLog(activityLogRef.current);
    }

    const queuedCount = nodesRef.current.filter((node) => node.stage === "queued").length;
    const doneCount = nodesRef.current.filter((node) => node.stage === "done").length;
    const stats = {
      working: activeCursorsNext.length,
      queued: queuedCount,
      done: doneCount,
    };
    setPipelineStats((previous) =>
      previous.working === stats.working &&
      previous.queued === stats.queued &&
      previous.done === stats.done
        ? previous
        : stats,
    );

    setActiveCursors(activeCursorsNext);
    setActiveBorders(activeBordersNext);
    setSelectionOverlays(selectionOverlaysNext);
    setConstructionParcels(parcelsNext);
    setConstructionPaintGrids(paintGridsNext);

    const hasVisibleQueued = visibleQueue.some((node) => node.stage === "queued");
    const hasVisibleActive = activeCursorsNext.length > 0;
    const hasVisibleWork = hasVisibleQueued || hasVisibleActive;
    hasVisibleWorkRef.current = hasVisibleWork;

    if (
      hasVisibleWork ||
      isScrollingRef.current ||
      signatureHasPlayedRef.current ||
      swarmPhaseRef.current !== "idle"
    ) {
      if (signatureTimeoutRef.current !== null) {
        clearTimeout(signatureTimeoutRef.current);
        signatureTimeoutRef.current = null;
      }
    } else if (signatureTimeoutRef.current === null) {
      signatureTimeoutRef.current = window.setTimeout(() => {
        signatureTimeoutRef.current = null;
        if (
          isScrollingRef.current ||
          hasVisibleWorkRef.current ||
          signatureHasPlayedRef.current ||
          swarmPhaseRef.current !== "idle" ||
          isReducedMotionRef.current
        ) {
          return;
        }

        signatureHasPlayedRef.current = true;
        swarmPhaseRef.current = "flying";
        swarmStartTimeRef.current = performance.now();
        setSignatureVisible(true);
        setSignatureProgress(0);
        setSignatureOpacity(1);
        scheduleAnimationRef.current();
      }, 1400);
    }

    return hasVisibleWork;
  }, []);

  useEffect(() => {
    setIsMounted(true);

    const checkMotion = () => {
      const matches = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      setReducedMotion(matches);
      isReducedMotionRef.current = matches;
      if (matches) {
        nodesRef.current.forEach((node) => {
          node.stage = "done";
          node.progress = 1;
          node.el.setAttribute("data-construct-state", "constructed");
          node.el.style.setProperty("--construct-p", "1");
        });
      }
    };

    checkMotion();
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onMotionChange = (event: MediaQueryListEvent) => {
      setReducedMotion(event.matches);
      isReducedMotionRef.current = event.matches;
      if (event.matches) {
        nodesRef.current.forEach((node) => {
          node.stage = "done";
          node.progress = 1;
          node.el.setAttribute("data-construct-state", "constructed");
          node.el.style.setProperty("--construct-p", "1");
          node.el.removeAttribute("data-construct-lock");
          node.el.removeAttribute("data-construct-owner");
        });
        setActiveCursors([]);
        setActiveBorders([]);
        setSelectionOverlays([]);
        setConstructionParcels([]);
        setConstructionPaintGrids([]);
        setSignatureVisible(false);
      } else {
        nodesRef.current.forEach((node) => {
          if (node.stage === "done") {
            node.stage = "idle";
            node.progress = 0;
            node.el.setAttribute("data-construct-state", "unconstructed");
            node.el.style.setProperty("--construct-p", "0");
          }
        });
      }
    };
    mediaQuery.addEventListener("change", onMotionChange);

    swarmPhaseRef.current = "idle";
    swarmStartTimeRef.current = null;
    dispersalStartTimeRef.current = null;
    swarmPositionsRef.current = [];
    swarmDispersalOriginsRef.current = [];
    signatureHasPlayedRef.current = false;
    setSignatureVisible(false);
    setSignatureProgress(0);
    setSignatureOpacity(1);

    let disposed = false;
    let registrationFrame: number | null = null;
    let mutationObserver: MutationObserver | null = null;
    let bodyResizeObserver: ResizeObserver | null = null;
    let splashObserver: MutationObserver | null = null;

    const scheduleRegistration = () => {
      if (registrationFrame !== null || disposed) return;
      registrationFrame = window.requestAnimationFrame(() => {
        registrationFrame = null;
        if (disposed) return;
        registerElements();
        updateConstruction(performance.now());
        scheduleAnimation();
      });
    };

    const animate = (time: number) => {
      rafRef.current = null;
      if (disposed) return;
      const shouldContinue = updateConstruction(time);
      if (shouldContinue || swarmPhaseRef.current === "flying" ||
          swarmPhaseRef.current === "tracing" ||
          swarmPhaseRef.current === "dispersing") {
        rafRef.current = window.requestAnimationFrame(animate);
      }
    };

    const scheduleAnimation = () => {
      if (disposed || rafRef.current !== null) return;
      rafRef.current = window.requestAnimationFrame(animate);
    };
    scheduleAnimationRef.current = scheduleAnimation;

    const onScroll = () => {
      isScrollingRef.current = true;
      signatureHasPlayedRef.current = false;
      if (signatureTimeoutRef.current !== null) {
        clearTimeout(signatureTimeoutRef.current);
        signatureTimeoutRef.current = null;
      }

      if (
        swarmPhaseRef.current === "flying" ||
        swarmPhaseRef.current === "tracing" ||
        swarmPhaseRef.current === "holding"
      ) {
        swarmPhaseRef.current = "dispersing";
        dispersalStartTimeRef.current = performance.now();
        swarmDispersalOriginsRef.current = swarmPositionsRef.current.map((point) => ({
          x: point.x,
          y: point.y,
        }));
      }

      if (scrollSettleTimeoutRef.current !== null) {
        clearTimeout(scrollSettleTimeoutRef.current);
      }
      scrollSettleTimeoutRef.current = window.setTimeout(() => {
        isScrollingRef.current = false;
        updateConstruction(performance.now());
        scheduleAnimation();
      }, 700);

      // Coalesce high-frequency scroll events into the shared animation frame.
      scheduleAnimation();
    };

    const onResize = () => {
      registerElements();
      updateConstruction(performance.now());
      scheduleAnimation();
    };

    const timer = window.setTimeout(() => {
      registerElements();
      updateConstruction(performance.now());
      scheduleAnimation();

      mutationObserver = new MutationObserver((records) => {
        if (records.some((record) => record.addedNodes.length > 0)) {
          scheduleRegistration();
        }
      });
      mutationObserver.observe(document.body, { childList: true, subtree: true });

      if (typeof ResizeObserver !== "undefined") {
        bodyResizeObserver = new ResizeObserver(scheduleRegistration);
        bodyResizeObserver.observe(document.body);
      }

      document.fonts?.ready.then(() => {
        if (!disposed) scheduleRegistration();
      });

      const splash = document.querySelector(".splash-screen");
      if (splash) {
        splashObserver = new MutationObserver(() => {
          updateConstruction(performance.now());
          scheduleAnimation();
        });
        splashObserver.observe(splash, {
          attributes: true,
          attributeFilter: ["class"],
        });
      }
    }, 120);

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize, { passive: true });
    document.addEventListener("load", scheduleRegistration, true);

    return () => {
      disposed = true;
      window.clearTimeout(timer);
      mutationObserver?.disconnect();
      bodyResizeObserver?.disconnect();
      splashObserver?.disconnect();
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      document.removeEventListener("load", scheduleRegistration, true);

      if (registrationFrame !== null) window.cancelAnimationFrame(registrationFrame);
      if (rafRef.current !== null) window.cancelAnimationFrame(rafRef.current);
      if (signatureTimeoutRef.current !== null) window.clearTimeout(signatureTimeoutRef.current);
      if (scrollSettleTimeoutRef.current !== null) window.clearTimeout(scrollSettleTimeoutRef.current);
      mediaQuery.removeEventListener("change", onMotionChange);
      scheduleAnimationRef.current = () => undefined;
    };
  }, [pathname, registerElements, updateConstruction]);

  if (!isMounted || reducedMotion) return null;

  return (
    <>
      <BorderTracingLayer activeBorders={activeBorders} />

      <div
        className="fixed inset-0 pointer-events-none z-44 overflow-hidden"
        aria-hidden="true"
      >
        {constructionPaintGrids.map((grid) => {
          const tileCount = grid.columns * grid.rows;
          const paintedCount = Math.ceil(grid.progress * tileCount);
          return (
            <div
              key={grid.id}
              className="construction-paint-grid"
              style={{
                left: grid.left,
                top: grid.top,
                width: grid.width,
                height: grid.height,
                gridTemplateColumns: "repeat(" + grid.columns + ", minmax(0, 1fr))",
                gridTemplateRows: "repeat(" + grid.rows + ", minmax(0, 1fr))",
              }}
            >
              {Array.from({ length: tileCount }, (_, index) => (
                <span
                  key={index}
                  className="construction-paint-grid__tile"
                  style={{
                    backgroundColor: grid.color,
                    opacity: index < paintedCount ? 0.2 : 0,
                  }}
                />
              ))}
            </div>
          );
        })}

        {selectionOverlays.map((overlay) => (
          <div
            key={overlay.id}
            className="construction-selection"
            style={{
              left: overlay.left - 3,
              top: overlay.top - 3,
              width: overlay.width + 6,
              height: overlay.height + 6,
              borderColor: overlay.color,
              color: overlay.color,
              opacity: overlay.stage === "mark" ? 1 : 0.82,
            }}
          >
            <span className="construction-selection__label">
              {overlay.label}
            </span>
            <span className="construction-selection__handle construction-selection__handle--tl" />
            <span className="construction-selection__handle construction-selection__handle--tr" />
            <span className="construction-selection__handle construction-selection__handle--bl" />
            <span className="construction-selection__handle construction-selection__handle--br" />
            <span
              className="construction-selection__sweep"
              style={{
                transform: "scaleX(" + overlay.progress + ")",
                backgroundColor: overlay.color,
              }}
            />
          </div>
        ))}

        {constructionParcels.map((parcel) => (
          <div
            key={parcel.id}
            className="construction-parcel"
            style={{
              left: parcel.left,
              top: parcel.top,
              width: parcel.width,
              height: parcel.height,
              borderColor: parcel.color,
              boxShadow: "0 0 26px " + parcel.color + "35",
              opacity: 0.2 + parcel.progress * 0.8,
            }}
          >
            <div className="construction-parcel__top">
              <span style={{ color: parcel.color }}>MAKE / IN TRANSIT</span>
              <span>●</span>
            </div>
            <div className="construction-parcel__title">
              {parcel.label || "Content block"}
            </div>
            <div className="construction-parcel__skeleton">
              <span />
              <span />
              <span />
            </div>
          </div>
        ))}
      </div>

      <div
        className="fixed inset-0 pointer-events-none z-45 overflow-hidden"
        aria-hidden="true"
      >
        {activeCursors.map((cursor, index) => (
          <AgentCursor
            key={cursor.agent.id + "-" + index}
            agent={cursor.agent}
            x={cursor.x}
            y={cursor.y}
            actionText={cursor.actionText}
            isClicking={cursor.isClicking}
            isVisible={true}
            isWorking={cursor.isWorking}
            showLabel={cursor.showLabel}
            roleLabel={cursor.roleLabel}
            cursorSize={cursor.cursorSize}
            opacity={cursor.opacity}
          />
        ))}
      </div>

      <RiadSignature
        progress={signatureProgress}
        isVisible={signatureVisible}
        left={signaturePosition.left}
        top={signaturePosition.top}
        width={signaturePosition.width}
        opacity={signatureOpacity}
      />

      <div
        id="construction-hud"
        className="fixed bottom-5 left-4 sm:left-6 z-50 select-none pointer-events-none"
      >
        <div className="flex flex-wrap items-center gap-2 px-3 py-2 rounded-2xl bg-zinc-950/90 border border-zinc-800/80 shadow-2xl backdrop-blur-xl text-[10px] font-mono text-zinc-300">
          <span className="font-bold text-white">AGENT WORKFLOW</span>
          <span className="text-cyan-300 bg-cyan-500/10 px-1.5 py-0.5 rounded">
            PAGE {pageProgress}%
          </span>
          <span className="text-emerald-300">WORK {pipelineStats.working}</span>
          <span className="text-amber-300">QUEUE {pipelineStats.queued}</span>
          <span className="text-sky-300">DONE {pipelineStats.done}</span>
          <span className="text-zinc-500">POOL 24</span>
        </div>
      </div>

      <div
        id="agent-activity-log"
        className="fixed bottom-5 right-4 sm:right-6 z-50 w-[220px] sm:w-[250px] pointer-events-none select-none"
      >
        <div className="rounded-xl border border-zinc-800/80 bg-zinc-950/82 backdrop-blur-xl shadow-2xl px-3 py-2.5">
          <div className="flex items-center justify-between gap-2 pb-2 border-b border-zinc-800/70">
            <span className="text-[10px] font-mono font-bold tracking-wide text-zinc-200">
              AGENT ACTIVITY
            </span>
            <span className="text-[9px] font-mono text-zinc-500">24 POOL</span>
          </div>
          <div className="space-y-1.5 pt-2">
            {activityLog.length === 0 ? (
              <div className="text-[9px] font-mono text-zinc-500">
                Waiting for visible blocks...
              </div>
            ) : (
              activityLog.slice(0, 4).map((entry) => (
                <div key={entry.id} className="flex items-start gap-1.5 text-[9px] font-mono leading-tight">
                  <span
                    className="mt-0.5 shrink-0 w-1.5 h-1.5 rounded-full"
                    style={{ backgroundColor: entry.color }}
                  />
                  <span className="text-zinc-300 line-clamp-2">{entry.text}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </>
  );
}
