export type ConstructionTaskKind =
  | "text"
  | "component"
  | "media"
  | "line"
  | "duplicate";

export interface ViewportRect {
  left: number;
  top: number;
  width: number;
  height: number;
}

export interface SchedulableTask {
  id: string;
  rect: ViewportRect;
  dependencies?: string[];
}

export const MAX_ACTIVE_AGENTS = 24;

const BASE_TASK_DURATIONS: Record<ConstructionTaskKind, number> = {
  text: 4800,
  component: 3900,
  media: 2800,
  line: 2500,
  duplicate: 2900,
};

const clamp = (value: number, min: number, max: number): number =>
  Math.min(Math.max(value, min), max);

export function getTaskWorkerDemand(
  kind: ConstructionTaskKind,
  area: number,
  textLength: number,
  viewportArea: number,
  viewportVelocity = 0,
): number {
  const baseDemand =
    kind === "component" || kind === "duplicate" || kind === "media" ? 2 : 1;
  const areaDemand =
    viewportArea > 0 ? Math.sqrt(Math.max(0, area) / viewportArea) * 2 : 0;
  const textDemand =
    kind === "text" ? Math.max(0, textLength - 80) / 180 : 0;
  const velocityDemand = Math.min(
    4,
    Math.floor(Math.max(0, viewportVelocity) * 1.5),
  );

  return Math.min(
    MAX_ACTIVE_AGENTS,
    Math.max(
      1,
      Math.floor(baseDemand + areaDemand + textDemand) + velocityDemand,
    ),
  );
}

export function selectAvailableAgents<T extends { id: string }>(
  agents: T[],
  busyAgentIds: ReadonlySet<string>,
  count: number,
  startIndex: number,
): T[] {
  if (agents.length === 0 || count <= 0) return [];

  const available: T[] = [];
  const offset =
    ((Math.trunc(startIndex) % agents.length) + agents.length) % agents.length;

  for (let step = 0; step < agents.length && available.length < count; step += 1) {
    const agent = agents[(offset + step) % agents.length];
    if (!busyAgentIds.has(agent.id)) available.push(agent);
  }

  return available;
}

export function getLeasedAgentIds(
  tasks: Array<{ state: string; workerIds: readonly string[] }>,
): Set<string> {
  return new Set(
    tasks
      .filter((task) => task.state === "working")
      .flatMap((task) => task.workerIds),
  );
}

export function getTaskDuration(
  kind: ConstructionTaskKind,
  area: number,
  viewportArea: number,
  workerCount: number,
): number {
  const areaScale =
    viewportArea > 0
      ? clamp(Math.sqrt(Math.max(0, area) / viewportArea) * 0.3, 0, 0.4)
      : 0;
  const collaborationScale =
    1 + Math.min(0.3, Math.max(0, workerCount - 1) * 0.06);

  return Math.round(
    (BASE_TASK_DURATIONS[kind] * (1 + areaScale)) / collaborationScale,
  );
}

export function getTaskProgress(elapsedMs: number, durationMs: number): number {
  if (durationMs <= 0) return 1;
  return clamp(elapsedMs / durationMs, 0, 1);
}

export function isWithinViewport(
  rect: Pick<ViewportRect, "left" | "top" | "width" | "height">,
  viewportWidth: number,
  viewportHeight: number,
  margin = 0,
): boolean {
  return (
    rect.left + rect.width > -margin &&
    rect.left < viewportWidth + margin &&
    rect.top + rect.height > -margin &&
    rect.top < viewportHeight + margin
  );
}

export function getEligibleTasks<T extends SchedulableTask>(
  tasks: T[],
  viewportWidth: number,
  viewportHeight: number,
  completedTaskIds: ReadonlySet<string>,
  margin = 0,
): T[] {
  return tasks.filter(
    (task) =>
      !completedTaskIds.has(task.id) &&
      isWithinViewport(task.rect, viewportWidth, viewportHeight, margin) &&
      (task.dependencies ?? []).every((dependency) =>
        completedTaskIds.has(dependency),
      ),
  );
}

export function spreadTasksAcrossViewport<T extends SchedulableTask>(
  tasks: T[],
  viewportWidth: number,
  viewportHeight: number,
): T[] {
  if (tasks.length < 3) return [...tasks];

  const remaining = [...tasks];
  const ordered: T[] = [];
  const viewportCenter = { x: viewportWidth / 2, y: viewportHeight / 2 };
  const firstIndex = remaining.reduce(
    (bestIndex, task, index) => {
      const current = remaining[bestIndex];
      const center = {
        x: task.rect.left + task.rect.width / 2,
        y: task.rect.top + task.rect.height / 2,
      };
      const bestCenter = {
        x: current.rect.left + current.rect.width / 2,
        y: current.rect.top + current.rect.height / 2,
      };
      const distance = Math.hypot(
        center.x - viewportCenter.x,
        center.y - viewportCenter.y,
      );
      const bestDistance = Math.hypot(
        bestCenter.x - viewportCenter.x,
        bestCenter.y - viewportCenter.y,
      );
      return distance < bestDistance ? index : bestIndex;
    },
    0,
  );

  ordered.push(remaining.splice(firstIndex, 1)[0]);

  while (remaining.length > 0) {
    const nextIndex = remaining.reduce(
      (bestIndex, task, index) => {
        const center = {
          x: task.rect.left + task.rect.width / 2,
          y: task.rect.top + task.rect.height / 2,
        };
        const bestCenter = {
          x:
            remaining[bestIndex].rect.left +
            remaining[bestIndex].rect.width / 2,
          y:
            remaining[bestIndex].rect.top +
            remaining[bestIndex].rect.height / 2,
        };
        const nearestDistance = Math.min(
          ...ordered.map((placed) =>
            Math.hypot(
              center.x - (placed.rect.left + placed.rect.width / 2),
              center.y - (placed.rect.top + placed.rect.height / 2),
            ),
          ),
        );
        const bestNearestDistance = Math.min(
          ...ordered.map((placed) =>
            Math.hypot(
              bestCenter.x - (placed.rect.left + placed.rect.width / 2),
              bestCenter.y - (placed.rect.top + placed.rect.height / 2),
            ),
          ),
        );
        return nearestDistance > bestNearestDistance ? index : bestIndex;
      },
      0,
    );

    ordered.push(remaining.splice(nextIndex, 1)[0]);
  }

  return ordered;
}

export function getConstructionProgress(
  completedTasks: number,
  totalTasks: number,
): number {
  if (totalTasks <= 0) return 0;
  return Math.round((Math.min(completedTasks, totalTasks) / totalTasks) * 100);
}
