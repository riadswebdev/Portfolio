"use client";

import { useEffect, useState } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

export default function CustomCursor() {
  const [hoverType, setHoverType] = useState("default");
  const [isClicked, setIsClicked] = useState(false);
  const [isVisible, setIsVisible] = useState(true);

  const targetX = useMotionValue(-999);
  const targetY = useMotionValue(-999);
  const x = useSpring(targetX, { stiffness: 1200, damping: 60 });
  const y = useSpring(targetY, { stiffness: 1200, damping: 60 });

  useEffect(() => {
    if (!window.matchMedia("(pointer: fine)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    document.documentElement.classList.add("custom-cursor-active");

    const handleMouseMove = (event: MouseEvent) => {
      targetX.set(event.clientX);
      targetY.set(event.clientY);
      setIsVisible(true);
    };
    const handleMouseDown = () => setIsClicked(true);
    const handleMouseUp = () => setIsClicked(false);
    const handleMouseLeave = () => setIsVisible(false);
    const handleMouseEnter = () => setIsVisible(true);
    const handleMouseOver = (event: MouseEvent) => {
      const target = event.target;
      if (!(target instanceof Element)) return;

      if (target.closest("button, [role='button'], .btn, .btn-primary")) {
        setHoverType("button");
      } else if (target.closest("a, .link, [data-cursor='link']")) {
        setHoverType("link");
      } else if (target.closest(".card, [data-cursor='card']")) {
        setHoverType("card");
      } else {
        setHoverType("default");
      }
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
  }, [targetX, targetY]);

  return (
    <motion.div
      className={`fixed left-0 top-0 z-99999 pointer-events-none transition-opacity duration-200 ${
        isVisible ? "opacity-100" : "opacity-0"
      }`}
      style={{ x, y, width: 24, height: 24, marginTop: -2, marginLeft: -3 }}
      animate={{
        scale:
          isClicked ? 0.9
          : hoverType === "button" ? 1.08
          : hoverType === "link" ? 1.04
          : 1,
      }}
      transition={{ type: "spring", stiffness: 1200, damping: 60 }}
      aria-hidden="true"
    >
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <path
          d="M3 2L19.5 13.5L12 15L9 22L3 2Z"
          fill="#38bdf8"
          stroke="#ffffff"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
      </svg>
    </motion.div>
  );
}
