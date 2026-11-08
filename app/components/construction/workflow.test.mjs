import test from "node:test";
import assert from "node:assert/strict";
import {
  CREW_COUNT,
  getCrewAgentId,
  getWorkflowSnapshot,
  STAGE_DURATIONS,
  TOTAL_WORKFLOW_DURATION,
} from "./workflow.ts";
import {
  getSignatureStrokeLength,
  getSignatureStrokePoint,
  SIGNATURE_STROKES,
} from "./signaturePaths.ts";

test("a block starts with MARK and does not progress from scroll position", () => {
  assert.equal(getWorkflowSnapshot(0).stage, "mark");
  assert.equal(getWorkflowSnapshot(400).stage, "mark");
  assert.equal(getWorkflowSnapshot(899).stage, "mark");
  assert.equal(getWorkflowSnapshot(900).stage, "make");
});

test("each visible block has a deliberate multi-second four-stage workflow", () => {
  assert.equal(TOTAL_WORKFLOW_DURATION, 5300);
  assert.deepEqual(
    Object.values(STAGE_DURATIONS),
    [900, 1600, 1900, 900],
  );
  assert.equal(getWorkflowSnapshot(2499).stage, "make");
  assert.equal(getWorkflowSnapshot(2500).stage, "paint");
  assert.equal(getWorkflowSnapshot(4400).stage, "qa");
  assert.equal(getWorkflowSnapshot(5300).complete, true);
});

test("six crews each receive one distinct agent for MARK, MAKE, PAINT and QA", () => {
  assert.equal(CREW_COUNT, 6);
  const allIds = [];
  for (let crew = 0; crew < CREW_COUNT; crew += 1) {
    allIds.push(
      getCrewAgentId(crew, "mark"),
      getCrewAgentId(crew, "make"),
      getCrewAgentId(crew, "paint"),
      getCrewAgentId(crew, "qa"),
    );
  }
  assert.equal(new Set(allIds).size, 24);
  assert.equal(allIds.length, 24);
});

test("crew assignment wraps deterministically without changing role", () => {
  assert.equal(getCrewAgentId(0, "mark"), getCrewAgentId(6, "mark"));
  assert.equal(getCrewAgentId(2, "paint"), getCrewAgentId(8, "paint"));
  assert.notEqual(getCrewAgentId(0, "mark"), getCrewAgentId(0, "make"));
});

test("the RIAD signature is composed of exactly 24 independent cursor strokes", () => {
  assert.equal(SIGNATURE_STROKES.length, 24);
  assert.ok(SIGNATURE_STROKES.every((stroke) => stroke.points.length >= 2));
  assert.ok(SIGNATURE_STROKES.every((_, index) => getSignatureStrokeLength(index) > 0));
});

test("each cursor starts and ends on its own signature path", () => {
  SIGNATURE_STROKES.forEach((stroke, index) => {
    assert.deepEqual(getSignatureStrokePoint(index, 0), stroke.points[0]);
    assert.deepEqual(
      getSignatureStrokePoint(index, 1),
      stroke.points[stroke.points.length - 1],
    );
  });
});
