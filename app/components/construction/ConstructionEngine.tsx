"use client";

import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import "./construction.css";
import { AGENT_POOL } from "./agentPool";
import SwarmCursorLayer from "./SwarmCursorLayer";
import { getCurvedTrajectoryPoint } from "./geometry";
import {
  getConstructionProgress,
  getEligibleTasks,
  getLeasedAgentIds,
  getTaskDuration,
  getTaskProgress,
  getTaskWorkerDemand,
  isWithinViewport,
  MAX_ACTIVE_AGENTS,
  selectAvailableAgents,
  spreadTasksAcrossViewport,
  type ConstructionTaskKind,
  type ViewportRect,
} from "./workflow";

type TaskState = "idle" | "queued" | "working" | "done";
type ConstructionPhase =
  | "INTRO_GATHER"
  | "FAN_OUT"
  | "VIEWPORT_BUILD"
  | "VIEWPORT_IDLE"
  | "FLOCK";

interface TextFragment {
  node: Text;
  text: string;
}

interface TaskDraft {
  source: HTMLElement;
  duplicateGroup: HTMLElement | null;
}

interface ConstructionTask {
  id: string;
  source: HTMLElement;
  mirror: HTMLElement;
  label: string;
  kind: ConstructionTaskKind;
  duplicateOf?: string;
  master?: ConstructionTask;
  state: TaskState;
  elapsedMs: number;
  durationMs: number;
  workerIds: string[];
  lastTickAt: number | null;
  fragments: TextFragment[];
  ghostFragments: TextFragment[] | null;
  rect: ViewportRect;
  ghost: HTMLElement | null;
  selection: HTMLDivElement | null;
  caret: HTMLDivElement | null;
  travelStartedAt: number | null;
  travelOrigin: { x: number; y: number };
  travelTarget: { x: number; y: number };
}

interface ReconstructionRoot {
  source: HTMLElement;
  mirror: HTMLElement;
  visibility: string;
  visibilityPriority: string;
}

interface ActiveCursor {
  agent: (typeof AGENT_POOL)[number];
  x: number;
  y: number;
  isPressed?: boolean;
}

interface PipelineStats {
  working: number;
  queued: number;
  done: number;
}

interface ActivityEntry {
  id: number;
  text: string;
  color: string;
}

const ROOT_SELECTOR = "header, main, footer";
const MIRROR_EXCLUDED_ATTRIBUTES = [
  "id",
  "name",
  "data-construction-target",
  "data-construct-id",
  "data-construct-node",
  "data-construct-type",
  "data-construct-state",
  "data-construct-stage",
  "data-construct-lock",
  "data-construct-owner",
];
const ACTIVE_COLOR = "#38bdf8";
const MAX_SNAPSHOT_WAIT_MS = 900;
const CURSOR_TRAVEL_MS = 320;
const COMPONENT_DRAG_PROGRESS = 0.3;
const DUPLICATE_EDIT_PROGRESS = 0.68;

const clamp = (value: number, min: number, max: number): number =>
  Math.min(Math.max(value, min), max);

function getTaskLabel(element: HTMLElement): string {
  const text = (element.innerText || element.getAttribute("aria-label") || "")
    .replace(/\s+/g, " ")
    .trim();
  return text.slice(0, 40) || element.getAttribute("data-construction-target") || "Page element";
}

function getStructureSignature(element: HTMLElement): string {
  const colorUtility =
    /^(?:text|bg|border|from|via|to|ring|shadow|decoration|fill|stroke)-(?:black|white|transparent|current|inherit|slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)(?:-|\/|$)/;
  const getStructuralClasses = (node: Element) =>
    Array.from(node.classList)
      .filter((name) => !colorUtility.test(name.split(":").at(-1) ?? name))
      .sort()
      .join(".");
  const style = window.getComputedStyle(element);
  const children = Array.from(element.children)
    .slice(0, 12)
    .map((child) => `${child.tagName.toLowerCase()}.${getStructuralClasses(child)}`)
    .join("|");
  const computedShape = [
    style.display,
    style.flexDirection,
    style.gridTemplateColumns,
    style.gap,
    style.padding,
    style.borderRadius,
    style.borderStyle,
    style.borderWidth,
    style.boxShadow,
  ].join(";");
  const className = getStructuralClasses(element);
  return `${element.tagName.toLowerCase()}.${className}[${children}]{${computedShape}}`;
}

function getTaskKind(element: HTMLElement): ConstructionTaskKind {
  if (element.matches("hr, [data-construction-kind='line']")) return "line";
  if (element.matches("img, picture, video, canvas, svg")) return "media";
  if (element.matches("h1, h2, h3, h4, h5, h6, p")) return "text";

  const hasMediaOrControls = element.querySelector(
    "img, picture, video, canvas, svg, button, input, textarea, select, [role='button']",
  );
  const elements = [element, ...Array.from(element.querySelectorAll<HTMLElement>("*"))];
  const hasPaintedSurface = elements.some((child) => {
    const style = window.getComputedStyle(child);
    const backgroundColor = style.backgroundColor.replace(/\s+/g, "");
    const backgroundAlpha =
      backgroundColor === "transparent" || backgroundColor.endsWith(",0)")
        ? 0
        : 1;
    return (
      backgroundAlpha > 0 ||
      (style.borderStyle !== "none" &&
        style.borderWidth.split(" ").some((width) => parseFloat(width) > 0)) ||
      style.boxShadow !== "none"
    );
  });

  return !hasMediaOrControls && !hasPaintedSurface ? "text" : "component";
}

