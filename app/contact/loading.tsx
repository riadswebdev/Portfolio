import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export default function Loading() {
  return (
    <div className="relative min-h-screen font-sans flex flex-col justify-between overflow-hidden bg-[#07090e]">
      <Navbar activeSection="contact" />

      <main className="pt-32 pb-24 px-4 sm:px-6 max-w-6xl mx-auto w-full space-y-12">
        {/* Header Skeleton */}
        <div className="text-center max-w-xl mx-auto space-y-3 flex flex-col items-center">
          <div className="h-10 w-48 bg-cyan-500/20 rounded-xl animate-pulse" />
          <div className="h-4 w-72 bg-zinc-800/40 rounded-lg animate-pulse" />
        </div>

        {/* 2 Column Contact Layout Skeleton */}
        <div className="grid lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Contact Information Skeleton */}
          <div className="lg:col-span-5 space-y-6">
            <div className="p-6 sm:p-8 rounded-3xl border border-zinc-800/80 bg-zinc-900/40 space-y-6 shadow-2xl animate-pulse">
              <div className="space-y-2">
                <div className="h-6 w-40 bg-zinc-800/60 rounded" />
                <div className="h-3 w-56 bg-zinc-800/40 rounded" />
              </div>

              {/* Info Cards Stack Skeleton */}
              <div className="space-y-3">
                {Array.from({ length: 4 }).map((_, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-4 p-3.5 rounded-2xl border border-zinc-800/60 bg-zinc-900/60"
                  >
                    <div className="w-10 h-10 rounded-xl bg-zinc-800/80 shrink-0" />
                    <div className="space-y-1.5 flex-1">
                      <div className="h-3 w-16 bg-zinc-800/60 rounded" />
                      <div className="h-4 w-36 bg-zinc-800/40 rounded" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Send a Message Form Skeleton */}
          <div className="lg:col-span-7">
            <div className="p-6 sm:p-10 rounded-3xl border border-zinc-800/80 bg-zinc-900/40 space-y-6 shadow-2xl animate-pulse">
              <div className="space-y-2">
                <div className="h-7 w-48 bg-zinc-800/60 rounded" />
                <div className="h-3 w-64 bg-zinc-800/40 rounded" />
              </div>

              <div className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="h-12 bg-zinc-800/50 rounded-xl w-full" />
                  <div className="h-12 bg-zinc-800/50 rounded-xl w-full" />
                </div>
                <div className="h-12 bg-zinc-800/50 rounded-xl w-full" />
                <div className="h-32 bg-zinc-800/50 rounded-xl w-full" />
                <div className="h-11 bg-cyan-500/20 rounded-xl w-36" />
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
