import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export default function Loading() {
  return (
    <div className="relative min-h-screen bg-[#07090e] text-zinc-100 font-sans flex flex-col justify-between overflow-hidden">
      {/* Subtle ambient glow during loading */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-cyan-500/4 rounded-full blur-3xl pointer-events-none" />

      <Navbar activeSection="skills" />

      <main className="relative z-10 pt-32 pb-28 px-6 max-w-5xl mx-auto w-full space-y-14">
        {/* Header Skeleton */}
        <div className="text-center max-w-2xl mx-auto space-y-4 flex flex-col items-center">
          <div className="h-5 w-36 bg-cyan-500/15 rounded-full animate-pulse" />
          <div className="h-12 w-72 bg-zinc-800/60 rounded-2xl animate-pulse" />
          <div className="h-4 w-80 max-w-full bg-zinc-800/40 rounded-lg animate-pulse" />
          <div className="h-4 w-56 max-w-full bg-zinc-800/30 rounded-lg animate-pulse" />
        </div>

        {/* Stats Banner Skeleton */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="flex flex-col items-center justify-center py-5 px-4 rounded-2xl bg-white/[0.025] border border-white/[0.05] space-y-2"
            >
              <div className="h-8 w-10 bg-zinc-700/50 rounded-lg animate-pulse" />
              <div className="h-3 w-20 bg-zinc-800/50 rounded animate-pulse" />
            </div>
          ))}
        </div>

        {/* 2 × 2 Category Cards Skeleton */}
        <div className="grid md:grid-cols-2 gap-5">
          {Array.from({ length: 4 }).map((_, idx) => (
            <div
              key={idx}
              className="rounded-2xl border border-zinc-800/60 bg-zinc-900/30 backdrop-blur-sm overflow-hidden"
            >
              {/* Card gradient header */}
              <div className="px-6 pt-6 pb-5 bg-white/[0.015] border-b border-white/[0.04] space-y-3">
                <div className="h-5 w-32 bg-zinc-700/50 rounded-full animate-pulse" />
                <div className="h-3 w-48 bg-zinc-800/50 rounded animate-pulse" />
              </div>

              {/* Skill rows */}
              <div className="px-6 py-4 space-y-1">
                {Array.from({ length: idx % 2 === 0 ? 6 : 5 }).map((_, rowIdx) => (
                  <div key={rowIdx} className="py-3.5 border-b border-white/[0.04] last:border-0 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-zinc-800/70 animate-pulse" />
                        <div className="h-4 w-28 bg-zinc-800/50 rounded animate-pulse" style={{ animationDelay: `${rowIdx * 80}ms` }} />
                      </div>
                      <div className="h-4 w-8 bg-zinc-800/40 rounded animate-pulse" />
                    </div>
                    <div className="h-[3px] rounded-full bg-zinc-800/50 w-full" />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </main>

      <Footer />
    </div>
  );
}
