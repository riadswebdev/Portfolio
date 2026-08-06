"use client";

import { useEffect, useRef } from "react";

interface FrameScrollAnimationProps {
  totalFrames?: number;
  folderPath?: string;
  filePrefix?: string;
  fileExtension?: string;
  className?: string;
  containerHeight?: string; // e.g. "h-[400vh]"
  children?: React.ReactNode;
  backgroundMode?: boolean; // when true: fixed full-screen canvas bg for the whole page
}

export default function FrameScrollAnimation({
  totalFrames = 223,
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
  const imagesRef = useRef<HTMLImageElement[]>([]);

  // Preload frames
  useEffect(() => {
    let isMounted = true;
    const loadedImages: HTMLImageElement[] = [];

    for (let i = 1; i <= totalFrames; i++) {
      const img = new Image();
      const frameNum = String(i).padStart(3, "0");
      img.src = `${folderPath}/${filePrefix}${frameNum}.${fileExtension}`;
      loadedImages.push(img);
    }

    imagesRef.current = loadedImages;

    return () => {
      isMounted = false;
    };
  }, [totalFrames, folderPath, filePrefix, fileExtension, backgroundMode]);

  // Smooth scroll render loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let targetFrame = 0;
    let currentFrame = 0;

    const resizeCanvas = () => {
      if (!canvas) return;
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      canvas.width = (rect.width || window.innerWidth) * dpr;
      canvas.height = (rect.height || window.innerHeight) * dpr;
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    const drawFrame = (frameIndex: number) => {
      const img = imagesRef.current[frameIndex];
      if (!img || !img.complete || img.naturalWidth === 0) return;

      const canvasWidth = canvas.width;
      const canvasHeight = canvas.height;

      ctx.clearRect(0, 0, canvasWidth, canvasHeight);

      const imgAspect = img.naturalWidth / img.naturalHeight;
      const canvasAspect = canvasWidth / canvasHeight;

      let drawWidth = canvasWidth;
      let drawHeight = canvasHeight;
      let offsetX = 0;
      let offsetY = 0;

      if (canvasAspect > imgAspect) {
        drawHeight = canvasWidth / imgAspect;
        offsetY = (canvasHeight - drawHeight) / 2;
      } else {
        drawWidth = canvasHeight * imgAspect;
        offsetX = (canvasWidth - drawWidth) / 2;
      }

      ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
    };

    const updateScrollProgress = () => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const scrollableDistance = rect.height - window.innerHeight;
      
      if (scrollableDistance <= 0) return;

      // Calculate progress relative to container position in viewport
      const scrolled = -rect.top;
      const progress = Math.min(Math.max(scrolled / scrollableDistance, 0), 1);
      targetFrame = Math.floor(progress * (totalFrames - 1));
    };

    updateScrollProgress();
    window.addEventListener("scroll", updateScrollProgress, { passive: true });

    // backgroundMode: drive progress from total page scroll
    const updateBgProgress = () => {
      const scrollTop = window.scrollY;
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      if (maxScroll <= 0) return;
      const progress = Math.min(Math.max(scrollTop / maxScroll, 0), 1);
      targetFrame = Math.floor(progress * (totalFrames - 1));
    };

    if (backgroundMode) {
      window.removeEventListener("scroll", updateScrollProgress);
      updateBgProgress();
      window.addEventListener("scroll", updateBgProgress, { passive: true });
    }

    const render = () => {
      // Lerp smoothing factor
      currentFrame += (targetFrame - currentFrame) * 0.12;

      const indexToDraw = Math.round(currentFrame);
      const safeIndex = Math.min(Math.max(indexToDraw, 0), totalFrames - 1);

      drawFrame(safeIndex);
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

  // Background mode: fixed full-screen canvas, no wrapper div
  if (backgroundMode) {
    return (
      <canvas
        ref={canvasRef}
        className="fixed inset-0 w-full h-full object-cover -z-10 pointer-events-none"
      />
    );
  }

  // Normal scroll-scrub mode
  return (
    <div ref={containerRef} className={`relative ${containerHeight} ${className}`}>
      <div className="sticky top-0 h-screen w-full overflow-hidden flex items-center justify-center">
        <canvas ref={canvasRef} className="block w-full h-full object-cover" />

        {/* Overlay Content */}
        {children && <div className="absolute inset-0 pointer-events-none z-10 flex flex-col justify-between">{children}</div>}
      </div>
    </div>
  );
}
