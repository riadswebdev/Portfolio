"use client";

import { useEffect, useRef } from "react";
import type { AgentProfile } from "./agentPool";
import { AGENT_POOL } from "./agentPool";

interface CursorState {
  agent: AgentProfile;
  x: number;
  y: number;
  opacity?: number;
  isPressed?: boolean;
}

interface RoamingCursor extends CursorState {
  vx: number;
  vy: number;
  phase: number;
}

interface SwarmCursorLayerProps {
  cursors: CursorState[];
  isRoaming: boolean;
  isFlocking: boolean;
  reducedMotion: boolean;
}

const ROAMING_AGENTS = AGENT_POOL.filter((_, index) => index % 3 === 0);
const CURSOR_SIZE = 14;
const COLLISION_RADIUS = 24;
const MOUSE_RADIUS = 88;

function drawCursor(
  context: CanvasRenderingContext2D,
  cursor: CursorState,
  opacity = cursor.opacity ?? 1,
) {
  context.save();
  context.globalAlpha = opacity;
  context.translate(cursor.x, cursor.y);
  const scale = (CURSOR_SIZE / 24) * (cursor.isPressed ? 0.88 : 1);
  context.scale(scale, scale);
  context.beginPath();
  context.moveTo(3, 2);
  context.lineTo(19.5, 13.5);
  context.lineTo(12, 15);
  context.lineTo(9, 22);
  context.closePath();
  context.fillStyle = cursor.agent.color;
  context.strokeStyle = "#ffffff";
  context.lineWidth = 1.5;
  context.lineJoin = "round";
  context.fill();
  context.stroke();
  context.restore();
}