function getTaskDrafts(): TaskDraft[] {
  const drafts: TaskDraft[] = [];
  const seen = new Set<HTMLElement>();

  const add = (element: HTMLElement, duplicateGroup: HTMLElement | null) => {
    if (seen.has(element)) return;
    const rect = element.getBoundingClientRect();
    const isLine = element.matches("hr, [data-construction-kind='line']");
    if (isLine ? rect.width <= 24 || rect.height <= 0 : rect.width <= 24 || rect.height <= 18) {
      return;
    }
    if (
      element.closest(
        "#construction-hud, #agent-activity-log, .splash-screen, [data-construction-ignore], .construction-reconstruction-layer",
      )
    ) {
      return;
    }

    seen.add(element);
    drafts.push({ source: element, duplicateGroup });
  };

  const visit = (
    element: HTMLElement,
    includeUnmarked: boolean,
    duplicateGroup: HTMLElement | null = null,
  ) => {
    const children = Array.from(element.children).filter(
      (child): child is HTMLElement => child instanceof HTMLElement,
    );
    for (const child of children) {
      if (child.matches("hr, [data-construction-kind='line']")) {
        add(child, null);
      }
    }
    const hasNestedTarget = Boolean(
      element.querySelector("[data-construction-target]"),
    );
    const rect = element.getBoundingClientRect();
    const style = window.getComputedStyle(element);
    const isLayoutGroup =
      children.length > 1 &&
      (style.display.includes("grid") ||
        style.display.includes("flex") ||
        rect.height > window.innerHeight * 0.9);

    if (element.tagName.toLowerCase() === "main") {
      for (const child of children) visit(child, true, duplicateGroup);
      return;
    }

    if (duplicateGroup && !hasNestedTarget) {
      add(element, duplicateGroup);
      return;
    }

    if (isLayoutGroup) {
      const visibleChildren = children.filter((child) => {
        const childRect = child.getBoundingClientRect();
        return childRect.width > 40 && childRect.height > 32;
      });
      if (visibleChildren.length > 1) {
        for (const child of visibleChildren) visit(child, true, element);
        return;
      }
    }

    if (hasNestedTarget) {
      for (const child of children) visit(child, true, duplicateGroup);
      return;
    }

    if (includeUnmarked || element.hasAttribute("data-construction-target")) {
      add(element, duplicateGroup);
    }
  };

  const roots = Array.from(
    document.querySelectorAll<HTMLElement>(ROOT_SELECTOR),
  ).filter((root) => !root.parentElement?.closest(ROOT_SELECTOR));

  for (const root of roots) {
    if (root.tagName.toLowerCase() === "main") {
      for (const child of Array.from(root.children)) {
        if (child instanceof HTMLElement) visit(child, true);
      }
    } else {
      add(root, null);
    }
  }

  return drafts;
}

function getTextFragments(element: HTMLElement): TextFragment[] {
  const fragments: TextFragment[] = [];
  const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
  let node = walker.nextNode();
  while (node) {
    fragments.push({ node: node as Text, text: node.textContent ?? "" });
    node = walker.nextNode();
  }
  return fragments;
}

function setTextProgress(fragments: TextFragment[], progress: number) {
  const totalLength = fragments.reduce(
    (total, fragment) => total + fragment.text.length,
    0,
  );
  let remaining = Math.floor(totalLength * clamp(progress, 0, 1));

  for (const fragment of fragments) {
    const visibleLength = Math.min(fragment.text.length, remaining);
    fragment.node.textContent = fragment.text.slice(0, visibleLength);
    remaining -= visibleLength;
  }
}

function getCaretRect(fragments: TextFragment[], progress: number): DOMRect | null {
  let remaining = Math.floor(
    fragments.reduce((total, fragment) => total + fragment.text.length, 0) *
      clamp(progress, 0, 1),
  );

  for (const fragment of fragments) {
    const visibleLength = Math.min(
      fragment.node.textContent?.length ?? 0,
      fragment.text.length,
      Math.max(0, remaining),
    );
    if (fragment.text.length > 0 && remaining <= fragment.text.length) {
      const range = document.createRange();
      range.setStart(fragment.node, visibleLength);
      range.setEnd(fragment.node, visibleLength);
      const rect = range.getBoundingClientRect();
      if (rect.height > 0) return rect;
    }
    remaining = Math.max(0, remaining - fragment.text.length);
  }

  const first = fragments.find((fragment) => fragment.node.textContent?.length);
  if (!first) return null;
  const range = document.createRange();
  range.selectNodeContents(first.node);
  return range.getBoundingClientRect();
}

function setSubtreeVisibility(element: HTMLElement, visible: boolean) {
  const value = visible ? "visible" : "hidden";
  element.style.setProperty("visibility", value, "important");
  element
    .querySelectorAll<HTMLElement>("*")
    .forEach((child) => child.style.setProperty("visibility", value, "important"));
}

function rectFromElement(element: HTMLElement): ViewportRect {
  const rect = element.getBoundingClientRect();
  return {
    left: rect.left,
    top: rect.top,
    width: rect.width,
    height: rect.height,
  };
}

function getBrandAnchor() {
  const brand = document.querySelector<HTMLElement>('header a[href="/"]');
  const rect = brand?.getBoundingClientRect();

  return rect
    ? { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 }
    : { x: window.innerWidth / 2, y: 36 };
}

function getTaskStart(task: ConstructionTask) {
  if (task.kind === "duplicate" && task.master) {
    const rect = task.master.mirror.getBoundingClientRect();
    return { x: rect.left, y: rect.top };
  }
  if (task.kind === "text") {
    const rect = getCaretRect(task.fragments, 0);
    if (rect) return { x: rect.left, y: rect.top + rect.height / 2 };
  }
  const rect = task.mirror.getBoundingClientRect();
  return { x: rect.left, y: rect.top };
}

function createSelection(task: ConstructionTask) {
  const selection = document.createElement("div");
  selection.setAttribute("data-build-selection", task.id);
  selection.setAttribute("aria-hidden", "true");
  selection.inert = true;
  selection.style.cssText =
    "position:fixed;box-sizing:border-box;pointer-events:none;z-index:101;border:1px dashed rgba(56,189,248,.95);background:rgba(56,189,248,.08);overflow:visible;";
  const measurement = document.createElement("span");
  measurement.style.cssText =
    "position:absolute;left:0;top:-20px;white-space:nowrap;padding:2px 4px;border-radius:3px;background:rgba(9,18,31,.92);color:#bae6fd;font:10px/1.2 ui-monospace,monospace;";
  selection.appendChild(measurement);
  return selection;
}

function updateSelection(task: ConstructionTask, progress: number) {
  if (!task.selection) return;
  const rect = task.mirror.getBoundingClientRect();
  const width = Math.max(0, rect.width * progress);
  const height = Math.max(0, rect.height * progress);
  task.selection.style.left = `${rect.left}px`;
  task.selection.style.top = `${rect.top}px`;
  task.selection.style.width = `${width}px`;
  task.selection.style.height = `${height}px`;
  const measurement = task.selection.firstElementChild;
  if (measurement) {
    measurement.textContent = `${Math.round(width)} × ${Math.round(height)}`;
    measurement.setAttribute("aria-hidden", "true");
  }
}

function updateCaret(task: ConstructionTask, progress: number) {
  if (!task.caret) return;
  const rect = getCaretRect(task.fragments, progress) ?? task.mirror.getBoundingClientRect();
  task.caret.style.left = `${rect.left}px`;
  task.caret.style.top = `${rect.top}px`;
  task.caret.style.height = `${Math.max(14, rect.height)}px`;
}

