"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

const DynamicCustomCursor = dynamic(() => import("./CustomCursor"), {
  ssr: false,
  loading: () => null,
});

export default function CustomCursorLoader() {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const pointerQuery = window.matchMedia("(pointer: fine)");
    const reduceMotionQuery = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    );

    const update = () => {
      const shouldEnable = pointerQuery.matches && !reduceMotionQuery.matches;
      setEnabled(shouldEnable);
    };

    update();

    const add = (query: MediaQueryList, listener: () => void) => {
      if (typeof query.addEventListener === "function") {
        query.addEventListener("change", listener);
      } else {
        query.addListener(listener);
      }
    };

    const remove = (query: MediaQueryList, listener: () => void) => {
      if (typeof query.removeEventListener === "function") {
        query.removeEventListener("change", listener);
      } else {
        query.removeListener(listener);
      }
    };

    add(pointerQuery, update);
    add(reduceMotionQuery, update);

    return () => {
      remove(pointerQuery, update);
      remove(reduceMotionQuery, update);
    };
  }, []);

  if (!enabled) return null;

  return <DynamicCustomCursor />;
}
