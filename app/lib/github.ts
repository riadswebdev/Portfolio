export interface ParsedTechStack {
  frontend: string[];
  backend: string[];
  database: string[];
  devTools: string[];
}

export const TECH_DICTIONARY: Record<
  "frontend" | "backend" | "database" | "devTools",
  string[]
> = {
  frontend: [
    "Next.js 16",
    "Next.js",
    "React 19",
    "React.js",
    "React",
    "Vue.js",
    "Vue",
    "Angular",
    "Svelte",
    "TypeScript",
    "JavaScript",
    "HTML5",
    "HTML",
    "CSS3",
    "CSS",
    "Tailwind CSS 4",
    "Tailwind CSS",
    "TailwindCSS",
    "Tailwind",
    "HeroUI",
    "DaisyUI",
    "Framer Motion",
    "Lucide React",
    "React Icons",
    "next-themes",
    "Redux",
    "Zustand",
    "Bootstrap",
  ],
  backend: [
    "Better Auth",
    "Google OAuth",
    "Stripe API",
    "Stripe",
    "Node.js",
    "Node",
    "Express.js",
    "Express",
    "NestJS",
    "Python",
    "Django",
    "Flask",
    "FastAPI",
    "Java",
    "Spring Boot",
    "Go",
    "Golang",
    "PHP",
    "Laravel",
    "REST API",
    "GraphQL",
    "JWT",
    "OAuth",
  ],
  database: [
    "MongoDB",
    "Mongoose",
    "PostgreSQL",
    "Postgres",
    "MySQL",
    "SQLite",
    "Redis",
    "Prisma",
    "Supabase",
    "Firebase",
    "Firestore",
    "DynamoDB",
    "CockroachDB",
  ],
  devTools: [
    "ESLint",
    "React Compiler",
    "Vercel",
    "Docker",
    "Git",
    "GitHub",
    "Postman",
    "Render",
    "Webpack",
    "Vite",
    "Turbopack",
  ],
};

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
  imagesInReadme?: string[];
  default_branch: string;
  techStack: ParsedTechStack;
  keyFeatures: string[];
  liveUrl?: string | null;
}

export interface ReadmeParseResult {
  techStack: ParsedTechStack;
  keyFeatures: string[];
  extractedOverview: string | null;
  liveUrl: string | null;
}

function escapeKeyword(keyword: string) {
  return keyword.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function parseReadmeSections(
  readmeText: string,
  topics: string[] = [],
  language: string | null = null,
): ReadmeParseResult {
  const combinedText = `${readmeText} ${topics.join(" ")} ${language || ""}`;

  const extractMatches = (keywords: string[]) => {
    const matched = new Set<string>();
    keywords.forEach((keyword) => {
      const regex = new RegExp(`\\b${escapeKeyword(keyword)}\\b`, "i");
      if (regex.test(combinedText)) {
        matched.add(keyword);
      }
    });
    return Array.from(matched);
  };

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

  let liveUrl: string | null = null;
  if (readmeText) {
    const liveLinkMatch =
      /Live Website.*?\]\((https?:\/\/[^\s)]+)\)/i.exec(readmeText) ??
      /\[(?:Live Demo|Live Site|Website)\]\((https?:\/\/[^\s)]+)\)/i.exec(
        readmeText,
      ) ??
      /https?:\/\/[a-zA-Z0-9-]+\.vercel\.app[^\s)]*/i.exec(readmeText);
    if (liveLinkMatch) {
      liveUrl = liveLinkMatch[1] ?? liveLinkMatch[0];
    }
  }

  let extractedOverview: string | null = null;
  if (readmeText) {
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
  }

  const keyFeatures: string[] = [];
  if (readmeText) {
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
}

function cleanImagePath(
  pathStr: string,
  repoFullName: string,
  defaultBranch: string,
) {
  let cleaned = pathStr.trim();
  if (cleaned.startsWith("./")) cleaned = cleaned.substring(2);
  if (cleaned.startsWith("/")) cleaned = cleaned.substring(1);
  if (!cleaned.startsWith("http")) {
    cleaned = `https://raw.githubusercontent.com/${repoFullName}/${defaultBranch}/${cleaned}`;
  }
  return cleaned;
}

export function extractReadmeImages(
  readmeContent: string,
  repoFullName: string,
  defaultBranch: string,
) {
  const mdImageRegex =
    /!\[.*?\]\((https?:\/\/[^\s)]+|\/[^\s)]+|\.\/[^\s)]+|[^\s)]+)\)/g;
  const htmlImageRegex =
    /<img[^>]+src=["'](https?:\/\/[^"']+|\/[^"']+|\.\/[^"']+|[^"']+)["']/g;

  const extracted: string[] = [];
  let match: RegExpExecArray | null;

  while ((match = mdImageRegex.exec(readmeContent)) !== null) {
    extracted.push(cleanImagePath(match[1], repoFullName, defaultBranch));
  }

  while ((match = htmlImageRegex.exec(readmeContent)) !== null) {
    extracted.push(cleanImagePath(match[1], repoFullName, defaultBranch));
  }

  const imagesInReadme = Array.from(new Set(extracted));
  return {
    imagesInReadme,
    bannerUrl: imagesInReadme.length > 0 ? imagesInReadme[0] : null,
  };
}
