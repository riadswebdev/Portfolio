"use client";

import { useEffect, useState } from "react";

export interface ParsedTechStack {
  frontend: string[];
  backend: string[];
  database: string[];
  devTools: string[];
}

export interface GithubRepo {
  id: number;
  name: string;
  full_name: string;
  html_url: string;
  description: string | null;
  stargazers_count: number;
  forks_count: number;
  language: string | null;
  topics: string[];
  updated_at: string;
  bannerUrl?: string | null;
  readmeContent?: string | null;
  imagesInReadme?: string[];
  default_branch: string;
  techStack: ParsedTechStack;
  keyFeatures: string[];
  liveUrl?: string | null;
}

interface GithubProjectsProps {
  username?: string;
  /** Cap the number of cards displayed (homepage preview) */
  maxItems?: number;
  /** Show the search input (default true) */
  showSearch?: boolean;
}

// Tech keywords dictionary for README parsing
const TECH_DICTIONARY = {
  frontend: [
    "Next.js 16", "Next.js", "React 19", "React.js", "React", "Vue.js", "Vue", "Angular", "Svelte", 
    "TypeScript", "JavaScript", "HTML5", "HTML", "CSS3", "CSS", "Tailwind CSS 4", "Tailwind CSS", "TailwindCSS", "Tailwind", 
    "HeroUI", "DaisyUI", "Framer Motion", "Lucide React", "React Icons", "next-themes", "Redux", "Zustand", "Bootstrap"
  ],
  backend: [
    "Better Auth", "Google OAuth", "Stripe API", "Stripe", "Node.js", "Node", "Express.js", "Express", "NestJS", 
    "Python", "Django", "Flask", "FastAPI", "Java", "Spring Boot", "Go", "Golang", "PHP", "Laravel", 
    "REST API", "GraphQL", "JWT", "OAuth"
  ],
  database: [
    "MongoDB", "Mongoose", "PostgreSQL", "Postgres", "MySQL", "SQLite", 
    "Redis", "Prisma", "Supabase", "Firebase", "Firestore", "DynamoDB", "CockroachDB"
  ],
  devTools: [
    "ESLint", "React Compiler", "Vercel", "Docker", "Git", "GitHub", "Postman", "Render", "Webpack", "Vite", "Turbopack"
  ]
};

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

  // Parses Markdown sections from README
  const parseReadmeSections = (readmeText: string, topics: string[] = [], language: string | null = null) => {
    const combinedText = `${readmeText} ${topics.join(" ")} ${language || ""}`;
    
    // 1. Tech Stack Extraction
    const extractMatches = (keywords: string[]) => {
      const matched = new Set<string>();
      keywords.forEach((keyword) => {
        const regex = new RegExp(`\\b${keyword.replace(".", "\\.").replace("+", "\\+")}\\b`, "i");
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
            other.length > item.length
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
      const liveLinkMatch = /Live Website.*?\]\((https?:\/\/[^\s\)]+)\)/i.exec(readmeText) ||
                            /\[(?:Live Demo|Live Site|Website)\]\((https?:\/\/[^\s\)]+)\)/i.exec(readmeText) ||
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
          .filter((line) => line.length > 0 && !line.startsWith("#") && !line.startsWith("-") && !line.startsWith("!["))
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
              !p.startsWith("*")
          );

        if (paragraphs.length > 0) {
          const sentences = paragraphs[0].match(/[^.!?]+[.!?]+/g) || [paragraphs[0]];
          extractedOverview = sentences.slice(0, 2).join(" ").trim();
        }
      }

      // Extract Key Features
      const featuresSectionRegex = /##\s*.*?Key Features([\s\S]*?)(?=##|\n---|$)/i;
      const match = featuresSectionRegex.exec(readmeText);
      if (match && match[1]) {
        const lines = match[1].split("\n");
        lines.forEach((line) => {
          const trimmed = line.trim();
          if (trimmed.startsWith("- ") || trimmed.startsWith("* ") || trimmed.startsWith("### ")) {
            const cleanLine = trimmed.replace(/^[-*#]+\s*/, "").replace(/[*_~]/g, "").trim();
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
    async function fetchReposAndDetails() {
      try {
        setLoading(true);
        setError(null);

        // Include Personal Access Token if defined to prevent 403 Rate Limit errors
        const headers: Record<string, string> = {
          Accept: "application/vnd.github.v3+json",
        };
        const token = process.env.NEXT_PUBLIC_GITHUB_TOKEN;
        if (token && token.trim() !== "") {
          headers["Authorization"] = `token ${token.trim()}`;
        }

        // Fetch user repositories from GitHub API
        const response = await fetch(
          `https://api.github.com/users/${username}/repos?sort=updated&per_page=30`,
          { headers }
        );

        if (response.status === 403) {
          throw new Error("GitHub API Rate Limit exceeded (403). Add NEXT_PUBLIC_GITHUB_TOKEN in .env.local to resolve.");
        }

        if (!response.ok) {
          throw new Error(`GitHub API returned status ${response.status}`);
        }
        const data: any[] = await response.json();

        // Filter non-fork repositories
        const nonForkRepos = data.filter((repo) => !repo.fork);

        // Fetch README details for each repo in parallel
        const enrichedRepos = await Promise.all(
          nonForkRepos.map(async (repo) => {
            let bannerUrl: string | null = null;
            let readmeContent: string | null = null;
            let imagesInReadme: string[] = [];
            let techStack: ParsedTechStack = { frontend: [], backend: [], database: [], devTools: [] };
            let keyFeatures: string[] = [];

            try {
              // Try fetching raw README file (checking README.md, readme.md, Readme.md)
              const readmeVariants = ["README.md", "readme.md", "Readme.md"];
              for (const variant of readmeVariants) {
                const readmeRes = await fetch(
                  `https://raw.githubusercontent.com/${repo.full_name}/${repo.default_branch || "main"}/${variant}`
                );
                if (readmeRes.ok) {
                  readmeContent = await readmeRes.text();
                  break;
                }
              }

              // Fallback to GitHub Contents API if raw raw.githubusercontent fetch failed
              if (!readmeContent) {
                const apiReadmeRes = await fetch(
                  `https://api.github.com/repos/${repo.full_name}/readme`,
                  { headers }
                );
                if (apiReadmeRes.ok) {
                  const readmeJson = await apiReadmeRes.json();
                  if (readmeJson.content) {
                    readmeContent = atob(readmeJson.content.replace(/\s/g, ""));
                  }
                }
              }

              if (readmeContent) {
                // Extract images using regex (Markdown & HTML img tags)
                const mdImageRegex = /!\[.*?\]\((https?:\/\/[^\s\)]+|\/[^\s\)]+|\.\/[^\s\)]+|[^\s\)]+)\)/g;
                const htmlImageRegex = /<img[^>]+src=["'](https?:\/\/[^"']+|\/[^"']+|\.\/[^"']+|[^"']+)["']/g;

                const extracted: string[] = [];
                let match;

                const cleanImagePath = (pathStr: string) => {
                  let cleaned = pathStr.trim();
                  if (cleaned.startsWith("./")) cleaned = cleaned.substring(2);
                  if (cleaned.startsWith("/")) cleaned = cleaned.substring(1);
                  if (!cleaned.startsWith("http")) {
                    cleaned = `https://raw.githubusercontent.com/${repo.full_name}/${repo.default_branch || "main"}/${cleaned}`;
                  }
                  return cleaned;
                };

                while ((match = mdImageRegex.exec(readmeContent)) !== null) {
                  extracted.push(cleanImagePath(match[1]));
                }

                while ((match = htmlImageRegex.exec(readmeContent)) !== null) {
                  extracted.push(cleanImagePath(match[1]));
                }

                imagesInReadme = Array.from(new Set(extracted));
                if (imagesInReadme.length > 0) {
                  bannerUrl = imagesInReadme[0];
                }
              }
            } catch (err) {
              console.warn(`Could not fetch README for ${repo.name}:`, err);
            }

            // Parse Tech Stack, Overview Summary & Key Features directly from README content
            const parsedData = parseReadmeSections(readmeContent || "", repo.topics || [], repo.language);
            techStack = parsedData.techStack;
            keyFeatures = parsedData.keyFeatures;
            const liveUrl = parsedData.liveUrl || repo.html_url;

            // Use extracted Overview section sentences as repo description if repo.description is null/empty
            const description = parsedData.extractedOverview || repo.description || null;

            return {
              ...repo,
              description,
              bannerUrl,
              readmeContent,
              imagesInReadme,
              techStack,
              keyFeatures,
              liveUrl,
            } as GithubRepo;
          })
        );

        // Filter to include only repositories that have a valid README.md file
        const reposWithReadme = enrichedRepos.filter(
          (repo) => repo.readmeContent && repo.readmeContent.trim().length > 0
        );

        setRepos(reposWithReadme);
      } catch (err: any) {
        setError(err.message || "Failed to load GitHub repositories.");
      } finally {
        setLoading(false);
      }
    }

    fetchReposAndDetails();
  }, [username]);

  // Extract all unique topics/tags across repos
  const allTopics = Array.from(
    new Set(repos.flatMap((repo) => repo.topics || []))
  );

  // Filter repos based on search and topic tab
  const filteredRepos = repos.filter((repo) => {
    const matchesSearch =
      repo.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (repo.description && repo.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (repo.language && repo.language.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesTopic =
      selectedTopic === "all" || (repo.topics && repo.topics.includes(selectedTopic));

    return matchesSearch && matchesTopic;
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
  const displayedRepos = maxItems ? filteredRepos.slice(0, maxItems) : filteredRepos;
  const hasMore = maxItems ? filteredRepos.length > maxItems : false;

  return (
    <section id="projects" className="py-24 px-6 max-w-7xl mx-auto border-t border-zinc-900">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-xs font-mono text-blue-400">
            <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
            Live GitHub API Integration
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
            GitHub Portfolio Projects
          </h2>
          <p className="text-zinc-400 text-sm max-w-xl">
            Dynamically retrieved from{" "}
            <a
              href={`https://github.com/${username}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 underline hover:text-blue-300"
            >
              @{username}
            </a>
            . Parsed by Frontend, Backend, Database, Dev Tools, and Key Features.
          </p>
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
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white text-xs"
                >
                  ✕
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Topics Filter Bar */}
      {allTopics.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 mb-10 pb-2 overflow-x-auto scrollbar-none">
          <button
            onClick={() => setSelectedTopic("all")}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              selectedTopic === "all"
                ? "bg-blue-600 text-white shadow-lg shadow-blue-600/30"
                : "bg-zinc-900/60 border border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700"
            }`}
          >
            All Topics ({repos.length})
          </button>
          {allTopics.map((topic) => (
            <button
              key={topic}
              onClick={() => setSelectedTopic(topic)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                selectedTopic === topic
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-600/30"
                  : "bg-zinc-900/60 border border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700"
              }`}
            >
              #{topic}
            </button>
          ))}
        </div>
      )}

      {/* Loading state */}
      {loading && (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1, 2, 3, 4, 5, 6].map((idx) => (
            <div
              key={idx}
              className="p-6 rounded-3xl bg-zinc-900/40 border border-zinc-800/60 animate-pulse flex flex-col justify-between h-96"
            >
              <div className="space-y-4">
                <div className="h-44 bg-zinc-800/50 rounded-2xl w-full" />
                <div className="h-6 bg-zinc-800/50 rounded w-3/4" />
                <div className="h-4 bg-zinc-800/50 rounded w-full" />
                <div className="h-4 bg-zinc-800/50 rounded w-2/3" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Error State */}
      {!loading && error && (
        <div className="p-8 rounded-3xl bg-red-950/20 border border-red-900/40 text-center max-w-md mx-auto my-12 space-y-4">
          <p className="text-red-400 text-sm font-medium leading-relaxed">{error}</p>
          <div className="flex justify-center gap-3">
            <button
              onClick={() => window.location.reload()}
              className="px-5 py-2 rounded-xl bg-red-600 text-white text-xs font-semibold hover:bg-red-500 transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && filteredRepos.length === 0 && (
        <div className="p-12 text-center border border-dashed border-zinc-800 rounded-3xl max-w-lg mx-auto">
          <p className="text-zinc-400 text-sm">No repositories found matching your filters.</p>
          <button
            onClick={() => {
              setSearchQuery("");
              setSelectedTopic("all");
            }}
            className="mt-4 px-4 py-2 rounded-xl bg-zinc-800 text-zinc-300 hover:text-white text-xs font-medium transition-colors"
          >
            Reset Filters
          </button>
        </div>
      )}

      {/* Repo Cards Grid */}
      {!loading && !error && displayedRepos.length > 0 && (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {displayedRepos.map((repo) => {
            return (
              <div
                key={repo.id}
                className="group p-6 rounded-3xl bg-zinc-900/30 border border-zinc-800/80 hover:border-blue-500/50 hover:bg-zinc-900/60 transition-all duration-300 hover:-translate-y-1.5 flex flex-col justify-between overflow-hidden shadow-xl"
              >
                <div>
                  {/* Banner image or preview fallback */}
                  <div className="relative w-full h-48 rounded-2xl bg-zinc-950 overflow-hidden mb-5 border border-zinc-800/60 flex items-center justify-center">
                    {repo.bannerUrl ? (
                      <img
                        src={repo.bannerUrl}
                        alt={repo.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = "none";
                        }}
                      />
                    ) : (
                      <div className="p-6 text-center space-y-2">
                        <span className="text-4xl">⚡</span>
                        <p className="text-xs font-mono text-zinc-500 uppercase tracking-widest">
                          {repo.language || "Code Repository"}
                        </p>
                      </div>
                    )}
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

                    <p className="text-zinc-400 text-xs leading-relaxed font-light line-clamp-3">
                      {repo.description || "No description provided for this GitHub repository."}
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
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white text-xs font-semibold shadow-lg shadow-cyan-500/20 transition-all flex items-center gap-1.5"
                  >
                    View Details
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* View All Projects CTA — only shown on homepage when capped */}
      {!loading && !error && hasMore && (
        <div className="mt-12 flex justify-center">
          <a
            href="/project"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white text-sm font-semibold shadow-lg shadow-cyan-500/20 transition-all hover:-translate-y-0.5"
          >
            View All Projects
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </a>
        </div>
      )}

      {/* Details Modal - Styled after reference mockup */}
      {isModalOpen && selectedRepo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-8 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-4xl max-h-[90vh] bg-[#0b1329] border border-cyan-500/20 rounded-3xl shadow-2xl flex flex-col overflow-hidden text-zinc-100">
            
            {/* Close Button Floating Top-Right */}
            <button
              onClick={closeModal}
              className="absolute top-4 right-4 z-20 w-9 h-9 rounded-full bg-black/60 border border-white/10 flex items-center justify-center text-zinc-300 hover:text-white hover:bg-black transition-colors"
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
                <h4 className="text-sm font-semibold text-white mb-3">Main Technology Stack</h4>
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
                <h4 className="text-sm font-semibold text-white mb-2">Brief Description</h4>
                <p className="text-zinc-300 text-sm leading-relaxed font-light">
                  {selectedRepo.description || "No detailed description provided."}
                </p>
              </div>

              {/* Project Links Action Buttons */}
              <div>
                <h4 className="text-sm font-semibold text-white mb-3">Project Links</h4>
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
              {selectedRepo.keyFeatures && selectedRepo.keyFeatures.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-white mb-3">Key Features & Highlights</h4>
                  <div className="space-y-2">
                    {selectedRepo.keyFeatures.map((feature, i) => (
                      <div key={i} className="flex items-start gap-2.5 text-xs text-zinc-300 leading-relaxed">
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
              {selectedRepo.imagesInReadme && selectedRepo.imagesInReadme.length > 1 && (
                <div>
                  <h4 className="text-sm font-semibold text-white mb-4">Project Gallery & Screenshots</h4>
                  <div className="grid sm:grid-cols-2 gap-4">
                    {selectedRepo.imagesInReadme.slice(1).map((imgUrl, i) => (
                      <div key={i} className="relative rounded-2xl overflow-hidden border border-slate-800 bg-zinc-900 group">
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
