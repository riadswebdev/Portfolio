import test from "node:test";
import assert from "node:assert/strict";
import {
  getDocumentScrollMetrics,
  getElementPerimeter,
  getPointOnElementPerimeter,
  getElementVertices,
  getCurvedTrajectoryPoint,
} from "./geometry.ts";

test("rounded rectangle perimeter includes four corner arcs", () => {
  const expected = 2 * (100 - 20) + 2 * (40 - 20) + 2 * Math.PI * 10;
  assert.ok(Math.abs(getElementPerimeter(100, 40, 10, false) - expected) < 1e-8);
});

test("rounded rectangle cursor starts at the SVG path origin and closes at 100%", () => {
  const start = getPointOnElementPerimeter(100, 40, 10, false, 0);
  const end = getPointOnElementPerimeter(100, 40, 10, false, 1);
  assert.deepEqual(start, { x: 10, y: 0 });
  assert.ok(Math.abs(end.x - start.x) < 1e-8);
  assert.ok(Math.abs(end.y - start.y) < 1e-8);
});

test("rounded rectangle cursor reaches the end of the top edge at its exact path fraction", () => {
  const perimeter = getElementPerimeter(100, 40, 10, false);
  const point = getPointOnElementPerimeter(100, 40, 10, false, 80 / perimeter);
  assert.ok(Math.abs(point.x - 90) < 1e-8);
  assert.ok(Math.abs(point.y) < 1e-8);
});

test("hexagon perimeter and cursor use the same six-segment path", () => {
  const expected = 4 * Math.hypot(50, 20) + 80;
  assert.ok(Math.abs(getElementPerimeter(100, 80, 0, true) - expected) < 1e-8);
  assert.deepEqual(getPointOnElementPerimeter(100, 80, 0, true, 0), { x: 50, y: 0 });
  assert.deepEqual(getPointOnElementPerimeter(100, 80, 0, true, 1), { x: 50, y: 0 });
});

test("document progress is 100% at the actual bottom within tolerance", () => {
  const middle = getDocumentScrollMetrics(400, 1000, 200);
  assert.equal(middle.progress, 50);
  assert.equal(middle.isAtBottom, false);

  const bottom = getDocumentScrollMetrics(798, 1000, 200, 2);
  assert.equal(bottom.progress, 100);
  assert.equal(bottom.isAtBottom, true);
});

test("document progress does not round to 100 before the bottom tolerance", () => {
  const nearBottom = getDocumentScrollMetrics(797, 1000, 200, 2);
  assert.equal(nearBottom.progress, 99);
  assert.equal(nearBottom.isAtBottom, false);
});

test("a non-scrollable document is considered fully reached", () => {
  const metrics = getDocumentScrollMetrics(0, 200, 200);
  assert.equal(metrics.progress, 100);
  assert.equal(metrics.isAtBottom, true);
});

test("element vertices provide anchor points for rectangle and hexagon", () => {
  const rectVertices = getElementVertices(200, 100, 0, false);
  assert.equal(rectVertices.length, 4);
  assert.deepEqual(rectVertices[0], { x: 200, y: 0, threshold: 100 / 600 });

  const hexVertices = getElementVertices(100, 80, 0, true);
  assert.equal(hexVertices.length, 6);
  assert.deepEqual(hexVertices[0], { x: 50, y: 0, threshold: 0 });
});

test("curved trajectory smoothly arcs away from linear path at midpoint", () => {
  const start = getCurvedTrajectoryPoint(0, 0, 100, 0, 0);
  const mid = getCurvedTrajectoryPoint(0, 0, 100, 0, 0.5, 1);
  const end = getCurvedTrajectoryPoint(0, 0, 100, 0, 1);

  assert.equal(start.x, 0);
  assert.equal(start.y, 0);
  assert.equal(mid.x, 50);
  assert.ok(Math.abs(mid.y) > 5, "midpoint should have perpendicular bend");
  assert.equal(end.x, 100);
  assert.ok(Math.abs(end.y) < 1e-10);
});