function setDuplicateText(task: ConstructionTask, progress: number) {
  if (!task.ghostFragments) return;
  task.ghostFragments.forEach((ghost, index) => {
    const destination = task.fragments[index];
    if (!destination || ghost.text === destination.text) return;
    const visibleLength = Math.floor(destination.text.length * clamp(progress, 0, 1));
    ghost.node.textContent = destination.text.slice(0, visibleLength);
  });
  if (progress >= 0.5 && task.ghost && task.mirror) {
    const sourceImages = task.mirror.querySelectorAll("img");
    const ghostImages = task.ghost.querySelectorAll("img");
    sourceImages.forEach((image, index) => {
      const ghostImage = ghostImages[index];
      if (ghostImage && ghostImage.getAttribute("src") !== image.getAttribute("src")) {
        ghostImage.setAttribute("src", image.getAttribute("src") ?? "");
        const srcSet = image.getAttribute("srcset");
        if (srcSet) ghostImage.setAttribute("srcset", srcSet);
        else ghostImage.removeAttribute("srcset");
      }
    });
  }
}

function completeRevealMotion(source: HTMLElement, mirror: HTMLElement) {
  if (source.style.opacity !== "0") return;
  mirror.style.setProperty("opacity", "1", "important");
  if (source.style.transform) {
    mirror.style.setProperty("transform", "none", "important");
  }
}

