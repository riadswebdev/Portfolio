"use client";

import { useEffect, useState } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

export default function CustomCursor() {
  const [enabled, setEnabled] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isClicked, setIsClicked] = useState(false);
  const [isVisible, setIsVisible] = useState(true);

  // Raw mouse coordinates using MotionValues for performance
  const mouseX = useMotionValue(-100);
  const mouseY = useMotionValue(-100);

  // Smooth spring physics for leading dot (tight & fast)
  const dotSpringConfig = { stiffness: 900, damping: 40 };
  const dotX = useSpring(mouseX, dotSpringConfig);
  const dotY = useSpring(mouseY, dotSpringConfig);

  // Smooth spring physics for trailing outer ring (organic lag)
  const ringSpringConfig = { stiffness: 220, damping: 24 };
  const ringX = useSpring(mouseX, ringSpringConfig);
  const ringY = useSpring(mouseY, ringSpringConfig);

  useEffect(() => {
    // Only enable on desktop / fine-pointer devices (not touch screens)
    const mediaQuery = window.matchMedia("(pointer: fine)");
    if (!mediaQuery.matches) return;

    setEnabled(true);
    document.documentElement.classList.add("custom-cursor-active");

    const handleMouseMove = (e: MouseEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
      if (!isVisible) setIsVisible(true);
    };

    const handleMouseDown = () => setIsClicked(true);
    const handleMouseUp = () => setIsClicked(false);

    const handleMouseLeave = () => setIsVisible(false);
    const handleMouseEnter = () => setIsVisible(true);

    // Delegate hover detection for clickable / interactive elements
    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;

      const isInteractive = Boolean(
        target.closest(
          "a, button, input, textarea, select, [role='button'], .cursor-pointer, [data-cursor='hover']"
        )
      );

      setIsHovered(isInteractive);
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    window.addEventListener("mousedown", handleMouseDown, { passive: true });
    window.addEventListener("mouseup", handleMouseUp, { passive: true });
    document.addEventListener("mouseleave", handleMouseLeave, { passive: true });
    document.addEventListener("mouseenter", handleMouseEnter, { passive: true });
    document.addEventListener("mouseover", handleMouseOver, { passive: true });

    return () => {
      document.documentElement.classList.remove("custom-cursor-active");
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mouseup", handleMouseUp);
      document.removeEventListener("mouseleave", handleMouseLeave);
      document.removeEventListener("mouseenter", handleMouseEnter);
      document.removeEventListener("mouseover", handleMouseOver);
    };
  }, [mouseX, mouseY, isVisible]);

  if (!enabled) return null;

  return (
    <div
      className={`fixed inset-0 pointer-events-none z-[99999] transition-opacity duration-300 ${
        isVisible ? "opacity-100" : "opacity-0"
      }`}
    >
      {/* ── Trailing Translucent Outer Ring ────────────────────────── */}
      <motion.div
        className="fixed top-0 left-0 rounded-full border border-cyan-400/50 bg-cyan-500/10 backdrop-blur-[0.5px]"
        style={{
          x: ringX,
          y: ringY,
          width: 38,
          height: 38,
          marginTop: -19,
          marginLeft: -19,
          mixBlendMode: isHovered ? "difference" : "normal",
        }}
        animate={{
          scale: isClicked ? 0.75 : isHovered ? 1.65 : 1,
          backgroundColor: isHovered
            ? "rgba(255, 255, 255, 0.95)"
            : "rgba(34, 211, 238, 0.08)",
          borderColor: isHovered
            ? "rgba(255, 255, 255, 1)"
            : "rgba(34, 211, 238, 0.5)",
          boxShadow: isHovered
            ? "0 0 20px rgba(34, 211, 238, 0.6)"
            : "0 0 10px rgba(34, 211, 238, 0.15)",
        }}
        transition={{
          scale: { type: "spring", stiffness: 350, damping: 25 },
          backgroundColor: { duration: 0.15 },
          borderColor: { duration: 0.15 },
        }}
      />

      {/* ── Leading Solid Inner Dot ────────────────────────────────── */}
      <motion.div
        className="fixed top-0 left-0 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.8)]"
        style={{
          x: dotX,
          y: dotY,
          width: 8,
          height: 8,
          marginTop: -4,
          marginLeft: -4,
        }}
        animate={{
          scale: isClicked ? 0.5 : isHovered ? 0 : 1,
          opacity: isHovered ? 0 : 1,
        }}
        transition={{ duration: 0.15 }}
      />
    </div>
  );
}
