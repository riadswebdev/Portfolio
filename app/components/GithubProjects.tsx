"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { GithubRepo, ParsedTechStack, TECH_DICTIONARY } from "../lib/github";

const repoCache = new Map<string, GithubRepo[]>();
const repoFetchPromises = new Map<string, Promise<GithubRepo[]>>();

interface GithubProjectsProps {
  username?: string;
  /** Cap the number of cards displayed (homepage preview) */
  maxItems?: number;
  /** Show the search input (default true) */
  showSearch?: boolean;
}

// ─── Category filter definitions ────────────────────────────────────────────
const CATEGORIES = [
  { id: "all", label: "All" },
  { id: "react", label: "React" },
  { id: "nextjs", label: "Next.js" },
  { id: "typescript", label: "TypeScript" },
  { id: "fullstack", label: "Full Stack" },
  { id: "3d", label: "3D / Canvas" },
];

function getRepoCategories(repo: GithubRepo): string[] {
  const cats: string[] = ["all"];
  const ft = repo.techStack?.frontend ?? [];
  const bk = repo.techStack?.backend ?? [];
  const topics = repo.topics ?? [];

  if (ft.some((t) => /react/i.test(t))) cats.push("react");
  if (ft.some((t) => /next\.?js/i.test(t))) cats.push("nextjs");
  if (ft.some((t) => /typescript/i.test(t))) cats.push("typescript");
  if (ft.length > 0 && bk.length > 0) cats.push("fullstack");
  if (topics.some((t) => /3d|threejs|webgl|canvas/i.test(t))) cats.push("3d");

  return cats;
}

// ─── 3-D Tilt Card ──────────────────────────────────────────────────────────
function TiltCard({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const rectRef = useRef<DOMRect | null>(null);

  const updateRect = () => {
    if (ref.current) {
      rectRef.current = ref.current.getBoundingClientRect();
    }
  };

  const onMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el) return;
    let rect = rectRef.current;
    if (!rect) {
      rect = el.getBoundingClientRect();
      rectRef.current = rect;
    }
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    el.style.transition = "transform 0.08s linear";
    el.style.transform = `perspective(900px) rotateY(${x * 24}deg) rotateX(${-y * 24}deg) scale3d(1.03,1.03,1.03)`;
    const glint = el.querySelector<HTMLElement>(".tilt-glint");
    if (glint) {
      glint.style.background = `radial-gradient(circle at ${(x + 0.5) * 100}% ${(y + 0.5) * 100}%, rgba(255,255,255,0.12) 0%, transparent 65%)`;
      glint.style.opacity = "1";
    }
  };

  const onLeave = () => {
    const el = ref.current;
    if (!el) return;
    el.style.transition = "transform 0.55s cubic-bezier(.23,1,.32,1)";
    el.style.transform =
      "perspective(900px) rotateY(0deg) rotateX(0deg) scale3d(1,1,1)";
    const glint = el.querySelector<HTMLElement>(".tilt-glint");
    if (glint) glint.style.opacity = "0";
  };

  return (
    <div
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      className={className}
      style={{ transformStyle: "preserve-3d", willChange: "transform" }}
    >
      {/* glint layer — sits on top, pointer-events:none */}
      <div
        className="tilt-glint absolute inset-0 rounded-3xl pointer-events-none z-10"
        style={{ opacity: 0, transition: "opacity 0.2s" }}
      />
      {children}
    </div>
  );
}

