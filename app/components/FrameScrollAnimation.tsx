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
  frameNumbers?: number[];
}

// Build the default sequence for the shared home animation.
// Some folders intentionally skip missing frames, but route-specific folders can
// override this with their exact file list to avoid 404s.
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
  folderPath = "/home-scroll-animation",
  filePrefix = "ezgif-frame-",
  fileExtension = "webp",
  className = "",
  containerHeight = "h-[400vh]",
  children,
  backgroundMode = false,
  frameNumbers,
}: FrameScrollAnimationProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const imagesRef = useRef<(HTMLImageElement | null)[]>([]);
  const loadingRef = useRef<Set<number>>(new Set());
  const queuedRef = useRef<Set<number>>(new Set());
  const queueRef = useRef<number[]>([]);
  const cacheOrderRef = useRef<number[]>([]);
  const scheduledLoadRef = useRef<number | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const targetFrameRef = useRef(0);
  const currentFrameRef = useRef(0);
  const lastDrawnIndexRef = useRef(-1);
  const isMountedRef = useRef(false);
  const isTabVisibleRef = useRef(true);
  const isIntersectingRef = useRef(true);
  const resizeRafRef = useRef<number | null>(null);
  const backgroundScheduledRef = useRef<number | null>(null);
  const scrollRafRef = useRef<number | null>(null);
  const reducedMotionRef = useRef(false);

  const resolvedFrameNumbers = frameNumbers?.length ? frameNumbers : FRAME_LIST;
  const count = Math.min(totalFrames, resolvedFrameNumbers.length);
  const MAX_CACHE_FRAMES = Math.min(count, 100);
  const PRIORITY_RADIUS = 24;
  const MAX_CONCURRENT_LOADS = 5;
  const BACKGROUND_BATCH_DELAY = 120;
  const BACKGROUND_PRELOAD_BATCH_SIZE = 32; // number of frames to enqueue per background chunk

  const getFrameSrc = (index: number) => {
    const frameNum = String(resolvedFrameNumbers[index]).padStart(3, "0");
    return `${folderPath}/${filePrefix}${frameNum}.${fileExtension}`;
  };

  const enqueueFrame = (index: number, priority = false) => {
    if (index < 0 || index >= count) return;
    if (
      imagesRef.current[index] ||
      loadingRef.current.has(index) ||
      queuedRef.current.has(index)
    )
      return;

    if (priority) {
      queueRef.current.unshift(index);
    } else {
      queueRef.current.push(index);
    }
    queuedRef.current.add(index);
  };

  const enqueueFramesNear = (center: number, radius: number) => {
    const start = Math.max(0, center - radius);
    const end = Math.min(count - 1, center + radius);
    for (let i = start; i <= end; i++) {
      enqueueFrame(i, true);
    }
  };

  const enqueueDistanceOrderedFrames = (center: number) => {
    // Enqueue a small initial set immediately, then defer the rest to background chunks.
    const deferred: number[] = [];
    for (let distance = 0; distance < count; distance++) {
      const low = center - distance;
      const high = center + distance;
      if (low >= 0) {
        if (queueRef.current.length < BACKGROUND_PRELOAD_BATCH_SIZE)
          enqueueFrame(low);
        else deferred.push(low);
      }
      if (high < count && high !== low) {
        if (queueRef.current.length < BACKGROUND_PRELOAD_BATCH_SIZE)
          enqueueFrame(high);
        else deferred.push(high);
      }
    }
    // Store deferred frames for background enqueuing
    backgroundFramesRef.current = deferred;
  };

  const backgroundFramesRef = useRef<number[]>([]);

  const enqueueBackgroundChunk = () => {
    if (
      !isMountedRef.current ||
      !isTabVisibleRef.current ||
      !isIntersectingRef.current ||
      backgroundFramesRef.current.length === 0
    )
      return;

    const chunk = backgroundFramesRef.current.splice(
      0,
      BACKGROUND_PRELOAD_BATCH_SIZE,
    );
    for (const idx of chunk) enqueueFrame(idx);
    scheduleLoadQueue();
    if (backgroundFramesRef.current.length > 0) {
      backgroundScheduledRef.current = window.setTimeout(
        enqueueBackgroundChunk,
        BACKGROUND_BATCH_DELAY,
      );
    }
  };

  const pruneCache = () => {
    const currentIdx = currentFrameRef.current;
    while (cacheOrderRef.current.length > MAX_CACHE_FRAMES) {
      const oldest = cacheOrderRef.current.shift();
      if (oldest === undefined) break;
      if (Math.abs(oldest - currentIdx) <= PRIORITY_RADIUS) {
        cacheOrderRef.current.push(oldest);
        continue;
      }
      imagesRef.current[oldest] = null;
    }
  };

  const recordLoadedFrame = (index: number) => {
    if (!cacheOrderRef.current.includes(index)) {
      cacheOrderRef.current.push(index);
    }
    pruneCache();
  };

  const loadFrame = (index: number) => {
    if (index < 0 || index >= count) return;
    if (imagesRef.current[index] || loadingRef.current.has(index)) {
      queuedRef.current.delete(index);
      return;
    }

    loadingRef.current.add(index);
    queuedRef.current.delete(index);

    const img = new Image();
    img.decoding = "async";
    img.src = getFrameSrc(index);

    const finalize = () => {
      loadingRef.current.delete(index);
      recordLoadedFrame(index);
      if (animationFrameRef.current === null) {
        startRenderLoop();
      }
    };

    img.onload = async () => {
      if (!isMountedRef.current) return;
      try {
        if (img.decode) {
          await img.decode();
        }
      } catch {
        // ignore decode failures and still use the image
      }
      imagesRef.current[index] = img;
      finalize();
    };

    img.onerror = () => {
      loadingRef.current.delete(index);
      imagesRef.current[index] = null;
      finalize();
    };
  };

  const processLoadQueue = () => {
    scheduledLoadRef.current = null;
    if (
      !isMountedRef.current ||
      !isTabVisibleRef.current ||
      !isIntersectingRef.current
    ) {
      return;
    }

    while (
      loadingRef.current.size < MAX_CONCURRENT_LOADS &&
      queueRef.current.length > 0
    ) {
      const next = queueRef.current.shift();
      if (next === undefined) break;
      queuedRef.current.delete(next);
      loadFrame(next);
    }

    if (queueRef.current.length > 0) {
      scheduledLoadRef.current = window.setTimeout(
        processLoadQueue,
        BACKGROUND_BATCH_DELAY,
      );
    }
  };

  const scheduleLoadQueue = () => {
    if (
      scheduledLoadRef.current !== null ||
      !isMountedRef.current ||
      !isTabVisibleRef.current ||
      !isIntersectingRef.current
    )
      return;

    scheduledLoadRef.current = window.setTimeout(
      processLoadQueue,
      BACKGROUND_BATCH_DELAY,
    );
  };

  const stopAnimation = () => {
    if (animationFrameRef.current !== null) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
  };

  const drawFrame = (frameIndex: number) => {
    const images = imagesRef.current;
    let img: HTMLImageElement | null = images[frameIndex] ?? null;
    if (!img || !img.complete || img.naturalWidth === 0) {
      for (let delta = 1; delta < 8; delta++) {
        const prev = images[frameIndex - delta];
        if (prev && prev.complete && prev.naturalWidth > 0) {
          img = prev;
          break;
        }
        const next = images[frameIndex + delta];
        if (next && next.complete && next.naturalWidth > 0) {
          img = next;
          break;
        }
      }
      if (!img) return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const logicalW = backgroundMode ? window.innerWidth : canvas.width / dpr;
    const logicalH = backgroundMode ? window.innerHeight : canvas.height / dpr;

    ctx.clearRect(0, 0, logicalW, logicalH);

    const imgAspect = img.naturalWidth / img.naturalHeight;
    const canvasAspect = logicalW / logicalH;

    let drawWidth = logicalW;
    let drawHeight = logicalH;
    let offsetX = 0;
    let offsetY = 0;

    if (canvasAspect > imgAspect) {
      drawHeight = logicalW / imgAspect;
      offsetY = (logicalH - drawHeight) / 2;
    } else {
      drawWidth = logicalH * imgAspect;
      offsetX = (logicalW - drawWidth) / 2;
    }

    ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
  };

  const startRenderLoop = () => {
    if (animationFrameRef.current !== null) return;
    if (
      !isMountedRef.current ||
      !isTabVisibleRef.current ||
      !isIntersectingRef.current
    )
      return;

    const render = () => {
      if (
        !isMountedRef.current ||
        !isTabVisibleRef.current ||
        !isIntersectingRef.current
      ) {
        animationFrameRef.current = null;
        return;
      }

      const targetFrame = targetFrameRef.current;
      let currentFrame = currentFrameRef.current;
      const isMobile = window.innerWidth < 768;
      const LERP = isMobile ? 0.18 : 0.12;

      const delta = targetFrame - currentFrame;
      if (Math.abs(delta) < 0.001) {
        currentFrame = targetFrame;
      } else {
        currentFrame += delta * LERP;
      }
      currentFrameRef.current = currentFrame;

      const safeIndex = Math.min(
        Math.max(Math.round(currentFrame), 0),
        count - 1,
      );
      if (safeIndex !== lastDrawnIndexRef.current) {
        drawFrame(safeIndex);
        lastDrawnIndexRef.current = safeIndex;
      }

      if (Math.abs(targetFrame - currentFrame) > 0.001) {
        animationFrameRef.current = requestAnimationFrame(render);
      } else {
        animationFrameRef.current = null;
      }
    };

    animationFrameRef.current = requestAnimationFrame(render);
  };

  const computeTargetFrame = () => {
    if (backgroundMode) {
      const maxScroll =
        document.documentElement.scrollHeight - window.innerHeight;
      if (maxScroll <= 0) return 0;
      const progress = Math.min(Math.max(window.scrollY / maxScroll, 0), 1);
      return Math.floor(progress * (count - 1));
    }

    if (!containerRef.current) return 0;
    const rect = containerRef.current.getBoundingClientRect();
    const scrollableDistance = rect.height - window.innerHeight;
    if (scrollableDistance <= 0) return 0;
    const progress = Math.min(Math.max(-rect.top / scrollableDistance, 0), 1);
    return Math.floor(progress * (count - 1));
  };

  const updateTargetFrame = () => {
    const nextTarget = computeTargetFrame();
    if (nextTarget === targetFrameRef.current) return;

    targetFrameRef.current = nextTarget;
    enqueueFramesNear(nextTarget, PRIORITY_RADIUS);
    scheduleLoadQueue();
    startRenderLoop();
  };

  const scheduleScrollUpdate = () => {
    if (scrollRafRef.current !== null) return;
    if (reducedMotionRef.current) {
      updateTargetFrame();
      return;
    }

    scrollRafRef.current = window.requestAnimationFrame(() => {
      scrollRafRef.current = null;
      updateTargetFrame();
    });
  };

  useEffect(() => {
    isMountedRef.current = true;
    isTabVisibleRef.current = document.visibilityState === "visible";
    reducedMotionRef.current = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    imagesRef.current = new Array(count).fill(null);

    const initialTarget = computeTargetFrame();
    targetFrameRef.current = initialTarget;
    // Immediately load the initial target frame so the first frame appears quickly.
    enqueueFramesNear(initialTarget, PRIORITY_RADIUS);
    loadFrame(initialTarget);
    // Enqueue a bounded set immediately and defer the rest to background chunks.
    enqueueDistanceOrderedFrames(initialTarget);
    scheduleLoadQueue();
    // Start background enqueuing after a short delay to avoid blocking initial loads.
    backgroundScheduledRef.current = window.setTimeout(
      enqueueBackgroundChunk,
      BACKGROUND_BATCH_DELAY,
    );

    const handleVisibility = () => {
      isTabVisibleRef.current = document.visibilityState === "visible";
      if (isTabVisibleRef.current) {
        if (!reducedMotionRef.current) {
          scheduleLoadQueue();
          startRenderLoop();
        }
      } else {
        stopAnimation();
        if (scheduledLoadRef.current !== null) {
          window.clearTimeout(scheduledLoadRef.current);
          scheduledLoadRef.current = null;
        }
        if (backgroundScheduledRef.current !== null) {
          window.clearTimeout(backgroundScheduledRef.current);
          backgroundScheduledRef.current = null;
        }
      }
    };

    const handleReducedMotionChange = (event: MediaQueryListEvent) => {
      reducedMotionRef.current = event.matches;
      if (event.matches) {
        stopAnimation();
        return;
      }
      startRenderLoop();
      scheduleLoadQueue();
    };

    document.addEventListener("visibilitychange", handleVisibility);

    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const supportsAddEventListener =
      typeof (
        mediaQuery as MediaQueryList & {
          addEventListener?: (
            type: string,
            listener: (ev: MediaQueryListEvent) => void,
          ) => void;
        }
      ).addEventListener === "function";

    if (supportsAddEventListener) {
      mediaQuery.addEventListener("change", handleReducedMotionChange);
    } else {
      mediaQuery.addListener(handleReducedMotionChange);
    }

    const handleScroll = () => {
      if (reducedMotionRef.current) {
        updateTargetFrame();
        return;
      }
      scheduleScrollUpdate();
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    updateTargetFrame();

    const observedElement =
      backgroundMode ? canvasRef.current : containerRef.current;
    let observer: IntersectionObserver | null = null;
    if (observedElement) {
      observer = new IntersectionObserver(
        ([entry]) => {
          isIntersectingRef.current = entry.isIntersecting;
          if (entry.isIntersecting) {
            startRenderLoop();
            scheduleLoadQueue();
          } else {
            stopAnimation();
          }
        },
        { threshold: 0.05 },
      );
      observer.observe(observedElement);
    }

    return () => {
      isMountedRef.current = false;
      document.removeEventListener("visibilitychange", handleVisibility);
      window.removeEventListener("scroll", handleScroll);
      const supportsRemoveEventListener =
        typeof (
          mediaQuery as MediaQueryList & {
            removeEventListener?: (
              type: string,
              listener: (ev: MediaQueryListEvent) => void,
            ) => void;
          }
        ).removeEventListener === "function";

      if (supportsRemoveEventListener) {
        mediaQuery.removeEventListener("change", handleReducedMotionChange);
      } else {
        mediaQuery.removeListener(handleReducedMotionChange);
      }
      if (observer && observedElement) {
        observer.unobserve(observedElement);
      }
      if (scheduledLoadRef.current !== null) {
        window.clearTimeout(scheduledLoadRef.current);
        scheduledLoadRef.current = null;
      }
      if (backgroundScheduledRef.current !== null) {
        window.clearTimeout(backgroundScheduledRef.current);
        backgroundScheduledRef.current = null;
      }
      if (scrollRafRef.current !== null) {
        window.cancelAnimationFrame(scrollRafRef.current);
        scrollRafRef.current = null;
      }
      stopAnimation();
    };
  }, [count, folderPath, filePrefix, fileExtension, backgroundMode]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const performResize = () => {
      resizeRafRef.current = null;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const width =
        backgroundMode ?
          window.innerWidth
        : canvas.getBoundingClientRect().width || window.innerWidth;
      const height =
        backgroundMode ?
          window.innerHeight
        : canvas.getBoundingClientRect().height || window.innerHeight;
      const scaledWidth = Math.max(1, width) * dpr;
      const scaledHeight = Math.max(1, height) * dpr;
      if (canvas.width !== scaledWidth || canvas.height !== scaledHeight) {
        canvas.width = scaledWidth;
        canvas.height = scaledHeight;
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.scale(dpr, dpr);
        lastDrawnIndexRef.current = -1;
      }
    };

    const resizeHandler = () => {
      if (resizeRafRef.current !== null) return;
      resizeRafRef.current = window.requestAnimationFrame(performResize);
    };

    performResize();
    window.addEventListener("resize", resizeHandler);
    return () => {
      window.removeEventListener("resize", resizeHandler);
      if (resizeRafRef.current !== null) {
        window.cancelAnimationFrame(resizeRafRef.current);
        resizeRafRef.current = null;
      }
    };
  }, [backgroundMode]);

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
    <div
      ref={containerRef}
      className={`relative ${containerHeight} ${className}`}
    >
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
