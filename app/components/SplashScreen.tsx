"use client";

import { useEffect, useState } from "react";

/**
 * Module-level flag: true only on the very first JS bundle mount (i.e. a
 * full page load / hard reload). Client-side navigations keep this `false`
 * because the module is already loaded.
 */
let isFirstMount = true;

export default function SplashScreen() {
  // null = not yet determined (avoids SSR mismatch)
  const [visible, setVisible] = useState<boolean | null>(null);
  // Controls the fade-out CSS class
  const [hiding, setHiding] = useState(false);

  useEffect(() => {
    if (isFirstMount) {
      isFirstMount = false;
      setVisible(true);

      // Start fade-out after 1.8 s, fully unmount after 2.4 s
      const fadeTimer = setTimeout(() => setHiding(true), 1800);
      const hideTimer = setTimeout(() => setVisible(false), 2400);
      return () => {
        clearTimeout(fadeTimer);
        clearTimeout(hideTimer);
      };
    } else {
      setVisible(false);
    }
  }, []);

  // Don't render anything until we know whether to show (avoids hydration flash)
  if (visible === null || visible === false) return null;

  return (
    <div
      aria-hidden="true"
      className={`splash-screen ${hiding ? "splash-screen--hide" : ""}`}
    >
      {/* Background */}
      <div className="splash-bg" />

      {/* Animated grid overlay */}
      <div className="splash-grid" />

      {/* Ambient orbs */}
      <div className="splash-orb splash-orb--blue" />
      <div className="splash-orb splash-orb--indigo" />
      <div className="splash-orb splash-orb--cyan" />

      {/* Centre content */}
      <div className="splash-content">
        {/* Logo / monogram */}
        <div className="splash-logo">
          <span className="splash-logo-text">RS</span>
          <div className="splash-logo-ring" />
          <div className="splash-logo-ring splash-logo-ring--outer" />
        </div>

        {/* Name */}
        <p className="splash-name">Md. Riad Shekh</p>

        {/* Role */}
        <p className="splash-role">Full Stack Web Developer</p>

        {/* Progress bar */}
        <div className="splash-progress-track">
          <div className="splash-progress-bar" />
        </div>
      </div>
    </div>
  );
}
