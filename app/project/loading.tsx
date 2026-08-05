import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import FrameScrollAnimation from "../components/FrameScrollAnimation";

export default function Loading() {
  return (
    <div className="min-h-screen text-zinc-100 font-sans flex flex-col justify-between">
      {/* Scroll-driven frame animation — fixed background remains active during route load */}
      <FrameScrollAnimation
        backgroundMode
        totalFrames={116}
        folderPath="/projectScrollAnimation"
        filePrefix="ezgif-frame-"
        fileExtension="png"
      />

      <Navbar activeSection="projects" />

      <main className="pt-24 pb-16">
        <section id="projects" className="py-24 px-6 max-w-7xl mx-auto border-t border-zinc-900">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-xs font-mono text-blue-400">
                <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
                Live GitHub API Integration
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
                GitHub Portfolio Projects
              </h2>
            </div>
          </div>

          {/* Skeleton Cards Grid with Glassmorphic Backdrop & Card Loading Spinners */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {Array.from({ length: 6 }).map((_, idx) => (
              <div
                key={idx}
                className="relative p-6 rounded-3xl bg-zinc-900/30 border border-zinc-800/60 backdrop-blur-sm shadow-xl flex flex-col justify-between h-[420px] overflow-hidden"
              >
                <div>
                  {/* Skeleton Banner with Embedded Dual-Ring Spinner */}
                  <div className="relative w-full h-48 rounded-2xl bg-zinc-950/60 border border-zinc-800/50 overflow-hidden mb-5 flex items-center justify-center">
                    {/* Glassmorphic Shimmer Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-500/5 to-transparent animate-pulse" />

                    {/* Card Loading Spinner */}
                    <div className="relative flex items-center justify-center">
                      <div className="w-10 h-10 border-2 border-blue-500/20 border-t-blue-400 border-r-cyan-400 rounded-full animate-spin" />
                      <div className="absolute w-3 h-3 rounded-full bg-blue-500/30 animate-ping" />
                    </div>
                  </div>

                  {/* Title & Description Skeleton */}
                  <div className="space-y-3">
                    <div className="h-6 bg-zinc-800/50 rounded-lg w-2/3 animate-pulse" />
                    <div className="space-y-2 pt-1">
                      <div className="h-3.5 bg-zinc-800/40 rounded w-full animate-pulse" />
                      <div className="h-3.5 bg-zinc-800/40 rounded w-4/5 animate-pulse" />
                    </div>
                  </div>
                </div>

                {/* Card Action Footer Skeleton */}
                <div className="pt-4 border-t border-zinc-800/60 flex items-center justify-between">
                  <div className="h-4 bg-cyan-500/20 rounded-md w-20 animate-pulse" />
                  <div className="h-8 bg-zinc-800/60 rounded-xl w-28 animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