export default function SwarmCursorLayer({
  cursors,
  isRoaming,
  isFlocking,
  reducedMotion,
}: SwarmCursorLayerProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const activeCursorsRef = useRef(cursors);
  const hasCursors = cursors.length > 0;

  useEffect(() => {
    activeCursorsRef.current = cursors;
  }, [cursors]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    if (!canvas || !context || reducedMotion) return;

    let frameId = 0;
    let previousTime = 0;
    let lastPointerTime = 0;
    let mouseX = -1000;
    let mouseY = -1000;
    const activePositions = new Map<string, { x: number; y: number }>();
    const roamingStartTime = isRoaming ? performance.now() + 300 : 0;
    const roaming: RoamingCursor[] = ROAMING_AGENTS.map((agent, index) => ({
      agent,
      x: window.innerWidth * (0.12 + ((index * 0.173) % 0.76)),
      y: window.innerHeight * (0.16 + ((index * 0.227) % 0.66)),
      vx: Math.sin(index * 9.17) * 0.25,
      vy: Math.cos(index * 4.31) * 0.25,
      phase: index * 1.73,
    }));

    const resize = () => {
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(window.innerWidth * ratio);
      canvas.height = Math.round(window.innerHeight * ratio);
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
    };

    const onPointerMove = (event: PointerEvent) => {
      if (event.pointerType !== "mouse" || (!isRoaming && !isFlocking)) return;
      mouseX = event.clientX;
      mouseY = event.clientY;
      lastPointerTime = performance.now();
    };

    const onPointerLeave = () => {
      mouseX = -1000;
      mouseY = -1000;
      lastPointerTime = 0;
    };

    resize();
    window.addEventListener("resize", resize, { passive: true });
    window.addEventListener("pointermove", onPointerMove, { passive: true });
    window.addEventListener("pointerleave", onPointerLeave, { passive: true });

    const animate = (time: number) => {
      const dt = Math.min(32, previousTime ? time - previousTime : 16);
      previousTime = time;
      context.clearRect(0, 0, window.innerWidth, window.innerHeight);

      if (!isRoaming) {
        for (const cursor of activeCursorsRef.current) {
          const current = activePositions.get(cursor.agent.id) ?? cursor;
          const position = {
            x: current.x + (cursor.x - current.x) * 0.18,
            y: current.y + (cursor.y - current.y) * 0.18,
          };
          activePositions.set(cursor.agent.id, position);
          drawCursor(context, { ...cursor, ...position });
        }
        if (activeCursorsRef.current.length > 0) {
          frameId = window.requestAnimationFrame(animate);
        }
        return;
      }

      if (time >= roamingStartTime) {
        const seconds = time / 1000;
        const elapsed = dt / 16;
        const damping = Math.pow(0.965, elapsed);

        for (let index = 0; index < roaming.length; index += 1) {
          const cursor = roaming[index];
          const boundsX = Math.max(32, window.innerWidth - 32);
          const boundsY = Math.max(32, window.innerHeight - 32);
          const centerX =
            time - lastPointerTime < 1800
              ? mouseX
              : boundsX * (0.5 + 0.09 * Math.sin(seconds * 0.2));
          const centerY =
            time - lastPointerTime < 1800
              ? mouseY
              : boundsY * (0.5 + 0.09 * Math.cos(seconds * 0.18));
          const goalX = isFlocking
            ? centerX + 28 * Math.sin(seconds * 0.7 + cursor.phase)
            : boundsX * (0.5 + 0.39 * Math.sin(seconds * 0.19 + cursor.phase));
          const goalY = isFlocking
            ? centerY + 28 * Math.cos(seconds * 0.7 + cursor.phase * 1.3)
            : boundsY * (0.5 + 0.37 * Math.cos(seconds * 0.16 + cursor.phase * 1.3));
          cursor.vx += (goalX - cursor.x) * 0.00045 * elapsed;
          cursor.vy += (goalY - cursor.y) * 0.00045 * elapsed;

          if (!isFlocking && time - lastPointerTime < 1800) {
            const dx = cursor.x - mouseX;
            const dy = cursor.y - mouseY;
            const distance = Math.hypot(dx, dy);
            if (distance > 0 && distance < MOUSE_RADIUS) {
              const force = (1 - distance / MOUSE_RADIUS) * 1.6 * elapsed;
              cursor.vx += (dx / distance) * force;
              cursor.vy += (dy / distance) * force;
            }
          }

          for (let otherIndex = index + 1; otherIndex < roaming.length; otherIndex += 1) {
            const other = roaming[otherIndex];
            const dx = cursor.x - other.x;
            const dy = cursor.y - other.y;
            const distance = Math.hypot(dx, dy);
            if (distance > 0 && distance < COLLISION_RADIUS) {
              const force =
                ((COLLISION_RADIUS - distance) / COLLISION_RADIUS) * 0.7 * elapsed;
              cursor.vx += (dx / distance) * force;
              cursor.vy += (dy / distance) * force;
              other.vx -= (dx / distance) * force;
              other.vy -= (dy / distance) * force;
            }
          }

          cursor.vx *= damping;
          cursor.vy *= damping;
          const speed = Math.hypot(cursor.vx, cursor.vy);
          if (speed > 2.2) {
            cursor.vx = (cursor.vx / speed) * 2.2;
            cursor.vy = (cursor.vy / speed) * 2.2;
          }
          cursor.x += cursor.vx * elapsed;
          cursor.y += cursor.vy * elapsed;

          if (cursor.x < 16 || cursor.x > window.innerWidth - 16) {
            cursor.vx *= -0.75;
            cursor.x = Math.min(window.innerWidth - 16, Math.max(16, cursor.x));
          }
          if (cursor.y < 16 || cursor.y > window.innerHeight - 16) {
            cursor.vy *= -0.75;
            cursor.y = Math.min(window.innerHeight - 16, Math.max(16, cursor.y));
          }

          drawCursor(context, cursor, 0.78);
        }
      }

      frameId = window.requestAnimationFrame(animate);
    };

    if (isRoaming || hasCursors) {
      frameId = window.requestAnimationFrame(animate);
    }

    return () => {
      window.cancelAnimationFrame(frameId);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerleave", onPointerLeave);
      context.clearRect(0, 0, window.innerWidth, window.innerHeight);
    };
  }, [hasCursors, isFlocking, isRoaming, reducedMotion]);

  if (reducedMotion) return null;

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-[45] pointer-events-none"
      aria-hidden="true"
    />
  );
}