export default function ConstructionEngine() {
  const pathname = usePathname();
  const [activeCursors, setActiveCursors] = useState<ActiveCursor[]>([]);
  const [isRoaming, setIsRoaming] = useState(false);
  const [hasSnapshot, setHasSnapshot] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [isSkipped, setIsSkipped] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [phase, setPhase] = useState<ConstructionPhase>("INTRO_GATHER");
  const [pageProgress, setPageProgress] = useState(0);
  const [pipelineStats, setPipelineStats] = useState<PipelineStats>({
    working: 0,
    queued: 0,
    done: 0,
  });
  const [activityLog, setActivityLog] = useState<ActivityEntry[]>([]);

  const layerRef = useRef<HTMLDivElement | null>(null);
  const rootsRef = useRef<ReconstructionRoot[]>([]);
  const tasksRef = useRef<ConstructionTask[]>([]);
  const rafRef = useRef<number | null>(null);
  const replayTimerRef = useRef<number | null>(null);
  const nextAgentRef = useRef(0);
  const activityIdRef = useRef(0);
  const lastCursorUpdateRef = useRef(0);
  const isCompleteRef = useRef(false);
  const phaseRef = useRef<ConstructionPhase>("INTRO_GATHER");
  const scrollVelocityRef = useRef(0);
  const scrollVelocityAtRef = useRef(0);
  const lastScrollSamplesRef = useRef(
    new WeakMap<EventTarget, { position: number; time: number }>(),
  );
  const reducedMotionRef = useRef(false);
  const scheduleRef = useRef<() => void>(() => undefined);
  const activityRef = useRef<ActivityEntry[]>([]);

  const transitionPhase = useCallback((next: ConstructionPhase) => {
    if (phaseRef.current === next) return;
    phaseRef.current = next;
    setPhase(next);
  }, []);

  const restoreSnapshot = useCallback((updateState = true) => {
    for (const root of rootsRef.current) {
      if (root.visibility) {
        root.source.style.setProperty(
          "visibility",
          root.visibility,
          root.visibilityPriority,
        );
      } else {
        root.source.style.removeProperty("visibility");
      }
      root.mirror.remove();
    }

    for (const task of tasksRef.current) {
      task.ghost?.remove();
      task.selection?.remove();
      task.caret?.remove();
      task.ghost = null;
      task.ghostFragments = null;
      task.selection = null;
      task.caret = null;
    }
    rootsRef.current = [];
    if (updateState) setHasSnapshot(false);
  }, []);

  const buildSnapshot = useCallback(
    (previousTasks: ConstructionTask[], restart: boolean) => {
      const layer = layerRef.current;
      if (!layer) return;

      const previousBySource = new Map(
        previousTasks.map((task) => [task.source, task]),
      );
      restoreSnapshot(false);
      const allRoots = Array.from(
        document.querySelectorAll<HTMLElement>(ROOT_SELECTOR),
      );
      const roots = allRoots.filter(
        (root) => !root.parentElement?.closest(ROOT_SELECTOR),
      );
      const elementMap = new Map<HTMLElement, HTMLElement>();
      let rootOrder = 0;

      for (const source of roots) {
        if (source.closest("#construction-hud, #agent-activity-log")) continue;
        const mirror = source.cloneNode(true) as HTMLElement;
        const sourceElements = [
          source,
          ...Array.from(source.querySelectorAll<HTMLElement>("*")),
        ];
        const mirrorElements = [
          mirror,
          ...Array.from(mirror.querySelectorAll<HTMLElement>("*")),
        ];
        const rect = source.getBoundingClientRect();
        const sourceStyle = window.getComputedStyle(source);

        mirror.setAttribute("aria-hidden", "true");
        mirror.setAttribute("inert", "");
        mirror.style.setProperty("position", "fixed", "important");
        mirror.style.setProperty("top", `${rect.top}px`, "important");
        mirror.style.setProperty("left", `${rect.left}px`, "important");
        mirror.style.setProperty("right", "auto", "important");
        mirror.style.setProperty("bottom", "auto", "important");
        mirror.style.setProperty("width", `${rect.width}px`, "important");
        mirror.style.setProperty("height", `${rect.height}px`, "important");
        mirror.style.setProperty("margin", "0", "important");
        mirror.style.setProperty(
          "z-index",
          sourceStyle.zIndex === "auto"
            ? String(rootOrder++)
            : sourceStyle.zIndex,
          "important",
        );

        for (let index = 0; index < sourceElements.length; index += 1) {
          const original = sourceElements[index];
          const clone = mirrorElements[index];
          if (!(original instanceof HTMLElement) || !(clone instanceof HTMLElement)) {
            continue;
          }

          elementMap.set(original, clone);
          completeRevealMotion(original, clone);
          for (const attribute of MIRROR_EXCLUDED_ATTRIBUTES) {
            clone.removeAttribute(attribute);
          }
          clone.removeAttribute("data-construction-ignore");
          clone.setAttribute("aria-hidden", "true");
          clone.setAttribute("inert", "");
          if (clone !== mirror) {
            clone.style.setProperty("visibility", "hidden", "important");
          }
        }

        if (source.tagName.toLowerCase() === "header") {
          const brand = source.querySelector<HTMLElement>('a[href="/"]');
          const brandMirror = brand ? elementMap.get(brand) : undefined;
          if (brandMirror) setSubtreeVisibility(brandMirror, true);
        }

        layer.appendChild(mirror);
        rootsRef.current.push({
          source,
          mirror,
          visibility: source.style.getPropertyValue("visibility"),
          visibilityPriority: source.style.getPropertyPriority("visibility"),
        });
        source.style.setProperty("visibility", "hidden", "important");
      }

      const drafts = getTaskDrafts();
      const groupIndexes = new Map<HTMLElement, number>();
      const masterIndexes = new Map<string, number>();
      const duplicateMasterIndexes: Array<number | undefined> = [];
      drafts.forEach((draft, index) => {
        if (!draft.duplicateGroup) {
          duplicateMasterIndexes[index] = undefined;
          return;
        }
        let groupIndex = groupIndexes.get(draft.duplicateGroup);
        if (groupIndex === undefined) {
          groupIndex = groupIndexes.size;
          groupIndexes.set(draft.duplicateGroup, groupIndex);
        }
        const signature = `${groupIndex}:${getStructureSignature(draft.source)}`;
        const masterIndex = masterIndexes.get(signature);
        if (masterIndex === undefined) {
          masterIndexes.set(signature, index);
          duplicateMasterIndexes[index] = undefined;
        } else {
          duplicateMasterIndexes[index] = masterIndex;
        }
      });
      const taskIds = drafts.map(
        (draft, index) =>
          `${pathname.replace(/[^a-z0-9]+/gi, "-")}-${index}-${draft.source.tagName.toLowerCase()}`,
      );
      const nextTasks: ConstructionTask[] = drafts.map((draft, index) => {
        const mirror = elementMap.get(draft.source);
        if (!mirror) {
          throw new Error(
            `Construction snapshot is missing a mirror for ${draft.source.tagName.toLowerCase()}.`,
          );
        }

        const masterIndex = duplicateMasterIndexes[index];
        const duplicateOf =
          masterIndex === undefined ? undefined : drafts[masterIndex].source;
        const previous = restart ? undefined : previousBySource.get(draft.source);
        const kind =
          duplicateOf ? "duplicate" : getTaskKind(draft.source);
        const task: ConstructionTask = {
          id: taskIds[index],
          source: draft.source,
          mirror,
          label: getTaskLabel(draft.source),
          kind,
          duplicateOf:
            masterIndex === undefined ? undefined : taskIds[masterIndex],
          state:
            previous?.state === "done"
              ? "done"
              : previous?.elapsedMs
                ? "queued"
                : "idle",
          elapsedMs: previous?.elapsedMs ?? 0,
          durationMs: previous?.durationMs ?? 0,
          workerIds: [],
          lastTickAt: null,
          fragments: getTextFragments(mirror),
          ghostFragments: null,
          rect: rectFromElement(draft.source),
          ghost: null,
          selection: null,
          caret: null,
          travelStartedAt: null,
          travelOrigin: getBrandAnchor(),
          travelTarget: getBrandAnchor(),
        };
        mirror.setAttribute("data-build-id", task.id);
        mirror.setAttribute("data-build-kind", kind);
        mirror.setAttribute("data-build-state", task.state);
        mirror.setAttribute(
          "data-build-progress",
          task.state === "done"
            ? "1"
            : task.durationMs > 0
              ? getTaskProgress(
                  task.elapsedMs - CURSOR_TRAVEL_MS,
                  task.durationMs,
                ).toFixed(3)
              : "0",
        );
        if (task.state === "done") {
          setSubtreeVisibility(mirror, true);
          mirror.style.removeProperty("clip-path");
          setTextProgress(task.fragments, 1);
        }

        return task;
      });

      const tasksById = new Map(nextTasks.map((task) => [task.id, task]));
      for (const task of nextTasks) {
        if (task.duplicateOf) task.master = tasksById.get(task.duplicateOf);
      }
      tasksRef.current = nextTasks;
      setHasSnapshot(rootsRef.current.length > 0);
      setPageProgress(
        getConstructionProgress(
          nextTasks.filter((task) => task.state === "done").length,
          nextTasks.length,
        ),
      );
    },
    [pathname, restoreSnapshot],
  );

  const finishConstruction = useCallback(
    (skipped: boolean) => {
      if (isCompleteRef.current) return;
      isCompleteRef.current = true;
      if (replayTimerRef.current !== null) {
        window.clearTimeout(replayTimerRef.current);
        replayTimerRef.current = null;
      }
      tasksRef.current.forEach((task) => {
        task.state = "done";
        task.workerIds = [];
        task.lastTickAt = null;
        task.ghost?.remove();
        task.ghost = null;
      });
      restoreSnapshot();
      setPageProgress(100);
      setPipelineStats({
        working: 0,
        queued: 0,
        done: tasksRef.current.length,
      });
      setActiveCursors([]);
      setIsComplete(true);
      setIsSkipped(skipped);
      setIsRoaming(!skipped);
      transitionPhase(skipped ? "VIEWPORT_IDLE" : "FLOCK");
    },
    [restoreSnapshot, transitionPhase],
  );

  const addActivity = useCallback((text: string, color = ACTIVE_COLOR) => {
    activityRef.current = [
      { id: activityIdRef.current++, text, color },
      ...activityRef.current,
    ].slice(0, 5);
    setActivityLog(activityRef.current);
  }, []);

  const startDuplicateGhost = useCallback((task: ConstructionTask) => {
    if (!task.master || !layerRef.current) return;
    const masterRect = task.master.mirror.getBoundingClientRect();
    const ghost = task.master.mirror.cloneNode(true) as HTMLElement;

    ghost.removeAttribute("data-build-id");
    ghost.removeAttribute("data-build-state");
    ghost.removeAttribute("data-build-kind");
    ghost.setAttribute("data-build-ghost", "true");
    ghost.setAttribute("aria-hidden", "true");
    ghost.setAttribute("inert", "");
    ghost.style.setProperty("position", "fixed", "important");
    ghost.style.setProperty("top", `${masterRect.top}px`, "important");
    ghost.style.setProperty("left", `${masterRect.left}px`, "important");
    ghost.style.setProperty("right", "auto", "important");
    ghost.style.setProperty("bottom", "auto", "important");
    ghost.style.setProperty("width", `${masterRect.width}px`, "important");
    ghost.style.setProperty("height", `${masterRect.height}px`, "important");
    ghost.style.setProperty("margin", "0", "important");
    ghost.style.setProperty("z-index", "100", "important");
    ghost.style.setProperty("opacity", "0.94", "important");
    ghost.style.setProperty("pointer-events", "none", "important");
    ghost.style.setProperty("transform-origin", "top left", "important");
    layerRef.current.appendChild(ghost);
    task.ghost = ghost;
    task.ghostFragments = getTextFragments(ghost);
  }, []);

  const setTaskVisible = useCallback((task: ConstructionTask, progress: number) => {
    if (task.kind === "duplicate") {
      if (task.ghost && task.master) {
        const from = task.master.mirror.getBoundingClientRect();
        const to = task.mirror.getBoundingClientRect();
        const scaleX = from.width > 0 ? to.width / from.width : 1;
        const scaleY = from.height > 0 ? to.height / from.height : 1;
        const placementProgress = clamp(progress / DUPLICATE_EDIT_PROGRESS, 0, 1);
        task.ghost.style.setProperty(
          "transform",
          `translate3d(${(to.left - from.left) * placementProgress}px, ${(to.top - from.top) * placementProgress}px, 0) scale(${1 + (scaleX - 1) * placementProgress}, ${1 + (scaleY - 1) * placementProgress})`,
          "important",
        );
        if (progress >= DUPLICATE_EDIT_PROGRESS) {
          setDuplicateText(
            task,
            (progress - DUPLICATE_EDIT_PROGRESS) / (1 - DUPLICATE_EDIT_PROGRESS),
          );
        }
      }
      return;
    }

    if (task.kind === "text") {
      setSubtreeVisibility(task.mirror, true);
      task.mirror.style.removeProperty("clip-path");
      setTextProgress(task.fragments, progress);
      updateCaret(task, progress);
    } else if (task.kind === "component" || task.kind === "media") {
      if (progress < COMPONENT_DRAG_PROGRESS) {
        setSubtreeVisibility(task.mirror, false);
        updateSelection(task, progress / COMPONENT_DRAG_PROGRESS);
        return;
      }
      task.selection?.remove();
      task.selection = null;
      setSubtreeVisibility(task.mirror, true);
      const revealProgress =
        (progress - COMPONENT_DRAG_PROGRESS) / (1 - COMPONENT_DRAG_PROGRESS);
      task.mirror.style.setProperty(
        "clip-path",
        `inset(0 ${(1 - revealProgress) * 100}% 0 0)`,
        "important",
      );
    } else {
      setSubtreeVisibility(task.mirror, true);
      task.mirror.style.setProperty(
        "clip-path",
        `inset(0 ${(1 - progress) * 100}% 0 0)`,
        "important",
      );
    }
  }, []);

  const updateConstruction = useCallback(
    (now = performance.now()): boolean => {
      if (
        typeof window === "undefined" ||
        isCompleteRef.current ||
        reducedMotionRef.current ||
        document.querySelector(".splash-screen:not(.splash-screen--hide)")
      ) {
        return false;
      }

      for (const root of rootsRef.current) {
        const rect = root.source.getBoundingClientRect();
        root.mirror.style.setProperty("top", `${rect.top}px`, "important");
        root.mirror.style.setProperty("left", `${rect.left}px`, "important");
        root.mirror.style.setProperty("width", `${rect.width}px`, "important");
        root.mirror.style.setProperty("height", `${rect.height}px`, "important");
      }

      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      const viewportArea = viewportWidth * viewportHeight;
      const scrollAge = now - scrollVelocityAtRef.current;
      const viewportVelocity =
        scrollAge < 600
          ? scrollVelocityRef.current * (1 - scrollAge / 600)
          : 0;
      const visibleTasks = tasksRef.current.filter((task) => {
        task.rect = rectFromElement(task.source);
        return isWithinViewport(task.rect, viewportWidth, viewportHeight);
      });

      for (const task of tasksRef.current) {
        if (task.state === "working" && !visibleTasks.includes(task)) {
          // Mutable task records are kept in a ref to avoid React renders per animation frame.
          // eslint-disable-next-line react-hooks/immutability
          task.state = "queued";
          task.workerIds = [];
          task.lastTickAt = null;
          task.ghost?.remove();
          task.selection?.remove();
          task.caret?.remove();
          task.ghost = null;
          task.ghostFragments = null;
          task.selection = null;
          task.caret = null;
          task.travelStartedAt = null;
          task.mirror.setAttribute("data-build-state", "queued");
          task.mirror.removeAttribute("data-build-worker-ids");
          task.mirror.style.removeProperty("clip-path");
          setSubtreeVisibility(task.mirror, false);
        }
      }

      for (const task of visibleTasks) {
        if (task.state !== "working") continue;
        if (task.lastTickAt === null) task.lastTickAt = now;
        task.elapsedMs += clamp(now - task.lastTickAt, 0, 120);
        task.lastTickAt = now;
        const progress = getTaskProgress(
          task.elapsedMs - CURSOR_TRAVEL_MS,
          task.durationMs,
        );
        task.mirror.setAttribute("data-build-state", "working");
        task.mirror.setAttribute("data-build-progress", progress.toFixed(3));
        setTaskVisible(task, progress);

        if (progress >= 1) {
          task.state = "done";
          task.workerIds = [];
          task.lastTickAt = null;
          task.ghost?.remove();
          task.selection?.remove();
          task.caret?.remove();
          task.ghost = null;
          task.ghostFragments = null;
          task.selection = null;
          task.caret = null;
          task.travelStartedAt = null;
          task.mirror.setAttribute("data-build-state", "done");
          task.mirror.setAttribute("data-build-progress", "1");
          task.mirror.removeAttribute("data-build-worker-ids");
          task.mirror.style.removeProperty("clip-path");
          setSubtreeVisibility(task.mirror, true);
          setTextProgress(task.fragments, 1);
          addActivity(
            `${task.kind === "duplicate" ? "[COPY]" : "[DONE]"} ${task.label}`,
            "#34d399",
          );
        }
      }

      const completedTaskIds = new Set(
        tasksRef.current
          .filter((task) => task.state === "done")
          .map((task) => task.id),
      );
      const availableTasks = visibleTasks.filter(
        (task) => task.state !== "working",
      );
      const readyIds = new Set(
        getEligibleTasks(
          availableTasks.map((task) => ({
            ...task,
            dependencies: task.duplicateOf ? [task.duplicateOf] : [],
          })),
          viewportWidth,
          viewportHeight,
          completedTaskIds,
        ).map((task) => task.id),
      );
      const readyTasks = availableTasks.filter((task) => readyIds.has(task.id));
      const orderedTasks = spreadTasksAcrossViewport(
        readyTasks,
        viewportWidth,
        viewportHeight,
      );
      const busyAgentIds = getLeasedAgentIds(tasksRef.current);

      for (const task of orderedTasks) {
        const availableCount = MAX_ACTIVE_AGENTS - busyAgentIds.size;
        if (availableCount < 1) break;

        const demand = getTaskWorkerDemand(
          task.kind,
          task.rect.width * task.rect.height,
          task.fragments.reduce(
            (total, fragment) => total + fragment.text.length,
            0,
          ),
          viewportArea,
          viewportVelocity,
        );
        const workers = selectAvailableAgents(
          AGENT_POOL,
          busyAgentIds,
          Math.min(demand, availableCount),
          nextAgentRef.current,
        );
        if (workers.length === 0) break;

        task.state = "working";
        task.workerIds = workers.map((worker) => worker.id);
        task.lastTickAt = now;
        task.travelStartedAt = now;
        task.travelOrigin = getBrandAnchor();
        task.travelTarget = getTaskStart(task);
        task.durationMs =
          task.durationMs ||
          getTaskDuration(
            task.kind,
            task.rect.width * task.rect.height,
            viewportArea,
            workers.length,
          );
        workers.forEach((worker) => busyAgentIds.add(worker.id));
        nextAgentRef.current =
          (AGENT_POOL.findIndex(
            (agent) => agent.id === workers[workers.length - 1]?.id,
          ) +
            1) %
          AGENT_POOL.length;

        task.mirror.setAttribute("data-build-state", "working");
        task.mirror.setAttribute(
          "data-build-worker-ids",
          task.workerIds.join(" "),
        );
        if (task.kind === "duplicate") {
          startDuplicateGhost(task);
          addActivity(`[COPY] ${workers[0].name} placing ${task.label}`, "#a78bfa");
        } else {
          setSubtreeVisibility(task.mirror, false);
          if (task.kind === "component" || task.kind === "media") {
            task.selection = createSelection(task);
            layerRef.current?.appendChild(task.selection);
          } else if (task.kind === "text") {
            task.caret = document.createElement("div");
            task.caret.setAttribute("data-build-caret", task.id);
            task.caret.setAttribute("aria-hidden", "true");
            task.caret.inert = true;
            task.caret.style.cssText =
              "position:fixed;z-index:102;width:1.5px;height:16px;background:#e0f2fe;box-shadow:0 0 6px rgba(56,189,248,.8);pointer-events:none;animation:construction-caret-blink .9s steps(2,start) infinite;";
            layerRef.current?.appendChild(task.caret);
            setTextProgress(task.fragments, 0);
          }
          addActivity(`[BUILD] ${workers[0].name} working ${task.label}`, ACTIVE_COLOR);
        }
      }

      const workingTasks = tasksRef.current.filter(
        (task) => task.state === "working",
      );
      const workingCount = workingTasks.reduce(
        (total, task) => total + task.workerIds.length,
        0,
      );
      const queuedCount = visibleTasks.filter(
        (task) => task.state !== "working" && task.state !== "done",
      ).length;
      const doneCount = tasksRef.current.filter(
        (task) => task.state === "done",
      ).length;
      const progress = getConstructionProgress(doneCount, tasksRef.current.length);

      setPageProgress((previous) => (previous === progress ? previous : progress));
      setPipelineStats((previous) =>
        previous.working === workingCount &&
        previous.queued === queuedCount &&
        previous.done === doneCount
          ? previous
          : { working: workingCount, queued: queuedCount, done: doneCount },
      );

      const activeCursorsNext: ActiveCursor[] = [];
      for (const task of workingTasks) {
        const progress = getTaskProgress(
          task.elapsedMs - CURSOR_TRAVEL_MS,
          task.durationMs,
        );
        const rect = task.mirror.getBoundingClientRect();
        const taskStart = task.travelTarget;
        task.workerIds.forEach((id, index) => {
          const agent = AGENT_POOL.find((candidate) => candidate.id === id);
          if (!agent) return;
          const lane = (index + 1) / (task.workerIds.length + 1);
          let x = rect.left + rect.width * progress;
          let y = rect.top + rect.height * lane;
          if (task.kind === "text") {
            const caret = getCaretRect(task.fragments, progress);
            if (caret) {
              x = caret.left;
              y = caret.top + caret.height / 2;
            }
          } else if (task.kind === "line") {
            y = rect.top + rect.height / 2;
          } else if (task.kind === "duplicate" && task.master) {
            const masterRect = task.master.mirror.getBoundingClientRect();
            if (progress < DUPLICATE_EDIT_PROGRESS) {
              const placementProgress = clamp(
                progress / DUPLICATE_EDIT_PROGRESS,
                0,
                1,
              );
              const point = getCurvedTrajectoryPoint(
                masterRect.left,
                masterRect.top,
                rect.left,
                rect.top,
                placementProgress,
                index % 2 === 0 ? 1 : -1,
              );
              x = point.x;
              y = point.y;
            } else {
              x =
                rect.left +
                rect.width *
                  ((progress - DUPLICATE_EDIT_PROGRESS) /
                    (1 - DUPLICATE_EDIT_PROGRESS));
              y = rect.top + rect.height * lane;
            }
          } else if (task.kind === "component" || task.kind === "media") {
            if (progress < COMPONENT_DRAG_PROGRESS) {
              const dragProgress = progress / COMPONENT_DRAG_PROGRESS;
              x = rect.left + rect.width * dragProgress;
              y = rect.top + rect.height * dragProgress;
            } else {
              const revealProgress =
                (progress - COMPONENT_DRAG_PROGRESS) /
                (1 - COMPONENT_DRAG_PROGRESS);
              x = rect.left + rect.width * revealProgress;
            }
          }

          const travelProgress =
            task.travelStartedAt === null
              ? 1
              : clamp((now - task.travelStartedAt) / CURSOR_TRAVEL_MS, 0, 1);
          if (travelProgress < 1) {
            const easedTravel = 1 - (1 - travelProgress) ** 2;
            const travelPoint = getCurvedTrajectoryPoint(
              task.travelOrigin.x,
              task.travelOrigin.y,
              taskStart.x,
              taskStart.y,
              easedTravel,
              index % 2 === 0 ? 1 : -1,
            );
            x = travelPoint.x;
            y = travelPoint.y;
          }

          activeCursorsNext.push({
            agent,
            x: clamp(x, 2, Math.max(2, viewportWidth - 18)),
            y: clamp(y, 2, Math.max(2, viewportHeight - 18)),
            isPressed:
              (task.kind === "component" || task.kind === "media") &&
              progress > 0 &&
              progress < COMPONENT_DRAG_PROGRESS,
          });
        });
      }
      if (now - lastCursorUpdateRef.current > 32 || workingCount === 0) {
        lastCursorUpdateRef.current = now;
        setActiveCursors(activeCursorsNext);
      }

      const allTasksFinished =
        tasksRef.current.length > 0 && doneCount === tasksRef.current.length;
      if (allTasksFinished) {
        finishConstruction(false);
        return false;
      }

      const viewportComplete =
        visibleTasks.every((task) => task.state === "done") &&
        visibleTasks.length > 0;
      setIsRoaming(viewportComplete);
      if (viewportComplete) {
        transitionPhase("VIEWPORT_IDLE");
      } else if (workingCount === 0 && visibleTasks.length === 0) {
        transitionPhase("VIEWPORT_IDLE");
      } else if (workingCount > 0) {
        transitionPhase(
          workingTasks.some(
            (task) =>
              task.travelStartedAt !== null &&
              now - task.travelStartedAt < CURSOR_TRAVEL_MS,
          )
            ? "FAN_OUT"
            : "VIEWPORT_BUILD",
        );
      }
      return workingCount > 0;
    },
    [
      addActivity,
      finishConstruction,
      setTaskVisible,
      startDuplicateGhost,
      transitionPhase,
    ],
  );

  const scheduleAnimation = useCallback(() => {
    if (rafRef.current !== null || isCompleteRef.current) return;
    rafRef.current = window.requestAnimationFrame((time) => {
      rafRef.current = null;
      if (updateConstruction(time)) scheduleRef.current();
    });
  }, [updateConstruction]);
  useEffect(() => {
    scheduleRef.current = scheduleAnimation;
  }, [scheduleAnimation]);

  const skipConstruction = useCallback(() => {
    finishConstruction(true);
  }, [finishConstruction]);

  const replayConstruction = useCallback(() => {
    if (reducedMotionRef.current) return;
    isCompleteRef.current = false;
    setIsComplete(false);
    setIsSkipped(false);
    setIsRoaming(false);
    transitionPhase("INTRO_GATHER");
    setActiveCursors([]);
    setPipelineStats({ working: 0, queued: 0, done: 0 });
    nextAgentRef.current = 0;
    buildSnapshot([], true);
    const anchor = getBrandAnchor();
    setActiveCursors(
      AGENT_POOL.slice(0, 8).map((agent, index) => {
        const angle = (index / 8) * Math.PI * 2;
        return {
          agent,
          x: anchor.x + Math.cos(angle) * 18,
          y: anchor.y + Math.sin(angle) * 18,
        };
      }),
    );
    replayTimerRef.current = window.setTimeout(() => {
      replayTimerRef.current = null;
      if (isCompleteRef.current || reducedMotionRef.current) {
        setActiveCursors([]);
        return;
      }
      setActiveCursors([]);
      updateConstruction(performance.now());
      scheduleRef.current();
    }, 560);
  }, [buildSnapshot, transitionPhase, updateConstruction]);

  useEffect(() => {
    let disposed = false;
    let startTimer: number | null = null;
    let introTimer: number | null = null;
    let refreshFrame: number | null = null;
    let mutationObserver: MutationObserver | null = null;
    let splashObserver: MutationObserver | null = null;
    let stableTimer: number | null = null;
    let started = false;
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

    const refresh = (restart = false) => {
      if (
        disposed ||
        (isCompleteRef.current && !restart) ||
        document.querySelector(".splash-screen:not(.splash-screen--hide)")
      ) {
        return;
      }
      const previousTasks = tasksRef.current;
      isCompleteRef.current = false;
      setIsComplete(false);
      buildSnapshot(previousTasks, restart);
      updateConstruction(performance.now());
      scheduleRef.current();
    };

    const updateMotionPreference = (matches: boolean) => {
      reducedMotionRef.current = matches;
      setReducedMotion(matches);
      if (matches) {
        isCompleteRef.current = true;
        restoreSnapshot();
        setActiveCursors([]);
        setPipelineStats({
          working: 0,
          queued: 0,
          done: tasksRef.current.length,
        });
        setPageProgress(100);
        setIsComplete(true);
        setIsRoaming(false);
        transitionPhase("VIEWPORT_IDLE");
      } else if (isCompleteRef.current) {
        isCompleteRef.current = false;
        setIsComplete(false);
        refresh(true);
      }
    };

    const onMotionChange = (event: MediaQueryListEvent) =>
      updateMotionPreference(event.matches);

    const start = () => {
      if (disposed || started) return;
      scrollVelocityRef.current = 0;
      scrollVelocityAtRef.current = 0;
      lastScrollSamplesRef.current = new WeakMap();
      const initialScrollPosition =
        document.scrollingElement?.scrollTop ?? window.scrollY;
      const initialScrollSample = {
        position: initialScrollPosition,
        time: performance.now(),
      };
      lastScrollSamplesRef.current.set(document, initialScrollSample);
      lastScrollSamplesRef.current.set(window, initialScrollSample);
      if (startTimer !== null) {
        window.clearTimeout(startTimer);
        startTimer = null;
      }
      if (document.querySelector(".splash-screen:not(.splash-screen--hide)")) {
        if (!splashObserver) {
          splashObserver = new MutationObserver(() => {
            if (
              !document.querySelector(
                ".splash-screen:not(.splash-screen--hide)",
              )
            ) {
              splashObserver?.disconnect();
              splashObserver = null;
              start();
            }
          });
          const splash = document.querySelector(".splash-screen");
          if (splash) {
            splashObserver.observe(splash, {
              attributes: true,
              attributeFilter: ["class"],
            });
          }
        }
        startTimer = window.setTimeout(start, 700);
        return;
      }

      started = true;
      isCompleteRef.current = false;
      setIsComplete(false);
      setIsSkipped(false);
      setIsRoaming(false);
      setPageProgress(0);
      setPipelineStats({ working: 0, queued: 0, done: 0 });
      activityRef.current = [];
      setActivityLog([]);
      if (reducedMotionRef.current) {
        setActiveCursors([]);
        transitionPhase("VIEWPORT_IDLE");
        updateMotionPreference(true);
      } else {
        transitionPhase("INTRO_GATHER");
        buildSnapshot([], true);
        const anchor = getBrandAnchor();
        setActiveCursors(
          AGENT_POOL.slice(0, 8).map((agent, index) => {
            const angle = (index / 8) * Math.PI * 2;
            return {
              agent,
              x: anchor.x + Math.cos(angle) * 18,
              y: anchor.y + Math.sin(angle) * 18,
            };
          }),
        );
        introTimer = window.setTimeout(() => {
          introTimer = null;
          if (disposed || reducedMotionRef.current || isCompleteRef.current) {
            setActiveCursors([]);
            return;
          }
          setActiveCursors([]);
          transitionPhase("FAN_OUT");
          updateConstruction(performance.now());
          scheduleRef.current();
        }, 560);
      }

      mutationObserver = new MutationObserver((records) => {
        const changedPageContent = records.some((record) => {
          if (
            record.target instanceof Element &&
            record.target.closest(
              "#construction-hud, #agent-activity-log, .construction-reconstruction-layer",
            )
          ) {
            return false;
          }
          return (
            record.target instanceof Element &&
            Boolean(record.target.closest("header, main, footer"))
          );
        });
        if (changedPageContent && introTimer === null && refreshFrame === null) {
          refreshFrame = window.requestAnimationFrame(() => {
            refreshFrame = null;
            if (!disposed) refresh();
          });
        }
      });
      mutationObserver.observe(document.body, {
        childList: true,
        subtree: true,
      });

    };

    const onScroll = (event: Event) => {
      const target = event.target;
      const sampleTarget = target ?? window;
      const position =
        target instanceof HTMLElement
          ? target.scrollTop
          : document.scrollingElement?.scrollTop ?? window.scrollY;
      const now = performance.now();
      const previous = lastScrollSamplesRef.current.get(sampleTarget);
      if (previous && position !== previous.position) {
        const elapsed = Math.max(1, now - previous.time);
        scrollVelocityRef.current =
          (Math.abs(position - previous.position) / elapsed) *
          (1000 / Math.max(1, window.innerHeight));
        scrollVelocityAtRef.current = now;
      }
      lastScrollSamplesRef.current.set(sampleTarget, { position, time: now });
      scheduleRef.current();
    };
    const onWheel = (event: WheelEvent) => {
      const now = performance.now();
      const pagePosition =
        document.scrollingElement?.scrollTop ?? window.scrollY;
      const pageSample = { position: pagePosition, time: now };
      lastScrollSamplesRef.current.set(document, pageSample);
      lastScrollSamplesRef.current.set(window, pageSample);

      let scrollContainer =
        event.target instanceof HTMLElement
          ? event.target
          : event.target instanceof Element
            ? event.target.parentElement
            : null;
      while (scrollContainer && scrollContainer !== document.body) {
        const style = window.getComputedStyle(scrollContainer);
        if (
          scrollContainer.scrollHeight > scrollContainer.clientHeight &&
          /^(auto|overlay|scroll)$/.test(style.overflowY)
        ) {
          lastScrollSamplesRef.current.set(scrollContainer, {
            position: scrollContainer.scrollTop,
            time: now,
          });
          break;
        }
        scrollContainer = scrollContainer.parentElement;
      }
      scheduleRef.current();
    };
    const onResize = () => refresh();

    updateMotionPreference(mediaQuery.matches);
    mediaQuery.addEventListener("change", onMotionChange);
    window.addEventListener("scroll", onScroll, { passive: true });
    document.addEventListener("scroll", onScroll, {
      capture: true,
      passive: true,
    });
    window.addEventListener("wheel", onWheel, { passive: true });
    window.addEventListener("resize", onResize, { passive: true });

    const waitForStableLayout = async () => {
      await Promise.race([
        document.fonts?.ready ?? Promise.resolve(),
        new Promise<void>((resolve) => {
          stableTimer = window.setTimeout(resolve, MAX_SNAPSHOT_WAIT_MS);
        }),
      ]);
      if (stableTimer !== null) {
        window.clearTimeout(stableTimer);
        stableTimer = null;
      }
      if (disposed) return;
      start();
    };
    void waitForStableLayout();

    return () => {
      disposed = true;
      if (startTimer !== null) window.clearTimeout(startTimer);
      if (introTimer !== null) window.clearTimeout(introTimer);
      if (replayTimerRef.current !== null) {
        window.clearTimeout(replayTimerRef.current);
        replayTimerRef.current = null;
      }
      if (stableTimer !== null) window.clearTimeout(stableTimer);
      if (refreshFrame !== null) window.cancelAnimationFrame(refreshFrame);
      if (rafRef.current !== null) {
        window.cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
      mutationObserver?.disconnect();
      splashObserver?.disconnect();
      mediaQuery.removeEventListener("change", onMotionChange);
      window.removeEventListener("scroll", onScroll);
      document.removeEventListener("scroll", onScroll, true);
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("resize", onResize);
      restoreSnapshot(false);
      tasksRef.current = [];
      isCompleteRef.current = false;
    };
  }, [
    buildSnapshot,
    pathname,
    restoreSnapshot,
    transitionPhase,
    updateConstruction,
  ]);

  return (
    <>
      <div
        ref={layerRef}
        className="construction-reconstruction-layer fixed inset-0 z-[30] pointer-events-none"
        data-construction-phase={phase}
        style={{
          display: hasSnapshot && !isComplete && !reducedMotion ? "block" : "none",
          overflow: "visible",
        }}
        aria-hidden="true"
        inert
      />

      <SwarmCursorLayer
        cursors={activeCursors}
        isRoaming={isRoaming}
        isFlocking={isComplete && !isSkipped}
        reducedMotion={reducedMotion}
      />

      <div
        id="construction-hud"
        className="fixed bottom-5 left-4 z-50 select-none pointer-events-none sm:left-6"
      >
        <div className="construction-hud__panel pointer-events-auto flex max-w-[calc(100vw-2rem)] flex-wrap items-center gap-2 rounded-2xl border border-zinc-800/80 bg-zinc-950/90 px-3 py-2 text-[10px] font-mono text-zinc-300 shadow-2xl backdrop-blur-xl">
          <span className="font-bold text-white">SWARM BUILD</span>
          <span
            role="progressbar"
            aria-label="Website construction progress"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={pageProgress}
            className="text-cyan-300"
          >
            BUILD {pageProgress}%
          </span>
          <span className="text-emerald-300">WORK {pipelineStats.working}</span>
          <span className="text-amber-300">QUEUE {pipelineStats.queued}</span>
          <span className="text-sky-300">
            {isComplete ? (isSkipped ? "SKIPPED" : "COMPLETE") : `DONE ${pipelineStats.done}`}
          </span>
          <span className="text-zinc-500">{AGENT_POOL.length} AGENTS</span>
          <button
            type="button"
            onClick={skipConstruction}
            disabled={isComplete || reducedMotion}
            className="rounded-md border border-zinc-700 px-2 py-1 text-zinc-200 transition-colors hover:border-cyan-400 hover:text-white disabled:cursor-default disabled:opacity-50"
            aria-label="Skip website construction animation"
          >
            SKIP
          </button>
          <button
            type="button"
            onClick={replayConstruction}
            disabled={!isComplete || reducedMotion}
            className="rounded-md border border-cyan-500/40 px-2 py-1 text-cyan-200 transition-colors hover:border-cyan-300 hover:text-white disabled:cursor-default disabled:opacity-40"
            aria-label="Replay website construction animation"
          >
            REPLAY
          </button>
          {reducedMotion && (
            <span className="text-zinc-500" role="status">
              Reduced motion
            </span>
          )}
        </div>
      </div>

      {pipelineStats.working > 0 && (
        <div
          id="agent-activity-log"
          className="fixed bottom-5 right-4 z-50 w-[220px] select-none pointer-events-none sm:right-6 sm:w-[250px]"
          aria-hidden="true"
        >
          <div className="rounded-xl border border-zinc-800/80 bg-zinc-950/85 px-3 py-2.5 shadow-2xl backdrop-blur-xl">
            <div className="flex items-center justify-between gap-2 border-b border-zinc-800/70 pb-2">
              <span className="text-[10px] font-mono font-bold tracking-wide text-zinc-200">
                AGENT ACTIVITY
              </span>
              <span className="text-[9px] font-mono text-zinc-500">
                {AGENT_POOL.length} POOL
              </span>
            </div>
            <div className="space-y-1.5 pt-2">
              {activityLog.length === 0 ? (
                <div className="text-[9px] font-mono text-zinc-500">
                  Waiting for visible work...
                </div>
              ) : (
                activityLog.map((entry) => (
                  <div
                    key={entry.id}
                    className="flex items-start gap-1.5 text-[9px] font-mono leading-tight"
                  >
                    <span
                      className="mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full"
                      style={{ backgroundColor: entry.color }}
                    />
                    <span className="line-clamp-2 text-zinc-300">{entry.text}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
