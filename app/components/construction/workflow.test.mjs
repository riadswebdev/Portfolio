import test from "node:test";
import assert from "node:assert/strict";
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
} from "./workflow.ts";

test("worker demand scales with visible task complexity up to the 24-worker pool", () => {
  const viewportArea = 1440 * 900;
  assert.equal(getTaskWorkerDemand("text", 12000, 32, viewportArea), 1);
  assert.equal(getTaskWorkerDemand("text", 12000, 32, viewportArea, 0.5), 1);
  assert.ok(
    getTaskWorkerDemand("text", 12000, 32, viewportArea, 1.5) >
      getTaskWorkerDemand("text", 12000, 32, viewportArea),
  );
  assert.equal(getTaskWorkerDemand("line", 0, 0, viewportArea), 1);
  assert.ok(
    getTaskWorkerDemand("component", 480000, 32, viewportArea) >
      getTaskWorkerDemand("text", 12000, 32, viewportArea),
  );
  assert.equal(
    getTaskWorkerDemand("text", viewportArea * 100, 100000, viewportArea, 4),
    MAX_ACTIVE_AGENTS,
  );
  assert.equal(MAX_ACTIVE_AGENTS, 24);
});

test("worker leases are unique, bounded, and released when a task leaves the viewport", () => {
  const agents = Array.from({ length: MAX_ACTIVE_AGENTS }, (_, index) => ({
    id: `agent-${index}`,
  }));
  const firstLease = selectAvailableAgents(agents, new Set(), 6, 0);
  const busy = new Set(firstLease.map((agent) => agent.id));
  const secondLease = selectAvailableAgents(agents, busy, 8, 6);

  assert.equal(
    new Set([...firstLease, ...secondLease].map((agent) => agent.id)).size,
    firstLease.length + secondLease.length,
  );
  assert.equal(selectAvailableAgents(agents, busy, 6, 0).length, 6);
  assert.equal(
    selectAvailableAgents(agents, new Set(agents.map((agent) => agent.id)), 1, 0)
      .length,
    0,
  );
  assert.equal(selectAvailableAgents(agents, new Set(), 30, 0).length, 24);

  const task = { state: "working", workerIds: firstLease.map((agent) => agent.id) };
  assert.equal(getLeasedAgentIds([task]).size, firstLease.length);
  task.state = "queued";
  assert.equal(getLeasedAgentIds([task]).size, 0);
});

test("viewport eligibility excludes below-fold tasks and waits for dependencies", () => {
  const tasks = [
    { id: "top", rect: { left: 0, top: 0, width: 200, height: 100 } },
    { id: "below", rect: { left: 0, top: 800, width: 200, height: 100 } },
    {
      id: "copy",
      rect: { left: 250, top: 0, width: 200, height: 100 },
      dependencies: ["top"],
    },
  ];

  assert.deepEqual(
    getEligibleTasks(tasks, 800, 700, new Set()).map((task) => task.id),
    ["top"],
  );
  assert.deepEqual(
    getEligibleTasks(tasks, 800, 700, new Set(["top"])).map((task) => task.id),
    ["copy"],
  );
  assert.equal(
    isWithinViewport(tasks[1].rect, 800, 700, 120),
    true,
  );
});

test("spatial scheduling spreads simultaneous starts around the viewport", () => {
  const tasks = [
    { id: "top-left", rect: { left: 0, top: 0, width: 80, height: 80 } },
    { id: "top-right", rect: { left: 920, top: 0, width: 80, height: 80 } },
    { id: "bottom-left", rect: { left: 0, top: 620, width: 80, height: 80 } },
    { id: "bottom-right", rect: { left: 920, top: 620, width: 80, height: 80 } },
  ];
  const ordered = spreadTasksAcrossViewport(tasks, 1000, 700);

  assert.equal(new Set(ordered.map((task) => task.id)).size, tasks.length);
  const firstCenter = {
    x: ordered[0].rect.left + ordered[0].rect.width / 2,
    y: ordered[0].rect.top + ordered[0].rect.height / 2,
  };
  const secondCenter = {
    x: ordered[1].rect.left + ordered[1].rect.width / 2,
    y: ordered[1].rect.top + ordered[1].rect.height / 2,
  };
  assert.ok(Math.hypot(firstCenter.x - secondCenter.x, firstCenter.y - secondCenter.y) > 1000);
});

test("conditional task durations preserve real progress without fake completion", () => {
  const viewportArea = 1440 * 900;
  assert.ok(
    getTaskDuration("text", 10000, viewportArea, 1) >
      getTaskDuration("media", 10000, viewportArea, 1),
  );
  assert.ok(
    getTaskDuration("duplicate", 120000, viewportArea, 2) <
      getTaskDuration("component", 120000, viewportArea, 2),
  );
  assert.equal(getTaskDuration("line", 0, viewportArea, 1), 2500);
  assert.equal(getTaskProgress(0, 5000), 0);
  assert.equal(getTaskProgress(2500, 5000), 0.5);
  assert.equal(getTaskProgress(6000, 5000), 1);
  assert.equal(getConstructionProgress(3, 10), 30);
});