export default function GithubProjects({
  username = "riadswebdev",
  maxItems,
  showSearch = true,
}: GithubProjectsProps) {
  const [repos, setRepos] = useState<GithubRepo[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedRepo, setSelectedRepo] = useState<GithubRepo | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedTopic, setSelectedTopic] = useState<string>("all");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const abortControllerRef = useRef<AbortController | null>(null);

  // Parses Markdown sections from README
  const parseReadmeSections = (
    readmeText: string,
    topics: string[] = [],
    language: string | null = null,
  ) => {
    const combinedText = `${readmeText} ${topics.join(" ")} ${language || ""}`;

    // 1. Tech Stack Extraction
    const extractMatches = (keywords: string[]) => {
      const matched = new Set<string>();
      keywords.forEach((keyword) => {
        const regex = new RegExp(
          `\\b${keyword.replace(".", "\\.").replace("+", "\\+")}\\b`,
          "i",
        );
        if (regex.test(combinedText)) {
          matched.add(keyword);
        }
      });
      return Array.from(matched);
    };

    // Deduplication: remove any entry that is a case-insensitive substring of
    // another entry in the same combined set (keeps the most specific term).
    const deduplicateTech = (items: string[]): string[] => {
      const all = [...items];
      return all.filter((item) => {
        const itemLower = item.toLowerCase();
        return !all.some(
          (other) =>
            other !== item &&
            other.toLowerCase().includes(itemLower) &&
            other.length > item.length,
        );
      });
    };

    const rawTechStack: ParsedTechStack = {
      frontend: extractMatches(TECH_DICTIONARY.frontend),
      backend: extractMatches(TECH_DICTIONARY.backend),
      database: extractMatches(TECH_DICTIONARY.database),
      devTools: extractMatches(TECH_DICTIONARY.devTools),
    };

    // Run deduplication across all categories together so cross-category
    // duplicates (e.g. "React" vs "React 19") are also handled.
    const allRaw = [
      ...rawTechStack.frontend,
      ...rawTechStack.backend,
      ...rawTechStack.database,
      ...rawTechStack.devTools,
    ];
    const dedupedAll = deduplicateTech(allRaw);

    const techStack: ParsedTechStack = {
      frontend: rawTechStack.frontend.filter((t) => dedupedAll.includes(t)),
      backend: rawTechStack.backend.filter((t) => dedupedAll.includes(t)),
      database: rawTechStack.database.filter((t) => dedupedAll.includes(t)),
      devTools: rawTechStack.devTools.filter((t) => dedupedAll.includes(t)),
    };

    // Extract Live Demo Link
    let liveUrl: string | null = null;
    if (readmeText) {
      const liveLinkMatch =
        /Live Website.*?\]\((https?:\/\/[^\s\)]+)\)/i.exec(readmeText) ||
        /\[(?:Live Demo|Live Site|Website)\]\((https?:\/\/[^\s\)]+)\)/i.exec(
          readmeText,
        ) ||
        /https?:\/\/[a-zA-Z0-9-]+\.vercel\.app[^\s\)]*/i.exec(readmeText);
      if (liveLinkMatch) {
        liveUrl = liveLinkMatch[1] || liveLinkMatch[0];
      }
    }

    // 2. Key Features Extraction from README "## Key Features" section
    const keyFeatures: string[] = [];
    let extractedOverview: string | null = null;

    if (readmeText) {
      // Extract Overview section (## Overview) or top intro paragraph
      const overviewSectionRegex = /##\s*.*?Overview([\s\S]*?)(?=##|\n---|$)/i;
      const overviewMatch = overviewSectionRegex.exec(readmeText);

      if (overviewMatch && overviewMatch[1]) {
        const textBlock = overviewMatch[1]
          .split("\n")
          .map((line) => line.trim())
          .filter(
            (line) =>
              line.length > 0 &&
              !line.startsWith("#") &&
              !line.startsWith("-") &&
              !line.startsWith("!["),
          )
          .join(" ");

        if (textBlock.length > 0) {
          const sentences = textBlock.match(/[^.!?]+[.!?]+/g) || [textBlock];
          extractedOverview = sentences.slice(0, 2).join(" ").trim();
        }
      }

      // Fallback: If no explicit Overview heading exists, extract first non-heading, non-image text paragraph
      if (!extractedOverview) {
        const paragraphs = readmeText
          .split("\n\n")
          .map((p) => p.trim())
          .filter(
            (p) =>
              p.length > 20 &&
              !p.startsWith("#") &&
              !p.startsWith("![") &&
              !p.startsWith("<") &&
              !p.startsWith("-") &&
              !p.startsWith("*"),
          );

        if (paragraphs.length > 0) {
          const sentences = paragraphs[0].match(/[^.!?]+[.!?]+/g) || [
            paragraphs[0],
          ];
          extractedOverview = sentences.slice(0, 2).join(" ").trim();
        }
      }

      // Extract Key Features
      const featuresSectionRegex =
        /##\s*.*?Key Features([\s\S]*?)(?=##|\n---|$)/i;
      const match = featuresSectionRegex.exec(readmeText);
      if (match && match[1]) {
        const lines = match[1].split("\n");
        lines.forEach((line) => {
          const trimmed = line.trim();
          if (
            trimmed.startsWith("- ") ||
            trimmed.startsWith("* ") ||
            trimmed.startsWith("### ")
          ) {
            const cleanLine = trimmed
              .replace(/^[-*#]+\s*/, "")
              .replace(/[*_~]/g, "")
              .trim();
            if (cleanLine.length > 5 && !keyFeatures.includes(cleanLine)) {
              keyFeatures.push(cleanLine);
            }
          }
        });
      }
    }

    return { techStack, keyFeatures, extractedOverview, liveUrl };
  };

  useEffect(() => {
    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    const loadGithubRepos = async () => {
      const cacheKey = username;
      const cached = repoCache.get(cacheKey);
      if (cached) {
        setRepos(cached);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        if (!repoFetchPromises.has(cacheKey)) {
          const promise = (async () => {
            const response = await fetch(
              `/api/github?username=${encodeURIComponent(username)}`,
              {
                signal: abortController.signal,
              },
            );

            if (!response.ok) {
              const body = await response.json().catch(() => null);
              const message =
                body?.error || `GitHub API returned status ${response.status}`;
              throw new Error(message);
            }

            const data = (await response.json()) as GithubRepo[];

            // Only cache successful non-empty results to avoid caching transient empty arrays
            if (Array.isArray(data) && data.length > 0) {
              repoCache.set(cacheKey, data);
            }

            return data;
          })();

          // Ensure failed promises are removed so future retries can run
          promise.catch(() => {
            repoFetchPromises.delete(cacheKey);
          });

          repoFetchPromises.set(cacheKey, promise);
        }

        const data = await repoFetchPromises.get(cacheKey)!;
        // If API returned non-empty array use it; otherwise fallback to any existing cached value
        const finalData = Array.isArray(data) && data.length > 0 ? data : (repoCache.get(cacheKey) ?? data);
        setRepos(finalData as GithubRepo[]);
      } catch (err: any) {
        if (err.name === "AbortError") return;
        setError(err.message || "Failed to load GitHub repositories.");
      } finally {
        setLoading(false);
      }
    };

    loadGithubRepos();
    return () => {
      abortController.abort();
    };
  }, [username]);

  // Extract all unique topics/tags across repos
  const allTopics = Array.from(
    new Set(repos.flatMap((repo) => repo.topics || [])),
  );

  // Which categories actually have repos (to show/hide buttons dynamically)
  const availableCategories = CATEGORIES.filter(
    (cat) =>
      cat.id === "all" ||
      repos.some((r) => getRepoCategories(r).includes(cat.id)),
  );

  // Filter repos based on search, topic, and category
  const filteredRepos = repos.filter((repo) => {
    const matchesSearch =
      repo.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (repo.description &&
        repo.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (repo.language &&
        repo.language.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesTopic =
      selectedTopic === "all" ||
      (repo.topics && repo.topics.includes(selectedTopic));

    const matchesCategory =
      selectedCategory === "all" ||
      getRepoCategories(repo).includes(selectedCategory);

    return matchesSearch && matchesTopic && matchesCategory;
  });

  const openModal = (repo: GithubRepo) => {
    setSelectedRepo(repo);
    setIsModalOpen(true);
    document.body.style.overflow = "hidden";
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedRepo(null);
    document.body.style.overflow = "auto";
  };

  // Apply maxItems cap after filtering
  const displayedRepos =
    maxItems ? filteredRepos.slice(0, maxItems) : filteredRepos;
  const hasMore = maxItems ? filteredRepos.length > maxItems : false;

  return (
    <section id="projects" className="pb-10 px-6 max-w-7xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 28 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: false, margin: "-80px" }}
        transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6"
      >
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-xs font-mono text-blue-400">
            <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
            Live GitHub API Integration
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
            GitHub Portfolio Projects
          </h2>
        </div>

        {/* Search — hidden on homepage preview */}
        {showSearch && (
          <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
            <div className="relative">
              <input
                type="text"
                placeholder="Search projects..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full sm:w-64 px-4 py-2 bg-zinc-900/80 border border-zinc-800 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500 transition-colors"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-100 hover:text-white text-xs cursor-pointer"
                >
                  ✕
                </button>
              )}
            </div>
          </div>
        )}
      </motion.div>

      {/* ── Category Filter Bar ─────────────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-2 mb-5">
        {availableCategories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => {
              setSelectedCategory(cat.id);
              setSelectedTopic("all");
            }}
            className={`px-4 py-2 rounded-full text-xs font-semibold transition-all duration-200 cursor-pointer ${
              selectedCategory === cat.id ?
                "bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-lg shadow-cyan-500/30 scale-105"
              : "bg-zinc-900/60 border border-zinc-800 text-zinc-100 hover:text-white hover:border-zinc-600 hover:bg-zinc-800/60"
            }`}
          >
            {cat.label}
            {cat.id === "all" && (
              <span className="ml-1.5 opacity-60">({repos.length})</span>
            )}
          </button>
        ))}
      </div>

      {/* ── Topic Pills (secondary filter) ─────────────────────────── */}
      {allTopics.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 mb-10 pb-2 overflow-x-auto scrollbar-none">
          <button
            onClick={() => setSelectedTopic("all")}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
              selectedTopic === "all" ?
                "bg-zinc-700 text-white"
              : "bg-zinc-900/60 border border-zinc-800 text-zinc-500 hover:text-zinc-300 hover:border-zinc-700"
            }`}
          >
            All Topics
          </button>
          {allTopics.map((topic) => (
            <button
              key={topic}
              onClick={() => setSelectedTopic(topic)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                selectedTopic === topic ?
                  "bg-zinc-700 text-white"
                : "bg-zinc-900/60 border border-zinc-800 text-zinc-500 hover:text-zinc-300 hover:border-zinc-700"
              }`}
            >
              #{topic}
            </button>
          ))}
        </div>
      )}

      {/* Loading state: Card-level skeleton loading spinner with semi-transparent background */}
      {loading && (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {Array.from({ length: maxItems || 6 }).map((_, idx) => (
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
      )}

      {/* Error State */}
      {!loading && error && (
        <div className="p-8 rounded-3xl bg-red-950/20 border border-red-900/40 text-center max-w-md mx-auto my-12 space-y-4">
          <p className="text-red-400 text-sm font-medium leading-relaxed">
            {error}
          </p>
          <div className="flex justify-center gap-3">
            <button
              onClick={() => window.location.reload()}
              className="px-5 py-2 rounded-xl bg-red-600 text-white text-xs font-semibold hover:bg-red-500 transition-colors cursor-pointer"
            >
              Retry
            </button>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && filteredRepos.length === 0 && (
        <div className="p-12 text-center border border-dashed border-zinc-800 rounded-3xl max-w-lg mx-auto">
          <p className="text-zinc-100 text-sm">
            No repositories found matching your filters.
          </p>
          <button
            onClick={() => {
              setSearchQuery("");
              setSelectedTopic("all");
              setSelectedCategory("all");
            }}
            className="mt-4 px-4 py-2 rounded-xl bg-zinc-800 text-zinc-300 hover:text-white text-xs font-medium transition-colors cursor-pointer"
          >
            Reset Filters
          </button>
        </div>
      )}

      {/* Repo Cards Grid */}
      {!loading && !error && displayedRepos.length > 0 && (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {displayedRepos.map((repo, index) => {
            return (
              <motion.div
                key={repo.id}
                initial={{ opacity: 0, y: 48 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: false, margin: "-60px 0px -60px 0px" }}
                transition={{
                  duration: 0.52,
                  delay: (index % 3) * 0.1,
                  ease: [0.22, 1, 0.36, 1],
                }}
              >
                <TiltCard className="relative group p-6 rounded-3xl bg-[#060a12]/60 backdrop-blur-md border border-white/10 hover:border-cyan-500/40 hover:shadow-2xl hover:shadow-cyan-500/10 transition-all duration-300 flex flex-col justify-between overflow-hidden h-full">
                  <div>
                    {/* Banner image or preview fallback */}
                    <div className="relative w-full h-48 rounded-2xl bg-zinc-950 overflow-hidden mb-5 border border-zinc-800/60 flex items-center justify-center">
                      {repo.bannerUrl ?
                        <img
                          src={repo.bannerUrl}
                          alt={repo.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = "none";
                          }}
                        />
                      : <div className="p-6 text-center space-y-2">
                          <span className="text-4xl">⚡</span>
                          <p className="text-xs font-mono text-zinc-500 uppercase tracking-widest">
                            {repo.language || "Code Repository"}
                          </p>
                        </div>
                      }
                      {/* Repo Stats Badge */}
                      <div className="absolute top-3 right-3 flex items-center gap-2 px-2.5 py-1 rounded-full bg-zinc-950/80 backdrop-blur-md border border-zinc-800 text-[11px] font-mono text-zinc-300">
                        <span className="flex items-center gap-1 text-amber-400">
                          ★ {repo.stargazers_count}
                        </span>
                        <span className="text-zinc-600">•</span>
                        <span className="flex items-center gap-1 text-blue-400">
                          🔀 {repo.forks_count}
                        </span>
                      </div>
                    </div>

                    {/* Title & Description Only */}
                    <div className="space-y-2 mb-6">
                      <h3 className="text-xl font-bold text-white group-hover:text-blue-400 transition-colors truncate">
                        {repo.name}
                      </h3>

                      <p className="text-zinc-100 text-xs leading-relaxed font-light line-clamp-3">
                        {repo.description ||
                          "No description provided for this GitHub repository."}
                      </p>
                    </div>
                  </div>

                  {/* Card Footer Action */}
                  <div className="pt-4 border-t border-zinc-800/60 flex items-center justify-between">
                    <a
                      href={repo.liveUrl || repo.html_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-cyan-400 hover:text-cyan-300 font-mono flex items-center gap-1 transition-colors"
                    >
                      Live Demo ↗
                    </a>

                    <button
                      onClick={() => openModal(repo)}
                      className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white text-xs font-semibold shadow-lg shadow-cyan-500/20 transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      View Details
                      <svg
                        className="w-3.5 h-3.5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </button>
                  </div>
                </TiltCard>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* View All Projects CTA — only shown on homepage when capped */}
      {!loading && !error && hasMore && (
        <div className="mt-12 flex justify-center">
          <Link
            href="/project"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white text-sm font-semibold shadow-lg shadow-cyan-500/20 transition-all hover:-translate-y-0.5 cursor-pointer"
          >
            View All Projects
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 8l4 4m0 0l-4 4m4-4H3"
              />
            </svg>
          </Link>
        </div>
      )}

      {/* Details Modal - Styled after reference mockup */}
      {isModalOpen && selectedRepo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-8 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-4xl max-h-[90vh] bg-[#0b1329] border border-cyan-500/20 rounded-3xl shadow-2xl flex flex-col overflow-hidden text-zinc-100">
            {/* Close Button Floating Top-Right */}
            <button
              onClick={closeModal}
              className="absolute top-4 right-4 z-20 w-9 h-9 rounded-full bg-black/60 border border-white/10 flex items-center justify-center text-zinc-300 hover:text-white hover:bg-black transition-colors cursor-pointer"
            >
              ✕
            </button>

            {/* Modal Body (Scrollable) */}
            <div className="p-6 sm:p-8 overflow-y-auto space-y-8 flex-1">
              {/* Banner Image Preview */}
              {selectedRepo.bannerUrl && (
                <div className="relative w-full h-64 sm:h-80 rounded-2xl overflow-hidden border border-cyan-500/20 bg-zinc-950">
                  <img
                    src={selectedRepo.bannerUrl}
                    alt={selectedRepo.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0b1329] via-transparent to-transparent opacity-80" />
                </div>
              )}

              {/* Title & Badge */}
              <div className="space-y-3">
                <h3 className="text-3xl font-extrabold text-white tracking-tight">
                  {selectedRepo.name}
                </h3>
                <div className="inline-flex items-center px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-xs font-mono text-cyan-400">
                  Full Stack Project
                </div>
              </div>

              {/* Main Technology Stack */}
              <div>
                <h4 className="text-sm font-semibold text-white mb-3">
                  Main Technology Stack
                </h4>
                <div className="flex flex-wrap gap-2">
                  {[
                    ...selectedRepo.techStack.frontend,
                    ...selectedRepo.techStack.backend,
                    ...selectedRepo.techStack.database,
                    ...selectedRepo.techStack.devTools,
                  ].map((tech, idx) => (
                    <span
                      key={idx}
                      className="px-3.5 py-1.5 rounded-xl bg-cyan-950/40 border border-cyan-500/30 text-xs font-mono text-cyan-300"
                    >
                      {tech}
                    </span>
                  ))}
                  {selectedRepo.techStack.frontend.length === 0 &&
                    selectedRepo.techStack.backend.length === 0 &&
                    selectedRepo.techStack.database.length === 0 &&
                    selectedRepo.language && (
                      <span className="px-3 py-1 rounded-xl bg-cyan-950/40 border border-cyan-500/30 text-xs font-mono text-cyan-300">
                        {selectedRepo.language}
                      </span>
                    )}
                </div>
              </div>

              {/* Brief Description */}
              <div>
                <h4 className="text-sm font-semibold text-white mb-2">
                  Brief Description
                </h4>
                <p className="text-zinc-300 text-sm leading-relaxed font-light">
                  {selectedRepo.description ||
                    "No detailed description provided."}
                </p>
              </div>

              {/* Project Links Action Buttons */}
              <div>
                <h4 className="text-sm font-semibold text-white mb-3">
                  Project Links
                </h4>
                <div className="flex flex-wrap gap-3">
                  {selectedRepo.liveUrl && (
                    <a
                      href={selectedRepo.liveUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-5 py-2.5 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-semibold text-xs transition-colors flex items-center gap-2"
                    >
                      <span>🌐</span> Live Project
                    </a>
                  )}
                  <a
                    href={selectedRepo.html_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 hover:border-slate-500 text-white font-semibold text-xs transition-colors flex items-center gap-2"
                  >
                    <span>📁</span> GitHub Repository
                  </a>
                </div>
              </div>

              {/* Key Features / Highlights */}
              {selectedRepo.keyFeatures &&
                selectedRepo.keyFeatures.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold text-white mb-3">
                      Key Features & Highlights
                    </h4>
                    <div className="space-y-2">
                      {selectedRepo.keyFeatures.map((feature, i) => (
                        <div
                          key={i}
                          className="flex items-start gap-2.5 text-xs text-zinc-300 leading-relaxed"
                        >
                          <span className="w-4 h-4 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center shrink-0 text-[10px] mt-0.5">
                            ✓
                          </span>
                          <span>{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              {/* Extracted Project Screenshots / Gallery */}
              {selectedRepo.imagesInReadme &&
                selectedRepo.imagesInReadme.length > 1 && (
                  <div>
                    <h4 className="text-sm font-semibold text-white mb-4">
                      Project Gallery & Screenshots
                    </h4>
                    <div className="grid sm:grid-cols-2 gap-4">
                      {selectedRepo.imagesInReadme.slice(1).map((imgUrl, i) => (
                        <div
                          key={i}
                          className="relative rounded-2xl overflow-hidden border border-slate-800 bg-zinc-900 group"
                        >
                          <img
                            src={imgUrl}
                            alt={`${selectedRepo.name} screenshot ${i + 1}`}
                            className="w-full h-auto object-cover"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
