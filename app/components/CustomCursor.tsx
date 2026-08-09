"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

declare global {
  interface Window {
    __CUSTOM_CURSOR_STATUS?: {
      mounted: boolean;
      hoverType: string;
      lastRipple: number;
    };
  }
}

// Use the JS/TS implementation below — image cursors are disabled by default
const USE_IMAGE_CURSOR = false;

export default function CustomCursor() {
  const [enabled, setEnabled] = useState(false);
  const [hoverType, setHoverType] = useState("default");
  const [isClicked, setIsClicked] = useState(false);
  const [isVisible, setIsVisible] = useState(true);

  // Motion values for pointer
  const mouseX = useMotionValue(-999);
  const mouseY = useMotionValue(-999);

  // tight dot follows mouse directly (fast)
  const dotTargetX = useMotionValue(-999);
  const dotTargetY = useMotionValue(-999);

  // ring target allows magnetic offsets
  const ringTargetX = useMotionValue(-999);
  const ringTargetY = useMotionValue(-999);

  const isReducedMotion = useRef(false);

  // springs
  const dotX = useSpring(dotTargetX, { stiffness: 1200, damping: 60 });
  const dotY = useSpring(dotTargetY, { stiffness: 1200, damping: 60 });
  const ringX = useSpring(ringTargetX, { stiffness: 300, damping: 32 });
  const ringY = useSpring(ringTargetY, { stiffness: 300, damping: 32 });

  // ripple values
  const rippleX = useMotionValue(-999);
  const rippleY = useMotionValue(-999);
  const [rippleVisible, setRippleVisible] = useState(false);
  const [rippleKey, setRippleKey] = useState(0);
  const rippleTimeoutRef = useRef<number | null>(null);

  const hoveredEl = useRef<HTMLElement | null>(null);
  const hoverRectRef = useRef<DOMRect | null>(null);
  const hoverRectStampRef = useRef(0);
  const isVisibleRef = useRef(true);
  const hoverTypeRef = useRef("default");

  // helper to mirror hoverType to window debug hook
  const setHoverTypeMirror = (t: string) => {
    hoverTypeRef.current = t;
    setHoverType(t);
    try {
      // @ts-ignore
      if (window.__CUSTOM_CURSOR_STATUS)
        window.__CUSTOM_CURSOR_STATUS.hoverType = t;
    } catch (e) {}
  };

  // helpers
  const createRipple = useCallback((x: number, y: number) => {
    rippleX.set(x);
    rippleY.set(y);
    setRippleVisible(true);
    setRippleKey((k) => k + 1);

    if (rippleTimeoutRef.current !== null) {
      window.clearTimeout(rippleTimeoutRef.current);
    }

    rippleTimeoutRef.current = window.setTimeout(() => {
      setRippleVisible(false);
      rippleTimeoutRef.current = null;
    }, 400);

    try {
      // @ts-ignore
      if (window.__CUSTOM_CURSOR_STATUS) {
        // @ts-ignore
        window.__CUSTOM_CURSOR_STATUS.lastRipple = Date.now();
      }
    } catch (e) {}
  }, []);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(pointer: fine)");
    if (!mediaQuery.matches) return; // disable on touch devices

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    isReducedMotion.current = reduceMotion.matches;
    if (reduceMotion.matches) {
      setEnabled(false);
      return;
    }

    setEnabled(true);
    document.documentElement.classList.add("custom-cursor-active");

    try {
      // @ts-ignore
      window.__CUSTOM_CURSOR_STATUS = {
        mounted: true,
        hoverType: "default",
        lastRipple: 0,
      };
    } catch (e) {}

    let prevCursor = "";
    if (USE_IMAGE_CURSOR) {
      prevCursor = document.documentElement.style.cursor || "";
      document.documentElement.style.cursor = `url('/riad.png') 16 16, auto`;
    }

    const handleMouseMove = (e: MouseEvent) => {
      const x = e.clientX;
      const y = e.clientY;
      mouseX.set(x);
      mouseY.set(y);
      dotTargetX.set(x);
      dotTargetY.set(y);
      ringTargetX.set(x);
      ringTargetY.set(y);

      if (!isVisibleRef.current) {
        isVisibleRef.current = true;
        setIsVisible(true);
      }

      if (hoveredEl.current && hoverTypeRef.current === "card") {
        const now = performance.now();
        if (now - hoverRectStampRef.current > 50 || !hoverRectRef.current) {
          hoverRectRef.current = hoveredEl.current.getBoundingClientRect();
          hoverRectStampRef.current = now;
        }

        const rect = hoverRectRef.current;
        if (rect) {
          const cx = rect.left + rect.width / 2;
          const cy = rect.top + rect.height / 2;
          const dx = cx - x;
          const dy = cy - y;
          const dist = Math.hypot(dx, dy);
          const strength = Math.max(0, Math.min(1, (140 - dist) / 140));
          const attract = 28 * strength;
          ringTargetX.set(x + dx * 0.12 * strength);
          ringTargetY.set(y + dy * 0.12 * strength - attract * 0.06);
        }
      }
    };

    const handleMouseDown = (e: MouseEvent) => {
      setIsClicked(true);
      createRipple(e.clientX, e.clientY);
    };
    const handleMouseUp = () => setIsClicked(false);

    const handleMouseLeave = () => {
      isVisibleRef.current = false;
      setIsVisible(false);
    };
    const handleMouseEnter = () => {
      isVisibleRef.current = true;
      setIsVisible(true);
    };

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;

      const btn = target.closest("button, [role='button'], .btn, .btn-primary");
      const link = target.closest("a, .link, [data-cursor='link']");
      const card = target.closest(".card, [data-cursor='card']");

      if (card) {
        hoveredEl.current = card as HTMLElement;
        hoverRectRef.current = (card as HTMLElement).getBoundingClientRect();
        hoverRectStampRef.current = 0;
        setHoverTypeMirror("card");
      } else if (btn) {
        hoveredEl.current = btn as HTMLElement;
        hoverRectRef.current = null;
        setHoverTypeMirror("button");
      } else if (link) {
        hoveredEl.current = link as HTMLElement;
        hoverRectRef.current = null;
        setHoverTypeMirror("link");
      } else {
        hoveredEl.current = null;
        hoverRectRef.current = null;
        setHoverTypeMirror("default");
      }
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    window.addEventListener("mousedown", handleMouseDown, { passive: true });
    window.addEventListener("mouseup", handleMouseUp, { passive: true });
    document.addEventListener("mouseleave", handleMouseLeave, {
      passive: true,
    });
    document.addEventListener("mouseenter", handleMouseEnter, {
      passive: true,
    });
    document.addEventListener("mouseover", handleMouseOver, { passive: true });

    return () => {
      document.documentElement.classList.remove("custom-cursor-active");
      if (USE_IMAGE_CURSOR)
        document.documentElement.style.cursor = prevCursor || "";
      if (rippleTimeoutRef.current !== null) {
        window.clearTimeout(rippleTimeoutRef.current);
        rippleTimeoutRef.current = null;
      }
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mouseup", handleMouseUp);
      document.removeEventListener("mouseleave", handleMouseLeave);
      document.removeEventListener("mouseenter", handleMouseEnter);
      document.removeEventListener("mouseover", handleMouseOver);
    };
  }, [
    mouseX,
    mouseY,
    dotTargetX,
    dotTargetY,
    ringTargetX,
    ringTargetY,
    createRipple,
  ]);

  if (!enabled) return null;

  // Respect reduced-motion: reduce spring motion when user prefers
  const motionTransition =
    isReducedMotion.current ?
      { type: "spring" as const, stiffness: 1200, damping: 120 }
    : { type: "spring" as const, stiffness: 300, damping: 30 };

  return (
    <div
      className={`fixed inset-0 pointer-events-none z-99999 transition-opacity duration-200 ${
        isVisible ? "opacity-100" : "opacity-0"
      }`}
      aria-hidden
    >
      {/* Trailing ring (glass + glow) */}
      <motion.div
        className="fixed top-0 left-0 pointer-events-none will-change-transform"
        style={{
          x: ringX,
          y: ringY,
          width: 48,
          height: 48,
          marginTop: -24,
          marginLeft: -24,
        }}
        animate={{
          scale:
            isClicked ? 0.92
            : hoverType === "button" ? 1.6
            : hoverType === "link" ? 1.15
            : 1,
          rotate: hoverType === "button" ? 3 : 0,
          opacity: hoverType === "link" ? 0.98 : 0.92,
        }}
        transition={motionTransition}
      >
        <div className="w-full h-full rounded-full bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.03),transparent_25%),rgba(17,24,39,0.6)] border border-white/6 shadow-[0_12px_40px_rgba(34,211,238,0.10)] backdrop-blur-[6px]" />
      </motion.div>

      {/* Primary pointer: SVG with glass gradient and thin outline */}
      <motion.div
        className="fixed top-0 left-0 pointer-events-none will-change-transform"
        style={{
          x: dotX,
          y: dotY,
          width: 34,
          height: 34,
          marginTop: -17,
          marginLeft: -17,
        }}
        animate={{
          rotate: hoverType === "button" ? 4 : 0,
          scale:
            isClicked ? 0.9
            : hoverType === "link" ? 1.15
            : 1,
        }}
        transition={motionTransition}
      >
        <svg
          viewBox="0 0 24 24"
          className="w-full h-full"
          preserveAspectRatio="xMidYMid meet"
        >
          <defs>
            <linearGradient id="pgrad" x1="0%" x2="100%" y1="0%" y2="100%">
              <stop offset="0%" stopColor="#0ea5c7" stopOpacity="0.96" />
              <stop offset="60%" stopColor="#3B82F6" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#8B5CF6" stopOpacity="0.85" />
            </linearGradient>
          </defs>

          <path
            d="M3.8 3.2c0 0 5.2 0 7.8 5.2 2.6 5.2 5.8 9.2 5.8 9.2s-4-2.4-7.2-6.4C7.6 8.6 5.2 3.2 3.8 3.2z"
            fill="url(#pgrad)"
            stroke="rgba(255,255,255,0.06)"
            strokeWidth="0.6"
          />

          <path
            d="M6 5c0 0 4 0 6 4 2 4 5 7 5 7s-4-2-7-6C8 9 6 5 6 5z"
            fill="rgba(255,255,255,0.06)"
          />
        </svg>
      </motion.div>

      {/* Click ripple */}
      <motion.div
        key={rippleKey}
        className="fixed top-0 left-0 pointer-events-none"
        style={{
          x: rippleX,
          y: rippleY,
          width: 8,
          height: 8,
          marginTop: -4,
          marginLeft: -4,
        }}
      >
        <motion.div
          className="rounded-full bg-cyan-300/30"
          initial={{ scale: 0.6, opacity: 0.9 }}
          animate={
            rippleVisible ?
              { scale: 12, opacity: 0 }
            : { scale: 0.6, opacity: 0 }
          }
          transition={{ duration: 0.45, ease: "easeOut" }}
          style={{ width: "100%", height: "100%" }}
        />
      </motion.div>
    </div>
  );
}
