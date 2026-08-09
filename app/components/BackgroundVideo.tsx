"use client";

import { useEffect, useRef } from "react";

interface Props extends React.VideoHTMLAttributes<HTMLVideoElement> {
  src: string;
  poster?: string;
}

export default function BackgroundVideo({ src, poster, className = "", muted = true, loop = true, playsInline = true, disablePictureInPicture = true, ...rest }: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const hasLoadedRef = useRef(false);
  const playOnVisibleRef = useRef(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !containerRef.current) return;

    // Respect user prefers-reduced-motion
    const reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const autoplayAllowed = !reduceMotion;

    // Ensure conservative preload until visible
    video.preload = "metadata";
    video.muted = !!muted;
    video.loop = !!loop;
    video.playsInline = !!playsInline;
    if (disablePictureInPicture) video.disablePictureInPicture = true;

    const onVisibility = () => {
      if (document.visibilityState === "hidden") {
        try { video.pause(); } catch {}
      } else {
        if (playOnVisibleRef.current && autoplayAllowed) {
          // attempt to play when returning
          video.play().catch(() => {});
        }
      }
    };

    document.addEventListener("visibilitychange", onVisibility);

    const obs = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          // Only set src once to avoid duplicate downloads
          if (!hasLoadedRef.current) {
            video.src = src;
            // metadata already requested; call load to be sure
            try { video.load(); } catch {}
            hasLoadedRef.current = true;
          }
          if (autoplayAllowed) {
            video.play().catch(() => { /* play might be blocked */ });
            playOnVisibleRef.current = true;
          }
        } else {
          // Pause when out of view
          try { video.pause(); } catch {}
        }
      }
    }, { threshold: 0.05 });

    obs.observe(containerRef.current);

    return () => {
      obs.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
      // cleanup src to stop any network activity
      try { if (video) { video.pause(); video.removeAttribute("src"); video.load(); } } catch {}
    };
  }, [src, muted, loop, playsInline, disablePictureInPicture]);

  return (
    <div ref={containerRef} className={className}>
      <video ref={videoRef} poster={poster} {...rest} className="absolute top-1/2 left-1/2 w-full h-full min-w-[177.77vh] min-h-[56.25vw] -translate-x-1/2 -translate-y-1/2 object-cover" />
    </div>
  );
}
