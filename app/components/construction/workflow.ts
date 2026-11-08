export type BuildStage = "mark" | "make" | "paint" | "qa";
export type WorkflowState = "idle" | "queued" | BuildStage | "done";

export const STAGE_ORDER: BuildStage[] = ["mark", "make", "paint", "qa"];

/**
 * Deliberately time-based, not scroll-based. A block takes about 5.3 seconds
 * of visible work even if the visitor scrolls quickly.
 */
export const STAGE_DURATIONS: Record<BuildStage, number> = {
  mark: 900,
  make: 1600,
  paint: 1900,
  qa: 900,
};

export const TOTAL_WORKFLOW_DURATION = STAGE_ORDER.reduce(
  (total, stage) => total + STAGE_DURATIONS[stage],
  0,
);

export const AGENTS_PER_CREW = 4;
export const CREW_COUNT = 6;
export const MAX_ACTIVE_CREWS = 2;

const CREW_ROLE_AGENT_IDS: Record<BuildStage, string[]> = {
  mark: [
    "ui-elena",
    "ui-marco",
    "ui-aisha",
    "ui-kenji",
    "layout-lukas",
    "layout-chloe",
  ],
  make: [
    "fe-david",
    "fe-sophie",
    "fe-liam",
    "fe-priya",
    "content-oliver",
    "content-zara",
  ],
  paint: [
    "type-harper",
    "type-amara",
    "type-felix",
    "motion-maya",
    "motion-zack",
    "motion-nadia",
  ],
  qa: [
    "layout-mateo",
    "a11y-devon",
    "perf-sora",
    "qa-hannah",
    "qa-carlos",
    "lead-julian",
  ],
};

export type WorkflowSnapshot =
  | {
      stage: BuildStage;
      stageProgress: number;
      overallProgress: number;
      complete: false;
    }
  | {
      stage: "done";
      stageProgress: 1;
      overallProgress: 1;
      complete: true;
    };

const clamp01 = (value: number): number => Math.min(1, Math.max(0, value));

export function getWorkflowSnapshot(elapsedMs: number): WorkflowSnapshot {
  let remaining = Math.max(0, elapsedMs);
  let completedBefore = 0;

  for (const stage of STAGE_ORDER) {
    const duration = STAGE_DURATIONS[stage];

    if (remaining < duration) {
      const stageProgress = clamp01(remaining / duration);
      return {
        stage,
        stageProgress,
        overallProgress: clamp01(
          (completedBefore + remaining) / TOTAL_WORKFLOW_DURATION,
        ),
        complete: false,
      };
    }

    remaining -= duration;
    completedBefore += duration;
  }

  return {
    stage: "done",
    stageProgress: 1,
    overallProgress: 1,
    complete: true,
  };
}

export function getCrewAgentId(
  crewIndex: number,
  stage: BuildStage,
): string {
  const safeCrewIndex =
    ((Math.trunc(crewIndex) % CREW_COUNT) + CREW_COUNT) % CREW_COUNT;
  return CREW_ROLE_AGENT_IDS[stage][safeCrewIndex];
}

export function getCrewAgent<T extends { id: string }>(
  agents: T[],
  crewIndex: number,
  stage: BuildStage,
): T | undefined {
  const id = getCrewAgentId(crewIndex, stage);
  return agents.find((agent) => agent.id === id);
}

export function easeInOutCubic(value: number): number {
  const t = clamp01(value);
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

export function isWithinConstructionViewport(
  rect: Pick<DOMRect, "top" | "bottom">,
  viewportHeight: number,
): boolean {
  return rect.bottom > viewportHeight * 0.06 && rect.top < viewportHeight * 0.94;
}

export function getStageAction(stage: BuildStage): string {
  switch (stage) {
    case "mark":
      return "SELECT + LOCK";
    case "make":
      return "PLACE CONTENT";
    case "paint":
      return "PIXEL FILL";
    case "qa":
      return "VISUAL REVIEW";
  }
}
