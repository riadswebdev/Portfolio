"use client";

import { useEffect, useRef } from "react";

interface FrameScrollAnimationProps {
  totalFrames?: number;
  folderPath?: string;
  filePrefix?: string;
  fileExtension?: string;
  className?: string;
  containerHeight?: string;
  children?: React.ReactNode;
  backgroundMode?: boolean;
}

// Build the explicit list of available frame numbers.
// Frames 101-107 were deleted — skip them to prevent 404s and blank canvas.
function buildFrameList(): number[] {
  const frames: number[] = [];
  for (let i = 1; i <= 100; i++) frames.push(i);
  for (let i = 108; i <= 223; i++) frames.push(i);
  return frames; // 216 frames total
}

const FRAME_LIST = buildFrameList();
const TOTAL_AVAILABLE = FRAME_LIST.length; // 216

export default function FrameScrollAnimation({
  totalFrames = TOTAL_AVAILABLE,
  folderPath = "/frame",
  filePrefix = "ezgif-frame-",
  fileExtension = "png",
  className = "",
  containerHeight = "h-[400vh]",
  children,
  backgroundMode = false,
}: FrameScrollAnimationProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const imagesRef = useRef<(HTMLImageElement | null)[]>([]);

  // ── Progressive preload ──────────────────────────────────────────────────
  // Mobile browsers crash when 200MB+ loads simultaneously.
  // Load a small initial batch immediately, then stream the rest in chunks.
  useEffect(() => {
    let isMounted = true;
    const count = Math.min(totalFrames, TOTAL_AVAILABLE);
    const loaded: (HTMLImageElement | null)[] = new Array(count).fill(null);
    imagesRef.current = loaded;

    const isMobile = typeof window !== "undefined" && window.innerWidth < 768;
    const INITIAL_BATCH = isMobile ? 20 : 40;
    const BATCH_SIZE    = isMobile ? 8  : 20;
    const BATCH_DELAY   = isMobile ? 80 : 30; // ms between batches

    let batchStart = INITIAL_BATCH;

    // Load first batch right away so the canvas has something to draw.
    for (let i = 0; i < Math.min(INITIAL_BATCH, count); i++) {
      const frameNum = String(FRAME_LIST[i]).padStart(3, "0");
      const img = new Image();
      img.src = `${folderPath}/${filePrefix}${frameNum}.${fileExtension}`;
      img.onerror = () => { loaded[i] = null; };
      img.onload  = () => { loaded[i] = img; };
      loaded[i] = img;
    }

    const loadNextBatch = () => {
      if (!isMounted || batchStart >= count) return;
      const end = Math.min(batchStart + BATCH_SIZE, count);
      for (let i = batchStart; i < end; i++) {
        const frameNum = String(FRAME_LIST[i]).padStart(3, "0");
        const img = new Image();
        img.src = `${folderPath}/${filePrefix}${frameNum}.${fileExtension}`;
        img.onerror = () => { loaded[i] = null; };
        img.onload  = () => { loaded[i] = img; };
        loaded[i] = img;
      }
      batchStart = end;
      if (batchStart < count) setTimeout(loadNextBatch, BATCH_DELAY);
    };

    setTimeout(loadNextBatch, BATCH_DELAY);
    return () => { isMounted = false; };
  }, [totalFrames, folderPath, filePrefix, fileExtension, backgroundMode]);

  // ── Render loop ──────────────────────────────────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let targetFrame = 0;
    let currentFrame = 0;
    let lastDrawnIndex = -1;

    // For a fixed canvas (backgroundMode), getBoundingClientRect() returns 0×0
    // before first paint on mobile — use window dimensions directly.
    const resizeCanvas = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2); // cap at 2× for perf
      if (backgroundMode) {
        canvas.width  = window.innerWidth  * dpr;
        canvas.height = window.innerHeight * dpr;
      } else {
        const rect = canvas.getBoundingClientRect();
        canvas.width  = (rect.width  || window.innerWidth)  * dpr;
        canvas.height = (rect.height || window.innerHeight) * dpr;
      }
      ctx.scale(dpr, dpr);
      lastDrawnIndex = -1; // force redraw after resize
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    const drawFrame = (frameIndex: number) => {
      const images = imagesRef.current;
      let img: HTMLImageElement | null = images[frameIndex] ?? null;

      // If this frame is missing/unloaded, walk outward to find the nearest
      // valid neighbour — prevents blank canvas at deleted-frame positions.
      if (!img || !img.complete || img.naturalWidth === 0) {
        let found = false;
        for (let delta = 1; delta < 8; delta++) {
          const prev = images[frameIndex - delta];
          if (prev && prev.complete && prev.naturalWidth > 0) { img = prev; found = true; break; }
          const next = images[frameIndex + delta];
          if (next && next.complete && next.naturalWidth > 0) { img = next; found = true; break; }
        }
        if (!found) return;
      }

      const dpr      = Math.min(window.devicePixelRatio || 1, 2);
      const logicalW = backgroundMode ? window.innerWidth  : canvas.width  / dpr;
      const logicalH = backgroundMode ? window.innerHeight : canvas.height / dpr;

      ctx.clearRect(0, 0, logicalW, logicalH);

      const imgAspect    = img!.naturalWidth / img!.naturalHeight;
      const canvasAspect = logicalW / logicalH;

      let drawWidth = logicalW, drawHeight = logicalH, offsetX = 0, offsetY = 0;

      if (canvasAspect > imgAspect) {
        drawHeight = logicalW / imgAspect;
        offsetY    = (logicalH - drawHeight) / 2;
      } else {
        drawWidth = logicalH * imgAspect;
        offsetX   = (logicalW - drawWidth) / 2;
      }

      ctx.drawImage(img!, offsetX, offsetY, drawWidth, drawHeight);
    };

    const effectiveFrames = Math.min(totalFrames, TOTAL_AVAILABLE);

    const updateScrollProgress = () => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const scrollableDistance = rect.height - window.innerHeight;
      if (scrollableDistance <= 0) return;
      const progress = Math.min(Math.max(-rect.top / scrollableDistance, 0), 1);
      targetFrame = Math.floor(progress * (effectiveFrames - 1));
    };

    const updateBgProgress = () => {
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      if (maxScroll <= 0) return;
      const progress = Math.min(Math.max(window.scrollY / maxScroll, 0), 1);
      targetFrame = Math.floor(progress * (effectiveFrames - 1));
    };

    if (backgroundMode) {
      updateBgProgress();
      window.addEventListener("scroll", updateBgProgress, { passive: true });
    } else {
      updateScrollProgress();
      window.addEventListener("scroll", updateScrollProgress, { passive: true });
    }

    // Slightly higher lerp on mobile prevents permanent lag on low-FPS devices.
    const isMobile = window.innerWidth < 768;
    const LERP = isMobile ? 0.18 : 0.12;

    const render = () => {
      currentFrame += (targetFrame - currentFrame) * LERP;
      const safeIndex = Math.min(Math.max(Math.round(currentFrame), 0), effectiveFrames - 1);
      // Only redraw when index actually changes — saves GPU work on mobile.
      if (safeIndex !== lastDrawnIndex) {
        drawFrame(safeIndex);
        lastDrawnIndex = safeIndex;
      }
      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      if (backgroundMode) {
        window.removeEventListener("scroll", updateBgProgress);
      } else {
        window.removeEventListener("scroll", updateScrollProgress);
      }
      cancelAnimationFrame(animationFrameId);
    };
  }, [totalFrames, backgroundMode]);

  if (backgroundMode) {
    return (
      <canvas
        ref={canvasRef}
        style={{ width: "100vw", height: "100vh" }}
        className="fixed inset-0 -z-10 pointer-events-none"
      />
    );
  }

  return (
    <div ref={containerRef} className={`relative ${containerHeight} ${className}`}>
      <div className="sticky top-0 h-screen w-full overflow-hidden flex items-center justify-center">
        <canvas ref={canvasRef} className="block w-full h-full object-cover" />
        {children && (
          <div className="absolute inset-0 pointer-events-none z-10 flex flex-col justify-between">
            {children}
          </div>
        )}
      </div>
    </div>
  );
}