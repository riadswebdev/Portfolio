import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export default function Loading() {
  return (
    <div className="min-h-screen text-zinc-100 font-sans flex flex-col justify-between">
      <Navbar activeSection="about" />

      <main className="relative z-10 pt-32 pb-20 px-4 sm:px-6 max-w-6xl mx-auto w-full space-y-16">
        {/* Header Skeleton */}
        <div className="text-center space-y-4 max-w-2xl mx-auto flex flex-col items-center">
          <div className="h-6 w-24 bg-zinc-800/60 rounded-full animate-pulse" />
          <div className="h-10 w-72 bg-zinc-800/70 rounded-xl animate-pulse" />
          <div className="h-4 w-96 max-w-full bg-zinc-800/40 rounded-lg animate-pulse" />
        </div>

        {/* Bio & Image Grid Skeleton */}
        <div className="grid lg:grid-cols-12 gap-10 items-start">
          {/* Left Image Skeleton */}
          <div className="lg:col-span-5 flex justify-center">
            <div className="w-full max-w-md aspect-[4/5] rounded-2xl border border-zinc-800/80 bg-zinc-900/40 p-4 shadow-2xl animate-pulse flex items-center justify-center">
              <div className="w-full h-full bg-zinc-800/50 rounded-xl flex items-center justify-center">
                <div className="w-10 h-10 border-2 border-blue-500/20 border-t-cyan-400 rounded-full animate-spin" />
              </div>
            </div>
          </div>

          {/* Right Bio & Highlights Skeleton */}
          <div className="lg:col-span-7 space-y-6">
            <div className="space-y-3">
              <div className="h-4 w-32 bg-cyan-500/20 rounded animate-pulse" />
              <div className="h-8 w-64 bg-zinc-800/60 rounded-lg animate-pulse" />
              <div className="h-6 w-48 bg-zinc-800/40 rounded-md animate-pulse" />
              <div className="space-y-2 pt-2">
                <div className="h-4 w-full bg-zinc-800/40 rounded animate-pulse" />
                <div className="h-4 w-5/6 bg-zinc-800/40 rounded animate-pulse" />
              </div>
            </div>

            {/* Highlights Grid Skeleton */}
            <div className="grid sm:grid-cols-2 gap-3 pt-2">
              {Array.from({ length: 6 }).map((_, idx) => (
                <div
                  key={idx}
                  className="h-11 rounded-full bg-zinc-900/60 border border-zinc-800/60 animate-pulse flex items-center px-4 gap-3"
                >
                  <div className="w-5 h-5 rounded-full bg-zinc-800/80" />
                  <div className="h-3 w-28 bg-zinc-800/60 rounded" />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 3 Stats Boxes Skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-4">
          {Array.from({ length: 3 }).map((_, idx) => (
            <div
              key={idx}
              className="p-6 rounded-2xl bg-zinc-900/40 border border-zinc-800/80 animate-pulse flex flex-col items-center justify-center space-y-3 h-36"
            >
              <div className="w-10 h-10 rounded-xl bg-zinc-800/60" />
              <div className="h-7 w-16 bg-zinc-800/60 rounded" />
              <div className="h-3 w-20 bg-zinc-800/40 rounded" />
            </div>
          ))}
        </div>
      </main>

      <Footer />
    </div>
  );
}
